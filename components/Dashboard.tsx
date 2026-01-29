
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, LiturgyDay, PrayerIntention, RoutineItem, CommunityPost } from '../types';
import { Flame, Sun, BookOpen, Heart, Sunrise, Moon, X, CheckCircle2, Compass, ArrowRight, Settings2, Eye, EyeOff, Calendar, Bell, MapPin, Check, ChevronDown, RefreshCw, Sparkles, LayoutGrid, Share2, Send, LogOut, MessageSquare, Shield, Users, MessageCircle, HeartHandshake, GraduationCap, Quote, Loader2, Crown } from 'lucide-react';
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
  onNavigateToCommunity: (initialTab?: 'comunidade' | 'feed') => void;
  onNavigateToRoutine: () => void; 
  onNavigateToKnowledge: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSocial: () => void;
  onSaveJournal: (mood: string, content: string, reflection?: string, verse?: string) => void;
  showLiturgyModal: boolean;
  setShowLiturgyModal: (show: boolean) => void;
  onLogout: () => void;
  onOpenIntentionModal: () => void;
  onUpdateUser: (u: UserProfile) => void;
}

type WidgetId = 'liturgyHero' | 'prayerIncentives' | 'communityPreview' | 'quickActions' | 'progressSummary';

interface WidgetConfig {
  id: WidgetId;
  isVisible: boolean;
}

