import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { SUPABASE_URL, SUPABASE_KEY } from '../services/authService';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onBack: () => void;
}

const ADMIN_EMAILS = [
  'samucafe01@gmail.com',
  'admin@espiritualizei.com',
  'espiritualizeiapp@gmail.com'
];

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailLower = email.toLowerCase().trim();
    const isAuthorizedEmail = ADMIN_EMAILS.some(a => a.toLowerCase() === emailLower);

    if (!isAuthorizedEmail) {
      setError('Credenciais inválidas. Acesso restrito a administradores.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'x-admin-secret': password,
        },
        body: JSON.stringify({ action: 'get_stats', data: {} }),
      });

      if (res.ok) {
        localStorage.setItem('admin_session', JSON.stringify({
          email: emailLower,
          secret: password,
          timestamp: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000),
        }));
        onLogin(true);
      } else {
        setError('Credenciais inválidas. Acesso restrito a administradores.');
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-[#1A1625] to-brand-dark flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-violet/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-violet/20 mb-6">
            <Shield size={40} className="text-brand-violet" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Painel Admin</h1>
          <p className="text-slate-400">Acesso restrito a administradores</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email do Administrador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@espiritualizei.com"
                required
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-brand-violet text-white font-bold rounded-xl hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <BrandLogo size={20} variant="fill" className="animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield size={20} />
                Acessar Painel
              </>
            )}
          </button>
        </form>

        {/* Link para voltar */}
        <button
          onClick={onBack}
          className="w-full mt-6 py-3 text-slate-400 hover:text-white transition-colors text-sm"
        >
          ← Voltar para o app
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BrandLogo size={24} variant="fill" className="text-brand-violet" />
            <span className="text-white font-bold">Espiritualizei</span>
          </div>
          <p className="text-xs text-slate-500">
            Painel de Administração v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

// Função para verificar se há sessão admin válida
export const checkAdminSession = (): boolean => {
  try {
    const session = localStorage.getItem('admin_session');
    if (!session) return false;
    
    const { expires } = JSON.parse(session);
    return Date.now() < expires;
  } catch {
    return false;
  }
};

// Função para limpar sessão admin
export const clearAdminSession = () => {
  localStorage.removeItem('admin_session');
};
