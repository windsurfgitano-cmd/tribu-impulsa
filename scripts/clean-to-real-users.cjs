/**
 * Script para limpiar Firebase y dejar solo los usuarios reales
 * - 3 admins (Dafna, Doraluz, Guillermo)
 * - 1 QA dummy
 * - Usuarios nuevos creados recientemente
 * 
 * Uso: node scripts/clean-to-real-users.cjs
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Emails de usuarios que SÍ queremos mantener
const KEEP_EMAILS = [
  'dafnafinkelstein@gmail.com',      // Admin Dafna
  'doraluz@terraflorpaisajismo.cl',  // Admin Doraluz
  'guille@elevatecreativo.com',      // Admin Guillermo
  'ergoguillermogarcia@gmail.com',   // Guillermo alternativo
  'qa_dummy@tribuimpulsa.cl',        // QA Dummy
  'rincondeoz@gmail.com',            // Oscar (tú)
];

async function cleanUsers() {
  console.log('🧹 Limpiando usuarios legacy...\n');

  try {
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Usuarios actuales en Firebase: ${usersSnapshot.size}\n`);

    let deleted = 0;
    let kept = 0;
    const keptUsers = [];

    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const email = (data.email || '').toLowerCase();
      
      // Verificar si debemos mantener este usuario
      const shouldKeep = KEEP_EMAILS.some(e => email.includes(e.toLowerCase())) ||
                         email.includes('qa_dummy') ||
                         email.includes('tribuimpulsa.cl');

      if (shouldKeep) {
        kept++;
        keptUsers.push({ id: doc.id, name: data.name, email: data.email });
        console.log(`✅ MANTENER: ${data.name || '(sin nombre)'} - ${data.email}`);
      } else {
        // Eliminar usuario legacy
        await db.collection('users').doc(doc.id).delete();
        deleted++;
        console.log(`🗑️  ELIMINAR: ${data.name || '(sin nombre)'} - ${data.email}`);
      }
    }

    console.log(`\n========================================`);
    console.log(`📊 Resumen:`);
    console.log(`   - Usuarios eliminados: ${deleted}`);
    console.log(`   - Usuarios mantenidos: ${kept}`);
    console.log(`========================================\n`);

    // Actualizar contador
    const statsRef = db.collection('system_stats').doc('global');
    await statsRef.set({
      profilesCompleted: kept,
      membersActive: kept,
      profilesTarget: 1000,
      lastCleanAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Contador actualizado: ${kept}/1000 perfiles\n`);

    console.log('👥 Usuarios que permanecen:');
    keptUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.name} - ${u.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

cleanUsers();

