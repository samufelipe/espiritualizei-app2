
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, Edit2, Mail, Phone, Save, User, X, Flame, LogOut, Award, Zap, Star, Heart, BookOpen, MapPin, Trophy, CreditCard, Calendar, Bell, HelpCircle, Settings, FileText, Lock, RefreshCw, Timer, ChevronRight, Info, CheckCircle2, Footprints, Loader2 } from 'lucide-react';
import { uploadImage } from '../services/databaseService';
import { ContactModal, TermsModal } from './LegalModals';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false); // New state for photo loading
  const [formData, setFormData] = useState(user);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Estado para o Modal de Detalhes da Conquista
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  
  // Mock de Configurações Locais
  const [notifications, setNotifications] = useState({ prayers: true, community: true, director: false });

  // --- CÁLCULO DO CICLO DE RENOVAÇÃO (30 DIAS) ---
  const getCycleInfo = () => {
    const lastUpdateDate = new Date(user.lastRoutineUpdate || user.joinedDate);
    lastUpdateDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nextUpdateDate = new Date(lastUpdateDate);
    nextUpdateDate.setDate(lastUpdateDate.getDate() + 30);
    const diffTime = nextUpdateDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const cycleLength = 30;
    const daysPassed = cycleLength - daysLeft;
    const progress = Math.min(100, Math.max(0, (daysPassed / cycleLength) * 100));

    return {
      daysLeft: Math.max(0, daysLeft),
      nextDate: nextUpdateDate.toLocaleDateString('pt-BR'),
      progress,
      isDue: daysLeft <= 0
    };
  };

  const cycle = getCycleInfo();

  // Helper para formatar data de entrada
  const getFormattedJoinDate = () => {
    try {
      const date = new Date(user.joinedDate);
      const month = date.toLocaleString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      return `${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
    } catch (e) {
      return new Date().getFullYear().toString();
    }
  };

  // --- LÓGICA REAL DE CONQUISTAS (VIRTUDES) ---
  const calculateAchievements = () => {
    // 1. FIDELIDADE (Baseado em Streak)
    const fidelityTarget = 7;
    const fidelityProgress = Math.min(100, (user.streakDays / fidelityTarget) * 100);
    
    // 2. OFERTA/CARIDADE (Baseado em XP - Ações realizadas)
    const charityTarget = 500; // Ex: 500 XP
    const charityProgress = Math.min(100, (user.currentXP / charityTarget) * 100);

    // 3. SABEDORIA (Baseado em Nível)
    const wisdomTarget = 5; // Nível 5
    const wisdomProgress = Math.min(100, (user.level / wisdomTarget) * 100);

    // 4. PERSEVERANÇA (Tempo de casa)
    const daysSinceJoined = Math.floor((new Date().getTime() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24));
    const persistenceTarget = 30; // 30 dias de app
    const persistenceProgress = Math.min(100, (daysSinceJoined / persistenceTarget) * 100);

    return [
      { 
        id: 'fidelity', 
        label: 'Fidelidade', 
        shortDesc: 'Constância diária', 
        icon: Flame, 
        progress: fidelityProgress,
        currentValue: user.streakDays,
        targetValue: fidelityTarget,
        unit: 'dias',
        isUnlocked: fidelityProgress >= 100,
        color: 'text-orange-500', 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500/20',
        details: {
          meaning: 'A graça de permanecer firme nos pequenos propósitos de cada dia, sem falhar.',
          unlockRequirement: 'Complete sua rotina por 7 dias consecutivos.',
          earnedReason: 'Você provou sua constância completando 7 dias seguidos de oração.',
          lockedHint: 'Continue realizando sua rotina diária. A constância é a chave.'
        }
      },
      { 
        id: 'charity', 
        label: 'Oferta', 
        shortDesc: 'Vida entregue', 
        icon: Heart, 
        progress: charityProgress,
        currentValue: user.currentXP,
        targetValue: charityTarget,
        unit: 'XP',
        isUnlocked: charityProgress >= 100,
        color: 'text-red-500', 
        bg: 'bg-red-500/10', 
        border: 'border-red-500/20',
        details: {
          meaning: 'O amor que se traduz em atos concretos de oração e intercessão pelo próximo.',
          unlockRequirement: 'Acumule 500 XP interagindo na comunidade e rezando.',
          earnedReason: 'Você dedicou tempo suficiente à oração para acumular 500 pontos de graça.',
          lockedHint: 'Reze pelas intenções no Mural e complete seus desafios diários.'
        }
      },
      { 
        id: 'wisdom', 
        label: 'Sabedoria', 
        shortDesc: 'Maturidade', 
        icon: BookOpen, 
        progress: wisdomProgress,
        currentValue: user.level,
        targetValue: wisdomTarget,
        unit: 'Nível',
        isUnlocked: wisdomProgress >= 100,
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/20',
        details: {
          meaning: 'O crescimento espiritual que vem do estudo e da profundidade na fé.',
          unlockRequirement: 'Alcance o Nível 5 em sua jornada.',
          earnedReason: 'Sua caminhada constante elevou seu nível de maturidade espiritual.',
          lockedHint: 'Continue subindo de nível através da leitura e das práticas diárias.'
        }
      },
      { 
        id: 'persistence', 
        label: 'Perseverança', 
        shortDesc: 'Caminhada', 
        icon: Footprints, 
        progress: persistenceProgress,
        currentValue: daysSinceJoined,
        targetValue: persistenceTarget,
        unit: 'dias',
        isUnlocked: persistenceProgress >= 100,
        color: 'text-emerald-500', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20',
        details: {
          meaning: 'A virtude de quem não desiste, mesmo quando o entusiasmo inicial passa.',
          unlockRequirement: 'Complete 30 dias desde o início da sua jornada no app.',
          earnedReason: 'Você permaneceu conosco por mais de um mês. Deus abençoe sua jornada!',
          lockedHint: 'O tempo é o melhor remédio. Continue sua caminhada dia após dia.'
        }
      },
    ];
  };

  const achievements = calculateAchievements();

  const handleSave = async () => {
    setIsSaving(true);
    // Simula tempo de rede para feedback visual de persistência
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdateUser(formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        setIsUploadingPhoto(true);
        const file = e.target.files[0];
        
        // Immediate visual feedback with local object URL
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, photoUrl: previewUrl })); 
        
        try {
            const uploadedUrl = await uploadImage(file, 'avatars');
            if (uploadedUrl) {
               // Update formData with permanent URL and save immediately
               const newUserState = { ...user, photoUrl: uploadedUrl };
               setFormData(newUserState);
               onUpdateUser(newUserState);
            }
        } catch (error) {
            console.error("Upload failed", error);
            // Revert to original if failed
            setFormData(prev => ({...prev, photoUrl: user.photoUrl}));
        } finally {
            setIsUploadingPhoto(false);
        }
     }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
     setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderField = (label: string, value: string | undefined, onChange: (val: string) => void, Icon: React.ElementType, placeholder: string) => {
    if (isEditing) {
      return (
        <div className="animate-fade-in">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">{label}</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-violet transition-colors"><Icon size={18} /></div>
            <input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium placeholder:text-slate-400 outline-none focus:bg-white/10 focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all text-sm"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 animate-fade-in transition-colors hover:border-brand-violet/20 group">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-slate-500 shrink-0 group-hover:text-brand-violet group-hover:bg-brand-violet/10 transition-colors"><Icon size={20} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mb-0.5">{label}</p>
          <p className="font-bold text-white text-base truncate">{value || <span className="text-slate-600 font-normal italic">Não informado</span>}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 pb-32 animate-fade-in min-h-screen bg-brand-dark font-sans transition-colors">
      
      {/* --- HEADER FIXO --- */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-brand-dark/90 backdrop-blur-xl z-30 py-4 -mx-6 px-6 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <div className="flex gap-2">
          {isEditing && (
            <button onClick={handleCancel} disabled={isSaving} className="w-9 h-9 rounded-full bg-white/10 text-slate-400 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"><X size={18} /></button>
          )}
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
            disabled={isSaving}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-brand-violet text-white shadow-lg hover:bg-purple-600' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}
          >
            {isEditing ? (
               isSaving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar</>
            ) : (
               <><Edit2 size={16} /> Editar</>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-8">

        {/* 1. HERO PERFIL (FOTO E NOME) */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-white/10 text-white flex items-center justify-center text-4xl font-bold shadow-float border-4 border-brand-dark overflow-hidden transition-colors relative">
              {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-2">
                 <div className="flex gap-0.5">
                    {Array.from({length: Math.min(3, Math.floor(user.level/5) + 1)}).map((_,i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400 drop-shadow-sm" />)}
                 </div>
              </div>
              {isUploadingPhoto && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                    <Loader2 size={32} className="animate-spin text-white" />
                 </div>
              )}
            </div>
            
            <label className="absolute bottom-1 right-1 bg-brand-violet text-white p-2.5 rounded-full shadow-lg border-4 border-brand-dark hover:bg-purple-600 transition-transform hover:scale-110 active:scale-90 cursor-pointer z-20">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
            </label>
          </div>
          
          <div className="mt-5 text-center animate-slide-up">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
               {formData.name}
               {user.isPremium && <Award size={20} className="text-brand-violet fill-brand-violet/20" />}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
               {formData.spiritualMaturity || 'Membro Iniciante'} • Membro desde {getFormattedJoinDate()}
            </p>
          </div>
        </div>

        {/* 2. STATS RAPIDAS */}
        {!isEditing && (
          <div className="grid grid-cols-3 gap-3 animate-slide-up">
            <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10 shadow-sm">
               <span className="block text-2xl font-black text-brand-violet">{user.streakDays}</span>
               <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Dias Seg.</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10 shadow-sm">
               <span className="block text-2xl font-black text-amber-500">{user.level}</span>
               <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Nível</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10 shadow-sm">
               <span className="block text-2xl font-black text-slate-300">{user.currentXP}</span>
               <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">XP Total</span>
            </div>
          </div>
        )}

        {/* 3. CICLO ESPIRITUAL */}
        {!isEditing && (
           <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-3 px-1">
                 <RefreshCw size={16} className="text-brand-violet" />
                 <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Ciclo da Rotina Espiritual</span>
              </div>
              
              <div className="bg-[#1A1F26] p-6 rounded-3xl border border-white/10 shadow-card relative overflow-hidden group hover:border-brand-violet/20 transition-colors">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                       <h3 className="text-white font-bold text-base flex items-center gap-2">
                          Foco do Ciclo
                          {cycle.isDue && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">REVISAR AGORA</span>}
                       </h3>
                       <p className="text-slate-400 text-xs mt-1">Focado em vencer: <span className="text-white font-medium">{user.spiritualFocus || 'Indefinido'}</span></p>
                    </div>
                    <div className="text-right">
                       <span className={`text-2xl font-black ${cycle.daysLeft <= 5 ? 'text-amber-400' : 'text-brand-violet'}`}>
                          {cycle.daysLeft}
                       </span>
                       <span className="block text-[9px] text-slate-500 font-bold uppercase">Dias Restantes</span>
                    </div>
                 </div>
                 <div className="relative h-3 w-full bg-black/20 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${cycle.daysLeft <= 5 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-brand-violet to-purple-500'}`} style={{ width: `${cycle.progress}%` }}>
                       <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 w-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Timer size={12}/> Próxima revisão:</span>
                    <span className="text-slate-300">{cycle.nextDate}</span>
                 </div>
              </div>
           </div>
        )}

        {/* 4. ASSINATURA */}
        {!isEditing && (
           <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-3 px-1"><CreditCard size={16} className="text-brand-violet" /><span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Minha Assinatura</span></div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-brand-violet/10 rounded-full blur-3xl -mr-10 -mt-10" />
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Plano Atual</p>
                          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                             {user.isPremium ? 'Premium Semestral' : 'Gratuito'} 
                             {user.isPremium && <Zap size={20} className="text-amber-400 fill-amber-400" />}
                          </h3>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${user.isPremium ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                          {user.isPremium ? 'Ativo' : 'Básico'}
                       </span>
                    </div>
                    {user.isPremium ? (
                       <button className="w-full mt-4 py-3 rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors flex justify-between px-4 items-center group/btn">
                          Gerenciar Assinatura <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    ) : (
                       <button className="w-full bg-brand-violet text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                          <Zap size={16} fill="currentColor" /> Fazer Upgrade Agora
                       </button>
                    )}
                 </div>
              </div>
           </div>
        )}

        {/* 5. FRUTOS DA JORNADA (SALA DE CONQUISTAS OTIMIZADA) */}
        {!isEditing && (
           <div className="mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4 px-1">
                 <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Frutos da Jornada</span>
                 </div>
                 <span className="text-[10px] text-slate-500 italic flex items-center gap-1"><Info size={10} /> Toque para ver detalhes</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 {achievements.map((badge) => (
                    <button 
                      key={badge.id} 
                      onClick={() => setSelectedAchievement(badge)}
                      className={`p-4 rounded-2xl border flex items-center gap-3 relative overflow-hidden group transition-all text-left hover:scale-[1.02] active:scale-95 cursor-pointer ${badge.isUnlocked ? badge.bg + ' ' + badge.border : 'bg-white/5 border-white/5 opacity-80'}`}
                    >
                       {!badge.isUnlocked && (
                          <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                             <Lock size={16} className="text-white" />
                          </div>
                       )}
                       
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 ${badge.isUnlocked ? `bg-white/10 ${badge.color}` : 'bg-slate-800 text-slate-500'}`}>
                          <badge.icon size={18} />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${badge.isUnlocked ? 'text-white' : 'text-slate-400'}`}>{badge.label}</p>
                          <p className="text-[9px] text-slate-500/80 truncate mb-1.5">{badge.shortDesc}</p>
                          <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full transition-all duration-1000 ${badge.isUnlocked ? badge.color.replace('text-', 'bg-') : 'bg-slate-600'}`} style={{ width: `${badge.progress}%` }} />
                          </div>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        )}

        {/* 6. DADOS PESSOAIS (EDITÁVEIS) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1"><User size={16} className="text-brand-violet" /><span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Dados Pessoais</span></div>
          {renderField('Nome Completo', formData.name, (val) => setFormData({ ...formData, name: val }), User, 'Seu nome')}
          {renderField('E-mail', formData.email, (val) => setFormData({ ...formData, email: val }), Mail, 'seu@email.com')}
          {renderField('Celular', formData.phone, (val) => setFormData({ ...formData, phone: val }), Phone, '(00) 00000-0000')}
        </div>

        {/* 7. SISTEMA */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2 px-1"><Settings size={16} className="text-brand-violet" /><span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Sistema</span></div>
           <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-600 flex items-center justify-center"><Bell size={16} /></div>
                    <span className="text-sm font-bold text-white">Lembretes de Oração</span>
                 </div>
                 <button onClick={() => toggleNotification('prayers')} className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.prayers ? 'bg-brand-violet' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications.prayers ? 'translate-x-6' : ''}`} />
                 </button>
              </div>
              <div className="p-4 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-900/20 text-green-600 flex items-center justify-center"><Heart size={16} /></div>
                    <span className="text-sm font-bold text-white">Comunidade</span>
                 </div>
                 <button onClick={() => toggleNotification('community')} className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.community ? 'bg-brand-violet' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications.community ? 'translate-x-6' : ''}`} />
                 </button>
              </div>
           </div>
        </div>

        {/* 8. LINKS ÚTEIS */}
        <div className="pt-4 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowContactModal(true)} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-brand-violet/30 transition-colors cursor-pointer group">
                 <HelpCircle size={24} className="text-slate-400 mb-2 group-hover:text-brand-violet transition-colors" />
                 <span className="text-xs font-bold text-white">Central de Ajuda</span>
              </button>
              <button onClick={() => setShowTermsModal(true)} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-brand-violet/30 transition-colors cursor-pointer group">
                 <FileText size={24} className="text-slate-400 mb-2 group-hover:text-brand-violet transition-colors" />
                 <span className="text-xs font-bold text-white">Termos de Uso</span>
              </button>
           </div>
           <div className="flex justify-center pt-4">
              <button onClick={() => setShowLogoutConfirm(true)} className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-2 px-6 py-3 rounded-xl bg-red-900/10 hover:bg-red-900/20 transition-colors"><LogOut size={16} /> Sair do app</button>
           </div>
           <p className="text-center text-[10px] text-slate-400">Versão 2.5.0 • Build 2025</p>
        </div>
      </div>

      {/* --- MODAIS --- */}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}

      {/* --- MODAL DE DETALHES DA CONQUISTA (DINÂMICO) --- */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedAchievement(null)} />
           <div className="relative w-full max-w-sm bg-white dark:bg-[#1A1F26] rounded-[2rem] shadow-2xl p-8 animate-slide-up border border-white/10 text-center">
              
              <button onClick={() => setSelectedAchievement(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
              
              {/* Ícone com Estado (Bloqueado/Desbloqueado) */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative ${selectedAchievement.isUnlocked ? `${selectedAchievement.bg} ${selectedAchievement.color}` : 'bg-slate-800 text-slate-500'}`}>
                 <selectedAchievement.icon size={40} />
                 {!selectedAchievement.isUnlocked && (
                    <div className="absolute -bottom-2 -right-2 bg-slate-700 p-2 rounded-full border-2 border-[#1A1F26]">
                       <Lock size={14} className="text-slate-300" />
                    </div>
                 )}
              </div>
              
              <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-1">{selectedAchievement.label}</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">
                 {selectedAchievement.isUnlocked ? 'Conquistado!' : 'Bloqueado'}
              </p>
              
              <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-5 border border-slate-200 dark:border-white/5 text-left space-y-4 mb-6">
                 
                 {/* Significado Sempre Visível */}
                 <div>
                    <p className="text-[10px] font-bold text-brand-violet uppercase mb-1 flex items-center gap-1"><Info size={10} /> Significado Espiritual</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedAchievement.details.meaning}</p>
                 </div>
                 
                 <div className="w-full h-px bg-slate-200 dark:bg-white/10" />
                 
                 {selectedAchievement.isUnlocked ? (
                    /* CONTEÚDO PARA DESBLOQUEADO */
                    <>
                       <div className="animate-fade-in">
                          <p className="text-[10px] font-bold text-green-500 uppercase mb-1 flex items-center gap-1"><CheckCircle2 size={10} /> Por que ganhei?</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAchievement.details.earnedReason}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Métrica Atingida</p>
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg">
                             <Trophy size={12} className="text-amber-500" />
                             <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {selectedAchievement.currentValue} / {selectedAchievement.targetValue} {selectedAchievement.unit}
                             </p>
                          </div>
                       </div>
                    </>
                 ) : (
                    /* CONTEÚDO PARA BLOQUEADO */
                    <>
                       <div className="animate-fade-in">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Segredo para Desbloquear</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">"{selectedAchievement.details.unlockRequirement}"</p>
                       </div>
                       
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex justify-between">
                             <span>Progresso Atual</span>
                             <span>{Math.round(selectedAchievement.progress)}%</span>
                          </p>
                          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-slate-500 rounded-full transition-all duration-1000" style={{ width: `${selectedAchievement.progress}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-right">
                             Faltam {Math.max(0, selectedAchievement.targetValue - selectedAchievement.currentValue)} {selectedAchievement.unit}
                          </p>
                       </div>

                       <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                          <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Dica do Diretor</p>
                          <p className="text-xs text-slate-300">{selectedAchievement.details.lockedHint}</p>
                       </div>
                    </>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutConfirm(false)} />
            <div className="relative bg-brand-dark p-6 rounded-3xl shadow-2xl animate-scale-in max-w-xs w-full text-center border border-white/10">
               <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut size={28} /></div>
               <h3 className="text-lg font-bold text-white mb-2">Sair do app?</h3>
               <p className="text-sm text-slate-400 mb-6">Você precisará fazer login novamente.</p>
               <div className="flex gap-3">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-white/10">Cancelar</button>
                  <button onClick={onLogout} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg">Sair</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Profile;
