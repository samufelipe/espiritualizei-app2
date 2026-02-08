
import React, { useState } from 'react';
import { RoutineItem, RoutineActionType, Tab, CommunityChallenge } from '../types';
import { Check, Book, Sun, Moon, Cross, Heart, Shield, Plus, Trash2, Info, ChevronDown, MapPin, Music, Calendar, Flame, ArrowRight, Zap, Users, Sparkles } from 'lucide-react';

interface RoutineProps {
  items: RoutineItem[];
  activeChallenge?: CommunityChallenge;
  completedToday?: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (title: string, description: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (tab: Tab) => void;
  onOpenSocial?: () => void;
  onOpenPlayer?: () => void;
  onOpenLiturgy?: () => void;
  onCompleteTask?: (taskId: string, xpReward: number) => Promise<void>;
}

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const FULL_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const DAY_THEMES = [
    { title: "Dia do Senhor", subtitle: "Missa & Ressurreição", color: "text-amber-500", bg: "bg-amber-500/10", icon: Cross },
    { title: "Almas & Doutrina", subtitle: "Fé Intelectual", color: "text-blue-500", bg: "bg-blue-500/10", icon: Book },
    { title: "Santos Anjos", subtitle: "Combate Espiritual", color: "text-slate-500", bg: "bg-slate-500/10", icon: Shield },
    { title: "São José", subtitle: "Família & Trabalho", color: "text-green-600", bg: "bg-green-600/10", icon: Zap },
    { title: "Eucaristia", subtitle: "Adoração ao Santíssimo", color: "text-brand-violet", bg: "bg-brand-violet/10", icon: Sun },
    { title: "Paixão do Senhor", subtitle: "Penitência & Cruz", color: "text-red-500", bg: "bg-red-500/10", icon: Cross },
    { title: "Virgem Maria", subtitle: "Devocional & Mãe", color: "text-blue-400", bg: "bg-blue-400/10", icon: Heart },
];

const Routine: React.FC<RoutineProps> = ({ items, activeChallenge, completedToday = new Set(), onToggle, onAdd, onDelete, onNavigate, onOpenSocial, onOpenPlayer, onOpenLiturgy, onCompleteTask }) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const dailyItems = items.filter(item => item.dayOfWeek.includes(selectedDay));
  const morningItems = dailyItems.filter(i => i.timeOfDay === 'morning');
  const afternoonItems = dailyItems.filter(i => i.timeOfDay === 'afternoon');
  const nightItems = dailyItems.filter(i => i.timeOfDay === 'night' || i.timeOfDay === 'any');

  const dayCompletedCount = dailyItems.filter(i => completedToday.has(i.id)).length;
  const dayTotalCount = dailyItems.length;
  const dayProgress = dayTotalCount > 0 ? (dayCompletedCount / dayTotalCount) * 100 : 0;
  
  const currentTheme = DAY_THEMES[selectedDay];

  const handleActionClick = (action: RoutineActionType) => {
     if (!onNavigate) return;
     switch(action) {
        case 'READ_LITURGY': if (onOpenLiturgy) onOpenLiturgy(); break;
        case 'READ_KNOWLEDGE': onNavigate(Tab.KNOWLEDGE); break;
        case 'OPEN_COMMUNITY': onNavigate(Tab.COMMUNITY); break;
        case 'OPEN_SOCIAL': if (onOpenSocial) onOpenSocial(); break;
        case 'OPEN_PLAYER': if (onOpenPlayer) onOpenPlayer(); break;
     }
  };

  const getIcon = (type: string) => {
    const props = { size: 20, strokeWidth: 1.5 };
    switch (type) {
      case 'rosary': return <Cross {...props} />;
      case 'book': return <Book {...props} />;
      case 'sun': return <Sun {...props} />;
      case 'moon': return <Moon {...props} />;
      case 'heart': return <Heart {...props} />;
      case 'shield': return <Shield {...props} />;
      case 'music': return <Music {...props} />;
      default: return <Check {...props} />;
    }
  };

  const getActionLabel = (action: RoutineActionType) => {
     switch(action) {
        case 'READ_LITURGY': return 'Ler Evangelho';
        case 'READ_KNOWLEDGE': return 'Biblioteca';
        case 'OPEN_COMMUNITY': return 'Comunidade';
        case 'OPEN_SOCIAL': return 'Ver Ranking';
        default: return null;
     }
  };

