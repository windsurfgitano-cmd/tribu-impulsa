/**
 * Script para sincronizar el contador de perfiles en system_stats
 * con el número real de usuarios en Firestore
 * 
 * Uso: npx ts-node scripts/sync-profile-count.ts
 */

import * as admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function syncProfileCount() {
  console.log('🔄 Sincronizando contador de perfiles...\n');

  try {
    // Contar usuarios en Firestore
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Contar solo usuarios con perfil "completo" (tienen campos mínimos)
    let completeProfiles = 0;
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Verificar campos mínimos para considerar perfil completo
      if (data.name && data.email && data.category) {
        completeProfiles++;
      }
    });

    console.log(`📊 Usuarios totales en Firestore: ${totalUsers}`);
    console.log(`✅ Perfiles con datos mínimos: ${completeProfiles}`);

    // Actualizar system_stats
    const statsRef = db.collection('system_stats').doc('global');
    const statsDoc = await statsRef.get();

    const updateData = {
      profilesCompleted: completeProfiles,
      membersActive: totalUsers,
      profilesTarget: 1000,
      lastSyncAt: new Date().toISOString()
    };

    if (statsDoc.exists) {
      await statsRef.update(updateData);
      console.log('\n✅ system_stats/global actualizado');
    } else {
      await statsRef.set(updateData);
      console.log('\n✅ system_stats/global creado');
    }

    console.log(`\n📈 Nuevo valor: ${completeProfiles}/1000 perfiles`);

    // Mostrar lista de usuarios
    console.log('\n👥 Usuarios en Firestore:');
    usersSnapshot.docs.forEach((doc, i) => {
      const data = doc.data();
      const status = data.name && data.email && data.category ? '✅' : '⚠️';
      console.log(`   ${i + 1}. ${status} ${data.name || '(sin nombre)'} - ${data.email || '(sin email)'} - ${data.category || '(sin categoría)'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

syncProfileCount();
