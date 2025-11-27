
import React, { useState } from 'react';
import { RoutineItem } from '../types';
import { Check, Circle, Book, Sun, Moon, Cross, Heart, ChevronDown, Info, ExternalLink, Shield, Plus, Trash2, X } from 'lucide-react';

interface RoutineProps {
  items: RoutineItem[];
  onToggle: (id: string) => void;
  onAdd: (title: string, description: string) => void; // New Prop
  onDelete: (id: string) => void; // New Prop
}

const Routine: React.FC<RoutineProps> = ({ items, onToggle, onAdd, onDelete }) => {
  const sortedItems = [...items].sort((a, b) => Number(a.completed) - Number(b.completed));
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const getIcon = (type: string) => {
    const props = { size: 18, strokeWidth: 2, 'aria-hidden': true };
    switch (type) {
      case 'rosary': return <Cross {...props} />;
      case 'book': return <Book {...props} />;
      case 'candle': return <Sun {...props} />;
      case 'heart': return <Heart {...props} />;
      case 'shield': return <Shield {...props} />;
      default: return <Moon {...props} />;
    }
  };

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddItem = () => {
    if (newTitle.trim()) {
       onAdd(newTitle, newDesc);
       setNewTitle('');
       setNewDesc('');
       setShowAddModal(false);
    }
  };

  return (
    <div className="p-6 pb-32 min-h-screen pt-8 animate-fade-in font-sans bg-white dark:bg-brand-dark transition-colors">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 relative">
         <h1 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Sua Regra de Vida</h1>
         <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Constância é santidade.</p>
         
         {/* Progress Bar */}
         <div 
           role="progressbar" 
           className="w-full max-w-[200px] h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mt-6 overflow-hidden"
         >
            <div 
              className="h-full bg-brand-violet transition-all duration-500" 
              style={{ width: `${(completedCount / (totalCount || 1)) * 100}%` }}
            />
         </div>
         <p className="mt-2 text-xs font-bold text-slate-400 dark:text-slate-500">
           {completedCount} de {totalCount} completados
         </p>
      </div>

      <div role="list" className="space-y-4">
        {sortedItems.map((item, index) => {
          const isExpanded = expandedId === item.id;
          
          return (
            <div
              key={item.id}
              style={{ animationDelay: `${index * 75}ms` }}
              className={`w-full relative overflow-hidden rounded-2xl transition-all duration-500 animate-slide-up border ${
                isExpanded 
                  ? 'bg-white dark:bg-brand-dark shadow-float border-brand-violet/30 dark:border-brand-violet/30' 
                  : item.completed
                    ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-70'
                    : 'bg-white dark:bg-white/5 shadow-card border-slate-100 dark:border-white/5 hover:shadow-float hover:-translate-y-0.5'
              }`}
            >
              {/* Main Card Content */}
              <div 
                onClick={() => handleExpand(item.id)}
                className="p-5 flex items-center gap-4 relative z-10 cursor-pointer select-none"
              >
                <button
                   role="checkbox"
                   aria-checked={item.completed}
                   onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                   className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 z-20 hover:scale-105 active:scale-95 ${
                    item.completed 
                      ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/30' 
                      : 'bg-slate-50 dark:bg-white/10 text-slate-400 dark:text-slate-500 hover:text-brand-violet hover:bg-brand-violet/10 dark:hover:bg-white/20'
                   }`}
                >
                  {item.completed ? <Check size={20} className="animate-scale-in" strokeWidth={3} /> : getIcon(item.icon)}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base mb-1 transition-all ${
                    item.completed ? 'text-slate-400 dark:text-slate-600 line-through decoration-2 decoration-slate-300 dark:decoration-slate-600' : 'text-brand-dark dark:text-slate-200'
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate pr-4">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {!item.completed && (
                    <span className="text-[10px] font-bold text-brand-violet dark:text-brand-violet bg-brand-violet/10 px-2 py-1 rounded-md whitespace-nowrap">+{item.xpReward} XP</span>
                  )}
                  <ChevronDown size={16} className={`text-slate-300 dark:text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Content */}
              <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.04,0.62,0.23,0.98)] ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-0">
                   <div className="h-px w-full bg-slate-100 dark:bg-white/5 mb-4" />
                   <div className="flex gap-3 items-start">
                      <div className="mt-0.5 text-brand-violet"><Info size={16} /></div>
                      <div className="space-y-3 flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Guia Prático</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{item.detailedContent || "Realize com amor e atenção plena."}</p>
                      </div>
                   </div>
                   {/* Delete Action */}
                   <div className="mt-6 flex justify-end">
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                         <Trash2 size={14} /> Remover Prática
                      </button>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Button */}
      <div className="mt-8 flex justify-center">
         <button 
           onClick={() => setShowAddModal(true)}
           className="flex items-center gap-2 text-sm font-bold text-brand-violet bg-brand-violet/5 px-6 py-3 rounded-full hover:bg-brand-violet/10 transition-colors"
         >
            <Plus size={16} /> Adicionar Prática Pessoal
         </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
           <div className="relative w-full max-w-sm bg-white dark:bg-brand-dark p-6 rounded-3xl shadow-2xl animate-slide-up border border-white/10">
              <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Nova Prática</h3>
              <input 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 mb-3 text-brand-dark dark:text-white outline-none focus:border-brand-violet"
                placeholder="Título (ex: Novena)"
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
