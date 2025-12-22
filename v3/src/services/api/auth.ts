
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import type { User, Auth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

// --- CONFIGURACIÓN CENTRALIZADA ---
const firebaseConfig = {
    apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
    authDomain: "tribu-impulsa.firebaseapp.com",
    projectId: "tribu-impulsa",
    storageBucket: "tribu-impulsa.firebasestorage.app",
    messagingSenderId: "348097115578",
    appId: "1:348097115578:web:115960bb81563050d01983"
};

// Singleton para la App de Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

export const auth: Auth = getAuth(app);

// --- SERVICIO DE AUTENTICACIÓN ---

export const AuthService = {
    // Login
    login: async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { user: userCredential.user, error: null };
        } catch (error: any) {
            console.error('Login Error:', error);
            return { user: null, error: error.message };
        }
    },

    // Registro
    register: async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { user: userCredential.user, error: null };
        } catch (error: any) {
            console.error('Register Error:', error);
            return { user: null, error: error.message };
        }
    },

    // Logout
    logout: async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // Observador de Estado
    onStateChange: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    }
};
