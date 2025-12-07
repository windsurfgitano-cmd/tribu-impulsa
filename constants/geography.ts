// ============================================
// GEOGRAFÍA DE CHILE - TRIBU IMPULSA
// ============================================
// Regiones y comunas oficiales de Chile

export type GeographicScope = 'local' | 'regional' | 'nacional';

export interface Region {
  id: string;
  name: string;
  shortName: string;
  comunas: string[];
}

// 16 Regiones de Chile con sus comunas
export const REGIONS: Region[] = [
  {
    id: 'arica',
    name: 'Región de Arica y Parinacota',
    shortName: 'Arica y Parinacota',
    comunas: ['Arica', 'Camarones', 'General Lagos', 'Putre']
  },
  {
    id: 'tarapaca',
    name: 'Región de Tarapacá',
    shortName: 'Tarapacá',
    comunas: ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte']
  },
  {
    id: 'antofagasta',
    name: 'Región de Antofagasta',
    shortName: 'Antofagasta',
    comunas: ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla']
  },
  {
    id: 'atacama',
    name: 'Región de Atacama',
    shortName: 'Atacama',
    comunas: ['Alto del Carmen', 'Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar']
  },
  {
    id: 'coquimbo',
    name: 'Región de Coquimbo',
    shortName: 'Coquimbo',
    comunas: ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paiguano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña']
  },
  {
    id: 'valparaiso',
    name: 'Región de Valparaíso',
    shortName: 'Valparaíso',
    comunas: ['Algarrobo', 'Cabildo', 'Calera', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Putaendo', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar']
  },
  {
    id: 'metropolitana',
    name: 'Región Metropolitana de Santiago',
    shortName: 'Metropolitana',
    comunas: [
      'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 
      'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 
      'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 
      'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 
      'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 
      'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 
      'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 
      'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura'
    ]
  },
  {
    id: 'ohiggins',
    name: "Región del Libertador General Bernardo O'Higgins",
    shortName: "O'Higgins",
    comunas: ['Chimbarongo', 'Chépica', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'La Estrella', 'Las Cabras', 'Litueche', 'Lolol', 'Machalí', 'Malloa', 'Marchihue', 'Mostazal', 'Nancagua', 'Navidad', 'Olivar', 'Palmilla', 'Paredones', 'Peralillo', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Quinta de Tilcoco', 'Rancagua', 'Rengo', 'Requínoa', 'San Fernando', 'San Vicente', 'Santa Cruz']
  },
  {
    id: 'maule',
    name: 'Región del Maule',
    shortName: 'Maule',
    comunas: ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curepto', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelarco', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas']
  },
  {
    id: 'nuble',
    name: 'Región de Ñuble',
    shortName: 'Ñuble',
    comunas: ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay']
  },
  {
    id: 'biobio',
    name: 'Región del Biobío',
    shortName: 'Biobío',
    comunas: ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel']
  },
  {
    id: 'araucania',
    name: 'Región de La Araucanía',
    shortName: 'La Araucanía',
    comunas: ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Cunco', 'Curacautín', 'Curarrehue', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Toltén', 'Traiguén', 'Victoria', 'Vilcún', 'Villarrica']
  },
  {
    id: 'losrios',
    name: 'Región de Los Ríos',
    shortName: 'Los Ríos',
    comunas: ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno', 'Valdivia']
  },
  {
    id: 'loslagos',
    name: 'Región de Los Lagos',
    shortName: 'Los Lagos',
    comunas: ['Ancud', 'Calbuco', 'Castro', 'Chaitén', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Fresia', 'Frutillar', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 'Puqueldón', 'Purranque', 'Puyehue', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo']
  },
  {
    id: 'aysen',
    name: 'Región de Aysén del General Carlos Ibáñez del Campo',
    shortName: 'Aysén',
    comunas: ['Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Coyhaique', 'Guaitecas', 'Lago Verde', "O'Higgins", 'Río Ibáñez', 'Tortel']
  },
  {
    id: 'magallanes',
    name: 'Región de Magallanes y de la Antártica Chilena',
    shortName: 'Magallanes',
    comunas: ['Antártica', 'Cabo de Hornos', 'Laguna Blanca', 'Natales', 'Porvenir', 'Primavera', 'Punta Arenas', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine']
  }
];

// Lista plana de todas las comunas
export const ALL_COMUNAS: string[] = REGIONS.flatMap(r => r.comunas).sort();

// Lista de nombres de regiones
export const REGION_NAMES: string[] = REGIONS.map(r => r.shortName);

// Función para obtener región por comuna
export const getRegionByComuna = (comuna: string): Region | undefined => {
  return REGIONS.find(r => r.comunas.includes(comuna));
};

// Función para obtener comunas por región
export const getComunasByRegion = (regionId: string): string[] => {
  const region = REGIONS.find(r => r.id === regionId);
  return region ? region.comunas : [];
};

// Función para buscar comunas
export const searchComunas = (query: string): string[] => {
  const q = query.toLowerCase();
  return ALL_COMUNAS.filter(c => c.toLowerCase().includes(q));
};

// Función para buscar regiones
export const searchRegions = (query: string): Region[] => {
  const q = query.toLowerCase();
  return REGIONS.filter(r => 
    r.name.toLowerCase().includes(q) ||
    r.shortName.toLowerCase().includes(q)
  );
};

// Verificar compatibilidad geográfica entre dos usuarios
export const checkGeographicCompatibility = (
  user1Scope: GeographicScope,
  user1Location: string | string[], // comuna o regiones
  user2Scope: GeographicScope,
  user2Location: string | string[]
): boolean => {
  // Si alguno es nacional, siempre es compatible
  if (user1Scope === 'nacional' || user2Scope === 'nacional') {
    return true;
  }
  
  // Si ambos son locales, deben ser la misma comuna
  if (user1Scope === 'local' && user2Scope === 'local') {
    return user1Location === user2Location;
  }
  
  // Si uno es local y otro regional
  if (user1Scope === 'local' && user2Scope === 'regional') {
    const region = getRegionByComuna(user1Location as string);
    const user2Regions = Array.isArray(user2Location) ? user2Location : [user2Location];
    return region ? user2Regions.includes(region.id) : false;
  }
  
  if (user1Scope === 'regional' && user2Scope === 'local') {
    const region = getRegionByComuna(user2Location as string);
    const user1Regions = Array.isArray(user1Location) ? user1Location : [user1Location];
    return region ? user1Regions.includes(region.id) : false;
  }
  
  // Si ambos son regionales, deben compartir al menos una región
  if (user1Scope === 'regional' && user2Scope === 'regional') {
    const regions1 = Array.isArray(user1Location) ? user1Location : [user1Location];
    const regions2 = Array.isArray(user2Location) ? user2Location : [user2Location];
    return regions1.some(r => regions2.includes(r));
  }
  
  return false;
};

// Rangos de facturación mensual
export const REVENUE_RANGES = [
  { id: 'range-1', label: '1 - 500.000', min: 1, max: 500000 },
  { id: 'range-2', label: '500.000 - 1.000.000', min: 500000, max: 1000000 },
  { id: 'range-3', label: '1.000.001 - 1.500.000', min: 1000001, max: 1500000 },
  { id: 'range-4', label: '1.500.001 - 2.000.000', min: 1500001, max: 2000000 },
  { id: 'range-5', label: '2.000.001 - 3.000.000', min: 2000001, max: 3000000 },
  { id: 'range-6', label: '3.000.000+', min: 3000000, max: Infinity },
] as const;

export type RevenueRange = typeof REVENUE_RANGES[number]['id'];
