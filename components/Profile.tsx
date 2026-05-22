import React, { useState, useEffect } from 'react';
import { UserProfile, PaymentLog } from '../types';
import {
  Camera, Edit2, Mail, Phone, Save, User, X, Flame, LogOut, Award,
  HelpCircle, Settings, FileText, RefreshCw, Loader2, Shield, ArrowRight,
  History, Check, Zap, Target, Heart, Star, BookOpen, ChevronRight,
  Trophy, Lock, CreditCard, MessageCircle
} from 'lucide-react';
import { uploadImage, updateLastConfessionDate, fetchUserPaymentLogs } from '../services/databaseService';
import { updateUserProfile, syncUserFromServer } from '../services/authService';
import { ContactModal, TermsModal } from './LegalModals';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

// ---- Label maps ----

const STRUGGLE_LABELS: Record<string, string> = {
  anxiety: 'Ansiedade e Medo',
  lust: 'Luta contra a Impureza',
  laziness: 'Preguica e Procrastinacao',
  pride: 'Orgulho e Vaidade',
  anger: 'Raiva e Impaciencia',
  dryness: 'Aridez Espiritual',
  ignorance: 'Ignorancia da Fe',
};

const STATE_LABELS: Record<string, string> = {
  student: 'Estudante',
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  parent: 'Pai/Mae de Familia',
  retired: 'Aposentado(a)',
};

const SAINT_LABELS: Record<string, { name: string; emoji: string }> = {
  acutis:  { name: 'Carlo Acutis',       emoji: '💻' },
  michael: { name: 'Sao Miguel Arcanjo', emoji: '⚔️' },
  therese: { name: 'Santa Teresinha',    emoji: '🌹' },
  joseph:  { name: 'Sao Jose',           emoji: '🔨' },
  mary:    { name: 'Nossa Senhora',      emoji: '🌙' },
};

// ---- Badge system ----

