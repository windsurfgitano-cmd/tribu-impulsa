/**
 * Script para LIMPIAR Firebase y dejar solo los usuarios reales
 * ADVERTENCIA: Este script ELIMINA usuarios permanentemente
 * 
 * Uso: node scripts/clean-firebase-users.cjs
 */

const admin = require('firebase-admin');
const path = require('path');
const readline = require('readline');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// USUARIOS REALES QUE SE DEBEN MANTENER (los 9 últimos creados + admin)
const USUARIOS_A_MANTENER = [
  'doraluz@terraflorpaisajismo.cl',
  'admin@tribuimpulsa.cl',
  'dafnafinkelstein@gmail.com',
  'guille@elevatecreativo.com',
  'qa_dummy@tribuimpulsa.cl',
  'ergoguillermogarcia@gmail.com',
  'rincondeoz@gmail.com',
  'chileimpresiones3d@gmail.com',
  'windsurfgitano@gmail.com'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function limpiarFirebase() {
  console.log('🧹 LIMPIEZA DE FIREBASE - ELIMINACIÓN MASIVA DE USUARIOS\n');
  console.log('⚠️  ADVERTENCIA: Este script eliminará PERMANENTEMENTE todos los usuarios');
  console.log('    que NO estén en la lista de usuarios a mantener.\n');
  
  console.log('📋 Usuarios que SE MANTENDRÁN:');
  USUARIOS_A_MANTENER.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email}`);
  });
  
  // Contar usuarios actuales
  const usersSnapshot = await db.collection('users').get();
  const totalUsuarios = usersSnapshot.size;
  
  // Identificar usuarios a eliminar
  const usuariosAEliminar = [];
  const usuariosAMantener = [];
  
  usersSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const email = (data.email || '').toLowerCase();
    
    if (USUARIOS_A_MANTENER.includes(email)) {
      usuariosAMantener.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        company: data.companyName
      });
    } else {
      usuariosAEliminar.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        company: data.companyName
      });
    }
  });
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total de usuarios en Firebase: ${totalUsuarios}`);
  console.log(`   ✅ Usuarios a mantener: ${usuariosAMantener.length}`);
  console.log(`   ❌ Usuarios a ELIMINAR: ${usuariosAEliminar.length}`);
  
  if (usuariosAEliminar.length === 0) {
    console.log('\n✅ No hay usuarios para eliminar. Firebase ya está limpio.');
    try { rl.close(); } catch (e) {}
    process.exit(0);
  }
  
  console.log(`\n🗑️  USUARIOS QUE SERÁN ELIMINADOS (primeros 10):`);
  usuariosAEliminar.slice(0, 10).forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.company || user.name} - ${user.email}`);
  });
  
  if (usuariosAEliminar.length > 10) {
    console.log(`   ... y ${usuariosAEliminar.length - 10} más`);
  }
  
  console.log('\n⚠️  Esta acción NO se puede deshacer.\n');
  
  // Verificar si se pasó el argumento --confirm
  const autoConfirm = process.argv.includes('--confirm');
  
  if (!autoConfirm) {
    const respuesta = await pregunta('¿Estás SEGURO de que quieres continuar? (escribe "SI ELIMINAR" para confirmar): ');
    
    if (respuesta.trim() !== 'SI ELIMINAR') {
      console.log('\n❌ Operación cancelada. No se eliminó ningún usuario.');
      try { rl.close(); } catch (e) {}
      process.exit(0);
    }
  } else {
    console.log('✅ Confirmación automática recibida (--confirm). Procediendo...');
  }
  
  rl.close(); // Cerrar readline antes de continuar
  
  console.log('\n🔥 Iniciando eliminación...\n');
  
  let eliminados = 0;
  const batch = db.batch();
  
  for (const user of usuariosAEliminar) {
    const userRef = db.collection('users').doc(user.id);
    batch.delete(userRef);
    eliminados++;
    
    // Firestore batch tiene límite de 500 operaciones
    if (eliminados % 500 === 0) {
      await batch.commit();
      console.log(`   Eliminados: ${eliminados}/${usuariosAEliminar.length}`);
    }
  }
  
  // Commit final para operaciones restantes
  if (eliminados % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`\n✅ Eliminación completada: ${eliminados} usuarios eliminados`);
  
  // Actualizar contador
  console.log('\n🔄 Actualizando contador en system_stats...');
  const statsRef = db.collection('system_stats').doc('global');
  await statsRef.update({
    profilesCompleted: usuariosAMantener.length,
    membersActive: usuariosAMantener.length,
    lastCleanupAt: new Date().toISOString()
  });
  
  console.log(`✅ Contador actualizado: ${usuariosAMantener.length}/1000 perfiles`);
  
  console.log('\n📋 Usuarios que permanecen en Firebase:');
  usuariosAMantener.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.company || user.name} - ${user.email}`);
  });
  
  console.log('\n✅ Limpieza completada exitosamente.');
  
  process.exit(0);
}

limpiarFirebase().catch(error => {
  console.error('❌ Error durante la limpieza:', error);
  process.exit(1);
});

