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

type ProfileValidation = {
  isComplete: boolean;
  missingFields: string[];
  completionPercent: number;
};

const BASE_PROFILE_REQUIREMENTS = [
  'Nombre',
  'Nombre de tu emprendimiento',
  'Giro / Rubro',
  'Afinidad / Intereses',
  'Alcance geográfico',
  'Teléfono / WhatsApp',
  'Ciudad',
  'Biografía (mín. 50 caracteres)',
  'Descripción del negocio (mín. 60 caracteres)',
  'Canal principal (Instagram / sitio / otro)',
  'Facturación mensual',
  'Foto o avatar del perfil',
  'Aceptar términos y condiciones',
  'Onboarding completado',
  'Estado de cuenta activo'
];

const MIN_BIO_LENGTH = 50;
const MIN_BUSINESS_DESC_LENGTH = 60;

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    return JSON.parse(raw);
  }
  return require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');
}

function validateUserProfile(user: Record<string, any> | null): ProfileValidation {
  if (!user) {
    return { isComplete: false, missingFields: BASE_PROFILE_REQUIREMENTS, completionPercent: 0 };
  }

  const hasChannel = Boolean(
    user.instagram?.trim() ||
    user.website?.trim() ||
    user.otherChannel?.trim()
  );

  const validationChecks = [
    { valid: Boolean(user.name?.trim()), label: 'Nombre' },
    { valid: Boolean(user.companyName?.trim()), label: 'Nombre de tu emprendimiento' },
    { valid: Boolean(user.category?.trim()), label: 'Giro / Rubro' },
    { valid: Boolean(user.affinity?.trim()), label: 'Afinidad / Intereses' },
    { valid: Boolean(user.scope), label: 'Alcance geográfico' },
    { valid: Boolean(user.phone?.trim() || user.whatsapp?.trim()), label: 'Teléfono / WhatsApp' },
    { valid: Boolean(user.city?.trim()), label: 'Ciudad' },
    { valid: Boolean(user.bio?.trim() && user.bio.trim().length >= MIN_BIO_LENGTH), label: 'Biografía (mín. 50 caracteres)' },
    { valid: Boolean(user.businessDescription?.trim() && user.businessDescription.trim().length >= MIN_BUSINESS_DESC_LENGTH), label: 'Descripción del negocio (mín. 60 caracteres)' },
    { valid: hasChannel, label: 'Canal principal (Instagram / sitio / otro)' },
    { valid: Boolean(user.revenue?.trim()), label: 'Facturación mensual' },
    {
      valid: user.scope === 'LOCAL' ? Boolean(user.comuna?.trim()) : true,
      label: 'Comuna (requerida para alcance LOCAL)'
    },
    {
      valid: user.scope === 'REGIONAL' ? Boolean(Array.isArray(user.selectedRegions) && user.selectedRegions.length > 0) : true,
      label: 'Regiones (requeridas para alcance REGIONAL)'
    },
    { valid: Boolean(user.avatarUrl?.trim()), label: 'Foto o avatar del perfil' },
    { valid: user.status === 'active', label: 'Estado de cuenta activo' },
    { valid: Boolean(user.onboardingComplete), label: 'Onboarding completado' },
    { valid: user.termsAccepted !== false, label: 'Aceptar términos y condiciones' }
  ];

  const missingFields = validationChecks
    .filter(check => !check.valid)
    .map(check => check.label);

  const completionPercent = Math.round(
    ((validationChecks.length - missingFields.length) / validationChecks.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercent
  };
}

async function run(): Promise<void> {
  initializeApp({
    credential: cert(getServiceAccount())
  });

  const db = getFirestore();
  const snapshot = await db.collection('users').get();

  if (snapshot.empty) {
    console.log('⚠️ No hay usuarios en Firestore.');
    return;
  }

  const report: Array<{
    id: string;
    email: string;
    name: string;
    companyName: string;
    validation: ProfileValidation;
  }> = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const validation = validateUserProfile(data);
    report.push({
      id: doc.id,
      email: data.email || '',
      name: data.name || '',
      companyName: data.companyName || '',
      validation
    });
  });

  const complete = report.filter(r => r.validation.isComplete);
  const incomplete = report.filter(r => !r.validation.isComplete);

  console.log('==============================');
  console.log('📋 PERFIL COMPLETION REPORT');
  console.log('==============================');
  console.log(`Total usuarios: ${report.length}`);
  console.log(`Completos: ${complete.length}`);
  console.log(`Incompletos: ${incomplete.length}`);
  console.log('------------------------------');

  console.log('✅ COMPLETOS:');
  complete.forEach(user => {
    console.log(`• ${user.name} (${user.email}) — ${user.companyName} | 100%`);
  });

  console.log('------------------------------');
  console.log('⚠️ INCOMPLETOS:');
  incomplete.forEach(user => {
    console.log(`• ${user.name} (${user.email}) — ${user.companyName} | ${user.validation.completionPercent}%`);
    console.log(`  Missing: ${user.validation.missingFields.join(', ')}`);
  });
}

run().catch(err => {
  console.error('❌ Error ejecutando check:', err);
  process.exit(1);
});
