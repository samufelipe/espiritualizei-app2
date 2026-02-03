import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { updateUserPassword } from '../services/authService';

interface ResetPasswordProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Validações
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) {
      if (!isPasswordValid) {
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      } else if (!doPasswordsMatch) {
        setErrorMessage('As senhas não coincidem.');
      }
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await updateUserPassword(password);
      setStatus('success');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Erro ao atualizar senha. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors">
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        
        {/* --- HEADER LOGO --- */}
        <div className="text-center mb-10">
           <div className="flex justify-center mb-6">
             <BrandLogo size={64} variant="fill" />
           </div>
           <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">Nova Senha</h1>
           <p className="text-slate-500 dark:text-slate-400">Crie uma nova senha para sua conta.</p>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 transition-all">
           
           {status === 'success' ? (
             <div className="text-center py-6 animate-slide-up">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                   <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Senha Atualizada!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                   Sua nova senha foi salva com sucesso. Você será redirecionado para o app...
                </p>
                <div className="flex justify-center">
                  <Loader2 size={24} className="animate-spin text-brand-violet" />
                </div>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
                
                <div className="bg-brand-violet/5 border border-brand-violet/10 rounded-xl p-4 flex gap-3 items-start mb-2">
                   <KeyRound className="text-brand-violet shrink-0 mt-0.5" size={20} />
                   <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Escolha uma senha forte com no mínimo 6 caracteres. Recomendamos usar letras, números e símbolos.
                   </p>
                </div>

                {status === 'error' && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-bold text-center border border-red-100 dark:border-red-900/30 flex items-center gap-2 justify-center">
                     <AlertCircle size={16} /> {errorMessage}
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 ml-1">Nova Senha</label>
                   <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-brand-violet transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                   {password.length > 0 && (
                     <p className={`text-xs ml-1 ${isPasswordValid ? 'text-green-600' : 'text-red-500'}`}>
                       {isPasswordValid ? '✓ Senha válida' : '✗ Mínimo 6 caracteres'}
                     </p>
                   )}
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 ml-1">Confirmar Senha</label>
                   <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Digite novamente"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-brand-violet transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                   {confirmPassword.length > 0 && (
                     <p className={`text-xs ml-1 ${doPasswordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                       {doPasswordsMatch ? '✓ Senhas coincidem' : '✗ As senhas não coincidem'}
                     </p>
                   )}
                </div>

                <button 
                  type="submit"
                  disabled={status === 'loading' || !canSubmit}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    canSubmit 
                      ? 'bg-brand-violet text-white shadow-brand-violet/25 hover:bg-purple-600 hover:scale-[1.02] active:scale-95' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {status === 'loading' ? (
                     <><Loader2 size={20} className="animate-spin" /> Salvando...</>
                  ) : (
                     <>Salvar Nova Senha <ArrowRight size={20} /></>
                  )}
                </button>
             </form>
           )}

           <div className="text-center mt-6">
              <button 
                onClick={onCancel} 
                className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
