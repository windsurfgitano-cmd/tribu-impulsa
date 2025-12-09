import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Flame, Clock, Target, Award, TrendingUp, PlayCircle, CheckCircle, Lock } from 'lucide-react';
// Card con estilo Santander
const SantanderCard: React.FC<{children: React.ReactNode; className?: string}> = ({children, className = ''}) => (
  <div className={`bg-white rounded-xl shadow-lg border border-[#E4E7EF] ${className}`}>
    {children}
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
      {/* Header con estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SantanderCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ec0000]/15 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#ff4b4b]" />
            </div>
            <div>
              <p className="text-sm text-[#666]">Cápsulas completadas</p>
              <p className="text-xl font-bold">
                {estadisticas.capsulasCompletadas}/{estadisticas.totalCapsulas}
              </p>
            </div>
          </div>
        </SantanderCard>

        <SantanderCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ec0000]/15 rounded-lg">
              <Trophy className="w-6 h-6 text-[#ffb347]" />
            </div>
            <div>
              <p className="text-sm text-[#666]">Puntos Santander Academia</p>
              <p className="text-xl font-bold">{estadisticas.puntosAcumulados}</p>
            </div>
          </div>
        </SantanderCard>

        <SantanderCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ec0000]/15 rounded-lg">
              <Flame className="w-6 h-6 text-[#ffb347]" />
            </div>
            <div>
              <p className="text-sm text-[#666]">Racha de estudio</p>
              <p className="text-xl font-bold">{estadisticas.rachaActual} días</p>
            </div>
          </div>
        </SantanderCard>

        <SantanderCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ec0000]/15 rounded-lg">
              <Target className="w-6 h-6 text-[#ff4b4b]" />
            </div>
            <div>
              <p className="text-sm text-[#666]">Nivel en la academia</p>
              <p className="text-xl font-bold">Nivel {estadisticas.nivelActual}</p>
            </div>
          </div>
        </SantanderCard>
      </div>

      {/* Barra de progreso general */}
      <SantanderCard className="p-6">
        <h3 className="text-lg font-semibold mb-1 text-[#181B34]">Tu progreso en Santander Academia</h3>
        <p className="text-sm text-gray-400 mb-4">
          Este resumen agrupa todo lo que has avanzado en las cápsulas de la academia.
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progreso total en cápsulas</span>
              <span>{Math.round(estadisticas.porcentajeCompletado)}%</span>
            </div>
            <div className="w-full bg-[#E4E7EF] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#ec0000] to-[#ff4b4b] h-2 rounded-full transition-all duration-300"
                style={{ width: `${estadisticas.porcentajeCompletado}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#666]" />
              <span className="text-sm text-gray-400">
                {Math.round(estadisticas.tiempoTotalEstudio / 60)}h de estudio en la academia
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#666]" />
              <span className="text-sm text-gray-400">
                {estadisticas.insignias} insignias
              </span>
            </div>
          </div>
        </div>
      </SantanderCard>

      {/* Cápsulas recomendadas */}
      {recomendadas.length > 0 && (
        <SantanderCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recomendado para ti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recomendadas.slice(0, 4).map((capsula) => (
              <CapsulaCard 
                key={capsula.id}
                capsula={capsula}
                completada={false}
                enProgreso={progreso.capsulasEnProgreso.includes(capsula.id)}
                onIniciar={() => handleIniciarCapsula(capsula.id)}
                onCompletar={() => handleCompletarCapsula(capsula.id)}
              />
            ))}
          </div>
        </SantanderCard>
      )}

      {/* Todas las cápsulas */}
      <SantanderCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Todas las cápsulas</h3>
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
      </SantanderCard>
    </div>
  );
};

// Componente para tarjeta de cápsula
interface CapsulaCardProps {
  capsula: Capsula;
  completada: boolean;
  enProgreso: boolean;
  onIniciar: () => void;
  onCompletar: () => void;
}

const CapsulaCard: React.FC<CapsulaCardProps> = ({ 
  capsula, 
  completada, 
  enProgreso, 
  onIniciar, 
  onCompletar 
}) => {
  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'basico': return 'bg-[#E4E7EF] text-[#666]';
      case 'intermedio': return 'bg-[#ec0000]/15 text-[#ec0000]';
      case 'avanzado': return 'bg-[#ffb347]/20 text-[#c77800]';
      default: return 'bg-[#E4E7EF] text-[#666]';
    }
  };

  return (
    <SantanderCard className={`p-4 ${completada ? 'border-[#22c55e] border-2' : ''}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm text-[#181B34]">{capsula.titulo}</h4>
          {completada && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </div>
        
        <p className="text-xs text-[#666] line-clamp-2">
          {capsula.descripcion}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${getNivelColor(capsula.nivel)}`}>
              {capsula.nivel}
            </span>
            <span className="text-xs text-[#888]">
              {capsula.duracion}min
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="w-3 h-3 text-[#ffb347]" />
            <span className="text-xs text-[#666]">{capsula.puntos} pts</span>
          </div>
        </div>
        
        {capsula.requisitos && capsula.requisitos.length > 0 && (
          <div className="text-xs text-[#888]">
            Requiere: {capsula.requisitos.length} cápsula(s)
          </div>
        )}
        
        <div className="flex space-x-2">
          {completada ? (
            <button className="flex-1 bg-emerald-500/20 text-emerald-600 py-2 px-3 rounded-lg text-xs font-medium">
              Completada
            </button>
          ) : enProgreso ? (
            <button 
              onClick={onCompletar}
              className="flex-1 bg-[#ec0000]/20 text-[#ff4b4b] py-2 px-3 rounded-lg text-xs font-medium hover:bg-[#ec0000]/30 transition-colors"
            >
              Marcar como completada
            </button>
          ) : (
            <button 
              onClick={onIniciar}
              className="flex-1 bg-white/5 text-[#181B34] py-2 px-3 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center space-x-1"
            >
              <PlayCircle className="w-3 h-3" />
              <span>Iniciar cápsula</span>
            </button>
          )}
        </div>
      </div>
    </SantanderCard>
  );
};
