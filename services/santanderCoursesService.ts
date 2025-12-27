// Servicio para cursos de Santander Open Academy desde CSV

export interface SantanderCourse {
  id: string;
  nombre: string;
  estado: string;
  url: string;
}

// Datos del CSV: Catalogo completo LMS - 20251222 (2).csv
const COURSES_CSV_DATA = `Aprende a Estudiar Mejor: Técnicas que Funcionan,Publicado,https://www.santanderopenacademy.com/es/courses/study-smarter-techniques-that-work.html
Aprende a gestionar tu tiempo,Publicado,https://www.santanderopenacademy.com/es/courses/time-management.html
Aprende español para contar experiencias,Publicado,https://www.santanderopenacademy.com/es/courses/learn-spanish-for-real-life.html
Aprende español para viajar,Publicado,https://www.santanderopenacademy.com/es/courses/learn-spanish-for-travelling.html
Bienestar en el trabajo,Publicado,https://www.santanderopenacademy.com/es/courses/wellbeing-strategies-for-organizations.html
Colaboración y Comunicación Estratégica,Publicado,https://www.santanderopenacademy.com/es/courses/strategic-communication-teamwork.html
Comunicación Efectiva,Publicado,https://app.santanderopenacademy.com/es/course/effective-communication
Comunicating with Power and Impact ,Publicado,https://www.santanderopenacademy.com/en/courses/communicating-with-power-and-impact.html
Copilot: Domina la IA en Microsoft 365,Publicado,https://www.santanderopenacademy.com/es/courses/copilot-master-ai-microsoft-365.html
Copilot: Fundamentos de IA de Microsoft,Publicado,https://www.santanderopenacademy.com/es/courses/copilot-ai-fundamentals.html
Curso de Data Science,Publicado,https://www.santanderopenacademy.com/es/courses/introduction-to-data-science.html
Curso Santander | Gestión del estrés,Publicado,https://www.santanderopenacademy.com/es/courses/stress-management.html
Curso Santander | Mindfulness,Publicado,https://www.santanderopenacademy.com/es/courses/mindfulness.html
Curso Santander I Business English: Listening and Communication skills - Part 1,Publicado,https://www.santanderopenacademy.com/es/courses/business-english-listening-communication-skills-1.html
Curso Santander I Business English: Listening and Communication skills - Part 2,Publicado,https://www.santanderopenacademy.com/es/courses/business-english-listening-communication-skills-2.html
Curso Santander I Business English: Listening and Communication skills - Part 3,Publicado,https://www.santanderopenacademy.com/es/courses/business-english-listening-communication-skills-3.html
Cursor con Python: desarrollo inteligente con IA,Publicado,https://www.santanderopenacademy.com/es/courses/python-cursor-smarter-development-with-ai.html
Del propósito a la acción: Generando impacto en sostenibilidad,Publicado,https://www.santanderopenacademy.com/es/courses/from-aspiration-action-sustainability-impact.html
Domina la IA con prompting responsable,Publicado,https://www.santanderopenacademy.com/es/courses/master-ai-with-responsible-prompting.html
E-commerce con Gestión Comercial,Publicado,https://www.santanderopenacademy.com/es/courses/ecommerce-with-commercial-management.html
Escritura Efectiva y Persuasiva,Publicado,https://www.santanderopenacademy.com/es/courses/effective-business-writing.html
"ESG Abre tus sentidos: Discapacidad, Inclusión y Empleo",Publicado,https://www.santanderopenacademy.com/es/courses/abre-tus-sentidos-discapacidad-inclusion-empleo.html
Excel de básico a intermédio,Publicado,https://www.santanderopenacademy.com/es/courses/excel.html
Fundamentos de ChatGPT,Publicado,https://www.santanderopenacademy.com/es/courses/chatgpt.html
Fundamentos de Marketing Automation,Publicado,https://www.santanderopenacademy.com/es/courses/marketing-automation.html
Fundamentos de Nutrición,Publicado,https://www.santanderopenacademy.com/es/courses/nutrition-fundamentals.html
Fundamentos de Power BI,Publicado,https://app.santanderopenacademy.com/es/course/power-bi-fundamentals
Fundamentos del inglés para optimizar tu CV y búsqueda de empleo,Publicado,https://www.santanderopenacademy.com/es/courses/english-essentials-for-professional-growth.html
Gestión de Proyectos y Fundamentos de metodología Agile,Publicado,https://app.santanderopenacademy.com/es/course/project-management-agile-fundamentals
Gestion efectiva de proyectos y equipos,Publicado,https://www.santanderopenacademy.com/es/courses/lead-with-impact.html
Google: Domina la IA con Gemini,Publicado,https://www.santanderopenacademy.com/es/courses/master-ai-with-gemini.html
Google: IA Practica para Marketing,Publicado,https://www.santanderopenacademy.com/es/courses/google-practical-ai-for-marketing.html
Inglés para Entrevistas y Networking,Publicado,https://www.santanderopenacademy.com/es/courses/english-fundamentals-successful-networking-interviews.html
Innovación y creatividad,Publicado,https://app.santanderopenacademy.com/es/course/innovation-and-creativity-develop-your-creative-thinking
Introducción a la programación con Python,Publicado,https://www.santanderopenacademy.com/es/courses/introduction_to_python_programming.html
Introducción al comportamiento del consumidor,Publicado,https://www.santanderopenacademy.com/es/courses/consumer-behavior-essentials.html
Lidera a Toda Velocidad: Lecciones de la Fórmula 1®,Publicado,https://www.santanderopenacademy.com/es/courses/high-performance-leadership.html
Liderazgo,Publicado,https://www.santanderopenacademy.com/es/courses/leadership.html
Liderazgo en el entorno digital,Publicado,https://www.santanderopenacademy.com/es/courses/leading-in-a-digital-world.html
Marketing Digital,Publicado,https://www.santanderopenacademy.com/es/courses/digital-marketing.html
Negociación,Publicado,https://www.santanderopenacademy.com/es/courses/negotiation.html
Pensamiento crítico y resolución de problemas,Publicado,https://www.santanderopenacademy.com/es/courses/critical-thinking-problem-solving.html
Pensamiento y mentalidad estratégica,Publicado,https://app.santanderopenacademy.com/es/course/strategic-thinking-strategic-mindset
Presentaciones en inglés: Guía práctica para comunicar con impacto,Publicado,https://www.santanderopenacademy.com/es/courses/elevating-your-english-crafting-engaging-presentations.html
Protección de datos y privacidad para todos,Publicado,https://www.santanderopenacademy.com/es/courses/data-protection-and-privacy-for-all.html
Publicidad en redes sociales  ,Publicado,https://www.santanderopenacademy.com/es/courses/social-media-advertising.html
Reglas de la IA: como usarla sin correr riesgos legales,Publicado,https://www.santanderopenacademy.com/es/courses/safe-fair-legal-how-to-use-ai-right.html
Seguridad digital para tu día a día,Publicado,https://www.santanderopenacademy.com/es/courses/digital-safety-for-daily-life.html
SEO y Content Marketing ,Publicado,https://www.santanderopenacademy.com/es/courses/seo-and-content-marketing.html`;

