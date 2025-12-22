
import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { BookOpen, Video, FileText, Lock, Target, TrendingUp, Award, Search, Filter } from 'lucide-react';

export const AcademiaScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'capsulas' | 'progreso' | 'rutas'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'dashboard', label: 'Inicio', icon: Target },
        { id: 'capsulas', label: 'Cápsulas', icon: BookOpen },
        { id: 'progreso', label: 'Progreso', icon: TrendingUp },
        { id: 'rutas', label: 'Rutas', icon: Award }
    ] as const;

    const renderHeader = () => (
        <div className="space-y-4 mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-[#ec0000]">
                <BookOpen className="text-[#ec0000]" /> Santander Academia
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-[#ec0000] text-white shadow-lg shadow-red-500/30'
                                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-[#ec0000] border border-gray-100'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Bar (Only for specific tabs) */}
            {(activeTab === 'capsulas' || activeTab === 'rutas') && (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar contenido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ec0000]"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#ec0000] hover:border-[#ec0000] transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            )}
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-4">
            {/* Featured Course */}
            <GlassCard className="relative overflow-hidden group cursor-pointer hover:shadow-md transition bg-white border border-gray-100">
                <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl z-20">
                    NUEVO
                </div>
                <div className="flex items-start gap-4 p-2">
                    <div className="p-3 bg-red-50 rounded-xl text-[#ec0000]">
                        <Video size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Cómo impulsar tu Instagram</h3>
                        <p className="text-gray-600 text-sm mt-1">Domina el algoritmo en 2026 con estas estrategias probadas.</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#ec0000]">
                            <span>▶ 4 Lecciones</span>
                            <span>• 25 min</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <h2 className="text-lg font-bold text-gray-900 mt-4">Recursos Descargables</h2>

            <GlassCard className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                    <FileText className="text-[#ec0000]" size={20} />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900">Calendario de Contenidos</h4>
                        <p className="text-[10px] text-gray-500">PDF • 2.5 MB</p>
                    </div>
                </div>
                <div className="text-[#ec0000] font-bold text-xs uppercase tracking-wider">Descargar</div>
            </GlassCard>

            <GlassCard className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                    <FileText className="text-[#ec0000]" size={20} />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900">Plantilla de Costos</h4>
                        <p className="text-[10px] text-gray-500">Excel • 1.2 MB</p>
                    </div>
                </div>
                <div className="text-[#ec0000] font-bold text-xs uppercase tracking-wider">Descargar</div>
            </GlassCard>

            <h2 className="text-lg font-bold text-gray-900 mt-4">Próximamente</h2>

            <GlassCard className="opacity-70 grayscale bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg text-gray-500">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Masterclass Ventas B2B</h4>
                        <p className="text-xs text-gray-500">Disponible en Febrero</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );

    const renderCapsulas = () => (
        <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>Catálogo completo disponible pronto.</p>
        </div>
    );

    const renderProgreso = () => (
        <div className="text-center py-20 text-gray-400">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p>Tu seguimiento de aprendizaje aparecerá aquí.</p>
        </div>
    );

    const renderRutas = () => (
        <div className="text-center py-20 text-gray-400">
            <Award size={48} className="mx-auto mb-4 opacity-50" />
            <p>Rutas de aprendizaje personalizadas en desarrollo.</p>
        </div>
    );

    return (
        <div className="p-4 pb-24 min-h-screen">
            {renderHeader()}

            <div className="animate-fade-in">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'capsulas' && renderCapsulas()}
                {activeTab === 'progreso' && renderProgreso()}
                {activeTab === 'rutas' && renderRutas()}
            </div>
        </div>
    );
};
