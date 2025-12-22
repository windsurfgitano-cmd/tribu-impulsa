const admin = require('firebase-admin');
const serviceAccount = require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function auditUsers() {
  console.log('🔍 Auditando usuarios en Firestore...\n');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  console.log(`📊 Total de usuarios en DB: ${snapshot.size}\n`);
  console.log('='.repeat(70));
  
  const usersList = [];
  
  for (const doc of snapshot.docs) {
    const user = doc.data();
    usersList.push({
      id: doc.id,
      email: user.email || '(sin email)',
      name: user.name || '(sin nombre)',
      company: user.companyName || '(sin empresa)',
      status: user.status || '(sin status)',
      profileComplete: user.profileComplete || false,
      createdAt: user.createdAt || '(sin fecha)'
    });
  }
  
  // Ordenar por fecha de creación
  usersList.sort((a, b) => {
    if (a.createdAt === '(sin fecha)') return 1;
    if (b.createdAt === '(sin fecha)') return -1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  
  // Mostrar listado completo
  console.log('\n📋 LISTADO COMPLETO DE USUARIOS:\n');
  usersList.forEach((user, index) => {
    console.log(`${index + 1}. ${user.profileComplete ? '✅' : '⚠️ '} ${user.company}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Creado: ${user.createdAt}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  // Estadísticas
  const completos = usersList.filter(u => u.profileComplete).length;
  const incompletos = usersList.length - completos;
  
  console.log('\n📊 ESTADÍSTICAS:');
  console.log(`   Total: ${usersList.length}`);
  console.log(`   Perfiles completos: ${completos}`);
  console.log(`   Perfiles incompletos: ${incompletos}`);
  
  // Verificar contador en system_stats
  const statsRef = db.collection('system_stats').doc('global');
  const statsDoc = await statsRef.get();
  
  if (statsDoc.exists) {
    const stats = statsDoc.data();
    console.log(`\n🎯 CONTADOR EN SYSTEM_STATS:`);
    console.log(`   profilesCompleted: ${stats.profilesCompleted}`);
    console.log(`   membersActive: ${stats.membersActive}`);
    
    if (stats.profilesCompleted !== completos) {
      console.log(`\n⚠️  DESINCRONIZACIÓN DETECTADA:`);
      console.log(`   En users: ${completos} completos`);
      console.log(`   En system_stats: ${stats.profilesCompleted}`);
      console.log(`\n💡 Para corregir, ejecuta: node scripts/sync-profile-count.cjs`);
    } else {
      console.log(`\n✅ Contador sincronizado correctamente`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n💡 NOTA: Este script NO elimina nada. Solo muestra información.');
  console.log('   Si deseas eliminar usuarios específicos, hazlo manualmente desde');
  console.log('   Firebase Console o crea un script específico.\n');
}

auditUsers().catch(console.error);

