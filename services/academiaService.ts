import { 
  Capsula, 
  ProgresoUsuario, 
  Insignia, 
  Certificado, 
  RutaAprendizaje, 
  Gamification 
} from '../types-academia';

// Datos mock de cápsulas de Santander Academia (enfoque emprendedores)
export const CAPSULAS_MOCK: Capsula[] = [
  {
    id: 'capsula-001',
    titulo: 'Mentalidad emprendedora: de idea a acción',
    descripcion: 'Cómo pasar de una idea a un proyecto concreto, entendiendo el rol del emprendedor en el día a día.',
    duracion: 35,
    categoria: 'Emprendimiento',
    nivel: 'basico',
    urlVideo: 'https://example.com/mentalidad-emprendedora',
    puntos: 40,
    requisitos: [],
    evaluacion: {
      tipo: 'quiz',
      preguntas: 8,
      notaMinima: 70
    }
  },
  {
    id: 'capsula-002',
    titulo: 'Finanzas básicas para tu negocio',
    descripcion: 'Conceptos clave de caja, costos, margen y punto de equilibrio para tomar mejores decisiones.',
    duracion: 45,
    categoria: 'Finanzas para emprendedores',
    nivel: 'basico',
    urlVideo: 'https://example.com/finanzas-basicas-negocio',
    puntos: 50,
    requisitos: ['capsula-001'],
    evaluacion: {
      tipo: 'quiz',
      preguntas: 10,
      notaMinima: 70
    }
  },
  {
    id: 'capsula-003',
    titulo: 'Banca digital y productos Santander para pymes',
    descripcion: 'Cómo usar la banca digital y los productos Santander para apoyar el crecimiento de tu emprendimiento.',
    duracion: 40,
    categoria: 'Finanzas para emprendedores',
    nivel: 'intermedio',
    urlVideo: 'https://example.com/banca-digital-pymes',
    puntos: 60,
    requisitos: ['capsula-002'],
    evaluacion: {
      tipo: 'practica',
      notaMinima: 75
    }
  },
  {
    id: 'capsula-004',
    titulo: 'Presencia digital para emprendedores',
    descripcion: 'Bases para construir una presencia digital simple pero efectiva: redes sociales, sitio y mensajería.',
    duracion: 50,
    categoria: 'Negocios digitales',
    nivel: 'basico',
    urlVideo: 'https://example.com/presencia-digital',
    puntos: 55,
    requisitos: ['capsula-001'],
    evaluacion: {
      tipo: 'quiz',
      preguntas: 10,
      notaMinima: 70
    }
  },
  {
    id: 'capsula-005',
    titulo: 'Vender más usando canales digitales',
    descripcion: 'Cómo usar redes sociales, WhatsApp y herramientas simples para generar demanda y cerrar ventas.',
    duracion: 45,
    categoria: 'Negocios digitales',
    nivel: 'intermedio',
    urlVideo: 'https://example.com/vender-canales-digitales',
    puntos: 65,
    requisitos: ['capsula-004'],
    evaluacion: {
      tipo: 'practica',
      notaMinima: 80
    }
  },
  {
    id: 'capsula-006',
    titulo: 'Experiencia de cliente para negocios pequeños',
    descripcion: 'Claves para diseñar experiencias simples que hagan que tus clientes vuelvan y recomienden tu negocio.',
    duracion: 40,
    categoria: 'Clientes y servicio',
    nivel: 'basico',
    urlVideo: 'https://example.com/experiencia-cliente',
    puntos: 50,
    requisitos: ['capsula-001'],
    evaluacion: {
      tipo: 'quiz',
      preguntas: 8,
      notaMinima: 70
    }
  }
];

