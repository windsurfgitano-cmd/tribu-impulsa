// Tipos para Santander Academia

export interface Capsula {
  id: string;
  titulo: string;
  descripcion: string;
  duracion: number; // en minutos
  categoria: string;
  nivel: 'basico' | 'intermedio' | 'avanzado';
  urlVideo?: string;
  urlMaterial?: string;
  puntos: number; // puntos que otorga al completarla
  requisitos: string[]; // IDs de cápsulas requeridas
  evaluacion?: {
    tipo: 'quiz' | 'practica' | 'proyecto';
    preguntas?: number;
    notaMinima: number;
  };
}

export interface ProgresoUsuario {
  userId: string;
  capsulasCompletadas: string[]; // IDs de cápsulas completadas
  capsulasEnProgreso: string[]; // IDs de cápsulas en progreso
  puntosAcumulados: number;
  nivelActual: number;
  insignias: Insignia[];
  rachaActual: number; // días consecutivos
  ultimaActividad: Date;
  tiempoTotalEstudio: number; // en minutos
  certificadosObtenidos: Certificado[];
}

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaObtencion: Date;
  tipo: 'progreso' | 'racha' | 'especial' | 'logro';
}

export interface Certificado {
  id: string;
  nombre: string;
  descripcion: string;
  fechaEmision: Date;
  urlCertificado: string;
  nivel: string;
}

export interface RutaAprendizaje {
  id: string;
  nombre: string;
  descripcion: string;
  capsulas: string[]; // IDs de cápsulas en orden
  nivelRequerido: number;
  puntosTotales: number;
  estimatedDuration: number; // en horas
}

export interface Gamification {
  puntosPorCapsula: number;
  bonoRacha: number;
  puntosPorInsignia: number;
  niveles: {
    nivel: number;
    nombre: string;
    puntosRequeridos: number;
    beneficios: string[];
  }[];
}
