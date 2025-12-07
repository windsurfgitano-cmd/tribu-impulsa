/**
 * Script para generar iconos PWA desde Logo-Tribu_.png
 * 
 * Requisitos:
 * npm install sharp
 * 
 * Uso:
 * node scripts/generateIcons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_LOGO = path.join(__dirname, '..', 'LogoTribuImpulsa.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

const ICON_SIZES = [
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
  // Apple touch icons
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
];

async function generateIcons() {
  console.log('🎨 Generando iconos PWA desde tribulogo.PNG...\n');

  // Verificar que existe el logo
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error('❌ Error: No se encontró tribulogo.PNG');
    console.log('   Ubicación esperada:', SOURCE_LOGO);
    process.exit(1);
  }

  // Crear directorio si no existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generar cada tamaño
  for (const icon of ICON_SIZES) {
    try {
      await sharp(SOURCE_LOGO)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(OUTPUT_DIR, icon.name));
      
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Error generando ${icon.name}:`, error.message);
    }
  }

  // Generar favicon.ico (16x16 y 32x32)
  try {
    await sharp(SOURCE_LOGO)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, '..', 'favicon.png'));
    console.log('✅ favicon.png (32x32)');
  } catch (error) {
    console.error('❌ Error generando favicon:', error.message);
  }

  console.log('\n🎉 ¡Iconos generados exitosamente!');
  console.log('📁 Ubicación:', OUTPUT_DIR);
  console.log('\n📝 Próximos pasos:');
  console.log('1. Los iconos están en public/icons/');
  console.log('2. El manifest.json ya está configurado');
  console.log('3. Hacer deploy con HTTPS para probar PWA');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };
