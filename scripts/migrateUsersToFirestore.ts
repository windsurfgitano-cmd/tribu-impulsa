
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { REAL_USERS } from './tempData.ts';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : require('../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrateUsers() {
    console.log(`🚀 Starting migration of ${REAL_USERS.length} users...`);
    let created = 0;
    let skipped = 0;
    let errors = 0;

    let index = 0;
    for (const rawUser of REAL_USERS) {
        index++;
        // Generate ID if missing (same logic as original app)
        const userId = (rawUser as any).id || `real_user_${index}`;

        try {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();

            if (!doc.exists) {
                // Create user
                await userRef.set({
                    ...rawUser,
                    id: userId, // Ensure ID is saved in the doc
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    migratedFrom: 'hardcoded_v1'
                });
                console.log(`✅ Created: ${rawUser.name} (${rawUser.email})`);
                created++;
            } else {
                console.log(`⏭️ Skipped (Exists): ${rawUser.name}`);
                skipped++;
            }
        } catch (error) {
            console.error(`❌ Error migrating ${rawUser.email}:`, error);
            errors++;
        }
    }

    console.log('\n===================================');
    console.log('🏁 Migration Complete');
    console.log(`✨ Created: ${created}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`❌ Errors:  ${errors}`);
    console.log('===================================');
}

migrateUsers().catch(console.error);