// Parsear CSV y crear array de cursos
function parseCoursesCSV(): SantanderCourse[] {
  const lines = COURSES_CSV_DATA.trim().split('\n');
  const courses: SantanderCourse[] = [];

  for (const line of lines) {
    // Ignorar líneas vacías
    if (!line.trim()) continue;

    // Manejar comas dentro de comillas dobles
    const parts: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim()); // Última parte

    if (parts.length >= 3) {
      const nombre = parts[0].replace(/^"|"$/g, '').trim(); // Remover comillas si existen
      const estado = parts[1].trim();
      const url = parts[2].trim();

      // Validar que tenga nombre y URL
      if (!nombre || !url) continue;

      // Crear ID único basado en el nombre (slug)
      const id = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      courses.push({
        id,
        nombre,
        estado,
        url
      });
    }
  }

  return courses;
}

// Cache de cursos parseados
let coursesCache: SantanderCourse[] | null = null;

// Obtener todos los cursos
export function getAllCourses(): SantanderCourse[] {
  if (!coursesCache) {
    coursesCache = parseCoursesCSV();
  }
  return coursesCache;
}

// Obtener curso por ID
export function getCourseById(id: string): SantanderCourse | undefined {
  const courses = getAllCourses();
  return courses.find(course => course.id === id);
}

// Buscar cursos por nombre (case-insensitive, parcial)
export function searchCourses(query: string): SantanderCourse[] {
  const courses = getAllCourses();
  if (!query || query.trim() === '') {
    return courses;
  }

  const lowerQuery = query.toLowerCase().trim();
  return courses.filter(course =>
    course.nombre.toLowerCase().includes(lowerQuery)
  );
}

// Exportar servicio por defecto
export default {
  getAllCourses,
  getCourseById,
  searchCourses
};

