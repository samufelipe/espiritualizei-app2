
import React, { useState } from 'react';
import { RoutineItem, RoutineActionType, Tab, CommunityChallenge } from '../types';
import { Check, Book, Sun, Moon, Cross, Heart, Shield, Plus, Trash2, Info, ChevronDown, MapPin, Music, Calendar, Flame, ArrowRight, Zap, Users, Sparkles } from 'lucide-react';

interface RoutineProps {
  items: RoutineItem[];
  activeChallenge?: CommunityChallenge; // Novo prop para receber o desafio ativo
  onToggle: (id: string) => void;
  onAdd: (title: string, description: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (tab: Tab) => void;
  onOpenMaps?: () => void;
  onOpenPlayer?: () => void;
  onOpenLiturgy?: () => void;
}

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const FULL_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Temas litúrgicos para dar contexto ao dia
const DAY_THEMES = [
    { title: "Dia do Senhor", subtitle: "Ressurreição & Eucaristia", color: "text-amber-500", bg: "bg-amber-500/10" }, // Dom
    { title: "Mistérios Gozosos", subtitle: "Início da Jornada", color: "text-blue-500", bg: "bg-blue-500/10" }, // Seg
    { title: "Santos Anjos", subtitle: "Combate Espiritual", color: "text-slate-500", bg: "bg-slate-500/10" }, // Ter
    { title: "São José", subtitle: "Trabalho & Providência", color: "text-green-600", bg: "bg-green-600/10" }, // Qua
    { title: "Santíssimo Sacramento", subtitle: "Adoração & Eucaristia", color: "text-brand-violet", bg: "bg-brand-violet/10" }, // Qui
    { title: "Paixão do Senhor", subtitle: "Penitência & Caridade", color: "text-red-500", bg: "bg-red-500/10" }, // Sex
    { title: "Dia de Maria", subtitle: "Devoção à Mãe de Deus", color: "text-blue-400", bg: "bg-blue-400/10" }, // Sab
];

const Routine: React.FC<RoutineProps> = ({ items, activeChallenge, onToggle, onAdd, onDelete, onNavigate, onOpenMaps, onOpenPlayer, onOpenLiturgy }) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [completionFeedback, setCompletionFeedback] = useState<{ show: boolean, message: string } | null>(null);

  const dailyItems = items.filter(item => item.dayOfWeek.includes(selectedDay));
  const morningItems = dailyItems.filter(i => i.timeOfDay === 'morning');
  const afternoonItems = dailyItems.filter(i => i.timeOfDay === 'afternoon');
  const nightItems = dailyItems.filter(i => i.timeOfDay === 'night' || i.timeOfDay === 'any');

  const dayCompletedCount = dailyItems.filter(i => i.completed).length;
  const dayTotalCount = dailyItems.length;
  const dayProgress = dayTotalCount > 0 ? (dayCompletedCount / dayTotalCount) * 100 : 0;
  
  const currentTheme = DAY_THEMES[selectedDay];
  
  // Logic for Community Challenge Banner
  const isToday = new Date().getDay() === selectedDay;
  const challengeTopic = activeChallenge?.dailyTopics?.find(t => t.day === activeChallenge.currentDay);
  const challengeCompleted = challengeTopic?.isCompleted;

  const handleActionClick = (action: RoutineActionType) => {
     if (!onNavigate) return;
     switch(action) {
        case 'READ_LITURGY': 
           if (onOpenLiturgy) onOpenLiturgy(); 
           else onNavigate(Tab.DASHBOARD); 
           break;
        case 'READ_KNOWLEDGE': onNavigate(Tab.KNOWLEDGE); break;
        case 'OPEN_COMMUNITY': onNavigate(Tab.COMMUNITY); break;
        case 'OPEN_CHAT': onNavigate(Tab.CHAT); break;
        case 'OPEN_MAP': if (onOpenMaps) onOpenMaps(); break;
        case 'OPEN_PLAYER': if (onOpenPlayer) onOpenPlayer(); break;
     }
  };

  const handleToggleWithFeedback = (id: string) => {
     const item = items.find(i => i.id === id);
     if (!item) return;

     if (!item.completed) {
        setCompletionFeedback({
           show: true,
           message: "Prática concluída. Deus seja louvado."
        });
        setTimeout(() => setCompletionFeedback(null), 3000);
     }
     onToggle(id);
  };

  const getIcon = (type: string) => {
    const props = { size: 20, strokeWidth: 1.5 };
    switch (type) {
      case 'rosary': return <Cross {...props} />;
      case 'book': return <Book {...props} />;
      case 'candle': return <Sun {...props} />;
      case 'sun': return <Sun {...props} />;
      case 'moon': return <Moon {...props} />;
      case 'heart': return <Heart {...props} />;
      case 'shield': return <Shield {...props} />;
      case 'church': return <MapPin {...props} />;
      case 'music': return <Music {...props} />;
      default: return <Check {...props} />;
    }
  };

