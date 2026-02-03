import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Crown, UserX, Shield, Search, Filter, 
  TrendingUp, Calendar, Clock, Mail, Phone, 
  ChevronDown, ChevronUp, MoreVertical, Check, X,
  Download, RefreshCw, LogOut, Home, Settings,
  BarChart3, UserCheck, UserMinus, Trash2, Edit,
  Eye, Lock, Unlock, Star, Activity, Zap, Bell,
  MessageSquare, Send, FileText, AlertTriangle,
  Heart, BookOpen, Target, Gift, Megaphone, Headphones,
  Smartphone, Monitor, PieChart, ArrowUpRight, ArrowDownRight,
  TrendingDown, Award, Flame, Coffee, Sun, Moon,
  Compass, Church, Cross, Sparkles, Layers
} from 'lucide-react';
import BrandLogo from './BrandLogo';

// Credenciais do Supabase hardcoded para garantir funcionamento
const ADMIN_SUPABASE_URL = 'https://anoqhwpdrztaqmlocnzx.supabase.co';
const ADMIN_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_premium: boolean;
  subscription_status?: string;
  created_at: string;
  joined_date?: string;
  last_active_at?: string;
  current_xp?: number;
  level?: number;
  streak_days?: number;
  is_suspended?: boolean;
  spiritual_maturity?: string;
  spiritual_focus?: string;
  spiritual_goal?: string;
  state_of_life?: string;
  photo_url?: string;
  patron_saint?: string;
  confession_frequency?: string;
  payment_provider?: string;
  premium_since?: string;
  last_routine_update?: string;
  last_confession_at?: string;
}

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeToday: number;
  newThisWeek: number;
  newThisMonth: number;
  avgXP: number;
  conversionRate: number;
  trialUsers: number;
  activeUsers: number;
  avgLevel: number;
  avgStreak: number;
}

