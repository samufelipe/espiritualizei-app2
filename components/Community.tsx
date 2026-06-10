
import React, { useState } from 'react';
import { PrayerIntention, CommunityChallenge, UserProfile } from '../types';
import { Flame, Share2, ChevronDown, ChevronUp, Zap, Trophy, CheckCircle2 } from 'lucide-react';
import CommunityFeed from './CommunityFeed';
import LiturgicalEvents from './LiturgicalEvents';
import LeaderboardWidget from './LeaderboardWidget';

interface CommunityProps {
  intentions: PrayerIntention[];
  challenges: CommunityChallenge[];
  onPray: (id: string) => void;
  onJoinChallenge: (id: string, amount?: number) => void;
  onOpenCreateModal: () => void;
  onTestify: (content: string) => void;
  feedInitialContent?: string;
  initialTab?: 'comunidade' | 'feed';
  user: UserProfile;
}

const Community: React.FC<CommunityProps> = ({
  intentions,
  challenges,
  onPray,
  onJoinChallenge,
  onTestify,
  feedInitialContent,
  user,
}) => {
  const [showIntentions, setShowIntentions] = useState(false);

  const handleShareApp = () => {
    const text = encodeURIComponent(
      'Olá! Queria te convidar para conhecer o Espiritualizei, um app que está me ajudando muito na minha caminhada espiritual.\n\nConheça aqui: https://www.espiritualizei.com/'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const activeChallenge = challenges.find(c => c.status === 'active');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1117] pb-32 animate-fade-in">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/20 via-purple-900/8 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-brand-violet/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 px-4 sm:px-6 pt-6 pb-6">
          <div className="max-w-2xl lg:max-w-none mx-auto flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ao vivo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">Comunidade</h1>
              <p className="text-sm text-slate-400 mt-0.5">Partilhe, ore e cresça junto</p>
            </div>
            <button
              onClick={handleShareApp}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/90 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <Share2 size={13} /> Convidar
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-brand-violet/25 to-transparent" />
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">

          {/* ── Main Column ── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Desafio Comunitário em destaque */}
            {activeChallenge && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <div className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
                    <Zap size={10} className="text-amber-400" fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desafio da Comunidade</span>
                </div>

                {/* Challenge card */}
                <div
                  className={`relative overflow-hidden rounded-3xl border p-5 cursor-pointer transition-all active:scale-[0.99] shadow-sm
                    ${activeChallenge.isUserParticipating
                      ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20'
                      : 'bg-gradient-to-br from-brand-violet/12 to-purple-500/5 border-brand-violet/25 hover:border-brand-violet/45'
                    }`}
                  onClick={() => onJoinChallenge(activeChallenge.id)}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-brand-violet/8 rounded-full blur-2xl -mr-8 -mt-8" />

                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center
                      ${activeChallenge.isUserParticipating ? 'bg-emerald-500/15 text-emerald-400' : 'bg-brand-violet/15 text-brand-violet'}`}>
                      {activeChallenge.isUserParticipating
                        ? <CheckCircle2 size={26} strokeWidth={2.5} />
                        : <Trophy size={26} strokeWidth={2} />
                      }
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide
                      ${activeChallenge.isUserParticipating
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-brand-violet/15 text-brand-violet'
                      }`}>
                      {activeChallenge.participants} participando
                    </span>
                  </div>

                  <h4 className="font-black text-white text-base sm:text-lg mb-1.5 relative z-10 leading-snug">
                    {activeChallenge.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 relative z-10 leading-relaxed">
                    {activeChallenge.description}
                  </p>

                  <button
                    onClick={e => { e.stopPropagation(); onJoinChallenge(activeChallenge.id); }}
                    className={`w-full text-white text-sm font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all relative z-10
                      ${activeChallenge.isUserParticipating ? 'bg-emerald-500' : 'bg-brand-violet'}`}
                  >
                    {activeChallenge.isUserParticipating ? 'Ver Desafio de Hoje' : 'Participar do Desafio'}
                  </button>
                </div>

                {/* LiturgicalEvents interactive banner */}
                <div className="mt-3">
                  <LiturgicalEvents
                    challenges={challenges}
                    onJoin={onJoinChallenge}
                    onTestify={onTestify}
                  />
                </div>
              </div>
            )}

            {/* Divider + label */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Mural da Comunidade
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
            </div>

            {/* Community Feed — sempre visível, nunca mais escondido */}
            <CommunityFeed user={user} initialContent={feedInitialContent} />

          </div>

          {/* ── Desktop Sidebar ── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">

              {intentions.length > 0 && (
                <div className="bg-white dark:bg-[#1A1F26] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                      <Flame size={14} className="text-brand-violet" /> Intenções de Oração
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-white/5 max-h-72 overflow-y-auto">
                    {intentions.slice(0, 6).map(intention => (
                      <div key={intention.id} className="px-4 py-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-xs shrink-0 mt-0.5 overflow-hidden">
                          {intention.authorAvatar
                            ? <img src={intention.authorAvatar} className="w-full h-full object-cover" alt={intention.author} />
                            : intention.author.charAt(0)
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-brand-dark dark:text-white truncate">{intention.author}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">{intention.content}</p>
                        </div>
                        <button
                          onClick={() => onPray(intention.id)}
                          className={`shrink-0 transition-all active:scale-90 pt-0.5 ${intention.isPrayedByUser ? 'text-brand-violet' : 'text-slate-300 hover:text-brand-violet'}`}
                        >
                          <Flame size={17} fill={intention.isPrayedByUser ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <LeaderboardWidget user={user} />

              <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                <h3 className="font-bold text-base mb-1.5 relative z-10">Convide amigos</h3>
                <p className="text-purple-100 text-xs mb-4 relative z-10 leading-relaxed">A fé cresce quando é partilhada. Traga alguém para caminhar com você.</p>
                <button
                  onClick={handleShareApp}
                  className="w-full bg-white text-brand-violet font-black py-3 rounded-xl text-xs shadow-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
                >
                  <Share2 size={14} /> Compartilhar App
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile: Prayer Intentions Collapsible ── */}
      <div className="lg:hidden mt-6 px-4 sm:px-6">
        {intentions.length > 0 && (
          <div className="bg-white dark:bg-[#1A1F26] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowIntentions(v => !v)}
              className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-white/5 transition-colors"
            >
              <span className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                <Flame size={14} className="text-brand-violet" />
                Intenções de Oração
                <span className="text-[10px] font-black text-brand-violet bg-brand-violet/10 px-1.5 py-0.5 rounded-full">
                  {intentions.length}
                </span>
              </span>
              {showIntentions
                ? <ChevronUp size={16} className="text-slate-400 shrink-0" />
                : <ChevronDown size={16} className="text-slate-400 shrink-0" />
              }
            </button>

            {showIntentions && (
              <div className="divide-y divide-slate-50 dark:divide-white/5 animate-slide-up">
                {intentions.map(intention => (
                  <div key={intention.id} className="px-5 py-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-xs shrink-0 mt-0.5 overflow-hidden">
                      {intention.authorAvatar
                        ? <img src={intention.authorAvatar} className="w-full h-full object-cover rounded-full" alt={intention.author} />
                        : intention.author.charAt(0)
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-brand-dark dark:text-white">{intention.author}</p>
                        <span className="text-[9px] text-slate-400">{new Date(intention.timestamp).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">"{intention.content}"</p>
                    </div>
                    <button
                      onClick={() => onPray(intention.id)}
                      className={`flex flex-col items-center gap-0.5 transition-all active:scale-90 shrink-0 ${intention.isPrayedByUser ? 'text-brand-violet' : 'text-slate-300 hover:text-brand-violet'}`}
                    >
                      <Flame size={22} fill={intention.isPrayedByUser ? 'currentColor' : 'none'} className={intention.isPrayedByUser ? 'animate-pulse' : ''} />
                      <span className="text-[10px] font-bold">{intention.prayingCount}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Community;
