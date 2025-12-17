
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import BrandLogo from './components/BrandLogo';
import Tutorial from './components/Tutorial';
import Login from './components/Login'; 
import Checkout from './components/Checkout'; 
import CreateIntentionModal from './components/CreateIntentionModal';
import DailyInspiration from './components/DailyInspiration';
import UpdatePasswordModal from './components/UpdatePasswordModal'; 
import MonthlyReviewModal from './components/MonthlyReviewModal'; 
import InstallPWA from './components/InstallPWA';
import { TermsPage, PrivacyPage, AboutPage, ContactPage } from './components/LegalPages'; 
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge, MonthlyReviewData } from './types';
import { generateSpiritualRoutine, generateLiturgicalDailyTopic } from './services/geminiService';
import { getSeasonDetailedInfo, calculateDayOfSeason } from './services/liturgyService'; 
import { registerUser, getSession, logoutUser, updateUserProfile, supabase } from './services/authService'; 
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, createJournalEntry, addRoutineItem, deleteRoutineItem, deleteUserAccount, upgradeUserToPremium } from './services/databaseService';
import { Sparkles, Crown, ArrowRight, Loader2, Sun, Shield, Heart, User as UserIcon } from 'lucide-react';

// --- LAZY LOADING COMPONENTS ---
// Isso divide o código em pedaços menores, carregados apenas quando necessários.
const Dashboard = lazy(() => import('./components/Dashboard'));
const Routine = lazy(() => import('./components/Routine'));
const Community = lazy(() => import('./components/Community'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const ParishFinder = lazy(() => import('./components/ParishFinder')); // Pesado (Mapas)
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const KnowledgeBase = lazy(() => import('./components/KnowledgeBase'));
const SpiritualChat = lazy(() => import('./components/SpiritualChat'));

// --- TRANSLATION MAPS ---
const STRUGGLE_TRANSLATION: Record<string, string> = {
  anxiety: 'Ansiedade',
  laziness: 'Preguiça',
  dryness: 'Aridez',
  lust: 'Impureza',
  ignorance: 'Dúvida',
  pride: 'Soberba',
  anger: 'Ira'
};

const GOAL_TRANSLATION: Record<string, string> = {
  peace: 'Paz Interior',
  truth: 'Sabedoria',
  discipline: 'Constância',
  love: 'Amor',
  healing: 'Cura'
};

const SAINT_TRANSLATION: Record<string, string> = {
  acutis: 'Beato Carlo Acutis',
  michael: 'São Miguel',
  therese: 'Santa Teresinha',
  joseph: 'São José',
  mary: 'Virgem Maria'
};

// --- LOADING FALLBACK COMPONENT ---
const TabLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center animate-fade-in text-slate-400">
     <BrandLogo size={40} variant="fill" className="text-brand-violet animate-pulse-slow mb-4" />
     <Loader2 size={24} className="animate-spin text-brand-violet" />
  </div>
);

const App: React.FC = () => {
  const path = window.location.pathname;
  if (path === '/termos') return <TermsPage />;
  if (path === '/privacidade') return <PrivacyPage />;
  if (path === '/sobre') return <AboutPage />;
  if (path === '/contato') return <ContactPage />;

  const [viewState, setViewState] = useState<'landing' | 'login' | 'onboarding' | 'generating' | 'checkout' | 'app'>('landing');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyInspiration, setShowDailyInspiration] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [showMonthlyReview, setShowMonthlyReview] = useState(false); 
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [generatedArchetype, setGeneratedArchetype] = useState<{ title: string; subtitle: string } | null>(null);
  const [feedInitialContent, setFeedInitialContent] = useState<string>(''); 
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);

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
    joinedDate: new Date(),
    lastRoutineUpdate: new Date() 
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);

  // Estado inicial do Desafio
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([
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

  // Listener para Recuperação de Senha
  useEffect(() => {
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
        if (event === 'PASSWORD_RECOVERY') {
          setViewState('login'); // Garante que não esteja em loading
          setShowUpdatePasswordModal(true);
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const liturgyInitializedRef = useRef(false);

  useEffect(() => {
     if (viewState !== 'app' || liturgyInitializedRef.current) return;
     liturgyInitializedRef.current = true;

     const initLiturgy = async () => {
        const seasonInfo = getSeasonDetailedInfo();
        const currentDay = calculateDayOfSeason(seasonInfo.startDate);
        const storageKey = `liturgy_completed_${seasonInfo.id}_${new Date().getFullYear()}_day_${currentDay}`;
        const isCompletedToday = localStorage.getItem(storageKey) === 'true';
        
        // Passando seasonName para gerar desafio contextualizado
        const dailyTopic = await generateLiturgicalDailyTopic(currentDay, seasonInfo.name);
        
        if (isCompletedToday) {
            dailyTopic.isCompleted = true;
        }

        setChallenges(prev => prev.map(c => {
           if (c.id === 'liturgy-challenge') {
              return {
                 ...c,
                 title: `Jornada: ${seasonInfo.name}`,
                 description: `Dia ${currentDay} do ${seasonInfo.name}. Una-se à igreja nesta caminhada.`,
                 seasonColor: seasonInfo.color,
                 currentDay: currentDay,
                 totalDays: seasonInfo.totalDays,
                 dailyTopics: [dailyTopic],
                 isUserParticipating: isCompletedToday || c.isUserParticipating 
              };
           }
           return c;
        }));
     };
     initLiturgy();
  }, [viewState]);

  useEffect(() => {
    const initSession = async () => {
      const session = getSession();
      if (session) {
        setUser(session.user);
        
        // CHECK 30-DAY ROUTINE CYCLE
        if (session.user.lastRoutineUpdate) {
            const lastUpdate = new Date(session.user.lastRoutineUpdate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays > 30) {
               setShowMonthlyReview(true);
            }
        }

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
  
  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const session = await registerUser(data);
      
      // If registration succeeds, THEN we switch to generating view
      setViewState('generating');
      
      const result = await generateSpiritualRoutine(data);
      const updatedUser = {
        ...session.user,
        spiritualMaturity: result.profileDescription,
        patronSaint: data.patronSaint,
        lastRoutineUpdate: new Date()
      };
      await updateUserProfile(updatedUser);
      setUser(updatedUser);
      setRoutineItems(result.routine);
      await saveUserRoutine(session.user.id, result.routine);
      
      // Construir textos humanizados
      const struggleText = STRUGGLE_TRANSLATION[data.primaryStruggle] || data.primaryStruggle;
      const goalText = GOAL_TRANSLATION[data.spiritualGoal] || data.spiritualGoal;

      setGeneratedArchetype({
        title: result.profileDescription, 
        subtitle: `Preparamos um caminho sereno para você superar a ${struggleText} e cultivar ${goalText}.`
      });
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const handleMonthlyReviewComplete = async (reviewData: MonthlyReviewData) => {
      const fullData: OnboardingData = {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          stateOfLife: user.stateOfLife as any || 'single',
          routineType: 'flexible', 
          primaryStruggle: reviewData.newStruggle as any,
          spiritualGoal: reviewData.newGoal as any,
          bestMoment: 'morning', 
          patronSaint: user.patronSaint as any || 'michael'
      };

      try {
          const result = await generateSpiritualRoutine(fullData, reviewData);
          const updatedUser: UserProfile = {
              ...user,
              spiritualFocus: reviewData.newStruggle as string, 
              spiritualMaturity: result.profileDescription,
              lastRoutineUpdate: new Date() 
          };

          await updateUserProfile(updatedUser);
          await saveUserRoutine(user.id, result.routine);
          setUser(updatedUser);
          setRoutineItems(result.routine);
          setShowMonthlyReview(false);
      } catch (e) {
          console.error("Monthly update failed", e);
          setShowMonthlyReview(false);
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

  const handleLogout = async () => {
     await logoutUser();
     setViewState('landing');
     setUser({ id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date() });
     setRoutineItems([]);
  };

  const handleToggleRoutine = async (id: string) => {
    const itemToToggle = routineItems.find(i => i.id === id);
    if (!itemToToggle) return;

    const newStatus = !itemToToggle.completed;
    const xpReward = itemToToggle.xpReward;

    let newUserState = user;
    if (newStatus) {
       newUserState = { ...user, currentXP: user.currentXP + xpReward };
    } else {
       newUserState = { ...user, currentXP: Math.max(0, user.currentXP - xpReward) };
    }
    setUser(newUserState);
    updateUserProfile(newUserState);

    setRoutineItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: newStatus } : item
    ));

    await toggleRoutineItemStatus(id, newStatus);
  };

  const handleAddRoutineItem = async (title: string, desc: string) => {
     const newItem: RoutineItem = {
        id: crypto.randomUUID(),
        title,
        description: desc,
        xpReward: 10,
        completed: false,
        icon: 'heart',
        timeOfDay: 'any',
        dayOfWeek: [0,1,2,3,4,5,6], 
        actionLink: 'NONE'
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
        const newIntention = await createIntention(user.id, user.name, user.photoUrl, content, category, []);
        if (newIntention) {
           setIntentions(prev => [newIntention, ...prev]);
        }
     } catch (e) { console.error(e); }
  };

  const handleJoinChallenge = (id: string, amount: number = 0) => {
    let shouldRewardUser = false;
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
       const currentDay = challenge.currentDay || 1;
       const topic = challenge.dailyTopics?.find(t => t.day === currentDay);
       if (topic && !topic.isCompleted) {
           shouldRewardUser = true;
       }
    }

    if (shouldRewardUser) {
        const newUserState = { ...user, currentXP: user.currentXP + 50 };
        setUser(newUserState);
        updateUserProfile(newUserState);
    }

    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const seasonInfo = getSeasonDetailedInfo();
        const currentDay = c.currentDay || 1;
        const storageKey = `liturgy_completed_${seasonInfo.id}_${new Date().getFullYear()}_day_${currentDay}`;
        localStorage.setItem(storageKey, 'true');

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

  const handleOpenMaps = () => setCurrentTab(Tab.MAPS);

  const renderContent = () => {
    const activeChallenge = challenges.find(c => c.status === 'active');

    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (currentTab) {
            case Tab.DASHBOARD:
              return (
                <Dashboard 
                  user={user} 
                  myIntentions={intentions.filter(i => i.author === user.name)} 
                  routineItems={routineItems} 
                  onToggleRoutine={handleToggleRoutine} 
                  onNavigateToCommunity={() => setCurrentTab(Tab.COMMUNITY)}
                  onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)}
                  onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)}
                  onNavigateToProfile={() => setCurrentTab(Tab.PROFILE)}
                  onNavigateToMaps={() => setCurrentTab(Tab.MAPS)}
                  onSaveJournal={handleSaveJournal}
                  showLiturgyModal={showLiturgyModal}
                  setShowLiturgyModal={setShowLiturgyModal}
                  onLogout={handleLogout}
                />
              );
            case Tab.ROUTINE: 
              return (
                <Routine 
                  items={routineItems} 
                  activeChallenge={activeChallenge}
                  onToggle={handleToggleRoutine} 
                  onAdd={handleAddRoutineItem} 
                  onDelete={handleDeleteRoutineItem} 
                  onNavigate={(t) => setCurrentTab(t)}
                  onOpenMaps={handleOpenMaps}
                  onOpenLiturgy={() => { setCurrentTab(Tab.DASHBOARD); setTimeout(() => setShowLiturgyModal(true), 100); }}
                  onOpenPlayer={() => { }}
                />
              );
            case Tab.KNOWLEDGE: return <KnowledgeBase />;
            case Tab.COMMUNITY:
              return (
                <Community 
                  intentions={intentions} 
                  challenges={challenges} 
                  onPray={handlePray} 
                  onJoinChallenge={handleJoinChallenge}
                  onOpenCreateModal={() => setShowIntentionModal(true)}
                  onTestify={handleTestifyFromChallenge}
                  feedInitialContent={feedInitialContent}
                  user={user}
                />
              );
            case Tab.MAPS: return <ParishFinder />;
            case Tab.CHAT: return <SpiritualChat user={user} />;
            case Tab.PROFILE: return <Profile user={user} onUpdateUser={(u) => { setUser(u); updateUserProfile(u); }} onLogout={handleLogout} />;
            default: return null;
          }
        })()}
      </Suspense>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans text-slate-100">
      
      {/* PWA INSTALL PROMPT */}
      <InstallPWA />

      {viewState === 'app' && (
        <div className="flex-shrink-0 hidden md:block h-full">
          <Sidebar 
            currentTab={currentTab} 
            onTabChange={setCurrentTab} 
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth bg-brand-dark md:bg-[#0F1115]">
        <Suspense fallback={
           <div className="min-h-screen flex items-center justify-center bg-brand-dark">
              <Loader2 className="animate-spin text-white" size={32} />
           </div>
        }>
          {viewState === 'landing' && <LandingPage onStart={() => setViewState('onboarding')} onLogin={() => setViewState('login')} />}
          
          {viewState === 'login' && (
            <>
              <Login onLogin={handleLoginSuccess} onRegister={() => setViewState('onboarding')} onBack={() => setViewState('landing')} />
              {showUpdatePasswordModal && <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />}
            </>
          )}

          {viewState === 'onboarding' && <Onboarding onComplete={(data) => handleOnboardingComplete(data)} onBack={() => setViewState('landing')} />}
          
          {viewState === 'generating' && (
             <div className="min-h-screen bg-brand-dark relative flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans overflow-hidden">
                {generatedArchetype ? (
                  <div className="relative z-10 max-w-lg w-full space-y-6 animate-slide-up">
                    
                    {/* Header Logo - Cleaned up */}
                    <div className="flex justify-center mb-2">
                      <BrandLogo variant="fill" size={80} className="text-brand-violet drop-shadow-[0_0_15px_rgba(167,139,250,0.5)] animate-pulse-slow" />
                    </div>

                    <div className="space-y-4">
                      <p className="text-brand-violet font-bold text-xs uppercase tracking-widest animate-fade-in">
                         A paz, {user.name.split(' ')[0]}
                      </p>
                      
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                         {generatedArchetype.title}
                      </h1>

                      {/* --- Personalization Summary Chips --- */}
                      <div className="flex flex-wrap justify-center gap-2 my-4 opacity-90">
                         {user.spiritualFocus && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wide">
                               <Shield size={10} /> Vencer {STRUGGLE_TRANSLATION[user.spiritualFocus] || user.spiritualFocus}
                            </span>
                         )}
                         {user.spiritualMaturity && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wide">
                               <Heart size={10} /> {GOAL_TRANSLATION[user.spiritualGoal || 'peace'] || 'Paz'}
                            </span>
                         )}
                         {user.patronSaint && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wide">
                               <UserIcon size={10} /> {SAINT_TRANSLATION[user.patronSaint] || user.patronSaint}
                            </span>
                         )}
                      </div>

                      <p className="text-slate-400 text-lg leading-relaxed max-w-sm mx-auto font-medium">
                         {generatedArchetype.subtitle}
                      </p>
                    </div>

                    <div className="pt-8">
                      <button onClick={handleFinishRevelation} className="w-full bg-white text-brand-dark font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wide group">
                        Ver meu Plano Espiritual <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <BrandLogo size={64} variant="fill" className="mb-6 animate-pulse-slow relative z-10" />
                    <h2 className="text-xl font-bold text-white mb-2 relative z-10">Criando sua conta e rotina...</h2>
                  </>
                )}
             </div>
          )}

          {viewState === 'checkout' && <Checkout onSuccess={handleCheckoutSuccess} userName={user.name} onLogout={handleLogout} />}

          {viewState === 'app' && (
            <>
              {showTutorial && <Tutorial user={user} onComplete={() => setShowTutorial(false)} />}
              {showDailyInspiration && !showTutorial && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
              {showUpdatePasswordModal && <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />}
              {showMonthlyReview && (
                  <MonthlyReviewModal 
                      onClose={() => setShowMonthlyReview(false)} 
                      onComplete={(data) => handleMonthlyReviewComplete(data as MonthlyReviewData)} 
                      currentStruggle={user.spiritualFocus} 
                  />
              )}

              <div className="w-full max-w-[1600px] mx-auto min-h-full">
                <div className="h-full relative z-10 md:p-8 lg:p-10">
                    {renderContent()}
                </div>
              </div>
              
              {showIntentionModal && <CreateIntentionModal onClose={() => setShowIntentionModal(false)} onSubmit={handleCreateIntention} />}
              <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
            </>
          )}
        </Suspense>
      </main>
    </div>
  );
};

export default App;
