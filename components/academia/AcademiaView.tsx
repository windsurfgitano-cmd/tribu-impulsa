import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trophy, Flame, Clock, Target, Award, TrendingUp, Filter, Search, Grid, List, ExternalLink } from 'lucide-react';
// Card con estilo Santander
const SantanderCard: React.FC<{children: React.ReactNode; className?: string}> = ({children, className = ''}) => (
  <div className={`bg-white rounded-xl shadow-lg border border-[#E4E7EF] ${className}`}>
    {children}
  </div>
);
import { AcademiaDashboard } from './AcademiaDashboard';
import { getCurrentUser } from '../../services/databaseService';
import { getAllCourses, searchCourses, SantanderCourse } from '../../services/santanderCoursesService';
import { ExitAppModal } from '../common/ExitAppModal';

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
      {/* Header - responsive */}
      <div className="flex items-start gap-3">
        <button
          onClick={onNavigateBack}
          className="p-2 hover:bg-[#ec0000]/10 rounded-lg transition-colors text-[#666] flex-shrink-0 mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#ec0000]">Santander Academia</h1>
          <p className="text-xs sm:text-sm text-[#666] line-clamp-2">
            Tu espacio para aprender y crecer con Santander
          </p>
        </div>
      </div>

      {/* Navegación de pestañas - scrollable en móvil */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 bg-[#ec0000]/10 p-1 rounded-xl min-w-max">
          {[
            { id: 'dashboard', label: 'Inicio', icon: Target },
            { id: 'capsulas', label: 'Cápsulas', icon: BookOpen },
            { id: 'progreso', label: 'Progreso', icon: TrendingUp },
            { id: 'rutas', label: 'Rutas', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVistaActual(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                vistaActual === tab.id
                  ? 'bg-white text-[#ec0000] shadow-sm'
                  : 'hover:bg-white/50 text-[#666]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      {vistaActual === 'capsulas' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Buscar cursos de la academia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E4E7EF] rounded-lg focus:outline-none focus:border-[#ec0000] text-[#181B34] placeholder-gray-400 shadow-sm"
            />
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFFFFF] via-[#FEF2F2] to-[#FEE2E2] text-[#181B34] overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 pb-32 space-y-4 sm:space-y-6">
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
  const [courses, setCourses] = useState<SantanderCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SantanderCourse | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setCourses(getAllCourses());
    } else {
      setCourses(searchCourses(searchTerm));
    }
  }, [searchTerm]);

  const handleCourseClick = (course: SantanderCourse) => {
    setSelectedCourse(course);
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    if (selectedCourse) {
      window.open(selectedCourse.url, '_blank');
      setShowExitModal(false);
      setSelectedCourse(null);
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setSelectedCourse(null);
  };

  // Imágenes stock para cursos
  const stockImages = [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=600&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
  ];

  const getImageForCourse = (courseId: string) => {
    const index = courseId.length % stockImages.length;
    return stockImages[index];
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#181B34] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#ec0000]" />
            Catálogo de Cursos
          </h3>
          <span className="text-sm text-[#666] bg-gray-100 px-3 py-1 rounded-full">
            {courses.length} cursos
          </span>
        </div>

        {courses.length === 0 ? (
          <SantanderCard className="p-6">
            <div className="text-center py-8 text-[#666]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No se encontraron cursos con ese criterio de búsqueda.</p>
            </div>
          </SantanderCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={getImageForCourse(course.id)} 
                    alt={course.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-[#ec0000] text-white">
                      Gratis
                    </span>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-4">
                  <h4 className="font-bold text-[#181B34] mb-2 line-clamp-2 group-hover:text-[#ec0000] transition-colors min-h-[3rem]">
                    {course.nombre}
                  </h4>
                  
                  {/* Botón de acción */}
                  <button 
                    onClick={() => handleCourseClick(course)}
                    className="w-full bg-gradient-to-r from-[#ec0000] to-[#cc0000] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <ExitAppModal
        isOpen={showExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        courseName={selectedCourse?.nombre}
        destinationName="Santander Open Academy"
      />
    </>
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
