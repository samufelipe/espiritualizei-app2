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
  Smartphone, Monitor, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { supabase, getConnectionStatus, SUPABASE_URL, SUPABASE_KEY } from '../services/authService';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscription_type: 'free' | 'premium';
  subscription_status?: string;
  created_at: string;
  last_login?: string;
  last_active_at?: string;
  xp_total?: number;
  level?: number;
  streak_days?: number;
  is_suspended?: boolean;
  maturity_level?: string;
  spiritual_profile?: string;
  photo_url?: string;
  total_session_time?: number;
  sessions_count?: number;
  favorite_features?: string[];
  device_type?: string;
}

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeToday: number;
  newThisWeek: number;
  newThisMonth: number;
  avgSessionTime: string;
  conversionRate: number;
  totalIntentions: number;
  totalRoutinesCompleted: number;
  suspendedUsers: number;
  totalSessionMinutes: number;
  mobileUsers: number;
  desktopUsers: number;
}

interface SupportMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_response?: string;
  responded_by?: string;
  responded_at?: string;
  created_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  type: string;
  created_at: string;
  likes_count: number;
  is_flagged?: boolean;
}

interface FeatureUsage {
  feature: string;
  count: number;
  percentage: number;
}

interface AdminPanelProps {
  onLogout: () => void;
  onBackToApp: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'support' | 'analytics' | 'settings'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'xp_total' | 'last_login'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedSupportMessage, setSelectedSupportMessage] = useState<SupportMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'premium' | 'free'>('all');
  const [supportResponse, setSupportResponse] = useState('');
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    avgSessionTime: '0min',
    conversionRate: 0,
    totalIntentions: 0,
    totalRoutinesCompleted: 0,
    suspendedUsers: 0,
    totalSessionMinutes: 0,
    mobileUsers: 0,
    desktopUsers: 0
  });

  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([
    { feature: 'Jornada Diária', count: 0, percentage: 0 },
    { feature: 'Comunidade', count: 0, percentage: 0 },
    { feature: 'Biblioteca', count: 0, percentage: 0 },
    { feature: 'Ranking', count: 0, percentage: 0 },
    { feature: 'Perfil', count: 0, percentage: 0 }
  ]);

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
      filtered = filtered.filter(u => u.subscription_type === 'premium');
    } else if (filterType === 'free') {
      filtered = filtered.filter(u => u.subscription_type === 'free');
    } else if (filterType === 'suspended') {
      filtered = filtered.filter(u => u.is_suspended);
    }
    
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (sortBy === 'xp_total') {
        aVal = a.xp_total || 0;
        bVal = b.xp_total || 0;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchQuery, filterType, sortBy, sortOrder]);

  // Chave secreta do admin (deve corresponder à configurada na Edge Function)
  const ADMIN_SECRET = 'Espiritualizei@Admin2024';

  const callAdminAPI = async (action: string, data?: any) => {
    const supabaseUrl = SUPABASE_URL;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET
      },
      body: JSON.stringify({ action, data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na API');
    }

    return response.json();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[AdminPanel] Iniciando carregamento de dados via Edge Function...');
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      if (!supabaseUrl) {
        console.error('[AdminPanel] Variáveis de ambiente não configuradas');
        setLoading(false);
        return;
      }

      // Tentar usar Edge Function primeiro
      let profilesData: any[] = [];
      let useEdgeFunction = true;

      try {
        console.log('[AdminPanel] Tentando Edge Function...');
        const result = await callAdminAPI('get_all_users');
        if (result.success && result.data) {
          profilesData = result.data;
          console.log('[AdminPanel] Profiles via Edge Function:', profilesData.length);
        }
      } catch (edgeFunctionError) {
        console.log('[AdminPanel] Edge Function não disponível, usando fetch direto...');
        useEdgeFunction = false;
        
        // Fallback: buscar diretamente (requer política RLS permissiva)
        const profilesResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (profilesResponse.ok) {
          profilesData = await profilesResponse.json();
          console.log('[AdminPanel] Profiles via fetch direto:', profilesData.length);
        } else {
          console.error('[AdminPanel] Erro ao buscar profiles:', profilesResponse.status);
        }
      }

      const usersData: AdminUser[] = (profilesData || []).map(p => ({
        id: p.id,
        name: p.name || p.full_name || 'Sem nome',
        email: p.email || '',
        phone: p.phone || '',
        subscription_type: p.subscription_type || 'free',
        subscription_status: p.subscription_status,
        created_at: p.created_at,
        last_login: p.last_login,
        last_active_at: p.last_active_at,
        xp_total: p.xp_total || 0,
        level: p.level || 1,
        streak_days: p.streak_days || 0,
        is_suspended: p.is_suspended || false,
        maturity_level: p.maturity_level,
        spiritual_profile: p.spiritual_profile,
        photo_url: p.photo_url || p.avatar_url,
        total_session_time: p.total_session_time || 0,
        sessions_count: p.sessions_count || 0,
        favorite_features: p.favorite_features || [],
        device_type: p.device_type || 'unknown'
      }));

      setUsers(usersData);

      // Calcular estatísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const premiumCount = usersData.filter(u => u.subscription_type === 'premium').length;
      const freeCount = usersData.filter(u => u.subscription_type === 'free').length;
      const suspendedCount = usersData.filter(u => u.is_suspended).length;
      const newThisWeek = usersData.filter(u => new Date(u.created_at) >= weekAgo).length;
      const newThisMonth = usersData.filter(u => new Date(u.created_at) >= monthAgo).length;
      const activeToday = usersData.filter(u => {
        if (!u.last_active_at && !u.last_login) return false;
        const lastActive = new Date(u.last_active_at || u.last_login || '');
        return lastActive >= today;
      }).length;
      
      const mobileUsers = usersData.filter(u => u.device_type === 'mobile').length;
      const desktopUsers = usersData.filter(u => u.device_type === 'desktop').length;
      const totalSessionMinutes = usersData.reduce((acc, u) => acc + (u.total_session_time || 0), 0) / 60;
      const avgSessionTime = usersData.length > 0 
        ? Math.round(totalSessionMinutes / usersData.length) + 'min'
        : '0min';

      setStats({
        totalUsers: usersData.length,
        premiumUsers: premiumCount,
        freeUsers: freeCount,
        activeToday,
        newThisWeek,
        newThisMonth,
        avgSessionTime,
        conversionRate: usersData.length > 0 ? Math.round((premiumCount / usersData.length) * 100) : 0,
        totalIntentions: 0,
        totalRoutinesCompleted: 0,
        suspendedUsers: suspendedCount,
        totalSessionMinutes: Math.round(totalSessionMinutes),
        mobileUsers,
        desktopUsers
      });

      // Buscar contagens adicionais
      try {
        const intentionsResponse = await fetch(`${supabaseUrl}/rest/v1/intentions?select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (intentionsResponse.ok) {
          const intentions = await intentionsResponse.json();
          setStats(prev => ({ ...prev, totalIntentions: intentions.length }));
        }
      } catch (e) {
        console.log('Tabela intentions não encontrada');
      }

      try {
        const routinesResponse = await fetch(`${supabaseUrl}/rest/v1/routines?select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (routinesResponse.ok) {
          const routines = await routinesResponse.json();
          setStats(prev => ({ ...prev, totalRoutinesCompleted: routines.length }));
        }
      } catch (e) {
        console.log('Tabela routines não encontrada');
      }

      // Buscar posts da comunidade
      try {
        const postsResponse = await fetch(`${supabaseUrl}/rest/v1/posts?select=*&order=created_at.desc&limit=50`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            user_name: p.user_name || 'Anônimo',
            content: p.content,
            type: p.type || 'post',
            created_at: p.created_at,
            likes_count: p.likes_count || 0,
            is_flagged: p.is_flagged
          })));
        }
      } catch (e) {
        console.log('Tabela posts não encontrada');
      }

      // Buscar mensagens de suporte
      try {
        const supportResponse = await fetch(`${supabaseUrl}/rest/v1/support_messages?select=*&order=created_at.desc`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        if (supportResponse.ok) {
          const supportData = await supportResponse.json();
          setSupportMessages(supportData);
        }
      } catch (e) {
        console.log('Tabela support_messages não encontrada');
      }

    } catch (error) {
      console.error('[AdminPanel] Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ações de usuário
  const togglePremium = async (user: AdminUser) => {
    setActionLoading(true);
    try {
      const newType = user.subscription_type === 'premium' ? 'free' : 'premium';
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ subscription_type: newType })
      });
      
      await logAdminAction(newType === 'premium' ? 'grant_premium' : 'revoke_premium', user.id, { email: user.email });
      
      setUsers(users.map(u => u.id === user.id ? { ...u, subscription_type: newType } : u));
      setShowUserModal(false);
      alert(`Plano ${newType === 'premium' ? 'Premium concedido' : 'removido'} com sucesso!`);
    } catch (e) {
      console.error('Erro ao alterar plano:', e);
      alert('Erro ao alterar plano');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSuspend = async (user: AdminUser) => {
    setActionLoading(true);
    try {
      const newStatus = !user.is_suspended;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_suspended: newStatus })
      });
      
      await logAdminAction(newStatus ? 'suspend_user' : 'reactivate_user', user.id, { email: user.email });
      
      setUsers(users.map(u => u.id === user.id ? { ...u, is_suspended: newStatus } : u));
      setShowUserModal(false);
      alert(`Usuário ${newStatus ? 'suspenso' : 'reativado'} com sucesso!`);
    } catch (e) {
      console.error('Erro ao suspender/reativar:', e);
      alert('Erro ao suspender/reativar usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`)) return;
    
    setActionLoading(true);
    try {
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        }
      });
      
      await logAdminAction('delete_user', user.id, { email: user.email, name: user.name });
      
      setUsers(users.filter(u => u.id !== user.id));
      setShowUserModal(false);
      alert('Usuário excluído com sucesso!');
    } catch (e) {
      console.error('Erro ao excluir usuário:', e);
      alert('Erro ao excluir usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const resetUserPassword = async (user: AdminUser) => {
    if (!user.email) {
      alert('Usuário não possui email cadastrado');
      return;
    }
    
    setActionLoading(true);
    try {
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
      }
      
      await logAdminAction('reset_password', user.id, { email: user.email });
      
      alert(`Email de reset de senha enviado para ${user.email}`);
      setShowUserModal(false);
    } catch (e) {
      console.error('Erro ao enviar reset:', e);
      alert('Erro ao enviar email de reset');
    } finally {
      setActionLoading(false);
    }
  };

  const sendBroadcastNotification = async () => {
    if (!broadcastTitle || !broadcastMessage) return;
    
    setActionLoading(true);
    try {
      let targetUsers = users;
      if (broadcastTarget === 'premium') {
        targetUsers = users.filter(u => u.subscription_type === 'premium');
      } else if (broadcastTarget === 'free') {
        targetUsers = users.filter(u => u.subscription_type === 'free');
      }
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      const notifications = targetUsers.map(u => ({
        user_id: u.id,
        title: broadcastTitle,
        message: broadcastMessage,
        type: 'admin_broadcast',
        created_at: new Date().toISOString(),
        read: false
      }));
      
      try {
        await fetch(`${supabaseUrl}/rest/v1/notifications`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(notifications)
        });
      } catch (e) {
        console.log('Tabela notifications não encontrada');
      }
      
      await logAdminAction('broadcast_notification', null, { 
        title: broadcastTitle,
        target: broadcastTarget,
        recipients: targetUsers.length
      });
      
      alert(`Notificação enviada para ${targetUsers.length} usuários!`);
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (e) {
      console.error('Erro ao enviar broadcast:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const respondToSupport = async () => {
    if (!selectedSupportMessage || !supportResponse) return;
    
    setActionLoading(true);
    try {
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      const adminSession = localStorage.getItem('admin_session');
      const adminEmail = adminSession ? JSON.parse(adminSession).email : 'admin';
      
      await fetch(`${supabaseUrl}/rest/v1/support_messages?id=eq.${selectedSupportMessage.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          admin_response: supportResponse,
          responded_by: adminEmail,
          responded_at: new Date().toISOString(),
          status: 'resolved'
        })
      });
      
      setSupportMessages(supportMessages.map(m => 
        m.id === selectedSupportMessage.id 
          ? { ...m, admin_response: supportResponse, status: 'resolved' as const }
          : m
      ));
      
      setShowSupportModal(false);
      setSupportResponse('');
      setSelectedSupportMessage(null);
      alert('Resposta enviada com sucesso!');
    } catch (e) {
      console.error('Erro ao responder:', e);
      alert('Erro ao enviar resposta');
    } finally {
      setActionLoading(false);
    }
  };

  const logAdminAction = async (action: string, targetUserId: string | null, details: any) => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      const adminEmail = adminSession ? JSON.parse(adminSession).email : 'unknown';
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      await fetch(`${supabaseUrl}/rest/v1/admin_activity_logs`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          admin_email: adminEmail,
          action,
          target_user_id: targetUserId,
          details,
          created_at: new Date().toISOString()
        })
      });
    } catch (e) {
      console.log('Erro ao registrar log:', e);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
    
    try {
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_KEY;
      
      await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${postId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        }
      });
      
      await logAdminAction('delete_post', null, { post_id: postId });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) {
      console.error('Erro ao excluir post:', e);
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Plano', 'XP', 'Nível', 'Streak', 'Sessões', 'Tempo Total (min)', 'Dispositivo', 'Criado em', 'Último Acesso'].join(','),
      ...filteredUsers.map(u => [
        `"${u.name}"`,
        u.email,
        u.phone || '',
        u.subscription_type,
        u.xp_total || 0,
        u.level || 1,
        u.streak_days || 0,
        u.sessions_count || 0,
        Math.round((u.total_session_time || 0) / 60),
        u.device_type || 'unknown',
        new Date(u.created_at).toLocaleDateString('pt-BR'),
        u.last_active_at ? new Date(u.last_active_at).toLocaleDateString('pt-BR') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_espiritualizei_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Renderização do Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/10 flex items-center justify-center">
              <Users size={20} className="text-brand-violet" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total de Usuários</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.totalUsers}</p>
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> +{stats.newThisWeek} esta semana
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Crown size={20} className="text-amber-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Premium</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.premiumUsers}</p>
          <p className="text-xs text-amber-500 mt-1">{stats.conversionRate}% de conversão</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity size={20} className="text-emerald-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Ativos Hoje</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.activeToday}</p>
          <p className="text-xs text-slate-400 mt-1">usuários online</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock size={20} className="text-blue-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Tempo Médio</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.avgSessionTime}</p>
          <p className="text-xs text-blue-500 mt-1">por sessão</p>
        </div>
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Heart size={20} className="text-pink-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Intenções</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.totalIntentions}</p>
          <p className="text-xs text-pink-500 mt-1">pedidos de oração</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Target size={20} className="text-purple-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Rotinas</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.totalRoutinesCompleted}</p>
          <p className="text-xs text-purple-500 mt-1">rotinas criadas</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Smartphone size={20} className="text-cyan-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Mobile</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.mobileUsers}</p>
          <p className="text-xs text-cyan-500 mt-1">usuários mobile</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
              <Monitor size={20} className="text-slate-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Desktop</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.desktopUsers}</p>
          <p className="text-xs text-slate-400 mt-1">usuários desktop</p>
        </div>
      </div>

      {/* Gráficos e Top Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Planos */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-brand-violet" />
            Distribuição de Planos
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Premium</span>
                <span className="font-bold text-amber-500">{stats.premiumUsers} ({stats.conversionRate}%)</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.conversionRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Free</span>
                <span className="font-bold text-slate-500">{stats.freeUsers} ({100 - stats.conversionRate}%)</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${100 - stats.conversionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Ranking */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
            <Star size={20} className="text-amber-500" />
            Top 5 Ranking de XP
          </h3>
          <div className="space-y-3">
            {users
              .sort((a, b) => (b.xp_total || 0) - (a.xp_total || 0))
              .slice(0, 5)
              .map((user, index) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-dark dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500">Nível {user.level || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-violet">{user.xp_total || 0}</p>
                    <p className="text-xs text-slate-400">XP</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-3 p-4 bg-brand-violet/5 hover:bg-brand-violet/10 rounded-xl transition-colors"
          >
            <Megaphone size={20} className="text-brand-violet" />
            <span className="font-medium text-brand-dark dark:text-white">Enviar Notificação</span>
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center gap-3 p-4 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl transition-colors"
          >
            <Download size={20} className="text-emerald-500" />
            <span className="font-medium text-brand-dark dark:text-white">Exportar Usuários</span>
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-3 p-4 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl transition-colors"
          >
            <RefreshCw size={20} className="text-blue-500" />
            <span className="font-medium text-brand-dark dark:text-white">Atualizar Dados</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className="flex items-center gap-3 p-4 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl transition-colors relative"
          >
            <Headphones size={20} className="text-orange-500" />
            <span className="font-medium text-brand-dark dark:text-white">Suporte</span>
            {supportMessages.filter(m => m.status === 'pending').length > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {supportMessages.filter(m => m.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderização de Usuários
  const renderUsers = () => (
    <div className="space-y-6">
      {/* Barra de Busca e Filtros */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-violet"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
            >
              <option value="all">Todos ({users.length})</option>
              <option value="premium">Premium ({users.filter(u => u.subscription_type === 'premium').length})</option>
              <option value="free">Free ({users.filter(u => u.subscription_type === 'free').length})</option>
              <option value="suspended">Suspensos ({users.filter(u => u.is_suspended).length})</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
            >
              <option value="created_at">Data de Cadastro</option>
              <option value="name">Nome</option>
              <option value="xp_total">XP Total</option>
              <option value="last_login">Último Acesso</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Usuário</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Contato</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Plano</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Engajamento</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Cadastro</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Ações</th>
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
                        <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-brand-dark dark:text-white flex items-center gap-2">
                          {user.name}
                          {user.is_suspended && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-full">Suspenso</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Nível {user.level || 1} • {user.xp_total || 0} XP</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-brand-dark dark:text-white">{user.email || '-'}</p>
                    <p className="text-xs text-slate-500">{user.phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      user.subscription_type === 'premium'
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                    }`}>
                      {user.subscription_type === 'premium' && <Crown size={12} />}
                      {user.subscription_type === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="font-bold text-brand-violet">{user.streak_days || 0}</p>
                        <p className="text-xs text-slate-400">dias</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-emerald-500">{user.sessions_count || 0}</p>
                        <p className="text-xs text-slate-400">sessões</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-brand-dark dark:text-white">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Último: {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString('pt-BR') : '-'}
                    </p>
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
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );

  // Renderização de Conteúdo/Moderação
  const renderContent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-violet" />
          Postagens da Comunidade
        </h3>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500">Nenhuma postagem encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-brand-dark dark:text-white">{post.user_name}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        post.type === 'intention' ? 'bg-pink-100 text-pink-600' :
                        post.type === 'testimony' ? 'bg-green-100 text-green-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {post.type === 'intention' ? 'Intenção' : post.type === 'testimony' ? 'Testemunho' : 'Post'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Heart size={12} /> {post.likes_count} curtidas
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Renderização de Suporte
  const renderSupport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
          <Headphones size={20} className="text-brand-violet" />
          Mensagens de Suporte
          {supportMessages.filter(m => m.status === 'pending').length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {supportMessages.filter(m => m.status === 'pending').length} pendentes
            </span>
          )}
        </h3>
        
        {supportMessages.length === 0 ? (
          <div className="text-center py-12">
            <Headphones size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500">Nenhuma mensagem de suporte</p>
            <p className="text-xs text-slate-400 mt-1">As mensagens enviadas pelos usuários aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {supportMessages.map(msg => (
              <div key={msg.id} className={`p-4 rounded-xl border ${
                msg.status === 'pending' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' :
                msg.status === 'resolved' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' :
                'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-brand-dark dark:text-white">{msg.user_name || 'Usuário'}</span>
                      <span className="text-xs text-slate-400">{msg.user_email}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        msg.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        msg.status === 'resolved' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {msg.status === 'pending' ? 'Pendente' : msg.status === 'resolved' ? 'Resolvido' : 'Em andamento'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        msg.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                        msg.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {msg.priority === 'urgent' ? 'Urgente' : msg.priority === 'high' ? 'Alta' : 'Normal'}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className="font-medium text-brand-dark dark:text-white mb-1">{msg.subject}</p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300">{msg.message}</p>
                    {msg.admin_response && (
                      <div className="mt-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-400 mb-1">Resposta de {msg.responded_by}:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{msg.admin_response}</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(msg.created_at).toLocaleDateString('pt-BR')} às {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.status !== 'resolved' && (
                    <button
                      onClick={() => { setSelectedSupportMessage(msg); setShowSupportModal(true); }}
                      className="px-4 py-2 bg-brand-violet text-white text-sm font-medium rounded-lg hover:bg-brand-violet/90 transition-colors"
                    >
                      Responder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Renderização de Configurações
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Informações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Versão do App</p>
            <p className="font-bold text-brand-dark dark:text-white">2.5.0</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Ambiente</p>
            <p className="font-bold text-brand-dark dark:text-white">Produção</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Banco de Dados</p>
            <p className="font-bold text-brand-dark dark:text-white">Supabase</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Hospedagem</p>
            <p className="font-bold text-brand-dark dark:text-white">Vercel</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Links Úteis</h3>
        <div className="space-y-3">
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <FileText size={20} className="text-brand-violet" />
            <span className="font-medium text-brand-dark dark:text-white">Painel Supabase</span>
            <ArrowUpRight size={16} className="ml-auto text-slate-400" />
          </a>
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <FileText size={20} className="text-brand-violet" />
            <span className="font-medium text-brand-dark dark:text-white">Painel Vercel</span>
            <ArrowUpRight size={16} className="ml-auto text-slate-400" />
          </a>
          <a href="https://pay.cakto.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <FileText size={20} className="text-brand-violet" />
            <span className="font-medium text-brand-dark dark:text-white">Painel Cakto</span>
            <ArrowUpRight size={16} className="ml-auto text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/10 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Megaphone size={20} className="text-brand-violet" />
              </button>
              <button
                onClick={loadData}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw size={20} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onBackToApp}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Voltar ao app"
              >
                <Home size={20} className="text-slate-500" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={20} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <nav className="bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'content', label: 'Conteúdo', icon: MessageSquare },
              { id: 'support', label: 'Suporte', icon: Headphones, badge: supportMessages.filter(m => m.status === 'pending').length },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-violet text-brand-violet'
                    : 'border-transparent text-slate-500 hover:text-brand-dark dark:hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <BrandLogo size={48} variant="fill" className="text-brand-violet animate-pulse" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'content' && renderContent()}
            {activeTab === 'support' && renderSupport()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </main>

      {/* Modal de Ações do Usuário */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
          <div className="relative bg-white dark:bg-brand-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-4">
                {selectedUser.photo_url ? (
                  <img src={selectedUser.photo_url} alt={selectedUser.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">Nível {selectedUser.level || 1}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{selectedUser.xp_total || 0} XP</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-amber-500 flex items-center gap-1">
                      <Zap size={10} /> {selectedUser.streak_days || 0} dias
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => togglePremium(selectedUser)}
                disabled={actionLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {selectedUser.subscription_type === 'premium' ? (
                  <>
                    <UserMinus size={20} className="text-slate-500" />
                    <span className="text-brand-dark dark:text-white">Remover Premium</span>
                  </>
                ) : (
                  <>
                    <Crown size={20} className="text-amber-500" />
                    <span className="text-brand-dark dark:text-white">Conceder Premium</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleSuspend(selectedUser)}
                disabled={actionLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {selectedUser.is_suspended ? (
                  <>
                    <Unlock size={20} className="text-emerald-500" />
                    <span className="text-brand-dark dark:text-white">Reativar Usuário</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} className="text-orange-500" />
                    <span className="text-brand-dark dark:text-white">Suspender Usuário</span>
                  </>
                )}
              </button>

              <button
                onClick={() => resetUserPassword(selectedUser)}
                disabled={actionLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <Mail size={20} className="text-blue-500" />
                <span className="text-brand-dark dark:text-white">Enviar Reset de Senha</span>
              </button>

              <button
                onClick={() => deleteUser(selectedUser)}
                disabled={actionLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-red-500"
              >
                <Trash2 size={20} />
                <span>Excluir Usuário</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5">
              <button
                onClick={() => setShowUserModal(false)}
                className="w-full py-3 text-slate-500 font-medium hover:text-brand-dark dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Broadcast */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBroadcastModal(false)} />
          <div className="relative bg-white dark:bg-brand-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center">
                  <Megaphone size={24} className="text-brand-violet" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white">Enviar Notificação</h3>
                  <p className="text-sm text-slate-500">Envie uma mensagem para seus usuários</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Público-alvo</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
                >
                  <option value="all">Todos os usuários ({users.length})</option>
                  <option value="premium">Apenas Premium ({users.filter(u => u.subscription_type === 'premium').length})</option>
                  <option value="free">Apenas Free ({users.filter(u => u.subscription_type === 'free').length})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Título</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Ex: Novidade no Espiritualizei!"
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mensagem</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-violet resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 flex gap-3">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="flex-1 py-3 text-slate-500 font-medium hover:text-brand-dark dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={sendBroadcastNotification}
                disabled={actionLoading || !broadcastTitle || !broadcastMessage}
                className="flex-1 py-3 bg-brand-violet text-white font-bold rounded-xl hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resposta ao Suporte */}
      {showSupportModal && selectedSupportMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSupportModal(false)} />
          <div className="relative bg-white dark:bg-brand-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center">
                  <Headphones size={24} className="text-brand-violet" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white">Responder Suporte</h3>
                  <p className="text-sm text-slate-500">{selectedSupportMessage.user_email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Mensagem do usuário:</p>
                <p className="text-brand-dark dark:text-white">{selectedSupportMessage.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sua resposta</label>
                <textarea
                  value={supportResponse}
                  onChange={(e) => setSupportResponse(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-violet resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 flex gap-3">
              <button
                onClick={() => { setShowSupportModal(false); setSupportResponse(''); }}
                className="flex-1 py-3 text-slate-500 font-medium hover:text-brand-dark dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={respondToSupport}
                disabled={actionLoading || !supportResponse}
                className="flex-1 py-3 bg-brand-violet text-white font-bold rounded-xl hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                Enviar Resposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
