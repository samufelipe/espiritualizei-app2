
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, LiturgyDay, PrayerIntention, RoutineItem } from '../types';
import { Flame, Sun, BookOpen, Heart, Sunrise, Moon, X, CheckCircle2, Compass, ArrowRight, Settings2, Eye, EyeOff, Calendar, Bell, MapPin, Check, ChevronDown, RefreshCw, Sparkles, LayoutGrid, Share2, Send, LogOut, MessageSquare, Shield } from 'lucide-react';
import { generateDailyTheme, cleanAIOutput } from '../services/geminiService';
import { fetchRealDailyLiturgy } from '../services/liturgyService';
import NotificationCenter from './NotificationCenter';
import { ContactModal } from './LegalModals';
import BrandLogo from './BrandLogo';

interface DashboardProps {
  user: UserProfile;
  myIntentions: PrayerIntention[];
  routineItems?: RoutineItem[]; 
  onToggleRoutine?: (id: string) => void;
  onNavigateToCommunity: () => void;
  onNavigateToRoutine: () => void; 
  onNavigateToKnowledge: () => void;
  onNavigateToProfile: () => void;
  onNavigateToMaps: () => void;
  onSaveJournal: (mood: string, content: string, reflection?: string, verse?: string) => void;
  showLiturgyModal: boolean;
  setShowLiturgyModal: (show: boolean) => void;
  onLogout: () => void;
}

type WidgetId = 'liturgyHero' | 'quickActions' | 'progressSummary' | 'intentions' | 'invite' | 'sacramentAlert';

interface WidgetConfig {
  id: WidgetId;
  isVisible: boolean;
}

