import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, Settings, LogOut, BarChart3, FileText, 
  Shield, AlertTriangle, RefreshCw, Download, Search, 
  ChevronDown, Eye, Edit2, Trash2, Ban, CheckCircle,
  Calendar, TrendingUp, UserCheck, Flag
} from 'lucide-react';

// Types
type AdminUser = {
  email: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'viewer';
};

type UserRecord = {
  id: string;
  email: string;
  name: string;
  company: string;
  instagram: string;
  category: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastActive: string;
  matchesCompleted: number;
  reportsReceived: number;
};

type Report = {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
};

// Storage keys
const ADMIN_SESSION_KEY = 'adminSession';
const ADMIN_USERS_KEY = 'adminUsersDB';

// Mock admin credentials (in production, this would be server-side)
const ADMIN_CREDENTIALS = {
  'admin@tribuimpulsa.cl': { password: 'admin123', role: 'superadmin' as const },
  'mod@tribuimpulsa.cl': { password: 'mod123', role: 'moderator' as const },
};

// Helper to check admin session
const getAdminSession = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setAdminSession = (user: AdminUser) => {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
};

const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

// Mock data generator
const generateMockUsers = (): UserRecord[] => {
  const names = ['María Pérez', 'Juan Silva', 'Camila Rojas', 'Diego Muñoz', 'Valentina Lagos', 'Sebastián Contreras', 'Francisca Díaz', 'Matías Soto', 'Javiera Núñez', 'Felipe Araya'];
  const companies = ['Joyas by María', 'Tech Solutions', 'Cosmética Natural', 'Café Artesanal', 'Moda Sustentable', 'Fitness Pro', 'Diseño Interior', 'Pastelería Dulce', 'Fotografía Pro', 'Marketing Digital'];
  const categories = ['Moda Mujer', 'Tecnología', 'Belleza', 'Gastronomía', 'Moda', 'Bienestar', 'Hogar', 'Alimentos', 'Arte', 'Servicios'];
  
  return names.map((name, i) => ({
    id: `user-${i + 1}`,
    email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
    name,
    company: companies[i],
    instagram: `@${companies[i].toLowerCase().replace(' ', '')}`,
    category: categories[i],
    status: i % 5 === 0 ? 'suspended' : i % 7 === 0 ? 'pending' : 'active' as const,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    matchesCompleted: Math.floor(Math.random() * 20),
    reportsReceived: Math.floor(Math.random() * 3),
  }));
};

