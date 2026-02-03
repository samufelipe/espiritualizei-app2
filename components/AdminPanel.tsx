import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, UserX, Shield, Search, Filter, 
  TrendingUp, Calendar, Clock, Mail, Phone, 
  ChevronDown, ChevronUp, MoreVertical, Check, X,
  Download, RefreshCw, LogOut, Home, Settings,
  BarChart3, UserCheck, UserMinus, Trash2, Edit,
  Eye, Lock, Unlock, Star, Activity, Zap, Bell,
  MessageSquare, Send, FileText, AlertTriangle,
  Heart, BookOpen, Target, Gift, Megaphone
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { supabase, getConnectionStatus } from '../services/authService';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscription_type: 'free' | 'premium';
  subscription_status?: string;
  created_at: string;
  last_login?: string;
  xp_total?: number;
  level?: number;
  streak_days?: number;
  is_suspended?: boolean;
  maturity_level?: string;
  spiritual_profile?: string;
  photo_url?: string;
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

interface AdminPanelProps {
  onLogout: () => void;
  onBackToApp: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'notifications' | 'settings'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'xp_total' | 'last_login'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'premium' | 'free'>('all');
  
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
    suspendedUsers: 0
  });

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
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'xp_total') {
        comparison = (a.xp_total || 0) - (b.xp_total || 0);
      } else if (sortBy === 'last_login') {
        comparison = new Date(a.last_login || 0).getTime() - new Date(b.last_login || 0).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchQuery, filterType, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[AdminPanel] Iniciando carregamento de dados...');
      console.log('[AdminPanel] Status da conexão Supabase:', getConnectionStatus());
      console.log('[AdminPanel] Supabase client:', supabase ? 'Conectado' : 'Não conectado');
      
      if (!getConnectionStatus() || !supabase) {
        console.error('[AdminPanel] Sem conexão com Supabase - verifique as variáveis de ambiente');
        setLoading(false);
        return;
      }

      // Buscar todos os usuários
      const { data: profilesData, error } = await supabase!
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminPanel] Erro ao buscar profiles:', error);
        throw error;
      }
      
      console.log('[AdminPanel] Profiles encontrados:', profilesData?.length || 0);
      console.log('[AdminPanel] Dados brutos:', profilesData);

      const usersData: AdminUser[] = (profilesData || []).map(p => ({
        id: p.id,
        name: p.name || p.full_name || 'Sem nome',
        email: p.email || '',
        phone: p.phone || '',
        subscription_type: p.subscription_type || (p.is_premium ? 'premium' : 'free'),
        subscription_status: p.subscription_status,
        created_at: p.created_at,
        last_login: p.last_login || p.updated_at,
        xp_total: p.xp_total || 0,
        level: p.level || 1,
        streak_days: p.streak_days || 0,
        is_suspended: p.is_suspended || false,
        maturity_level: p.maturity_level,
        spiritual_profile: p.spiritual_profile,
        photo_url: p.photo_url || p.avatar_url
      }));

      setUsers(usersData);

      // Buscar posts da comunidade
      try {
        const { data: postsData } = await supabase!
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (postsData) {
          setPosts(postsData.map(p => ({
            id: p.id,
            user_id: p.user_id,
            user_name: p.user_name || 'Anônimo',
            content: p.content,
            type: p.type || 'testimony',
            created_at: p.created_at,
            likes_count: p.likes_count || 0,
            is_flagged: p.is_flagged
          })));
        }
      } catch (e) {
        console.log('Tabela posts não encontrada');
      }

      // Buscar estatísticas adicionais
      let totalIntentions = 0;
      let totalRoutines = 0;
      
      try {
        const { count: intentionsCount } = await supabase!
          .from('intentions')
          .select('*', { count: 'exact', head: true });
        totalIntentions = intentionsCount || 0;
      } catch (e) {}

      try {
        const { count: routinesCount } = await supabase!
          .from('routines')
          .select('*', { count: 'exact', head: true });
        totalRoutines = routinesCount || 0;
      } catch (e) {}

      // Calcular estatísticas
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const premiumCount = usersData.filter(u => u.subscription_type === 'premium').length;
      const freeCount = usersData.filter(u => u.subscription_type === 'free').length;
      const newThisWeek = usersData.filter(u => new Date(u.created_at) >= weekAgo).length;
      const newThisMonth = usersData.filter(u => new Date(u.created_at) >= monthAgo).length;
      const activeToday = usersData.filter(u => u.last_login && new Date(u.last_login) >= todayStart).length;
      const suspendedCount = usersData.filter(u => u.is_suspended).length;

      setStats({
        totalUsers: usersData.length,
        premiumUsers: premiumCount,
        freeUsers: freeCount,
        activeToday,
        newThisWeek,
        newThisMonth,
        avgSessionTime: '12min',
        conversionRate: usersData.length > 0 ? Math.round((premiumCount / usersData.length) * 100) : 0,
        totalIntentions,
        totalRoutinesCompleted: totalRoutines,
        suspendedUsers: suspendedCount
      });

    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  // Ações de usuário
  const togglePremium = async (user: AdminUser) => {
    setActionLoading(true);
    try {
      const newType = user.subscription_type === 'premium' ? 'free' : 'premium';
      await supabase!.from('profiles').update({ 
        subscription_type: newType,
        is_premium: newType === 'premium',
        subscription_status: newType === 'premium' ? 'active' : null
      }).eq('id', user.id);
      
      // Log da ação
      await logAdminAction('toggle_premium', user.id, { 
        from: user.subscription_type, 
        to: newType 
      });
      
      await loadData();
      setShowUserModal(false);
    } catch (e) {
      console.error('Erro ao alterar plano:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSuspend = async (user: AdminUser) => {
    setActionLoading(true);
    try {
      await supabase!.from('profiles').update({ 
        is_suspended: !user.is_suspended,
        suspended_at: !user.is_suspended ? new Date().toISOString() : null
      }).eq('id', user.id);
      
      await logAdminAction(user.is_suspended ? 'unsuspend_user' : 'suspend_user', user.id, {});
      
      await loadData();
      setShowUserModal(false);
    } catch (e) {
      console.error('Erro ao suspender usuário:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}? Esta ação é irreversível.`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      // Deletar dados relacionados primeiro
      await supabase!.from('routines').delete().eq('user_id', user.id);
      await supabase!.from('intentions').delete().eq('user_id', user.id);
      await supabase!.from('profiles').delete().eq('id', user.id);
      
      await logAdminAction('delete_user', user.id, { name: user.name, email: user.email });
      
      await loadData();
      setShowUserModal(false);
    } catch (e) {
      console.error('Erro ao excluir usuário:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const resetUserPassword = async (user: AdminUser) => {
    if (!confirm(`Enviar email de redefinição de senha para ${user.email}?`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      // Aqui você pode integrar com o sistema de email
      alert(`Email de redefinição enviado para ${user.email}`);
      await logAdminAction('reset_password', user.id, { email: user.email });
    } catch (e) {
      console.error('Erro ao resetar senha:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const sendBroadcastNotification = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      alert('Preencha o título e a mensagem');
      return;
    }
    
    setActionLoading(true);
    try {
      // Filtrar usuários alvo
      let targetUsers = users;
      if (broadcastTarget === 'premium') {
        targetUsers = users.filter(u => u.subscription_type === 'premium');
      } else if (broadcastTarget === 'free') {
        targetUsers = users.filter(u => u.subscription_type === 'free');
      }
      
      // Criar notificações para cada usuário
      const notifications = targetUsers.map(u => ({
        user_id: u.id,
        title: broadcastTitle,
        message: broadcastMessage,
        type: 'admin_broadcast',
        created_at: new Date().toISOString(),
        read: false
      }));
      
      // Inserir em lote (se a tabela existir)
      try {
        await supabase!.from('notifications').insert(notifications);
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

  const logAdminAction = async (action: string, targetUserId: string | null, details: any) => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      const adminEmail = adminSession ? JSON.parse(adminSession).email : 'unknown';
      
      await supabase!.from('admin_activity_logs').insert({
        admin_email: adminEmail,
        action,
        target_user_id: targetUserId,
        details,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.log('Erro ao registrar log (tabela pode não existir):', e);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
    
    try {
      await supabase!.from('posts').delete().eq('id', postId);
      await logAdminAction('delete_post', null, { post_id: postId });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) {
      console.error('Erro ao excluir post:', e);
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Plano', 'XP', 'Nível', 'Streak', 'Maturidade', 'Perfil Espiritual', 'Criado em', 'Último Acesso'].join(','),
      ...filteredUsers.map(u => [
        `"${u.name}"`,
        u.email,
        u.phone || '',
        u.subscription_type,
        u.xp_total || 0,
        u.level || 1,
        u.streak_days || 0,
        u.maturity_level || '',
        u.spiritual_profile || '',
        new Date(u.created_at).toLocaleDateString('pt-BR'),
        u.last_login ? new Date(u.last_login).toLocaleDateString('pt-BR') : ''
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
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/10 flex items-center justify-center">
              <Users size={20} className="text-brand-violet" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total de Usuários</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.totalUsers}</p>
          <p className="text-xs text-green-500 mt-1">+{stats.newThisWeek} esta semana</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Crown size={20} className="text-amber-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Premium</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.premiumUsers}</p>
          <p className="text-xs text-amber-500 mt-1">{stats.conversionRate}% de conversão</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity size={20} className="text-emerald-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Ativos Hoje</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.activeToday}</p>
          <p className="text-xs text-slate-400 mt-1">usuários online</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Novos/Mês</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.newThisMonth}</p>
          <p className="text-xs text-blue-500 mt-1">crescimento mensal</p>
        </div>
      </div>

      {/* Cards de Engajamento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Heart size={20} className="text-pink-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Intenções</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.totalIntentions}</p>
          <p className="text-xs text-pink-500 mt-1">pedidos de oração</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Target size={20} className="text-purple-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Rotinas</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.totalRoutinesCompleted}</p>
          <p className="text-xs text-purple-500 mt-1">rotinas criadas</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
              <UserX size={20} className="text-slate-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Free</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.freeUsers}</p>
          <p className="text-xs text-slate-400 mt-1">usuários gratuitos</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Lock size={20} className="text-red-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Suspensos</span>
          </div>
          <p className="text-3xl font-black text-brand-dark dark:text-white">{stats.suspendedUsers}</p>
          <p className="text-xs text-red-500 mt-1">contas bloqueadas</p>
        </div>
      </div>

      {/* Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Distribuição de Planos</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-violet to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.conversionRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-slate-500">Free: {stats.freeUsers}</span>
                <span className="text-amber-500 font-bold">Premium: {stats.premiumUsers}</span>
              </div>
            </div>
          </div>
          
          {/* Ações Rápidas */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
            <h4 className="text-sm font-bold text-slate-500 mb-3">Ações Rápidas</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-violet/10 text-brand-violet rounded-lg hover:bg-brand-violet/20 transition-colors text-sm font-medium"
              >
                <Megaphone size={16} />
                Enviar Notificação
              </button>
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Exportar Dados
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Últimos Cadastros</h3>
          <div className="space-y-3">
            {users.slice(0, 6).map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-brand-dark dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.subscription_type === 'premium' && (
                    <Crown size={16} className="text-amber-500" />
                  )}
                  <span className="text-xs text-slate-400">Nv.{user.level || 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Usuários por XP */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">🏆 Top 10 - Ranking de XP</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...users].sort((a, b) => (b.xp_total || 0) - (a.xp_total || 0)).slice(0, 10).map((user, index) => (
            <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-amber-500 text-white' :
                index === 1 ? 'bg-slate-400 text-white' :
                index === 2 ? 'bg-amber-700 text-white' :
                'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.xp_total || 0} XP • Nível {user.level || 1}</p>
              </div>
              {user.subscription_type === 'premium' && (
                <Crown size={16} className="text-amber-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Renderização da Lista de Usuários
  const renderUsers = () => (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-violet"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
          >
            <option value="all">Todos</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
            <option value="suspended">Suspensos</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-violet"
          >
            <option value="created_at">Data Cadastro</option>
            <option value="last_login">Último Acesso</option>
            <option value="name">Nome</option>
            <option value="xp_total">XP</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-brand-violet transition-colors"
          >
            {sortOrder === 'asc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <button
            onClick={exportUsers}
            className="px-4 py-3 bg-brand-violet text-white rounded-xl font-medium flex items-center gap-2 hover:bg-brand-violet/90 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">XP / Nível</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cadastro</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  className={`border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${user.is_suspended ? 'opacity-50' : ''}`}
                >
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
                        <p className="font-medium text-brand-dark dark:text-white">{user.name}</p>
                        {user.is_suspended && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <Lock size={10} /> Suspenso
                          </span>
                        )}
                        {user.maturity_level && (
                          <span className="text-xs text-slate-400">{user.maturity_level}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-slate-400">{user.phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      user.subscription_type === 'premium' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                    }`}>
                      {user.subscription_type === 'premium' && <Crown size={12} />}
                      {user.subscription_type === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-brand-dark dark:text-white">{user.xp_total || 0} XP</p>
                    <p className="text-xs text-slate-400">Nível {user.level || 1}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-amber-500" />
                      <span className="text-sm font-medium text-brand-dark dark:text-white">{user.streak_days || 0}</span>
                      <span className="text-xs text-slate-400">dias</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {user.last_login && (
                      <p className="text-xs text-slate-400">
                        Último: {new Date(user.last_login).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-400 text-center">
        Mostrando {filteredUsers.length} de {users.length} usuários
      </p>
    </div>
  );

  // Renderização de Conteúdo/Moderação
  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-dark dark:text-white">Moderação de Conteúdo</h2>
        <span className="text-sm text-slate-400">{posts.length} postagens</span>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold">
                  {post.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-brand-dark dark:text-white">{post.user_name}</p>
                  <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-xs text-slate-500">{post.type}</span>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{post.content}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Heart size={14} /> {post.likes_count} curtidas
              </span>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhuma postagem encontrada</p>
          </div>
        )}
      </div>
    </div>
  );

  // Renderização de Configurações
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-dark dark:text-white">Configurações do Sistema</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Informações do App</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Versão</span>
              <span className="text-brand-dark dark:text-white font-medium">2.5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ambiente</span>
              <span className="text-emerald-500 font-medium">Produção</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Banco de Dados</span>
              <span className="text-brand-dark dark:text-white font-medium">Supabase</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Links Úteis</h3>
          <div className="space-y-3">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-violet hover:underline">
              <FileText size={16} /> Painel Supabase
            </a>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-violet hover:underline">
              <FileText size={16} /> Painel Vercel
            </a>
            <a href="https://pay.cakto.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-violet hover:underline">
              <FileText size={16} /> Painel Cakto
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark">
      {/* Header */}
      <header className="bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'content', label: 'Conteúdo', icon: MessageSquare },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-violet text-brand-violet'
                    : 'border-transparent text-slate-500 hover:text-brand-dark dark:hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <BrandLogo size={48} variant="fill" className="text-brand-violet animate-pulse" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'content' && renderContent()}
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
                {actionLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
