import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Heart, Loader2, LogIn, KeyRound,
  Compass, CalendarCheck, Sparkles, PenLine,
  ExternalLink, ArrowRight, Lock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { loginUser, registerUser, getSession, sendPasswordResetEmail } from '../services/authService';
import { fetchQuizSessionByEmail } from '../services/quizImportService';
import type { QuizImport } from '../services/quizImportService';

type Step = 'detect' | 'create' | 'login' | 'loading' | 'materials' | 'reset_sent';

const QUIZ_BASE = 'https://www.espiritualizei.com/quiz';

const HeartLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#A78BFA">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function MateriaisPage({ onOpenApp }: { onOpenApp?: () => void }) {
  const [step, setStep] = useState<Step>('detect');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [sessionParam, setSessionParam] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [materials, setMaterials] = useState<QuizImport | null>(null);
  const [userFirstName, setUserFirstName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ep    = params.get('email')   ? decodeURIComponent(params.get('email')!)   : '';
    const np    = params.get('name')    ? decodeURIComponent(params.get('name')!)    : '';
    const sp    = params.get('session') ? decodeURIComponent(params.get('session')!) : '';

    setEmail(ep);
    setFirstName(np.split(' ')[0] || '');
    setSessionParam(sp);

    window.history.replaceState({}, '', '/materiais');

    // If there's an active session, jump straight to materials
    const existing = getSession();
    if (existing?.user?.id && existing.user.id !== 'guest' && Date.now() < existing.expiresAt) {
      loadMaterials(existing.user.email || ep);
      return;
    }

    // New user with email param → create password form
    if (ep) {
      setStep('create');
    } else {
      setStep('login');
    }
  }, []);

  async function loadMaterials(userEmail: string) {
    setStep('loading');
    try {
      const data = await fetchQuizSessionByEmail(userEmail);
      if (data?.found && !data.stripeSessionId) {
        const stored = localStorage.getItem('espiritualizei_quiz_stripe_session');
        if (stored && data) (data as any).stripeSessionId = stored;
      }
      setMaterials(data);
      if (data?.name) setUserFirstName(data.name.split(' ')[0]);
    } catch (_) {}
    setStep('materials');
  }

  async function handleCreate() {
    if (!email || !password || !confirm) { setError('Preencha todos os campos.'); return; }
    if (password.length < 6) { setError('A senha precisa ter ao menos 6 caracteres.'); return; }
    if (password !== confirm) { setError('As senhas nao coincidem.'); return; }
    setError('');
    setBusy(true);
    try {
      const fullName = firstName || email.split('@')[0];
      await registerUser({
        name: fullName, email, password,
        phone: '',
        primaryStruggle: 'anxiety',
        spiritualGoal: 'peace',
        routineType: 'flexible',
        bestMoment: 'morning',
        confessionFrequency: 'rare',
        stateOfLife: 'single',
      });
      if (sessionParam) {
        try { localStorage.setItem('espiritualizei_quiz_stripe_session', sessionParam); } catch (_) {}
      }
      await loadMaterials(email);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('User already')) {
        setError('Este e-mail ja tem um acesso. Entre com sua senha abaixo.');
        setPassword(''); setConfirm('');
        setStep('login');
      } else {
        setError(msg || 'Erro ao criar acesso. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) { setError('Preencha e-mail e senha.'); return; }
    setError('');
    setBusy(true);
    try {
      const session = await loginUser(email.trim(), password);
      if (session?.user) {
        await loadMaterials(email.trim());
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(msg || 'Nao foi possivel entrar. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email) { setError('Informe seu e-mail primeiro.'); return; }
    setError('');
    setBusy(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setStep('reset_sent');
    } catch (_) {
      setError('Nao foi possivel enviar o e-mail. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  // ── Renders ────────────────────────────────────────────────────────────────

  if (step === 'detect') return <PageShell><Loader2 className="animate-spin text-brand-violet" size={32} /></PageShell>;

  if (step === 'loading') return (
    <PageShell>
      <Loader2 className="animate-spin text-brand-violet" size={32} />
      <p className="text-sm text-slate-400 mt-4">Carregando seus materiais...</p>
    </PageShell>
  );

  if (step === 'reset_sent') return (
    <PageShell>
      <div className="text-center max-w-xs">
        <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">E-mail enviado</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Verifique sua caixa de entrada e clique no link para criar uma nova senha. Depois volte aqui para entrar.
        </p>
        <button
          onClick={() => setStep('login')}
          className="mt-6 text-brand-violet text-sm font-bold underline"
        >Voltar para o login</button>
      </div>
    </PageShell>
  );

  if (step === 'create' || step === 'login') {
    const isCreate = step === 'create';
    return (
      <PageShell>
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HeartLogo />
              <span className="font-bold text-white/80 text-sm tracking-wide">Espiritualizei</span>
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">
              {isCreate
                ? (firstName ? `${firstName}, crie sua senha` : 'Crie sua senha de acesso')
                : 'Acessar meus materiais'}
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {isCreate
                ? 'Seus materiais estao prontos. Crie uma senha para acessar tudo.'
                : 'Entre com seu e-mail e senha para ver seus materiais.'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/60 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {isCreate ? 'Criar senha' : 'Senha'}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isCreate ? 'Minimo 6 caracteres' : 'Sua senha'}
                  onKeyDown={e => e.key === 'Enter' && (isCreate ? handleCreate() : handleLogin())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/60 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isCreate && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Confirmar senha</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/60 text-sm"
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl p-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={isCreate ? handleCreate : handleLogin}
              disabled={busy}
              className="w-full bg-brand-violet hover:bg-brand-violet/90 active:scale-[.98] text-white font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy
                ? <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                : isCreate
                  ? <><KeyRound size={16} /> Criar senha e acessar meus materiais</>
                  : <><LogIn size={16} /> Entrar</>}
            </button>
          </div>

          {/* Toggle + reset */}
          <div className="text-center space-y-2">
            {isCreate ? (
              <p className="text-xs text-slate-500">
                Ja tem uma conta?{' '}
                <button onClick={() => { setError(''); setPassword(''); setConfirm(''); setStep('login'); }} className="text-brand-violet font-bold underline">
                  Entrar com minha senha
                </button>
              </p>
            ) : (
              <>
                <button onClick={handleReset} disabled={busy} className="text-xs text-slate-500 underline hover:text-slate-300">
                  Esqueci minha senha
                </button>
                {email && (
                  <p className="text-xs text-slate-500 block">
                    Primeira vez aqui?{' '}
                    <button onClick={() => { setError(''); setPassword(''); setConfirm(''); setStep('create'); }} className="text-brand-violet font-bold underline">
                      Criar minha senha
                    </button>
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 pt-2">
            <Lock size={11} />
            <span>Acesso seguro e permanente</span>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Materials view ─────────────────────────────────────────────────────────
  const sid       = materials?.stripeSessionId;
  const name      = userFirstName || materials?.name?.split(' ')[0] || '';
  const challenge = materials?.quizData?.answers?.challenge || 'anxiety';

  const items = sid ? [
    {
      icon: Compass,
      title: 'Diagnostico Completo',
      desc: 'Seu mapa espiritual com dons, raizes e proximos passos.',
      href: `${QUIZ_BASE}/resultado?session=${encodeURIComponent(sid)}`,
      tint: 'from-brand-violet/15 to-purple-500/5 border-brand-violet/25',
      iconColor: 'text-brand-violet',
    },
    {
      icon: CalendarCheck,
      title: 'Plano de 21 Dias',
      desc: 'Intencao, oracao, pratica e versiculo para cada dia.',
      href: `${QUIZ_BASE}/resultado?session=${encodeURIComponent(sid)}`,
      tint: 'from-emerald-500/15 to-green-500/5 border-emerald-500/25',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Sparkles,
      title: 'Minha Novena',
      desc: '9 dias de oracao feitos para o seu desafio real.',
      href: `${QUIZ_BASE}/minha-novena.html?session=${encodeURIComponent(sid)}`,
      tint: 'from-amber-400/15 to-yellow-500/5 border-amber-400/25',
      iconColor: 'text-amber-400',
    },
    {
      icon: PenLine,
      title: 'Cartas para Deus',
      desc: 'Convites diarios para escrever o seu coracao a Deus.',
      href: `${QUIZ_BASE}/cartas-para-deus.html?name=${encodeURIComponent(name)}&challenge=${encodeURIComponent(challenge)}&session=${encodeURIComponent(sid)}`,
      tint: 'from-sky-400/15 to-cyan-500/5 border-sky-400/25',
      iconColor: 'text-sky-400',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F1419]/90 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartLogo />
          <span className="font-bold text-white/70 text-sm">Espiritualizei</span>
        </div>
        {onOpenApp && (
          <button
            onClick={onOpenApp}
            className="text-xs font-bold text-brand-violet hover:text-brand-violet/80 transition-colors"
          >
            Abrir o App &rarr;
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-8 pb-6 max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-2">
            <Lock size={11} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Acesso permanente</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">
            {name ? `${name}, seus materiais estao aqui.` : 'Meus Materiais'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-md leading-relaxed">
            Tudo o que e seu, guardado na sua conta. Abra quando e onde quiser.
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-brand-violet/25 to-transparent mt-5" />
      </div>

      {/* Grid or empty */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {!sid ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-brand-violet/10 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={28} className="text-brand-violet" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Materiais nao encontrados</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Verifique se voce esta usando o mesmo e-mail da compra. Se precisar de ajuda, fale com a gente em contato@espiritualizei.com
            </p>
          </div>
        ) : (
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
        )}

        {sid && (
          <p className="text-center text-[11px] text-slate-600 mt-6 leading-relaxed">
            Estes materiais abrem em uma nova aba. Ligados permanentemente ao seu e-mail.
          </p>
        )}
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center px-5 py-12">
      <div className="flex items-center gap-2 mb-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#A78BFA">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-sm font-bold text-white/60 tracking-wide">Espiritualizei</span>
      </div>
      {children}
    </div>
  );
}
