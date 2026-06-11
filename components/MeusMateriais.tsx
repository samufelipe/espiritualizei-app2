import React from 'react';
import { QuizImport } from '../services/quizImportService';
import { Compass, CalendarCheck, Sparkles, PenLine, ExternalLink, ArrowRight, Lock } from 'lucide-react';

interface MeusMateriaisProps {
  data: QuizImport | null;
}

const QUIZ_BASE = 'https://www.espiritualizei.com/quiz';

const MeusMateriais: React.FC<MeusMateriaisProps> = ({ data }) => {
  const sid = data?.stripeSessionId;
  const name = data?.name || '';
  const challenge = data?.quizData?.answers?.challenge || 'anxiety';

  // Estado vazio gentil: usuário logado mas sem compra ligada a este e-mail.
  if (!data?.found || !sid) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D1117] pb-32 animate-fade-in">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-brand-violet/10 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={28} className="text-brand-violet" />
            </div>
            <h2 className="text-xl font-black text-brand-dark dark:text-white mb-2">Seus materiais aparecem aqui</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Assim que sua compra estiver ligada a este e-mail, seu Diagnóstico, Plano de 21 Dias, Novena e Cartas para Deus ficam guardados nesta aba.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const enc = encodeURIComponent;
  const items = [
    {
      icon: Compass,
      title: 'Diagnóstico Completo',
      desc: 'Seu mapa espiritual com dons, raízes e próximos passos.',
      href: `${QUIZ_BASE}/resultado?session=${enc(sid)}`,
      tint: 'from-brand-violet/15 to-purple-500/5 border-brand-violet/25',
      iconColor: 'text-brand-violet',
    },
    {
      icon: CalendarCheck,
      title: 'Plano de 21 Dias',
      desc: 'Intenção, oração, prática e versículo para cada dia.',
      href: `${QUIZ_BASE}/resultado?session=${enc(sid)}`,
      tint: 'from-emerald-500/15 to-green-500/5 border-emerald-500/25',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Sparkles,
      title: 'Minha Novena',
      desc: '9 dias de oração feitos para o seu desafio real.',
      href: `${QUIZ_BASE}/minha-novena.html?session=${enc(sid)}`,
      tint: 'from-amber-400/15 to-yellow-500/5 border-amber-400/25',
      iconColor: 'text-amber-400',
    },
    {
      icon: PenLine,
      title: 'Cartas para Deus',
      desc: 'Convites diários para escrever o seu coração a Deus.',
      href: `${QUIZ_BASE}/cartas-para-deus.html?name=${enc(name)}&challenge=${enc(challenge)}&session=${enc(sid)}`,
      tint: 'from-sky-400/15 to-cyan-500/5 border-sky-400/25',
      iconColor: 'text-sky-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1117] pb-32 animate-fade-in">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/20 via-purple-900/8 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-brand-violet/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <Lock size={11} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Acesso permanente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">Meus Materiais</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-md leading-relaxed">
            Tudo o que é seu, guardado na sua conta. Abra quando e onde quiser.
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-brand-violet/25 to-transparent" />
      </div>

      {/* Grid */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-3xl border p-5 bg-gradient-to-br ${item.tint} transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer flex flex-col`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center ${item.iconColor}`}>
                  <item.icon size={24} strokeWidth={2} />
                </div>
                <ExternalLink size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
              <h3 className="font-black text-white text-base mb-1 relative z-10">{item.title}</h3>
              <p className="text-xs text-white/55 leading-relaxed relative z-10 flex-1">{item.desc}</p>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-white/70 group-hover:text-white transition-colors relative z-10">
                Abrir <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6 leading-relaxed px-4">
          Estes materiais abrem em uma nova aba. Eles estão sempre aqui, ligados ao seu acesso.
        </p>
      </div>

    </div>
  );
};

export default MeusMateriais;
