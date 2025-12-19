
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, LiturgyDay, PrayerIntention, RoutineItem } from '../types';
import { Flame, Sun, BookOpen, Heart, Sunrise, Moon, X, CheckCircle2, Compass, ArrowRight, Settings2, Eye, EyeOff, Calendar, Bell, MapPin, Check, ChevronDown, RefreshCw, Sparkles, LayoutGrid, Share2, Send, LogOut } from 'lucide-react';
import { generateDailyReflection, generateDailyTheme, cleanAIOutput } from '../services/geminiService';
import { fetchRealDailyLiturgy } from '../services/liturgyService';
import JournalModal from './JournalModal';
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

type WidgetId = 'liturgyHero' | 'quickActions' | 'progressSummary' | 'intentions' | 'invite';

interface WidgetConfig {
  id: WidgetId;
  isVisible: boolean;
}

const DEFAULT_WIDGET_ORDER: WidgetConfig[] = [
  { id: 'liturgyHero', isVisible: true },
  { id: 'progressSummary', isVisible: true },
  { id: 'quickActions', isVisible: true },
  { id: 'intentions', isVisible: true },
  { id: 'invite', isVisible: true },
];

const WIDGET_LABELS: Record<WidgetId, string> = {
  liturgyHero: 'Liturgia Diária',
  progressSummary: 'Progresso da Rotina',
  quickActions: 'Ferramentas da Alma',
  intentions: 'Minhas Intenções',
  invite: 'Convite / Evangelizar'
};

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
  onSaveJournal,
  showLiturgyModal,
  setShowLiturgyModal,
  onLogout
}) => {
  const [dailyTheme, setDailyTheme] = useState<string>('Tudo posso Naquele que me fortalece.');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets_v6'); 
    return saved ? JSON.parse(saved) : DEFAULT_WIDGET_ORDER;
  });
  
  const [liturgyData, setLiturgyData] = useState<LiturgyDay | null>(null);
  const [activeLiturgyTab, setActiveLiturgyTab] = useState<'first' | 'psalm' | 'second' | 'gospel'>('gospel');
  
  const hasLoadedRef = useRef(false);

  const today = new Date().getDay();
  const todaysTasks = routineItems.filter(i => i.dayOfWeek.includes(today));
  const nextTask = todaysTasks
    .filter(i => !i.completed)
    .sort((a, b) => {
        const order = { morning: 1, afternoon: 2, night: 3, any: 4 };
        return order[a.timeOfDay] - order[b.timeOfDay];
    })[0];

  const completedCount = todaysTasks.filter(i => i.completed).length;
  const totalCount = todaysTasks.length;

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
        if (isMounted && theme) {
            setDailyTheme(cleanAIOutput(theme));
        }
    };
    loadData();
    
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
    
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard_widgets_v6', JSON.stringify(widgetConfig));
  }, [widgetConfig]);

  const getGreeting = () => {
    switch(timeOfDay) {
      case 'morning': return { text: 'Bom dia', icon: Sunrise };
      case 'afternoon': return { text: 'Boa tarde', icon: Sun };
      case 'evening': return { text: 'Boa noite', icon: Moon };
    }
  };

  const firstName = user.name.split(' ')[0];
  const greeting = getGreeting();

  const toggleWidgetVisibility = (id: WidgetId) => {
    setWidgetConfig(prev => prev.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w));
  };

  const resetWidgets = () => {
    setWidgetConfig(DEFAULT_WIDGET_ORDER);
    setIsCustomizing(false);
  };

  const handleShareApp = () => {
    const text = `Olá, tudo bem? A paz! 🙏\n\nConheci um app chamado *Espiritualizei* para organizar minha vida de oração e espiritualidade, lembrei muito de você.\n\nÉ um aplicativo católico incrível que ajuda a ter constância espiritual, com liturgia diária e tem até uma comunidade de oração.\n\nAcho que vale muito a pena você conhecer também 💜\nVou te enviar o link aqui:\n${window.location.origin}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getLiturgyStyle = () => {
     const color = liturgyData?.liturgicalColor?.toLowerCase() || '';
     
     if (color.includes('verde')) return {
        gradient: 'bg-gradient-to-br from-[#059669] to-[#022C22]',
        meaning: 'O Verde (Tempo Comum) simboliza a esperança cristã e o crescimento espiritual na constância do dia a dia.',
        text: 'text-emerald-100'
     };
     if (color.includes('vermelho')) return {
        gradient: 'bg-gradient-to-br from-[#DC2626] to-[#7F1D1D]',
        meaning: 'O Vermelho recorda o fogo do Espírito Santo (Pentecostes) ou o sangue derramado por Cristo e seus mártires.',
        text: 'text-red-100'
     };
     if (color.includes('branco') || color.includes('dourado')) return {
        gradient: 'bg-gradient-to-br from-[#D97706] to-[#78350F]',
        meaning: 'O Branco celebra a pureza, a luz da Ressurreição (Páscoa/Natal) e a glória de Cristo e dos santos não-mártires.',
        text: 'text-amber-100'
     };
     if (color.includes('rosa')) return {
        gradient: 'bg-gradient-to-br from-[#DB2777] to-[#831843]',
        meaning: 'O Rosa marca uma breve pausa de alegria (Domingos Gaudete e Laetare) em meio aos tempos de penitência.',
        text: 'text-pink-100'
     };
     return {
        gradient: 'bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]',
        meaning: 'O Roxo (Advento e Quaresma) nos convida à conversão profunda, à penitência e à espera vigilante pelo Senhor.',
        text: 'text-purple-100'
     };
  };

  const style = getLiturgyStyle();

  const renderLiturgyHero = () => (
    <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl ${style.gradient} p-6 md:p-8 text-white flex flex-col justify-between group transition-all duration-500 min-h-[260px] md:min-h-[280px]`}>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 md:mb-6">
           <div>
              <div className="flex items-center gap-2 mb-1 opacity-90">
                 <Calendar size={14} />
                 <span className="text-xs font-bold uppercase tracking-widest">{liturgyData ? liturgyData.date.split(',')[0] : 'Hoje'}</span>
              </div>
              {liturgyData?.season && (
                 <h2 className="text-2xl font-bold">{liturgyData.season}</h2>
              )}
           </div>
           
           <div className="bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Cor Litúrgica</span>
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center mb-6">
           <p className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight mb-4 drop-shadow-md">
             "{dailyTheme}"
           </p>
           {liturgyData?.saint && (
             <p className="text-sm font-medium opacity-80 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-white/50"></span>
                Memória de {liturgyData.saint}
             </p>
           )}
        </div>

        <div>
           <p className={`text-xs ${style.text} mb-4 font-medium italic opacity-90 border-l-2 border-white/30 pl-3 leading-relaxed`}>
              {style.meaning}
           </p>
           <button 
             onClick={() => setShowLiturgyModal(true)}
             className="w-full bg-white/95 backdrop-blur-sm text-brand-dark py-4 px-6 rounded-2xl font-bold text-sm shadow-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between group/btn"
           >
             <span className="flex items-center gap-2"><BookOpen size={18} className="text-brand-violet"/> Ler Leituras de Hoje</span>
             <ArrowRight size={18} className="text-brand-dark/30 group-hover/btn:text-brand-violet group-hover/btn:translate-x-1 transition-all" />
           </button>
        </div>
      </div>
    </div>
  );

  const renderProgressSummary = () => (
     <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-5 shadow-card border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-white/10" />
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * (totalCount > 0 ? completedCount/totalCount : 0))} className="text-brand-violet transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute text-[10px] font-bold text-brand-dark dark:text-white">{completedCount}/{totalCount}</span>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Próximo Passo</p>
              <p className="text-sm font-bold text-brand-dark dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                 {nextTask ? nextTask.title : "Tudo feito!"}
              </p>
           </div>
        </div>
        
        {nextTask ? (
           <button 
             onClick={() => onToggleRoutine && onToggleRoutine(nextTask.id)}
             className="w-10 h-10 bg-brand-violet/10 text-brand-violet rounded-full flex items-center justify-center hover:bg-brand-violet hover:text-white transition-all active:scale-90"
           >
              <Check size={20} strokeWidth={2.5} />
           </button>
        ) : (
           <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} />
           </div>
        )}
     </div>
  );

  const renderInviteCard = () => (
    <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-brand-violet/20 flex flex-col justify-between h-full min-h-[220px]">
       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
       
       <div className="relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
             <Share2 size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2">Convide amigos</h3>
          <p className="text-purple-100 text-xs leading-relaxed max-w-[90%] opacity-90">
             A fé cresce quando é partilhada. Traga alguém para caminhar com você nesta jornada.
          </p>
       </div>

       <button 
         onClick={handleShareApp}
         className="w-full bg-white text-brand-violet font-bold py-3.5 rounded-xl text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
       >
          <Send size={14} /> Enviar Convite
       </button>
    </div>
  );

  const renderQuickActions = () => (
     <div className="space-y-4">
        <div className="px-1">
           <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <LayoutGrid size={16} className="text-brand-violet" /> Ferramentas da Alma
           </h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-6">
              Recursos para fortalecer sua caminhada diária.
           </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
           <button onClick={onNavigateToRoutine} className="bg-white dark:bg-[#1A1F26] p-4 rounded-[1.8rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 hover:border-brand-violet/30 transition-all shadow-card group">
              <div className="text-brand-violet group-hover:scale-110 transition-transform"><CheckCircle2 size={24} strokeWidth={1.5} /></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Minha Rotina</span>
           </button>

           <button onClick={onNavigateToCommunity} className="bg-white dark:bg-[#1A1F26] p-4 rounded-[1.8rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 hover:border-brand-violet/30 transition-all shadow-card group">
              <div className="text-brand-violet group-hover:scale-110 transition-transform"><Heart size={24} strokeWidth={1.5} /></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Intercessão</span>
           </button>

           <button onClick={onNavigateToKnowledge} className="bg-white dark:bg-[#1A1F26] p-4 rounded-[1.8rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 hover:border-brand-violet/30 transition-all shadow-card group">
              <div className="text-brand-violet group-hover:scale-110 transition-transform"><BookOpen size={24} strokeWidth={1.5} /></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Estudar</span>
           </button>

           <button onClick={onNavigateToMaps} className="bg-white dark:bg-[#1A1F26] p-4 rounded-[1.8rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 hover:border-brand-violet/30 transition-all shadow-card group">
              <div className="text-brand-violet group-hover:scale-110 transition-transform"><MapPin size={24} strokeWidth={1.5} /></div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Igrejas</span>
           </button>
        </div>
     </div>
  );

  return (
    <div className="p-4 md:p-8 pb-32 space-y-6 animate-fade-in font-sans bg-transparent transition-colors min-h-screen relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNavigateToProfile}> 
          <div className="w-12 h-12 rounded-full bg-transparent border-2 border-slate-200 dark:border-white/20 shadow-sm overflow-hidden transition-all group-hover:border-brand-violet p-0.5">
             {user.photoUrl ? (
               <img src={user.photoUrl} className="w-full h-full object-cover rounded-full" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-brand-dark dark:bg-white/10 text-white rounded-full font-bold">{user.name.charAt(0)}</div>
             )}
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
               <greeting.icon size={10} /> {greeting.text}
             </p>
             <p className="text-lg font-bold text-brand-dark dark:text-white leading-none group-hover:text-brand-violet transition-colors">{firstName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-slate-400 border border-slate-200 dark:border-white/10 hover:text-brand-violet hover:border-brand-violet transition-colors"
          >
             <Bell size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${isCustomizing ? 'bg-brand-violet text-white border-brand-violet' : 'bg-transparent text-slate-400 border-slate-200 dark:border-white/10 hover:text-brand-dark dark:hover:text-white'}`}
          >
            {isCustomizing ? <CheckCircle2 size={20} strokeWidth={1.5} /> : <Settings2 size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {isCustomizing && (
        <div className="bg-brand-violet/5 border border-brand-violet/10 rounded-2xl p-4 mb-4 animate-slide-up">
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-brand-violet uppercase tracking-widest font-sans">Personalizar Início</span>
              <button onClick={resetWidgets} className="text-[10px] font-bold text-slate-500 hover:text-brand-dark underline font-sans">Restaurar</button>
           </div>
           <div className="flex gap-2 flex-wrap">
              {widgetConfig.map((widget, index) => (
                 <button 
                    key={widget.id} 
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${widget.isVisible ? 'bg-white dark:bg-white/10 text-brand-violet border-brand-violet/30' : 'bg-transparent text-slate-400 border-slate-200 dark:border-white/5 opacity-50'}`}
                 >
                    {widget.isVisible ? <Eye size={12}/> : <EyeOff size={12}/>}
                    <span className="capitalize">{WIDGET_LABELS[widget.id]}</span>
                 </button>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-8 flex flex-col gap-6">
            {widgetConfig.find(w => w.id === 'liturgyHero')?.isVisible && renderLiturgyHero()}
            <div className="hidden md:block">
               {widgetConfig.find(w => w.id === 'quickActions')?.isVisible && renderQuickActions()}
            </div>
         </div>

         <div className="md:col-span-4 flex flex-col gap-6">
            {widgetConfig.find(w => w.id === 'progressSummary')?.isVisible && renderProgressSummary()}
            
            {widgetConfig.find(w => w.id === 'intentions')?.isVisible && (
                <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-5 shadow-card border border-slate-100 dark:border-white/5 flex-1 min-h-[180px]">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Flame size={14} className="text-brand-violet"/> Minhas Intenções</p>
                        <button onClick={onNavigateToCommunity} className="text-xs font-bold text-brand-violet hover:underline">Ver todas</button>
                    </div>
                    <div className="space-y-3">
                        {myIntentions.slice(0, 2).map(i => (
                            <div key={i.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[70%]">{i.content}</span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Flame size={12}/> {i.prayingCount}</span>
                            </div>
                        ))}
                        {myIntentions.length === 0 && <p className="text-xs text-slate-400 text-center italic py-4">Nenhuma intenção ativa.</p>}
                    </div>
                </div>
            )}

            {widgetConfig.find(w => w.id === 'invite')?.isVisible && renderInviteCard()}
         </div>

         <div className="md:hidden col-span-1">
            {widgetConfig.find(w => w.id === 'quickActions')?.isVisible && renderQuickActions()}
         </div>
      </div>

      <div className="md:hidden mt-8 border-t border-slate-100 dark:border-white/5 pt-6">
         <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/20"
         >
            <LogOut size={16} /> Sair do app
         </button>
         <p className="text-center text-[10px] text-slate-400 mt-4">Espiritualizei v2.5</p>
      </div>

      {showLiturgyModal && liturgyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={() => setShowLiturgyModal(false)} />
          <div className="relative w-full max-w-lg h-[85vh] bg-[#FFFCF5] dark:bg-brand-dark rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-white/10">
             <div className="bg-white dark:bg-white/5 p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 font-sans">Liturgia Diária</p>
                <h3 className="text-sm font-bold text-brand-dark dark:text-white font-sans max-w-[200px] truncate">{liturgyData.saint || "Leituras do Dia"}</h3>
              </div>
              <button onClick={() => setShowLiturgyModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="flex bg-slate-50 dark:bg-black/20 p-1">
                {['first', 'psalm', 'second', 'gospel'].map((tab) => {
                    if (tab === 'second' && !liturgyData.readings.second) return null;
                    return (
                        <button 
                            key={tab}
                            onClick={() => setActiveLiturgyTab(tab as any)} 
                            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${activeLiturgyTab === tab ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400'}`}
                        >
                            {tab === 'first' && '1ª Leitura'}
                            {tab === 'psalm' && 'Salmo'}
                            {tab === 'second' && '2ª Leitura'}
                            {tab === 'gospel' && 'Evangelho'}
                        </button>
                    )
                })}
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] dark:bg-none">
                 <div className="prose prose-lg prose-stone dark:prose-invert mx-auto">
                    <div className="text-center mb-8 text-brand-dark dark:text-white">
                      <div className="w-12 h-12 mx-auto mb-4 text-brand-violet flex items-center justify-center">
                         {activeLiturgyTab === 'gospel' ? <BookOpen size={40} strokeWidth={1} /> : <BrandLogo size={40} variant="outline" />}
                      </div>
                      <p className="font-sans italic text-slate-500 dark:text-slate-400 text-sm">
                         {activeLiturgyTab === 'first' && liturgyData.readings.first.ref}
                         {activeLiturgyTab === 'psalm' && liturgyData.readings.psalm.ref}
                         {activeLiturgyTab === 'second' && liturgyData.readings.second?.ref}
                         {activeLiturgyTab === 'gospel' && liturgyData.readings.gospel.ref}
                      </p>
                    </div>
                    
                    <div className="font-sans text-lg leading-loose text-justify text-slate-800 dark:text-slate-200 whitespace-pre-line">
                       {activeLiturgyTab === 'first' && cleanAIOutput(liturgyData.readings.first.text)}
                       {activeLiturgyTab === 'psalm' && cleanAIOutput(liturgyData.readings.psalm.text)}
                       {activeLiturgyTab === 'second' && cleanAIOutput(liturgyData.readings.second?.text || '')}
                       {activeLiturgyTab === 'gospel' && cleanAIOutput(liturgyData.readings.gospel.text)}
                    </div>

                    <div className="mt-12 text-center text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">
                       {activeLiturgyTab === 'gospel' ? 'Palavra da Salvação' : 'Palavra do Senhor'}
                    </div>
                 </div>
            </div>
            <div className="p-6 bg-white dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                <button onClick={() => setShowLiturgyModal(false)} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-violet/20 hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2 font-sans"><CheckCircle2 size={20} /> Concluir Leitura</button>
            </div>
          </div>
        </div>
      )}

      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
    </div>
  );
};

export default Dashboard;
