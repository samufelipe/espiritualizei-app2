
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
import Paywall from './components/Paywall';
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge, MonthlyReviewData } from './types';
import { generateSpiritualRoutine } from './services/geminiService';
import { registerUser, getSession, logoutUser, updateUserProfile } from './services/authService'; 
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, createJournalEntry, addRoutineItem, deleteRoutineItem, upgradeUserToPremium, fetchGlobalChallenge } from './services/databaseService';
import { Sparkles, ArrowRight, Loader2, Shield, Heart, User as UserIcon, CheckCircle2, Flame, Footprints, Crown, PartyPopper } from 'lucide-react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Routine = lazy(() => import('./components/Routine'));
const Community = lazy(() => import('./components/Community'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const KnowledgeBase = lazy(() => import('./components/KnowledgeBase'));

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
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const initializationRef = useRef(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);

  // ESCUTA DE PAGAMENTO: Verifica se o usuário voltou com parâmetro de sucesso
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const urlUserId = params.get('userId');
    const isSuccess = status === 'success' || status === 'paid' || status === 'approved';
    
    if (isSuccess) {
       const session = getSession();
       // Se temos o userId na URL ou na sessão, podemos processar
       const targetUserId = urlUserId || session?.user?.id;
       
       if (targetUserId) {
          // 1. Limpa a URL para evitar re-processamento ao dar refresh
          window.history.replaceState({}, document.title, "/");
          
          // 2. Se o usuário logado for o mesmo do pagamento, atualiza localmente
          if (session?.user && session.user.id === targetUserId) {
            const updatedUser: UserProfile = { 
              ...session.user, 
              isPremium: true, 
              subscriptionStatus: 'active' 
            };
            setUser(updatedUser);
            updateUserProfile(updatedUser);
          }
          
          // 3. Mostra tela de celebração (independente de estar logado ou não, pois o pagamento foi dele)
          setViewState('welcome_premium');

          // 4. Tenta avisar o banco (fallback caso o webhook demore)
          upgradeUserToPremium(targetUserId);
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
        
        fetchUserRoutine(session.user.id).then((db) => db && db.length > 0 && setRoutineItems(db));
        fetchCommunityIntentions(session.user.id).then(setIntentions);
        fetchGlobalChallenge().then((global) => global && setChallenges([global]));
        
      } else {
         const path = window.location.pathname;
         if (path === '/login') setViewState('login');
         else if (path === '/onboarding') setViewState('onboarding');
         else setViewState('landing');
      }
    };
    initSession();
  }, []); 

  const handleLogout = async () => {
     await logoutUser();
     setViewState('landing');
     setUser({ id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date() });
     setRoutineItems([]);
  };

  const renderContent = () => {
    const activeChallenge = challenges.find(c => c.status === 'active');
    const needsPremium = (currentTab === Tab.KNOWLEDGE || currentTab === Tab.SOCIAL);
    
    if (needsPremium && !user.isPremium) {
       return (
          <div className="flex items-center justify-center p-6 h-full">
            <Paywall onCheckout={() => setViewState('checkout')} />
          </div>
       );
    }

    switch (currentTab) {
      case Tab.DASHBOARD: return <Suspense fallback={<TabLoader />}><Dashboard user={user} myIntentions={intentions.filter(i => i.author === user.name)} routineItems={routineItems} onNavigateToCommunity={(tab) => { setCurrentTab(Tab.COMMUNITY); }} onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)} onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)} onNavigateToProfile={() => setCurrentTab(Tab.PROFILE)} onNavigateToSocial={() => setCurrentTab(Tab.SOCIAL)} onSaveJournal={createJournalEntry} showLiturgyModal={false} setShowLiturgyModal={() => {}} onLogout={handleLogout} onOpenIntentionModal={() => setShowIntentionModal(true)} /></Suspense>;
      case Tab.ROUTINE: return <Suspense fallback={<TabLoader />}><Routine items={routineItems} activeChallenge={activeChallenge} onToggle={() => {}} onAdd={() => {}} onDelete={() => {}} onNavigate={setCurrentTab} /></Suspense>;
      case Tab.KNOWLEDGE: return <Suspense fallback={<TabLoader />}><KnowledgeBase /></Suspense>;
      case Tab.COMMUNITY: return <Suspense fallback={<TabLoader />}><Community intentions={intentions} challenges={challenges} onPray={() => {}} onJoinChallenge={() => {}} onOpenCreateModal={() => setShowIntentionModal(true)} onTestify={() => {}} user={user} /></Suspense>;
      case Tab.SOCIAL: return <Suspense fallback={<TabLoader />}><SocialHub user={user} /></Suspense>;
      case Tab.PROFILE: return <Suspense fallback={<TabLoader />}><Profile user={user} onUpdateUser={setUser} onLogout={handleLogout} /></Suspense>;
      default: return <TabLoader />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans text-slate-100 selection:bg-brand-violet/30 pt-safe pb-safe">
      {viewState === 'app' && <InstallPWA />}
      
      {viewState === 'app' && <div className="flex-shrink-0 hidden md:block h-full"><Sidebar currentTab={currentTab} onTabChange={setCurrentTab} user={user} onLogout={handleLogout} /></div>}
      
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-brand-dark no-scrollbar">
          {viewState === 'landing' && <LandingPage onStart={() => setViewState('onboarding')} onLogin={() => setViewState('login')} />}
          {viewState === 'login' && <Login onLogin={(u) => { setUser(u); setViewState('app'); }} onRegister={() => setViewState('onboarding')} onBack={() => setViewState('landing')} />}
          {viewState === 'onboarding' && <Onboarding onComplete={async (d) => { setViewState('generating'); }} onBack={() => setViewState('landing')} />}
          
          {viewState === 'generating' && (
             <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <Loader2 size={40} className="animate-spin text-brand-violet mb-4" />
                <h2 className="text-xl font-bold">Gerando sua Regra de Vida...</h2>
             </div>
          )}
          
          {viewState === 'checkout' && <Checkout onSuccess={() => setViewState('welcome_premium')} userName={user.name} onLogout={handleLogout} />}
          
          {viewState === 'welcome_premium' && (
             <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-brand-violet/5 animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-8 animate-bounce border-2 border-green-500/20">
                        <CheckCircle2 size={56} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Deus seja louvado!</h1>
                    <p className="text-slate-400 max-w-xs mb-12 leading-relaxed text-lg">Sua assinatura foi confirmada. O acesso completo está liberado para sua alma peregrina.</p>
                    
                    <div className="w-full max-w-xs space-y-4">
                        <button 
                            onClick={() => setViewState('app')} 
                            className="w-full bg-brand-violet text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-brand-violet/30 flex items-center justify-center gap-3 transition-transform active:scale-95 text-lg"
                        >
                            Entrar no App <ArrowRight size={22} />
                        </button>
                    </div>
                    
                    <div className="mt-12 flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        <PartyPopper size={14} className="text-brand-violet" /> 
                        Aproveite sua jornada espiritual
                    </div>
                </div>
             </div>
          )}

          {viewState === 'app' && (
            <>
              <div className="w-full max-w-[1600px] mx-auto min-h-full">
                <div className="h-full relative z-10 md:p-8">
                  {renderContent()}
                </div>
              </div>
              <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
            </>
          )}
      </main>
      
      {showDailyInspiration && <DailyInspiration onClose={() => setShowDailyInspiration(false)} userName={user.name} />}
      {showIntentionModal && <CreateIntentionModal onClose={() => setShowIntentionModal(false)} onSubmit={async (c, cat) => { await createIntention(user.id, user.name, user.photoUrl, c, cat, []); fetchCommunityIntentions(user.id).then(setIntentions); }} />}
    </div>
  );
};

export default App;
