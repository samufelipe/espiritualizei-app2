import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, UserX, Shield, Search, Filter, 
  TrendingUp, Calendar, Clock, Mail, Phone, 
  ChevronDown, ChevronUp, MoreVertical, Check, X,
  Download, RefreshCw, LogOut, Home, Settings,
  BarChart3, UserCheck, UserMinus, Trash2, Edit,
  Eye, Lock, Unlock, Star, Activity, Zap
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
}

interface AdminPanelProps {
  onLogout: () => void;
  onBackToApp: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'free' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'xp_total'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    avgSessionTime: '0min',
    conversionRate: 0
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = [...users];
    
    // Filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) || 
        u.email?.toLowerCase().includes(query) ||
        u.phone?.includes(query)
      );
    }
    
    // Filtro de tipo
    if (filterType === 'premium') {
      filtered = filtered.filter(u => u.subscription_type === 'premium');
    } else if (filterType === 'free') {
      filtered = filtered.filter(u => u.subscription_type === 'free');
    } else if (filterType === 'suspended') {
      filtered = filtered.filter(u => u.is_suspended);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'xp_total') {
        comparison = (a.xp_total || 0) - (b.xp_total || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchQuery, filterType, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!getConnectionStatus()) {
        console.log('Sem conexão com Supabase');
        setLoading(false);
        return;
      }

      // Buscar todos os usuários
      const { data: profilesData, error } = await supabase!
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData: AdminUser[] = (profilesData || []).map(p => ({
        id: p.id,
        name: p.name || p.full_name || 'Sem nome',
        email: p.email || '',
        phone: p.phone || '',
        subscription_type: p.subscription_type || 'free',
        subscription_status: p.subscription_status,
        created_at: p.created_at,
        last_login: p.last_login,
        xp_total: p.xp_total || 0,
        level: p.level || 1,
        streak_days: p.streak_days || 0,
        is_suspended: p.is_suspended || false
      }));

      setUsers(usersData);

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

      setStats({
        totalUsers: usersData.length,
        premiumUsers: premiumCount,
        freeUsers: freeCount,
        activeToday,
        newThisWeek,
        newThisMonth,
        avgSessionTime: '12min',
        conversionRate: usersData.length > 0 ? Math.round((premiumCount / usersData.length) * 100) : 0
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
        subscription_status: newType === 'premium' ? 'active' : null
      }).eq('id', user.id);
      
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
        is_suspended: !user.is_suspended 
      }).eq('id', user.id);
      
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
      
      await loadData();
      setShowUserModal(false);
    } catch (e) {
      console.error('Erro ao excluir usuário:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Plano', 'XP', 'Nível', 'Criado em'].join(','),
      ...filteredUsers.map(u => [
        u.name,
        u.email,
        u.phone || '',
        u.subscription_type,
        u.xp_total || 0,
        u.level || 1,
        new Date(u.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_espiritualizei_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Renderização do Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
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

      {/* Gráfico de Distribuição */}
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
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/10">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Últimos Cadastros</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-dark dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {user.subscription_type === 'premium' && (
                  <Crown size={16} className="text-amber-500" />
                )}
              </div>
            ))}
          </div>
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
                      <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-brand-dark dark:text-white">{user.name}</p>
                        {user.is_suspended && (
                          <span className="text-xs text-red-500">Suspenso</span>
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
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
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
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Usuários', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
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
                <div className="w-14 h-14 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet font-bold text-xl">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
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
    </div>
  );
};

export default AdminPanel;
