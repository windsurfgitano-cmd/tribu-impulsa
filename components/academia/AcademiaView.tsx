import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Trophy, Flame, Clock, Target, Award, TrendingUp, Filter, Search, Grid, List } from 'lucide-react';
// Card con estilo Santander
const SantanderCard: React.FC<{children: React.ReactNode; className?: string}> = ({children, className = ''}) => (
  <div className={`bg-white rounded-xl shadow-lg border border-[#E4E7EF] ${className}`}>
    {children}
  </div>
);
import { AcademiaDashboard } from './AcademiaDashboard';
import { getCurrentUser } from '../../services/databaseService';

interface AcademiaViewProps {
  onNavigateBack: () => void;
}

export const AcademiaView: React.FC<AcademiaViewProps> = ({ onNavigateBack }) => {
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'capsulas' | 'progreso' | 'rutas'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [vistaModo, setVistaModo] = useState<'grid' | 'list'>('grid');

  const currentUser = getCurrentUser();
  const userId = currentUser?.id || 'default-user';

  const categorias = ['todas', 'Tecnología', 'Liderazgo', 'Estrategia', 'Finanzas'];

  const renderHeader = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateBack}
            className="p-2 hover:bg-[#ec0000]/10 rounded-lg transition-colors text-[#666]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#ec0000]">Santander Academia</h1>
            <p className="text-sm text-[#666]">
              Tu espacio para aprender, practicar y hacer crecer tu carrera con Santander
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVistaModo(vistaModo === 'grid' ? 'list' : 'grid')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {vistaModo === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="flex space-x-1 bg-[#ec0000]/10 p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Inicio', icon: Target },
          { id: 'capsulas', label: 'Cápsulas', icon: BookOpen },
          { id: 'progreso', label: 'Mi progreso', icon: TrendingUp },
          { id: 'rutas', label: 'Rutas sugeridas', icon: Award }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVistaActual(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              vistaActual === tab.id
                ? 'bg-[#ec0000]/20 text-[#ff4b4b]'
                : 'hover:bg-[#ec0000]/5 text-[#666]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Barra de búsqueda y filtros */}
      {(vistaActual === 'capsulas' || vistaActual === 'rutas') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Buscar cápsulas de la academia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E4E7EF] rounded-lg focus:outline-none focus:border-[#ec0000] text-[#181B34] placeholder-gray-400 shadow-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#666]" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E4E7EF] rounded-lg focus:outline-none focus:border-[#ec0000] text-[#181B34] text-sm shadow-sm"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat === 'todas' ? 'Todas las categorías' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderContenido = () => {
    switch (vistaActual) {
      case 'dashboard':
        return <AcademiaDashboard userId={userId} />;
      
      case 'capsulas':
        return <CapsulasView userId={userId} searchTerm={searchTerm} filtroCategoria={filtroCategoria} modo={vistaModo} />;
      
      case 'progreso':
        return <ProgresoView userId={userId} />;
      
      case 'rutas':
        return <RutasView userId={userId} searchTerm={searchTerm} modo={vistaModo} />;
      
      default:
        return <AcademiaDashboard userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFFFFF] via-[#FEF2F2] to-[#FEE2E2] text-[#181B34]">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-32 space-y-6">
        {renderHeader()}
        {renderContenido()}
      </div>
    </div>
  );
};

// Componentes auxiliares para las diferentes vistas
const CapsulasView: React.FC<{ userId: string; searchTerm: string; filtroCategoria: string; modo: 'grid' | 'list' }> = ({ 
  userId, searchTerm, filtroCategoria, modo 
}) => {
  return (
    <SantanderCard className="p-6">
      <h3 className="text-lg font-semibold mb-1">Catálogo de cápsulas</h3>
      <p className="text-sm text-[#666] mb-4">
        Explora las cápsulas disponibles de Santander Academia. Pronto podrás filtrar por
        temática, nivel y programa oficial.
      </p>
      <div className="text-center py-8 text-[#666]">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">La vista detallada de catálogo está en desarrollo.</p>
        <p className="text-xs mt-2 text-[#888]">Mientras tanto, revisa el resumen en la pestaña "Inicio".</p>
      </div>
    </SantanderCard>
  );
};

const ProgresoView: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <SantanderCard className="p-6">
      <h3 className="text-lg font-semibold mb-1">Mi progreso en Santander Academia</h3>
      <p className="text-sm text-[#666] mb-4">
        Aquí verás un resumen más profundo de tu avance: cápsulas por programa, rachas
        de estudio y logros destacados.
      </p>
      <div className="text-center py-8 text-[#666]">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">La vista detallada de progreso está en desarrollo.</p>
        <p className="text-xs mt-2 text-[#888]">Por ahora, revisa tu progreso general en la pestaña "Inicio".</p>
      </div>
    </SantanderCard>
  );
};

const RutasView: React.FC<{ userId: string; searchTerm: string; modo: 'grid' | 'list' }> = ({ 
  userId, searchTerm, modo 
}) => {
  return (
    <SantanderCard className="p-6">
      <h3 className="text-lg font-semibold mb-1">Rutas de aprendizaje sugeridas</h3>
      <p className="text-sm text-[#666] mb-4">
        Muy pronto verás rutas armadas por Santander: secuencias de cápsulas pensadas
        para distintos perfiles y objetivos.
      </p>
      <div className="text-center py-8 text-[#666]">
        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">La vista de rutas está en desarrollo.</p>
        <p className="text-xs mt-2 text-[#888]">Este espacio será clave para seguir caminos guiados según tu nivel y rol.</p>
      </div>
    </SantanderCard>
  );
};
