
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { loginUser, sendPasswordResetEmail } from '../services/authService';

interface LoginProps {
  onLogin: (user: any) => void;
  onRegister: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onBack }) => {
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Reset States
  const [viewMode, setViewMode] = useState<'login' | 'recover'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');

    try {
      const session = await loginUser(email, password);
      onLogin(session.user);
    } catch (err: any) {
      setError(err.message || "Erro ao entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
       setResetMessage("Digite um e-mail válido.");
       setResetStatus('error');
       return;
    }

    setResetStatus('sending');
    setResetMessage('');

    try {
       await sendPasswordResetEmail(resetEmail);
       setResetStatus('success');
    } catch (err: any) {
       setResetStatus('error');
       
       const msg = err.message || '';
       if (msg.includes('rate limit') || msg.includes('Too many requests') || msg.includes('Error sending recovery email')) {
          setResetMessage("Limite de envios excedido. Aguarde alguns instantes e tente novamente.");
       } else {
          setResetMessage(msg || "Erro ao enviar e-mail. Verifique a conexão.");
       }
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
           {viewMode === 'login' ? (
             <>
               <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">Bem-vindo de volta</h1>
               <p className="text-slate-500 dark:text-slate-400">Continue sua jornada espiritual.</p>
             </>
           ) : (
             <>
               <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">Recuperar Acesso</h1>
               <p className="text-slate-500 dark:text-slate-400">Enviaremos um link seguro para você.</p>
             </>
           )}
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 transition-all">
           
           {/* --- VIEW: LOGIN --- */}
           {viewMode === 'login' && (
             <form onSubmit={handleSubmit} className="space-y-6 animate-slide-in-right">
                
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-bold text-center border border-red-100 dark:border-red-900/30">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 ml-1">E-mail</label>
                   <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
                        autoFocus
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between ml-1">
                      <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Senha</label>
                      <button type="button" onClick={() => { setViewMode('recover'); setError(''); }} className="text-xs font-bold text-brand-violet hover:text-purple-600 transition-colors">Esqueceu?</button>
                   </div>
                   <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
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
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-violet/25 hover:bg-purple-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>Entrar <ArrowRight size={20} /></>
                  )}
                </button>
             </form>
           )}

           {/* --- VIEW: RECOVER PASSWORD --- */}
           {viewMode === 'recover' && (
             <div className="animate-slide-up">
                
                {resetStatus === 'success' ? (
                   <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                         <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">E-mail Enviado!</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                         Verifique sua caixa de entrada (e spam) no endereço <b>{resetEmail}</b>. Lá você encontrará o link para criar uma nova senha.
                      </p>
                      <button 
                        onClick={() => { setViewMode('login'); setResetStatus('idle'); setResetEmail(''); }}
                        className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                      >
                         Voltar para Login
                      </button>
                   </div>
                ) : (
                   <form onSubmit={handlePasswordReset} className="space-y-6">
                      <div className="bg-brand-violet/5 border border-brand-violet/10 rounded-xl p-4 flex gap-3 items-start mb-2">
                         <KeyRound className="text-brand-violet shrink-0 mt-0.5" size={20} />
                         <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Digite seu e-mail cadastrado. Enviaremos as instruções para você redefinir sua senha com segurança.
                         </p>
                      </div>

                      {resetStatus === 'error' && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-bold text-center border border-red-100 dark:border-red-900/30 flex items-center gap-2 justify-center">
                           <AlertCircle size={16} /> {resetMessage}
                        </div>
                      )}

                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 ml-1">E-mail Cadastrado</label>
                         <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                            <input 
                              type="email" 
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="seu@email.com"
                              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
                              autoFocus
                            />
                         </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={resetStatus === 'sending'}
                        className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-violet/25 hover:bg-purple-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {resetStatus === 'sending' ? (
                           <><Loader2 size={20} className="animate-spin" /> Enviando...</>
                        ) : (
                           <>Enviar Link de Recuperação</>
                        )}
                      </button>
                   </form>
                )}
             </div>
           )}

           <div className="text-center mt-8 space-y-4">
               {viewMode === 'login' && (
                  <p className="text-slate-500 dark:text-slate-400">
                     Ainda não tem uma conta? <button onClick={onRegister} className="font-bold text-brand-violet hover:underline">Criar Jornada</button>
                  </p>
               )}
               
               <button 
                  onClick={viewMode === 'login' ? onBack : () => setViewMode('login')} 
                  className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 mx-auto hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
               >
                  <ArrowLeft size={14} /> {viewMode === 'login' ? 'Voltar ao início' : 'Cancelar e Voltar'}
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
