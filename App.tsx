
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
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, createJournalEntry, addRoutineItem, deleteRoutineItem, upgradeUserToPremium } from './services/databaseService';
import { Sparkles, Crown, ArrowRight, Loader2, Sun, Shield, Heart, User as UserIcon, BookOpen, Flame } from 'lucide-react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Routine = lazy(() => import('./components/Routine'));
const Community = lazy(() => import('./components/Community'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const ParishFinder = lazy(() => import('./components/ParishFinder'));
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const KnowledgeBase = lazy(() => import('./components/KnowledgeBase'));
const SpiritualChat = lazy(() => import('./components/SpiritualChat'));

const STRUGGLE_TRANSLATION: Record<string, string> = {
  anxiety: 'Ansiedade', laziness: 'Preguiça', dryness: 'Aridez', lust: 'Vícios', ignorance: 'Dúvida', pride: 'Soberba', anger: 'Ira'
};

const SAINT_TRANSLATION: Record<string, string> = {
  acutis: 'Beato Carlo Acutis', michael: 'São Miguel Arcanjo', therese: 'Santa Teresinha', joseph: 'São José', mary: 'Virgem Maria'
};

const TabLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center animate-fade-in text-slate-400 py-20 bg-brand-dark">
     <BrandLogo size={40} variant="fill" className="text-brand-violet animate-pulse-slow mb-4" />
     <Loader2 size={24} className="animate-spin text-brand-violet" />
  </div>
);

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'landing' | 'login' | 'onboarding' | 'generating' | 'checkout' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyInspiration, setShowDailyInspiration] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [showMonthlyReview, setShowMonthlyReview] = useState(false); 
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [generatedArchetype, setGeneratedArchetype] = useState<{ title: string; subtitle: string } | null>(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [feedInitialContent, setFeedInitialContent] = useState<string>(''); 
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([
    { id: 'liturgy-challenge', title: 'Carregando Jornada...', description: 'Sincronizando com o tempo litúrgico.', currentAmount: 0, targetAmount: 1000000, unit: 'Orações', daysLeft: 0, seasonColor: '#7C3AED', icon: 'heart', type: 'season', startDate: new Date(), endDate: new Date(), status: 'active', participants: 15420, isUserParticipating: false, userContribution: 0, currentDay: 1, totalDays: 40 }
  ]);

  // --- ROTEAMENTO MANUAL (HISTÓRICO) ---
  useEffect(() => {
    const handlePopState = () => {
       const path = window.location.pathname.replace('/', '');
       if (!path || path === '') setViewState('landing');
       else if (path === 'login') setViewState('login');
       else if (path === 'onboarding') setViewState('onboarding');
       else if (path === 'assinatura') setViewState('checkout');
       else {
          const tab = path.toUpperCase() as Tab;
          if (Object.values(Tab).includes(tab)) {
             setViewState('app');
             setCurrentTab(tab);
          }
       }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (state: typeof viewState, tab?: Tab) => {
    setViewState(state);
    if (tab) setCurrentTab(tab);
    
    // Tratamento robusto para pushState em ambientes de sandbox (bloqueio de origem)
    try {
        let path = '/';
        if (state === 'login') path = '/login';
        else if (state === 'onboarding') path = '/onboarding';
        else if (state === 'app' && tab) path = `/${tab.toLowerCase()}`;
        else if (state === 'checkout') path = '/assinatura';
        else if (state === 'generating') path = '/processando';

        if (window.location.pathname !== path) {
           window.history.pushState({}, '', path);
        }
    } catch (e) {
        console.warn("Navegação de URL limitada pelo ambiente (sandbox).");
    }
  };

  useEffect(() => {
    if (supabase) {
      supabase.auth.onAuthStateChange((event: string) => {
        if (event === 'PASSWORD_RECOVERY') {
          navigate('login');
          setShowUpdatePasswordModal(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const session = getSession();
      if (session) {
        setUser(session.user);
        // Regra de negócios: Se não for premium e a assinatura não estiver ativa, checkout
        if (!session.user.isPremium && session.user.subscriptionStatus !== 'active') {
           navigate('checkout');
        } else {
           const path = window.location.pathname.replace('/', '').toUpperCase() as Tab;
           navigate('app', Object.values(Tab).includes(path) ? path : Tab.DASHBOARD);
           
           const lastSeen = localStorage.getItem('espiritualizei_daily_inspiration_date');
           const today = new Date().toDateString();
           if (lastSeen !== today) {
              setShowDailyInspiration(true);
              localStorage.setItem('espiritualizei_daily_inspiration_date', today);
           }
           fetchUserRoutine(session.user.id).then(db => db && db.length > 0 && setRoutineItems(db));
           loadIntentions(session.user.id);
        }
      } else {
         const currentPath = window.location.pathname;
         if (currentPath === '/login') navigate('login');
         else if (currentPath === '/onboarding') navigate('onboarding');
         else navigate('landing');
      }
    };
    initSession();
  }, []);

  const loadIntentions = async (userId: string) => {
    try { const data = await fetchCommunityIntentions(userId); setIntentions(data); } catch (e) {}
  };
  
  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // ESTADO IMEDIATO PARA EVITAR TELA PRETA
      setViewState('generating');
      setIsGeneratingRoutine(true);
      
      const session = await registerUser(data);
      
      const result = await generateSpiritualRoutine(data);
      const updatedUser: UserProfile = {
        ...session.user,
        spiritualMaturity: result.profileDescription,
        spiritualFocus: data.primaryStruggle,
        spiritualGoal: data.spiritualGoal,
        patronSaint: data.patronSaint,
        lastRoutineUpdate: new Date()
      };
      await updateUserProfile(updatedUser);
      setUser(updatedUser);
      setRoutineItems(result.routine);
      await saveUserRoutine(session.user.id, result.routine);
      
      setIsGeneratingRoutine(false);
      setGeneratedArchetype({
        title: result.profileDescription, 
        subtitle: `Iniciando sua caminhada para vencer a ${STRUGGLE_TRANSLATION[data.primaryStruggle] || data.primaryStruggle} sob a guia de ${SAINT_TRANSLATION[data.patronSaint || ''] || 'um Santo Guia'}.`
      });
    } catch (error) {
      setIsGeneratingRoutine(false);
      setViewState('onboarding');
      throw error;
    }
  };

  const handleFinishRevelation = () => navigate('checkout');

  const handleCheckoutSuccess = async () => {
    await upgradeUserToPremium(user.id);
    setUser(prev => ({ ...prev, isPremium: true, subscriptionStatus: 'active' }));
    navigate('app', Tab.DASHBOARD);
    setShowTutorial(true);
  };

  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    fetchUserRoutine(loggedInUser.id).then(setRoutineItems);
    loadIntentions(loggedInUser.id);
    if (!loggedInUser.isPremium && loggedInUser.subscriptionStatus !== 'active') navigate('checkout');
    else navigate('app', Tab.DASHBOARD);
  };

  const handleLogout = async () => {
     await logoutUser();
     navigate('landing');
     setUser({ id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date() });
     setRoutineItems([]);
  };

  const renderContent = () => {
    const activeChallenge = challenges.find(c => c.status === 'active');
    return (
      <Suspense fallback={<TabLoader />}>
        {(() => {
          switch (currentTab) {
            case Tab.DASHBOARD: return <Dashboard user={user} myIntentions={intentions.filter(i => i.author === user.name)} routineItems={routineItems} onToggleRoutine={id => handleToggleRoutine(id)} onNavigateToCommunity={() => navigate('app', Tab.COMMUNITY)} onNavigateToRoutine={() => navigate('app', Tab.ROUTINE)} onNavigateToKnowledge={() => navigate('app', Tab.KNOWLEDGE)} onNavigateToProfile={() => navigate('app', Tab.PROFILE)} onNavigateToMaps={() => navigate('app', Tab.MAPS)} onSaveJournal={handleSaveJournal} showLiturgyModal={showLiturgyModal} setShowLiturgyModal={setShowLiturgyModal} onLogout={handleLogout} />;
            case Tab.ROUTINE: return <Routine items={routineItems} activeChallenge={activeChallenge} onToggle={handleToggleRoutine} onAdd={handleAddRoutineItem} onDelete={handleDeleteRoutineItem} onNavigate={t => navigate('app', t)} onOpenMaps={() => navigate('app', Tab.MAPS)} onOpenLiturgy={() => { navigate('app', Tab.DASHBOARD); setTimeout(() => setShowLiturgyModal(true), 100); }} onOpenPlayer={() => { }} />;
            case Tab.KNOWLEDGE: return <KnowledgeBase />;
            case Tab.COMMUNITY: return <Community intentions={intentions} challenges={challenges} onPray={handlePray} onJoinChallenge={handleJoinChallenge} onOpenCreateModal={() => setShowIntentionModal(true)} onTestify={c => { setFeedInitialContent(c); navigate('app', Tab.COMMUNITY); }} feedInitialContent={feedInitialContent} user={user} />;
            case Tab.MAPS: return <ParishFinder />;
            case Tab.CHAT: return <SpiritualChat user={user} />;
            case Tab.PROFILE: return <Profile user={user} onUpdateUser={u => { setUser(u); updateUserProfile(u); }} onLogout={handleLogout} />;
            default: return <Dashboard user={user} myIntentions={[]} onNavigateToCommunity={() => {}} onNavigateToRoutine={() => {}} onNavigateToKnowledge={() => {}} onNavigateToProfile={() => {}} onNavigateToMaps={() => {}} onSaveJournal={() => {}} showLiturgyModal={false} setShowLiturgyModal={() => {}} onLogout={() => {}} />;
          }
        })()}
      </Suspense>
    );
  };

  const handleToggleRoutine = async (id: string) => {
    const item = routineItems.find(i => i.id === id);
    if (!item) return;
    const newStatus = !item.completed;
    const newUser = { ...user, currentXP: newStatus ? user.currentXP + item.xpReward : Math.max(0, user.currentXP - item.xpReward) };
    setUser(newUser);
    updateUserProfile(newUser);
    setRoutineItems(prev => prev.map(i => i.id === id ? { ...i, completed: newStatus } : i));
    await toggleRoutineItemStatus(id, newStatus);
  };

  const handleAddRoutineItem = async (title: string, desc: string) => {
     const newItem: RoutineItem = { id: crypto.randomUUID(), title, description: desc, xpReward: 10, completed: false, icon: 'heart', timeOfDay: 'any', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' };
     setRoutineItems(prev => [...prev, newItem]);
     await addRoutineItem(user.id, newItem);
  };

  const handleDeleteRoutineItem = async (id: string) => {
     setRoutineItems(prev => prev.filter(i => i.id !== id));
     await deleteRoutineItem(id);
  };

  const handleSaveJournal = async (mood: string, content: string, reflection?: string, verse?: string) => {
      try { await createJournalEntry(user.id, mood, content, reflection, verse); } catch (e) {}
  };

  const handleCreateIntention = async (content: string, category: string) => {
    try {
      const newItem = await createIntention(user.id, user.name, user.photoUrl, content, category, []);
      if (newItem) {
        setIntentions(prev => [newItem, ...prev]);
      }
    } catch (e) {
      console.error("Erro ao criar intenção", e);
    }
  };

  const handlePray = async (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, prayingCount: i.isPrayedByUser ? i.prayingCount - 1 : i.prayingCount + 1, isPrayedByUser: !i.isPrayedByUser } : i));
    await togglePrayerInteraction(id);
  };

  const handleJoinChallenge = (id: string, amount: number = 0) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isUserParticipating: true, currentAmount: c.currentAmount + amount } : c));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans text-slate-100 selection:bg-brand-violet/30">
      <InstallPWA />
      {viewState === 'app' && <div className="flex-shrink-0 hidden md:block h-full"><Sidebar currentTab={currentTab} onTabChange={t => navigate('app', t)} user={user} onLogout={handleLogout} /></div>}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth bg-brand-dark">
          {viewState === 'landing' && <LandingPage onStart={() => navigate('onboarding')} onLogin={() => navigate('login')} />}
          {viewState === 'login' && <><Login onLogin={handleLoginSuccess} onRegister={() => navigate('onboarding')} onBack={() => navigate('landing')} />{showUpdatePasswordModal && <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />}</>}
          {viewState === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} onBack={() => navigate('landing')} />}
          
          {viewState === 'generating' && (
             <div className="min-h-screen bg-[#1A2530] flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-violet/10 via-transparent to-transparent opacity-50" />
                
                {isGeneratingRoutine ? (
                   <div className="relative z-10 space-y-8 animate-pulse-slow">
                      <div className="relative">
                        <div className="absolute inset-0 bg-brand-violet/20 blur-3xl rounded-full" />
                        <BrandLogo variant="fill" size={80} className="text-brand-violet relative z-10" />
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-2xl font-bold text-white">Consultando o Diretor Espiritual...</h2>
                         <div className="space-y-1.5">
                            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed animate-fade-in">Buscando na tradição da Igreja e na vida dos Santos a melhor regra de vida para você agora.</p>
                            <p className="text-brand-violet/60 text-[10px] font-bold uppercase tracking-widest animate-pulse">Invocando o auxílio celeste</p>
                         </div>
                         <div className="flex justify-center gap-2 pt-4">
                            <span className="w-2 h-2 bg-brand-violet rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-brand-violet rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-brand-violet rounded-full animate-bounce"></span>
                         </div>
                      </div>
                   </div>
                ) : generatedArchetype && (
                   <div className="relative z-10 max-w-lg w-full space-y-6 animate-slide-up">
                        <div className="flex justify-center mb-2"><div className="p-4 bg-brand-violet/10 rounded-full border border-brand-violet/20 shadow-glow"><Sparkles size={48} className="text-brand-violet" /></div></div>
                        <div className="space-y-4">
                          <p className="text-brand-violet font-bold text-xs uppercase tracking-widest">Sua Vocação revelada</p>
                          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">{generatedArchetype.title}</h1>
                          <div className="flex flex-wrap justify-center gap-2 my-4">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase"><Shield size={12} /> {STRUGGLE_TRANSLATION[user.spiritualFocus || ''] || user.spiritualFocus}</span>
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase"><UserIcon size={12} /> {SAINT_TRANSLATION[user.patronSaint || ''] || user.patronSaint}</span>
                          </div>
                          <p className="text-slate-400 text-lg leading-relaxed max-w-sm mx-auto font-medium">{generatedArchetype.subtitle}</p>
                        </div>
                        <div className="pt-8">
                           <button onClick={handleFinishRevelation} className="w-full bg-white text-brand-dark font-bold py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-sm uppercase group active:scale-95 transition-all">
                              Receber minha Regra de Vida <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                   </div>
                )}
             </div>
          )}

          {viewState === 'checkout' && <Checkout onSuccess={handleCheckoutSuccess} userName={user.name} onLogout={handleLogout} />}
          
          {viewState === 'app' && (
            <><div className="w-full max-w-[1600px] mx-auto min-h-full"><div className="h-full relative z-10 md:p-8 lg:p-10">{renderContent()}</div></div>
              {showTutorial && <Tutorial user={user} onComplete={() => setShowTutorial(false)} />}
              {showDailyInspiration && !showTutorial && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
              {showUpdatePasswordModal && <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />}
              {showMonthlyReview && <MonthlyReviewModal onClose={() => setShowMonthlyReview(false)} onComplete={() => {}} currentStruggle={user.spiritualFocus} />}
              {showIntentionModal && <CreateIntentionModal onClose={() => setShowIntentionModal(false)} onSubmit={handleCreateIntention} />}
              <Navigation currentTab={currentTab} onTabChange={t => navigate('app', t)} />
            </>
          )}
      </main>
    </div>
  );
};

export default App;
