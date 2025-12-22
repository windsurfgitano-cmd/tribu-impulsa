import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { promises as fsPromises, existsSync, mkdirSync } from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

type CliOptions = {
  backup: boolean;
  backupDir: string;
  seed: boolean;
  force: boolean;
  dryRun: boolean;
};

const DEFAULT_OPTIONS: CliOptions = {
  backup: false,
  backupDir: path.resolve(__dirname, '../backups'),
  seed: false,
  force: false,
  dryRun: false
};

const BASE_COLLECTIONS = [
  'users',
  'memberships',
  'notifications',
  'payment_history',
  'assignments',
  'reports',
  'system_stats',
  'config'
];

const EXTRA_COLLECTIONS = [
  'profiles',
  'pending_subscriptions',
  'pending_payments'
];

const COLLECTIONS_TO_RESET = [...new Set([...BASE_COLLECTIONS, ...EXTRA_COLLECTIONS])];

type AdminSeedUser = {
  id: string;
  email: string;
  name: string;
  companyName: string;
  instagram: string;
  website: string;
  phone: string;
  whatsapp: string;
  category: string;
  affinity: string;
  scope: 'LOCAL' | 'REGIONAL' | 'NACIONAL';
  city: string;
  comuna?: string;
  selectedRegions?: string[];
  revenue: string;
  bio: string;
  businessDescription: string;
  avatarUrl: string;
  companyLogoUrl: string;
  coverUrl?: string;
  followers: number;
};

const ADMIN_SEED_USERS: AdminSeedUser[] = [
  {
    id: 'admin_guillermo',
    email: 'guille@elevatecreativo.com',
    name: 'Guillermo García',
    companyName: 'Elevate Agencia de Marketing',
    instagram: '@elevate.agencia',
    website: 'https://elevatecreativo.com',
    phone: '+56979777906',
    whatsapp: '+56979777906',
    category: 'Marketing Digital',
    affinity: 'Negocios',
    scope: 'NACIONAL',
    city: 'Santiago',
    selectedRegions: ['metropolitana'],
    revenue: 'Más de 5MM',
    bio: 'Fundador de Elevate y coach comercial para pymes chilenas. Acompaño equipos para ordenar su embudo, profesionalizar campañas y mantener métricas vivas semana a semana. Me enfoco en tácticas simples con accountability brutalmente honesto.',
    businessDescription: 'Elevate Agencia crea planes comerciales integrados que combinan marketing digital, prospección asistida y optimización de funnels. Diagnosticamos procesos, definimos indicadores accionables y nos metemos en la operación hasta que el equipo pueda sostener el crecimiento sin depender de agencias externas.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Guillermo+Garcia&background=1F2937&color=fff&size=200',
    companyLogoUrl: 'https://ui-avatars.com/api/?name=Elevate&background=0EA5E9&color=fff&size=200',
    coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
    followers: 5200
  },
  {
    id: 'admin_doraluz',
    email: 'doraluz@terraflorpaisajismo.cl',
    name: 'Doraluz Galleguillos',
    companyName: 'Terraflor Paisajismo',
    instagram: '@terraflorpaisajismochile',
    website: 'https://www.terraflorpaisajismo.cl',
    phone: '+56976160566',
    whatsapp: '+56976160566',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    scope: 'REGIONAL',
    city: 'Santiago',
    comuna: 'Peñalolén',
    selectedRegions: ['metropolitana', 'valparaiso', 'biobio'],
    revenue: 'Más de 10MM',
    bio: 'Arquitecta paisajista con 15 años diseñando jardines regenerativos para viviendas, oficinas y hoteles en Chile. Lidero un equipo que combina botánica, riego eficiente y storytelling vegetal para que cada proyecto tenga identidad propia y fácil mantención.',
    businessDescription: 'Terraflor diseña, construye y mantiene paisajes inteligentes que ahorran agua y elevan la experiencia de los espacios. Co-creamos con inmobiliarias y pymes un masterplan verde, coordinamos proveedores, ejecutamos en obra y formamos al equipo del cliente para que el jardín siga vivo durante todo el año.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Doraluz+Galleguillos&background=065F46&color=fff&size=200',
    companyLogoUrl: 'https://ui-avatars.com/api/?name=Terraflor&background=F97316&color=fff&size=200',
    coverUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
    followers: 4800
  },
  {
    id: 'admin_dafna',
    email: 'dafnafinkelstein@gmail.com',
    name: 'Dafna Finkelstein',
    companyName: 'By Turquía',
    instagram: '@byturquia',
    website: 'https://www.byturquia.com',
    phone: '+56992767707',
    whatsapp: '+56992767707',
    category: 'Joyería y Accesorios',
    affinity: 'Moda y Estilo',
    scope: 'NACIONAL',
    city: 'Las Condes',
    comuna: 'Las Condes',
    selectedRegions: ['metropolitana'],
    revenue: 'Más de 15MM',
    bio: 'Fundadora de By Turquía, marca de joyería consciente que trabaja con plata 925 bañada en oro y piedras seleccionadas en Estambul. Lidero el abastecimiento, la estrategia digital y el mentoring de emprendedoras que ingresan a retail por primera vez.',
    businessDescription: 'By Turquía diseña colecciones cápsula con tirajes pequeños, control de calidad en origen y foco en experiencia omnicanal. Operamos showroom, e-commerce y pop-ups; además documentamos procesos para enseñar a otras marcas a importar, costear y escalar sin perder márgenes.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Dafna+Finkelstein&background=7C3AED&color=fff&size=200',
    companyLogoUrl: 'https://ui-avatars.com/api/?name=By+Turquia&background=FBBF24&color=111827&size=200',
    coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
    followers: 10200
  }
];

