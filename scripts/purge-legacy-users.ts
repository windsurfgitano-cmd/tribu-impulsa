import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ALLOWED_USER_IDS = new Set([
  'admin_dafna',
  'admin_doraluz',
  'admin_guillermo'
]);

const ALLOWED_EMAILS = new Set([
  'dafnafinkelstein@gmail.com',
  'doraluz@terraflorpaisajismo.cl',
  'guille@elevatecreativo.com'
]);

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    return JSON.parse(raw);
  }
  return require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
}

async function purgeCollection(collectionName: string, allowedIds: Set<string>): Promise<number> {
  const db = getFirestore();
  const snapshot = await db.collection(collectionName).get();
  let deleted = 0;

  if (snapshot.empty) {
    console.log(`📭 Colección ${collectionName} vacía`);
    return deleted;
  }

  for (const doc of snapshot.docs) {
    if (!allowedIds.has(doc.id)) {
      await doc.ref.delete();
      deleted++;
    }
  }

  console.log(`🧹 ${collectionName}: eliminados ${deleted} documentos legacy`);
  return deleted;
}

async function purgeUsers(): Promise<void> {
  initializeApp({
    credential: cert(getServiceAccount())
  });

  const db = getFirestore();
  const usersSnapshot = await db.collection('users').get();
  let deletedUsers = 0;

  if (!usersSnapshot.empty) {
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const email = (data.email || '').toLowerCase();

      if (!ALLOWED_USER_IDS.has(doc.id) && !ALLOWED_EMAILS.has(email)) {
        await doc.ref.delete();
        deletedUsers++;
      }
    }
  }

  console.log(`🧹 Users: eliminados ${deletedUsers} legacy`);

  // Purge linked collections (memberships etc.)
  await purgeCollection('memberships', ALLOWED_USER_IDS);
  await purgeCollection('profiles', ALLOWED_USER_IDS);
  await purgeCollection('notifications', new Set()); // remove all legacy notifications
  await purgeCollection('assignments', new Set());
}

purgeUsers()
  .then(() => {
    console.log('✅ Purga completada.');
  })
  .catch(err => {
    console.error('❌ Error en purga:', err);
    process.exit(1);
  });
