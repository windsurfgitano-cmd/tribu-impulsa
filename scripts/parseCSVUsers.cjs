/**
 * Script para parsear el CSV de usuarios y generar código TypeScript
 * Ejecutar: node scripts/parseCSVUsers.cjs
 */

const fs = require('fs');
const path = require('path');

// Leer el CSV
const csvPath = path.join(__dirname, '..', 'WEBTRIBU', 'export_vista_usuario_pyme_full-6.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parsear CSV (separador: ;)
const lines = csvContent.split('\n');
const headers = lines[0].split(';');

console.log('📊 Headers encontrados:', headers.length);

// Mapeo de columnas del CSV a campos de la app
const columnMap = {
  'correo': 'email',
  'nombre_completo': 'name',
  'nombre_emprendimiento_pyme': 'companyName',
  'instagram': 'instagram',
  'telefono': 'phone',
  'whatsapp': 'whatsapp',
  'sitio_web': 'website',
  'familia_principal': 'categoryId',
  'descripcion_producto': 'bio',
  'propuesta_valor': 'businessDescription',
  'precio_promedio': 'precioPromedio',
  'genero_cliente': 'generoCliente',
  'rango_etario': 'rangoEtario',
  'nse': 'nse',
  'intereses': 'intereses',
  'seguidores_instagram': 'followers',
  'frecuencia_instagram': 'frecuenciaInstagram',
  'tipo_contenido': 'tipoContenido',
  'experiencia_colab': 'experienciaColab',
  'objetivos': 'objetivos',
  'tiempo_emprendimiento': 'tiempoEmprendimiento',
  'tiktok': 'tiktok',
  'facebook': 'facebook',
  'linkedin': 'linkedin',
};

// Mapeo de categorías (familia_principal) a nombres legibles
const categoryNames = {
  '1': 'Viajes y Turismo',
  '2': 'Gastronomía',
  '3': 'Moda y Accesorios',
  '4': 'Joyería',
  '5': 'Belleza y Bienestar',
  '6': 'Servicios Profesionales',
  '7': 'Tecnología',
  '8': 'Educación',
  '9': 'Hogar y Decoración',
  '10': 'Deportes',
  '11': 'Eventos',
  '12': 'Transporte',
  '13': 'Familia',
};

// Mapeo de afinidad según categoría
const affinityMap = {
  '1': 'Viajes',
  '2': 'Gastronomía',
  '3': 'Moda',
  '4': 'Moda',
  '5': 'Bienestar',
  '6': 'Negocios',
  '7': 'Tecnología',
  '8': 'Educación',
  '9': 'Hogar',
  '10': 'Deportes',
  '11': 'Eventos',
  '12': 'Servicios',
  '13': 'Familia',
};

// Parsear cada línea
const users = [];
let completeCount = 0;
let incompleteCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parsear línea respetando comillas (puede haber ; dentro de campos con comillas)
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      values.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.replace(/^"|"$/g, '').trim());
  
  // Crear objeto con headers
  const row = {};
  headers.forEach((h, idx) => {
    row[h.trim()] = values[idx] || '';
  });
  
  // Solo procesar usuarios con datos completos (tienen nombre_emprendimiento_pyme)
  if (!row['nombre_emprendimiento_pyme'] || row['nombre_emprendimiento_pyme'].trim() === '') {
    incompleteCount++;
    continue;
  }
  
  completeCount++;
  
  const categoryId = row['familia_principal'] || '6';
  const category = categoryNames[categoryId] || 'Servicios Profesionales';
  const affinity = affinityMap[categoryId] || 'Negocios';
  
  // Limpiar teléfono/whatsapp
  let phone = row['telefono'] || '';
  let whatsapp = row['whatsapp'] || phone;
  if (!whatsapp.startsWith('+')) whatsapp = '+56' + whatsapp.replace(/\D/g, '');
  if (!phone.startsWith('+') && phone) phone = '+56' + phone.replace(/\D/g, '');
  
  // Limpiar Instagram
  let instagram = row['instagram'] || '';
  if (instagram && !instagram.startsWith('@')) instagram = '@' + instagram;
  
  // Seguidores
  let followers = parseInt(row['seguidores_instagram'] || '1000') || 1000;
  
  const user = {
    email: row['correo'],
    name: row['nombre_completo'],
    companyName: row['nombre_emprendimiento_pyme'],
    instagram: instagram,
    phone: phone,
    whatsapp: whatsapp,
    website: row['sitio_web'] || '',
    category: category,
    affinity: affinity,
    bio: (row['descripcion_producto'] || '').replace(/\n/g, ' ').substring(0, 500),
    businessDescription: (row['propuesta_valor'] || '').replace(/\n/g, ' ').substring(0, 500),
    city: 'Santiago',
    status: 'active',
    followers: followers,
    firstLogin: true,
    tiempoEmprendimiento: row['tiempo_emprendimiento'] || '',
    precioPromedio: row['precio_promedio'] || '',
    generoCliente: row['genero_cliente'] || 'mixto',
    rangoEtario: row['rango_etario'] || 'mixto',
    nse: row['nse'] || 'mixto',
    intereses: row['intereses'] || '',
    frecuenciaInstagram: row['frecuencia_instagram'] || '',
    tipoContenido: row['tipo_contenido'] || '',
    experienciaColab: row['experiencia_colab'] || '',
    objetivos: row['objetivos'] || '',
    tiktok: row['tiktok'] || '',
    facebook: row['facebook'] || '',
    linkedin: row['linkedin'] || '',
  };
  
  users.push(user);
}

