
import React, { useState } from 'react';
import { PrayerIntention, CommunityChallenge, UserProfile } from '../types';
import { Flame, Plus, Quote, Sparkles, MapPin, Image, Share2, Clock, Tag } from 'lucide-react';
import LiturgicalEvents from './LiturgicalEvents';
import CommunityFeed from './CommunityFeed';

interface CommunityProps {
  intentions: PrayerIntention[];
  challenges: CommunityChallenge[];
  onPray: (id: string) => void;
  onJoinChallenge: (id: string, amount?: number) => void;
  onOpenMaps: () => void;
  onOpenCreateModal: () => void;
  user?: UserProfile; 
}

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  health: { label: 'Saúde', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100/50 dark:bg-emerald-500/10' },
  family: { label: 'Família', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100/50 dark:bg-blue-500/10' },
  grace: { label: 'Graça', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100/50 dark:bg-purple-500/10' },
  vocational: { label: 'Vocação', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100/50 dark:bg-amber-500/10' },
  other: { label: 'Geral', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100/50 dark:bg-slate-500/10' },
};

const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "a";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "min";
  return "agora";
};

const Community: React.FC<CommunityProps> = ({ intentions, challenges, onPray, onJoinChallenge, onOpenMaps, onOpenCreateModal, user }) => {
  const [activeTab, setActiveTab] = useState<'mural' | 'feed'>('mural');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // New State for Testimony Cycle
  const [feedDraft, setFeedDraft] = useState<string>('');

  const handleTestify = (content: string) => {
     setFeedDraft(content);
     setActiveTab('feed');
     // Auto-scroll to feed area could be added here
  };

  const handleShare = async (item: PrayerIntention) => {
    const shareData = {
      title: 'Pedido de Oração - Espiritualizei',
      text: `Peço orações por ${item.author}: "${item.content}"`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} \n${shareData.url}`);
      alert('Intenção copiada para a área de transferência!');
    }
  };

  const filteredIntentions = filterCategory === 'all' 
    ? intentions 
    : intentions.filter(i => i.category === filterCategory);

  return (
    <div className="p-6 pb-32 bg-[#F8FAFC] dark:bg-brand-dark min-h-screen pt-8 animate-fade-in transition-colors">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 z-30 bg-[#F8FAFC]/80 dark:bg-brand-dark/80 backdrop-blur-md py-2">
           <div>
              <h1 className="text-2xl font-sans font-bold text-brand-dark dark:text-white tracking-tight">Comunidade</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-medium">Liturgia & Intercessão</p>
           </div>
           <div className="flex gap-2">
             <button 
               onClick={onOpenMaps}
               aria-label="Encontrar Igreja"
               className="bg-white dark:bg-white/10 text-brand-dark dark:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all"
             >
               <MapPin size={20} strokeWidth={1.5} />
             </button>
             
             {activeTab === 'mural' && (
               <button 
                 onClick={onOpenCreateModal}
                 aria-label="Nova intenção"
                 className="bg-brand-violet text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-brand-violet/20 hover:scale-105 transition-all active:scale-95"
               >
                 <Plus size={20} strokeWidth={2} aria-hidden="true" />
               </button>
             )}
           </div>
        </div>

        {/* Liturgical Events Section (Always visible or only on specific tabs? Keeping always visible for engagement) */}
        <div className="mb-10">
           <LiturgicalEvents 
              challenges={challenges} 
              onJoin={onJoinChallenge} 
              onTestify={handleTestify} 
           />
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-white dark:bg-white/5 rounded-xl mb-8 border border-slate-200 dark:border-white/5 max-w-md mx-auto shadow-sm">
           <button 
             onClick={() => setActiveTab('mural')}
             className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
               activeTab === 'mural' 
                 ? 'bg-brand-violet text-white shadow-md' 
                 : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
             }`}
           >
              <Sparkles size={16} /> Mural de Orações
           </button>
           <button 
             onClick={() => setActiveTab('feed')}
             className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
               activeTab === 'feed' 
                 ? 'bg-brand-violet text-white shadow-md' 
                 : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
             }`}
           >
              <Image size={16} /> Caminhada (Feed)
           </button>
        </div>

        {/* Content Switcher */}
        {activeTab === 'mural' ? (
          <div className="animate-fade-in">
            
            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
               {['all', 'health', 'family', 'vocational', 'grace'].map(cat => {
                 const label = cat === 'all' ? 'Todos' : CATEGORY_STYLES[cat]?.label || cat;
                 const isActive = filterCategory === cat;
                 return (
                   <button
                     key={cat}
                     onClick={() => setFilterCategory(cat)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        isActive 
                          ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-transparent shadow-md' 
                          : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50'
                     }`}
                   >
                     {label}
                   </button>
                 )
               })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6" role="feed">
              {filteredIntentions.map((item, index) => {
                const catStyle = CATEGORY_STYLES[item.category || 'other'] || CATEGORY_STYLES['other'];
                return (
                  <article 
                    key={item.id} 
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group bg-white dark:bg-white/5 p-5 rounded-[1.5rem] shadow-card border border-slate-100 dark:border-white/5 hover:shadow-float hover:border-brand-violet/20 dark:hover:border-white/10 transition-all duration-300 animate-slide-up-content flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-brand-dark dark:text-white font-bold text-sm border border-white dark:border-white/5 shadow-sm">
                          {item.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="text-sm font-bold text-brand-dark dark:text-white leading-none">{item.author}</p>
                             <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-medium">
                                <Clock size={10} /> {getTimeAgo(item.timestamp)}
                             </span>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md mt-1 ${catStyle.bg}`}>
                             <Tag size={10} className={catStyle.color} />
                             <span className={`text-[9px] font-bold uppercase tracking-wide ${catStyle.color}`}>{catStyle.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="mb-5 pl-1">
                      <p className="text-slate-700 dark:text-slate-200 text-[15px] leading-relaxed font-medium">
                        {item.content}
                      </p>
                    </div>

                    {/* Card Footer (Actions) */}
                    <div className="pt-3 mt-auto flex items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5">
                      
                      {/* Main Interaction Area */}
                      <div className="flex items-center gap-3 flex-1">
                         <button 
                           onClick={() => onPray(item.id)}
                           className={`group/btn relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 active:scale-95 overflow-hidden ${
                             item.isPrayedByUser 
                               ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20' 
                               : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                           }`}
                         >
                           {/* Shine Effect */}
                           {!item.isPrayedByUser && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />}
                           
                           <Flame 
                             size={18} 
                             className={`transition-all duration-500 ${
                               item.isPrayedByUser 
                                 ? 'fill-white animate-pulse-slow drop-shadow-sm' 
                                 : 'text-slate-400 group-hover/btn:text-brand-violet'
                             }`} 
                           />
                           <span className="text-xs font-bold whitespace-nowrap">
                              {item.isPrayedByUser ? 'Vela Acesa' : 'Acender Vela'}
                           </span>
                         </button>

                         {/* Counter - Integrated cleanly */}
                         {item.prayingCount > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 animate-fade-in">
                               <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-brand-dark dark:text-white">
                                  {item.prayingCount}
                               </span>
                               <span className="hidden sm:inline">orando</span>
                            </div>
                         )}
                      </div>

                      {/* Share Action */}
                      <button 
                        onClick={() => handleShare(item)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-brand-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Compartilhar"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
           <CommunityFeed user={user!} initialContent={feedDraft} />
        )}
      </div>
    </div>
  );
};

export default Community;
