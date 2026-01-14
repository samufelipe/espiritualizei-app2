
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
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge, MonthlyReviewData } from './types';
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
  const [communityInitialTab, setCommunityInitialTab] = useState<'mural' | 'feed' | 'ranking'>('mural');
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);
  const initializationRef = useRef(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);

  // Verificador de Ciclo de 30 dias
  useEffect(() => {
    if (viewState === 'app' && user.id !== 'guest') {
      const lastUpdate = new Date(user.lastRoutineUpdate || user.joinedDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 30) {
        setShowMonthlyReview(true);
      }
    }
  }, [viewState, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
       const session = getSession();
       if (session?.user) {
          window.history.replaceState({}, document.title, "/");
          setUser((prev: UserProfile) => ({ ...prev, isPremium: true, subscriptionStatus: 'active' }));
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
        
        fetchUserRoutine(session.user.id).then((db: RoutineItem[]) => db && db.length > 0 && setRoutineItems(db));
        fetchCommunityIntentions(session.user.id).then((intentionsData: PrayerIntention[]) => setIntentions(intentionsData));
        fetchGlobalChallenge().then((global: CommunityChallenge | null) => {
            if (global) setChallenges([global]);
        });
        
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

  const handleMonthlyReviewComplete = async (reviewData: MonthlyReviewData) => {
      setIsGeneratingRoutine(true);
      try {
          // Constrói os dados para a Gemini gerar uma nova rotina otimizada
          const onboardingData: OnboardingData = {
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              stateOfLife: (user.stateOfLife || 'single') as any,
              routineType: reviewData.intensity === 'too_heavy' ? 'overwhelmed' : 'flexible',
              primaryStruggle: reviewData.newStruggle as any,
              bestMoment: 'morning',
              spiritualGoal: reviewData.newGoal as any,
              confessionFrequency: user.confessionFrequency as any,
              patronSaint: user.patronSaint as any
          };

          const result = await generateSpiritualRoutine(onboardingData, reviewData);
          
          const updatedUser: UserProfile = {
              ...user,
              spiritualMaturity: result.profileDescription,
              spiritualFocus: reviewData.newStruggle,
              spiritualGoal: reviewData.newGoal,
              lastRoutineUpdate: new Date()
          };

          await updateUserProfile(updatedUser);
          await saveUserRoutine(user.id, result.routine);
          
          setUser(updatedUser);
          setRoutineItems(result.routine);
          setShowMonthlyReview(false);
      } catch (e) {
          console.error("Erro na revisão mensal:", e);
      } finally {
          setIsGeneratingRoutine(false);
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
    await updateUserProfile(newUser);
    setRoutineItems((prev: RoutineItem[]) => prev.map(i => i.id === id ? { ...i, completed: newStatus } : i));
    await toggleRoutineItemStatus(id, newStatus);
  };

  const handleCreateIntention = async (content: string, category: string) => {
    const newItem = await createIntention(user.id, user.name, user.photoUrl, content, category, []);
    setIntentions((prev: PrayerIntention[]) => [newItem, ...prev]);
  };

  const handlePray = async (id: string) => {
    setIntentions((prev: PrayerIntention[]) => prev.map(i => i.id === id ? { ...i, prayingCount: i.isPrayedByUser ? i.prayingCount - 1 : i.prayingCount + 1, isPrayedByUser: !i.isPrayedByUser } : i));
    await togglePrayerInteraction(id);
  };

  const handleJoinChallenge = (id: string, amount: number = 0) => {
    setChallenges((prev: CommunityChallenge[]) => prev.map(c => c.id === id ? { ...c, isUserParticipating: true, currentAmount: c.currentAmount + amount } : c));
  };

  const handleTestifyFromChallenge = (content: string) => {
    setFeedInitialContent(content);
    setCommunityInitialTab('feed'); 
    setCurrentTab(Tab.COMMUNITY);
  };

  const renderContent = () => {
    const activeChallenge = challenges.find(c => c.status === 'active');
    switch (currentTab) {
      case Tab.DASHBOARD: return (
        <Suspense fallback={<TabLoader />}>
          <Dashboard 
            user={user} 
            myIntentions={intentions.filter(i => i.author === user.name)} 
            routineItems={routineItems} 
            onToggleRoutine={handleToggleRoutine} 
            onNavigateToCommunity={(tab) => { if(tab) setCommunityInitialTab(tab); setCurrentTab(Tab.COMMUNITY); }} 
            onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)} 
            onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)} 
            onNavigateToProfile={() => setCurrentTab(Tab.PROFILE)} 
            onNavigateToMaps={() => setCurrentTab(Tab.MAPS)} 
            onSaveJournal={(mood, content, refl, vers) => createJournalEntry(user.id, mood, content, refl, vers)} 
            showLiturgyModal={showLiturgyModal} 
            setShowLiturgyModal={setShowLiturgyModal} 
            onLogout={handleLogout} 
            onOpenIntentionModal={() => setShowIntentionModal(true)}
          />
        </Suspense>
      );
      case Tab.ROUTINE: return (
        <Suspense fallback={<TabLoader />}>
          <Routine 
            items={routineItems} 
            activeChallenge={activeChallenge} 
            onToggle={handleToggleRoutine} 
            onAdd={(t: string, d: string) => addRoutineItem(user.id, { id: crypto.randomUUID(), title: t, description: d, xpReward: 10, completed: false, icon: 'heart', timeOfDay: 'any', dayOfWeek: [0,1,2,3,4,5,6] })} 
            onDelete={(id: string) => deleteRoutineItem(id)} 
            onNavigate={(t: Tab) => setCurrentTab(t)} 
            onOpenMaps={() => setCurrentTab(Tab.MAPS)} 
            onOpenLiturgy={() => { setCurrentTab(Tab.DASHBOARD); setTimeout(() => setShowLiturgyModal(true), 100); }} 
            onOpenPlayer={() => { }} 
          />
        </Suspense>
      );
      case Tab.KNOWLEDGE: return <Suspense fallback={<TabLoader />}><KnowledgeBase /></Suspense>;
      case Tab.COMMUNITY: return (
        <Suspense fallback={<TabLoader />}>
          <Community 
            intentions={intentions} 
            challenges={challenges} 
            onPray={handlePray} 
            onJoinChallenge={handleJoinChallenge} 
            onOpenCreateModal={() => setShowIntentionModal(true)} 
            onTestify={handleTestifyFromChallenge} 
            feedInitialContent={feedInitialContent} 
            initialTab={communityInitialTab}
            user={user} 
          />
        </Suspense>
      );
      case Tab.CHAT: return <Suspense fallback={<TabLoader />}><SpiritualChat user={user} /></Suspense>;
      case Tab.MAPS: return <Suspense fallback={<TabLoader />}><ParishFinder /></Suspense>;
      case Tab.PROFILE: return (
        <Suspense fallback={<TabLoader />}>
          <Profile 
            user={user} 
            onUpdateUser={(u: UserProfile) => { setUser(u); }} 
            onLogout={handleLogout} 
          />
        </Suspense>
      );
      default: return <TabLoader />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans text-slate-100 selection:bg-brand-violet/30">
      <InstallPWA />
      {viewState === 'app' && <div className="flex-shrink-0 hidden md:block h-full"><Sidebar currentTab={currentTab} onTabChange={setCurrentTab} user={user} onLogout={handleLogout} /></div>}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-brand-dark">
          {viewState === 'landing' && <LandingPage onStart={() => setViewState('onboarding')} onLogin={() => setViewState('login')} />}
          {viewState === 'login' && <Login onLogin={(u: UserProfile) => { setUser(u); setViewState('app'); }} onRegister={() => setViewState('onboarding')} onBack={() => setViewState('landing')} />}
          {viewState === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} onBack={() => setViewState('landing')} />}
          {viewState === 'generating' && (
             <div className="min-h-screen bg-[#1A2530] flex flex-col items-center justify-center p-8 text-center animate-fade-in font-sans">
                <div className="space-y-8 animate-pulse-slow">
                   <div className="w-20 h-20 bg-brand-violet/10 rounded-full flex items-center justify-center mx-auto">
                     <BrandLogo variant="fill" size={60} className="text-brand-violet" />
                   </div>
                   <div className="space-y-4">
                     <h2 className="text-2xl font-bold text-white tracking-tight">Recalibrando seu caminho...</h2>
                     <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">Nossa inteligência está ajustando suas orações para seu novo momento de vida.</p>
                   </div>
                </div>
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
            <>
              <div className="w-full max-w-[1600px] mx-auto min-h-full">
                <div className="h-full relative z-10 md:p-8 lg:p-10">
                  {renderContent()}
                </div>
              </div>
              {showTutorial && <Tutorial user={user} onComplete={() => setShowTutorial(false)} />}
              {showDailyInspiration && !showTutorial && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
              {showUpdatePasswordModal && <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />}
              {showMonthlyReview && <MonthlyReviewModal onClose={() => setShowMonthlyReview(false)} onComplete={handleMonthlyReviewComplete} currentStruggle={user.spiritualFocus} />}
              {showIntentionModal && <CreateIntentionModal onClose={() => setShowIntentionModal(false)} onSubmit={handleCreateIntention} />}
              <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
            </>
          )}
      </main>
    </div>
  );
};

export default App;
