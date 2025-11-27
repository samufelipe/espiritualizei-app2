
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, Edit2, Mail, Phone, Shield, Save, User, X, Moon, Sun, Database, CheckCircle, AlertCircle, Activity, Flame, Download, FileText, LogOut } from 'lucide-react';
import { getConnectionStatus, logoutUser } from '../services/authService';
import { testDatabaseConnection, uploadImage } from '../services/databaseService';
import { TermsModal, PrivacyModal } from './LegalModals';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, isDarkMode, onToggleTheme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isConnected = getConnectionStatus();

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const runConnectionTest = async () => {
    setTestResult({ success: false, message: 'Testando...' });
    const result = await testDatabaseConnection();
    setTestResult(result);
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleLogout = async () => {
     await logoutUser();
     window.location.reload();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const url = await uploadImage(e.target.files[0], 'avatars');
        setFormData({ ...formData, photoUrl: url });
     }
  };

  const generateHeatmap = () => {
     const days = 90; 
     const data = [];
     for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const level = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0; 
        data.unshift({ date, level });
     }
     return data;
  };
  const heatmapData = generateHeatmap();

  const renderField = (label: string, value: string | undefined, onChange: (val: string) => void, Icon: React.ElementType, placeholder: string) => {
    if (isEditing) {
      return (
        <div className="animate-fade-in">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 ml-1">{label}</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon size={18} /></div>
            <input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white font-medium placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-white/10 focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 animate-fade-in transition-colors">
        <div className="w-10 h-10 bg-slate-50 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0"><Icon size={20} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wide mb-0.5">{label}</p>
          <p className="font-bold text-brand-dark dark:text-white text-base truncate">{value || <span className="text-slate-300 dark:text-slate-600 font-normal italic">Não informado</span>}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 pb-32 animate-fade-in min-h-screen bg-white dark:bg-brand-dark font-sans transition-colors">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md z-20 py-2 transition-colors">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">Meu Perfil</h1>
        <div className="flex gap-2">
          {isEditing && (
            <button onClick={handleCancel} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"><X size={18} /></button>
          )}
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-brand-dark dark:bg-brand-violet text-white shadow-lg' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-200'}`}>
            {isEditing ? <><Save size={16} /> Salvar</> : <><Edit2 size={16} /> Editar</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-brand-dark dark:bg-white/10 text-white flex items-center justify-center text-4xl font-bold shadow-float border-4 border-white dark:border-brand-dark overflow-hidden transition-colors">
            {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-brand-violet text-white p-2.5 rounded-full shadow-lg border-4 border-white dark:border-brand-dark hover:bg-purple-500 transition-transform hover:scale-110 active:scale-90 cursor-pointer">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          )}
        </div>
        {!isEditing && (
          <div className="mt-4 text-center animate-slide-up">
            <h2 className="text-xl font-bold text-brand-dark dark:text-white">{formData.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full inline-block">{formData.spiritualMaturity || 'Membro Espiritualizei'}</p>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="grid grid-cols-3 gap-3 mb-10 animate-slide-up">
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-slate-100 dark:border-white/10 shadow-sm"><span className="block text-2xl font-bold text-brand-violet">{user.streakDays}</span><span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-bold">Dias Seg.</span></div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-slate-100 dark:border-white/10 shadow-sm"><span className="block text-2xl font-bold text-amber-500">{user.level}</span><span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-bold">Nível</span></div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl text-center border border-slate-100 dark:border-white/10 shadow-sm"><span className="block text-2xl font-bold text-slate-700 dark:text-slate-300">{user.currentXP}</span><span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-bold">XP Total</span></div>
        </div>
      )}

      {!isEditing && (
         <div className="mb-10 animate-slide-up">
            <div className="flex items-center gap-2 mb-3 px-1"><Flame size={16} className="text-brand-violet" /><span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Jornada de Constância</span></div>
            <div className="bg-white dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/10 overflow-x-auto no-scrollbar">
               <div className="flex gap-1 min-w-max">
                  {heatmapData.map((day, idx) => (
                     <div key={idx} className={`w-2.5 h-8 rounded-full transition-all hover:scale-110 ${day.level === 0 ? 'bg-slate-100 dark:bg-white/10' : day.level === 1 ? 'bg-brand-violet/40' : day.level === 2 ? 'bg-brand-violet/70' : 'bg-brand-violet'}`} title={day.date.toLocaleDateString()} />
                  ))}
               </div>
               <p className="text-[10px] text-slate-400 text-center mt-3">Últimos 90 dias</p>
            </div>
         </div>
      )}

      {/* PWA INSTALL CARD */}
      {!isEditing && (
         <div className="bg-gradient-to-br from-brand-dark to-[#2a2136] p-6 rounded-3xl text-white shadow-2xl mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/20 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-center justify-between">
               <div>
                  <h3 className="font-bold text-lg mb-1">Instalar Aplicativo</h3>
                  <p className="text-xs text-slate-300 max-w-[200px]">Tenha a experiência completa, sem barra de navegador e com acesso rápido.</p>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl"><Download size={24} /></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400">
               Toque em "Compartilhar" e depois "Adicionar à Tela de Início".
            </div>
         </div>
      )}

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-2"><div className="h-px flex-1 bg-slate-100 dark:bg-white/10"></div><span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dados Pessoais</span><div className="h-px flex-1 bg-slate-100 dark:bg-white/10"></div></div>
        <div className="space-y-4">
          {renderField('Nome Completo', formData.name, (val) => setFormData({ ...formData, name: val }), User, 'Seu nome')}
          {renderField('E-mail', formData.email, (val) => setFormData({ ...formData, email: val }), Mail, 'seu@email.com')}
          {renderField('Celular', formData.phone, (val) => setFormData({ ...formData, phone: val }), Phone, '(00) 00000-0000')}
        </div>

        <div className="mt-10 space-y-4">
           <div className="flex items-center gap-2 mb-2"><div className="h-px flex-1 bg-slate-100 dark:bg-white/10"></div><span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Configurações</span><div className="h-px flex-1 bg-slate-100 dark:bg-white/10"></div></div>
           
           <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-brand-dark text-brand-violet' : 'bg-white text-amber-500'}`}>{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</div>
                  <div><p className="text-sm font-bold text-brand-dark dark:text-white">Modo Escuro</p><p className="text-xs text-slate-500 dark:text-slate-400">Ajustar aparência</p></div>
               </div>
               <button onClick={onToggleTheme} className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors ${isDarkMode ? 'bg-brand-violet justify-end' : 'bg-slate-300 justify-start'}`}><div className="w-5 h-5 bg-white rounded-full shadow-md" /></button>
           </div>

           <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}><Database size={20} /></div>
                   <div><p className="text-sm font-bold text-brand-dark dark:text-white">Banco de Dados</p><p className="text-xs text-slate-500">{isConnected ? 'Supabase Online' : 'Modo Local'}</p></div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${isConnected ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{isConnected ? <CheckCircle size={10} /> : <AlertCircle size={10} />}{isConnected ? 'Ativo' : 'Offline'}</div>
              </div>
              {isConnected && <button onClick={runConnectionTest} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-2 rounded-xl text-xs font-bold text-brand-violet flex items-center justify-center gap-2 hover:bg-slate-50"><Activity size={14} /> Testar Conexão</button>}
              {testResult && <div className={`mt-3 p-2 rounded-lg text-xs font-medium text-center animate-fade-in ${testResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{testResult.message}</div>}
           </div>
        </div>

        {/* LEGAL LINKS */}
        <div className="flex justify-center gap-6 mt-8">
           <button onClick={() => setShowTerms(true)} className="text-xs font-bold text-slate-400 hover:text-brand-violet flex items-center gap-1"><FileText size={12} /> Termos de Uso</button>
           <button onClick={() => setShowPrivacy(true)} className="text-xs font-bold text-slate-400 hover:text-brand-violet flex items-center gap-1"><Shield size={12} /> Privacidade</button>
        </div>

        {/* LOGOUT */}
        <div className="pt-8 pb-4 flex justify-center">
           <button onClick={() => setShowLogoutConfirm(true)} className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><LogOut size={14} /> Sair do Aplicativo</button>
        </div>
      </div>

      {/* MODALS */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      
      {showLogoutConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutConfirm(false)} />
            <div className="relative bg-white dark:bg-brand-dark p-6 rounded-3xl shadow-2xl animate-scale-in max-w-xs w-full text-center border border-white/10">
               <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut size={28} /></div>
               <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">Sair da sua conta?</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Você precisará fazer login novamente para acessar sua rotina.</p>
               <div className="flex gap-3">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">Cancelar</button>
                  <button onClick={handleLogout} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30">Sair</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Profile;
