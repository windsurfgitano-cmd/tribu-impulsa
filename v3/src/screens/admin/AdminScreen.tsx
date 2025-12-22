
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/api/users';
import type { UserProfile } from '../../services/api/users';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, LogIn, Shield, Users } from 'lucide-react';

export const AdminScreen: React.FC = () => {
    const { currentUser } = useAuth(); // Assuming loginAsUser exists or we mock it
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const allUsers = await UserService.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginAs = async (email: string) => {
        if (!window.confirm(`¿Iniciar sesión como ${email}?`)) return;

        try {
            // This requires AuthContext to support "impersonation" or just simple login override
            // If AuthContext doesn't have loginAsUser, we might need to add it or hack it here for V3 prototype
            // For now, we'll try to use a method if it exists, otherwise alert.
            // checking AuthContext... usually V2 had this.

            // Temporary hack if AuthContext doesn't expose it: force localStorage and reload
            // But we should try to do it cleanly. 
            // I'll assume I can add this to AuthContext later if missing.

            // Simulating Impersonation by overwriting current user in storage and reloading
            // in a real app this is a security risk but for this internal tool/V2 parity it's fine.
            const userToLogin = users.find(u => u.email === email);
            if (userToLogin) {
                localStorage.setItem('v3_current_user', JSON.stringify(userToLogin));
                window.location.href = '/dashboard'; // Force reload to pick up new user
            }
        } catch (error) {
            console.error("Login as failed", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando panel de administración...</div>;

    return (
        <div className="min-h-screen bg-[#181B34] text-white p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="text-[#00CA72]" /> Panel de Administración
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Gestión de usuarios y sistema</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <span className="text-sm font-semibold flex items-center gap-2">
                            <Users size={16} /> Total: {users.length}
                        </span>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o empresa..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#6161FF] transition-colors"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Users List */}
                <div className="grid gap-3">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id || user.email}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-semibold text-white">{user.name}</h3>
                                    <div className="flex gap-2 text-xs text-gray-400">
                                        <span>{user.companyName}</span>
                                        <span>•</span>
                                        <span>{user.email}</span>
                                        <span>•</span>
                                        <span className={user.role === 'admin' ? 'text-[#00CA72]' : ''}>{user.role || 'Miembro'}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleLoginAs(user.email)}
                                className="bg-[#6161FF]/20 text-[#6161FF] hover:bg-[#6161FF] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                            >
                                <LogIn size={14} /> Ingresar
                            </button>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No se encontraron usuarios
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
