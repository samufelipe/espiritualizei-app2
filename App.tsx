
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Routine from './components/Routine';
import SpiritualChat from './components/SpiritualChat';
import Community from './components/Community';
import Onboarding from './components/Onboarding';
import ParishFinder from './components/ParishFinder';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import BrandLogo from './components/BrandLogo';
import Tutorial from './components/Tutorial';
import Login from './components/Login'; 
import Checkout from './components/Checkout'; 
import KnowledgeBase from './components/KnowledgeBase';
import CreateIntentionModal from './components/CreateIntentionModal';
import AmbientPlayer from './components/AmbientPlayer';
import DailyInspiration from './components/DailyInspiration';
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge } from './types';
import { generateSpiritualRoutine, generateLiturgicalDailyTopic } from './services/geminiService';
import { getLiturgicalInfo } from './services/liturgyService'; // Import Liturgy Engine
import { registerUser, getSession, logoutUser, updateUserProfile } from './services/authService';
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, createJournalEntry, addRoutineItem, deleteRoutineItem, deleteUserAccount, upgradeUserToPremium } from './services/databaseService';
import { Sparkles, Crown, Star, Shield, Heart, ArrowRight, X } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'landing' | 'login' | 'onboarding' | 'generating' | 'checkout' | 'app'>('landing');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyInspiration, setShowDailyInspiration] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMapsOverlay, setShowMapsOverlay] = useState(false);
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [generatedArchetype, setGeneratedArchetype] = useState<{ title: string; subtitle: string } | null>(null);
  const [feedInitialContent, setFeedInitialContent] = useState<string>('');

  const [user, setUser] = useState<UserProfile>({
    id: 'guest',
    name: 'Visitante',
    email: '',
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streakDays: 0,
    spiritualMaturity: 'Iniciante',
    spiritualFocus: 'Paz', 
    stateOfLife: 'single',
    joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);

  const [challenges, setChallenges] = useState<CommunityChallenge[]>([
    // Placeholder Initial State - Will be updated by Liturgy Engine
    {
      id: 'liturgy-challenge',
      title: 'Carregando Jornada...',
      description: 'Sincronizando com o tempo litúrgico.',
      currentAmount: 0,
      targetAmount: 1000000,
      unit: 'Orações',
      daysLeft: 0,
      seasonColor: '#7C3AED',
      icon: 'heart',
      type: 'season',
      startDate: new Date(),
      endDate: new Date(),
      status: 'active',
      participants: 15420,
      isUserParticipating: false,
      userContribution: 0,
      currentDay: 1,
      totalDays: 40,
      recentActivity: [],
      dailyTopics: []
    }
  ]);

  // --- LITURGY & CHALLENGE INIT ---
  useEffect(() => {
     const initLiturgy = async () => {
        const liturgy = getLiturgicalInfo();
        const dayOfSeason = 5; // Exemplo: Dia 5 da estação (deveria ser calculado com diff de datas)
        
        // Tenta gerar o tópico do dia via IA
        const dailyTopic = await generateLiturgicalDailyTopic(dayOfSeason);

        setChallenges(prev => prev.map(c => {
           if (c.id === 'liturgy-challenge') {
              return {
                 ...c,
                 title: `Jornada: ${liturgy.seasonName}`,
                 description: `Vivemos o ${liturgy.seasonName}. Una-se à igreja nesta caminhada espiritual.`,
                 seasonColor: liturgy.color,
                 currentDay: dayOfSeason,
                 totalDays: liturgy.season === 'lent' ? 40 : liturgy.season === 'advent' ? 25 : 30,
                 dailyTopics: [dailyTopic] // Injeta o tópico gerado
              };
           }
           return c;
        }));
     };
     
     if (viewState === 'app') {
        initLiturgy();
     }
  }, [viewState]);

  // --- Auth & Session Check ---
  useEffect(() => {
    const initSession = async () => {
      const session = getSession();
      if (session) {
        setUser(session.user);
        if (!session.user.isPremium && session.user.subscriptionStatus !== 'active') {
           setViewState('checkout');
        } else {
           setViewState('app');
           const lastSeen = localStorage.getItem('espiritualizei_daily_inspiration_date');
           const today = new Date().toDateString();
           if (lastSeen !== today) {
              setShowDailyInspiration(true);
              localStorage.setItem('espiritualizei_daily_inspiration_date', today);
           }
           try {
             const dbRoutine = await fetchUserRoutine(session.user.id);
             if (dbRoutine && dbRoutine.length > 0) setRoutineItems(dbRoutine);
           } catch (e) { console.error(e); }
           loadIntentions(session.user.id);
        }
      }
    };
    initSession();
  }, []);

  const loadIntentions = async (userId: string) => {
    try {
      const data = await fetchCommunityIntentions(userId);
      setIntentions(data);
    } catch (e) { console.error(e); }
  };

  // ... (Rest of the existing App.tsx functions: toggleTheme, handleOnboarding, etc. - unchanged)
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setViewState('generating');
    try {
      const session = await registerUser(data);
      const result = await generateSpiritualRoutine(data);
      const updatedUser = {
        ...session.user,
        spiritualMaturity: result.profileDescription,
        patronSaint: data.patronSaint
      };
      await updateUserProfile(updatedUser);
      setUser(updatedUser);
      setRoutineItems(result.routine);
      await saveUserRoutine(session.user.id, result.routine);
      setGeneratedArchetype({
        title: result.profileDescription,
        subtitle: `Uma rotina moldada para vencer a ${data.primaryStruggle} e encontrar a ${data.spiritualGoal}.`
      });
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Erro ao criar conta. Tente novamente.");
      setViewState('onboarding');
    }
  };

  const handleFinishRevelation = () => {
    setViewState('checkout');
  };

  const handleCheckoutSuccess = async () => {
    await upgradeUserToPremium(user.id);
    setUser(prev => ({ ...prev, isPremium: true, subscriptionStatus: 'active' }));
    setViewState('app');
    setShowTutorial(true);
  };

  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    try {
       const dbRoutine = await fetchUserRoutine(loggedInUser.id);
       setRoutineItems(dbRoutine);
       loadIntentions(loggedInUser.id);
    } catch(e) { console.error(e); }
    
    if (!loggedInUser.isPremium && loggedInUser.subscriptionStatus !== 'active') {
        setViewState('checkout');
    } else {
        setViewState('app');
    }
  };

  const handleToggleRoutine = async (id: string) => {
    let newStatus = false;
    setRoutineItems(prev => prev.map(item => {
      if (item.id === id) {
        newStatus = !item.completed;
        if (newStatus) {
          setUser(u => {
             const nu = { ...u, currentXP: u.currentXP + item.xpReward };
             updateUserProfile(nu);
             return nu;
          });
        } else {
          setUser(u => {
             const nu = { ...u, currentXP: Math.max(0, u.currentXP - item.xpReward) };
             updateUserProfile(nu);
             return nu;
          });
        }
        return { ...item, completed: newStatus };
      }
      return item;
    }));
    await toggleRoutineItemStatus(id, newStatus);
  };

  const handleAddRoutineItem = async (title: string, desc: string) => {
     const newItem: RoutineItem = {
        id: crypto.randomUUID(),
        title,
        description: desc,
        xpReward: 10,
        completed: false,
        icon: 'heart'
     };
     setRoutineItems(prev => [...prev, newItem]);
     await addRoutineItem(user.id, newItem);
  };

  const handleDeleteRoutineItem = async (id: string) => {
     setRoutineItems(prev => prev.filter(i => i.id !== id));
     await deleteRoutineItem(id);
  };

  const handleSaveJournal = async (mood: string, content: string, reflection?: string, verse?: string) => {
      try { await createJournalEntry(user.id, mood, content, reflection, verse); } catch (e) { console.error(e); }
  };

  const handlePray = async (id: string) => {
    setIntentions(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          prayingCount: item.isPrayedByUser ? item.prayingCount - 1 : item.prayingCount + 1,
          isPrayedByUser: !item.isPrayedByUser
        };
      }
      return item;
    }));
    await togglePrayerInteraction(id);
  };

  const handleCreateIntention = async (content: string, category: string) => {
     try {
        const newIntention = await createIntention(user.id, user.name, content, category, []);
        if (newIntention) {
           setIntentions(prev => [newIntention, ...prev]);
        }
     } catch (e) { console.error(e); }
  };

  const handleJoinChallenge = (id: string, amount: number = 0) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const isNewJoin = !c.isUserParticipating;
        let updatedTopics = c.dailyTopics;
        if (c.dailyTopics && c.currentDay) {
           updatedTopics = c.dailyTopics.map(t => {
              if (t.day === c.currentDay) return { ...t, isCompleted: true };
              return t;
           });
        }
        return {
          ...c,
          isUserParticipating: true,
          participants: isNewJoin ? c.participants + 1 : c.participants,
          currentAmount: c.currentAmount + amount,
          userContribution: isNewJoin ? 1 : (c.userContribution + (amount > 0 ? 1 : 0)),
          recentActivity: amount > 0 ? [{ user: 'Você', amount, timestamp: new Date() }, ...(c.recentActivity || [])].slice(0, 3) : c.recentActivity,
          dailyTopics: updatedTopics
        };
      }
      return c;
    }));
  };

  const handleTestifyFromChallenge = (content: string) => {
     setFeedInitialContent(content);
     setCurrentTab(Tab.COMMUNITY);
  };

  const renderContent = () => {
    switch (currentTab) {
      case Tab.DASHBOARD:
        return (
          <Dashboard 
            user={user} 
            myIntentions={intentions.filter(i => i.author === user.name)} 
            onNavigateToCommunity={() => setCurrentTab(Tab.COMMUNITY)}
            onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)}
            onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)}
            onSaveJournal={handleSaveJournal}
          />
        );
      case Tab.ROUTINE: return <Routine items={routineItems} onToggle={handleToggleRoutine} onAdd={handleAddRoutineItem} onDelete={handleDeleteRoutineItem} />;
      case Tab.KNOWLEDGE: return <KnowledgeBase />;
      case Tab.CHAT: return <SpiritualChat user={user} />;
      case Tab.COMMUNITY:
        return (
          <Community 
            intentions={intentions} 
            challenges={challenges} 
            onPray={handlePray} 
            onJoinChallenge={handleJoinChallenge}
            onOpenMaps={() => setShowMapsOverlay(true)}
            onOpenCreateModal={() => setShowIntentionModal(true)}
            onTestify={handleTestifyFromChallenge}
            feedInitialContent={feedInitialContent}
            user={user}
          />
        );
      case Tab.PROFILE: return <Profile user={user} onUpdateUser={(u) => { setUser(u); updateUserProfile(u); }} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />;
      default: return null;
    }
  };

  if (viewState === 'landing') return <LandingPage onStart={() => setViewState('onboarding')} onLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <Login onLogin={handleLoginSuccess} onRegister={() => setViewState('onboarding')} onBack={() => setViewState('landing')} />;
  
  if (viewState === 'generating') {
      // ... (Generating View - same as before)
      if (generatedArchetype) {
        return (
          <div className="min-h-screen bg-brand-dark relative flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans overflow-hidden">
             <div className="relative z-10 max-w-md w-full space-y-8 animate-slide-up">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl shadow-brand-violet/50 relative">
                    <div className="absolute inset-0 bg-brand-violet/40 rounded-full animate-ping opacity-20" />
                    <Crown size={40} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-brand-violet font-bold text-sm uppercase tracking-widest animate-fade-in">Sua jornada começa</p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">{generatedArchetype.title}</h1>
                <p className="text-slate-300 text-lg leading-relaxed max-w-xs mx-auto pt-4 font-medium">{generatedArchetype.subtitle}</p>
              </div>
              <div className="pt-8">
                <button onClick={handleFinishRevelation} className="w-full bg-white text-brand-dark font-bold py-4 rounded-2xl shadow-xl shadow-white/10 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg group">
                  Ver minha Regra de Vida <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen bg-white dark:bg-brand-dark flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans transition-colors relative overflow-hidden">
          <BrandLogo size={64} variant="fill" className="mb-6 animate-pulse-slow relative z-10" />
          <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 relative z-10">Criando sua conta e rotina...</h2>
        </div>
      );
  }

  if (viewState === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;
  if (viewState === 'checkout') return <Checkout onSuccess={handleCheckoutSuccess} userName={user.name} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex justify-center overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500">
      <main className="w-full max-w-md bg-white dark:bg-brand-dark min-h-screen shadow-2xl shadow-slate-200/50 dark:shadow-black/50 relative transition-colors duration-500 overflow-hidden">
        <AmbientPlayer />
        {showTutorial && <Tutorial user={user} onComplete={() => setShowTutorial(false)} />}
        {showDailyInspiration && !showTutorial && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
        
        <div key={currentTab} className="h-full relative z-10">
          {renderContent()}
        </div>
        
        {showMapsOverlay && (
          <div className="absolute inset-0 z-[80] bg-white dark:bg-brand-dark animate-fade-in">
             <button onClick={() => setShowMapsOverlay(false)} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white dark:bg-white/10 rounded-full shadow-lg flex items-center justify-center"><X size={24} /></button>
             <ParishFinder />
          </div>
        )}

        {showIntentionModal && <CreateIntentionModal onClose={() => setShowIntentionModal(false)} onSubmit={handleCreateIntention} />}
        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      </main>
    </div>
  );
};

export default App;
