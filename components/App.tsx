
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
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge } from './types';
import { generateSpiritualRoutine } from './services/geminiService';
import { registerUser, getSession, logoutUser, updateUserProfile } from './services/authService'; 
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, createJournalEntry, addRoutineItem, deleteRoutineItem, upgradeUserToPremium, fetchGlobalChallenge } from './services/databaseService';
import { Sparkles, ArrowRight, Loader2, Shield, Heart, User as UserIcon, CheckCircle2, Flame, Footprints } from 'lucide-react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Routine = lazy(() => import('./components/Routine'));
const Community = lazy(() => import('./components/Community'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const ParishFinder = lazy(() => import('./components/ParishFinder'));
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const KnowledgeBase = lazy(() => import('./components/KnowledgeBase'));
const SpiritualChat = lazy(() => import('./components/SpiritualChat'));

const SAINT_TRANSLATION: Record<string, string> = {
  acutis: 'Beato Carlo Acutis', michael: 'São Miguel Arcanjo', therese: 'Santa Teresinha', joseph: 'São José', mary: 'Virgem Maria'
};

const STRUGGLE_TRANSLATION: Record<string, string> = {
  anxiety: 'Ansiedade', laziness: 'Procrastinação', dryness: 'Aridez', lust: 'Vícios', ignorance: 'Dúvida', pride: 'Soberba', anger: 'Ira'
};

const TabLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center animate-fade-in text-slate-400 py-20 bg-brand-dark">
     <BrandLogo size={40} variant="fill" className="text-brand-violet animate-pulse-slow mb-4" />
     <Loader2 size={24} className="animate-spin text-brand-violet" />
  </div>
);

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'landing' | 'login' | 'onboarding' | 'generating' | 'checkout' | 'welcome_premium' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyInspiration, setShowDailyInspiration] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [showMonthlyReview, setShowMonthlyReview] = useState(false); 
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<{ title: string; reasoning: string } | null>(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [feedInitialContent, setFeedInitialContent] = useState<string>(''); 
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);
  const initializationRef = useRef(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
       const session = getSession();
       if (session?.user) {
          window.history.replaceState({}, document.title, "/");
          setUser(prev => ({ ...prev, isPremium: true, subscriptionStatus: 'active' }));
          setViewState('welcome_premium');
          upgradeUserToPremium(session.user.id).catch(console.error);
       }
    }
  }, []);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initSession = async () => {
      const session = getSession();
      if (session) {
        setUser(session.user);
        setViewState('app');
        
        const lastSeen = localStorage.getItem('espiritualizei_daily_inspiration_date');
        if (lastSeen !== new Date().toDateString()) {
            setShowDailyInspiration(true);
            localStorage.setItem('espiritualizei_daily_inspiration_date', new Date().toDateString());
        }
        
        fetchUserRoutine(session.user.id).then(db => db && db.length > 0 && setRoutineItems(db));
        fetchCommunityIntentions(session.user.id).then(setIntentions);
        fetchGlobalChallenge().then(global => global && setChallenges([global]));
        
      } else {
         const path = window.location.pathname;
         if (path === '/login') setViewState('login');
         else if (path === '/onboarding') setViewState('onboarding');
         else setViewState('landing');
      }
    };
    initSession();
  }, []); 

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
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
        confessionFrequency: data.confessionFrequency,
        lastRoutineUpdate: new Date()
      };
      await updateUserProfile(updatedUser);
      setUser(updatedUser);
      setRoutineItems(result.routine);
      await saveUserRoutine(session.user.id, result.routine);
      setIsGeneratingRoutine(false);
      setGeneratedProfile({ title: result.profileDescription, reasoning: result.profileReasoning });
    } catch (error: any) {
      setIsGeneratingRoutine(false);
      setViewState('onboarding');
      alert(error.message || "Tivemos um problema ao preparar seu plano. Tente novamente.");
    }
  };

  const handleLogout = async () => {
     await logoutUser();
     setViewState('landing');
     setUser({ id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date() });
     setRoutineItems([]);
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

  const handleCreateIntention = async (content: string, category: string) => {
    const newItem = await createIntention(user.id, user.name, user.photoUrl, content, category, []);
    setIntentions(prev => [newItem, ...prev]);
  };

  const handlePray = async (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, prayingCount: i.isPrayedByUser ? i.prayingCount - 1 : i.prayingCount + 1, isPrayedByUser: !i.isPrayedByUser } : i));
    await togglePrayerInteraction(id);
  };

  const handleJoinChallenge = (id: string, amount: number = 0) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isUserParticipating: true, currentAmount: c.currentAmount + amount } : c));
  };

  const renderContent = () => {
    const activeChallenge = challenges.find(c => c.status === 'active');
    switch (currentTab) {
      case Tab.DASHBOARD: return <Dashboard user={user} myIntentions={intentions.filter(i => i.author === user.name)} routineItems={routineItems} onToggleRoutine={handleToggleRoutine} onNavigateToCommunity={() => setCurrentTab(Tab.COMMUNITY)} onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)} onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)} onNavigateToProfile={() => setCurrentTab(Tab.PROFILE)} onNavigateToMaps={() => setCurrentTab(Tab.MAPS)} onSaveJournal={createJournalEntry} showLiturgyModal={showLiturgyModal} setShowLiturgyModal={setShowLiturgyModal} onLogout={handleLogout} />;
      case Tab.ROUTINE: return <Routine items={routineItems} activeChallenge={activeChallenge} onToggle={handleToggleRoutine} onAdd={(t, d) => addRoutineItem(user.id, { id: crypto.randomUUID(), title: t, description: d, xpReward: 10, completed: false, icon: 'heart', timeOfDay: 'any', dayOfWeek: [0,1,2,3,4,5,6] })} onDelete={deleteRoutineItem} onNavigate={setCurrentTab} onOpenMaps={() => setCurrentTab(Tab.MAPS)} onOpenLiturgy={() => { setCurrentTab(Tab.DASHBOARD); setTimeout(() => setShowLiturgyModal(true), 100); }} onOpenPlayer={() => { }} />;
      case Tab.KNOWLEDGE: return <KnowledgeBase />;
      case Tab.COMMUNITY: return <Community intentions={intentions} challenges={challenges} onPray={handlePray} onJoinChallenge={handleJoinChallenge} onOpenCreateModal={() => setShowIntentionModal(true)} onTestify={c => { setFeedInitialContent(c); setCurrentTab(Tab.COMMUNITY); }} feedInitialContent={feedInitialContent} user={user} />;
      case Tab.MAPS: return <ParishFinder />;
      case Tab.CHAT: return <SpiritualChat user={user} />;
      case Tab.PROFILE: return <Profile user={user} onUpdateUser={u => { setUser(u); updateUserProfile(u); }} onLogout={handleLogout} />;
      default: return <TabLoader />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans text-slate-100 selection:bg-brand-violet/30">
      <InstallPWA />
      {viewState === 'app' && <div className="flex-shrink-0 hidden md:block h-full"><Sidebar currentTab={currentTab} onTabChange={setCurrentTab} user={user} onLogout={handleLogout} /></div>}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-brand-dark">
          {viewState === 'landing' && <LandingPage onStart={() => setViewState('onboarding')} onLogin={() => setViewState('login')} />}
          {viewState === 'login' && <Login onLogin={(u) => { setUser(u); setViewState('app'); }} onRegister={() => setViewState('onboarding')} onBack={() => setViewState('landing')} />}
          {viewState === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} onBack={() => setViewState('landing')} />}
          {viewState === 'generating' && (
             <div className="min-h-screen bg-[#1A2530] flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans">
                {isGeneratingRoutine ? (
                   <div className="space-y-8 animate-pulse-slow">
                      <div className="w-20 h-20 bg-brand-violet/10 rounded-full flex items-center justify-center mx-auto">
                        <BrandLogo variant="fill" size={60} className="text-brand-violet" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Preparando seu caminho com carinho...</h2>
                        <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">Analisando sua realidade para sugerir pequenos passos de fé que façam sentido para você.</p>
                      </div>
                   </div>
                ) : generatedProfile && (
                   <div className="max-w-md w-full space-y-8 animate-slide-up bg-[#242C35] p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <div className="w-16 h-16 bg-brand-violet text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-violet/20">
                           <Footprints size={32} />
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-bold text-brand-violet uppercase tracking-[0.2em]">Seu Perfil de Caminhada</p>
                           <h1 className="text-3xl font-black text-white leading-tight">{generatedProfile.title}</h1>
                           <div className="h-px w-12 bg-brand-violet/30 mx-auto my-4" />
                           <p className="text-slate-300 text-sm leading-relaxed italic">"{generatedProfile.reasoning}"</p>
                        </div>
                        <div className="space-y-4 pt-4">
                           <button onClick={() => { setViewState('app'); setShowTutorial(true); }} className="w-full bg-white text-brand-dark font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
                              Receber Minha Pequena Regra <ArrowRight size={18} />
                           </button>
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Baseado no seu combate contra a {STRUGGLE_TRANSLATION[user.spiritualFocus || ''] || 'procrastinação'}</p>
                        </div>
                   </div>
                )}
             </div>
          )}
          {viewState === 'checkout' && <Checkout onSuccess={() => setViewState('welcome_premium')} userName={user.name} onLogout={handleLogout} />}
          {viewState === 'welcome_premium' && (
             <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
                <div className="relative z-10 max-w-md w-full space-y-8 animate-slide-up">
                    <CheckCircle2 size={48} className="text-green-400 mx-auto" />
                    <h1 className="text-4xl font-extrabold text-white">Deus seja louvado!</h1>
                    <p className="text-slate-300 text-lg">Seu acesso foi liberado com sucesso, {user.name.split(' ')[0]}.</p>
                    <button onClick={() => { setViewState('app'); setShowTutorial(true); }} className="w-full bg-brand-violet text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 text-lg">Entrar no Santuário <ArrowRight size={22} /></button>
                </div>
             </div>
          )}
          {viewState === 'app' && (
            <><div className="w-full max-w-[1600px] mx-auto min-h-full"><div className="h-full relative z-10 md:p-8 lg:p-10">{renderContent()}</div></div>
              {showTutorial && <Tutorial user={user} onComplete={() => setShowTutorial(false)} />}
              {showDailyInspiration && !showTutorial && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
              {showUpdatePasswordModal && <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />}
              {showMonthlyReview && <MonthlyReviewModal onClose={() => setShowMonthlyReview(false)} onComplete={() => {}} currentStruggle={user.spiritualFocus} />}
              {showIntentionModal && <CreateIntentionModal onClose={() => setShowIntentionModal(false)} onSubmit={handleCreateIntention} />}
              <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
            </>
          )}
      </main>
    </div>
  );
};

export default App;
