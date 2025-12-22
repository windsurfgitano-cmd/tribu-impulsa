import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DUMMY_USER_ID = 'qa_dummy_user';

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    return JSON.parse(raw);
  }
  return require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
}

async function run(): Promise<void> {
  initializeApp({
    credential: cert(getServiceAccount())
  });

  const db = getFirestore();
  const now = Timestamp.now();

  const dummyData = {
    email: 'qa_dummy@tribuimpulsa.cl',
    name: 'QA Dummy',
    companyName: 'QA Tribu Labs',
    instagram: '@qa.tribu',
    website: 'https://qa.tribuimpulsa.cl',
    phone: '+56970000000',
    whatsapp: '+56970000000',
    category: 'Servicios Profesionales',
    affinity: 'Negocios',
    scope: 'NACIONAL' as const,
    city: 'Santiago',
    bio: 'Perfil de prueba para validar flujos de sincronización.',
    businessDescription: 'Este perfil se usa para QA de la sincronización entre localStorage y Firestore.',
    avatarUrl: 'https://ui-avatars.com/api/?name=QA+Dummy&background=2563eb&color=fff&size=200',
    revenue: '',
    status: 'pending',
    onboardingComplete: false,
    termsAccepted: false,
    profileComplete: false,
    createdAt: now
  };

  await db.collection('users').doc(DUMMY_USER_ID).set(dummyData, { merge: true });

  await db.collection('memberships').doc(DUMMY_USER_ID).set({
    userId: DUMMY_USER_ID,
    status: 'trial',
    membershipType: 'trial_free',
    activatedAt: now,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    source: 'qa_script'
  });

  console.log(`✅ Usuario dummy creado: ${dummyData.email}`);
}

run().catch(err => {
  console.error('❌ Error creando dummy:', err);
  process.exit(1);
});
