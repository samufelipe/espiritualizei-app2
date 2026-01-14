
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, LiturgyDay, PrayerIntention, RoutineItem, CommunityPost } from '../types';
import { Flame, Sun, BookOpen, Heart, Sunrise, Moon, X, CheckCircle2, Compass, ArrowRight, Settings2, Eye, EyeOff, Calendar, Bell, MapPin, Check, ChevronDown, RefreshCw, Sparkles, LayoutGrid, Share2, Send, LogOut, MessageSquare, Shield, Users, MessageCircle, HeartHandshake, GraduationCap, Quote, Loader2 } from 'lucide-react';
import { generateDailyTheme, cleanAIOutput } from '../services/geminiService';
import { fetchRealDailyLiturgy } from '../services/liturgyService';
import { fetchCommunityPosts } from '../services/databaseService';
import NotificationCenter from './NotificationCenter';
import { ContactModal } from './LegalModals';
import BrandLogo from './BrandLogo';

interface DashboardProps {
  user: UserProfile;
  myIntentions: PrayerIntention[];
  routineItems?: RoutineItem[]; 
  onToggleRoutine?: (id: string) => void;
  onNavigateToCommunity: (initialTab?: 'mural' | 'feed') => void;
  onNavigateToRoutine: () => void; 
  onNavigateToKnowledge: () => void;
  onNavigateToProfile: () => void;
  onNavigateToMaps: () => void;
  onSaveJournal: (mood: string, content: string, reflection?: string, verse?: string) => void;
  showLiturgyModal: boolean;
  setShowLiturgyModal: (show: boolean) => void;
  onLogout: () => void;
  onOpenIntentionModal: () => void;
}

type WidgetId = 'liturgyHero' | 'prayerIncentives' | 'communityPreview' | 'quickActions' | 'progressSummary' | 'sacramentAlert';

interface WidgetConfig {
  id: WidgetId;
  isVisible: boolean;
}

