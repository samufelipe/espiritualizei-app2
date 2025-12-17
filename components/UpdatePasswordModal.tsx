
import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { updateUserPassword } from '../services/authService';

interface UpdatePasswordModalProps {
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateUserPassword(password);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Force reload to ensure session state is clean or redirect to dashboard
        window.location.href = '/'; 
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar senha. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-brand-dark rounded-[2rem] shadow-2xl p-8 animate-slide-up border border-white/10">
        
        {success ? (
          <div className="text-center py-6">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 size={32} />
             </div>
             <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Senha Atualizada!</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">Você já pode acessar sua conta.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 text-center">Criar Nova Senha</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">Digite sua nova senha segura.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-bold text-center border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nova Senha</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-brand-violet">
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirmar Senha</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all font-medium"
                      placeholder="Repita a senha"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Atualizar Senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