const generateMockReports = (): Report[] => {
  return [
    { id: 'r1', reporterId: 'user-1', reporterName: 'María Pérez', targetId: 'user-3', targetName: 'Camila Rojas', reason: 'No compartió mi publicación', status: 'pending', createdAt: new Date().toISOString() },
    { id: 'r2', reporterId: 'user-5', reporterName: 'Valentina Lagos', targetId: 'user-2', targetName: 'Juan Silva', reason: 'Perfil falso', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'r3', reporterId: 'user-7', reporterName: 'Francisca Díaz', targetId: 'user-4', targetName: 'Diego Muñoz', reason: 'Incumplimiento reiterado', status: 'resolved', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];
};

// Admin Login Component
const AdminLogin = ({ onLogin }: { onLogin: (user: AdminUser) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cred = ADMIN_CREDENTIALS[email as keyof typeof ADMIN_CREDENTIALS];
    if (cred && cred.password === password) {
      const user: AdminUser = { email, role: cred.role };
      setAdminSession(user);
      onLogin(user);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-700">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Panel</h1>
        <p className="text-slate-400 text-center mb-6 text-sm">Tribu Impulsa - Acceso Administrativo</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="admin@tribuimpulsa.cl"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Ingresar
          </button>
        </form>
        
        <p className="text-slate-500 text-xs text-center mt-6">
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, user, onLogout }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  user: AdminUser;
  onLogout: () => void;
}) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'reports', label: 'Reportes', icon: Flag },
    { id: 'matches', label: 'Matches', icon: RefreshCw },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-800 min-h-screen p-4 flex flex-col border-r border-slate-700">
      <div className="flex items-center gap-3 mb-8 p-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Shield className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">Tribu Admin</h2>
          <p className="text-slate-400 text-xs capitalize">{user.role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-700 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{user.email[0].toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ users, reports }: { users: UserRecord[]; reports: Report[] }) => {
  const stats = [
    { label: 'Usuarios Totales', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Usuarios Activos', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'from-green-500 to-emerald-500' },
    { label: 'Reportes Pendientes', value: reports.filter(r => r.status === 'pending').length, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
    { label: 'Matches del Mes', value: users.reduce((acc, u) => acc + u.matchesCompleted, 0), icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <button className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors text-sm">
          <Download size={16} />
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="text-white" size={20} />
              </div>
            </div>
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Últimos Usuarios</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">{user.name}</p>
                    <p className="text-slate-400 text-xs">{user.company}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Reportes Recientes</h3>
          <div className="space-y-3">
            {reports.slice(0, 5).map(report => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">{report.reporterName} → {report.targetName}</p>
                  <p className="text-slate-400 text-xs truncate max-w-[200px]">{report.reason}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab
const UsersTab = ({ users, userRole }: { users: UserRecord[]; userRole: string }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canEdit = ['superadmin', 'admin'].includes(userRole);
  const canDelete = userRole === 'superadmin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <button className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors text-sm">
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="pending">Pendientes</option>
        </select>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left text-slate-300 text-sm font-medium px-4 py-3">Usuario</th>
              <th className="text-left text-slate-300 text-sm font-medium px-4 py-3">Empresa</th>
              <th className="text-left text-slate-300 text-sm font-medium px-4 py-3">Categoría</th>
              <th className="text-left text-slate-300 text-sm font-medium px-4 py-3">Estado</th>
              <th className="text-left text-slate-300 text-sm font-medium px-4 py-3">Matches</th>
              <th className="text-right text-slate-300 text-sm font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-700/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">{user.name}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{user.company}</p>
                  <p className="text-slate-400 text-xs">{user.instagram}</p>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{user.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{user.matchesCompleted}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded" title="Ver">
                      <Eye size={16} />
                    </button>
                    {canEdit && (
                      <>
                        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded" title="Suspender">
                          <Ban size={16} />
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reports Tab
const ReportsTab = ({ reports }: { reports: Report[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reportes "Acusete"</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
            {reports.filter(r => r.status === 'pending').length} pendientes
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Flag className="text-red-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">{report.reporterName} reportó a {report.targetName}</p>
                  <p className="text-slate-400 text-sm">{new Date(report.createdAt).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {report.status}
              </span>
            </div>
            
            <p className="text-slate-300 mb-4 p-3 bg-slate-700/50 rounded-lg">"{report.reason}"</p>
            
            {report.status === 'pending' && (
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition-colors">
                  <CheckCircle size={16} />
                  Resolver
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                  <Ban size={16} />
                  Sancionar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-slate-500/20 text-slate-400 py-2 rounded-lg hover:bg-slate-500/30 transition-colors">
                  <Trash2 size={16} />
                  Descartar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Matches Tab
const MatchesTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gestión de Matches</h1>
        <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
          <RefreshCw size={16} />
          Regenerar Tómbola
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Configuración del Algoritmo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Matches por usuario</label>
            <input
              type="number"
              defaultValue={10}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Día de corte mensual</label>
            <input
              type="number"
              defaultValue={1}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Próxima Tómbola</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            <span className="text-white">1 de Diciembre, 2025</span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">117 usuarios elegibles</span>
        </div>
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configuración del Sistema</h1>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre de la plataforma</label>
            <input
              type="text"
              defaultValue="Tribu Impulsa"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">WhatsApp de soporte</label>
            <input
              type="text"
              defaultValue="+56912345678"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Suscripciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Precio mensual (CLP)</label>
            <input
              type="number"
              defaultValue={20000}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Descuento anual (%)</label>
            <input
              type="number"
              defaultValue={25}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Días de prueba</label>
            <input
              type="number"
              defaultValue={30}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
            />
          </div>
        </div>
      </div>

      <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold">
        Guardar Cambios
      </button>
    </div>
  );
};

// Main Admin Panel Component
export const AdminPanel = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setUser(session);
    }
    // Load mock data
    setUsers(generateMockUsers());
    setReports(generateMockReports());
  }, []);

  const handleLogin = (u: AdminUser) => {
    setUser(u);
  };

  const handleLogout = () => {
    clearAdminSession();
    setUser(null);
  };

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && <OverviewTab users={users} reports={reports} />}
        {activeTab === 'users' && <UsersTab users={users} userRole={user.role} />}
        {activeTab === 'reports' && <ReportsTab reports={reports} />}
        {activeTab === 'matches' && <MatchesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

export default AdminPanel;
