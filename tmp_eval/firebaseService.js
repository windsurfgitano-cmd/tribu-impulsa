"use strict";
// Firebase Service - Tribu Impulsa
// Configuración de Firebase, Firestore y Cloud Messaging
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserPassword = exports.updateUserPassword = exports.getImageConfig = exports.uploadProfileImage = exports.validateImageFile = exports.sendPushToAll = exports.sendPushToUser = exports.countUsersWithPush = exports.getAllUserFCMTokens = exports.saveUserFCMToken = exports.getNotificationStatus = exports.sendLocalNotification = exports.clearFCMToken = exports.getSavedFCMToken = exports.onForegroundMessage = exports.requestNotificationPermission = exports.getMessagingInstance = exports.logInteraction = exports.loadTribeAssignments = exports.syncTribeAssignments = exports.loadAdminConfig = exports.syncAdminConfig = exports.loadChecklistFromFirebase = exports.syncChecklistProgress = exports.syncProfilePhoto = exports.syncPhotosFromFirebase = exports.getAllProfilesFromCloud = exports.updateProfileField = exports.getProfileFromCloud = exports.syncUserToFirebase = exports.syncProfileToCloud = exports.getFirestoreInstance = exports.initializeFirebase = exports.isFirebaseConfigured = void 0;
const app_1 = require("firebase/app");
const messaging_1 = require("firebase/messaging");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
// Configuración de Firebase - Tribu Impulsa
// Nota: Las API keys de Firebase son seguras para exponer en el frontend
// La seguridad se maneja con Firebase Security Rules
const firebaseConfig = {
    apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
    authDomain: "tribu-impulsa.firebaseapp.com",
    projectId: "tribu-impulsa",
    storageBucket: "tribu-impulsa.firebasestorage.app",
    messagingSenderId: "348097115578",
    appId: "1:348097115578:web:115960bb81563050d01983"
};
// VAPID Key para Web Push (Cloud Messaging)
const VAPID_KEY = "BIhxjd_diMAgmMBrqvYxISkqe_vEKy3GYqK0tgNQOFlMQ37K_b0UhqmXAFXDjIayCDcAtBmLLktE50Gxn5tFLUE";
// Instancias de Firebase
let app = null;
let messaging = null;
let db = null;
// Verificar si Firebase está configurado
const isFirebaseConfigured = () => {
    return !!(firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.messagingSenderId);
};
exports.isFirebaseConfigured = isFirebaseConfigured;
// Inicializar Firebase
const initializeFirebase = () => {
    if (!(0, exports.isFirebaseConfigured)()) {
        console.warn('⚠️ Firebase no está configurado. Agrega las variables de entorno.');
        return null;
    }
    if (!app) {
        try {
            app = (0, app_1.initializeApp)(firebaseConfig);
            console.log('✅ Firebase inicializado');
        }
        catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            return null;
        }
    }
    return app;
};
exports.initializeFirebase = initializeFirebase;
// Obtener instancia de Firestore
const getFirestoreInstance = () => {
    if (!app) {
        (0, exports.initializeFirebase)();
    }
    if (!app)
        return null;
    if (!db) {
        try {
            db = (0, firestore_1.getFirestore)(app);
            console.log('✅ Firestore inicializado');
        }
        catch (error) {
            console.error('❌ Error obteniendo Firestore:', error);
            return null;
        }
    }
    return db;
};
exports.getFirestoreInstance = getFirestoreInstance;
// Sincronizar perfil local a Firestore
const syncProfileToCloud = async (profile) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore) {
        console.warn('Firestore no disponible - guardando solo localmente');
        return false;
    }
    try {
        const profileRef = (0, firestore_1.doc)(firestore, 'profiles', profile.id);
        await (0, firestore_1.setDoc)(profileRef, {
            ...profile,
            updatedAt: (0, firestore_1.serverTimestamp)(),
            syncedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`✅ Perfil ${profile.id} sincronizado a la nube`);
        return true;
    }
    catch (error) {
        console.error('❌ Error sincronizando perfil:', error);
        return false;
    }
};
exports.syncProfileToCloud = syncProfileToCloud;
// Sincronizar usuario a la colección 'users' de Firestore
const syncUserToFirebase = async (userId, userData) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore) {
        console.warn('Firestore no disponible para sincronizar usuario');
        return false;
    }
    try {
        const userRef = (0, firestore_1.doc)(firestore, 'users', userId);
        await (0, firestore_1.setDoc)(userRef, {
            ...userData,
            updatedAt: (0, firestore_1.serverTimestamp)(),
            syncedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`✅ Usuario ${userId} sincronizado a Firebase/users`);
        return true;
    }
    catch (error) {
        console.error('❌ Error sincronizando usuario a Firebase:', error);
        return false;
    }
};
exports.syncUserToFirebase = syncUserToFirebase;
// Obtener perfil desde Firestore
const getProfileFromCloud = async (profileId) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return null;
    try {
        const profileRef = (0, firestore_1.doc)(firestore, 'profiles', profileId);
        const snapshot = await (0, firestore_1.getDoc)(profileRef);
        if (snapshot.exists()) {
            return snapshot.data();
        }
        return null;
    }
    catch (error) {
        console.error('❌ Error obteniendo perfil de la nube:', error);
        return null;
    }
};
exports.getProfileFromCloud = getProfileFromCloud;
// Actualizar campo específico del perfil
const updateProfileField = async (profileId, field, value) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return false;
    try {
        const profileRef = (0, firestore_1.doc)(firestore, 'profiles', profileId);
        await (0, firestore_1.updateDoc)(profileRef, {
            [field]: value,
            updatedAt: (0, firestore_1.serverTimestamp)()
        });
        console.log(`✅ Campo ${field} actualizado para ${profileId}`);
        return true;
    }
    catch (error) {
        console.error('❌ Error actualizando campo:', error);
        return false;
    }
};
exports.updateProfileField = updateProfileField;
// Obtener todos los perfiles desde Firestore
const getAllProfilesFromCloud = async () => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return [];
    try {
        const profilesRef = (0, firestore_1.collection)(firestore, 'profiles');
        const snapshot = await (0, firestore_1.getDocs)(profilesRef);
        const profiles = [];
        snapshot.forEach(doc => {
            profiles.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ ${profiles.length} perfiles obtenidos de la nube`);
        return profiles;
    }
    catch (error) {
        console.error('❌ Error obteniendo perfiles:', error);
        return [];
    }
};
exports.getAllProfilesFromCloud = getAllProfilesFromCloud;
// Sincronizar fotos de perfil desde Firebase a localStorage
const syncPhotosFromFirebase = async () => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return 0;
    try {
        // Obtener usuarios de Firebase
        const usersRef = (0, firestore_1.collection)(firestore, 'users');
        const snapshot = await (0, firestore_1.getDocs)(usersRef);
        // Leer usuarios locales
        const localUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');
        let updatedCount = 0;
        snapshot.forEach(docSnap => {
            const firebaseUser = docSnap.data();
            const localIndex = localUsers.findIndex((u) => u.id === docSnap.id);
            if (localIndex !== -1) {
                // Actualizar avatarUrl si existe en Firebase y es diferente
                if (firebaseUser.avatarUrl && firebaseUser.avatarUrl !== localUsers[localIndex].avatarUrl) {
                    localUsers[localIndex].avatarUrl = firebaseUser.avatarUrl;
                    updatedCount++;
                }
                // Actualizar coverUrl si existe en Firebase y es diferente
                if (firebaseUser.coverUrl && firebaseUser.coverUrl !== localUsers[localIndex].coverUrl) {
                    localUsers[localIndex].coverUrl = firebaseUser.coverUrl;
                    updatedCount++;
                }
                // Actualizar website si existe en Firebase
                if (firebaseUser.website && !localUsers[localIndex].website) {
                    localUsers[localIndex].website = firebaseUser.website;
                }
                // Actualizar contraseña si existe en Firebase (para persistencia entre dispositivos)
                if (firebaseUser.password && firebaseUser.password !== 'TRIBU2026') {
                    localUsers[localIndex].password = firebaseUser.password;
                }
            }
        });
        if (updatedCount > 0) {
            localStorage.setItem('tribu_users', JSON.stringify(localUsers));
            console.log(`✅ ${updatedCount} fotos sincronizadas desde Firebase`);
        }
        return updatedCount;
    }
    catch (error) {
        console.error('❌ Error sincronizando fotos:', error);
        return 0;
    }
};
exports.syncPhotosFromFirebase = syncPhotosFromFirebase;
// Sincronizar foto de perfil (URL)
const syncProfilePhoto = async (profileId, photoUrl) => {
    return (0, exports.updateProfileField)(profileId, 'avatarUrl', photoUrl);
};
exports.syncProfilePhoto = syncProfilePhoto;
// Sincronizar cambios de checklist/tribu
const syncChecklistProgress = async (userId, checklistData) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return false;
    try {
        const progressRef = (0, firestore_1.doc)(firestore, 'progress', userId);
        await (0, firestore_1.setDoc)(progressRef, {
            ...checklistData,
            updatedAt: (0, firestore_1.serverTimestamp)()
        }, { merge: true });
        return true;
    }
    catch (error) {
        console.error('❌ Error sincronizando progreso:', error);
        return false;
    }
};
exports.syncChecklistProgress = syncChecklistProgress;
// Cargar progreso del checklist desde Firebase
const loadChecklistFromFirebase = async (userId) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return null;
    try {
        const progressRef = (0, firestore_1.doc)(firestore, 'progress', userId);
        const progressDoc = await (0, firestore_1.getDoc)(progressRef);
        if (progressDoc.exists()) {
            const data = progressDoc.data();
            console.log('☁️ Checklist cargado desde Firebase:', data.completed, '/', data.total);
            return {
                completed: data.completed || 0,
                total: data.total || 0,
                items: data.items || {}
            };
        }
        return null;
    }
    catch (error) {
        console.error('❌ Error cargando checklist:', error);
        return null;
    }
};
exports.loadChecklistFromFirebase = loadChecklistFromFirebase;
// ============================================
// ADMIN CONFIG - PERSISTENCIA FIREBASE
// ============================================
// Guardar configuración admin en Firebase
const syncAdminConfig = async (config) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return false;
    try {
        const configRef = (0, firestore_1.doc)(firestore, 'config', 'admin');
        await (0, firestore_1.setDoc)(configRef, {
            ...config,
            updatedAt: (0, firestore_1.serverTimestamp)()
        }, { merge: true });
        console.log('☁️ Config admin sincronizada a Firebase');
        return true;
    }
    catch (error) {
        console.error('❌ Error sincronizando config:', error);
        return false;
    }
};
exports.syncAdminConfig = syncAdminConfig;
// Cargar configuración admin desde Firebase
const loadAdminConfig = async () => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return null;
    try {
        const configRef = (0, firestore_1.doc)(firestore, 'config', 'admin');
        const configDoc = await (0, firestore_1.getDoc)(configRef);
        if (configDoc.exists()) {
            const data = configDoc.data();
            console.log('☁️ Config admin cargada desde Firebase');
            return {
                membershipPrice: data.membershipPrice || 20000,
                matchesPerUser: data.matchesPerUser || 10,
                whatsappSupport: data.whatsappSupport || '+56951776005',
                appName: data.appName || 'Tribu Impulsa',
                mercadopagoMode: data.mercadopagoMode || 'sandbox'
            };
        }
        return null;
    }
    catch (error) {
        console.error('❌ Error cargando config:', error);
        return null;
    }
};
exports.loadAdminConfig = loadAdminConfig;
// ============================================
// TRIBE ASSIGNMENTS - PERSISTENCIA FIREBASE
// ============================================
// Guardar asignaciones de tribu en Firebase
const syncTribeAssignments = async (userId, assignments) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return false;
    try {
        const assignRef = (0, firestore_1.doc)(firestore, 'tribe_assignments', userId);
        await (0, firestore_1.setDoc)(assignRef, {
            ...assignments,
            updatedAt: (0, firestore_1.serverTimestamp)()
        }, { merge: true });
        console.log('☁️ Asignaciones tribu sincronizadas');
        return true;
    }
    catch (error) {
        console.error('❌ Error sincronizando asignaciones:', error);
        return false;
    }
};
exports.syncTribeAssignments = syncTribeAssignments;
// Cargar asignaciones de tribu desde Firebase
const loadTribeAssignments = async (userId) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return null;
    try {
        const assignRef = (0, firestore_1.doc)(firestore, 'tribe_assignments', userId);
        const assignDoc = await (0, firestore_1.getDoc)(assignRef);
        if (assignDoc.exists()) {
            const data = assignDoc.data();
            console.log('☁️ Asignaciones tribu cargadas desde Firebase');
            return {
                toShareIds: data.toShareIds || [],
                shareWithMeIds: data.shareWithMeIds || [],
                month: data.month || ''
            };
        }
        return null;
    }
    catch (error) {
        console.error('❌ Error cargando asignaciones:', error);
        return null;
    }
};
exports.loadTribeAssignments = loadTribeAssignments;
// Registrar interacción (para analytics)
const logInteraction = async (userId, action, details) => {
    const firestore = (0, exports.getFirestoreInstance)();
    if (!firestore)
        return;
    try {
        const interactionRef = (0, firestore_1.doc)((0, firestore_1.collection)(firestore, 'interactions'));
        await (0, firestore_1.setDoc)(interactionRef, {
            userId,
            action,
            details,
            timestamp: (0, firestore_1.serverTimestamp)()
        });
    }
    catch (error) {
        console.error('Error logging interaction:', error);
    }
};
exports.logInteraction = logInteraction;
// Obtener instancia de Messaging
const getMessagingInstance = () => {
    if (!app) {
        (0, exports.initializeFirebase)();
    }
    if (!app)
        return null;
    if (!messaging) {
        try {
            messaging = (0, messaging_1.getMessaging)(app);
        }
        catch (error) {
            console.error('❌ Error obteniendo Messaging:', error);
            return null;
        }
    }
    return messaging;
};
exports.getMessagingInstance = getMessagingInstance;
// Solicitar permiso de notificaciones y obtener token
const requestNotificationPermission = async () => {
    try {
        // Verificar soporte del navegador
        if (!('Notification' in window)) {
            console.warn('Este navegador no soporta notificaciones');
            return null;
        }
        // Solicitar permiso
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('Permiso de notificaciones denegado');
            return null;
        }
        // Obtener token de FCM
        const messagingInstance = (0, exports.getMessagingInstance)();
        if (!messagingInstance) {
            console.warn('Messaging no disponible');
            return null;
        }
        if (!VAPID_KEY) {
            console.warn('VAPID_KEY no configurado');
            return null;
        }
        const token = await (0, messaging_1.getToken)(messagingInstance, { vapidKey: VAPID_KEY });
        if (token) {
            console.log('✅ Token FCM obtenido');
            // Guardar token en localStorage para enviarlo al backend
            localStorage.setItem('fcm_token', token);
            return token;
        }
        return null;
    }
    catch (error) {
        console.error('❌ Error solicitando permiso:', error);
        return null;
    }
};
exports.requestNotificationPermission = requestNotificationPermission;
// Escuchar mensajes cuando la app está en primer plano
const onForegroundMessage = (callback) => {
    const messagingInstance = (0, exports.getMessagingInstance)();
    if (!messagingInstance) {
        console.warn('Messaging no disponible para escuchar mensajes');
        return null;
    }
    const unsubscribe = (0, messaging_1.onMessage)(messagingInstance, (payload) => {
        console.log('📩 Mensaje recibido en primer plano:', payload);
        callback(payload);
    });
    return unsubscribe;
};
exports.onForegroundMessage = onForegroundMessage;
// Obtener el token guardado
const getSavedFCMToken = () => {
    return localStorage.getItem('fcm_token');
};
exports.getSavedFCMToken = getSavedFCMToken;
// Eliminar token (para logout)
const clearFCMToken = () => {
    localStorage.removeItem('fcm_token');
};
exports.clearFCMToken = clearFCMToken;
// Enviar notificación local (fallback cuando no hay Firebase)
const sendLocalNotification = (title, body, icon) => {
    if (!('Notification' in window)) {
        console.warn('Notificaciones no soportadas');
        return;
    }
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            tag: 'tribu-notification',
            requireInteraction: false
        });
    }
};
exports.sendLocalNotification = sendLocalNotification;
// Estado de las notificaciones
const getNotificationStatus = () => {
    return {
        supported: 'Notification' in window,
        permission: 'Notification' in window ? Notification.permission : 'unsupported',
        hasToken: !!(0, exports.getSavedFCMToken)(),
        firebaseConfigured: (0, exports.isFirebaseConfigured)()
    };
};
exports.getNotificationStatus = getNotificationStatus;
// Guardar token de un usuario específico (para enviar push después)
const saveUserFCMToken = (userId, token) => {
    const tokens = JSON.parse(localStorage.getItem('fcm_user_tokens') || '{}');
    tokens[userId] = { token, savedAt: new Date().toISOString() };
    localStorage.setItem('fcm_user_tokens', JSON.stringify(tokens));
};
exports.saveUserFCMToken = saveUserFCMToken;
// Obtener tokens de todos los usuarios
const getAllUserFCMTokens = () => {
    return JSON.parse(localStorage.getItem('fcm_user_tokens') || '{}');
};
exports.getAllUserFCMTokens = getAllUserFCMTokens;
// Contar usuarios con notificaciones activas
const countUsersWithPush = () => {
    const tokens = (0, exports.getAllUserFCMTokens)();
    return Object.keys(tokens).length;
};
exports.countUsersWithPush = countUsersWithPush;
// Simular envío de push (en producción usarías Firebase Admin SDK desde un backend)
const sendPushToUser = (userId, title, body) => {
    const tokens = (0, exports.getAllUserFCMTokens)();
    const userToken = tokens[userId];
    if (!userToken) {
        console.warn(`Usuario ${userId} no tiene token de push`);
        return false;
    }
    // En producción, aquí enviarías a tu backend que usa Firebase Admin SDK
    // Por ahora, mostramos notificación local si estamos en el mismo navegador
    console.log(`📤 Push enviado a usuario ${userId}:`, { title, body, token: userToken.token.slice(0, 20) + '...' });
    // Mostrar notificación local como demostración
    (0, exports.sendLocalNotification)(title, body);
    return true;
};
exports.sendPushToUser = sendPushToUser;
// Enviar push a todos los usuarios con tokens
const sendPushToAll = (title, body) => {
    const tokens = (0, exports.getAllUserFCMTokens)();
    let sent = 0;
    for (const userId of Object.keys(tokens)) {
        if ((0, exports.sendPushToUser)(userId, title, body)) {
            sent++;
        }
    }
    console.log(`📤 Push masivo enviado a ${sent} usuarios`);
    return sent;
};
exports.sendPushToAll = sendPushToAll;
// ============================================
// FIREBASE STORAGE - UPLOAD DE IMÁGENES
// ============================================
// Configuración de límites
const IMAGE_CONFIG = {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB máximo
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.8, // 80% calidad JPEG
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};
// Comprimir y redimensionar imagen
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                // Redimensionar si es muy grande
                if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
                    const ratio = Math.min(IMAGE_CONFIG.maxWidth / width, IMAGE_CONFIG.maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('No se pudo crear canvas'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        console.log(`📸 Imagen comprimida: ${Math.round(blob.size / 1024)}KB (${width}x${height})`);
                        resolve(blob);
                    }
                    else {
                        reject(new Error('Error al comprimir imagen'));
                    }
                }, 'image/jpeg', IMAGE_CONFIG.quality);
            };
            img.onerror = () => reject(new Error('Error al cargar imagen'));
            img.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
        };
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
    });
};
// Validar archivo antes de subir
const validateImageFile = (file) => {
    if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' };
    }
    if (file.size > IMAGE_CONFIG.maxSizeBytes) {
        return { valid: false, error: `Imagen muy grande. Máximo ${IMAGE_CONFIG.maxSizeBytes / 1024 / 1024}MB` };
    }
    return { valid: true };
};
exports.validateImageFile = validateImageFile;
// Subir imagen de perfil a Firebase Storage
const uploadProfileImage = async (userId, file, type = 'avatar') => {
    try {
        // Validar
        const validation = (0, exports.validateImageFile)(file);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        // Inicializar Firebase si no está
        if (!app)
            (0, exports.initializeFirebase)();
        if (!app) {
            return { success: false, error: 'Firebase no disponible' };
        }
        // Comprimir imagen
        const compressedBlob = await compressImage(file);
        // Subir a Storage
        const storage = (0, storage_1.getStorage)(app);
        const fileName = `${type}_${userId}_${Date.now()}.jpg`;
        const storageRef = (0, storage_1.ref)(storage, `profiles/${userId}/${fileName}`);
        await (0, storage_1.uploadBytes)(storageRef, compressedBlob, {
            contentType: 'image/jpeg',
            customMetadata: {
                uploadedBy: userId,
                originalName: file.name,
                uploadedAt: new Date().toISOString()
            }
        });
        // Obtener URL pública
        const downloadUrl = await (0, storage_1.getDownloadURL)(storageRef);
        // Actualizar perfil en Firestore
        if (db) {
            const field = type === 'avatar' ? 'avatarUrl' : 'coverUrl';
            await (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'users', userId), {
                [field]: downloadUrl,
                updatedAt: (0, firestore_1.serverTimestamp)()
            });
        }
        console.log(`✅ Imagen ${type} subida para usuario ${userId}`);
        return { success: true, url: downloadUrl };
    }
    catch (error) {
        console.error('❌ Error subiendo imagen:', error);
        return { success: false, error: 'Error al subir imagen. Intenta de nuevo.' };
    }
};
exports.uploadProfileImage = uploadProfileImage;
// Obtener configuración de imágenes (para mostrar en UI)
const getImageConfig = () => ({
    maxSizeMB: IMAGE_CONFIG.maxSizeBytes / 1024 / 1024,
    maxDimensions: `${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight}`,
    allowedFormats: 'JPG, PNG, WebP'
});
exports.getImageConfig = getImageConfig;
// Actualizar contraseña en Firebase
const updateUserPassword = async (userId, newPassword) => {
    try {
        const database = (0, exports.getFirestoreInstance)();
        if (!database) {
            console.log('⚠️ Firebase no disponible para actualizar contraseña');
            return false;
        }
        const userRef = (0, firestore_1.doc)(database, 'users', userId);
        await (0, firestore_1.updateDoc)(userRef, {
            password: newPassword,
            passwordUpdatedAt: (0, firestore_1.serverTimestamp)()
        });
        console.log('✅ Contraseña actualizada en Firebase');
        return true;
    }
    catch (error) {
        console.error('❌ Error actualizando contraseña en Firebase:', error);
        return false;
    }
};
exports.updateUserPassword = updateUserPassword;
// Verificar contraseña desde Firebase
const verifyUserPassword = async (userId, password) => {
    try {
        const database = (0, exports.getFirestoreInstance)();
        if (!database)
            return false;
        const userRef = (0, firestore_1.doc)(database, 'users', userId);
        const userDoc = await (0, firestore_1.getDoc)(userRef);
        if (!userDoc.exists())
            return false;
        const userData = userDoc.data();
        return userData.password === password;
    }
    catch (error) {
        console.error('❌ Error verificando contraseña:', error);
        return false;
    }
};
exports.verifyUserPassword = verifyUserPassword;
exports.default = {
    initializeFirebase: exports.initializeFirebase,
    isFirebaseConfigured: exports.isFirebaseConfigured,
    requestNotificationPermission: exports.requestNotificationPermission,
    onForegroundMessage: exports.onForegroundMessage,
    getSavedFCMToken: exports.getSavedFCMToken,
    clearFCMToken: exports.clearFCMToken,
    sendLocalNotification: exports.sendLocalNotification,
    getNotificationStatus: exports.getNotificationStatus,
    // Firestore sync
    syncProfileToCloud: exports.syncProfileToCloud,
    syncUserToFirebase: exports.syncUserToFirebase,
    getProfileFromCloud: exports.getProfileFromCloud,
    updateProfileField: exports.updateProfileField,
    getAllProfilesFromCloud: exports.getAllProfilesFromCloud,
    syncProfilePhoto: exports.syncProfilePhoto,
    syncChecklistProgress: exports.syncChecklistProgress,
    loadChecklistFromFirebase: exports.loadChecklistFromFirebase,
    syncAdminConfig: exports.syncAdminConfig,
    loadAdminConfig: exports.loadAdminConfig,
    syncTribeAssignments: exports.syncTribeAssignments,
    loadTribeAssignments: exports.loadTribeAssignments,
    logInteraction: exports.logInteraction,
    // Storage
    uploadProfileImage: exports.uploadProfileImage,
    validateImageFile: exports.validateImageFile,
    getImageConfig: exports.getImageConfig,
    // Password
    updateUserPassword: exports.updateUserPassword,
    verifyUserPassword: exports.verifyUserPassword,
    // Sync
    syncPhotosFromFirebase: exports.syncPhotosFromFirebase
};