  const getActionLabel = (action: RoutineActionType) => {
     switch(action) {
        case 'READ_LITURGY': return 'Ler Evangelho';
        case 'READ_KNOWLEDGE': return 'Estudar Agora';
        case 'OPEN_COMMUNITY': return 'Ir para Comunidade';
        case 'OPEN_MAP': return 'Ver Igrejas Próximas';
        case 'OPEN_PLAYER': return 'Abrir Capela Sonora';
        case 'OPEN_CHAT': return 'Falar com Diretor';
        default: return null;
     }
  };

  const handleAddItem = () => {
    if (newTitle.trim()) {
       onAdd(newTitle, newDesc);
       setNewTitle('');
       setNewDesc('');
       setShowAddModal(false);
    }
  };

  const renderSection = (title: string, items: RoutineItem[], icon: React.ReactNode) => {
     if (items.length === 0) return null;
     
     return (
        <div className="mb-8 animate-slide-up">
           <div className="flex items-center gap-2 mb-4 px-1">
              <div className="text-brand-violet">{icon}</div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h3>
           </div>
           
           <div className="space-y-3">
              {items.map((item) => {
                 const isExpanded = expandedId === item.id;
                 const actionLabel = getActionLabel(item.actionLink || 'NONE');

                 return (
                    <div 
                      key={item.id}
                      className={`relative rounded-3xl transition-all duration-300 overflow-hidden border ${
                         item.completed 
                           ? 'bg-transparent border-transparent opacity-50' 
                           : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-card'
                      } ${isExpanded ? 'ring-1 ring-brand-violet/30' : ''}`}
                    >
                       {/* Main Row */}
                       <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                          
                          {/* Outlined Checkbox Button */}
                          <button
                             onClick={(e) => { e.stopPropagation(); handleToggleWithFeedback(item.id); }}
                             className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 border-2 ${
                                item.completed 
                                  ? 'bg-brand-violet border-brand-violet text-white' 
                                  : 'bg-transparent border-slate-200 dark:border-white/20 text-brand-violet hover:border-brand-violet'
                             }`}
                          >
                             {item.completed ? <Check size={20} strokeWidth={3} /> : getIcon(item.icon)}
                          </button>

                          <div className="flex-1 min-w-0">
                             <h4 className={`font-bold text-base ${item.completed ? 'text-slate-400 line-through' : 'text-brand-dark dark:text-white'}`}>
                                {item.title}
                             </h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{item.description}</p>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end">
                             {!item.completed && (
                                <span className="text-[10px] font-bold text-brand-violet px-2 py-1 rounded-lg border border-brand-violet/20">
                                   +{item.xpReward} XP
                                </span>
                             )}
                             {item.actionLink && item.actionLink !== 'NONE' && !item.completed && (
                                <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1">
                                   <Zap size={10} className="text-amber-400" /> Ação
                                </span>
                             )}
                          </div>
                       </div>

                       {/* Expanded Details */}
                       {isExpanded && (
                          <div className="px-5 pb-5 pt-0 animate-fade-in">
                             <div className="h-px w-full bg-slate-100 dark:bg-white/5 mb-4" />
                             
                             {item.detailedContent && (
                                <div className="flex gap-3 mb-6">
                                   <Info size={16} className="text-brand-violet shrink-0 mt-0.5" />
                                   <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                      {item.detailedContent}
                                   </p>
                                </div>
                             )}

                             <div className="flex items-center justify-between gap-4">
                                {actionLabel && !item.completed ? (
                                   <button 
                                      onClick={() => handleActionClick(item.actionLink!)}
                                      className="flex-1 border border-brand-violet/30 text-brand-violet hover:bg-brand-violet/5 font-bold py-3 rounded-xl text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                                   >
                                      {getIcon(item.icon)} {actionLabel}
                                   </button>
                                ) : <div />}
                                
                                <button 
                                   onClick={() => onDelete(item.id)}
                                   className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                >
                                   <Trash2 size={18} />
                                </button>
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
       
       {completionFeedback?.show && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-dark/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-brand-dark px-6 py-3 rounded-full shadow-2xl animate-slide-up flex items-center gap-3 w-[90%] max-w-sm border border-white/10">
             <div className="bg-green-500 rounded-full p-1"><Check size={12} strokeWidth={3} className="text-white" /></div>
             <p className="text-xs font-bold">{completionFeedback.message}</p>
          </div>
       )}

       <div className="bg-white dark:bg-white/5 pb-6 pt-4 rounded-b-[2.5rem] shadow-sm mb-8">
          <div className="px-6 mb-6">
             <h1 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Sua Rotina</h1>
             
             {/* THEME OF THE DAY BANNER */}
             <div className={`p-4 rounded-2xl ${currentTheme.bg} border border-white/10 flex items-center gap-4 mb-4`}>
                <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ${currentTheme.color}`}>
                   <Calendar size={20} />
                </div>
                <div>
                   <p className={`text-xs font-bold uppercase tracking-widest ${currentTheme.color}`}>{FULL_DAYS[selectedDay]}</p>
                   <p className="text-sm font-bold text-brand-dark dark:text-white">{currentTheme.title}</p>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentTheme.subtitle}</p>
                </div>
             </div>

             <div className="flex justify-between items-end">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                   Progresso diário
                </p>
                <span className="text-xs font-bold text-brand-violet border border-brand-violet/20 px-2 py-1 rounded-lg">
                   {Math.round(dayProgress)}%
                </span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-brand-violet transition-all duration-500" style={{ width: `${dayProgress}%` }} />
             </div>
          </div>

          <div className="flex justify-between px-6">
             {DAYS.map((dayLabel, idx) => {
                const isSelected = selectedDay === idx;
                const isToday = new Date().getDay() === idx;
                const hasTasks = items.some(i => i.dayOfWeek.includes(idx));
                
                return (
                   <button 
                     key={idx}
                     onClick={() => setSelectedDay(idx)}
                     className={`flex flex-col items-center gap-2 transition-all ${isSelected ? 'scale-110' : 'opacity-60'}`}
                   >
                      <span className="text-[10px] font-bold text-slate-400">{dayLabel}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all border ${
                         isSelected 
                           ? 'bg-brand-violet text-white border-brand-violet' 
                           : isToday 
                              ? 'bg-transparent text-brand-violet border-brand-violet'
                              : 'bg-transparent text-slate-400 border-slate-200 dark:border-white/10'
                      }`}>
                         {hasTasks ? <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-violet'}`} /> : null}
                      </div>
                   </button>
                );
             })}
          </div>
       </div>

       <div className="px-6">
          {/* SPECIAL COMMUNITY CHALLENGE CARD (ONLY IF ACTIVE) */}
          {isToday && activeChallenge && challengeTopic && (
             <div className="mb-8 animate-slide-up">
                <div className="flex items-center gap-2 mb-4 px-1">
                   <Sparkles size={18} className="text-amber-400 fill-amber-400" />
                   <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Missão Especial</h3>
                </div>
                
                <div 
                   onClick={() => onNavigate && onNavigate(Tab.COMMUNITY)}
                   className={`relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg transition-all ${challengeCompleted ? 'bg-white/10 border border-white/5 opacity-70' : 'bg-gradient-to-r from-brand-violet to-purple-600 border border-white/10'}`}
                >
                   {!challengeCompleted && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />}
                   
                   <div className="p-5 flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${challengeCompleted ? 'bg-green-500 text-white' : 'bg-white text-brand-violet'}`}>
                         {challengeCompleted ? <Check size={24} strokeWidth={3} /> : <Users size={24} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${challengeCompleted ? 'text-slate-400' : 'text-purple-200'}`}>
                            Desafio do Dia
                         </p>
                         <h4 className={`font-bold text-base truncate ${challengeCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                            {challengeTopic.title}
                         </h4>
                         {!challengeCompleted && <p className="text-xs text-purple-100 truncate mt-0.5">Clique para ver e participar com todos.</p>}
                      </div>

                      {!challengeCompleted && (
                         <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <ArrowRight size={16} />
                         </div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {dailyItems.length === 0 ? (
             <div className="text-center py-12 opacity-60">
                <div className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Calendar size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Dia livre ou descanso.</p>
                <button onClick={() => setShowAddModal(true)} className="text-brand-violet font-bold text-sm mt-2 hover:underline">Adicionar Prática</button>
             </div>
          ) : (
             <>
                {renderSection('Manhã', morningItems, <Sun size={18} />)}
                {renderSection('Tarde', afternoonItems, <Sun size={18} />)}
                {renderSection('Noite', nightItems, <Moon size={18} />)}
             </>
          )}
       </div>

       <button 
         onClick={() => setShowAddModal(true)}
         className="fixed bottom-24 right-6 w-14 h-14 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
       >
          <Plus size={24} />
       </button>

       {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
           <div className="relative w-full max-w-sm bg-white dark:bg-brand-dark p-6 rounded-3xl shadow-2xl animate-slide-up border border-white/10">
              <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Nova Prática (Todos os dias)</h3>
              <input 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 mb-3 text-brand-dark dark:text-white outline-none focus:border-brand-violet"
                placeholder="Título (ex: Terço da Misericórdia)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                autoFocus
              />
              <input 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 mb-6 text-brand-dark dark:text-white outline-none focus:border-brand-violet"
                placeholder="Descrição curta"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
              <div className="flex gap-3">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">Cancelar</button>
                 <button onClick={handleAddItem} disabled={!newTitle.trim()} className="flex-1 py-3 rounded-xl font-bold bg-brand-violet text-white hover:bg-purple-600 disabled:opacity-50">Adicionar</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Routine;
