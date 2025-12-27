import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, ExternalLink, Search } from 'lucide-react';
import { getAllCourses, SantanderCourse } from '../../services/santanderCoursesService';
import { ExitAppModal } from '../common/ExitAppModal';

// Card con estilo Santander premium
const SantanderCard: React.FC<{children: React.ReactNode; className?: string; glow?: boolean}> = ({children, className = '', glow = false}) => (
  <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 ${glow ? 'ring-2 ring-[#ec0000]/20' : ''} ${className}`}>
    {children}
  </div>
);

interface AcademiaDashboardProps {
  userId: string;
}

export const AcademiaDashboard: React.FC<AcademiaDashboardProps> = ({ userId }) => {
  const [courses, setCourses] = useState<SantanderCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<SantanderCourse | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const allCourses = getAllCourses();
    setCourses(allCourses);
  }, []);

  const filteredCourses = searchTerm.trim() === ''
    ? courses
    : courses.filter(course =>
        course.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

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
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', // Team meeting
    'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=600&q=80', // Finance charts
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80', // Office work
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', // Business analytics
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80', // Team collaboration
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80', // Business presentation
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80', // Meeting room
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80', // Startup office
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80', // Digital marketing
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80', // Strategy planning
  ];

  const getImageForCourse = (courseId: string) => {
    const index = courseId.length % stockImages.length;
    return stockImages[index];
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Hero Banner Santander - Mobile first */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#ec0000] via-[#cc0000] to-[#990000] p-4 sm:p-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32" />
        
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-9 sm:h-9 text-[#ec0000]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-black text-white truncate">Santander Open Academy</h2>
              <p className="text-white/80 text-xs sm:text-sm truncate">Cursos gratuitos para tu desarrollo profesional</p>
            </div>
          </div>
          <div className="mt-4 text-white/90 text-xs sm:text-sm">
            <p>Accede a más de {courses.length} cursos gratuitos para hacer crecer tu negocio y habilidades profesionales.</p>
          </div>
        </div>
      </div>

      {/* Estadísticas simplificadas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ec0000]/15 rounded-lg">
              <BookOpen className="w-5 h-5 text-[#ec0000]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#181B34]">{courses.length}</p>
              <p className="text-xs text-[#666] font-medium">Cursos disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/15 rounded-lg">
              <GraduationCap className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#181B34]">100%</p>
              <p className="text-xs text-[#666] font-medium">Gratis</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-lg border border-white/50 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f59e0b]/15 rounded-lg">
              <ExternalLink className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#181B34]">Online</p>
              <p className="text-xs text-[#666] font-medium">A tu ritmo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <SantanderCard className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666]" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ec0000] focus:ring-2 focus:ring-[#ec0000]/20 text-[#181B34] placeholder-gray-400"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-[#666]">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        )}
      </SantanderCard>

      {/* Catálogo de cursos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#181B34] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#ec0000]" />
            Catálogo de Cursos
          </h3>
          <span className="text-sm text-[#666] bg-gray-100 px-3 py-1 rounded-full">
            {filteredCourses.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              image={getImageForCourse(course.id)}
              onClick={() => handleCourseClick(course)}
            />
          ))}
        </div>
      </div>

      {/* Modal de confirmación */}
      <ExitAppModal
        isOpen={showExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        courseName={selectedCourse?.nombre}
        destinationName="Santander Open Academy"
      />
    </div>
  );
};

// Componente para tarjeta de curso
interface CourseCardProps {
  course: SantanderCourse;
  image: string;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, image, onClick }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={image} 
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
          onClick={onClick}
          className="w-full bg-gradient-to-r from-[#ec0000] to-[#cc0000] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Ver curso
        </button>
      </div>
    </div>
  );
};