  const renderSection = (title: string, sectionItems: RoutineItem[], icon: React.ReactNode) => {
     if (sectionItems.length === 0) return null;
     return (
        <div className="mb-8 animate-slide-up">
           <div className="flex items-center gap-2 mb-4 px-1">
              <div className="text-brand-violet">{icon}</div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
           </div>
           <div className="space-y-3">
              {sectionItems.map((item) => {
                 const isExpanded = expandedId === item.id;
                 const actionLabel = getActionLabel(item.actionLink || 'NONE');
                 const isMainAction = item.actionLink && item.actionLink !== 'NONE';

                 return (
                    <div key={item.id} className={`rounded-3xl transition-all border ${completedToday.has(item.id) ? 'bg-transparent border-transparent opacity-50' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-sm'} ${isExpanded ? 'ring-1 ring-brand-violet/30' : ''}`}>
                       <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                          <button onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 border-2 ${completedToday.has(item.id) ? 'bg-brand-violet border-brand-violet text-white' : 'bg-transparent border-slate-200 dark:border-white/20 text-brand-violet'}`}>
                             {completedToday.has(item.id) ? <Check size={20} strokeWidth={3} /> : getIcon(item.icon)}
                          </button>
                          <div className="flex-1 min-w-0">
                             <h4 className={`font-bold text-base ${completedToday.has(item.id) ? 'text-slate-400 line-through' : 'text-brand-dark dark:text-white'}`}>{item.title}</h4>
                             <p className="text-xs text-slate-500 truncate">{item.description}</p>
                          </div>
                          {isMainAction && !completedToday.has(item.id) && <div className="bg-brand-violet/10 p-2 rounded-lg text-brand-violet animate-pulse"><Zap size={14} fill="currentColor" /></div>}
                       </div>
                       {isExpanded && (
                          <div className="px-5 pb-5 pt-0 animate-fade-in">
                             <div className="h-px w-full bg-slate-100 dark:bg-white/5 mb-4" />
                             {item.detailedContent && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">{item.detailedContent}</p>}
                             <div className="flex items-center justify-between gap-4">
                                {!completedToday.has(item.id) ? (
                                  <div className="flex-1 flex gap-2">
                                    {actionLabel && (
                                      <button onClick={() => handleActionClick(item.actionLink!)} className="flex-1 bg-slate-100 dark:bg-white/5 text-brand-violet font-bold py-3 rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2">
                                        {getIcon(item.icon)} {actionLabel}
                                      </button>
                                    )}
                                    <button 
                                      onClick={async () => {
                                        onToggle(item.id);
                                        if (onCompleteTask) {
                                          await onCompleteTask(item.id, item.xpReward);
                                        }
                                      }} 
                                      className="flex-1 bg-brand-violet text-white font-bold py-3 rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-violet/20 hover:scale-105 active:scale-95"
                                    >
                                      <Check size={16} strokeWidth={3} /> Concluir
                                    </button>
                                  </div>
                                ) : <div className="flex-1" />}
                                <button onClick={() => onDelete(item.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
                             </div>
                          </div>
                       )}
                    </div>
                 );
              })}
           </div>
        </div>
     );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-brand-dark pt-safe pb-32 animate-fade-in font-sans">
       <div className="bg-white dark:bg-white/5 pb-6 pt-4 rounded-b-[2.5rem] shadow-sm mb-8">
          <div className="px-6 mb-6">
             <h1 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Minha Jornada</h1>
             <div className={`p-5 rounded-[2rem] border border-white/5 flex items-center gap-5 transition-all`}>
                <div className={`w-14 h-14 flex items-center justify-center ${currentTheme.color}`}>
                   <currentTheme.icon size={36} />
                </div>
                <div className="flex-1">
                   <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentTheme.color}`}>{FULL_DAYS[selectedDay]}</p>
                   <p className="text-lg font-bold text-brand-dark dark:text-white leading-tight">{currentTheme.title}</p>
                   <p className="text-xs text-slate-500 font-medium">{currentTheme.subtitle}</p>
                </div>
             </div>
             <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fidelidade hoje</p>
                   <span className="text-xs font-black text-brand-violet">{Math.round(dayProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-violet transition-all duration-700" style={{ width: `${dayProgress}%` }} />
                </div>
             </div>
          </div>
          <div className="flex justify-between px-6">
             {DAYS.map((dayLabel, idx) => (
                <button key={idx} onClick={() => setSelectedDay(idx)} className={`flex flex-col items-center gap-2 transition-all ${selectedDay === idx ? 'scale-110' : 'opacity-40'}`}>
                   <span className="text-[10px] font-black text-slate-400">{dayLabel}</span>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${selectedDay === idx ? 'bg-brand-violet text-white border-brand-violet shadow-lg shadow-brand-violet/20' : 'bg-transparent text-slate-400 border-slate-200 dark:border-white/10'}`}>
                      {items.some(i => i.dayOfWeek.includes(idx)) && <div className={`w-1.5 h-1.5 rounded-full ${selectedDay === idx ? 'bg-white' : 'bg-brand-violet'}`} />}
                   </div>
                </button>
             ))}
          </div>
       </div>

       <div className="px-6">
          {dailyItems.length === 0 ? (
             <div className="text-center py-20 opacity-40">
                <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-bold">Nenhuma prática para hoje.</p>
             </div>
          ) : (
             <>
                {renderSection('Preparar (Manhã)', morningItems, <Sun size={18} />)}
                {renderSection('Viver (Tarde)', afternoonItems, <Zap size={18} />)}
                {renderSection('Recolher (Noite)', nightItems, <Moon size={18} />)}
             </>
          )}
       </div>

       <button onClick={() => setShowAddModal(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-brand-violet text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
          <Plus size={24} />
       </button>

       {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
           <div className="relative w-full max-w-sm bg-white dark:bg-brand-dark p-8 rounded-[2.5rem] shadow-2xl animate-slide-up border border-white/10">
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-6">Nova Prática Livre</h3>
              <div className="space-y-4">
                <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-brand-dark dark:text-white outline-none focus:border-brand-violet" placeholder="Título da prática" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-brand-dark dark:text-white outline-none focus:border-brand-violet" placeholder="Breve descrição" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-8">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-slate-500">Voltar</button>
                 <button onClick={() => { if(newTitle.trim()){ onAdd(newTitle, newDesc); setNewTitle(''); setNewDesc(''); setShowAddModal(false); } }} disabled={!newTitle.trim()} className="flex-1 py-4 rounded-xl font-bold bg-brand-violet text-white shadow-lg disabled:opacity-50">Criar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Routine;
