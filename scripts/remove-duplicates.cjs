/**
 * Script para eliminar usuarios duplicados
 * Mantiene solo 1 registro por email
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function removeDuplicates() {
  console.log('🧹 Eliminando duplicados...\n');

  const usersSnapshot = await db.collection('users').get();
  console.log(`📊 Usuarios actuales: ${usersSnapshot.size}\n`);

  const seenEmails = new Map(); // email -> docId del que mantenemos
  const toDelete = [];

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const email = (data.email || '').toLowerCase().trim();
    
    if (!email) {
      toDelete.push({ id: doc.id, reason: 'sin email' });
      continue;
    }

    if (seenEmails.has(email)) {
      // Ya tenemos este email, eliminar duplicado
      toDelete.push({ id: doc.id, email, reason: 'duplicado' });
    } else {
      // Primera vez que vemos este email, mantener
      seenEmails.set(email, doc.id);
    }
  }

  console.log(`\n🔍 Duplicados encontrados: ${toDelete.length}`);
  
  // Eliminar duplicados
  for (const item of toDelete) {
    console.log(`🗑️  Eliminando: ${item.id} (${item.reason}) ${item.email || ''}`);
    await db.collection('users').doc(item.id).delete();
  }

  // Contar usuarios finales
  const finalSnapshot = await db.collection('users').get();
  const finalCount = finalSnapshot.size;

  // Actualizar stats
  await db.collection('system_stats').doc('global').set({
    profilesCompleted: finalCount,
    membersActive: finalCount,
    profilesTarget: 1000,
    lastCleanAt: new Date().toISOString()
  }, { merge: true });

  console.log(`\n✅ Usuarios finales: ${finalCount}`);
  console.log('\n👥 Lista final:');
  
  finalSnapshot.docs.forEach((doc, i) => {
    const d = doc.data();
    console.log(`   ${i + 1}. ${d.name || '(sin nombre)'} - ${d.email}`);
  });

  process.exit(0);
}

removeDuplicates().catch(console.error);

