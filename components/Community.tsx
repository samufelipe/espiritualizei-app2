
import React, { useState, useEffect } from 'react';
import { PrayerIntention, CommunityChallenge, UserProfile } from '../types';
import { Heart, Image, Trophy, Plus, Flame, Share2 } from 'lucide-react';
import LiturgicalEvents from './LiturgicalEvents';
import CommunityFeed from './CommunityFeed';
import LeaderboardWidget from './LeaderboardWidget';

interface CommunityProps {
  intentions: PrayerIntention[];
  challenges: CommunityChallenge[];
  onPray: (id: string) => void;
  onJoinChallenge: (id: string, amount?: number) => void;
  onOpenCreateModal: () => void;
  onTestify: (content: string) => void;
  feedInitialContent?: string;
  initialTab?: 'comunidade' | 'feed' | 'ranking';
  user: UserProfile;
}

const Community: React.FC<CommunityProps> = ({ 
  intentions, 
  challenges, 
  onPray, 
  onJoinChallenge, 
  onOpenCreateModal, 
  onTestify, 
  feedInitialContent,
  initialTab,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'comunidade' | 'feed' | 'ranking'>('comunidade');

  // Este efeito é crucial para que o redirecionamento via App.tsx funcione
  useEffect(() => {
     if (initialTab) {
        setActiveTab(initialTab);
     }
  }, [initialTab, feedInitialContent]); // Depender também do conteúdo inicial ajuda no reset

  const handleShareApp = () => {
    const text = encodeURIComponent("Olá! Queria te convidar para conhecer o Espiritualizei, um app incrível que está me ajudando muito a organizar minha jornada diária e vida espiritual. 💜\n\nConheça aqui: https://www.espiritualizei.com/");
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black/20 pb-32 animate-fade-in">
        
      {/* Liturgical Events Banner */}
      <div className="p-4 sm:p-6 pb-2">
         <LiturgicalEvents 
            challenges={challenges} 
            onJoin={onJoinChallenge} 
            onTestify={onTestify}
         />
      </div>

      {/* Tabs Navigation */}
      <div className="px-4 sm:px-6 sticky top-0 z-30 bg-slate-50/95 dark:bg-[#0F1115]/95 backdrop-blur-xl py-2">
          <div className="flex p-1.5 bg-slate-200/50 dark:bg-white/5 rounded-2xl mx-auto max-w-lg relative overflow-x-auto shadow-sm border border-slate-200/50 dark:border-white/5">
              <button 
                onClick={() => setActiveTab('comunidade')} 
                className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 whitespace-nowrap ${activeTab === 'comunidade' ? 'bg-white dark:bg-[#2A2E35] text-brand-violet shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Heart size={16} /> Comunidade
              </button>
              <button 
                onClick={() => setActiveTab('feed')} 
                className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 whitespace-nowrap ${activeTab === 'feed' ? 'bg-white dark:bg-[#2A2E35] text-brand-violet shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Image size={16} /> Feed da Comunidade
              </button>
              <button 
                onClick={() => setActiveTab('ranking')} 
                className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 whitespace-nowrap lg:hidden ${activeTab === 'ranking' ? 'bg-white dark:bg-[#2A2E35] text-brand-violet shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Trophy size={16} /> Ranking
              </button>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-8">
               
               {activeTab === 'comunidade' && (
                  <div className="space-y-6 animate-slide-up">
                     <button 
                        onClick={onOpenCreateModal}
                        className="w-full bg-white dark:bg-[#1A1F26] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 hover:border-brand-violet/30 transition-all group text-left"
                     >
                        <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet group-hover:scale-110 transition-transform">
                           <Plus size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-bold text-brand-dark dark:text-white">Peça uma oração</p>
                           <p className="text-xs text-slate-400">Sua intenção será levada por esta comunidade.</p>
                        </div>
                     </button>

                     {/* Desafios Comunitários em Destaque (Mobile) */}
                     <div className="lg:hidden space-y-4 mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">Desafios Ativos</h3>
                        {challenges.length > 0 ? challenges.filter(c => c.status === 'active').map(challenge => (
                           <div 
                              key={challenge.id} 
                              onClick={() => onJoinChallenge(challenge.id)}
                              className="bg-gradient-to-br from-brand-violet/10 to-purple-500/5 border border-brand-violet/20 p-5 rounded-3xl relative overflow-hidden cursor-pointer hover:border-brand-violet/40 transition-all active:scale-[0.99]"
                           >
                              <div className="flex justify-between items-start mb-3">
                                 <div className="w-10 h-10 flex items-center justify-center text-brand-violet">
                                    <Trophy size={28} />
                                 </div>
                                 <div className="bg-brand-violet/20 text-brand-violet text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                                    {challenge.participants} Participando
                                 </div>
                              </div>
                              <h4 className="font-bold text-brand-dark dark:text-white text-sm mb-1">{challenge.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{challenge.description}</p>
                              <button 
                                 onClick={() => onJoinChallenge(challenge.id)}
                                 className="w-full bg-brand-violet text-white text-xs font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
                              >
                                 Participar do Desafio
                              </button>
                           </div>
                        )) : (
                           <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center">
                              <p className="text-xs text-slate-500">Nenhum desafio ativo no momento. Volte em breve!</p>
                           </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">Comunidade de Orações</h3>
                        {intentions.map((intention) => (
                           <div key={intention.id} className="bg-white dark:bg-[#1A1F26] p-6 rounded-[2rem] shadow-card border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:shadow-lg transition-all">
                              <div className="flex justify-between items-start mb-3">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300 overflow-hidden border border-slate-200 dark:border-white/5">
                                          {intention.authorAvatar ? <img src={intention.authorAvatar} className="w-full h-full object-cover" /> : intention.author.charAt(0)}
                                       </div>
                                       <span className="font-bold text-brand-dark dark:text-white text-sm">{intention.author}</span>
                                       <span className="text-[10px] text-slate-400">• {new Date(intention.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                       intention.category === 'health' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-900/30' :
                                       intention.category === 'family' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-900/30' :
                                       'bg-slate-100 dark:bg-white/10 text-slate-500 border-slate-200 dark:border-white/20'
                                    }`}>
                                       {intention.category === 'health' ? 'Saúde' : intention.category === 'family' ? 'Família' : intention.category || 'Intenção'}
                                    </span>
                                 </div>
                                 <button 
                                    onClick={() => onPray(intention.id)}
                                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${intention.isPrayedByUser ? 'text-brand-violet' : 'text-slate-400 hover:text-brand-violet'}`}
                                 >
                                    <Flame size={24} fill={intention.isPrayedByUser ? "currentColor" : "none"} className={intention.isPrayedByUser ? "animate-pulse" : ""} />
                                    <span className="text-[10px] font-bold">{intention.prayingCount}</span>
                                 </button>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                 "{intention.content}"
                              </p>
                              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                 <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1A1F26]" />)}
                                 </div>
                                 <button 
                                    onClick={() => onPray(intention.id)}
                                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${intention.isPrayedByUser ? 'bg-brand-violet/10 text-brand-violet' : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                 >
                                    {intention.isPrayedByUser ? 'Em oração' : 'Rezar agora'}
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'feed' && (
                  <div className="animate-slide-up">
                     <CommunityFeed user={user} initialContent={feedInitialContent} />
                  </div>
               )}

               {activeTab === 'ranking' && (
                  <div className="lg:hidden animate-slide-up pb-24">
                     <LeaderboardWidget user={user} />
                  </div>
               )}

            </div>

            <div className="hidden lg:block lg:col-span-4 space-y-6">
               <div className="sticky top-24">
                  <LeaderboardWidget user={user} />
                  <div className="mt-6 bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                     <h3 className="font-bold text-lg mb-2 relative z-10">Convide amigos</h3>
                     <p className="text-purple-100 text-xs mb-4 relative z-10 leading-relaxed">A fé cresce quando é partilhada. Traga alguém para caminhar com você.</p>
                     <button 
                        onClick={handleShareApp}
                        className="w-full bg-white text-brand-violet font-bold py-3 rounded-xl text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                     >
                        <Share2 size={14} /> Compartilhar App
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Community;
