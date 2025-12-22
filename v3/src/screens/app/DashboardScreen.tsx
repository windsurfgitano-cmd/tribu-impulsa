import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Home, RefreshCw } from 'lucide-react';
import { TribeMemberCard } from '../../components/features/TribeMemberCard';

export const DashboardScreen: React.FC = () => {
    const { currentUser, logout } = useAuth();

    return (
        <div className="p-5 pb-24 min-h-screen bg-[#F5F7FB]">
            {/* Header with Orange Gradient */}
            <header className="flex justify-between items-center -mx-5 -mt-5 px-5 pt-12 pb-8 bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg mb-8 rounded-b-[2rem]">
                <h1 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Home size={24} className="text-white" /> Tribu V3
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-white/90 hidden md:block">Hola, <strong>{currentUser?.email}</strong></span>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </header>

            {/* Main Content moved to TribeGrid for data access */}
            <main className="px-1">
                <TribeGrid />
            </main>
        </div>
    );
};

const TribeGrid: React.FC = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ total: 20, completed: 0, pending: 20 });
    const [assignments, setAssignments] = useState<{ tribe: any[], discovery: any[] }>({ tribe: [], discovery: [] });
    const [loading, setLoading] = useState(true);

    const loadTribe = async () => {
        if (!currentUser?.email) return;
        setLoading(true);
        try {
            const { TribeService } = await import('../../services/api/tribes');
            const { UserService } = await import('../../services/api/users');

            // 1. Obtener perfil
            let userProfile = await UserService.getUserByEmail(currentUser.email);
            if (!userProfile) {
                userProfile = {
                    id: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || 'Usuario',
                    category: 'Negocio',
                    city: 'Santiago',
                    instagram: '',
                    affinity: 'Negocios'
                };
            }

            // 2. Obtener asignaciones y checklist
            const result = await TribeService.getAssignments(userProfile);
            setAssignments(result);

            const checklist = await TribeService.getChecklist(currentUser.uid);

            // 3. Calcular estadísticas reales
            const totalMembers = result.tribe.length + result.discovery.length;
            const completedCount = Object.values(checklist).filter(Boolean).length;

            setStats({
                total: totalMembers || 20, // Fallback to 20 to avoid division by zero visual issues
                completed: completedCount,
                pending: (totalMembers || 20) - completedCount
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadTribe();
    }, [currentUser]);


    if (loading) return (
        <div className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="animate-spin text-blue-400"><RefreshCw size={32} /></div>
            <p className="text-gray-400">Generando tu Tribu 10+10...</p>
        </div>
    );

    if (assignments.tribe.length === 0) return (
        <div className="text-gray-500 text-center p-10 border border-gray-200 rounded-xl bg-white">
            <p>No pudimos generar un match exacto.</p>
            <button onClick={loadTribe} className="mt-4 text-blue-400 underline">Reintentar</button>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Stats Rendering inside TribeGrid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-[#181B34]">Tus Logros</h2>
                    <span className="text-xs text-[#7C8193]">Nivel {Math.min(5, Math.floor(stats.completed / 4) + 1)}</span>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl p-4 border border-[#E4E7EF] shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#7C8193]">Progreso mensual</span>
                        <span className="text-xs font-semibold text-[#6161FF]">{Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-[#E4E7EF] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-500"
                            style={{ width: `${(stats.completed / Math.max(stats.total, 1)) * 100}%` }}
                        />
                    </div>
                    <p className="text-[0.625rem] text-[#7C8193] mt-2">
                        {stats.pending > 0
                            ? `${stats.pending} acciones más para completar este mes`
                            : '¡Felicidades! Completaste todas las acciones'}
                    </p>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-4 gap-2 mb-8">
                    {/* Badge 1: Primera acción */}
                    <div className={`flex flex-col items-center p-2 rounded-xl border border-[#E4E7EF] ${stats.completed >= 1 ? 'bg-[#00CA72]/10' : 'bg-white'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${stats.completed >= 1 ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'}`}>
                            <span className="text-lg">{stats.completed >= 1 ? '🚀' : '🔒'}</span>
                        </div>
                        <span className={`text-[0.5625rem] text-center ${stats.completed >= 1 ? 'text-[#00CA72] font-semibold' : 'text-[#B3B8C6]'}`}>
                            Primera acción
                        </span>
                    </div>

                    {/* Badge 2: 5 shares */}
                    <div className={`flex flex-col items-center p-2 rounded-xl border border-[#E4E7EF] ${stats.completed >= 5 ? 'bg-[#6161FF]/10' : 'bg-white'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${stats.completed >= 5 ? 'bg-[#6161FF]' : 'bg-[#E4E7EF]'}`}>
                            <span className="text-lg">{stats.completed >= 5 ? '⭐' : '🔒'}</span>
                        </div>
                        <span className={`text-[0.5625rem] text-center ${stats.completed >= 5 ? 'text-[#6161FF] font-semibold' : 'text-[#B3B8C6]'}`}>
                            5 shares
                        </span>
                    </div>

                    {/* Badge 3: 10 shares */}
                    <div className={`flex flex-col items-center p-2 rounded-xl border border-[#E4E7EF] ${stats.completed >= 10 ? 'bg-[#E91E63]/10' : 'bg-white'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${stats.completed >= 10 ? 'bg-[#E91E63]' : 'bg-[#E4E7EF]'}`}>
                            <span className="text-lg">{stats.completed >= 10 ? '🔥' : '🔒'}</span>
                        </div>
                        <span className={`text-[0.5625rem] text-center ${stats.completed >= 10 ? 'text-[#E91E63] font-semibold' : 'text-[#B3B8C6]'}`}>
                            En llamas
                        </span>
                    </div>

                    {/* Badge 4: Tribu perfecta */}
                    <div className={`flex flex-col items-center p-2 rounded-xl border border-[#E4E7EF] ${stats.pending === 0 && stats.completed >= 20 ? 'bg-[#FFCC00]/10' : 'bg-white'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${stats.pending === 0 && stats.completed >= 20 ? 'bg-[#FFCC00]' : 'bg-[#E4E7EF]'}`}>
                            <span className="text-lg">{stats.pending === 0 && stats.completed >= 20 ? '👑' : '🔒'}</span>
                        </div>
                        <span className={`text-[0.5625rem] text-center ${stats.pending === 0 && stats.completed >= 20 ? 'text-[#FFCC00] font-semibold' : 'text-[#B3B8C6]'}`}>
                            Tribu perfecta
                        </span>
                    </div>
                </div>
            </div>

            {/* Sección 1: Mi Tribu (Compatibilidad Alta) */}
            <div>
                <h3 className="text-lg font-bold text-[#181B34] mb-3 flex items-center gap-2">
                    <span className="bg-[#6161FF] text-white text-xs px-2 py-1 rounded-full">10</span>
                    Tu Tribu Principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {assignments.tribe.map((member) => (
                        <TribeMemberCard
                            key={member.id}
                            name={member.name}
                            category={member.category}
                            instagram={member.instagram}
                            city={member.city}
                            imageUrl={member.photoURL}
                        />
                    ))}
                </div>
            </div>

            {/* Sección 2: Tribu X (Azure LLM Discovery) */}
            <div>
                <h3 className="text-lg font-bold text-[#181B34] mb-3 flex items-center gap-2">
                    <span className="bg-[#00CA72] text-white text-xs px-2 py-1 rounded-full">10</span>
                    Tribu X <span className="text-xs font-normal text-[#7C8193] ml-2">(Powered by Azure AI)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {assignments.discovery.map((member) => (
                        <TribeMemberCard
                            key={member.id}
                            name={member.name}
                            category={member.category}
                            instagram={member.instagram}
                            city={member.city}
                            imageUrl={member.photoURL}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
