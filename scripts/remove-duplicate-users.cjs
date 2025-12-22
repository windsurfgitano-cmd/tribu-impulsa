/**
 * Script para eliminar usuarios duplicados (mismo email, diferentes IDs)
 * Mantiene solo el usuario más reciente por email
 * 
 * Uso: node scripts/remove-duplicate-users.cjs --confirm
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function removeDuplicates() {
  console.log('🔍 Buscando usuarios duplicados en Firebase...\n');
  
  const usersSnapshot = await db.collection('users').get();
  
  // Agrupar usuarios por email
  const usersByEmail = new Map();
  
  usersSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const email = (data.email || '').toLowerCase().trim();
    
    if (!email) return;
    
    if (!usersByEmail.has(email)) {
      usersByEmail.set(email, []);
    }
    
    usersByEmail.get(email).push({
      id: doc.id,
      email: data.email,
      name: data.name,
      company: data.companyName,
      createdAt: data.createdAt,
      data: data
    });
  });
  
  // Identificar duplicados
  const duplicates = [];
  const toDelete = [];
  
  for (const [email, users] of usersByEmail.entries()) {
    if (users.length > 1) {
      duplicates.push({ email, count: users.length, users });
      
      // Ordenar por fecha de creación (más reciente primero)
      users.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Más reciente primero
      });
      
      // Mantener el primero (más reciente), eliminar el resto
      const [keep, ...remove] = users;
      toDelete.push(...remove);
      
      console.log(`📧 ${email}:`);
      console.log(`   ✅ MANTENER: ${keep.company || keep.name} (ID: ${keep.id})`);
      remove.forEach(user => {
        console.log(`   ❌ ELIMINAR: ${user.company || user.name} (ID: ${user.id})`);
      });
      console.log('');
    }
  }
  
  if (duplicates.length === 0) {
    console.log('✅ No se encontraron usuarios duplicados. Todo está limpio.');
    process.exit(0);
  }
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`   Emails únicos con duplicados: ${duplicates.length}`);
  console.log(`   Usuarios a eliminar: ${toDelete.length}`);
  
  // Verificar confirmación
  const autoConfirm = process.argv.includes('--confirm');
  
  if (!autoConfirm) {
    console.log('\n⚠️  Para ejecutar la eliminación, usa: node scripts/remove-duplicate-users.cjs --confirm');
    process.exit(0);
  }
  
  console.log('\n🔥 Eliminando duplicados...\n');
  
  // Eliminar duplicados
  for (const user of toDelete) {
    await db.collection('users').doc(user.id).delete();
    console.log(`   ✅ Eliminado: ${user.company || user.name} (${user.id})`);
  }
  
  console.log(`\n✅ Eliminación completada: ${toDelete.length} usuarios duplicados eliminados`);
  
  // Actualizar contador
  const remainingUsers = usersSnapshot.size - toDelete.length;
  console.log(`\n🔄 Actualizando contador: ${remainingUsers} usuarios restantes`);
  
  const statsRef = db.collection('system_stats').doc('global');
  await statsRef.update({
    membersActive: remainingUsers,
    lastCleanupAt: new Date().toISOString()
  });
  
  console.log('✅ Contador actualizado en system_stats');
  console.log('\n✅ Limpieza de duplicados completada exitosamente.');
  
  process.exit(0);
}

removeDuplicates().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

