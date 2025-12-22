/**
 * Script para sincronizar el contador de perfiles en system_stats
 * con el número real de usuarios en Firestore
 * 
 * Uso: node scripts/sync-profile-count.cjs
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
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

    // Contar solo usuarios con perfil "completo" (según nuevos requisitos)
    const MIN_BIO_LENGTH = 50;
    const MIN_BUSINESS_DESC_LENGTH = 60;
    
    let completeProfiles = 0;
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Validación completa según App.tsx
      const hasChannel = Boolean(data.instagram?.trim() || data.website?.trim());
      const isComplete = Boolean(
        data.name?.trim() &&
        data.companyName?.trim() &&
        data.category?.trim() &&
        data.affinity?.trim() &&
        data.scope &&
        (data.phone?.trim() || data.whatsapp?.trim()) &&
        data.city?.trim() &&
        data.bio?.trim() && data.bio.trim().length >= MIN_BIO_LENGTH &&
        data.businessDescription?.trim() && data.businessDescription.trim().length >= MIN_BUSINESS_DESC_LENGTH &&
        hasChannel &&
        data.revenue?.trim() &&
        (data.scope === 'LOCAL' ? Boolean(data.comuna?.trim()) : true) &&
        (data.scope === 'REGIONAL' ? Boolean(Array.isArray(data.selectedRegions) && data.selectedRegions.length > 0) : true) &&
        data.avatarUrl?.trim() &&
        data.status === 'active' &&
        data.onboardingComplete &&
        data.termsAccepted !== false
      );
      
      if (isComplete) {
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