const DEFAULT_WIDGET_ORDER: WidgetConfig[] = [
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
  onNavigateToSocial,
  showLiturgyModal,
  setShowLiturgyModal,
  onLogout,
  onOpenIntentionModal,
  onUpdateUser
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
    const saved = localStorage.getItem('dashboard_widgets_v9'); 
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

  const getConfessionStatus = () => {
    if (!user.lastConfessionAt) return { days: null, label: 'Não registrado', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    const last = new Date(user.lastConfessionAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff <= 15) return { days: diff, label: 'Alma em paz', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (diff <= 30) return { days: diff, label: 'Vigilância necessária', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { days: diff, label: 'Busque o Sacramento', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const confession = getConfessionStatus();

  const handleUpdateConfession = async () => {
      const today = new Date();
      const updatedUser = { ...user, lastConfessionAt: today };
      onUpdateUser(updatedUser);
  };

  const style = (() => {
     const color = liturgyData?.liturgicalColor?.toLowerCase() || '';
     if (color.includes('verde')) return { gradient: 'bg-gradient-to-br from-[#059669] to-[#022C22]', meaning: 'Esperança.', text: 'text-emerald-100' };
     if (color.includes('vermelho')) return { gradient: 'bg-gradient-to-br from-[#DC2626] to-[#7F1D1D]', meaning: 'Fogo do Espírito.', text: 'text-red-100' };
     if (color.includes('branco')) return { gradient: 'bg-gradient-to-br from-[#D97706] to-[#78350F]', meaning: 'Glória.', text: 'text-amber-100' };
     return { gradient: 'bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]', meaning: 'Conversão.', text: 'text-purple-100' };
  })();

  const handleShareApp = () => {
    const text = encodeURIComponent("Olá! Queria te convidar para conhecer o Espiritualizei, um app incrível que está me ajudando muito a organizar minha jornada diária e vida espiritual. 💜\n\nConheça aqui: https://www.espiritualizei.com/");
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const renderPrayerIncentives = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button 
            onClick={() => onNavigateToCommunity('comunidade')}
            className="bg-white dark:bg-[#1A1F26] p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm text-left group hover:border-brand-violet/30 transition-all overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><Flame size={80} /></div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Flame size={20} fill="currentColor" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Intercessão</span>
            </div>
            <h4 className="text-sm font-bold text-brand-dark dark:text-white mb-1">Já rezou por alguém hoje?</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">A caridade é o combustível da fé. Entre na comunidade e interceda por um irmão.</p>
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
                {recentPosts.map((post) => (
                    <div key={post.id} onClick={() => onNavigateToCommunity('feed')} className="flex gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 group">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                            {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full object-cover" /> : post.userName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-brand-dark dark:text-white truncate">{post.userName}</h4>
                                <span className="text-[9px] text-slate-400 font-medium">{new Date(post.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderLiturgyHero = () => (
    <div className="relative mb-8 group">
        <div className={`absolute inset-0 ${style.gradient} rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />
        <div className={`relative overflow-hidden rounded-[2.5rem] ${style.gradient} p-8 sm:p-10 shadow-2xl shadow-brand-violet/20`}>
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><Compass size={180} /></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Liturgia de Hoje</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tighter leading-tight max-w-xl">
                    "{dailyTheme}"
                </h2>
                
                <p className={`text-sm ${style.text} font-medium mb-8 max-w-md leading-relaxed opacity-90`}>
                    {liturgyData?.liturgicalDay || 'Carregando liturgia...'} • {style.meaning}
                </p>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setShowLiturgyModal(true)}
                        className="bg-white text-brand-dark px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <BookOpen size={18} /> Ler Evangelho
                    </button>
                    <button 
                        onClick={handleShareApp}
                        className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                        <Share2 size={18} /> Convidar Amigo
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderProgressSummary = () => {
    const completed = routineItems.filter(i => i.completed).length;
    const total = routineItems.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-card mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]"><Trophy size={100} /></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-brand-dark dark:text-white">Sua Fidelidade</h3>
                            <p className="text-xs text-slate-500">Você completou {completed} de {total} práticas hoje</p>
                        </div>
                        <span className="text-2xl font-black text-brand-violet">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-brand-violet transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(167,139,250,0.5)]" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>
                <button 
                    onClick={onNavigateToRoutine}
                    className="w-full sm:w-auto bg-slate-50 dark:bg-white/5 hover:bg-brand-violet hover:text-white p-5 rounded-3xl border border-slate-100 dark:border-white/10 transition-all flex items-center justify-center gap-3 group"
                >
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ver Minha</p>
                        <p className="font-bold">Jornada</p>
                    </div>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
            { label: 'Biblioteca', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10', action: onNavigateToKnowledge },
            { label: 'Ranking', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', action: onNavigateToSocial },
            { label: 'Confissão', icon: Shield, color: confession.color, bg: confession.bg, action: handleUpdateConfession },
            { label: 'Suporte', icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-500/10', action: () => setShowContactModal(true) }
        ].map((item, i) => (
            <button 
                key={i}
                onClick={item.action}
                className="bg-white dark:bg-[#1A1F26] p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center text-center gap-3 group"
            >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                </div>
                <span className="text-xs font-bold text-brand-dark dark:text-white">{item.label}</span>
            </button>
        ))}
    </div>
  );

  const renderWidget = (id: WidgetId) => {
    switch(id) {
      case 'liturgyHero': return renderLiturgyHero();
      case 'prayerIncentives': return renderPrayerIncentives();
      case 'communityPreview': return renderCommunityPreview();
      case 'progressSummary': return renderProgressSummary();
      case 'quickActions': return renderQuickActions();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-brand-dark pb-32 animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-brand-dark/80 backdrop-blur-xl px-6 py-6 flex justify-between items-center border-b border-transparent">
        <div className="flex items-center gap-4">
            <div 
                onClick={onNavigateToProfile}
                className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center overflow-hidden border-2 border-white dark:border-white/5 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
                {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-brand-violet font-black text-lg">{user.name.charAt(0)}</span>
                )}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{greeting.text},</p>
                    <greeting.icon size={14} className="text-amber-500" />
                </div>
                <h1 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{user.name.split(' ')[0]}</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowNotifications(true)}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 relative hover:bg-slate-50 transition-colors"
            >
                <Bell size={22} />
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-violet rounded-full border-2 border-white dark:border-brand-dark" />
            </button>
            <button 
                onClick={() => setIsCustomizing(true)}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 transition-colors"
            >
                <LayoutGrid size={22} />
            </button>
        </div>
      </header>

      <main className="px-6 pt-4 max-w-4xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white dark:bg-[#1A1F26] p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                    <Flame size={16} fill="currentColor" />
                    <span className="text-lg font-black">{user.streakDays}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dias</span>
            </div>
            <div className="bg-white dark:bg-[#1A1F26] p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-brand-violet mb-1">
                    <Crown size={16} fill="currentColor" />
                    <span className="text-lg font-black">{user.level}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nível</span>
            </div>
            <div className="bg-white dark:bg-[#1A1F26] p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                    <Sparkles size={16} fill="currentColor" />
                    <span className="text-lg font-black">{user.currentXP}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">XP</span>
            </div>
        </div>

        {/* Widgets Dinâmicos */}
        {widgetConfig.filter(w => w.isVisible).map(w => (
            <div key={w.id} className="animate-fade-in">
                {renderWidget(w.id)}
            </div>
        ))}

        {/* Footer Info */}
        <div className="mt-12 mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
                <Shield size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Doutrina 100% Católica</span>
            </div>
        </div>
      </main>

      {/* Modais */}
      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} userId={user.id} />}
      
      {isCustomizing && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md animate-fade-in" onClick={() => setIsCustomizing(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-brand-dark rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-slide-up border border-white/10">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Personalizar Início</h3>
                    <button onClick={() => setIsCustomizing(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500"><X size={20} /></button>
                </div>
                <div className="space-y-4 mb-10">
                    {widgetConfig.map((w, idx) => (
                        <div key={w.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-brand-violet shadow-sm">
                                    <LayoutGrid size={20} />
                                </div>
                                <span className="font-bold text-brand-dark dark:text-white">
                                    {w.id === 'liturgyHero' && 'Liturgia de Hoje'}
                                    {w.id === 'prayerIncentives' && 'Incentivos de Oração'}
                                    {w.id === 'communityPreview' && 'Prévia da Comunidade'}
                                    {w.id === 'progressSummary' && 'Resumo de Progresso'}
                                    {w.id === 'quickActions' && 'Ações Rápidas'}
                                </span>
                            </div>
                            <button 
                                onClick={() => {
                                    const newConfig = [...widgetConfig];
                                    newConfig[idx].isVisible = !newConfig[idx].isVisible;
                                    setWidgetConfig(newConfig);
                                    localStorage.setItem('dashboard_widgets_v9', JSON.stringify(newConfig));
                                }}
                                className={`w-14 h-8 rounded-full transition-all relative ${w.isVisible ? 'bg-brand-violet' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${w.isVisible ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setIsCustomizing(false)} className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark py-5 rounded-2xl font-black text-lg shadow-xl">Salvar Alterações</button>
            </div>
        </div>
      )}

      {showLiturgyModal && liturgyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
            <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowLiturgyModal(false)} />
            <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-brand-dark sm:rounded-[3rem] flex flex-col overflow-hidden animate-slide-up border border-white/10">
                <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
                    <div>
                        <h3 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Liturgia Diária</h3>
                        <p className="text-xs text-slate-500 font-medium">{liturgyData.liturgicalDay}</p>
                    </div>
                    <button onClick={() => setShowLiturgyModal(false)} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500"><X size={24} /></button>
                </div>
                
                <div className="flex p-2 bg-slate-50 dark:bg-black/20 gap-1">
                    {[
                        { id: 'first', label: '1ª Leitura' },
                        { id: 'psalm', label: 'Salmo' },
                        { id: 'second', label: '2ª Leitura', hidden: !liturgyData.readings.secondReading },
                        { id: 'gospel', label: 'Evangelho' }
                    ].filter(t => !t.hidden).map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveLiturgyTab(tab.id as any)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLiturgyTab === tab.id ? 'bg-white dark:bg-brand-violet text-brand-violet dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    <div className="max-w-prose mx-auto">
                        <p className="text-[10px] font-black text-brand-violet uppercase tracking-[0.3em] mb-4">
                            {activeLiturgyTab === 'first' && liturgyData.readings.firstReading.reference}
                            {activeLiturgyTab === 'psalm' && liturgyData.readings.psalm.reference}
                            {activeLiturgyTab === 'second' && liturgyData.readings.secondReading?.reference}
                            {activeLiturgyTab === 'gospel' && liturgyData.readings.gospel.reference}
                        </p>
                        <div className="prose dark:prose-invert prose-slate max-w-none">
                            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap italic">
                                {activeLiturgyTab === 'first' && liturgyData.readings.firstReading.text}
                                {activeLiturgyTab === 'psalm' && liturgyData.readings.psalm.text}
                                {activeLiturgyTab === 'second' && liturgyData.readings.secondReading?.text}
                                {activeLiturgyTab === 'gospel' && liturgyData.readings.gospel.text}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
                    <button onClick={() => setShowLiturgyModal(false)} className="w-full bg-brand-violet text-white py-5 rounded-2xl font-black text-lg shadow-xl">Concluir Leitura</button>
                </div>
            </div>
        </div>
      )}

      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
    </div>
  );
};

export default Dashboard;
