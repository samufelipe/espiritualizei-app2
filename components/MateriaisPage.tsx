import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Loader2, LogIn, KeyRound,
  Compass, CalendarCheck, Sparkles, PenLine,
  ExternalLink, ArrowRight, Lock, AlertCircle, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { loginUser, registerUser, getSession, sendPasswordResetEmail, SUPABASE_URL, SUPABASE_KEY } from '../services/authService';
import { fetchQuizSessionByEmail } from '../services/quizImportService';
import type { QuizImport } from '../services/quizImportService';

// Três estados do fluxo de acesso
// 'detect'      → verificando URL/sessão (loading inicial)
// 'verifying'   → chamando verify-purchase-email no servidor
// 'not_eligible'→ e-mail não tem compra confirmada no banco
// 'create'      → elegível: formulário de criar senha (apenas via link do e-mail)
// 'login'       → formulário de login (acesso direto sem link)
// 'loading'     → buscando materiais após autenticação
// 'materials'   → materiais liberados
// 'reset_sent'  → link de recuperação enviado
type Step = 'detect' | 'verifying' | 'not_eligible' | 'create' | 'login' | 'loading' | 'materials' | 'reset_sent';

const QUIZ_BASE = 'https://www.espiritualizei.com/quiz';

async function verifyPurchase(email: string, stripeSessionId: string): Promise<boolean> {
  if (!email || !SUPABASE_URL) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-purchase-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), stripe_session_id: stripeSessionId || undefined }),
    });
    const data = await res.json();
    return data?.eligible === true;
  } catch {
    return false;
  }
}

const HeartLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#A78BFA">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function MateriaisPage({ onOpenApp }: { onOpenApp?: () => void }) {
  const [step, setStep]               = useState<Step>('detect');
  const [email, setEmail]             = useState('');
  const [firstName, setFirstName]     = useState('');
  const [sessionParam, setSessionParam] = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState('');
  const [busy, setBusy]               = useState(false);
  const [materials, setMaterials]     = useState<QuizImport | null>(null);
  const [userFirstName, setUserFirstName] = useState('');

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const ep = params.get('email')   ? decodeURIComponent(params.get('email')!)   : '';
      const np = params.get('name')    ? decodeURIComponent(params.get('name')!)    : '';
      const sp = params.get('session') ? decodeURIComponent(params.get('session')!) : '';

      setEmail(ep);
      setFirstName(np.split(' ')[0] || '');
      setSessionParam(sp);

      // Limpar URL imediatamente (não expõe dados na barra do navegador)
      window.history.replaceState({}, '', '/materiais');

      // 1. Já tem sessão ativa → pular direto para materiais
      const existing = getSession();
      if (existing?.user?.id && existing.user.id !== 'guest' && Date.now() < existing.expiresAt) {
        loadMaterials(existing.user.email || ep);
        return;
      }

      // 2. Sem link do e-mail (acesso direto) → somente login
      if (!ep || !sp) {
        setStep('login');
        return;
      }

      // 3. Veio pelo link do e-mail → verificar elegibilidade no servidor
      setStep('verifying');
      const eligible = await verifyPurchase(ep, sp);

      if (eligible) {
        setStep('create');
      } else {
        setStep('not_eligible');
      }
    })();
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

    // Double-check server-side antes de criar a conta (defesa em profundidade)
    const eligible = await verifyPurchase(email, sessionParam);
    if (!eligible) {
      setError('Nao foi possivel confirmar sua compra. Verifique o e-mail de confirmacao e tente novamente.');
      setBusy(false);
      return;
    }

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
        // Conta já existe: vai para login com mensagem clara
        setError('');
        setPassword(''); setConfirm('');
        setStep('login');
        setError('Voce ja criou sua senha antes. Entre com seu e-mail e senha abaixo.');
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

  // ── RENDER STATES ─────────────────────────────────────────────────────────

  // Detect / Verifying
  if (step === 'detect' || step === 'verifying') return (
    <PageShell>
      <Loader2 className="animate-spin text-brand-violet" size={32} />
      <p className="text-sm text-slate-400 mt-4">
        {step === 'verifying' ? 'Verificando sua compra...' : 'Carregando...'}
      </p>
    </PageShell>
  );

  // Loading materials
  if (step === 'loading') return (
    <PageShell>
      <Loader2 className="animate-spin text-brand-violet" size={32} />
      <p className="text-sm text-slate-400 mt-4">Carregando seus materiais...</p>
    </PageShell>
  );

  // E-mail sem compra confirmada
  if (step === 'not_eligible') return (
    <PageShell>
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Compra nao encontrada</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          Nao encontramos uma compra confirmada para este link. Verifique se voce clicou no botao correto do e-mail de confirmacao.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Se voce ja fez a compra e esta tendo problemas, fale com a gente pelo e-mail <strong className="text-slate-300">contato@espiritualizei.com</strong>
        </p>
        <button
          onClick={() => { setStep('login'); setError(''); }}
          className="text-brand-violet text-sm font-bold underline"
        >
          Ja tenho uma senha, entrar
        </button>
      </div>
    </PageShell>
  );

  // Reset enviado
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
        >
          Voltar para o login
        </button>
      </div>
    </PageShell>
  );

  // ── AUTH FORMS (create | login) ─────────────────────────────────────────────
  if (step === 'create' || step === 'login') {
    const isCreate = step === 'create';
    return (
      <div className="min-h-screen bg-[#0F1419] text-white">

        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-2">
          <HeartLogo />
          <span className="text-sm font-bold text-white/60 tracking-wide">Espiritualizei</span>
        </div>

        <div className="max-w-md mx-auto px-5 pb-16">

          {/* Contexto: o que é esta página */}
          <div className="bg-emerald-500/8 border border-emerald-500/18 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-300 uppercase tracking-wider mb-0.5">
                Area exclusiva de materiais
              </p>
              <p className="text-xs text-emerald-200/65 leading-relaxed">
                Esta pagina e o seu espaco privado para acessar os materiais da sua compra. Ela e diferente do aplicativo Espiritualizei.
              </p>
            </div>
          </div>

          {/* Headline + sub */}
          <h1 className="text-2xl font-black text-white leading-tight mb-1">
            {isCreate
              ? (firstName ? `${firstName}, crie sua senha de acesso` : 'Crie sua senha de acesso')
              : 'Acessar meus materiais'}
          </h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {isCreate
              ? 'Voce esta criando uma senha permanente para acessar seus materiais. Use qualquer senha que voce va lembrar.'
              : 'Entre com o e-mail e a senha que voce cadastrou para acessar seus materiais.'}
          </p>

          {/* Preview dos materiais — contexto visual antes do form */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">O que voce vai acessar aqui</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Diagnostico Espiritual', color: 'bg-brand-violet',  text: 'text-brand-violet'  },
                { label: 'Plano de 21 Dias',       color: 'bg-emerald-400',   text: 'text-emerald-400'   },
                { label: 'Minha Novena',            color: 'bg-amber-400',     text: 'text-amber-400'     },
                { label: 'Cartas para Deus',        color: 'bg-sky-400',       text: 'text-sky-400'       },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.color}`} />
                  <span className={`text-xs font-semibold ${m.text}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                E-mail usado na compra
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                readOnly={isCreate && !!email}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/60 text-sm ${isCreate && email ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              {isCreate && email && (
                <p className="text-[11px] text-slate-500 mt-1 ml-1">E-mail verificado e bloqueado para seguranca.</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {isCreate ? 'Escolha uma senha' : 'Senha'}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isCreate ? 'Minimo 6 caracteres' : 'Sua senha'}
                  onKeyDown={e => e.key === 'Enter' && !isCreate && handleLogin()}
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Confirme a senha</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha escolhida"
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
              className="w-full bg-brand-violet hover:bg-brand-violet/90 active:scale-[.98] text-white font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
              {busy
                ? <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                : isCreate
                  ? <><KeyRound size={16} /> Salvar senha e ver meus materiais</>
                  : <><LogIn size={16} /> Entrar e ver meus materiais</>}
            </button>
          </div>

          {/* Acoes secundarias */}
          <div className="text-center space-y-2 mt-5">
            {isCreate ? (
              <p className="text-xs text-slate-500">
                Ja criou sua senha antes?{' '}
                <button
                  onClick={() => { setError(''); setPassword(''); setConfirm(''); setStep('login'); }}
                  className="text-brand-violet font-bold underline"
                >
                  Entrar com minha senha
                </button>
              </p>
            ) : (
              <>
                <button onClick={handleReset} disabled={busy} className="text-xs text-slate-500 underline hover:text-slate-300 block mx-auto">
                  Esqueci minha senha
                </button>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Para criar seu acesso, clique no botao do e-mail de confirmacao de compra que voce recebeu.
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 mt-5">
            <Lock size={11} />
            <span>Acesso exclusivo e permanente aos seus materiais</span>
          </div>

        </div>
      </div>
    );
  }

  // ── MATERIALS VIEW ──────────────────────────────────────────────────────────
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

      {/* Grid ou estado vazio */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {!sid ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-brand-violet/10 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={28} className="text-brand-violet" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Materiais nao encontrados</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Verifique se voce esta usando o mesmo e-mail da compra. Se precisar de ajuda, fale com a gente em <strong className="text-slate-300">contato@espiritualizei.com</strong>
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
