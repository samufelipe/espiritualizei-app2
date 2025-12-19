
import React, { useState } from 'react';
import { UserProfile } from '../types';
// Added missing Shield icon to fix reference error on line 142
import { Camera, Edit2, Mail, Phone, Save, User, X, Flame, LogOut, Award, Zap, Star, Heart, BookOpen, MapPin, Trophy, CreditCard, Calendar, Bell, HelpCircle, Settings, FileText, Lock, RefreshCw, Timer, ChevronRight, Info, CheckCircle2, Footprints, Loader2, MessageCircle, Shield } from 'lucide-react';
import { uploadImage, updateLastConfessionDate } from '../services/databaseService';
import { ContactModal, TermsModal } from './LegalModals';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false); 
  const [formData, setFormData] = useState(user);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [notifications, setNotifications] = useState({ prayers: true, community: true, director: false });

  // --- CÁLCULO DA CONFISSÃO (INOVAÇÃO C) ---
  const getConfessionStatus = () => {
    if (!user.lastConfessionAt) return { days: null, level: 'none' };
    const last = new Date(user.lastConfessionAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff <= 15) return { days: diff, level: 'safe', label: 'Alma em paz', color: 'text-green-500' };
    if (diff <= 30) return { days: diff, level: 'warning', label: 'Vigilância necessária', color: 'text-amber-500' };
    return { days: diff, level: 'danger', label: 'Busque o Sacramento', color: 'text-red-500' };
  };

  const confession = getConfessionStatus();

  const handleUpdateConfession = async () => {
      const today = new Date();
      const updatedUser = { ...user, lastConfessionAt: today };
      onUpdateUser(updatedUser);
      await updateLastConfessionDate(user.id, today);
  };

  const getCycleInfo = () => {
    const lastUpdateDate = new Date(user.lastRoutineUpdate || user.joinedDate);
    const now = new Date();
    const nextUpdateDate = new Date(lastUpdateDate);
    nextUpdateDate.setDate(lastUpdateDate.getDate() + 30);
    const diffTime = nextUpdateDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, ((30 - daysLeft) / 30) * 100));

    return { daysLeft: Math.max(0, daysLeft), nextDate: nextUpdateDate.toLocaleDateString('pt-BR'), progress, isDue: daysLeft <= 0 };
  };

  const cycle = getCycleInfo();

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdateUser(formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        setIsUploadingPhoto(true);
        const file = e.target.files[0];
        try {
            const uploadedUrl = await uploadImage(file, 'avatars');
            if (uploadedUrl) {
               const newUserState = { ...user, photoUrl: uploadedUrl };
               setFormData(newUserState);
               onUpdateUser(newUserState);
            }
        } catch (error) { console.error("Upload failed", error); }
        finally { setIsUploadingPhoto(false); }
     }
  };

  const renderField = (label: string, value: string | undefined, onChange: (val: string) => void, Icon: React.ElementType, placeholder: string) => {
    if (isEditing) {
      return (
        <div className="animate-fade-in">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">{label}</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-violet transition-colors"><Icon size={18} /></div>
            <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium placeholder:text-slate-400 outline-none focus:bg-white/10 focus:border-brand-violet transition-all text-sm" />
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-slate-500 shrink-0 group-hover:text-brand-violet transition-colors"><Icon size={20} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mb-0.5">{label}</p>
          <p className="font-bold text-white text-base truncate">{value || <span className="text-slate-600 font-normal italic">Não informado</span>}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 pb-32 animate-fade-in min-h-screen bg-brand-dark font-sans">
      
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-brand-dark/90 backdrop-blur-xl z-30 py-4 -mx-6 px-6 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <div className="flex gap-2">
          {isEditing && (
            <button onClick={() => { setFormData(user); setIsEditing(false); }} className="w-9 h-9 rounded-full bg-white/10 text-slate-400 flex items-center justify-center hover:bg-white/20 transition-colors"><X size={18} /></button>
          )}
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving} className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-brand-violet text-white shadow-lg' : 'bg-white/10 text-slate-200'}`}>
            {isEditing ? (isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />) : <><Edit2 size={16} /> Editar</>}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-8">

        {/* PERFIL HERO */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-white/10 text-white flex items-center justify-center text-4xl font-bold shadow-float border-4 border-brand-dark overflow-hidden relative">
              {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
              {isUploadingPhoto && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm"><Loader2 size={32} className="animate-spin text-white" /></div>}
            </div>
            <label className="absolute bottom-1 right-1 bg-brand-violet text-white p-2.5 rounded-full shadow-lg border-4 border-brand-dark hover:bg-purple-600 cursor-pointer z-20"><Camera size={18} /><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} /></label>
          </div>
          <div className="mt-5 text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">{formData.name}{user.isPremium && <Award size={20} className="text-brand-violet" />}</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">{formData.spiritualMaturity || 'Membro Iniciante'}</p>
          </div>
        </div>

        {/* INOVAÇÃO C: SACRAMENTO TRACKER */}
        <div className="animate-slide-up">
           <div className="flex items-center gap-2 mb-3 px-1">
              <Shield size={16} className="text-brand-violet" />
              <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Vida Sacramental</span>
           </div>
           <div className="bg-[#1A1F26] p-6 rounded-3xl border border-white/10 shadow-card relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-white font-bold text-base flex items-center gap-2">Confissão Frequente</h3>
                    <p className={`text-xs font-bold mt-1 ${confession.color}`}>{confession.label}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-2xl font-black text-white">{confession.days ?? '--'}</span>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Dias desde a última</span>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={handleUpdateConfession} className="flex-1 bg-brand-violet text-white py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Me confessei hoje
                 </button>
                 <button className="bg-white/5 text-slate-300 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <Calendar size={18} />
                 </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 italic">"A alma que se confessa frequentemente voa para a santidade." — São João Bosco</p>
           </div>
        </div>

        {/* CICLO ESPIRITUAL */}
        <div className="animate-slide-up">
           <div className="flex items-center gap-2 mb-3 px-1"><RefreshCw size={16} className="text-brand-violet" /><span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Ciclo da Rotina</span></div>
           <div className="bg-[#1A1F26] p-6 rounded-3xl border border-white/10 shadow-card">
              <div className="flex justify-between items-start mb-4">
                 <div><h3 className="text-white font-bold text-base">Foco do Ciclo</h3><p className="text-slate-400 text-xs mt-1">Vencendo: <span className="text-white font-medium">{user.spiritualFocus || 'Indefinido'}</span></p></div>
                 <div className="text-right"><span className="text-2xl font-black text-brand-violet">{cycle.daysLeft}</span><span className="block text-[9px] text-slate-500 font-bold uppercase">Dias Restantes</span></div>
              </div>
              <div className="relative h-3 w-full bg-black/20 rounded-full overflow-hidden mb-3"><div className="h-full rounded-full bg-gradient-to-r from-brand-violet to-purple-500" style={{ width: `${cycle.progress}%` }} /></div>
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1"><User size={16} className="text-brand-violet" /><span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Dados Pessoais</span></div>
          {renderField('Nome Completo', formData.name, (val) => setFormData({ ...formData, name: val }), User, 'Seu nome')}
          {renderField('E-mail', formData.email, (val) => setFormData({ ...formData, email: val }), Mail, 'seu@email.com')}
        </div>

        <div className="pt-4 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowContactModal(true)} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-brand-violet/30 group transition-all">
                 <HelpCircle size={24} className="text-slate-400 mb-2 group-hover:text-brand-violet" />
                 <span className="text-xs font-bold text-white">Central de Ajuda</span>
              </button>
              <button onClick={() => setShowTermsModal(true)} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-brand-violet/30 group transition-all">
                 <FileText size={24} className="text-slate-400 mb-2 group-hover:text-brand-violet" />
                 <span className="text-xs font-bold text-white">Termos de Uso</span>
              </button>
           </div>
           <div className="flex justify-center pt-4">
              <button onClick={() => setShowLogoutConfirm(true)} className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-2 px-6 py-3 rounded-xl bg-red-900/10"><LogOut size={16} /> Sair do app</button>
           </div>
        </div>
      </div>

      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
      {showLogoutConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <div className="relative bg-brand-dark p-6 rounded-3xl shadow-2xl max-w-xs w-full text-center border border-white/10">
               <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut size={28} /></div>
               <h3 className="text-lg font-bold text-white mb-2">Sair do app?</h3>
               <div className="flex gap-3 mt-6"><button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-white/10">Cancelar</button><button onClick={onLogout} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white shadow-lg">Sair</button></div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Profile;
