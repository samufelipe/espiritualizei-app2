import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Loader2, LogIn, KeyRound,
  Compass, CalendarCheck, Sparkles, PenLine,
  ExternalLink, ArrowRight, Lock, AlertCircle, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { loginUser, registerUser, getSession, sendPasswordResetEmail, SUPABASE_URL, SUPABASE_KEY } from '../services/authService';
import { fetchQuizSessionByEmail } from '../services/quizImportService';
import type { QuizImport } from '../services/quizImportService';

type Step = 'detect' | 'verifying' | 'not_eligible' | 'create' | 'login' | 'loading' | 'materials' | 'reset_sent';

const QUIZ_BASE = 'https://www.espiritualizei.com/quiz';

interface VerifyResult { eligible: boolean; hasAccount: boolean }

async function verifyPurchase(email: string, stripeSessionId: string): Promise<VerifyResult> {
  if (!email || !SUPABASE_URL) return { eligible: false, hasAccount: false };
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
    return { eligible: data?.eligible === true, hasAccount: data?.hasAccount === true };
  } catch {
    return { eligible: false, hasAccount: false };
  }
}

const Logo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#A78BFA">
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
  const [info, setInfo]               = useState('');
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

      window.history.replaceState({}, '', '/materiais');

      const existing = getSession();
      if (existing?.user?.id && existing.user.id !== 'guest' && Date.now() < existing.expiresAt) {
        loadMaterials(existing.user.email || ep);
        return;
      }

      if (!ep || !sp) {
        setStep('login');
        return;
      }

      setStep('verifying');
      const { eligible, hasAccount } = await verifyPurchase(ep, sp);

      if (!eligible) {
        setStep('not_eligible');
      } else if (hasAccount) {
        setStep('login');
        setInfo('Voce ja criou sua senha de acesso. Entre com seu e-mail e senha abaixo.');
      } else {
        setStep('create');
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
    setError(''); setInfo('');
    setBusy(true);

    const { eligible, hasAccount } = await verifyPurchase(email, sessionParam);
    if (!eligible) {
      setError('Nao foi possivel confirmar sua compra. Verifique o e-mail de confirmacao e tente novamente.');
      setBusy(false);
      return;
    }
    if (hasAccount) {
      setPassword(''); setConfirm('');
      setStep('login');
      setInfo('Voce ja criou sua senha de acesso. Entre com seu e-mail e senha abaixo.');
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
        setPassword(''); setConfirm('');
        setStep('login');
        setInfo('Voce ja criou sua senha antes. Entre com seu e-mail e senha abaixo.');
      } else {
        setError(msg || 'Erro ao criar acesso. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) { setError('Preencha e-mail e senha.'); return; }
    setError(''); setInfo('');
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
    setError(''); setInfo('');
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

  // ── LOADING STATES ────────────────────────────────────────────────────────────

  if (step === 'detect' || step === 'verifying' || step === 'loading') return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col items-center justify-center gap-4">
      <Logo size={36} />
      <Loader2 className="animate-spin text-[#A78BFA]" size={24} />
      <p className="text-sm text-slate-500">
        {step === 'verifying' ? 'Verificando sua compra...' : 'Carregando...'}
      </p>
    </div>
  );

  // ── NOT ELIGIBLE ──────────────────────────────────────────────────────────────

  if (step === 'not_eligible') return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Compra nao encontrada</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-2">
          Nao encontramos uma compra confirmada para este link. Verifique se voce clicou no botao correto do e-mail de confirmacao.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-8">
          Precisa de ajuda? Fale com a gente em{' '}
          <strong className="text-slate-300">contato@espiritualizei.com</strong>
        </p>
        <button
          onClick={() => { setStep('login'); setError(''); setInfo(''); }}
          className="text-[#A78BFA] text-sm font-bold underline"
        >
          Ja tenho uma senha, entrar
        </button>
      </div>
    </div>
  );

  // ── RESET SENT ────────────────────────────────────────────────────────────────

  if (step === 'reset_sent') return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm text-center">
        <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">E-mail enviado</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Verifique sua caixa de entrada e clique no link para criar uma nova senha. Depois volte aqui para entrar.
        </p>
        <button
          onClick={() => setStep('login')}
          className="text-[#A78BFA] text-sm font-bold underline"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );

  // ── AUTH FORMS (create | login) ───────────────────────────────────────────────

  if (step === 'create' || step === 'login') {
    const isCreate = step === 'create';
    return (
      <div className="min-h-screen bg-[#0A0E14] flex flex-col">

        {/* Glow de fundo */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#A78BFA]/8 rounded-full blur-[120px]" />
        </div>

        {/* Corpo centralizado */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 relative z-10">

          {/* Logo + marca */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <Logo size={40} />
            <span className="text-xs font-bold text-white/40 tracking-[3px] uppercase">Espiritualizei</span>
          </div>

          {/* Card principal */}
          <div className="w-full max-w-sm">

            {/* Headline */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-white leading-tight mb-1.5">
                {isCreate
                  ? (firstName ? `${firstName}, crie sua senha` : 'Crie sua senha de acesso')
                  : 'Meus Materiais'}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                {isCreate
                  ? 'Uma senha permanente para acessar seus materiais quando quiser.'
                  : 'Entre com o e-mail e senha que voce cadastrou.'}
              </p>
            </div>

            {/* Banner de informacao (retornante ou outro) */}
            {info && (
              <div className="flex items-start gap-2.5 bg-[#A78BFA]/10 border border-[#A78BFA]/25 rounded-2xl p-3.5 mb-5">
                <ShieldCheck size={15} className="text-[#A78BFA] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#C4B5FD] leading-relaxed">{info}</p>
              </div>
            )}

            {/* Aviso de area exclusiva */}
            {!info && (
              <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-2xl px-3.5 py-2.5 mb-5">
                <Lock size={11} className="text-emerald-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-500">
                  Area exclusiva — diferente do aplicativo Espiritualizei
                </p>
              </div>
            )}

            {/* Campos */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {isCreate ? 'E-mail usado na compra' : 'E-mail'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="seu@email.com"
                  readOnly={isCreate && !!email}
                  className={`w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#A78BFA]/50 focus:bg-white/6 transition-all text-sm ${isCreate && email ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {isCreate && email && (
                  <p className="text-[10px] text-slate-600 mt-1 ml-1">Verificado e bloqueado para seguranca.</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {isCreate ? 'Escolha uma senha' : 'Senha'}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder={isCreate ? 'Minimo 6 caracteres' : 'Sua senha'}
                    onKeyDown={e => e.key === 'Enter' && !isCreate && handleLogin()}
                    className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-[#A78BFA]/50 focus:bg-white/6 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {isCreate && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Confirme a senha
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repita a senha escolhida"
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#A78BFA]/50 focus:bg-white/6 transition-all text-sm"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-2xl p-3.5">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                onClick={isCreate ? handleCreate : handleLogin}
                disabled={busy}
                className="w-full bg-[#A78BFA] hover:bg-[#9370f0] active:scale-[.98] text-white font-black py-3.5 rounded-2xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              >
                {busy
                  ? <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                  : isCreate
                    ? <><KeyRound size={16} /> Criar acesso e ver meus materiais</>
                    : <><LogIn size={16} /> Entrar e ver meus materiais</>}
              </button>
            </div>

            {/* Acoes secundarias */}
            <div className="text-center space-y-3 mt-5">
              {isCreate ? (
                <p className="text-xs text-slate-600">
                  Ja criou sua senha?{' '}
                  <button
                    onClick={() => { setError(''); setInfo(''); setPassword(''); setConfirm(''); setStep('login'); }}
                    className="text-[#A78BFA] font-bold"
                  >
                    Entrar com minha senha
                  </button>
                </p>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    disabled={busy}
                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Para criar seu acesso, clique no botao do e-mail de confirmacao de compra que voce recebeu.
                  </p>
                </>
              )}
            </div>

            {/* Preview discreto dos materiais */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center mb-3">
                O que voce vai acessar
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {[
                  { label: 'Diagnostico Espiritual', color: '#A78BFA' },
                  { label: 'Plano de 21 Dias',       color: '#34D399' },
                  { label: 'Minha Novena',            color: '#FBBF24' },
                  { label: 'Cartas para Deus',        color: '#38BDF8' },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <span className="text-[11px] text-slate-500">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── MATERIALS VIEW ────────────────────────────────────────────────────────────

  const sid       = materials?.stripeSessionId;
  const name      = userFirstName || materials?.name?.split(' ')[0] || '';
  const challenge = materials?.quizData?.answers?.challenge || 'anxiety';

  const items = sid ? [
    {
      icon: Compass,
      title: 'Diagnostico Completo',
      desc: 'Seu mapa espiritual com dons, raizes e proximos passos.',
      href: `${QUIZ_BASE}/resultado?session=${encodeURIComponent(sid)}`,
      accent: '#A78BFA',
      bg: 'rgba(167,139,250,0.07)',
      border: 'rgba(167,139,250,0.18)',
    },
    {
      icon: CalendarCheck,
      title: 'Plano de 21 Dias',
      desc: 'Intencao, oracao, pratica e versiculo para cada dia.',
      href: `${QUIZ_BASE}/resultado?session=${encodeURIComponent(sid)}`,
      accent: '#34D399',
      bg: 'rgba(52,211,153,0.07)',
      border: 'rgba(52,211,153,0.18)',
    },
    {
      icon: Sparkles,
      title: 'Minha Novena',
      desc: '9 dias de oracao feitos para o seu desafio real.',
      href: `${QUIZ_BASE}/minha-novena.html?session=${encodeURIComponent(sid)}`,
      accent: '#FBBF24',
      bg: 'rgba(251,191,36,0.07)',
      border: 'rgba(251,191,36,0.18)',
    },
    {
      icon: PenLine,
      title: 'Cartas para Deus',
      desc: 'Convites diarios para escrever o seu coracao a Deus.',
      href: `${QUIZ_BASE}/cartas-para-deus.html?name=${encodeURIComponent(name)}&challenge=${encodeURIComponent(challenge)}&session=${encodeURIComponent(sid)}`,
      accent: '#38BDF8',
      bg: 'rgba(56,189,248,0.07)',
      border: 'rgba(56,189,248,0.18)',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0A0E14] text-white">

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#A78BFA]/6 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0E14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-bold text-white/50 text-sm tracking-wide">Espiritualizei</span>
          </div>
          {onOpenApp && (
            <button
              onClick={onOpenApp}
              className="text-xs font-bold text-[#A78BFA] hover:text-[#C4B5FD] transition-colors flex items-center gap-1"
            >
              Abrir o App <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-6 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px]">Acesso permanente</span>
        </div>
        <h1 className="text-3xl font-black text-white leading-tight mb-2">
          {name ? `${name}, seus materiais\nestao aqui.` : 'Meus Materiais'}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
          Tudo o que e seu, guardado na sua conta. Abra quando quiser.
        </p>
        <div className="h-px bg-gradient-to-r from-[#A78BFA]/20 via-[#A78BFA]/8 to-transparent mt-7" />
      </div>

      {/* Grid */}
      <div className="max-w-2xl mx-auto px-5 pb-16 relative z-10">
        {!sid ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-[#A78BFA]/10 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={28} className="text-[#A78BFA]" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Materiais nao encontrados</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
              Verifique se voce esta usando o mesmo e-mail da compra. Se precisar de ajuda, escreva para{' '}
              <strong className="text-slate-300">contato@espiritualizei.com</strong>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(item => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-3xl p-5 flex flex-col transition-all active:scale-[0.98]"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: `${item.accent}18` }}
                  >
                    <item.icon size={22} style={{ color: item.accent }} strokeWidth={2} />
                  </div>
                  <ExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors mt-1" />
                </div>
                <h3 className="font-black text-white text-[15px] mb-1">{item.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed flex-1">{item.desc}</p>
                <div
                  className="flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors"
                  style={{ color: `${item.accent}aa` }}
                >
                  Abrir <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" style={{ color: item.accent }} />
                </div>
              </a>
            ))}
          </div>
        )}

        {sid && (
          <p className="text-center text-[11px] text-slate-700 mt-6">
            Materiais abrem em nova aba. Ligados permanentemente ao seu e-mail.
          </p>
        )}
      </div>
    </div>
  );
}
