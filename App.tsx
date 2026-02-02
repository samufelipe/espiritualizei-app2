
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
import InstallPWAGuide from './components/InstallPWAGuide';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import Paywall from './components/Paywall';
import AdminPanel from './components/AdminPanel';
import AdminLogin, { checkAdminSession, clearAdminSession } from './components/AdminLogin';
import { Tab, UserProfile, RoutineItem, OnboardingData, PrayerIntention, CommunityChallenge, MonthlyReviewData } from './types';
import { generateSpiritualRoutine } from './services/geminiService';
import { requestNotificationPermission, scheduleRoutineNotifications } from './services/notificationService';
import { registerUser, getSession, logoutUser, updateUserProfile, supabase, mapProfileFromDB, syncUserFromServer } from './services/authService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard'; 
import { saveUserRoutine, fetchUserRoutine, toggleRoutineItemStatus, fetchCommunityIntentions, createIntention, togglePrayerInteraction, addRoutineItem, deleteRoutineItem, upgradeUserToPremium, fetchGlobalChallenge, createCommunityPost, checkAndLogActivity, queueEngagementEmail } from './services/databaseService';
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
  const [viewState, setViewState] = useState<'landing' | 'login' | 'onboarding' | 'generating' | 'checkout' | 'welcome_premium' | 'app' | 'admin_login' | 'admin'>('landing');
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyInspiration, setShowDailyInspiration] = useState(false);
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const initializationRef = useRef(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'guest', name: 'Visitante', email: '', level: 1, currentXP: 0, nextLevelXP: 100, streakDays: 0, joinedDate: new Date()
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);

  // Controlar classe do body para scroll na LP vs app
  useEffect(() => {
    if (viewState === 'landing' || viewState === 'login' || viewState === 'onboarding' || viewState === 'checkout') {
      document.body.classList.remove('app-mode');
    } else {
      document.body.classList.add('app-mode');
    }
  }, [viewState]);

  // Verificação de acesso ao painel admin via URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      // Verificar se já tem sessão admin válida
      if (checkAdminSession()) {
        setViewState('admin');
      } else {
        setViewState('admin_login');
      }
      return;
    }
  }, []);

  // Verificação de pagamento bem-sucedido via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const urlUserId = params.get('userId');
    const isSuccess = status === 'success' || status === 'paid' || status === 'approved';
    
    if (isSuccess) {
       const session = getSession();
       const targetUserId = urlUserId || session?.user?.id;
       
       if (targetUserId) {
          window.history.replaceState({}, document.title, "/");
          
          if (session?.user && session.user.id === targetUserId) {
            const updatedUser: UserProfile = { 
              ...session.user, 
              isPremium: true, 
              subscriptionStatus: 'active' 
            };
            setUser(updatedUser);
            updateUserProfile(updatedUser);
          }
          
          setViewState('welcome_premium');
          
          upgradeUserToPremium(targetUserId).then(() => {
             console.log("💎 Premium ativado com sucesso no servidor.");
          }).catch(err => {
             console.error("❌ Erro ao ativar premium no servidor:", err);
          });
       }
    }
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

          // Carregar dados complementares com tratamento robusto
          try {
            const [dbIntentions, globalChallenge, dbRoutine] = await Promise.all([
              fetchCommunityIntentions(session.user.id),
              fetchGlobalChallenge(),
              fetchUserRoutine(session.user.id)
            ]);
            
            setIntentions(dbIntentions || []);
            
            // GARANTIR que o desafio comunitário SEMPRE apareça
            if (globalChallenge) {
              setChallenges([globalChallenge]);
              console.log("🏆 Desafio comunitário carregado:", globalChallenge.title);
            } else {
              // Fallback: gerar desafio local se servidor falhar
              console.warn("⚠️ Gerando desafio local como fallback.");
            }
            
            if (dbRoutine && dbRoutine.length > 0) {
              setRoutineItems(dbRoutine);
              console.log("✅ Rotina carregada do servidor:", dbRoutine.length, "itens");
            }
          } catch (e) {
            console.error("Erro ao carregar dados complementares:", e);
            // Garantir que o desafio apareça mesmo em caso de erro
            const fallbackChallenge = await fetchGlobalChallenge();
            if (fallbackChallenge) setChallenges([fallbackChallenge]);
          }

          // Registrar atividade
          checkAndLogActivity(session.user.id);
          
          // Verificar se deve mostrar Inspiração Diária
          const lastSeen = localStorage.getItem('espiritualizei_daily_inspiration_date');
          const today = new Date().toDateString();
          if (lastSeen !== today) {
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
        }
      } else {
        // Sem sessão, verificar URL
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
     setIntentions([]);
     setChallenges([]);
  };

  // Handler para atualização de usuário com persistência garantida
  const handleUpdateUser = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    await updateUserProfile(updatedUser);
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
      case Tab.DASHBOARD: 
        return (
          <Suspense fallback={<TabLoader />}>
            <Dashboard 
              user={user} 
              myIntentions={intentions.filter(i => i.author === user.name)} 
              routineItems={routineItems} 
              onNavigateToCommunity={(tab) => { setCurrentTab(Tab.COMMUNITY); }} 
              onNavigateToRoutine={() => setCurrentTab(Tab.ROUTINE)} 
              onNavigateToKnowledge={() => setCurrentTab(Tab.KNOWLEDGE)} 
              onNavigateToProfile={() => setCurrentTab(Tab.PROFILE)} 
              onNavigateToSocial={() => setCurrentTab(Tab.SOCIAL)} 
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
              onToggle={async (id) => { 
                const item = routineItems.find(i => i.id === id); 
                if (item) { 
                  const newStatus = !item.completed; 
                  setRoutineItems(prev => prev.map(i => i.id === id ? { ...i, completed: newStatus } : i)); 
                  await toggleRoutineItemStatus(id, newStatus); 
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
                setRoutineItems(prev => [...prev, newItem]); 
                await addRoutineItem(user.id, newItem); 
              }} 
              onDelete={async (id) => { 
                setRoutineItems(prev => prev.filter(i => i.id !== id)); 
                await deleteRoutineItem(id); 
              }} 
              onNavigate={setCurrentTab} 
            />
          </Suspense>
        );
        
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
              onJoinChallenge={async (id, amount) => { 
                setChallenges(prev => prev.map(c => c.id === id ? { ...c, isUserParticipating: true, participants: c.participants + 1 } : c));
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
        return <Suspense fallback={<TabLoader />}><SocialHub user={user} /></Suspense>;
        
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
      
      {viewState === 'app' && <div className="flex-shrink-0 hidden md:block h-full"><Sidebar currentTab={currentTab} onTabChange={setCurrentTab} user={user} onLogout={handleLogout} /></div>}
      
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-brand-dark no-scrollbar">
          {viewState === 'landing' && (
            <Suspense fallback={<TabLoader />}>
              <LandingPage onStart={() => setViewState('onboarding')} onLogin={() => setViewState('login')} />
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
              onRegister={() => setViewState('onboarding')} 
              onBack={() => setViewState('landing')} 
            />
          )}
          
          {viewState === 'onboarding' && (
            <Suspense fallback={<TabLoader />}>
              <Onboarding 
                onComplete={async (data) => { 
                  setViewState('generating');
                  try {
                    const session = await registerUser(data);
                    if (session && session.user) {
                      setUser(session.user);
                      
                      // Gerar rotina inicial baseada nos dados do onboarding
                      const result = await generateSpiritualRoutine(data);
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
                      errorMessage = `Erro: ${e.message}`;
                    }
                    
                    alert(errorMessage);
                  }
                }} 
                onBack={() => setViewState('landing')} 
              />
            </Suspense>
          )}
          
          {viewState === 'generating' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-brand-dark">
              <div className="w-24 h-24 bg-brand-violet/20 rounded-full flex items-center justify-center mb-8 animate-pulse-slow">
                <BrandLogo size={64} variant="fill" className="text-brand-violet" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Preparando sua Jornada...</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-12">Nossa inteligência está analisando seu perfil para criar uma rotina única e equilibrada.</p>
              <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-violet animate-progress-loading" />
              </div>
            </div>
          )}
          
          {viewState === 'checkout' && <Checkout onSuccess={() => setViewState('welcome_premium')} userName={user.name} onLogout={handleLogout} />}
          
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
          
          {viewState === 'app' && renderContent()}
      </main>

      {viewState === 'app' && <div className="md:hidden"><Navigation currentTab={currentTab} onTabChange={setCurrentTab} /></div>}
      
      {showTutorial && <Tutorial user={user} onComplete={() => {
        setShowTutorial(false);
        // Verificar se já pediu permissão de notificação
        const notificationAsked = localStorage.getItem(`notification_asked_${user.id}`);
        if (!notificationAsked && 'Notification' in window && Notification.permission === 'default') {
          setTimeout(() => setShowNotificationModal(true), 1000);
        }
      }} />}
      {showDailyInspiration && <DailyInspiration userName={user.name} onClose={() => setShowDailyInspiration(false)} />}
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
          onLogin={(success) => {
            if (success) {
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
          onLogout={() => {
            clearAdminSession();
            window.history.pushState({}, '', '/');
            setViewState('landing');
          }}
        />
      )}
    </div>
  );
};

export default App;