const SYSTEM_DEFAULTS = {
  app: {
    membershipPrice: 19990,
    supportWhatsapp: '+56900000000',
    trialEnabled: true,
    matchingThreshold: 1000,
    updatedAt: Timestamp.now()
  },
  admin: {
    contactEmail: 'admin@tribuimpulsa.cl',
    notes: 'Semilla mínima post reset',
    updatedAt: Timestamp.now()
  },
  system: {
    features: {
      aiMatchingEnabled: false,
      pushNotificationsEnabled: true
    },
    progress: {
      requiredCompleteProfiles: 1000,
      announcementInterval: 50
    },
    updatedAt: Timestamp.now()
  }
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { ...DEFAULT_OPTIONS };

  argv.forEach(arg => {
    if (arg === '--backup') options.backup = true;
    if (arg === '--seed') options.seed = true;
    if (arg === '--force') options.force = true;
    if (arg === '--dry-run') options.dryRun = true;

    if (arg.startsWith('--backupDir=')) {
      options.backupDir = path.resolve(arg.split('=')[1]);
    }
  });

  return options;
}

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    return JSON.parse(raw);
  }
  return require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
}

async function backupCollections(db: Firestore, dir: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const backupData: Record<string, unknown[]> = {};

  for (const collection of COLLECTIONS_TO_RESET) {
    const snapshot = await db.collection(collection).get();
    backupData[collection] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`📦 Copiada colección ${collection} (${backupData[collection].length} documentos)`);
  }

  const filePath = path.join(dir, `firestore-backup-${timestamp}.json`);
  const replacer = (_: string, value: unknown) => {
    if (value instanceof Timestamp) {
      return value.toDate().toISOString();
    }
    return value;
  };

  await fsPromises.writeFile(filePath, JSON.stringify(backupData, replacer, 2), 'utf-8');
  console.log(`✅ Backup guardado en ${filePath}`);
  return filePath;
}

async function deleteCollection(db: Firestore, collectionPath: string, batchSize = 300): Promise<number> {
  let deleted = 0;

  while (true) {
    const snapshot = await db.collection(collectionPath).limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    deleted += snapshot.size;
    console.log(`🗑️  Eliminados ${snapshot.size} docs de ${collectionPath} (acumulado ${deleted})`);
  }

  return deleted;
}

async function wipeCollections(db: Firestore, dryRun: boolean): Promise<void> {
  for (const collection of COLLECTIONS_TO_RESET) {
    if (dryRun) {
      const count = await db.collection(collection).count().get();
      console.log(`🔎 DRY RUN — ${collection}: ${count.data().count} docs`);
      continue;
    }
    await deleteCollection(db, collection);
  }
}

async function seedMinimalData(db: Firestore): Promise<void> {
  console.log('🌱 Sembrando admins Dafna + Doraluz + Guillermo...');
  const now = Timestamp.now();

  for (const admin of ADMIN_SEED_USERS) {
    await db.collection('users').doc(admin.id).set({
      ...admin,
      createdAt: now,
      updatedAt: now,
      firstLogin: false,
      role: 'admin',
      status: 'active',
      onboardingComplete: true,
      termsAccepted: true,
      profileComplete: true
    });

    await db.collection('memberships').doc(admin.id).set({
      userId: admin.id,
      status: 'admin',
      membershipType: 'lifetime_admin',
      activatedAt: now,
      expiresAt: null,
      source: 'seed_reset'
    });
  }

  await db.collection('system_stats').doc('global').set({
    profilesCompleted: ADMIN_SEED_USERS.length,
    membersActive: ADMIN_SEED_USERS.length,
    lastResetAt: now
  });

  await db.collection('config').doc('app').set(SYSTEM_DEFAULTS.app);
  await db.collection('config').doc('admin').set(SYSTEM_DEFAULTS.admin);
  await db.collection('config').doc('system').set(SYSTEM_DEFAULTS.system);

  console.log(`✅ Semilla creada con ${ADMIN_SEED_USERS.length} admins.`);
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.force) {
    console.error('⚠️ Debes ejecutar con --force para confirmar el reseteo.');
    process.exit(1);
  }

  const serviceAccount = getServiceAccount();
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  console.log('🚀 Iniciando reset de Firestore...');
  console.log(`   Colecciones: ${COLLECTIONS_TO_RESET.join(', ')}`);
  console.log(`   Backup: ${options.backup ? 'Sí' : 'No'}`);
  console.log(`   Seed: ${options.seed ? 'Sí' : 'No'}`);
  console.log(`   Dry run: ${options.dryRun ? 'Sí' : 'No'}`);

  if (options.backup) {
    await backupCollections(db, options.backupDir);
  }

  await wipeCollections(db, options.dryRun);

  if (!options.dryRun && options.seed) {
    await seedMinimalData(db);
  }

  console.log('🎉 Proceso finalizado.');
}

run().catch(error => {
  console.error('❌ Error ejecutando reset-firestore:', error);
  process.exit(1);
});
