import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Flame, Clock, Target, Award, TrendingUp, PlayCircle, CheckCircle, Lock, Star, Zap, GraduationCap, Sparkles, ChevronRight, Play } from 'lucide-react';

// Card con estilo Santander premium
const SantanderCard: React.FC<{children: React.ReactNode; className?: string; glow?: boolean}> = ({children, className = '', glow = false}) => (
  <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 ${glow ? 'ring-2 ring-[#ec0000]/20' : ''} ${className}`}>
    {children}
  </div>
);

// Componente de stat animado
const AnimatedStat: React.FC<{value: number | string; label: string; icon: React.ReactNode; color: string; suffix?: string}> = ({value, label, icon, color, suffix = ''}) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-5 shadow-lg border border-white/50 group hover:scale-[1.02] transition-all duration-300">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-20 transition-opacity`} />
    <div className="relative flex items-center gap-4">
      <div className={`p-3 ${color} bg-opacity-15 rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-[#181B34]">{value}{suffix}</p>
        <p className="text-sm text-[#666] font-medium">{label}</p>
      </div>
    </div>
  </div>
);
import AcademiaService, { CAPSULAS_MOCK } from '../../services/academiaService';
import { Capsula, ProgresoUsuario } from '../../types-academia';

interface AcademiaDashboardProps {
  userId: string;
}

export const AcademiaDashboard: React.FC<AcademiaDashboardProps> = ({ userId }) => {
  const [progreso, setProgreso] = useState<ProgresoUsuario | null>(null);
  const [capsulas, setCapsulas] = useState<Capsula[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [recomendadas, setRecomendadas] = useState<Capsula[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [userId]);

  const cargarDatos = () => {
    const servicio = AcademiaService;
    const progresoUsuario = servicio.getProgresoUsuario(userId);
    const todasCapsulas = servicio.getCapsulas();
    const stats = servicio.getEstadisticasUsuario(userId);
    const recomendadas = servicio.getCapsulasRecomendadas(userId);

    setProgreso(progresoUsuario);
    setCapsulas(todasCapsulas);
    setEstadisticas(stats);
    setRecomendadas(recomendadas);
  };

  const handleIniciarCapsula = (capsulaId: string) => {
    const servicio = AcademiaService;
    const nuevoProgreso = servicio.iniciarCapsula(userId, capsulaId);
    setProgreso(nuevoProgreso);
    // Aquí iría la navegación al reproductor de video o contenido
    console.log(`Iniciando cápsula: ${capsulaId}`);
  };

  const handleCompletarCapsula = (capsulaId: string) => {
    const servicio = AcademiaService;
    const nuevoProgreso = servicio.completarCapsula(userId, capsulaId);
    setProgreso(nuevoProgreso);
    cargarDatos(); // Recargar datos para actualizar estadísticas
  };

  if (!progreso || !estadisticas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner Santander */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ec0000] via-[#cc0000] to-[#990000] p-6 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-9 h-9 text-[#ec0000]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Santander Open Academy</h2>
              <p className="text-white/80 text-sm">Desarrolla tu potencial con cursos gratuitos</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/60 text-xs">Tu progreso</p>
              <p className="text-white font-bold text-xl">{Math.round(estadisticas.porcentajeCompletado)}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="white" strokeOpacity="0.2" strokeWidth="4" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="4" fill="none" 
                  strokeDasharray={`${estadisticas.porcentajeCompletado * 1.76} 176`}
                  strokeLinecap="round" />
              </svg>
              <Sparkles className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales - Diseño premium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStat 
          value={estadisticas.capsulasCompletadas}
          suffix={`/${estadisticas.totalCapsulas}`}
          label="Cápsulas completadas"
          icon={<BookOpen className="w-6 h-6 text-[#ec0000]" />}
          color="bg-[#ec0000]"
        />
        <AnimatedStat 
          value={estadisticas.puntosAcumulados.toLocaleString()}
          label="Puntos acumulados"
          icon={<Trophy className="w-6 h-6 text-[#f59e0b]" />}
          color="bg-[#f59e0b]"
        />
        <AnimatedStat 
          value={estadisticas.rachaActual}
          suffix=" días"
          label="Racha de estudio"
          icon={<Flame className="w-6 h-6 text-[#ef4444]" />}
          color="bg-[#ef4444]"
        />
        <AnimatedStat 
          value={`Nivel ${estadisticas.nivelActual}`}
          label="Tu nivel actual"
          icon={<Star className="w-6 h-6 text-[#8b5cf6]" />}
          color="bg-[#8b5cf6]"
        />
      </div>

      {/* Logros y Progreso Visual */}
      <SantanderCard className="p-6" glow>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#181B34] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ec0000]" />
              Tu progreso de aprendizaje
            </h3>
            <p className="text-sm text-[#666] mt-1">Sigue avanzando para desbloquear más contenido</p>
          </div>
          <div className="flex items-center gap-2 bg-[#ec0000]/10 px-4 py-2 rounded-full">
            <Award className="w-5 h-5 text-[#ec0000]" />
            <span className="font-bold text-[#ec0000]">{estadisticas.insignias} insignias</span>
          </div>
        </div>
        
        {/* Barra de progreso premium */}
        <div className="relative mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[#181B34]">Progreso total</span>
            <span className="font-bold text-[#ec0000]">{Math.round(estadisticas.porcentajeCompletado)}%</span>
          </div>
          <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#ec0000] via-[#ff4b4b] to-[#ff6b6b] h-4 rounded-full transition-all duration-500 relative"
              style={{ width: `${estadisticas.porcentajeCompletado}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats adicionales en grid bonito */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
            <Clock className="w-6 h-6 text-[#ec0000] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#181B34]">{Math.round(estadisticas.tiempoTotalEstudio / 60)}h</p>
            <p className="text-xs text-[#666]">Tiempo de estudio</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
            <Target className="w-6 h-6 text-[#f59e0b] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#181B34]">{estadisticas.capsulasCompletadas}</p>
            <p className="text-xs text-[#666]">Cápsulas terminadas</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
            <TrendingUp className="w-6 h-6 text-[#22c55e] mx-auto mb-2" />
            <p className="text-2xl font-black text-[#181B34]">+{Math.round(estadisticas.porcentajeCompletado / 10)}%</p>
            <p className="text-xs text-[#666]">Esta semana</p>
          </div>
        </div>
      </SantanderCard>

      {/* Cápsulas recomendadas - Diseño destacado */}
      {recomendadas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#181B34] flex items-center gap-2">
              <Star className="w-5 h-5 text-[#f59e0b]" />
              Recomendado para ti
            </h3>
            <button className="text-[#ec0000] text-sm font-medium flex items-center gap-1 hover:underline">
              Ver todo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recomendadas.slice(0, 4).map((capsula, index) => (
              <CapsulaCard 
                key={capsula.id}
                capsula={capsula}
                completada={false}
                enProgreso={progreso.capsulasEnProgreso.includes(capsula.id)}
                onIniciar={() => handleIniciarCapsula(capsula.id)}
                onCompletar={() => handleCompletarCapsula(capsula.id)}
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Todas las cápsulas - Grid mejorado */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#181B34] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#ec0000]" />
            Explora las cápsulas
          </h3>
          <span className="text-sm text-[#666] bg-gray-100 px-3 py-1 rounded-full">
            {capsulas.length} disponibles
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capsulas.map((capsula) => (
            <CapsulaCard 
              key={capsula.id}
              capsula={capsula}
              completada={progreso.capsulasCompletadas.includes(capsula.id)}
              enProgreso={progreso.capsulasEnProgreso.includes(capsula.id)}
              onIniciar={() => handleIniciarCapsula(capsula.id)}
              onCompletar={() => handleCompletarCapsula(capsula.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para tarjeta de cápsula - Diseño premium
interface CapsulaCardProps {
  capsula: Capsula;
  completada: boolean;
  enProgreso: boolean;
  onIniciar: () => void;
  onCompletar: () => void;
  featured?: boolean;
}

const CapsulaCard: React.FC<CapsulaCardProps> = ({ 
  capsula, 
  completada, 
  enProgreso, 
  onIniciar, 
  onCompletar,
  featured = false
}) => {
  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case 'basico': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Básico' };
      case 'intermedio': return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Intermedio' };
      case 'avanzado': return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Avanzado' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: nivel };
    }
  };

  const nivel = getNivelBadge(capsula.nivel);

  // Imágenes stock profesionales de Unsplash para las cápsulas
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
  const imageIndex = parseInt(capsula.id.replace(/\D/g, '') || '0') % stockImages.length;

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${completada ? 'ring-2 ring-emerald-400' : ''} ${featured ? 'md:col-span-2' : ''}`}>
      {/* Thumbnail con imagen stock */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={stockImages[imageIndex]} 
          alt={capsula.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${nivel.bg} ${nivel.text}`}>
            {nivel.label}
          </span>
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-white/90 text-gray-700">
            {capsula.duracion} min
          </span>
        </div>
        {completada && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        )}
        {!completada && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
              <Play className="w-7 h-7 text-[#ec0000] ml-1" />
            </div>
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
          <Trophy className="w-3 h-3 text-[#fbbf24]" />
          <span className="text-xs text-white font-medium">{capsula.puntos} pts</span>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-4">
        <h4 className="font-bold text-[#181B34] mb-1 line-clamp-1 group-hover:text-[#ec0000] transition-colors">
          {capsula.titulo}
        </h4>
        <p className="text-sm text-[#666] line-clamp-2 mb-4">
          {capsula.descripcion}
        </p>
        
        {capsula.requisitos && capsula.requisitos.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600 mb-3">
            <Lock className="w-3 h-3" />
            <span>Requiere {capsula.requisitos.length} cápsula(s)</span>
          </div>
        )}
        
        {/* Botón de acción */}
        {completada ? (
          <button className="w-full bg-emerald-50 text-emerald-600 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completada
          </button>
        ) : enProgreso ? (
          <button 
            onClick={onCompletar}
            className="w-full bg-gradient-to-r from-[#ec0000] to-[#ff4b4b] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar completada
          </button>
        ) : (
          <button 
            onClick={onIniciar}
            className="w-full bg-[#181B34] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-[#2a2e4a] transition-all flex items-center justify-center gap-2 group-hover:bg-[#ec0000]"
          >
            <PlayCircle className="w-4 h-4" />
            Iniciar cápsula
          </button>
        )}
      </div>
    </div>
  );
};
