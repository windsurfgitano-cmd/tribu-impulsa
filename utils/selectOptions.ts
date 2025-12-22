import { TRIBE_CATEGORY_OPTIONS } from '../data/tribeCategories';
import { AFFINITIES } from '../constants/affinities';
import { SearchableOption } from '../components/SearchableSelect';

// Grupos principales conocidos (orden de prioridad para matching)
const KNOWN_GROUPS = [
  'Moda Mujer',
  'Moda Hombre',
  'Moda',
  'Negocio',
  'Alimentos y Gastronomía',
  'Alimentos y Accesorios para mascotas',
  'Belleza, Estética y Bienestar',
  'Todo Belleza',
  'Servicios Profesionales',
  'Educación y Capacitación',
  'Arte, Diseño y Creatividad',
  'Construcción y Mantención',
  'Tecnología y Desarrollo',
  'Turismo',
  'Eventos',
  'Transporte y Logística',
  'Mascotas y Animales',
  'Industria y Manufactura',
  'Oficio',
  'Otro'
];

const sortByGroupAndLabel = (a: SearchableOption, b: SearchableOption) => {
  if ((a.group || '') === (b.group || '')) {
    return a.label.localeCompare(b.label, 'es');
  }
  return (a.group || '').localeCompare(b.group || '', 'es');
};

/**
 * Parsea una categoría y extrae grupo + label
 * Ejemplo: "Moda Mujer Ropa  Jeans" → { group: "Moda Mujer", label: "Jeans", description: "Ropa" }
 */
const parseCategory = (raw: string): { group: string; label: string; description?: string } => {
  // Caso especial: "Otro"
  if (raw === 'Otro') {
    return { group: 'Otro', label: 'Otro' };
  }

  // Buscar el grupo principal que mejor coincida
  let matchedGroup = 'Otro';
  let remainder = raw;

  for (const group of KNOWN_GROUPS) {
    if (raw.startsWith(group + ' ') || raw === group) {
      matchedGroup = group;
      remainder = raw.slice(group.length).trim();
      break;
    }
  }

  // Si no hay remainder, el label es el grupo
  if (!remainder) {
    return { group: matchedGroup, label: matchedGroup };
  }

  // El remainder puede tener subcategorías separadas por espacios
  // Tomamos la última parte significativa como label
  const parts = remainder.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    // Sin partes claras, usar el remainder completo como label
    return { group: matchedGroup, label: remainder };
  }

  // La última parte es generalmente el label más específico
  const lastPart = parts[parts.length - 1];
  
  // Si hay múltiples partes, las anteriores son descripción
  if (parts.length > 1) {
    const descParts = parts.slice(0, -1);
    return { 
      group: matchedGroup, 
      label: lastPart,
      description: descParts.join(' → ')
    };
  }

  // Solo una parte en el remainder
  // Puede ser "Subcategoría Label" - tomamos todo como label
  return { group: matchedGroup, label: lastPart };
};

export const buildCategorySelectOptions = (): SearchableOption[] => {
  const seen = new Set<string>();
  
  return TRIBE_CATEGORY_OPTIONS
    .map((raw) => {
      const { group, label, description } = parseCategory(raw);
      
      return {
        value: raw,
        label,
        group,
        description
      };
    })
    .filter(opt => {
      // Eliminar duplicados por value
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);
      return true;
    })
    .sort(sortByGroupAndLabel);
};

export const buildAffinitySelectOptions = (): SearchableOption[] => {
  return AFFINITIES.map(({ group, label }) => ({
    value: `${group} - ${label}`,
    label,
    group
  })).sort(sortByGroupAndLabel);
};

export const CATEGORY_SELECT_OPTIONS = buildCategorySelectOptions();
export const AFFINITY_SELECT_OPTIONS_WITH_GROUP = buildAffinitySelectOptions();
