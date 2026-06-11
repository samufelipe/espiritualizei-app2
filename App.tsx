
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import BrandLogo from './components/BrandLogo';
import Tutorial from './components/Tutorial';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword'; 
import Checkout from './components/Checkout'; 
import CreateIntentionModal from './components/CreateIntentionModal';
import DailyInspiration from './components/DailyInspiration';
import MonthlyReviewModal from './components/MonthlyReviewModal';
import InstallPWAGuide from './components/InstallPWAGuide';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import Paywall from './components/Paywall';
import AdminPanel from './components/AdminPanel';
import AdminLogin, { checkAdminSession, clearAdminSession, getAdminSecret } from './components/AdminLogin';
import QuizWelcome from './components/QuizWelcome';
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge, MonthlyReviewData } from './types';
import { generateSpiritualRoutine } from './services/geminiService';
import { fetchQuizSessionByEmail, fetchQuizSessionBySession, type QuizImport } from './services/quizImportService';
import { requestNotificationPermission } from './services/notificationService';
import { registerUser, loginUser, getSession, logoutUser, updateUserProfile, syncUserFromServer, isUserInTrial, trialDaysLeft, hasFullAccess, SUPABASE_URL, SUPABASE_KEY } from './services/authService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard'; 
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, addRoutineItem, deleteRoutineItem, upgradeUserToPremium, fetchGlobalChallenge, createCommunityPost, checkAndLogActivity, logRoutineTaskCompletion, queueEngagementEmail } from './services/databaseService';
import { getTodayCompletions, completeRoutineToday, uncompleteRoutineToday } from './services/routineCompletionService';
import { cacheChallenge, getCachedChallenge, cacheRoutine, getCachedRoutine, cacheIntentions, getCachedIntentions, markSyncComplete } from './services/cacheService';
import { Sparkles, Loader2, CheckCircle2, Crown, PartyPopper } from 'lucide-react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Routine = lazy(() => import('./components/Routine'));
const Community = lazy(() => import('./components/Community'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const KnowledgeBase = lazy(() => import('./components/KnowledgeBase'));
const MeusMateriais = lazy(() => import('./components/MeusMateriais'));

const TabLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center animate-fade-in text-slate-400 py-20 bg-brand-dark">
     <BrandLogo size={40} variant="fill" className="text-brand-violet animate-pulse-slow mb-4" />
     <Loader2 size={24} className="animate-spin text-brand-violet" />
  </div>
);

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'landing' | 'login' | 'onboarding' | 'generating' | 'quiz_welcome' | 'checkout' | 'verifying_payment' | 'welcome_premium' | 'app' | 'admin_login' | 'admin' | 'reset_password'>('landing');
  const [adminSecret, setAdminSecret] = useState('');
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyInspiration, setShowDailyInspiration] = useState(false);
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMonthlyReview, setShowMonthlyReview] = useState(false);
  const [socialInitialTab, setSocialInitialTab] = useState<'ranking' | 'chat'>('ranking');
  const [errorToast, setErrorToast] = useState('');
  const [quizEmail, setQuizEmail] = useState('');
  const [quizName, setQuizName] = useState('');
  const initializationRef = useRef(false);
  const paymentVerificationRef = useRef(false);
  const quizWelcomeRef = useRef(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [xpToast, setXpToast] = useState<{show: boolean, xp: number}>({show: false, xp: 0});
  const [isFromQuiz, setIsFromQuiz] = useState(() => localStorage.getItem('espiritualizei_from_quiz') === '1');
  const [materials, setMaterials] = useState<QuizImport | null>(null);
  const hasMaterials = !!materials?.stripeSessionId;

  // Redirecionar usuários do quiz para fora da aba de Rotina (funcionalidade oculta)
  useEffect(() => {
    if (isFromQuiz && currentTab === Tab.ROUTINE) {
      setCurrentTab(Tab.DASHBOARD);
    }
  }, [isFromQuiz, currentTab]);

  // Carregar "Meus Materiais" do usuário logado (compra ligada ao e-mail).
  // Roda quando entra no app com um usuário real; leitura autenticada via RLS.
  useEffect(() => {
    if (viewState !== 'app' || !user?.email || user.id === 'guest') return;
    let cancelled = false;
    fetchQuizSessionByEmail(user.email)
      .then(res => {
        if (cancelled || !res?.found) return;
        // Fallback: se o banco ainda não gravou o stripe_session_id (corrida com
        // o webhook), usar o que veio pelo link do quiz.
        if (!res.stripeSessionId) {
          const stored = localStorage.getItem('espiritualizei_quiz_stripe_session');
          if (stored) res.stripeSessionId = stored;
        }
        setMaterials(res);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [viewState, user?.id, user?.email]);

  // Controlar classe do body para scroll na LP vs app
  useEffect(() => {
    if (viewState === 'landing' || viewState === 'login' || viewState === 'onboarding' || viewState === 'checkout') {
      document.body.classList.remove('app-mode');
    } else {
      document.body.classList.add('app-mode');
    }
  }, [viewState]);

  // Tracking Meta Pixel + GTM por viewState
  const _trackingFirstRender = useRef(true);
  useEffect(() => {
    // Pular primeiro render — index.html já disparou PageView na inicialização do pixel
    if (_trackingFirstRender.current) { _trackingFirstRender.current = false; return; }

    const VIEW_PATHS: Record<string, string> = {
      landing:           '/',
      login:             '/login',
      onboarding:        '/onboarding',
      generating:        '/gerando-rotina',
      checkout:          '/checkout',
      verifying_payment: '/verificando-pagamento',
      welcome_premium:   '/bem-vindo-premium',
      app:               '/app',
      admin_login:       '/admin/login',
      admin:             '/admin',
      reset_password:    '/reset-password',
    };
    const path = VIEW_PATHS[viewState] || '/';

    // GTM dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event: 'page_view', page_path: path, page_title: viewState });

    // Meta Pixel PageView
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }

    // Eventos de conversão por viewState
    if (typeof (window as any).fbq === 'function') {
      if (viewState === 'onboarding') {
        (window as any).fbq('track', 'Lead');
        (window as any).dataLayer.push({ event: 'lead', page_path: path });
      }
      if (viewState === 'checkout') {
        (window as any).fbq('track', 'InitiateCheckout', { value: 19.90, currency: 'BRL', content_name: 'Espiritualizei Premium' });
        (window as any).dataLayer.push({ event: 'initiate_checkout', value: 19.90, currency: 'BRL' });
      }
      if (viewState === 'welcome_premium') {
        (window as any).fbq('track', 'Purchase', { value: 19.90, currency: 'BRL', content_name: 'Espiritualizei Premium', content_ids: ['espiritualizei-premium'], content_type: 'product' });
        (window as any).dataLayer.push({ event: 'purchase', value: 19.90, currency: 'BRL', page_path: path });
      }
    }
  }, [viewState]);

  // Tracking de abas dentro do app
  useEffect(() => {
    if (viewState !== 'app') return;

    const TAB_PATHS: Record<string, string> = {
      DASHBOARD:  '/app/dashboard',
      ROUTINE:    '/app/rotina',
      KNOWLEDGE:  '/app/formacao',
      COMMUNITY:  '/app/comunidade',
      SOCIAL:     '/app/social',
      PROFILE:    '/app/perfil',
    };
    const path = TAB_PATHS[currentTab] || '/app';

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event: 'page_view', page_path: path, page_title: currentTab });

    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }
  }, [currentTab, viewState]);

  // Verificação de acesso ao painel admin e reset-password via URL - PRIORIDADE MÁXIMA
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    console.log('🔍 Verificando path:', path, 'hash:', hash);

    // Verificar se é rota de reset-password (Supabase envia token no hash)
    if (path === '/reset-password' || path === '/reset-password/' || hash.includes('type=recovery')) {
      console.log('🔑 Rota de reset-password detectada!');
      setViewState('reset_password');
      return;
    }

    if (path === '/admin' || path === '/admin/' || path.startsWith('/admin')) {
      console.log('✅ Rota admin detectada!');
      if (checkAdminSession()) {
        setAdminSecret(getAdminSecret());
        setViewState('admin');
      } else {
        setViewState('admin_login');
      }
      return;
    }

    // Detecção de lead vindo do quiz: ?source=quiz&email=...&name=...&session=...
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('source') === 'quiz') {
      const emailParam = urlParams.get('email');
      const nameParam = urlParams.get('name');
      const sessionParam = urlParams.get('session');
      window.history.replaceState({}, '', '/');

      // Guardar a sessão do Stripe como fallback para abrir os materiais
      // (a fonte primária é o quiz_sessions.stripe_session_id no banco).
      if (sessionParam) {
        try { localStorage.setItem('espiritualizei_quiz_stripe_session', sessionParam); } catch (_) {}
      }

      // Se já tem sessão ativa, apenas marca como from_quiz e deixa o app abrir normalmente
      const existingSession = getSession();
      if (existingSession?.user?.id && existingSession.user.id !== 'guest' && Date.now() < existingSession.expiresAt) {
        localStorage.setItem('espiritualizei_from_quiz', '1');
        setIsFromQuiz(true);
        return; // initSession irá abrir o app normalmente
      }

      // Novo usuário vindo do quiz — mostrar tela de boas-vindas com cadastro simplificado
      if (emailParam) {
        setQuizEmail(decodeURIComponent(emailParam));
        setQuizName(decodeURIComponent(nameParam || ''));
        quizWelcomeRef.current = true;
        setViewState('quiz_welcome');
      }
    }
  }, []);

  // Verificação de retorno do Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSession = params.get('stripe_session');

    if (!stripeSession) return;

    const session = getSession();
    if (!session?.user?.id) return;

    // Sinaliza para initSession não sobrescrever o viewState de pagamento
    paymentVerificationRef.current = true;
    window.history.replaceState({}, document.title, '/');
    setViewState('verifying_payment');

    (async () => {
      // 1. Tentar sincronizar — webhook pode já ter disparado
      const serverUser = await syncUserFromServer(session.user.id, session.user.email);
      if (serverUser?.isPremium) {
        setUser(serverUser);
        setViewState('welcome_premium');
        return;
      }

      // 2. Fallback seguro: verificar sessão no Stripe via Edge Function (server-side)
      //    Valida que o sessionId pertence a este usuário e que o pagamento foi confirmado
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-stripe-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ sessionId: stripeSession, userId: session.user.id }),
        });
        const result = await res.json();

        if (result.isPremium) {
          const freshUser = await syncUserFromServer(session.user.id, session.user.email);
          if (freshUser) setUser(freshUser);
          setViewState('welcome_premium');
        } else {
          setViewState('checkout');
        }
      } catch (err) {
        console.error('Erro ao verificar sessao:', err);
        setViewState('checkout');
      }
    })();
  }, []);

  // Inicialização principal do app
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await Keyboard.setAccessoryBarVisible({ isVisible: true });
      } catch (e) {
        console.warn("Ambiente não nativo, pulando configs de StatusBar/Keyboard");
      }
    };
    initNative();

    const initSession = async () => {
      // NÃO inicializar se estiver na rota admin ou em verificação de pagamento
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/' || path.startsWith('/admin')) {
        console.log('Pulando initSession - rota admin detectada');
        return;
      }
      if (paymentVerificationRef.current) {
        console.log('Pulando initSession - verificacao de pagamento em andamento');
        return;
      }
      if (quizWelcomeRef.current) {
        console.log('Pulando initSession - tela de boas-vindas do quiz ativa');
        return;
      }
      
      const session = getSession();
      
      if (session && session.user && session.user.id !== 'guest') {
        // Verificar se a sessão ainda é válida
        if (Date.now() < session.expiresAt) {
          
          // SINCRONIZAÇÃO MESTRE: Buscar dados mais recentes do servidor
          const serverUser = await syncUserFromServer(session.user.id, session.user.email);
          
          if (serverUser) {
            setUser(serverUser);
            console.log("🛡️ Dados do usuário sincronizados do servidor.");
          } else {
            // Fallback para dados locais se servidor indisponível
            setUser(session.user);
            console.log("⚠️ Usando dados locais (servidor indisponível).");
          }

          setViewState('app');
          requestNotificationPermission();

          // Resume tutorial if started but not completed (reload-safe)
          const tutorialStarted = localStorage.getItem('espiritualizei_tutorial_started');
          const tutorialCompleted = localStorage.getItem('espiritualizei_tutorial_completed');
          if (tutorialStarted && !tutorialCompleted) {
            setShowTutorial(true);
          }

          // Verificar se deve mostrar revisão mensal (a cada 30 dias)
          const lastReviewStr = localStorage.getItem('espiritualizei_monthly_review_date');
          const daysSinceReview = lastReviewStr
            ? (Date.now() - parseInt(lastReviewStr)) / (1000 * 60 * 60 * 24)
            : Infinity;
          if (daysSinceReview >= 30) {
            setTimeout(() => setShowMonthlyReview(true), 4000);
          }

          // CARREGAMENTO OTIMISTA COM CACHE-FIRST
          // 1. Carregar cache imediatamente para UI instantânea
          const cachedChallenge = getCachedChallenge();
          const cachedRoutine = getCachedRoutine();
          const cachedIntentions = getCachedIntentions();
          
          // Aplicar cache imediatamente
          if (cachedChallenge) {
            setChallenges([cachedChallenge]);
            console.log("📦 Desafio carregado do cache:", cachedChallenge.title);
          }
          if (cachedRoutine && cachedRoutine.length > 0) {
            setRoutineItems(cachedRoutine);
            console.log("📦 Rotina carregada do cache:", cachedRoutine.length, "itens");
          }
          if (cachedIntentions && cachedIntentions.length > 0) {
            setIntentions(cachedIntentions);
            console.log("📦 Intenções carregadas do cache:", cachedIntentions.length, "itens");
          }
          
          // 2. Buscar dados frescos em background e atualizar
          try {
            const [dbIntentions, globalChallenge, dbRoutine] = await Promise.all([
              fetchCommunityIntentions(session.user.id),
              fetchGlobalChallenge(),
              fetchUserRoutine(session.user.id)
            ]);
            
            // Atualizar com dados frescos e salvar no cache
            if (dbIntentions) {
              setIntentions(dbIntentions);
              cacheIntentions(dbIntentions);
              console.log("✅ Intenções atualizadas do servidor:", dbIntentions.length, "itens");
            }
            
            if (globalChallenge) {
              setChallenges([globalChallenge]);
              cacheChallenge(globalChallenge);
              console.log("🏆 Desafio atualizado do servidor:", globalChallenge.title);
            } else if (!cachedChallenge) {
              // Só mostrar warning se não tiver cache
              console.warn("⚠️ Nenhum desafio disponível no servidor.");
            }
            
            if (dbRoutine && dbRoutine.length > 0) {
              setRoutineItems(dbRoutine);
              cacheRoutine(dbRoutine);
              console.log("✅ Rotina atualizada do servidor:", dbRoutine.length, "itens");
            }
            
            // Carregar conclusões de hoje
            const todayCompletions = await getTodayCompletions(session.user.id);
            setCompletedToday(new Set(todayCompletions));
            console.log("✅ Conclusões de hoje carregadas:", todayCompletions.length, "itens");
            
            markSyncComplete();
          } catch (e) {
            console.error("❌ Erro ao buscar dados frescos:", e);
            // Cache já foi aplicado, então usuário vê dados mesmo com erro
            console.log("🛡️ Usando dados em cache (modo offline)");
          }

          // Registrar atividade
          checkAndLogActivity(session.user.id);
          
          // Verificar se deve mostrar Inspiração Diária (não durante tutorial pendente)
          const lastSeen = localStorage.getItem('espiritualizei_daily_inspiration_date');
          const today = new Date().toDateString();
          const tutPending = !!localStorage.getItem('espiritualizei_tutorial_started') && !localStorage.getItem('espiritualizei_tutorial_completed');
          if (lastSeen !== today && !tutPending) {
            setShowDailyInspiration(true);
            localStorage.setItem('espiritualizei_daily_inspiration_date', today);
          }
          
          // Verificar se deve mostrar guia de instalação PWA
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
          const hasSeenGuide = localStorage.getItem('espiritualizei_pwa_guide_seen');
          if (!isStandalone && !hasSeenGuide) {
            setTimeout(() => setShowInstallGuide(true), 5000);
          }
          
        } else {
          // Sessão expirada
          console.log("⏰ Sessão expirada, redirecionando para login.");
          setViewState('login');
          window.history.replaceState({}, document.title, '/login');
        }
      } else {
        // Sem sessão, verificar URL
        const path = window.location.pathname;
        if (path === '/login' || path === '/login/') {
          setViewState('login');
        } else if (path === '/onboarding' || path.startsWith('/onboarding/')) {
          setViewState('onboarding');
        } else {
          // URL raiz (/) ou qualquer outra = Landing Page
          setViewState('landing');
          // Garantir que a URL seja a raiz
          if (path !== '/' && path !== '') {
            window.history.replaceState({}, document.title, '/');
          }
        }
      }
    };
    
    initSession();
  }, []); 

  const handleLogout = async () => {
     await logoutUser();
     window.history.pushState({}, '', '/');
     setViewState('landing');
     setUser({ id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date() });
     setRoutineItems([]);
     setIntentions([]);
     setChallenges([]);
  };

  // Handler para atualização de usuário com persistência garantida
  const handleUpdateUser = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    await updateUserProfile(updatedUser);
  };

  const handleMonthlyReviewComplete = async (reviewData: MonthlyReviewData) => {
    setShowMonthlyReview(false);
    localStorage.setItem('espiritualizei_monthly_review_date', Date.now().toString());
    try {
      const partialData: OnboardingData = {
        name: user.name, email: user.email, phone: '',
        primaryStruggle: (user.spiritualFocus as any) || 'anxiety',
        spiritualGoal: user.spiritualGoal || 'peace',
        routineType: user.routineType || 'flexible',
        bestMoment: user.bestMoment || 'morning',
        confessionFrequency: user.confessionFrequency || 'rare',
        patronSaint: (user.patronSaint as any) || 'mary',
        stateOfLife: (user.stateOfLife as any) || 'single',
      };
      const result = await generateSpiritualRoutine(partialData, reviewData);
      await saveUserRoutine(user.id, result.routine);
      setRoutineItems(result.routine);
      cacheRoutine(result.routine);
    } catch (e) {
      console.error('Erro ao atualizar rotina mensal:', e);
    }
  };

  const renderContent = () => {
    const activeChallenge = challenges.find(c => c.status === 'active');
    const needsPremium = (currentTab === Tab.KNOWLEDGE || currentTab === Tab.SOCIAL);
    
    if (needsPremium && !hasFullAccess(user)) {
       return (
          <div className="flex items-center justify-center p-6 h-full">
            <Paywall
              onCheckout={() => setViewState('checkout')}
              isTrialExpired={user.subscriptionStatus === 'expired'}
            />
          </div>
       );
    }

    switch (currentTab) {
      case Tab.DASHBOARD: 
        return (
          <Suspense fallback={<TabLoader />}>
            <Dashboard 
              user={user} 
              myIntentions={intentions.filter(i => i.author === user.name)} 
              routineItems={routineItems} 
              onNavigateToCommunity={() => { setCurrentTab(Tab.COMMUNITY); }} 
              onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)} 
              onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)} 
              onNavigateToProfile={() => setCurrentTab(Tab.PROFILE)} 
              onNavigateToSocial={(tab) => { setSocialInitialTab(tab || 'ranking'); setCurrentTab(Tab.SOCIAL); }} 
              onSaveJournal={() => {}} 
              showLiturgyModal={showLiturgyModal} 
              setShowLiturgyModal={setShowLiturgyModal} 
              onLogout={handleLogout} 
              onOpenIntentionModal={() => setShowIntentionModal(true)} 
              onUpdateUser={handleUpdateUser} 
            />
          </Suspense>
        );
        
      case Tab.ROUTINE: 
        return (
          <Suspense fallback={<TabLoader />}>
            <Routine 
              items={routineItems} 
              activeChallenge={activeChallenge}
              completedToday={completedToday} 
                            onToggle={async (id) => { 
                const item = routineItems.find(i => i.id === id); 
                if (item) { 
                  const isCompletedToday = completedToday.has(id);
                  
                  if (isCompletedToday) {
                    await uncompleteRoutineToday(user.id, id);
                    setCompletedToday(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(id);
                      return newSet;
                    });
                  } else {
                    const result = await completeRoutineToday(user.id, id, item.xpReward);

                    if (result.success) {
                      setCompletedToday(prev => new Set([...prev, id]));
                      setUser(prev => {
                        const newXP = prev.currentXP + result.xp;
                        const newLevel = Math.floor(newXP / 100) + 1;
                        return {
                          ...prev,
                          currentXP: newXP,
                          level: newLevel,
                          nextLevelXP: newLevel * 100,
                        };
                      });
                      if (result.xp > 0) {
                        setXpToast({show: true, xp: result.xp});
                        setTimeout(() => setXpToast({show: false, xp: 0}), 3000);
                      }
                    }
                  }
                  
                  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {}

                } 
              }} 
              onAdd={async (title, desc) => { 
                const newItem: RoutineItem = { 
                  id: crypto.randomUUID(), 
                  title, 
                  description: desc, 
                  xpReward: 10, 
                  completed: false, 
                  icon: 'cross', 
                  timeOfDay: 'any', 
                  dayOfWeek: [0,1,2,3,4,5,6] 
                }; 
                const updatedRoutine = [...routineItems, newItem];
                setRoutineItems(updatedRoutine); 
                cacheRoutine(updatedRoutine); // Atualizar cache
                await addRoutineItem(user.id, newItem); 
              }} 
              onDelete={async (id) => { 
                const updatedRoutine = routineItems.filter(i => i.id !== id);
                setRoutineItems(updatedRoutine); 
                cacheRoutine(updatedRoutine); // Atualizar cache
                await deleteRoutineItem(id); 
              }} 
              onNavigate={setCurrentTab}
              onCompleteTask={async (taskId, xpReward) => {
                // Registrar conclusão no banco para analytics do painel admin
                // XP já é somado pelo onToggle via completeRoutineToday
                await logRoutineTaskCompletion(user.id, taskId, xpReward);
              }}
            />
          </Suspense>
        );
        
      case Tab.MATERIALS:
        return <Suspense fallback={<TabLoader />}><MeusMateriais data={materials} /></Suspense>;

      case Tab.KNOWLEDGE:
        return <Suspense fallback={<TabLoader />}><KnowledgeBase /></Suspense>;

      case Tab.COMMUNITY:
        return (
          <Suspense fallback={<TabLoader />}>
            <Community 
              intentions={intentions} 
              challenges={challenges} 
              onPray={async (id) => { 
                await togglePrayerInteraction(id); 
                fetchCommunityIntentions(user.id).then(setIntentions); 
              }} 
              onJoinChallenge={async (id) => { 
                const updatedChallenges = challenges.map(c => c.id === id ? { ...c, isUserParticipating: true, participants: c.participants + 1 } : c);
                setChallenges(updatedChallenges);
                // Atualizar cache
                if (updatedChallenges.length > 0) {
                  cacheChallenge(updatedChallenges[0]);
                }
                await toggleRoutineItemStatus(id, true); 
              }} 
              onOpenCreateModal={() => setShowIntentionModal(true)} 
              onTestify={async (content) => { 
                await createCommunityPost(user.id, user.name, user.photoUrl, content); 
              }} 
              user={user} 
            />
          </Suspense>
        );
        
      case Tab.SOCIAL: 
        return <Suspense fallback={<TabLoader />}><SocialHub user={user} initialTab={socialInitialTab} /></Suspense>;
        
      case Tab.PROFILE: 
        return (
          <Suspense fallback={<TabLoader />}>
            <Profile user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
          </Suspense>
        );
        
      default: return <TabLoader />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark font-sans text-slate-100 selection:bg-brand-violet/30 pt-safe pb-safe">
      {/* Guia de Instalação PWA */}
      {showInstallGuide && (
        <InstallPWAGuide onClose={() => {
          setShowInstallGuide(false);
          localStorage.setItem('espiritualizei_pwa_guide_seen', 'true');
        }} />
      )}
      
      {/* Modal de Permissão de Notificações */}
      {showNotificationModal && (
        <NotificationPermissionModal
          userId={user.id}
          onClose={() => {
            setShowNotificationModal(false);
            localStorage.setItem(`notification_asked_${user.id}`, 'true');
          }}
          onSuccess={() => {
            setShowNotificationModal(false);
            localStorage.setItem(`notification_asked_${user.id}`, 'true');
          }}
        />
      )}
      
      {viewState === 'app' && <div className="flex-shrink-0 hidden md:block h-full"><Sidebar currentTab={currentTab} onTabChange={setCurrentTab} user={user} onLogout={handleLogout} isFromQuiz={isFromQuiz} hasMaterials={hasMaterials} /></div>}
      
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-brand-dark no-scrollbar">
          {viewState === 'landing' && (
            <Suspense fallback={<TabLoader />}>
              <LandingPage onStart={() => { window.history.pushState({}, '', '/onboarding/inicio'); setViewState('onboarding'); }} onLogin={() => { window.history.pushState({}, '', '/login'); setViewState('login'); }} />
            </Suspense>
          )}
          
          {viewState === 'login' && (
            <Login 
              onLogin={(u) => { 
                setUser(u); 
                setViewState('app'); 
                // Carregar rotina após login
                fetchUserRoutine(u.id).then((db) => {
                  if (db && db.length > 0) setRoutineItems(db);
                });
                fetchCommunityIntentions(u.id).then(setIntentions);
                fetchGlobalChallenge().then((global) => {
                  if (global) setChallenges([global]);
                });
              }} 
onRegister={() => { window.history.pushState({}, '', '/onboarding/inicio'); setViewState('onboarding'); }} 
               onBack={() => { window.history.pushState({}, '', '/'); setViewState('landing'); }}
            />
          )}
          
          {viewState === 'quiz_welcome' && (
            <QuizWelcome
              name={quizName}
              email={quizEmail}
              onComplete={async (data) => {
                setViewState('generating');
                try {
                  localStorage.setItem('espiritualizei_from_quiz', '1');
                  setIsFromQuiz(true);

                  let onboardingData = data;
                  try {
                    // Alinhar o perfil à diagnose do quiz via stripe_session_id
                    // (segredo de posse), sem leitura anônima da tabela.
                    const storedSession = localStorage.getItem('espiritualizei_quiz_stripe_session') || '';
                    const qi = storedSession ? await fetchQuizSessionBySession(storedSession) : null;
                    if (qi && qi.found) {
                      onboardingData = {
                        ...data,
                        primaryStruggle: qi.primaryStruggle || data.primaryStruggle,
                        spiritualGoal: qi.spiritualGoal || data.spiritualGoal,
                      };
                      if (qi.plan) localStorage.setItem('espiritualizei_quiz_plan', JSON.stringify(qi.plan));
                    }
                  } catch (_) { /* não-bloqueante */ }

                  const session = await registerUser(onboardingData);
                  if (session && session.user) {
                    setUser(session.user);
                    const result = await generateSpiritualRoutine(onboardingData);
                    await saveUserRoutine(session.user.id, result.routine);
                    setRoutineItems(result.routine);
                    queueEngagementEmail(session.user.id, 'welcome', { userName: session.user.name });
                    setViewState('app');
                    setShowTutorial(true);
                    fetchGlobalChallenge().then((global) => { if (global) setChallenges([global]); });
                  }
                } catch (e: any) {
                  setViewState('quiz_welcome');
                  throw e; // QuizWelcome captura e exibe o erro
                }
              }}
              onLogin={async (loginEmail, password) => {
                // Mesma credencial: o usuário já tem conta. Entra e abre o app.
                const session = await loginUser(loginEmail, password);
                if (session && session.user) {
                  localStorage.setItem('espiritualizei_from_quiz', '1');
                  setIsFromQuiz(true);
                  setUser(session.user);
                  fetchUserRoutine(session.user.id).then((db) => { if (db && db.length > 0) setRoutineItems(db); });
                  fetchCommunityIntentions(session.user.id).then(setIntentions);
                  fetchGlobalChallenge().then((global) => { if (global) setChallenges([global]); });
                  setViewState('app');
                }
              }}
            />
          )}

          {viewState === 'onboarding' && (
            <Suspense fallback={<TabLoader />}>
              <Onboarding 
                onComplete={async (data) => {
                  setViewState('generating');
                  try {
                    // UNIFICAÇÃO QUIZ -> APP (aditiva, nunca bloqueia o cadastro):
                    // se o e-mail já comprou o quiz, a diagnose do quiz é a fonte da
                    // verdade e alinha o perfil + a rotina. Falha = segue normal.
                    let onboardingData = data;
                    try {
                      const qi = await fetchQuizSessionByEmail(data.email);
                      if (qi && qi.found) {
                        onboardingData = {
                          ...data,
                          primaryStruggle: qi.primaryStruggle || data.primaryStruggle,
                          spiritualGoal: qi.spiritualGoal || data.spiritualGoal,
                        };
                        if (qi.plan) localStorage.setItem('espiritualizei_quiz_plan', JSON.stringify(qi.plan));
                        localStorage.setItem('espiritualizei_from_quiz', '1');
                        setIsFromQuiz(true);
                      }
                    } catch (_) { /* não-bloqueante */ }

                    const session = await registerUser(onboardingData);
                    if (session && session.user) {
                      setUser(session.user);

                      // Gerar rotina inicial alinhada à diagnose (quiz quando existir)
                      const result = await generateSpiritualRoutine(onboardingData);
                      const initialRoutine = result.routine;
                      
                      // Salvar rotina no servidor
                      await saveUserRoutine(session.user.id, initialRoutine);
                      setRoutineItems(initialRoutine);
                      
                      console.log("✅ Rotina inicial salva no servidor:", initialRoutine.length, "itens");
                      
                      // Disparar e-mail de boas-vindas
                      queueEngagementEmail(session.user.id, 'welcome', { userName: session.user.name });

                      // Transição para o app
                      setViewState('app');
                      setShowTutorial(true);
                      fetchGlobalChallenge().then((global) => {
                        if (global) setChallenges([global]);
                      });
                    }
                  } catch (e: any) {
                    console.error("Erro no onboarding:", e);
                    setViewState('onboarding');

                    let errorMessage = "Erro ao criar conta. Tente novamente.";
                    if (e.message?.includes("User already registered")) {
                      errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
                    } else if (e.message?.includes("Password should be at least 6 characters")) {
                      errorMessage = "A senha deve ter no mínimo 6 caracteres.";
                    } else if (e.message) {
                      errorMessage = e.message;
                    }

                    setErrorToast(errorMessage);
                    setTimeout(() => setErrorToast(''), 5000);
                  }
                }} 
                onBack={() => { window.history.pushState({}, '', '/'); setViewState('landing'); }} 
              />
            </Suspense>
          )}
          
          {viewState === 'generating' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-brand-dark">
              <div className="w-24 h-24 bg-brand-violet/20 rounded-full flex items-center justify-center mb-8 animate-pulse-slow">
                <BrandLogo size={64} variant="fill" className="text-brand-violet" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Preparando sua Jornada...</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-12">Estamos preparando sua jornada com cuidado, a partir do que você compartilhou.</p>
              <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-violet animate-progress-loading" />
              </div>
            </div>
          )}
          
          {viewState === 'verifying_payment' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-brand-dark">
              <Loader2 className="w-16 h-16 animate-spin text-brand-violet mx-auto mb-6" />
              <p className="text-white font-bold text-xl">Verificando seu acesso...</p>
              <p className="text-slate-400 text-sm mt-2">Confirmando pagamento com nosso servidor</p>
            </div>
          )}

          {viewState === 'checkout' && <Checkout onSuccess={() => setViewState('welcome_premium')} onVerifyPayment={async () => {
            const session = getSession();
            if (!session?.user?.id) return;
            setViewState('verifying_payment');
            const serverUser = await syncUserFromServer(session.user.id, session.user.email);
            if (serverUser?.isPremium) {
              setUser(serverUser);
              setViewState('welcome_premium');
            } else {
              setViewState('checkout');
            }
          }} userName={user.name} userEmail={user.email} userId={user.id} onLogout={handleLogout} />}
          
          {viewState === 'welcome_premium' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-gradient-to-b from-brand-violet via-purple-700 to-brand-dark relative overflow-hidden">
              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-4 h-4 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                <div className="absolute top-20 right-20 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                <div className="absolute top-32 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                <div className="absolute top-16 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.6s'}} />
                <div className="absolute bottom-32 left-16 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}} />
                <div className="absolute bottom-40 right-16 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
              </div>
              
              <div className="relative z-10">
                <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/40 ring-4 ring-white/20 animate-pulse-slow">
                  <Crown size={56} fill="currentColor" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white tracking-tight">Bem-vindo ao Premium!</h2>
                <p className="text-white/80 max-w-md mx-auto mb-8 text-lg font-medium">Sua assinatura foi confirmada com sucesso. Agora você tem acesso total a todos os recursos do Espiritualizei.</p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-10 max-w-sm mx-auto border border-white/20">
                  <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Agora você pode:</h3>
                  <div className="space-y-3 text-left">
                    {['Acessar a Biblioteca completa de formação', 'Participar do Chat da Comunidade', 'Ver o Ranking de Caridade', 'Receber seu Plano de Vida mensal'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/90 text-sm font-medium">
                        <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button onClick={() => setViewState('app')} className="bg-white text-brand-violet px-12 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto">
                  Começar Jornada <PartyPopper size={24} />
                </button>
              </div>
            </div>
          )}
          
          {viewState === 'app' && isUserInTrial(user) && (
            <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-xs font-bold text-white shadow-lg transition-all ${trialDaysLeft(user) <= 2 ? 'bg-red-500' : trialDaysLeft(user) <= 4 ? 'bg-amber-500' : 'bg-brand-violet'}`}>
              <span>{trialDaysLeft(user) === 1 ? 'Último dia de trial gratuito!' : `Trial gratuito: ${trialDaysLeft(user)} dias restantes`}</span>
              <button
                onClick={() => setViewState('checkout')}
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-3 py-1 rounded-full transition-colors ml-3 shrink-0"
              >
                Assinar Agora
              </button>
            </div>
          )}
          {viewState === 'app' && renderContent()}
      </main>

      {viewState === 'app' && <div className="md:hidden"><Navigation currentTab={currentTab} onTabChange={setCurrentTab} showLockOnPremium={!hasFullAccess(user)} isFromQuiz={isFromQuiz} hasMaterials={hasMaterials} /></div>}
      
      {showTutorial && <Tutorial user={user} onComplete={() => {
        localStorage.setItem('espiritualizei_tutorial_completed', 'true');
        setShowTutorial(false);
        // Verificar se já pediu permissão de notificação
        const notificationAsked = localStorage.getItem(`notification_asked_${user.id}`);
        if (!notificationAsked && 'Notification' in window && Notification.permission === 'default') {
          setTimeout(() => setShowNotificationModal(true), 1000);
        }
      }} />}
      {showDailyInspiration && !showTutorial && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
      {showMonthlyReview && (
        <MonthlyReviewModal
          onClose={() => {
            setShowMonthlyReview(false);
            localStorage.setItem('espiritualizei_monthly_review_date', Date.now().toString());
          }}
          onComplete={handleMonthlyReviewComplete}
          currentStruggle={user.spiritualFocus}
        />
      )}
      {errorToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 max-w-sm text-center">
            <span className="font-semibold text-sm">{errorToast}</span>
          </div>
        </div>
      )}
      {showIntentionModal && (
        <CreateIntentionModal 
          onClose={() => setShowIntentionModal(false)} 
          onSubmit={async (content, category) => { 
            await createIntention(user.id, user.name, user.photoUrl, content, category, []); 
            fetchCommunityIntentions(user.id).then(setIntentions); 
            setShowIntentionModal(false); 
          }} 
        />
      )}
      
      {/* Painel Administrativo */}
      {viewState === 'admin_login' && (
        <AdminLogin
          onLogin={(success, secret) => {
            if (success) {
              setAdminSecret(secret);
              setViewState('admin');
            }
          }}
          onBack={() => {
            window.history.pushState({}, '', '/');
            setViewState('landing');
          }}
        />
      )}

      {viewState === 'admin' && (
        <AdminPanel
          adminSecret={adminSecret}
          onLogout={() => {
            clearAdminSession();
            setAdminSecret('');
            window.history.pushState({}, '', '/');
            setViewState('landing');
          }}
          onBackToApp={() => {
            window.history.pushState({}, '', '/');
            setViewState('landing');
          }}
        />
      )}
      
      {viewState === 'reset_password' && (
        <ResetPassword 
          onSuccess={() => {
            window.history.pushState({}, '', '/login');
            setViewState('login');
          }}
          onCancel={() => {
            window.history.pushState({}, '', '/login');
            setViewState('login');
          }}
        />
      )}
      
      {xpToast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] animate-fade-in">
          <div className="bg-gradient-to-r from-brand-violet to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <Sparkles size={20} className="animate-pulse" />
            <span className="font-semibold">Parabéns! +{xpToast.xp} XP conquistados</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