// Rutas de aprendizaje predefinidas (enfoque emprendedores)
export const RUTAS_APRENDIZAJE: RutaAprendizaje[] = [
  {
    id: 'ruta-emprendedor-base',
    nombre: 'Fundamentos para emprender',
    descripcion: 'Ruta pensada para quienes están partiendo: mentalidad, finanzas básicas y experiencia de cliente.',
    capsulas: ['capsula-001', 'capsula-002', 'capsula-006'],
    nivelRequerido: 1,
    puntosTotales: 140,
    estimatedDuration: 2.0
  },
  {
    id: 'ruta-negocio-digital',
    nombre: 'Lleva tu negocio al mundo digital',
    descripcion: 'Cómo dar los primeros pasos en presencia y venta digital para tu emprendimiento.',
    capsulas: ['capsula-001', 'capsula-004', 'capsula-005'],
    nivelRequerido: 1,
    puntosTotales: 160,
    estimatedDuration: 2.3
  },
  {
    id: 'ruta-finanzas-santander',
    nombre: 'Finanzas y banca con Santander',
    descripcion: 'Entender las finanzas básicas de tu negocio y cómo apoyarte en la banca digital Santander.',
    capsulas: ['capsula-001', 'capsula-002', 'capsula-003'],
    nivelRequerido: 1,
    puntosTotales: 150,
    estimatedDuration: 2.1
  }
];

// Configuración de gamificación
export const GAMIFICATION_CONFIG: Gamification = {
  puntosPorCapsula: 50,
  bonoRacha: 10,
  puntosPorInsignia: 25,
  niveles: [
    { nivel: 1, nombre: 'Aprendiz', puntosRequeridos: 0, beneficios: ['Acceso básico'] },
    { nivel: 2, nombre: 'Explorador', puntosRequeridos: 100, beneficios: ['Acceso intermedio', 'Badge especial'] },
    { nivel: 3, nombre: 'Experto', puntosRequeridos: 250, beneficios: ['Acceso avanzado', 'Certificado básico'] },
    { nivel: 4, nombre: 'Maestro', puntosRequeridos: 500, beneficios: ['Todos los accesos', 'Certificado avanzado', 'Mentoría'] },
    { nivel: 5, nombre: 'Leyenda', puntosRequeridos: 1000, beneficios: ['Acceso ilimitado', 'Certificado premium', 'Invitaciones exclusivas'] }
  ]
};

// Clase de servicio para la academia
export class AcademiaService {
  private static instance: AcademiaService;
  
  static getInstance(): AcademiaService {
    if (!AcademiaService.instance) {
      AcademiaService.instance = new AcademiaService();
    }
    return AcademiaService.instance;
  }

  // Obtener todas las cápsulas
  getCapsulas(): Capsula[] {
    return CAPSULAS_MOCK;
  }

  // Obtener cápsula por ID
  getCapsulaById(id: string): Capsula | undefined {
    return CAPSULAS_MOCK.find(capsula => capsula.id === id);
  }

  // Obtener cápsulas por categoría
  getCapsulasByCategoria(categoria: string): Capsula[] {
    return CAPSULAS_MOCK.filter(capsula => capsula.categoria === categoria);
  }

  // Obtener cápsulas por nivel
  getCapsulasByNivel(nivel: string): Capsula[] {
    return CAPSULAS_MOCK.filter(capsula => capsula.nivel === nivel);
  }

  // Obtener rutas de aprendizaje
  getRutasAprendizaje(): RutaAprendizaje[] {
    return RUTAS_APRENDIZAJE;
  }

  // Obtener progreso del usuario (mock - en producción vendría de Firebase)
  getProgresoUsuario(userId: string): ProgresoUsuario {
    // Mock de progreso "vivido" para demo de Santander Academia
    const hoy = new Date();

    // Simulamos que la persona ya completó algunas cápsulas base
    const capsulasCompletadas = ['capsula-001', 'capsula-002'];
    const capsulasEnProgreso = ['capsula-004'];

    // Calcular puntos y tiempo a partir de las cápsulas mock
    let puntosAcumulados = 0;
    let tiempoTotalEstudio = 0;
    for (const id of capsulasCompletadas) {
      const capsula = this.getCapsulaById(id);
      if (capsula) {
        puntosAcumulados += capsula.puntos;
        tiempoTotalEstudio += capsula.duracion;
      }
    }

    // Racha simulada de 3 días
    const rachaActual = 3;

    // Nivel calculado con la misma lógica de gamificación
    const nivelActual = this.calcularNivel(puntosAcumulados);

    const insignias: Insignia[] = [
      {
        id: 'badge-primeros-pasos',
        nombre: 'Primeros pasos en la academia',
        descripcion: 'Completaste tus primeras cápsulas en Santander Academia.',
        icono: 'star',
        fechaObtencion: hoy,
        tipo: 'progreso'
      }
    ];

    const certificados: Certificado[] = [];

    return {
      userId,
      capsulasCompletadas,
      capsulasEnProgreso,
      puntosAcumulados,
      nivelActual,
      insignias,
      rachaActual,
      ultimaActividad: hoy,
      tiempoTotalEstudio,
      certificadosObtenidos: certificados
    };
  }