console.log(`\n✅ Usuarios con datos completos: ${completeCount}`);
console.log(`⚠️ Usuarios incompletos (solo pre-registro): ${incompleteCount}`);
console.log(`\n📝 Generando código TypeScript...\n`);

// Generar código TypeScript
let tsCode = `// USUARIOS REALES actualizados del CSV: export_vista_usuario_pyme_full-6.csv
// Generado el: ${new Date().toISOString()}
// Total: ${users.length} usuarios con datos completos

export const REAL_USERS: RealUser[] = [
`;

users.forEach((user, idx) => {
  tsCode += `  {
    email: '${user.email}',
    name: '${user.name.replace(/'/g, "\\'")}',
    companyName: '${user.companyName.replace(/'/g, "\\'")}',
    instagram: '${user.instagram}',
    phone: '${user.phone}',
    whatsapp: '${user.whatsapp}',
    website: '${user.website}',
    category: '${user.category}',
    affinity: '${user.affinity}',
    bio: '${user.bio.replace(/'/g, "\\'")}',
    businessDescription: '${user.businessDescription.replace(/'/g, "\\'")}',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('${user.name.replace(/'/g, "\\'")}'),
    companyLogoUrl: getLogoUrl('${user.companyName.replace(/'/g, "\\'")}'),
    coverUrl: getCoverUrl('${user.category}'),
    status: 'active',
    followers: ${user.followers},
    firstLogin: true,
    tiempoEmprendimiento: '${user.tiempoEmprendimiento}',
    precioPromedio: '${user.precioPromedio}',
    generoCliente: '${user.generoCliente}',
    rangoEtario: '${user.rangoEtario}',
    nse: '${user.nse}',
    intereses: '${user.intereses}',
    frecuenciaInstagram: '${user.frecuenciaInstagram}',
    tipoContenido: '${user.tipoContenido}',
    experienciaColab: '${user.experienciaColab}',
    objetivos: '${user.objetivos}',
  },
`;
});

tsCode += `];`;

// Guardar archivo
const outputPath = path.join(__dirname, 'generated_users.ts');
fs.writeFileSync(outputPath, tsCode);

console.log(`✅ Código generado en: ${outputPath}`);
console.log('\n📋 Lista de usuarios procesados:');
users.forEach((u, i) => {
  console.log(`${i+1}. ${u.name} - ${u.companyName} (${u.instagram})`);
});
