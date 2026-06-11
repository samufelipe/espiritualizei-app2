
import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, Lock, Mail, Check, Sparkles } from 'lucide-react';
import { OnboardingData } from '../types';
import BrandLogo from './BrandLogo';

interface QuizWelcomeProps {
  name: string;
  email: string;
  onComplete: (data: OnboardingData) => Promise<void>;
}

const QuizWelcome: React.FC<QuizWelcomeProps> = ({ name, email, onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const firstName = name.split(' ')[0] || name;

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem. Verifique e tente novamente.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onComplete({
        name,
        email,
        password,
        phone: '',
        primaryStruggle: 'anxiety',
        spiritualGoal: 'peace',
        routineType: 'flexible',
        bestMoment: 'morning',
        confessionFrequency: 'rare',
        patronSaint: 'mary',
        stateOfLife: 'single',
      });
    } catch (e: any) {
      let msg = 'Erro ao criar conta. Tente novamente.';
      if (e.message?.includes('User already registered')) {
        msg = 'Este e-mail ja esta cadastrado. Acesse pelo login.';
      } else if (e.message) {
        msg = e.message;
      }
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-5 py-12 animate-fade-in">
      <div className="w-full max-w-sm">

        {/* Logo + badge */}
        <div className="text-center mb-8">
          <BrandLogo size={44} variant="fill" className="text-brand-violet mx-auto mb-5" />

          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-full mb-5">
            <Check size={11} strokeWidth={3} /> Compra confirmada
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Bem-vindo(a),<br />{firstName}!
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
            Seu diagnostico e plano personalizados estao prontos. Crie sua senha para acessar tudo agora.
          </p>
        </div>

        {/* Beneficios rapidos */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-6 space-y-2">
          {[
            'Plano de 21 dias personalizado',
            'Novena criada para seu desafio',
            '7 dias no app Espiritualizei',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-brand-violet/20 flex items-center justify-center shrink-0">
                <Sparkles size={9} className="text-brand-violet" />
              </div>
              <span className="text-xs text-slate-300 font-medium">{item}</span>
            </div>
          ))}
        </div>

        {/* E-mail (somente leitura) */}
        <div className="mb-4">
          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
            E-mail
          </label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3.5">
            <Mail size={15} className="text-slate-500 shrink-0" />
            <span className="text-slate-300 text-sm font-medium flex-1 min-w-0 truncate">{email}</span>
            <Lock size={11} className="text-slate-600 shrink-0" />
          </div>
        </div>

        {/* Senha */}
        <div className="mb-4">
          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
            Crie sua senha
          </label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3.5 focus-within:border-brand-violet/40 transition-colors">
            <Lock size={15} className="text-slate-500 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Minimo 6 caracteres"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirmar senha */}
        <div className="mb-6">
          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
            Confirme a senha
          </label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3.5 focus-within:border-brand-violet/40 transition-colors">
            <Lock size={15} className="text-slate-500 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Repita a senha"
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3 mb-4 leading-relaxed">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!password || !confirmPassword || isSubmitting}
          className="w-full bg-gradient-to-r from-brand-violet to-purple-600 text-white font-black py-4 rounded-2xl text-base shadow-2xl shadow-brand-violet/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] hover:shadow-brand-violet/40"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Criando seu acesso...
            </span>
          ) : (
            'Acessar meu diagnostico'
          )}
        </button>

        <p className="text-center text-[11px] text-slate-600 mt-4 leading-relaxed px-4">
          Seus 7 dias gratuitos no app comecam agora, ao criar seu acesso.
        </p>

      </div>
    </div>
  );
};

export default QuizWelcome;
