
import * as admin from 'firebase-admin';
import * as path from 'path';

// --- CONFIGURACIÓN ---
// Usamos path relativo al execution context
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service-account-key.json');

const USERS_TO_ENSURE = [
    { email: 'dafnafinkelstein@gmail.com', password: 'TRIBU2026', name: 'Dafna Finkelstein' },
    { email: 'doraluz@terraflorpaisajismo.cl', password: 'TRIBU2026', name: 'Doraluz' },
    { email: 'guille@elevatecreativo.com', password: 'TRIBU2026', name: 'Guillermo' }
];

async function ensureTestUsers() {
    try {
        // Inicializar Firebase Admin
        try {
            admin.initializeApp({
                credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH))
            });
        } catch (e: any) {
            if (!e.message.includes('already exists')) {
                throw e;
            }
        }

        console.log('🔍 Verificando usuarios de prueba en Firebase Auth...');

        for (const user of USERS_TO_ENSURE) {
            try {
                // Intentar obtener usuario
                const userRecord = await admin.auth().getUserByEmail(user.email);
                console.log(`✅ Usuario existente: ${user.email} (${userRecord.uid})`);

                // Opcional: Resetear password para asegurar que funcione
                await admin.auth().updateUser(userRecord.uid, {
                    password: user.password
                });
                console.log(`   🔄 Password reseteada a ${user.password}`);

            } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                    // Crear usuario si no existe
                    console.log(`⚠️ Usuario NO encontrado: ${user.email}. Creando...`);
                    const newUser = await admin.auth().createUser({
                        email: user.email,
                        password: user.password,
                        displayName: user.name,
                        emailVerified: true
                    });
                    console.log(`✨ Usuario creado exitosamente: ${newUser.uid}`);
                } else {
                    console.error(`❌ Error verificando ${user.email}:`, error.message);
                }
            }
        }

        console.log('🎉 Verificación completa. Ahora puedes loguearte.');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

ensureTestUsers();
