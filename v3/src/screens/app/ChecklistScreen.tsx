import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { GlassCard } from '../../components/ui/GlassCard'; // GlassCard replaced by V2 card styles
import { CheckCircle, Share2, RefreshCw } from 'lucide-react';
import { TribeService } from '../../services/api/tribes';

export const ChecklistScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [tribe, setTribe] = useState<any[]>([]);
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.email) return;

            // 1. Obtener perfil real
            const { UserService } = await import('../../services/api/users');
            let userProfile = await UserService.getUserByEmail(currentUser.email);

            if (!userProfile) {
                userProfile = {
                    id: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || '',
                    category: 'General',
                    city: 'Santiago',
                    instagram: ''
                };
            }

            // 2. Obtener asignaciones 10+10
            const { tribe, discovery } = await TribeService.getAssignments(userProfile);
            setTribe([...tribe, ...discovery]);

            // 3. Obtener checklist guardado
            const savedChecklist = await TribeService.getChecklist(currentUser.uid);
            setChecklist(savedChecklist || {});

            setLoading(false);
        };
        loadData();
    }, [currentUser]);

    const toggleCheck = (memberId: string) => {
        if (!currentUser) return;
        const newChecklist = { ...checklist, [memberId]: !checklist[memberId] };
        setChecklist(newChecklist);
        TribeService.saveChecklist(currentUser.uid, newChecklist);
    };

    const completedCount = Object.values(checklist).filter(Boolean).length;
    const progress = tribe.length > 0 ? (completedCount / tribe.length) * 100 : 0;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="animate-spin text-[#6161FF]"><RefreshCw size={32} /></div>
            <p className="text-[#7C8193]">Cargando reporte...</p>
        </div>
    );

    return (
        <div className="p-5 pb-24 min-h-screen bg-[#F5F7FB]">
            <h1 className="text-2xl font-bold text-[#181B34] mb-2">📊 Reporte Mensual</h1>
            <p className="text-[#7C8193] mb-6">Marca las cuentas con las que ya interactuaste este mes.</p>

            {/* Progress Card */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-[#E4E7EF] shadow-sm text-center">
                <div className="text-4xl font-bold text-[#6161FF] mb-2">{Math.round(progress)}%</div>
                <div className="w-full bg-[#F5F7FB] rounded-full h-2 mb-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-[#7C8193]">{completedCount} de {tribe.length} completados</p>
            </div>

            <div className="space-y-3">
                {tribe.map(member => {
                    const isChecked = checklist[member.id];
                    return (
                        <div
                            key={member.id}
                            onClick={() => toggleCheck(member.id)}
                            className={`
                                flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                                ${isChecked
                                    ? 'bg-[#6161FF]/5 border-[#6161FF]/30'
                                    : 'bg-white border-[#E4E7EF] hover:border-[#6161FF]/30'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                    {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-[#7C8193] font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-bold transition-colors ${isChecked ? 'text-[#6161FF]' : 'text-[#181B34]'}`}>
                                        {member.name}
                                    </h3>
                                    <p className="text-xs text-[#7C8193]">{member.category}</p>
                                </div>
                            </div>

                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center border transition-all
                                ${isChecked ? 'bg-[#6161FF] border-[#6161FF]' : 'border-[#E4E7EF] bg-[#F5F7FB]'}
                            `}>
                                {isChecked && <CheckCircle size={14} className="text-white" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-8 py-4 bg-[#00CA72] hover:bg-[#00B365] rounded-xl font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2">
                <Share2 size={20} /> Enviar Reporte
            </button>
        </div>
    );
};