const DEFAULT_WIDGET_ORDER: WidgetConfig[] = [
  { id: 'sacramentAlert', isVisible: true },
  { id: 'liturgyHero', isVisible: true },
  { id: 'progressSummary', isVisible: true },
  { id: 'quickActions', isVisible: true },
  { id: 'intentions', isVisible: true },
  { id: 'invite', isVisible: true },
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
  onLogout
}) => {
  const [dailyTheme, setDailyTheme] = useState<string>('Buscai as coisas do alto.');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets_v7'); 
    return saved ? JSON.parse(saved) : DEFAULT_WIDGET_ORDER;
  });
  
  const [liturgyData, setLiturgyData] = useState<LiturgyDay | null>(null);
  const [activeLiturgyTab, setActiveLiturgyTab] = useState<'first' | 'psalm' | 'second' | 'gospel'>('gospel');
  
  const hasLoadedRef = useRef(false);

  // Lógica Sacramento Alert Refinada (Inovação C)
  const showConfessionAlert = () => {
    // Se o usuário nunca se confessou ou faz muito tempo, o alerta é um "convite" suave
    if (user.confessionFrequency === 'never' || user.confessionFrequency === 'long_time') return true;
    
    // Se ele tem hábito, avisamos após 30 dias
    if (!user.lastConfessionAt) return true;
    const diff = Math.floor((new Date().getTime() - new Date(user.lastConfessionAt).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 30;
  };

  const today = new Date().getDay();
  const todaysTasks = routineItems.filter(i => i.dayOfWeek.includes(today));
  const nextTask = todaysTasks.filter(i => !i.completed).sort((a, b) => {
    const order = { morning: 1, afternoon: 2, night: 3, any: 4 };
    return order[a.timeOfDay as keyof typeof order] - order[b.timeOfDay as keyof typeof order];
  })[0];

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let isMounted = true;
    const loadData = async () => {
        const realLiturgy = await fetchRealDailyLiturgy();
        if (isMounted) {
            setLiturgyData(realLiturgy);
            setActiveLiturgyTab('gospel');
        }
        const theme = await generateDailyTheme(realLiturgy.readings.gospel.text);
        if (isMounted && theme) setDailyTheme(cleanAIOutput(theme));
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

  const renderSacramentAlert = () => {
    if (!showConfessionAlert()) return null;
    const isNewcomer = user.confessionFrequency === 'never' || user.confessionFrequency === 'long_time';

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex items-center gap-4 animate-slide-up mb-6 group cursor-pointer hover:bg-white/10 transition-all" onClick={onNavigateToMaps}>
            <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Shield size={24} />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Vida Sacramental</p>
                <h4 className="text-sm font-bold text-white leading-tight">
                    {isNewcomer ? "Que tal conhecer a alegria da Confissão?" : "Faz tempo que você não se confessa."}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">Busque um horário na paróquia mais próxima.</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-violet group-hover:text-white transition-all">
                <ArrowRight size={16} />
            </div>
        </div>
    );
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
         </div>
         <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-5 shadow-card border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
               <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet"><Sparkles size={24}/></div><div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Próximo Passo</p><p className="text-sm font-bold text-brand-dark dark:text-white truncate max-w-[150px]">{nextTask ? nextTask.title : "Tudo feito!"}</p></div></div>
               {nextTask && <button onClick={() => onToggleRoutine?.(nextTask.id)} className="w-10 h-10 bg-brand-violet/10 text-brand-violet rounded-full flex items-center justify-center"><Check size={20} /></button>}
            </div>
            <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl min-h-[200px] flex flex-col justify-between">
               <div><h3 className="font-bold text-lg mb-2">Aprenda a Fé</h3><p className="text-purple-100 text-xs leading-relaxed opacity-90">Acesse nossa biblioteca para entender mais sobre a Missa e os Santos.</p></div>
               <button onClick={onNavigateToKnowledge} className="w-full bg-white text-brand-violet font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-4"><BookOpen size={14} /> Ir para Biblioteca</button>
            </div>
         </div>
      </div>

      {showLiturgyModal && liturgyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md" onClick={() => setShowLiturgyModal(false)} />
          <div className="relative w-full max-w-lg h-[85vh] bg-[#FFFCF5] dark:bg-brand-dark rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10 animate-slide-up">
            <div className="p-5 border-b flex justify-between items-center"><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Liturgia Diária</p><h3 className="text-sm font-bold">{liturgyData.saint || "Leituras do Dia"}</h3></div><button onClick={() => setShowLiturgyModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"><X size={20} /></button></div>
            <div className="flex bg-slate-50 dark:bg-black/20 p-1">{['first', 'psalm', 'second', 'gospel'].map((tab) => <button key={tab} onClick={() => setActiveLiturgyTab(tab as any)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${activeLiturgyTab === tab ? 'bg-white dark:bg-white/10 text-brand-violet' : 'text-slate-400'}`}>{tab === 'gospel' ? 'Evangelho' : tab === 'psalm' ? 'Salmo' : 'Leitura'}</button>)}</div>
            <div className="flex-1 overflow-y-auto p-8"><div className="prose prose-lg dark:prose-invert mx-auto"><div className="text-center mb-8"><p className="italic text-slate-500 text-sm">
                {activeLiturgyTab === 'first' && liturgyData.readings.first.ref}
                {activeLiturgyTab === 'psalm' && liturgyData.readings.psalm.ref}
                {activeLiturgyTab === 'gospel' && liturgyData.readings.gospel.ref}
            </p></div><div className="font-sans text-lg leading-loose text-justify whitespace-pre-line">
                {activeLiturgyTab === 'first' && cleanAIOutput(liturgyData.readings.first.text)}
                {activeLiturgyTab === 'psalm' && cleanAIOutput(liturgyData.readings.psalm.text)}
                {activeLiturgyTab === 'gospel' && cleanAIOutput(liturgyData.readings.gospel.text)}
            </div></div></div>
            <div className="p-6 bg-white dark:bg-white/5 border-t"><button onClick={() => setShowLiturgyModal(false)} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Concluir Leitura</button></div>
          </div>
        </div>
      )}

      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
    </div>
  );
};

export default Dashboard;
