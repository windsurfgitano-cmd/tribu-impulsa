
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function verify() {
    console.log('🔍 Verifying migration...');

    // Check first user
    const docRef = db.collection('users').doc('real_user_1');
    const doc = await docRef.get();

    if (doc.exists) {
        console.log('✅ User 1 found:');
        console.log(doc.data());
    } else {
        console.log('❌ User 1 NOT found.');
    }

    // Count total users
    const snapshot = await db.collection('users').count().get();
    console.log(`📊 Total users in 'users' collection: ${snapshot.data().count}`);
}

verify().catch(console.error);