const DEFAULT_WIDGET_ORDER: WidgetConfig[] = [
  { id: 'sacramentAlert', isVisible: true },
  { id: 'liturgyHero', isVisible: true },
  { id: 'prayerIncentives', isVisible: true },
  { id: 'communityPreview', isVisible: true },
  { id: 'progressSummary', isVisible: true },
  { id: 'quickActions', isVisible: true },
];

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  myIntentions, 
  routineItems = [],
  onToggleRoutine,
  onNavigateToCommunity, 
  onNavigateToRoutine, 
  onNavigateToKnowledge, 
  onNavigateToProfile,
  onNavigateToMaps,
  showLiturgyModal,
  setShowLiturgyModal,
  onLogout,
  onOpenIntentionModal
}) => {
  const [dailyTheme, setDailyTheme] = useState<string>('Buscai as coisas do alto.');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isLiturgyLoading, setIsLiturgyLoading] = useState(true);
  
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets_v8'); 
    return saved ? JSON.parse(saved) : DEFAULT_WIDGET_ORDER;
  });
  
  const [liturgyData, setLiturgyData] = useState<LiturgyDay | null>(null);
  const [activeLiturgyTab, setActiveLiturgyTab] = useState<'first' | 'psalm' | 'second' | 'gospel'>('gospel');
  
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let isMounted = true;
    const loadData = async () => {
        setIsLiturgyLoading(true);
        try {
            const realLiturgy = await fetchRealDailyLiturgy();
            if (isMounted) {
                setLiturgyData(realLiturgy);
                setActiveLiturgyTab('gospel');
                setIsLiturgyLoading(false);
                
                const theme = await generateDailyTheme(realLiturgy.readings.gospel.text);
                if (isMounted && theme) setDailyTheme(cleanAIOutput(theme));
            }
        } catch (e) {
            console.error("Erro ao carregar liturgia:", e);
            if (isMounted) setIsLiturgyLoading(false);
        }
        
        // Fetch last 3 posts
        const posts = await fetchCommunityPosts(0, 3);
        if (isMounted) {
            setRecentPosts(posts);
            setLoadingPosts(false);
        }
    };
    loadData();
    
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
    
    return () => { isMounted = false; };
  }, []);

  const greeting = (() => {
    switch(timeOfDay) {
      case 'morning': return { text: 'Bom dia', icon: Sunrise };
      case 'afternoon': return { text: 'Boa tarde', icon: Sun };
      case 'evening': return { text: 'Boa noite', icon: Moon };
    }
  })();

  const style = (() => {
     const color = liturgyData?.liturgicalColor?.toLowerCase() || '';
     if (color.includes('verde')) return { gradient: 'bg-gradient-to-br from-[#059669] to-[#022C22]', meaning: 'Esperança.', text: 'text-emerald-100' };
     if (color.includes('vermelho')) return { gradient: 'bg-gradient-to-br from-[#DC2626] to-[#7F1D1D]', meaning: 'Fogo do Espírito.', text: 'text-red-100' };
     if (color.includes('branco')) return { gradient: 'bg-gradient-to-br from-[#D97706] to-[#78350F]', meaning: 'Glória.', text: 'text-amber-100' };
     return { gradient: 'bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]', meaning: 'Conversão.', text: 'text-purple-100' };
  })();

  const handleShareApp = () => {
    const text = encodeURIComponent("Olá! Queria te convidar para conhecer o Espiritualizei, um app incrível que está me ajudando muito a organizar minha rotina de oração e vida espiritual. 💜\n\nConheça aqui: https://espiritualizei.vercel.app");
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const renderSacramentAlert = () => {
    if (!user.lastConfessionAt && user.confessionFrequency !== 'never') return null;
    const diff = user.lastConfessionAt ? Math.floor((new Date().getTime() - new Date(user.lastConfessionAt).getTime()) / (1000 * 60 * 60 * 24)) : 99;
    
    if (diff < 30 && user.confessionFrequency !== 'never') return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex items-center gap-4 animate-slide-up mb-6 group cursor-pointer hover:bg-white/10 transition-all" onClick={onNavigateToMaps}>
            <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Shield size={24} />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Vida Sacramental</p>
                <h4 className="text-sm font-bold text-white leading-tight">Que tal o abraço da Misericórdia?</h4>
                <p className="text-[11px] text-slate-500 mt-1">Busque um horário de confissão próximo a você.</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-violet group-hover:text-white transition-all">
                <ArrowRight size={16} />
            </div>
        </div>
    );
  };

  const renderPrayerIncentives = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button 
            onClick={() => onNavigateToCommunity('mural')}
            className="bg-white dark:bg-[#1A1F26] p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm text-left group hover:border-brand-violet/30 transition-all overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><Flame size={80} /></div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Flame size={20} fill="currentColor" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Intercessão</span>
            </div>
            <h4 className="text-sm font-bold text-brand-dark dark:text-white mb-1">Já rezou por alguém hoje?</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">A caridade é o combustível da fé. Entre no mural e interceda por um irmão.</p>
        </button>

        <button 
            onClick={onOpenIntentionModal}
            className="bg-brand-violet p-5 rounded-[2rem] shadow-lg shadow-brand-violet/20 text-left group hover:scale-[1.02] transition-all overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-4 opacity-[0.1] group-hover:opacity-[0.2] transition-opacity"><HeartHandshake size={80} /></div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center"><Heart size={20} fill="currentColor" /></div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Fraternidade</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Peça oração por sua vida</h4>
            <p className="text-[11px] text-purple-100 leading-relaxed">Ninguém caminha sozinho. Partilhe sua luta e deixe a comunidade rezar por você.</p>
        </button>
    </div>
  );

  const renderCommunityPreview = () => (
    <div className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-white/5 shadow-card mb-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white flex items-center gap-2"><Users size={20} className="text-brand-violet" /> Vida em Fraternidade</h3>
                <p className="text-xs text-slate-500">Veja as graças e partilhas da nossa família de fé</p>
            </div>
            <button onClick={() => onNavigateToCommunity('feed')} className="text-xs font-bold text-brand-violet hover:underline flex items-center gap-1">Ver tudo <ArrowRight size={14} /></button>
        </div>

        {loadingPosts ? (
            <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-white/5 rounded-2xl" />)}
            </div>
        ) : recentPosts.length === 0 ? (
            <div className="text-center py-10 opacity-60">
                <MessageCircle size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">Seja o primeiro a postar um testemunho!</p>
            </div>
        ) : (
            <div className="space-y-4">
                {recentPosts.map((post, idx) => (
                    <div key={post.id} onClick={() => onNavigateToCommunity('feed')} className="flex gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 group">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                            {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand-dark dark:text-white mb-0.5">{post.userName}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 italic">"{post.content}"</p>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Heart size={10} /> {post.likesCount}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><MessageSquare size={10} /> {post.commentsCount}</span>
                            </div>
                        </div>
                        {post.imageUrl && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/10">
                                <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const liturgyTabs = ['first', 'psalm', 'second', 'gospel'].filter(tab => {
    if (tab === 'second') return !!liturgyData?.readings.second;
    return true;
  });

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'first': return '1ª Leitura';
      case 'psalm': return 'Salmo';
      case 'second': return '2ª Leitura';
      case 'gospel': return 'Evangelho';
      default: return '';
    }
  };

  return (
    <div className="p-4 md:p-8 pb-32 space-y-6 animate-fade-in font-sans min-h-screen relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNavigateToProfile}> 
          <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-white/20 shadow-sm overflow-hidden transition-all group-hover:border-brand-violet p-0.5">
             {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center bg-brand-dark text-white rounded-full font-bold">{user.name.charAt(0)}</div>}
          </div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><greeting.icon size={10} /> {greeting.text}</p><p className="text-lg font-bold text-brand-dark dark:text-white leading-none group-hover:text-brand-violet transition-colors">{user.name.split(' ')[0]}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/10 hover:text-brand-violet transition-colors"><Bell size={20} strokeWidth={1.5} /></button>
          <button onClick={() => setIsCustomizing(!isCustomizing)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${isCustomizing ? 'bg-brand-violet text-white' : 'text-slate-400 border-slate-200 dark:border-white/10'}`}>{isCustomizing ? <CheckCircle2 size={20} /> : <Settings2 size={20} />}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-8 flex flex-col gap-6">
            {widgetConfig.find(w => w.id === 'sacramentAlert')?.isVisible && renderSacramentAlert()}
            {widgetConfig.find(w => w.id === 'liturgyHero')?.isVisible && (
                <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl ${style.gradient} p-6 md:p-8 text-white flex flex-col justify-between group transition-all duration-500 min-h-[260px]`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div><div className="flex items-center gap-2 mb-1 opacity-90"><Calendar size={14} /><span className="text-xs font-bold uppercase tracking-widest">{liturgyData ? liturgyData.date.split(',')[0] : 'Hoje'}</span></div>
                            {liturgyData?.season && <h2 className="text-2xl font-bold">{liturgyData.season}</h2>}</div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center mb-6">
                            <p className="font-serif text-2xl sm:text-3xl leading-tight mb-4 drop-shadow-md">"{dailyTheme}"</p>
                        </div>
                        <button onClick={() => setShowLiturgyModal(true)} className="w-full bg-white/95 text-brand-dark py-4 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-between group/btn">
                            <span className="flex items-center gap-2"><BookOpen size={18} className="text-brand-violet"/> Ler Evangelho de Hoje</span>
                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-all" />
                        </button>
                    </div>
                </div>
            )}
            
            {widgetConfig.find(w => w.id === 'prayerIncentives')?.isVisible && renderPrayerIncentives()}
            
            {widgetConfig.find(w => w.id === 'communityPreview')?.isVisible && renderCommunityPreview()}
         </div>

         <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl min-h-[240px] flex flex-col justify-between group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
               <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12"><BookOpen size={100} /></div>
               <div>
                  <div className="flex items-center gap-2 mb-3">
                     <Quote size={16} className="text-purple-200 fill-current" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-200">"Ninguém ama o que não conhece"</span>
                  </div>
                  <h3 className="font-black text-2xl mb-2 tracking-tight">Conhecer para Amar</h3>
                  <p className="text-purple-100 text-xs leading-relaxed font-medium opacity-90">O amor a Deus passa pela compreensão. Mergulhe nos tesouros da Igreja e descubra a beleza escondida em cada mistério da nossa fé.</p>
               </div>
               <button onClick={onNavigateToKnowledge} className="w-full bg-white text-brand-violet font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 mt-6 shadow-xl group-hover:scale-[1.03] transition-all active:scale-95"><BookOpen size={14} fill="currentColor" /> Abrir Biblioteca</button>
            </div>
            
            <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Users size={18} /></div>
                    <span className="text-xs font-bold text-brand-dark dark:text-white">Convide um amigo</span>
                </div>
                <p className="text-[11px] text-slate-500">A fé cresce quando é partilhada. Traga alguém para caminhar com você no Espiritualizei.</p>
                <button onClick={handleShareApp} className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"><Share2 size={12} /> Compartilhar App</button>
            </div>
         </div>
      </div>

      {showLiturgyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md" onClick={() => setShowLiturgyModal(false)} />
          <div className="relative w-full max-w-lg h-[85vh] bg-[#FFFCF5] dark:bg-brand-dark rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10 animate-slide-up">
            
            <div className="p-5 border-b flex justify-between items-center shrink-0">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Liturgia Diária</p>
                    <h3 className="text-sm font-bold">
                        {isLiturgyLoading ? "Carregando..." : (liturgyData?.saint || "Leituras do Dia")}
                    </h3>
                </div>
                <button onClick={() => setShowLiturgyModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <X size={20} />
                </button>
            </div>

            {isLiturgyLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-brand-violet/20 border-t-brand-violet animate-spin" />
                        <BrandLogo size={24} variant="fill" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-violet opacity-50" />
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Preparando a mesa</p>
                        <p className="text-slate-400 text-xs italic">"Nem só de pão vive o homem..."</p>
                    </div>
                </div>
            ) : liturgyData ? (
                <>
                    <div className="flex bg-slate-50 dark:bg-black/20 p-1 shrink-0">
                    {liturgyTabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveLiturgyTab(tab as any)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeLiturgyTab === tab ? 'bg-white dark:bg-white/10 text-brand-violet' : 'text-slate-400'}`}>
                        {getTabLabel(tab)}
                        </button>
                    ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="prose prose-lg dark:prose-invert mx-auto">
                            <div className="text-center mb-8">
                                <p className="italic text-slate-500 text-sm">
                                    {activeLiturgyTab === 'first' && liturgyData.readings.first.ref}
                                    {activeLiturgyTab === 'psalm' && liturgyData.readings.psalm.ref}
                                    {activeLiturgyTab === 'second' && liturgyData.readings.second?.ref}
                                    {activeLiturgyTab === 'gospel' && liturgyData.readings.gospel.ref}
                                </p>
                            </div>
                            <div className="font-sans text-lg leading-loose text-justify whitespace-pre-line text-slate-800 dark:text-slate-200">
                                {activeLiturgyTab === 'first' && cleanAIOutput(liturgyData.readings.first.text)}
                                {activeLiturgyTab === 'psalm' && cleanAIOutput(liturgyData.readings.psalm.text)}
                                {activeLiturgyTab === 'second' && liturgyData.readings.second && cleanAIOutput(liturgyData.readings.second.text)}
                                {activeLiturgyTab === 'gospel' && cleanAIOutput(liturgyData.readings.gospel.text)}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-white/5 border-t shrink-0">
                        <button onClick={() => setShowLiturgyModal(false)} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} /> Concluir Leitura
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <p className="text-red-400 font-bold mb-2">Erro de conexão</p>
                    <p className="text-slate-500 text-sm mb-6">Não conseguimos buscar a liturgia agora.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-100 dark:bg-white/10 rounded-xl text-xs font-bold text-slate-400">Tentar Recarregar</button>
                </div>
            )}
          </div>
        </div>
      )}

      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
    </div>
  );
};

export default Dashboard;
