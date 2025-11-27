
import React, { useEffect, useState } from 'react';
import { UserProfile, LiturgyDay, PrayerIntention } from '../types';
import { Flame, ChevronRight, Sun, BookOpen, Smile, CloudRain, Heart, Sparkles, Plus, Sunrise, Sunset, Moon, X, CheckCircle2, Loader2, Compass, ArrowRight, Settings } from 'lucide-react';
import { generateDailyReflection, getLiturgyText } from '../services/geminiService';
import JournalModal from './JournalModal'; // Import Journal Modal

interface DashboardProps {
  user: UserProfile;
  myIntentions: PrayerIntention[];
  onNavigateToCommunity: () => void;
  onNavigateToRoutine: () => void; 
  onNavigateToKnowledge: () => void;
  onSaveJournal: (mood: string, content: string, reflection?: string, verse?: string) => void; // New Prop
}

const Dashboard: React.FC<DashboardProps> = ({ user, myIntentions, onNavigateToCommunity, onNavigateToRoutine, onNavigateToKnowledge, onSaveJournal }) => {
  const [reflection, setReflection] = useState<string>('Contemplando...');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  // Journal State
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'peace' | 'struggle'>('peace');

  // Liturgy Modal State
  const [showGospelModal, setShowGospelModal] = useState(false);
  const [gospelText, setGospelText] = useState<string>('');
  const [loadingGospel, setLoadingGospel] = useState(false);
  const [gospelRead, setGospelRead] = useState(false);
  
  const today: LiturgyDay = {
    date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }),
    liturgicalColor: 'bg-green-600',
    season: 'Tempo Comum',
    readings: { first: '1 Reis 19, 9-18', psalm: 'Sl 26', gospel: 'Mateus 5, 27-32' },
    saint: 'São João Bosco'
  };

  useEffect(() => {
    let isMounted = true;
    generateDailyReflection(today.saint).then(text => {
      if (isMounted) setReflection(text);
    });

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    return () => { isMounted = false; };
  }, []);

  const handleOpenGospel = async () => {
    setShowGospelModal(true);
    if (!gospelText) {
      setLoadingGospel(true);
      const text = await getLiturgyText(today.readings.gospel);
      setGospelText(text);
      setLoadingGospel(false);
    }
  };

  const handleCompleteReading = () => {
    setGospelRead(true);
    setTimeout(() => setShowGospelModal(false), 1500);
  };

  const handleMoodClick = (mood: 'peace' | 'struggle') => {
      setSelectedMood(mood);
      setShowJournalModal(true);
  };

  const progressPercentage = Math.min(100, (user.currentXP / user.nextLevelXP) * 100);

  const getGreeting = () => {
    switch(timeOfDay) {
      case 'morning': return { text: 'Bom dia', icon: Sunrise };
      case 'afternoon': return { text: 'Boa tarde', icon: Sun };
      case 'evening': return { text: 'Boa noite', icon: Moon };
    }
  };

  const GreetingIcon = getGreeting().icon;
  const [isIntentionsExpanded, setIsIntentionsExpanded] = useState(false);
  const displayIntentions = isIntentionsExpanded ? myIntentions : myIntentions.slice(0, 3);

  // --- SMART FLOW LOGIC ---
  const getNextStep = () => {
     if (user.currentXP < 20) {
        return {
           title: 'Iniciar Regra de Vida',
           desc: 'Sua fidelidade começa nos pequenos atos.',
           action: onNavigateToRoutine,
           icon: CheckCircle2,
           color: 'bg-brand-violet text-white'
        };
     }
     if (myIntentions.length === 0) {
        return {
           title: 'Pedir Oração',
           desc: 'Não caminhe sozinho. A comunidade te espera.',
           action: onNavigateToCommunity,
           icon: Heart,
           color: 'bg-rose-500 text-white'
        };
     }
     return {
        title: 'Aprofundar a Fé',
        desc: 'Descubra a riqueza da nossa Tradição.',
        action: onNavigateToKnowledge,
        icon: BookOpen,
        color: 'bg-amber-500 text-white'
     };
  };

  const nextStep = getNextStep();

  return (
    <div className="p-6 pb-32 space-y-6 animate-fade-in font-sans bg-transparent transition-colors min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center pt-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-white dark:border-brand-dark shadow-sm overflow-hidden transition-colors">
             {user.photoUrl ? (
               <img src={user.photoUrl} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-brand-dark dark:bg-white/20 text-white font-bold">{user.name.charAt(0)}</div>
             )}
          </div>
          <div>
             <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
               <GreetingIcon size={10} /> {getGreeting().text}
             </p>
             <p className="text-sm font-bold text-brand-dark dark:text-white">{user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm">
          <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse-slow" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.streakDays}</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Liturgy Card */}
        <div className="col-span-2 relative overflow-hidden bg-brand-dark dark:bg-black/60 rounded-[2rem] shadow-float p-6 text-white group transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-violet rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/10 text-white backdrop-blur-sm">
                {today.season}
              </span>
              <span className="text-xs font-medium text-slate-300 capitalize">{today.date}</span>
            </div>
            <div className="space-y-2 mb-8">
              <p className="text-xs font-bold text-brand-violet uppercase tracking-wider">Santo do Dia</p>
              <h2 className="text-3xl font-bold tracking-tight leading-tight">{today.saint}</h2>
            </div>
            <div className="relative pl-4 border-l-2 border-white/20 py-1 mb-6">
              <p className="text-sm text-slate-300 leading-relaxed font-medium opacity-90">"{reflection}"</p>
            </div>
            <button 
              onClick={handleOpenGospel}
              className="w-full bg-white text-brand-dark text-xs font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-black/10"
            >
              <BookOpen size={14} /> <span>Ler Evangelho</span>
            </button>
          </div>
        </div>

        {/* Smart Flow Widget */}
        <div 
           onClick={nextStep.action}
           className="col-span-2 bg-white dark:bg-white/5 rounded-[1.5rem] p-1 shadow-card border border-slate-100 dark:border-white/5 transition-all hover:shadow-float cursor-pointer group overflow-hidden"
        >
           <div className="flex items-center gap-4 p-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${nextStep.color} group-hover:scale-110 transition-transform duration-300`}>
                 <nextStep.icon size={24} />
              </div>
              <div className="flex-1">
                 <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Próximo Passo</p>
                 <h3 className="text-lg font-bold text-brand-dark dark:text-white leading-none mb-1">{nextStep.title}</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{nextStep.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-brand-violet group-hover:text-white transition-colors">
                 <ArrowRight size={16} />
              </div>
           </div>
        </div>

        {/* My Intentions Widget */}
        <div className={`col-span-2 bg-white/70 dark:bg-white/5 rounded-[1.5rem] p-5 shadow-card border border-slate-100 dark:border-white/5 transition-all backdrop-blur-sm overflow-hidden ${isIntentionsExpanded ? 'row-span-2' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">Minhas Intenções</p>
            <button 
              onClick={() => setIsIntentionsExpanded(!isIntentionsExpanded)}
              className="text-xs font-bold text-brand-violet dark:text-brand-violet hover:bg-purple-50 dark:hover:bg-white/5 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              {isIntentionsExpanded ? 'Minimizar' : 'Ver todas'} <ChevronRight size={12} className={`transition-transform ${isIntentionsExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
          <div className={`space-y-3 transition-all ${isIntentionsExpanded ? 'max-h-[400px] overflow-y-auto pr-1 scrollbar-thin' : ''}`}>
            {displayIntentions.length > 0 ? (
              displayIntentions.map(intention => (
                <div key={intention.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className="w-8 h-8 min-w-[2rem] rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-violet shadow-sm border border-slate-50 dark:border-white/5">
                       <Heart size={14} fill="currentColor" className="opacity-50" />
                     </div>
                     <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1 pr-2">{intention.content}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-white/10 px-2 py-1 rounded-lg shadow-sm border border-slate-50 dark:border-white/5">
                     <Sparkles size={10} className="text-brand-violet fill-brand-violet" />
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{intention.prayingCount}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5">
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">Nenhuma intenção ativa.</p>
                <button onClick={onNavigateToCommunity} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark dark:text-white bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50"><Plus size={12} /> Criar Intenção</button>
              </div>
            )}
          </div>
        </div>

        {/* Mood Check-in (Updated) */}
        <div className="col-span-2 bg-white/70 dark:bg-white/5 rounded-[1.5rem] p-5 shadow-card border border-slate-100 dark:border-white/5 transition-colors backdrop-blur-sm">
           <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">Diário Espiritual</p>
           <div className="flex gap-3">
              <button 
                onClick={() => handleMoodClick('peace')}
                className="flex-1 py-3 rounded-xl border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-brand-violet/5 hover:border-brand-violet hover:text-brand-violet transition-all flex items-center justify-center gap-2 bg-white dark:bg-transparent"
              >
                <Smile size={18} /> <span className="text-sm font-bold">Em Paz</span>
              </button>
              <button 
                onClick={() => handleMoodClick('struggle')}
                className="flex-1 py-3 rounded-xl border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all flex items-center justify-center gap-2 bg-white dark:bg-transparent"
              >
                <CloudRain size={18} /> <span className="text-sm font-bold">Lutando</span>
              </button>
           </div>
        </div>

        {/* Progress Widget */}
        <div className="bg-white/70 dark:bg-white/5 rounded-[1.5rem] p-5 shadow-card border border-slate-100 dark:border-white/5 flex flex-col justify-between aspect-square transition-colors backdrop-blur-sm">
            <div>
               <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center mb-3 text-brand-violet"><Sun size={16} /></div>
               <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-1">Nível {user.level}</p>
               <p className="text-xl font-bold text-brand-dark dark:text-white">{user.currentXP} XP</p>
            </div>
            <div className="relative w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-brand-violet rounded-full" style={{ width: `${progressPercentage}%` }} />
            </div>
        </div>

        {/* Daily Challenge */}
        <div className="bg-[#F8FAFC]/80 dark:bg-white/5 rounded-[1.5rem] p-5 border border-slate-100 dark:border-white/5 flex flex-col justify-between aspect-square relative overflow-hidden cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors backdrop-blur-sm">
             <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold bg-brand-violet/20 px-2 py-0.5 rounded text-brand-violet">HOJE</span>
             </div>
             <div className="mt-2">
               <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-bold uppercase">Desafio</p>
               <p className="font-bold text-brand-dark dark:text-slate-200 leading-tight">Silêncio Interior</p>
             </div>
             <div className="flex justify-end"><ChevronRight size={16} className="text-slate-400 dark:text-slate-500" /></div>
        </div>
      </div>

      {/* Gospel Modal */}
      {showGospelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={() => setShowGospelModal(false)} />
          <div className="relative w-full max-w-lg h-[80vh] bg-[#FFFCF5] dark:bg-brand-dark rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up border-4 border-white/20 dark:border-white/5">
             <div className="bg-white dark:bg-white/5 p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Liturgia Diária</p>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white font-serif">{today.readings.gospel}</h3>
              </div>
              <button onClick={() => setShowGospelModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
              {loadingGospel ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 size={40} className="animate-spin text-brand-violet" /><p className="font-serif italic">Abrindo as Escrituras...</p>
                </div>
              ) : (
                 <div className="prose prose-lg prose-stone dark:prose-invert mx-auto">
                    <div className="text-center mb-8 text-brand-dark dark:text-white">
                      <div className="w-12 h-12 mx-auto mb-4 text-brand-violet flex items-center justify-center"><BookOpen size={40} strokeWidth={1} /></div>
                      <p className="font-serif italic text-slate-500 dark:text-slate-400 text-sm">Proclamação do Evangelho de Jesus Cristo</p>
                    </div>
                    <p className="font-serif text-lg leading-loose text-justify text-slate-800 dark:text-slate-200 whitespace-pre-line">{gospelText}</p>
                    <div className="mt-12 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Palavra da Salvação</div>
                 </div>
              )}
            </div>
            {!loadingGospel && (
              <div className="p-6 bg-white dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                {gospelRead ? (
                   <button className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-default animate-pulse"><CheckCircle2 size={20} /> Leitura Concluída</button>
                ) : (
                  <button onClick={handleCompleteReading} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-violet/20 hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2"><BookOpen size={20} /> Concluir Leitura Espiritual</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {showJournalModal && (
         <JournalModal mood={selectedMood} onClose={() => setShowJournalModal(false)} onSave={onSaveJournal} />
      )}
    </div>
  );
};

export default Dashboard;
