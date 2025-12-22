
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../tribu-impulsa-firebase-adminsdk-fbsvc-a7e06878d7.json'));

const USERS = [
    { email: 'dafnafinkelstein@gmail.com', password: 'TRIBU2026', name: 'Dafna Finkelstein' },
    { email: 'doraluz@terraflorpaisajismo.cl', password: 'TRIBU2026', name: 'Doraluz' },
    { email: 'guille@elevatecreativo.com', password: 'TRIBU2026', name: 'Guillermo' }
];

async function main() {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin inicializado');

        for (const u of USERS) {
            try {
                const userRecord = await admin.auth().getUserByEmail(u.email);
                console.log(`✅ ${u.email} existe. Reseteando password...`);
                await admin.auth().updateUser(userRecord.uid, { password: u.password });
                console.log(`🔄 Password actualizada.`);
            } catch (err) {
                if (err.code === 'auth/user-not-found') {
                    console.log(`⚠️ ${u.email} no existe. Creando...`);
                    await admin.auth().createUser({
                        email: u.email,
                        password: u.password,
                        displayName: u.name,
                        emailVerified: true
                    });
                    console.log(`✨ Creado.`);
                } else {
                    console.error(`❌ Error con ${u.email}:`, err.message);
                }
            }
        }
    } catch (error) {
        console.error('Fatal:', error);
    }
}

main();
