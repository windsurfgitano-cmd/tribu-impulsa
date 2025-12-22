
// Categorías utilizadas específicamente para la formación de tribus y compatibilidad
export const TRIBE_CATEGORY_OPTIONS = [
    'Moda Mujer',
    'Moda Hombre',
    'Belleza',
    'Bienestar y Salud',
    'Economía y Negocios',
    'Alimentos y Gastronomía',
    'Eventos',
    'Familia y Hogar',
    'Tecnología',
    'Turismo',
    'Mascotas',
    'Educación',
    'Arte',
    'Marketing',
    'Construcción',
    'Transporte',
    'Otro'
];

export const SURVEY_CATEGORY_OPTIONS = TRIBE_CATEGORY_OPTIONS;

/**
 * Mapeo de categorías principales a categorías de tribu si es necesario consolidar
 * Algunas categorías de usuarios se agrupan en una categoría de tribu más amplia
 */
export const CATEGORY_TO_TRIBE_MAPPING: Record<string, string> = {
    'Moda Mujer': 'Moda Mujer',
    'Moda Hombre': 'Moda Hombre',
    'Belleza, Estética y Bienestar': 'Belleza',
    'Alimentos y Gastronomía': 'Alimentos y Gastronomía',
    'Negocio': 'Economía y Negocios',
    'Servicios Profesionales': 'Economía y Negocios',
    'Educación y Capacitación': 'Educación',
    'Arte, Diseño y Creatividad': 'Arte',
    'Construcción y Mantención': 'Construcción',
    'Tecnología y Desarrollo': 'Tecnología',
    'Turismo': 'Turismo',
    'Eventos': 'Eventos',
    'Transporte y Logística': 'Transporte',
    'Mascotas y Animales': 'Mascotas',
    'Industria y Manufactura': 'Otro',
    'Oficio': 'Otro',
    'Otro': 'Otro'
};

export const getTribeCategory = (userCategory: string): string => {
    return CATEGORY_TO_TRIBE_MAPPING[userCategory] || 'Otro';
};