interface Badge {
  id: string;
  label: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

const computeBadges = (user: UserProfile): Badge[] => [
  {
    id: 'pilgrim',
    label: 'Peregrino',
    icon: '🏕️',
    unlocked: true,
    description: 'Comecou a jornada',
  },
  {
    id: 'flame3',
    label: '3 Dias',
    icon: '🔥',
    unlocked: (user.streakDays || 0) >= 3,
    description: '3 dias consecutivos',
  },
  {
    id: 'flame7',
    label: 'Semana Santa',
    icon: '⚡',
    unlocked: (user.streakDays || 0) >= 7,
    description: '7 dias consecutivos',
  },
  {
    id: 'flame30',
    label: 'Fiel',
    icon: '🏆',
    unlocked: (user.streakDays || 0) >= 30,
    description: '30 dias consecutivos',
  },
  {
    id: 'confession',
    label: 'Alma em Paz',
    icon: '✝️',
    unlocked: user.lastConfessionAt
      ? Math.floor((Date.now() - new Date(user.lastConfessionAt).getTime()) / 86400000) <= 30
      : false,
    description: 'Confissao recente',
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: '👑',
    unlocked: user.isPremium || false,
    description: 'Assinante ativo',
  },
  {
    id: 'wise',
    label: 'Sabio',
    icon: '📖',
    unlocked: (user.level || 1) >= 5,
    description: 'Nivel 5 alcancado',
  },
  {
    id: 'saint',
    label: 'Consagrado',
    icon: '✨',
    unlocked: (user.level || 1) >= 10,
    description: 'Nivel 10 alcancado',
  },
];

// ---- Consistency grid (49 days) ----

const buildConsistencyGrid = (
  activityHistory: { date: string; count: number }[] | undefined,
  streakDays: number
) => {
  const today = new Date();
  return Array.from({ length: 49 }, (_, idx) => {
    const i = 48 - idx;
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = activityHistory?.find(a => a.date === dateStr);
    return {
      date: dateStr,
      count: entry?.count ?? (i < streakDays ? 1 : 0),
      isToday: i === 0,
    };
  });
};

// ---- Spiritual field edit modal ----

const FIELD_OPTIONS: Record<string, { value: string; label: string; emoji: string }[]> = {
  spiritualFocus: [
    { value: 'anxiety',   label: 'Ansiedade e Medo',          emoji: '😰' },
    { value: 'lust',      label: 'Luta contra a Impureza',    emoji: '⚔️' },
    { value: 'laziness',  label: 'Preguica e Procrastinacao', emoji: '😴' },
    { value: 'pride',     label: 'Orgulho e Vaidade',         emoji: '👑' },
    { value: 'anger',     label: 'Raiva e Impaciencia',       emoji: '🔥' },
    { value: 'dryness',   label: 'Aridez Espiritual',         emoji: '🏜️' },
    { value: 'ignorance', label: 'Ignorancia da Fe',          emoji: '📖' },
  ],
  stateOfLife: [
    { value: 'student', label: 'Estudante',           emoji: '🎓' },
    { value: 'single',  label: 'Solteiro(a)',         emoji: '🕊️' },
    { value: 'married', label: 'Casado(a)',           emoji: '💍' },
    { value: 'parent',  label: 'Pai/Mae de Familia',  emoji: '👨‍👩‍👧' },
    { value: 'retired', label: 'Aposentado(a)',       emoji: '🌅' },
  ],
  patronSaint: [
    { value: 'acutis',  label: 'Carlo Acutis',       emoji: '💻' },
    { value: 'michael', label: 'Sao Miguel Arcanjo', emoji: '⚔️' },
    { value: 'therese', label: 'Santa Teresinha',    emoji: '🌹' },
    { value: 'joseph',  label: 'Sao Jose',           emoji: '🔨' },
    { value: 'mary',    label: 'Nossa Senhora',      emoji: '🌙' },
  ],
};

const FIELD_TITLES: Record<string, string> = {
  spiritualFocus: 'Sua Luta Principal',
  stateOfLife:    'Estado de Vida',
  patronSaint:    'Santo Padroeiro',
};

interface SpiritualFieldModalProps {
  field: 'spiritualFocus' | 'stateOfLife' | 'patronSaint';
  currentValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

const SpiritualFieldModal: React.FC<SpiritualFieldModalProps> = ({ field, currentValue, onSave, onClose }) => {
  const [selected, setSelected] = useState(currentValue);
  const options = FIELD_OPTIONS[field] || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1F26] w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-white font-bold text-base">{FIELD_TITLES[field]}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-3 space-y-1 max-h-72 overflow-y-auto no-scrollbar">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all ${
                selected === opt.value
                  ? 'bg-brand-violet/20 border border-brand-violet/40 text-white'
                  : 'hover:bg-white/5 border border-transparent text-slate-300'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="font-semibold text-sm flex-1">{opt.label}</span>
              {selected === opt.value && <Check size={16} className="text-brand-violet shrink-0" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => onSave(selected)}
            disabled={!selected}
            className="w-full bg-brand-violet text-white py-3.5 rounded-2xl font-black text-sm disabled:opacity-40 transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Main component ----

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [editingField, setEditingField] = useState<'spiritualFocus' | 'stateOfLife' | 'patronSaint' | null>(null);

  // Sync fresh data from server on mount
  useEffect(() => {
    const doSync = async () => {
      setIsSyncing(true);
      try {
        const fresh = await syncUserFromServer(user.id, user.email);
        if (fresh) {
          onUpdateUser(fresh);
          setFormData(fresh);
        }
      } catch {
        // silent
      } finally {
        setIsSyncing(false);
        setSyncDone(true);
      }
    };
    doSync();
  }, []);

  useEffect(() => {
    setFormData(user);
    if (user.isPremium) loadPaymentLogs();
  }, [user]);

  const loadPaymentLogs = async () => {
    setLoadingLogs(true);
    const logs = await fetchUserPaymentLogs(user.id);
    setPaymentLogs(logs);
    setLoadingLogs(false);
  };

  // ---- Computed values ----
  const xpProgress = Math.min(100, Math.round(((user.currentXP || 0) / (user.nextLevelXP || 100)) * 100));
  const badges = computeBadges(user);
  const consistencyGrid = buildConsistencyGrid(user.activityHistory, user.streakDays || 0);

  const getConfessionStatus = () => {
    if (!user.lastConfessionAt) return { days: null, level: 'none', label: 'Nao registrado', color: 'text-slate-400' };
    const diff = Math.floor((Date.now() - new Date(user.lastConfessionAt).getTime()) / 86400000);
    if (diff <= 15) return { days: diff, level: 'safe',    label: 'Alma em paz',           color: 'text-green-500' };
    if (diff <= 30) return { days: diff, level: 'warning', label: 'Vigilancia necessaria',  color: 'text-amber-500' };
    return             { days: diff, level: 'danger',  label: 'Busque o Sacramento',    color: 'text-red-500' };
  };
  const confession = getConfessionStatus();

  const getCycleInfo = () => {
    const base = new Date(user.lastRoutineUpdate || user.joinedDate);
    const next = new Date(base);
    next.setDate(base.getDate() + 30);
    const daysLeft = Math.max(0, Math.ceil((next.getTime() - Date.now()) / 86400000));
    const progress = Math.min(100, Math.max(0, ((30 - daysLeft) / 30) * 100));
    return { daysLeft, nextDate: next.toLocaleDateString('pt-BR'), progress };
  };
  const cycle = getCycleInfo();

  const getSubscriptionInfo = () => {
    if (!user.isPremium) return null;
    const renewalDate = user.subscriptionRenewalAt
      ? new Date(user.subscriptionRenewalAt)
      : new Date(new Date(user.joinedDate).setMonth(new Date(user.joinedDate).getMonth() + 1));
    const daysLeft = Math.max(0, Math.ceil((renewalDate.getTime() - Date.now()) / 86400000));
    const progress = Math.min(100, Math.max(0, ((30 - daysLeft) / 30) * 100));
    return { daysLeft, renewalDate: renewalDate.toLocaleDateString('pt-BR'), progress, isAutoRenew: user.subscriptionStatus !== 'canceled' };
  };
  const subInfo = getSubscriptionInfo();

  // ---- Handlers ----
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(formData);
      onUpdateUser(formData);
      setIsEditing(false);
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploadingPhoto(true);
    try {
      const url = await uploadImage(e.target.files[0], 'avatars');
      if (url) {
        const next = { ...user, photoUrl: url };
        setFormData(next);
        onUpdateUser(next);
        await updateUserProfile(next);
      }
    } catch {
      console.error('Upload failed');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleConfessionUpdate = async () => {
    const today = new Date();
    const next = { ...user, lastConfessionAt: today };
    onUpdateUser(next);
    await updateLastConfessionDate(user.id, today);
  };

  const handleSpiritualFieldSave = async (field: 'spiritualFocus' | 'stateOfLife' | 'patronSaint', value: string) => {
    const next = { ...user, [field]: value };
    onUpdateUser(next);
    setFormData(next);
    await updateUserProfile(next);
    setEditingField(null);
  };

  // ---- Render ----
  return (
    <div className="p-6 pb-40 animate-fade-in min-h-screen bg-brand-dark font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-brand-dark/90 backdrop-blur-xl z-30 py-4 -mx-6 px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">Perfil Peregrino</h1>
          {isSyncing && <Loader2 size={14} className="animate-spin text-brand-violet" />}
          {syncDone && !isSyncing && <Check size={14} className="text-green-500" />}
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => { setFormData(user); setIsEditing(false); }}
              className="w-9 h-9 rounded-full bg-white/10 text-slate-400 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-brand-violet text-white shadow-lg' : 'bg-white/10 text-slate-200'}`}
          >
            {isEditing
              ? (isSaving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Salvar</>)
              : <><Edit2 size={16} /> Editar</>
            }
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-10">

        {/* ---- HERO ---- */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-white/10 text-white flex items-center justify-center text-4xl font-bold shadow-float border-4 border-brand-dark overflow-hidden relative">
              {formData.photoUrl
                ? <img src={formData.photoUrl} className="w-full h-full object-cover" alt="avatar" />
                : <span>{formData.name.charAt(0)}</span>
              }
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-brand-violet text-white p-2 rounded-full shadow-lg border-4 border-brand-dark hover:bg-purple-600 cursor-pointer z-20">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
            </label>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              {formData.name}
              {user.isPremium && <Award size={20} className="text-brand-violet" fill="currentColor" />}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="bg-brand-violet/10 text-brand-violet text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest border border-brand-violet/20">
                Nivel {user.level}
              </span>
              <p className="text-slate-400 text-sm">{user.spiritualMaturity || 'Iniciante'}</p>
            </div>
          </div>

          {/* Streak + XP pills */}
          <div className="mt-5 w-full space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full">
                <Flame size={16} className="text-orange-500" />
                <span className="text-orange-400 font-black text-sm">{user.streakDays || 0} dias</span>
                <span className="text-orange-500/60 text-[10px] font-bold uppercase">sequencia</span>
              </div>
              <div className="flex items-center gap-2 bg-brand-violet/10 border border-brand-violet/20 px-4 py-2 rounded-full">
                <Zap size={16} className="text-brand-violet" />
                <span className="text-brand-violet font-black text-sm">{user.currentXP || 0} XP</span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="px-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1.5">
                <span>Progresso para o proximo nivel</span>
                <span>{user.currentXP || 0} / {user.nextLevelXP || 100}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-violet to-purple-400 rounded-full transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---- BIO ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <MessageCircle size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Minha Historia</span>
          </div>
          {isEditing ? (
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Compartilhe um pouco da sua jornada espiritual com a comunidade..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-brand-violet transition-all text-sm resize-none"
            />
          ) : (
            <div className="bg-[#1A1F26] p-4 rounded-2xl border border-white/10 min-h-[72px] flex items-center">
              <p className="text-sm text-slate-300 leading-relaxed">
                {user.bio || <span className="text-slate-600 italic">Nenhuma historia. Toque em Editar para adicionar.</span>}
              </p>
            </div>
          )}
        </div>

        {/* ---- BADGES ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Conquistas</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {badges.map(badge => (
              <div
                key={badge.id}
                title={badge.description}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                  badge.unlocked
                    ? 'border-white/10 bg-[#1A1F26]'
                    : 'border-white/5 bg-white/2 opacity-35'
                }`}
              >
                <span className={`text-2xl ${badge.unlocked ? '' : 'grayscale'}`}>{badge.icon}</span>
                <p className={`text-[9px] font-black uppercase tracking-wide text-center leading-tight ${badge.unlocked ? 'text-white' : 'text-slate-600'}`}>
                  {badge.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- PERFIL ESPIRITUAL ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Heart size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Perfil Espiritual</span>
          </div>
          <div className="bg-[#1A1F26] rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">

            {/* spiritualFocus */}
            <button
              onClick={() => setEditingField('spiritualFocus')}
              className="w-full p-4 flex items-center justify-between group hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                  <Target size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Luta Principal</p>
                  <p className="text-white text-sm font-bold">
                    {user.spiritualFocus
                      ? (STRUGGLE_LABELS[user.spiritualFocus] || user.spiritualFocus)
                      : <span className="text-slate-600 italic font-normal">Nao definido</span>}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-violet transition-colors shrink-0" />
            </button>

            {/* stateOfLife */}
            <button
              onClick={() => setEditingField('stateOfLife')}
              className="w-full p-4 flex items-center justify-between group hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <User size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Estado de Vida</p>
                  <p className="text-white text-sm font-bold">
                    {user.stateOfLife
                      ? (STATE_LABELS[user.stateOfLife] || user.stateOfLife)
                      : <span className="text-slate-600 italic font-normal">Nao definido</span>}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-violet transition-colors shrink-0" />
            </button>

            {/* patronSaint */}
            <button
              onClick={() => setEditingField('patronSaint')}
              className="w-full p-4 flex items-center justify-between group hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Star size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Santo Padroeiro</p>
                  <p className="text-white text-sm font-bold">
                    {user.patronSaint
                      ? (SAINT_LABELS[user.patronSaint]
                          ? `${SAINT_LABELS[user.patronSaint].emoji} ${SAINT_LABELS[user.patronSaint].name}`
                          : user.patronSaint)
                      : <span className="text-slate-600 italic font-normal">Nao definido</span>}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-violet transition-colors shrink-0" />
            </button>

          </div>
        </div>

        {/* ---- CONSISTENCIA (7 semanas) ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <BookOpen size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Consistencia (7 semanas)</span>
          </div>
          <div className="bg-[#1A1F26] p-5 rounded-3xl border border-white/10">
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {consistencyGrid.map((day, i) => (
                <div
                  key={i}
                  title={day.date}
                  className={`aspect-square rounded-sm transition-all ${
                    day.isToday ? 'ring-2 ring-brand-violet ring-offset-1 ring-offset-[#1A1F26]' : ''
                  } ${
                    day.count >= 3
                      ? 'bg-brand-violet'
                      : day.count >= 1
                      ? 'bg-brand-violet/40'
                      : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[9px] text-slate-600 font-bold uppercase">Menos</span>
              {[0, 0.4, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: opacity === 0 ? 'rgba(255,255,255,0.05)' : `rgba(167,139,250,${opacity})` }}
                />
              ))}
              <span className="text-[9px] text-slate-600 font-bold uppercase">Mais</span>
            </div>
          </div>
        </div>

        {/* ---- VIDA SACRAMENTAL ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Shield size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Vida Sacramental</span>
          </div>
          <div
            onClick={handleConfessionUpdate}
            className="bg-[#1A1F26] p-5 rounded-3xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-brand-violet/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <Shield size={28} className={confession.color} />
              <div>
                <h3 className="text-white font-bold text-sm">Ultima Confissao</h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{confession.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-lg">{confession.days ?? '--'}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase">Dias</p>
            </div>
          </div>
          <p className="mt-2 px-2 text-[10px] text-slate-500 italic">Toque para registrar a confissao de hoje.</p>
        </div>

        {/* ---- ASSINATURA ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <CreditCard size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Minha Assinatura</span>
          </div>
          <div className="bg-[#1A1F26] rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">Plano Peregrino</h3>
                    {user.isPremium
                      ? <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-0.5 rounded border border-green-500/20 uppercase">Ativo</span>
                      : <span className="bg-slate-500/10 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded border border-slate-500/20 uppercase">Inativo</span>
                    }
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {user.isPremium ? 'Acesso ilimitado a todas as funcoes.' : 'Acesse conteudos basicos e rotina.'}
                  </p>
                </div>
                {user.isPremium && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Renovacao</p>
                    <p className="text-white font-black text-sm">{subInfo?.renewalDate || '--'}</p>
                  </div>
                )}
              </div>

              {user.isPremium ? (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                      <span>Ciclo Mensal</span>
                      <span>{subInfo?.isAutoRenew ? 'Renova automaticamente' : 'Termina em breve'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-violet" style={{ width: `${subInfo?.progress || 0}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <History size={12} /> Historico de Cobranca
                    </p>
                    {loadingLogs ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
                      </div>
                    ) : paymentLogs.length === 0 ? (
                      <p className="text-[10px] text-slate-600 italic">Nenhum registro encontrado.</p>
                    ) : (
                      paymentLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-[11px]">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                              <Check size={14} />
                            </div>
                            <span className="text-white font-bold">{log.created_at.toLocaleDateString('pt-BR')}</span>
                          </div>
                          <span className="text-slate-400 font-medium">PIX Automatico</span>
                          <span className="text-white font-black">R$ {log.amount?.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => window.open('https://www.espiritualizei.com/', '_system')}
                  className="w-full bg-brand-violet text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  Liberar Acesso Premium <ArrowRight size={18} />
                </button>
              )}
            </div>

            {user.isPremium && (
              <div className="bg-black/20 p-4 border-t border-white/5 flex justify-center">
                <a
                  href="mailto:espiritualizeiapp@gmail.com?subject=Gerenciamento de Assinatura - Espiritualizei"
                  className="text-[10px] font-bold text-slate-500 hover:text-brand-violet transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  <Settings size={12} /> Gerenciar Pagamento
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ---- RECALIBRACAO MENSAL ---- */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3 px-1">
            <RefreshCw size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Recalibracao Mensal</span>
          </div>
          <div className="bg-[#1A1F26] p-6 rounded-3xl border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold">Proxima Direcao</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Luta atual: <span className="text-white font-medium">
                    {user.spiritualFocus
                      ? (STRUGGLE_LABELS[user.spiritualFocus] || user.spiritualFocus)
                      : 'Nao definida'}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-violet">{cycle.daysLeft}</span>
                <span className="block text-[9px] text-slate-500 font-bold uppercase">Dias restantes</span>
              </div>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-violet to-purple-500"
                style={{ width: `${cycle.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 italic">
              O app ajusta sua carga de oracao todo mes para evitar sobrecarga.
            </p>
          </div>
        </div>

        {/* ---- DADOS DA CONTA ---- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <User size={16} className="text-brand-violet" />
            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Dados da Conta</span>
          </div>

          {/* Name */}
          {isEditing ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Nome Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium outline-none focus:border-brand-violet transition-all text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <User size={24} className="text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Nome</p>
                <p className="font-bold text-white">{user.name}</p>
              </div>
            </div>
          )}

          {/* Email — always read-only */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <Mail size={24} className="text-slate-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">E-mail</p>
              <p className="font-bold text-white text-sm truncate">{user.email}</p>
            </div>
            <Lock size={14} className="text-slate-600 shrink-0" />
          </div>
          <p className="text-[10px] text-slate-600 italic px-1">Para alterar o e-mail, entre em contato com o suporte.</p>

          {/* Phone */}
          {isEditing ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Telefone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium placeholder:text-slate-400 outline-none focus:border-brand-violet transition-all text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <Phone size={24} className="text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Telefone</p>
                <p className="font-bold text-white text-sm">
                  {user.phone || <span className="text-slate-600 italic font-normal">Nao informado</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---- SUPORTE + LOGOUT ---- */}
        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-brand-violet/30 group transition-all"
            >
              <HelpCircle size={24} className="text-slate-400 mb-2 group-hover:text-brand-violet" />
              <span className="text-xs font-bold text-white">Central de Ajuda</span>
            </button>
            <button
              onClick={() => setShowTermsModal(true)}
              className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-brand-violet/30 group transition-all"
            >
              <FileText size={24} className="text-slate-400 mb-2 group-hover:text-brand-violet" />
              <span className="text-xs font-bold text-white">Termos de Uso</span>
            </button>
          </div>
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-2 px-6 py-3 rounded-xl bg-red-900/10 transition-colors"
            >
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        </div>

      </div>

      {/* ---- MODALS ---- */}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-brand-dark p-6 rounded-3xl shadow-2xl max-w-xs w-full text-center border border-white/10">
            <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deseja sair?</h3>
            <p className="text-xs text-slate-400 leading-relaxed px-4">Sua sessao sera encerrada e voce precisara logar novamente.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-white/10 transition-colors">Voltar</button>
              <button onClick={onLogout} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white shadow-lg">Sair</button>
            </div>
          </div>
        </div>
      )}

      {editingField && (
        <SpiritualFieldModal
          field={editingField}
          currentValue={user[editingField] || ''}
          onSave={(value) => handleSpiritualFieldSave(editingField, value)}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

export default Profile;