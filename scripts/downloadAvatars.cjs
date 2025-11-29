/**
 * Script para descargar avatares de Instagram de todos los usuarios
 * Ejecutar con: node scripts/downloadAvatars.js
 * 
 * Descarga las fotos una por una para no saturar el servicio
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Lista de usuarios con Instagram (extraídos del realUsersData.ts)
const USERS_WITH_INSTAGRAM = [
  { name: 'Abraham Lazo', instagram: 'lofwork' },
  { name: 'Mario Ramirez', instagram: 'agenciamenfis' },
  { name: 'Rosana Oddone', instagram: 'rosana_agenciamarca' },
  { name: 'Remigio Valdebenito', instagram: 'kintsugiescuela' },
  { name: 'Alejandra Farias', instagram: 'farias.alejandra' },
  { name: 'Valentina Andrea', instagram: 'vaacosturas' },
  { name: 'Carlos Patricio', instagram: 'cdiaz_entrenamiento' },
  { name: 'Oscar Perez', instagram: 'oscarperezstudio' },
  { name: 'Fabian Espinoza', instagram: 'fabian_espinoza_voz' },
  { name: 'Ignacia Perez', instagram: 'edconsultores' },
  { name: 'Carolina Manzano', instagram: 'sothis.astro' },
  { name: 'Rodrigo Gutierrez', instagram: 'rfranchising_cl' },
  { name: 'Yolanda Ulloa', instagram: 'kusicoaching' },
  { name: 'Sebastian Gonzalez', instagram: 'zfrancisco.cl' },
  { name: 'Laura Polanco', instagram: 'agencia_atemporal' },
  { name: 'Lorena Lopez', instagram: 'foro_adm' },
  { name: 'Soledad Maria', instagram: 'soledadgalaz.bienestar' },
  { name: 'Melanie Marquez', instagram: 'melanie.marquez.coach' },
  { name: 'Catherine Andrea', instagram: 'catmunozsalazar' },
  { name: 'Teresa Navarro', instagram: 'tereconsultora' },
  { name: 'Paula Andrea', instagram: 'paulablancoc' },
  { name: 'Marjorie Andrea', instagram: 'mabelladecoraciones' },
  { name: 'Andres Ulloa', instagram: 'imprentahys' },
  { name: 'Monica Ivonne', instagram: 'chic_detalles.cl' },
  { name: 'Daniel Andres', instagram: 'cordonbleu.cl' },
  { name: 'Yessica Silva', instagram: 'douceuratelier.cl' },
  { name: 'Ema Andrea', instagram: 'colegiomargaritanazareth' },
  { name: 'Veronica Pilar', instagram: 'lalocadekefir' },
  { name: 'Luciano', instagram: 'palaciode_lasmascotas' },
  { name: 'Yolanda Eugenia', instagram: 'pasteleriayoli' },
  { name: 'Carolina Valenzuela', instagram: 'frutinola.cl' },
  { name: 'Valeria Bahamonde', instagram: 'tamarita.tienda' },
  { name: 'Alejandra Ivette', instagram: 'naturamiel.cl' },
  { name: 'Jessica Diaz', instagram: 'lapuertadelsaboroficial' },
  { name: 'Claudio Alarcon', instagram: 'claudioalarcon.oratoria' },
  { name: 'Priscilla Montecinos', instagram: 'priscilla_montecinos' },
  { name: 'Luis Hernandez', instagram: 'luishernandez.arquitecto' },
  { name: 'Ximena Torres', instagram: 'xime_torres_coach' },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'avatars');

// Crear directorio si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('📁 Directorio avatars creado');
}

// Función para descargar una imagen
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Si ya existe, saltar
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  ${filename} ya existe, saltando...`);
      resolve(true);
      return;
    }

    console.log(`📥 Descargando ${filename}...`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Seguir redirecciones
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ ${filename} descargado`);
            resolve(true);
          });
        }).on('error', (err) => {
          fs.unlink(filepath, () => {});
          console.log(`❌ Error con ${filename}: ${err.message}`);
          resolve(false);
        });
        return;
      }
      
      if (response.statusCode !== 200) {
        console.log(`⚠️  ${filename} - Status ${response.statusCode}, usando fallback`);
        resolve(false);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ ${filename} descargado`);
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.log(`❌ Error con ${filename}: ${err.message}`);
      resolve(false);
    });
  });
}

// Función principal
async function main() {
  console.log('\n🚀 Iniciando descarga de avatares de Instagram...\n');
  console.log(`📊 Total de usuarios: ${USERS_WITH_INSTAGRAM.length}\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const user of USERS_WITH_INSTAGRAM) {
    const url = `https://unavatar.io/instagram/${user.instagram}`;
    const filename = `${user.instagram}.jpg`;
    
    const result = await downloadImage(url, filename);
    if (result) success++;
    else failed++;
    
    // Esperar 1 segundo entre descargas para no saturar
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n========================================');
  console.log(`✅ Descargados: ${success}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log('========================================\n');
  
  console.log('💡 Para usar las fotos locales, actualiza getAvatarUrl() en realUsersData.ts:');
  console.log('   return `/avatars/${handle}.jpg`;');
}

main();