interface FeatureUsage {
  feature: string;
  icon: any;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

interface AdminPanelProps {
  onLogout: () => void;
  onBackToApp: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics' | 'features' | 'settings'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free' | 'trial'>('all');
  const [sortBy, setSortBy] = useState<'joined_date' | 'name' | 'current_xp' | 'level'>('joined_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'premium' | 'free'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Contadores de funcionalidades
  const [featureStats, setFeatureStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalIntentions: 0,
    totalJournalEntries: 0,
    totalRoutines: 0,
    totalPrayerIntentions: 0,
    totalPrayerInteractions: 0,
    usersWithConfession: 0,
    usersWithRoutineUpdate: 0,
    usersWithStreak: 0
  });
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    avgXP: 0,
    conversionRate: 0,
    trialUsers: 0,
    activeUsers: 0,
    avgLevel: 0,
    avgStreak: 0
  });

  // Função para fazer fetch no Supabase
  const supabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${ADMIN_SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': ADMIN_SUPABASE_KEY,
      'Authorization': `Bearer ${ADMIN_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}`);
    }
    
    return response.json();
  };

  // Função para contar registros
  const countRecords = async (table: string): Promise<number> => {
    try {
      const response = await fetch(`${ADMIN_SUPABASE_URL}/rest/v1/${table}?select=id`, {
        headers: {
          'apikey': ADMIN_SUPABASE_KEY,
          'Authorization': `Bearer ${ADMIN_SUPABASE_KEY}`,
          'Prefer': 'count=exact'
        }
      });
      const contentRange = response.headers.get('content-range');
      if (contentRange) {
        const match = contentRange.match(/\/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.includes(query)
      );
    }
    
    if (filterType === 'premium') {
      filtered = filtered.filter(u => u.is_premium);
    } else if (filterType === 'free') {
      filtered = filtered.filter(u => !u.is_premium && u.subscription_status !== 'trial');
    } else if (filterType === 'trial') {
      filtered = filtered.filter(u => u.subscription_status === 'trial');
    }
    
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof AdminUser] || '';
      let bVal: any = b[sortBy as keyof AdminUser] || '';
      if (sortBy === 'current_xp' || sortBy === 'level') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchQuery, filterType, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[AdminPanel] Carregando dados do Supabase...');
      
      // Buscar profiles
      const profilesData = await supabaseFetch('profiles?select=*&order=joined_date.desc');
      console.log('[AdminPanel] Profiles carregados:', profilesData.length);
      
      // Buscar posts
      const postsData = await supabaseFetch('posts?select=*&order=timestamp.desc');
      setPosts(postsData || []);
      
      // Contar registros de cada tabela
      const [
        totalPosts,
        totalComments,
        totalIntentions,
        totalJournalEntries,
        totalRoutines,
        totalPrayerIntentions,
        totalPrayerInteractions
      ] = await Promise.all([
        countRecords('posts'),
        countRecords('comments'),
        countRecords('intentions'),
        countRecords('journal_entries'),
        countRecords('routines'),
        countRecords('prayer_intentions'),
        countRecords('prayer_interactions')
      ]);
      
      const usersData: AdminUser[] = (profilesData || []).map((p: any) => ({
        id: p.id,
        name: p.name || 'Sem nome',
        email: p.email || '',
        phone: p.phone || '',
        is_premium: p.is_premium || false,
        subscription_status: p.subscription_status || 'free',
        created_at: p.created_at || p.joined_date,
        joined_date: p.joined_date,
        last_active_at: p.last_active_at,
        current_xp: p.current_xp || 0,
        level: p.level || 1,
        streak_days: p.streak_days || 0,
        is_suspended: p.is_suspended || false,
        spiritual_maturity: p.spiritual_maturity,
        spiritual_focus: p.spiritual_focus,
        spiritual_goal: p.spiritual_goal,
        state_of_life: p.state_of_life,
        photo_url: p.photo_url,
        patron_saint: p.patron_saint,
        confession_frequency: p.confession_frequency,
        payment_provider: p.payment_provider,
        premium_since: p.premium_since,
        last_routine_update: p.last_routine_update,
        last_confession_at: p.last_confession_at
      }));

      setUsers(usersData);

      // Calcular estatísticas de funcionalidades
      const usersWithConfession = usersData.filter(u => u.last_confession_at).length;
      const usersWithRoutineUpdate = usersData.filter(u => u.last_routine_update).length;
      const usersWithStreak = usersData.filter(u => (u.streak_days || 0) > 0).length;

      setFeatureStats({
        totalPosts,
        totalComments,
        totalIntentions,
        totalJournalEntries,
        totalRoutines,
        totalPrayerIntentions,
        totalPrayerInteractions,
        usersWithConfession,
        usersWithRoutineUpdate,
        usersWithStreak
      });

      // Calcular estatísticas gerais
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const premiumCount = usersData.filter(u => u.is_premium).length;
      const freeCount = usersData.filter(u => !u.is_premium && u.subscription_status !== 'trial').length;
      const trialCount = usersData.filter(u => u.subscription_status === 'trial').length;
      const newThisWeek = usersData.filter(u => new Date(u.joined_date || u.created_at) >= weekAgo).length;
      const newThisMonth = usersData.filter(u => new Date(u.joined_date || u.created_at) >= monthAgo).length;
      const activeToday = usersData.filter(u => {
        if (!u.last_active_at) return false;
        const lastActive = new Date(u.last_active_at);
        return lastActive >= today;
      }).length;
      
      const totalXP = usersData.reduce((acc, u) => acc + (u.current_xp || 0), 0);
      const totalLevel = usersData.reduce((acc, u) => acc + (u.level || 1), 0);
      const totalStreak = usersData.reduce((acc, u) => acc + (u.streak_days || 0), 0);

      setStats({
        totalUsers: usersData.length,
        premiumUsers: premiumCount,
        freeUsers: freeCount,
        activeToday,
        newThisWeek,
        newThisMonth,
        avgXP: usersData.length > 0 ? Math.round(totalXP / usersData.length) : 0,
        conversionRate: usersData.length > 0 ? Math.round((premiumCount / usersData.length) * 100) : 0,
        trialUsers: trialCount,
        activeUsers: activeToday,
        avgLevel: usersData.length > 0 ? Math.round((totalLevel / usersData.length) * 10) / 10 : 0,
        avgStreak: usersData.length > 0 ? Math.round((totalStreak / usersData.length) * 10) / 10 : 0
      });

      setLastUpdate(new Date());
      console.log('[AdminPanel] Dados carregados com sucesso!');

    } catch (err: any) {
      console.error('[AdminPanel] Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Ações de usuário
  const togglePremium = async (user: AdminUser) => {
    setActionLoading(true);
    try {
      const newStatus = !user.is_premium;
      
      await supabaseFetch(`profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          is_premium: newStatus,
          subscription_status: newStatus ? 'active' : 'free',
          premium_since: newStatus ? new Date().toISOString() : null
        })
      });
      
      setUsers(users.map(u => u.id === user.id ? { 
        ...u, 
        is_premium: newStatus,
        subscription_status: newStatus ? 'active' : 'free'
      } : u));
      
      setShowUserModal(false);
      alert(`Plano ${newStatus ? 'Premium concedido' : 'removido'} com sucesso!`);
    } catch (e: any) {
      console.error('Erro ao alterar plano:', e);
      alert('Erro ao alterar plano: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSuspend = async (user: AdminUser) => {
    setActionLoading(true);
    try {
      const newStatus = !user.is_suspended;
      
      await supabaseFetch(`profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_suspended: newStatus })
      });
      
      setUsers(users.map(u => u.id === user.id ? { ...u, is_suspended: newStatus } : u));
      setShowUserModal(false);
      alert(`Usuário ${newStatus ? 'suspenso' : 'reativado'} com sucesso!`);
    } catch (e: any) {
      console.error('Erro ao suspender/reativar:', e);
      alert('Erro ao suspender/reativar usuário: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`)) return;
    
    setActionLoading(true);
    try {
      await supabaseFetch(`profiles?id=eq.${user.id}`, {
        method: 'DELETE'
      });
      
      setUsers(users.filter(u => u.id !== user.id));
      setShowUserModal(false);
      alert('Usuário excluído com sucesso!');
    } catch (e: any) {
      console.error('Erro ao excluir usuário:', e);
      alert('Erro ao excluir usuário: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Premium', 'Status', 'XP', 'Nível', 'Streak', 'Foco Espiritual', 'Estado de Vida', 'Santo Padroeiro', 'Data de Cadastro'].join(','),
      ...filteredUsers.map(u => [
        `"${u.name}"`,
        u.email || '',
        u.phone || '',
        u.is_premium ? 'Sim' : 'Não',
        u.subscription_status || 'free',
        u.current_xp || 0,
        u.level || 1,
        u.streak_days || 0,
        u.spiritual_focus || '',
        u.state_of_life || '',
        u.patron_saint || '',
        u.joined_date ? new Date(u.joined_date).toLocaleDateString('pt-BR') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_espiritualizei_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Componente de Card de Estatística
  const StatCard = ({ icon: Icon, label, value, subValue, color, trend }: {
    icon: any;
    label: string;
    value: string | number;
    subValue?: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={22} className="text-white" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-3xl font-black text-brand-dark dark:text-white">{value}</p>
      {subValue && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${
          trend === 'up' ? 'text-emerald-500' : 
          trend === 'down' ? 'text-red-500' : 
          'text-slate-400'
        }`}>
          {trend === 'up' && <ArrowUpRight size={12} />}
          {trend === 'down' && <ArrowDownRight size={12} />}
          {subValue}
        </p>
      )}
    </div>
  );

  // Renderização do Dashboard
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Cards de Estatísticas Principais */}
      <div>
        <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-brand-violet" />
          Visão Geral
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users} 
            label="Total de Usuários" 
            value={stats.totalUsers}
            subValue={`+${stats.newThisWeek} esta semana`}
            color="bg-gradient-to-br from-brand-violet to-purple-600"
            trend="up"
          />
          <StatCard 
            icon={Crown} 
            label="Premium" 
            value={stats.premiumUsers}
            subValue={`${stats.conversionRate}% de conversão`}
            color="bg-gradient-to-br from-amber-400 to-amber-600"
            trend="neutral"
          />
          <StatCard 
            icon={Activity} 
            label="Ativos Hoje" 
            value={stats.activeToday}
            subValue="usuários online"
            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
            trend="neutral"
          />
          <StatCard 
            icon={Zap} 
            label="XP Médio" 
            value={stats.avgXP}
            subValue="pontos por usuário"
            color="bg-gradient-to-br from-blue-400 to-blue-600"
            trend="neutral"
          />
        </div>
      </div>

      {/* Segunda linha de cards */}
      <div>
        <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          Métricas de Engajamento
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Star} 
            label="Nível Médio" 
            value={stats.avgLevel}
            subValue="média geral"
            color="bg-gradient-to-br from-pink-400 to-pink-600"
            trend="neutral"
          />
          <StatCard 
            icon={Flame} 
            label="Streak Médio" 
            value={`${stats.avgStreak} dias`}
            subValue="sequência de uso"
            color="bg-gradient-to-br from-orange-400 to-orange-600"
            trend="neutral"
          />
          <StatCard 
            icon={Clock} 
            label="Em Trial" 
            value={stats.trialUsers}
            subValue="período de teste"
            color="bg-gradient-to-br from-cyan-400 to-cyan-600"
            trend="neutral"
          />
          <StatCard 
            icon={Calendar} 
            label="Novos (30d)" 
            value={stats.newThisMonth}
            subValue="último mês"
            color="bg-gradient-to-br from-indigo-400 to-indigo-600"
            trend="up"
          />
        </div>
      </div>

      {/* Gráficos e Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Planos */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-brand-violet" />
            Distribuição de Planos
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" /> Premium
                </span>
                <span className="font-bold text-amber-500">{stats.premiumUsers} ({stats.conversionRate}%)</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-700"
                  style={{ width: `${stats.conversionRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Clock size={16} className="text-cyan-500" /> Trial
                </span>
                <span className="font-bold text-cyan-500">
                  {stats.trialUsers} ({stats.totalUsers > 0 ? Math.round((stats.trialUsers / stats.totalUsers) * 100) : 0}%)
                </span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-700"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.trialUsers / stats.totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Users size={16} className="text-slate-500" /> Free
                </span>
                <span className="font-bold text-slate-500">
                  {stats.freeUsers} ({stats.totalUsers > 0 ? Math.round((stats.freeUsers / stats.totalUsers) * 100) : 0}%)
                </span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-700"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.freeUsers / stats.totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Ranking */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            Top 5 Ranking de XP
          </h3>
          <div className="space-y-3">
            {users
              .sort((a, b) => (b.current_xp || 0) - (a.current_xp || 0))
              .slice(0, 5)
              .map((user, index) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-violet to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-dark dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500">Nível {user.level || 1} • {user.streak_days || 0} dias de streak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-violet">{user.current_xp || 0} XP</p>
                    {user.is_premium && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                        <Crown size={10} /> Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
            {users.length === 0 && (
              <p className="text-center text-slate-500 py-8">Nenhum usuário encontrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
          <Zap size={20} className="text-brand-violet" />
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-brand-violet/10 to-purple-500/10 rounded-xl hover:from-brand-violet/20 hover:to-purple-500/20 transition-all duration-300 border border-brand-violet/20"
          >
            <Megaphone size={20} className="text-brand-violet" />
            <span className="font-medium text-brand-dark dark:text-white">Enviar Notificação</span>
          </button>
          <button 
            onClick={exportUsers}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-300 border border-emerald-500/20"
          >
            <Download size={20} className="text-emerald-500" />
            <span className="font-medium text-brand-dark dark:text-white">Exportar Usuários</span>
          </button>
          <button 
            onClick={loadData}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 border border-blue-500/20"
          >
            <RefreshCw size={20} className="text-blue-500" />
            <span className="font-medium text-brand-dark dark:text-white">Atualizar Dados</span>
          </button>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-xl hover:from-slate-500/20 hover:to-gray-500/20 transition-all duration-300 border border-slate-500/20"
          >
            <Settings size={20} className="text-slate-500" />
            <span className="font-medium text-brand-dark dark:text-white">Supabase</span>
          </a>
        </div>
      </div>
    </div>
  );

  // Renderização de Usuários
  const renderUsers = () => (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 text-brand-dark dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 text-brand-dark dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="premium">Premium</option>
              <option value="free">Free</option>
              <option value="trial">Trial</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 text-brand-dark dark:text-white"
            >
              <option value="joined_date">Data de Cadastro</option>
              <option value="name">Nome</option>
              <option value="current_xp">XP</option>
              <option value="level">Nível</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp size={20} className="text-slate-600 dark:text-slate-400" /> : <ChevronDown size={20} className="text-slate-600 dark:text-slate-400" />}
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-500">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progresso</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cadastro</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-violet to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-brand-dark dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email || 'Sem email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.is_premium ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium w-fit">
                          <Crown size={12} /> Premium
                        </span>
                      ) : user.subscription_status === 'trial' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium w-fit">
                          <Clock size={12} /> Trial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium w-fit">
                          Free
                        </span>
                      )}
                      {user.is_suspended && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-xs font-medium w-fit">
                          <Lock size={12} /> Suspenso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-brand-dark dark:text-white">
                        Nível {user.level || 1} • {user.current_xp || 0} XP
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" /> {user.streak_days || 0} dias de streak
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {user.joined_date ? new Date(user.joined_date).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );

  // Renderização de Analytics
  const renderAnalytics = () => {
    // Calcular analytics avançados
    const spiritualFocusStats = users.reduce((acc, u) => {
      const focus = u.spiritual_focus || 'Não definido';
      acc[focus] = (acc[focus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stateOfLifeStats = users.reduce((acc, u) => {
      const state = u.state_of_life || 'Não definido';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const patronSaintStats = users.reduce((acc, u) => {
      const saint = u.patron_saint || 'Não definido';
      acc[saint] = (acc[saint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const confessionStats = users.reduce((acc, u) => {
      const freq = u.confession_frequency || 'Não definido';
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const focusLabels: Record<string, string> = {
      'laziness': 'Preguiça',
      'lust': 'Luxúria',
      'anger': 'Raiva',
      'pride': 'Orgulho',
      'envy': 'Inveja',
      'gluttony': 'Gula',
      'greed': 'Avareza',
      'Paz': 'Paz',
      'peace': 'Paz',
      'truth': 'Verdade',
      'Não definido': 'Não definido'
    };

    const stateLabels: Record<string, string> = {
      'single': 'Solteiro(a)',
      'married': 'Casado(a)',
      'religious': 'Religioso(a)',
      'parent': 'Pai/Mãe',
      'Não definido': 'Não definido'
    };

    const saintLabels: Record<string, string> = {
      'mary': 'Nossa Senhora',
      'acutis': 'Carlo Acutis',
      'therese': 'Santa Teresinha',
      'francis': 'São Francisco',
      'Não definido': 'Não definido'
    };

    const confessionLabels: Record<string, string> = {
      'weekly': 'Semanal',
      'monthly': 'Mensal',
      'rare': 'Raramente',
      'never': 'Nunca',
      'Não definido': 'Não definido'
    };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <BarChart3 size={24} className="text-brand-violet" />
          Analytics de Perfil Espiritual
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Foco Espiritual */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-pink-500" />
              Foco Espiritual dos Usuários
            </h3>
            <div className="space-y-3">
              {Object.entries(spiritualFocusStats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 7)
                .map(([focus, count]) => (
                  <div key={focus}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{focusLabels[focus] || focus}</span>
                      <span className="font-medium text-brand-dark dark:text-white">{count} ({Math.round((count / users.length) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
                        style={{ width: `${(count / users.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Estado de Vida */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              Estado de Vida
            </h3>
            <div className="space-y-3">
              {Object.entries(stateOfLifeStats)
                .sort((a, b) => b[1] - a[1])
                .map(([state, count]) => (
                  <div key={state}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{stateLabels[state] || state}</span>
                      <span className="font-medium text-brand-dark dark:text-white">{count} ({Math.round((count / users.length) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                        style={{ width: `${(count / users.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Santos Padroeiros */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
              <Star size={20} className="text-amber-500" />
              Santos Padroeiros Escolhidos
            </h3>
            <div className="space-y-3">
              {Object.entries(patronSaintStats)
                .sort((a, b) => b[1] - a[1])
                .map(([saint, count]) => (
                  <div key={saint}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{saintLabels[saint] || saint}</span>
                      <span className="font-medium text-brand-dark dark:text-white">{count} ({Math.round((count / users.length) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                        style={{ width: `${(count / users.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Frequência de Confissão */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-purple-500" />
              Frequência de Confissão
            </h3>
            <div className="space-y-3">
              {Object.entries(confessionStats)
                .sort((a, b) => b[1] - a[1])
                .map(([freq, count]) => (
                  <div key={freq}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{confessionLabels[freq] || freq}</span>
                      <span className="font-medium text-brand-dark dark:text-white">{count} ({Math.round((count / users.length) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                        style={{ width: `${(count / users.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderização de Features (Uso de Funcionalidades)
  const renderFeatures = () => {
    // Calcular uso de funcionalidades baseado nos dados disponíveis
    const totalUsers = users.length || 1;
    
    const featuresList: FeatureUsage[] = [
      {
        feature: 'Comunidade (Posts)',
        icon: MessageSquare,
        count: featureStats.totalPosts,
        percentage: Math.round((featureStats.totalPosts / totalUsers) * 100),
        color: 'from-blue-400 to-blue-600',
        description: `${featureStats.totalPosts} posts criados`
      },
      {
        feature: 'Rotina Espiritual',
        icon: Calendar,
        count: featureStats.usersWithRoutineUpdate,
        percentage: Math.round((featureStats.usersWithRoutineUpdate / totalUsers) * 100),
        color: 'from-emerald-400 to-emerald-600',
        description: `${featureStats.usersWithRoutineUpdate} usuários atualizaram rotina`
      },
      {
        feature: 'Confissão',
        icon: Church,
        count: featureStats.usersWithConfession,
        percentage: Math.round((featureStats.usersWithConfession / totalUsers) * 100),
        color: 'from-purple-400 to-purple-600',
        description: `${featureStats.usersWithConfession} usuários registraram confissão`
      },
      {
        feature: 'Streak (Sequência)',
        icon: Flame,
        count: featureStats.usersWithStreak,
        percentage: Math.round((featureStats.usersWithStreak / totalUsers) * 100),
        color: 'from-orange-400 to-orange-600',
        description: `${featureStats.usersWithStreak} usuários com streak ativo`
      },
      {
        feature: 'Intenções de Oração',
        icon: Heart,
        count: featureStats.totalPrayerIntentions,
        percentage: Math.round((featureStats.totalPrayerIntentions / totalUsers) * 100),
        color: 'from-pink-400 to-pink-600',
        description: `${featureStats.totalPrayerIntentions} intenções criadas`
      },
      {
        feature: 'Diário Espiritual',
        icon: BookOpen,
        count: featureStats.totalJournalEntries,
        percentage: Math.round((featureStats.totalJournalEntries / totalUsers) * 100),
        color: 'from-indigo-400 to-indigo-600',
        description: `${featureStats.totalJournalEntries} entradas no diário`
      },
      {
        feature: 'Comentários',
        icon: MessageSquare,
        count: featureStats.totalComments,
        percentage: Math.round((featureStats.totalComments / totalUsers) * 100),
        color: 'from-cyan-400 to-cyan-600',
        description: `${featureStats.totalComments} comentários feitos`
      },
      {
        feature: 'Interações de Oração',
        icon: Sparkles,
        count: featureStats.totalPrayerInteractions,
        percentage: Math.round((featureStats.totalPrayerInteractions / totalUsers) * 100),
        color: 'from-amber-400 to-amber-600',
        description: `${featureStats.totalPrayerInteractions} interações de oração`
      }
    ].sort((a, b) => b.count - a.count);

    const mostUsed = featuresList.slice(0, 4);
    const leastUsed = featuresList.slice(-4).reverse();

    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <Layers size={24} className="text-brand-violet" />
          Uso de Funcionalidades do App
        </h2>

        {/* Resumo Geral */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={MessageSquare} 
            label="Posts na Comunidade" 
            value={featureStats.totalPosts}
            subValue="publicações"
            color="bg-gradient-to-br from-blue-400 to-blue-600"
            trend="neutral"
          />
          <StatCard 
            icon={Calendar} 
            label="Rotinas Atualizadas" 
            value={featureStats.usersWithRoutineUpdate}
            subValue={`${Math.round((featureStats.usersWithRoutineUpdate / totalUsers) * 100)}% dos usuários`}
            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
            trend="neutral"
          />
          <StatCard 
            icon={Church} 
            label="Confissões Registradas" 
            value={featureStats.usersWithConfession}
            subValue={`${Math.round((featureStats.usersWithConfession / totalUsers) * 100)}% dos usuários`}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
            trend="neutral"
          />
          <StatCard 
            icon={Flame} 
            label="Streaks Ativos" 
            value={featureStats.usersWithStreak}
            subValue={`${Math.round((featureStats.usersWithStreak / totalUsers) * 100)}% dos usuários`}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
            trend="neutral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funcionalidades Mais Usadas */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Funcionalidades Mais Usadas
            </h3>
            <div className="space-y-4">
              {mostUsed.map((feature, index) => (
                <div key={feature.feature} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-brand-dark dark:text-white">{feature.feature}</span>
                      <span className="text-sm font-bold text-emerald-500">{feature.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${feature.color} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(feature.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funcionalidades Menos Usadas */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
              <TrendingDown size={20} className="text-red-500" />
              Funcionalidades Menos Usadas
            </h3>
            <div className="space-y-4">
              {leastUsed.map((feature, index) => (
                <div key={feature.feature} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center opacity-60`}>
                    <feature.icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-brand-dark dark:text-white">{feature.feature}</span>
                      <span className="text-sm font-bold text-red-500">{feature.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.max(feature.percentage, 5)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {leastUsed.every(f => f.count === 0) && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Estas funcionalidades ainda não foram utilizadas pelos usuários. Considere promovê-las!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ranking Completo de Funcionalidades */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-violet" />
            Ranking Completo de Uso
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Funcionalidade</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Uso Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">% Usuários</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {featuresList.map((feature, index) => (
                  <tr key={feature.feature} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index < 3 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                        index >= featuresList.length - 3 ? 'bg-red-100 dark:bg-red-500/20 text-red-600' :
                        'bg-slate-100 dark:bg-white/10 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                          <feature.icon size={18} className="text-white" />
                        </div>
                        <span className="font-medium text-brand-dark dark:text-white">{feature.feature}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-brand-dark dark:text-white">{feature.count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-slate-600 dark:text-slate-400">{feature.percentage}%</span>
                    </td>
                    <td className="px-4 py-3">
                      {feature.count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                          <Check size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
                          Sem uso
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderização de Configurações
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
        <Settings size={24} className="text-brand-violet" />
        Configurações do Painel
      </h2>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Informações do Sistema</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <span className="text-slate-600 dark:text-slate-400">Versão do Painel</span>
            <span className="font-medium text-brand-dark dark:text-white">v2.2.0</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <span className="text-slate-600 dark:text-slate-400">Última Atualização de Dados</span>
            <span className="font-medium text-brand-dark dark:text-white">
              {lastUpdate ? lastUpdate.toLocaleString('pt-BR') : 'Nunca'}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <span className="text-slate-600 dark:text-slate-400">Status da Conexão</span>
            <span className="inline-flex items-center gap-2 font-medium text-emerald-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Conectado
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Links Úteis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-brand-dark dark:text-white">Supabase Dashboard</p>
              <p className="text-sm text-slate-500">Gerenciar banco de dados</p>
            </div>
          </a>
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">▲</span>
            </div>
            <div>
              <p className="font-medium text-brand-dark dark:text-white">Vercel Dashboard</p>
              <p className="text-sm text-slate-500">Gerenciar deploys</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-violet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-8 max-w-md w-full text-center border border-red-200 dark:border-red-500/20">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Erro ao carregar dados</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-brand-violet text-white rounded-xl font-medium hover:bg-brand-violet/90 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col items-center">
      {/* Header - Centralizado */}
      <header className="w-full bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/10 sticky top-0 z-50">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <BrandLogo size={32} variant="fill" className="text-brand-violet" />
              <div>
                <h1 className="text-lg font-black text-brand-dark dark:text-white">Painel Admin</h1>
                <p className="text-xs text-slate-500">Espiritualizei</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Enviar notificação"
              >
                <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={loadData}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={onBackToApp}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Voltar ao app"
              >
                <Home size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação - Centralizada */}
      <nav className="w-full bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/10">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 justify-center">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'features', label: 'Funcionalidades', icon: Layers },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal - Centralizado */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'features' && renderFeatures()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modal de Usuário */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-brand-dark rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">Detalhes do Usuário</h3>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {selectedUser.photo_url ? (
                  <img src={selectedUser.photo_url} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-violet to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-brand-dark dark:text-white">{selectedUser.name}</h4>
                  <p className="text-slate-500">{selectedUser.email || 'Sem email'}</p>
                  {selectedUser.is_premium && (
                    <span className="inline-flex items-center gap-1 text-amber-500 text-sm">
                      <Crown size={14} /> Premium
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Nível</p>
                  <p className="text-xl font-bold text-brand-dark dark:text-white">{selectedUser.level || 1}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">XP Total</p>
                  <p className="text-xl font-bold text-brand-dark dark:text-white">{selectedUser.current_xp || 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Streak</p>
                  <p className="text-xl font-bold text-brand-dark dark:text-white">{selectedUser.streak_days || 0} dias</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <p className="text-xl font-bold text-brand-dark dark:text-white">{selectedUser.subscription_status || 'free'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <span className="text-slate-500">Foco Espiritual</span>
                  <span className="font-medium text-brand-dark dark:text-white">{selectedUser.spiritual_focus || '-'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <span className="text-slate-500">Estado de Vida</span>
                  <span className="font-medium text-brand-dark dark:text-white">{selectedUser.state_of_life || '-'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <span className="text-slate-500">Santo Padroeiro</span>
                  <span className="font-medium text-brand-dark dark:text-white">{selectedUser.patron_saint || '-'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <span className="text-slate-500">Cadastro</span>
                  <span className="font-medium text-brand-dark dark:text-white">
                    {selectedUser.joined_date ? new Date(selectedUser.joined_date).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => togglePremium(selectedUser)}
                  disabled={actionLoading}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    selectedUser.is_premium
                      ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20'
                      : 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700'
                  }`}
                >
                  {selectedUser.is_premium ? 'Remover Premium' : 'Conceder Premium'}
                </button>
                <button
                  onClick={() => toggleSuspend(selectedUser)}
                  disabled={actionLoading}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    selectedUser.is_suspended
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {selectedUser.is_suspended ? 'Reativar Usuário' : 'Suspender Usuário'}
                </button>
                <button
                  onClick={() => deleteUser(selectedUser)}
                  disabled={actionLoading}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Excluir Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Broadcast */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-brand-dark rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-dark dark:text-white">Enviar Notificação</h3>
                <button onClick={() => setShowBroadcastModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Título</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Título da notificação"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 text-brand-dark dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mensagem</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 text-brand-dark dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Destinatários</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-violet/50 text-brand-dark dark:text-white"
                >
                  <option value="all">Todos os usuários ({users.length})</option>
                  <option value="premium">Apenas Premium ({stats.premiumUsers})</option>
                  <option value="free">Apenas Free ({stats.freeUsers})</option>
                </select>
              </div>
              <button
                onClick={() => {
                  alert('Funcionalidade de notificação em desenvolvimento');
                  setShowBroadcastModal(false);
                }}
                disabled={!broadcastTitle || !broadcastMessage}
                className="w-full py-3 bg-brand-violet text-white rounded-xl font-medium hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Notificação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