  // Marcar cápsula como completada
  completarCapsula(userId: string, capsulaId: string): ProgresoUsuario {
    const progreso = this.getProgresoUsuario(userId);
    const capsula = this.getCapsulaById(capsulaId);
    
    if (!capsula) {
      throw new Error('Cápsula no encontrada');
    }

    // Verificar requisitos
    const requisitosCumplidos = capsula.requisitos?.every(reqId => 
      progreso.capsulasCompletadas.includes(reqId)
    ) ?? true;

    if (!requisitosCumplidos) {
      throw new Error('Requisitos no cumplidos');
    }

    // Actualizar progreso
    if (!progreso.capsulasCompletadas.includes(capsulaId)) {
      progreso.capsulasCompletadas.push(capsulaId);
      progreso.puntosAcumulados += capsula.puntos;
      progreso.tiempoTotalEstudio += capsula.duracion;
      
      // Actualizar nivel
      const nuevoNivel = this.calcularNivel(progreso.puntosAcumulados);
      if (nuevoNivel > progreso.nivelActual) {
        progreso.nivelActual = nuevoNivel;
        // Otorgar insignia de nivel
        this.otorgarInsignia(progreso, `nivel-${nuevoNivel}`);
      }

      // Verificar racha
      this.actualizarRacha(progreso);
    }

    return progreso;
  }

  // Iniciar cápsula
  iniciarCapsula(userId: string, capsulaId: string): ProgresoUsuario {
    const progreso = this.getProgresoUsuario(userId);
    
    if (!progreso.capsulasEnProgreso.includes(capsulaId)) {
      progreso.capsulasEnProgreso.push(capsulaId);
    }

    return progreso;
  }

  // Calcular nivel basado en puntos
  private calcularNivel(puntos: number): number {
    const niveles = GAMIFICATION_CONFIG.niveles;
    for (let i = niveles.length - 1; i >= 0; i--) {
      if (puntos >= niveles[i].puntosRequeridos) {
        return niveles[i].nivel;
      }
    }
    return 1;
  }

  // Otorgar insignia
  private otorgarInsignia(progreso: ProgresoUsuario, insigniaId: string): void {
    // Lógica para otorgar insignias
    // En producción, esto se guardaría en la base de datos
  }

  // Actualizar racha de estudio
  private actualizarRacha(progreso: ProgresoUsuario): void {
    const hoy = new Date();
    const ultimaActividad = new Date(progreso.ultimaActividad);
    
    // Si la última actividad fue ayer, incrementar racha
    const diasDiferencia = Math.floor((hoy.getTime() - ultimaActividad.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasDiferencia === 1) {
      progreso.rachaActual++;
    } else if (diasDiferencia > 1) {
      progreso.rachaActual = 1; // Reiniciar racha
    }
    
    progreso.ultimaActividad = hoy;
  }

  // Obtener estadísticas del usuario
  getEstadisticasUsuario(userId: string) {
    const progreso = this.getProgresoUsuario(userId);
    const totalCapsulas = CAPSULAS_MOCK.length;
    const porcentajeCompletado = (progreso.capsulasCompletadas.length / totalCapsulas) * 100;
    
    return {
      capsulasCompletadas: progreso.capsulasCompletadas.length,
      totalCapsulas,
      porcentajeCompletado,
      puntosAcumulados: progreso.puntosAcumulados,
      nivelActual: progreso.nivelActual,
      rachaActual: progreso.rachaActual,
      tiempoTotalEstudio: progreso.tiempoTotalEstudio,
      insignias: progreso.insignias.length
    };
  }

  // Obtener próximas cápsulas recomendadas
  getCapsulasRecomendadas(userId: string): Capsula[] {
    const progreso = this.getProgresoUsuario(userId);
    const completadas = new Set(progreso.capsulasCompletadas);
    
    return CAPSULAS_MOCK.filter(capsula => {
      // No mostrar si ya está completada
      if (completadas.has(capsula.id)) return false;
      
      // Verificar si todos los requisitos están cumplidos
      return capsula.requisitos.every(reqId => completadas.has(reqId));
    });
  }
}

export default AcademiaService.getInstance();
