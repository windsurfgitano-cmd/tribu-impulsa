"use strict";
// Database Service - Tribu Impulsa
// Gestiona almacenamiento local y exportación a Google Drive
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDuplicateUsers = exports.getCategoryDistribution = exports.isOnboardingComplete = exports.updateOnboardingProgress = exports.getOnboardingProgress = exports.sendBulkReminder = exports.createReminder = exports.getReportsByStatus = exports.updateReportStatus = exports.createReport = exports.getAllReports = exports.getComplianceStats = exports.getAllUsersCompliance = exports.getUserCompliance = exports.getDashboardStats = exports.exportForGoogleDrive = exports.generateGoogleDriveUploadLink = exports.downloadAsFile = exports.exportAllDataToJSON = exports.exportUsersToCSV = exports.updateInteractionStatus = exports.createInteraction = exports.getAllInteractions = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.createNotification = exports.getUnreadNotifications = exports.getUserNotifications = exports.syncNotificationsFromFirebase = exports.getAllNotifications = exports.clearCurrentUser = exports.getCurrentUser = exports.setCurrentUser = exports.updateUser = exports.createUser = exports.getUserByEmail = exports.getUserById = exports.getAllUsers = void 0;
// Keys para localStorage
const DB_KEYS = {
    USERS: 'tribu_users',
    NOTIFICATIONS: 'tribu_notifications',
    INTERACTIONS: 'tribu_interactions',
    TRIBE_ASSIGNMENTS: 'tribu_assignments',
    CURRENT_USER: 'tribu_current_user',
    EXPORT_HISTORY: 'tribu_export_history'
};
// ================== USERS ==================
const getAllUsers = () => {
    const raw = localStorage.getItem(DB_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
};
exports.getAllUsers = getAllUsers;
const getUserById = (id) => {
    return (0, exports.getAllUsers)().find(u => u.id === id);
};
exports.getUserById = getUserById;
const getUserByEmail = (email) => {
    return (0, exports.getAllUsers)().find(u => u.email.toLowerCase() === email.toLowerCase());
};
exports.getUserByEmail = getUserByEmail;
const createUser = (userData) => {
    const users = (0, exports.getAllUsers)();
    const newUser = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        surveyCompleted: true,
        tribeAssigned: false
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    (0, exports.setCurrentUser)(newUser.id);
    return newUser;
};
exports.createUser = createUser;
const updateUser = (id, updates) => {
    const users = (0, exports.getAllUsers)();
    const index = users.findIndex(u => u.id === id);
    if (index === -1)
        return null;
    users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return users[index];
};
exports.updateUser = updateUser;
const setCurrentUser = (userId) => {
    localStorage.setItem(DB_KEYS.CURRENT_USER, userId);
};
exports.setCurrentUser = setCurrentUser;
const getCurrentUser = () => {
    const userId = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (!userId)
        return null;
    return (0, exports.getUserById)(userId) || null;
};
exports.getCurrentUser = getCurrentUser;
const clearCurrentUser = () => {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
};
exports.clearCurrentUser = clearCurrentUser;
// ================== NOTIFICATIONS ==================
const getAllNotifications = () => {
    const raw = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
};
exports.getAllNotifications = getAllNotifications;
// Sincronizar notificaciones desde Firebase (llamar al cargar la app)
const syncNotificationsFromFirebase = async (userId) => {
    try {
        const { getFirestoreInstance } = await Promise.resolve().then(() => require('./firebaseService'));
        const { collection, query, where, getDocs } = await Promise.resolve().then(() => require('firebase/firestore'));
        const db = getFirestoreInstance();
        if (!db)
            return;
        const notifRef = collection(db, 'notifications');
        const q = query(notifRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        if (snapshot.empty)
            return;
        const localNotifs = (0, exports.getAllNotifications)();
        const localIds = localNotifs.map(n => n.id);
        let addedCount = 0;
        snapshot.forEach(doc => {
            const firebaseNotif = doc.data();
            if (!localIds.includes(firebaseNotif.id)) {
                localNotifs.push(firebaseNotif);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(localNotifs));
            console.log(`📬 ${addedCount} notificaciones sincronizadas desde Firebase`);
        }
    }
    catch (err) {
        console.log('⚠️ Error sincronizando notificaciones:', err);
    }
};
exports.syncNotificationsFromFirebase = syncNotificationsFromFirebase;
const getUserNotifications = (userId) => {
    return (0, exports.getAllNotifications)().filter(n => n.userId === userId);
};
exports.getUserNotifications = getUserNotifications;
const getUnreadNotifications = (userId) => {
    return (0, exports.getUserNotifications)(userId).filter(n => !n.read);
};
exports.getUnreadNotifications = getUnreadNotifications;
const createNotification = async (data) => {
    const notifications = (0, exports.getAllNotifications)();
    const newNotification = {
        ...data,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        read: false
    };
    notifications.push(newNotification);
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    // TAMBIÉN guardar en Firebase para cross-device
    try {
        const { getFirestoreInstance } = await Promise.resolve().then(() => require('./firebaseService'));
        const { doc, setDoc, collection } = await Promise.resolve().then(() => require('firebase/firestore'));
        const db = getFirestoreInstance();
        if (db) {
            await setDoc(doc(collection(db, 'notifications'), newNotification.id), newNotification);
            console.log('📬 Notificación guardada en Firebase:', newNotification.title);
        }
    }
    catch (err) {
        console.log('⚠️ Error guardando notificación en Firebase:', err);
    }
    return newNotification;
};
exports.createNotification = createNotification;
const markNotificationAsRead = (id) => {
    const notifications = (0, exports.getAllNotifications)();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications[index].read = true;
        localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (userId) => {
    const notifications = (0, exports.getAllNotifications)();
    notifications.forEach(n => {
        if (n.userId === userId)
            n.read = true;
    });
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// ================== INTERACTIONS ==================
const getAllInteractions = () => {
    const raw = localStorage.getItem(DB_KEYS.INTERACTIONS);
    return raw ? JSON.parse(raw) : [];
};
exports.getAllInteractions = getAllInteractions;
const createInteraction = (data) => {
    const interactions = (0, exports.getAllInteractions)();
    const newInteraction = {
        ...data,
        id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    interactions.push(newInteraction);
    localStorage.setItem(DB_KEYS.INTERACTIONS, JSON.stringify(interactions));
    // Crear notificación para el destinatario
    const fromUser = (0, exports.getUserById)(data.fromUserId);
    if (data.type === 'share_completed') {
        (0, exports.createNotification)({
            userId: data.toUserId,
            type: 'match_new',
            title: '¡Acción completada!',
            message: `${(fromUser === null || fromUser === void 0 ? void 0 : fromUser.companyName) || 'Un miembro'} ha compartido tu contenido`,
            data: { interactionId: newInteraction.id }
        });
    }
    else if (data.type === 'report') {
        (0, exports.createNotification)({
            userId: data.toUserId,
            type: 'report_received',
            title: 'Nuevo reporte recibido',
            message: `Has recibido un reporte de ${(fromUser === null || fromUser === void 0 ? void 0 : fromUser.companyName) || 'un miembro'}`,
            data: { interactionId: newInteraction.id, note: data.note }
        });
    }
    return newInteraction;
};
exports.createInteraction = createInteraction;
const updateInteractionStatus = (id, status) => {
    const interactions = (0, exports.getAllInteractions)();
    const index = interactions.findIndex(i => i.id === id);
    if (index !== -1) {
        interactions[index].status = status;
        localStorage.setItem(DB_KEYS.INTERACTIONS, JSON.stringify(interactions));
    }
};
exports.updateInteractionStatus = updateInteractionStatus;
// ================== EXPORT TO CSV/JSON ==================
const exportUsersToCSV = () => {
    const users = (0, exports.getAllUsers)();
    if (users.length === 0)
        return '';
    const headers = [
        'ID', 'Fecha Registro', 'Nombre', 'Email', 'Teléfono', 'Empresa',
        'Ciudad', 'Sector', 'Instagram', 'Facebook', 'TikTok', 'Website',
        'Categoría (Giro)', 'Afinidad', 'Alcance', 'Facturación', 'Estado'
    ];
    const rows = users.map(u => [
        u.id,
        new Date(u.createdAt).toLocaleDateString('es-CL'),
        u.name,
        u.email,
        u.phone,
        u.companyName,
        u.city,
        u.sector || '',
        u.instagram,
        u.facebook || '',
        u.tiktok || '',
        u.website || '',
        u.category,
        u.affinity,
        u.scope,
        u.revenue || '',
        u.status
    ]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    return csvContent;
};
exports.exportUsersToCSV = exportUsersToCSV;
const exportAllDataToJSON = () => {
    const data = {
        exportedAt: new Date().toISOString(),
        users: (0, exports.getAllUsers)(),
        notifications: (0, exports.getAllNotifications)(),
        interactions: (0, exports.getAllInteractions)(),
        stats: {
            totalUsers: (0, exports.getAllUsers)().length,
            activeUsers: (0, exports.getAllUsers)().filter(u => u.status === 'active').length,
            totalInteractions: (0, exports.getAllInteractions)().length,
            pendingReports: (0, exports.getAllInteractions)().filter(i => i.type === 'report' && i.status === 'pending').length
        }
    };
    return JSON.stringify(data, null, 2);
};
exports.exportAllDataToJSON = exportAllDataToJSON;
const downloadAsFile = (content, filename, type) => {
    const mimeType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    // Log export
    const history = JSON.parse(localStorage.getItem(DB_KEYS.EXPORT_HISTORY) || '[]');
    history.push({ filename, exportedAt: new Date().toISOString() });
    localStorage.setItem(DB_KEYS.EXPORT_HISTORY, JSON.stringify(history));
};
exports.downloadAsFile = downloadAsFile;
// ================== GOOGLE DRIVE INTEGRATION ==================
// Genera un link para subir manualmente a Google Drive
const generateGoogleDriveUploadLink = () => {
    // Este link abre Google Drive para subir archivo
    return 'https://drive.google.com/drive/my-drive';
};
exports.generateGoogleDriveUploadLink = generateGoogleDriveUploadLink;
// Exporta todo y prepara para Google Drive
const exportForGoogleDrive = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const csv = (0, exports.exportUsersToCSV)();
    const json = (0, exports.exportAllDataToJSON)();
    // Descargar ambos archivos
    (0, exports.downloadAsFile)(csv, `tribu_usuarios_${timestamp}.csv`, 'csv');
    (0, exports.downloadAsFile)(json, `tribu_backup_${timestamp}.json`, 'json');
    const instructions = `
📁 Archivos exportados:
- tribu_usuarios_${timestamp}.csv (para ver en Google Sheets)
- tribu_backup_${timestamp}.json (backup completo)

📤 Para subir a Google Drive:
1. Abre: ${(0, exports.generateGoogleDriveUploadLink)()}
2. Arrastra los archivos descargados
3. Comparte la carpeta con Doraluz y Dafna

✅ Exportación completada: ${new Date().toLocaleString('es-CL')}
  `;
    return { csv, json, instructions };
};
exports.exportForGoogleDrive = exportForGoogleDrive;
// ================== STATS ==================
const getDashboardStats = () => {
    const users = (0, exports.getAllUsers)();
    const interactions = (0, exports.getAllInteractions)();
    const currentMonth = new Date().toISOString().slice(0, 7);
    return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        pendingUsers: users.filter(u => u.status === 'pending').length,
        thisMonthUsers: users.filter(u => u.createdAt.startsWith(currentMonth)).length,
        totalInteractions: interactions.length,
        completedShares: interactions.filter(i => i.type === 'share_completed').length,
        pendingReports: interactions.filter(i => i.type === 'report' && i.status === 'pending').length,
        resolvedReports: interactions.filter(i => i.type === 'report' && i.status === 'completed').length
    };
};
exports.getDashboardStats = getDashboardStats;
const getUserCompliance = (userId) => {
    const user = (0, exports.getUserById)(userId);
    if (!user)
        return null;
    const checklistKey = `tribeChecklist_${userId}`;
    const checklist = JSON.parse(localStorage.getItem(checklistKey) || '{}');
    const toShareChecked = Object.entries(checklist)
        .filter(([key, val]) => key.startsWith('toShare_') && val === true).length;
    const shareWithMeChecked = Object.entries(checklist)
        .filter(([key, val]) => key.startsWith('shareWithMe_') && val === true).length;
    const total = 20; // 10 + 10
    const completed = toShareChecked + shareWithMeChecked;
    const percentage = Math.round((completed / total) * 100);
    let status = 'critical';
    if (percentage >= 80)
        status = 'excellent';
    else if (percentage >= 60)
        status = 'good';
    else if (percentage >= 30)
        status = 'warning';
    const interactions = (0, exports.getAllInteractions)().filter(i => i.fromUserId === userId);
    const lastActivity = interactions.length > 0
        ? interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : undefined;
    return {
        userId,
        userName: user.name,
        companyName: user.companyName,
        toShareTotal: 10,
        toShareCompleted: toShareChecked,
        shareWithMeTotal: 10,
        shareWithMeCompleted: shareWithMeChecked,
        percentageComplete: percentage,
        status,
        lastActivity
    };
};
exports.getUserCompliance = getUserCompliance;
const getAllUsersCompliance = () => {
    const users = (0, exports.getAllUsers)();
    return users
        .map(u => (0, exports.getUserCompliance)(u.id))
        .filter((c) => c !== null)
        .sort((a, b) => b.percentageComplete - a.percentageComplete);
};
exports.getAllUsersCompliance = getAllUsersCompliance;
const getComplianceStats = () => {
    const compliances = (0, exports.getAllUsersCompliance)();
    const total = compliances.length || 1;
    return {
        excellent: compliances.filter(c => c.status === 'excellent').length,
        good: compliances.filter(c => c.status === 'good').length,
        warning: compliances.filter(c => c.status === 'warning').length,
        critical: compliances.filter(c => c.status === 'critical').length,
        averageCompliance: Math.round(compliances.reduce((sum, c) => sum + c.percentageComplete, 0) / total),
        totalUsers: total
    };
};
exports.getComplianceStats = getComplianceStats;
const REPORTS_KEY = 'tribu_reports';
const getAllReports = () => {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
};
exports.getAllReports = getAllReports;
const createReport = (fromUserId, targetUserId, reason) => {
    const reports = (0, exports.getAllReports)();
    const newReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromUserId,
        targetUserId,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    // También crear notificación para admins
    (0, exports.createNotification)({
        userId: 'admin',
        type: 'system',
        title: 'Nuevo reporte recibido',
        message: `Se ha creado un nuevo reporte que requiere revisión`,
        data: { reportId: newReport.id }
    });
    return newReport;
};
exports.createReport = createReport;
const updateReportStatus = (reportId, status, adminNotes) => {
    const reports = (0, exports.getAllReports)();
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1)
        return null;
    reports[index] = {
        ...reports[index],
        status,
        adminNotes: adminNotes || reports[index].adminNotes,
        resolvedAt: ['resolved', 'sanctioned', 'dismissed'].includes(status)
            ? new Date().toISOString()
            : undefined,
        resolvedBy: 'admin'
    };
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    // Notificar al reportador
    const fromUser = (0, exports.getUserById)(reports[index].fromUserId);
    if (fromUser) {
        (0, exports.createNotification)({
            userId: fromUser.id,
            type: 'system',
            title: 'Actualización de tu reporte',
            message: `Tu reporte ha sido ${status === 'resolved' ? 'resuelto' : status === 'sanctioned' ? 'procesado con sanción' : 'revisado'}`,
            data: { reportId }
        });
    }
    // Si hay sanción, actualizar status del usuario
    if (status === 'sanctioned') {
        (0, exports.updateUser)(reports[index].targetUserId, { status: 'suspended' });
    }
    return reports[index];
};
exports.updateReportStatus = updateReportStatus;
const getReportsByStatus = (status) => {
    return (0, exports.getAllReports)().filter(r => r.status === status);
};
exports.getReportsByStatus = getReportsByStatus;
// ================== RECORDATORIOS ==================
const createReminder = (userId, type) => {
    const user = (0, exports.getUserById)(userId);
    if (!user)
        return;
    const messages = {
        welcome: {
            title: '¡Bienvenido/a a Tribu Impulsa! 🎉',
            message: 'Tu cuenta está lista. Explora tu tribu y empieza a conectar con otros emprendedores.'
        },
        tribe_new: {
            title: '¡Tu nueva tribu está lista! 🚀',
            message: 'Ya puedes ver tus 10+10 asignaciones del mes. ¡Hora de compartir!'
        },
        mid_month: {
            title: '¡Vas a mitad de mes! 💪',
            message: `Llevas buen ritmo. Revisa tu checklist y sigue conectando.`
        },
        end_month: {
            title: '¡Último recordatorio del mes! ⏰',
            message: 'Quedan pocos días para completar tus acciones. ¡No te quedes atrás!'
        }
    };
    const msg = messages[type];
    (0, exports.createNotification)({
        userId,
        type: 'reminder',
        title: msg.title,
        message: msg.message
    });
};
exports.createReminder = createReminder;
const sendBulkReminder = (type) => {
    const users = (0, exports.getAllUsers)().filter(u => u.status === 'active');
    users.forEach(u => (0, exports.createReminder)(u.id, type));
    return users.length;
};
exports.sendBulkReminder = sendBulkReminder;
// ================== ONBOARDING ==================
const ONBOARDING_KEY = 'tribu_onboarding';
const getOnboardingProgress = (userId) => {
    const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}');
    return all[userId] || {
        viewedWelcome: false,
        viewedTribeExplainer: false,
        viewedChecklistTutorial: false,
        viewedProfileSetup: false
    };
};
exports.getOnboardingProgress = getOnboardingProgress;
const updateOnboardingProgress = (userId, step) => {
    const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}');
    if (!all[userId]) {
        all[userId] = {
            viewedWelcome: false,
            viewedTribeExplainer: false,
            viewedChecklistTutorial: false,
            viewedProfileSetup: false
        };
    }
    all[userId][step] = true;
    // Check if all steps complete
    const progress = all[userId];
    if (progress.viewedWelcome && progress.viewedTribeExplainer &&
        progress.viewedChecklistTutorial && progress.viewedProfileSetup) {
        all[userId].completedAt = new Date().toISOString();
    }
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(all));
};
exports.updateOnboardingProgress = updateOnboardingProgress;
const isOnboardingComplete = (userId) => {
    return !!(0, exports.getOnboardingProgress)(userId).completedAt;
};
exports.isOnboardingComplete = isOnboardingComplete;
// ================== DISTRIBUCIÓN POR RUBRO ==================
const getCategoryDistribution = () => {
    const users = (0, exports.getAllUsers)();
    const distribution = {};
    users.forEach(u => {
        const cat = u.category || 'Sin categoría';
        distribution[cat] = (distribution[cat] || 0) + 1;
    });
    return Object.entries(distribution)
        .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / users.length) * 100)
    }))
        .sort((a, b) => b.count - a.count);
};
exports.getCategoryDistribution = getCategoryDistribution;
// Detectar usuarios duplicados
const detectDuplicateUsers = () => {
    const users = (0, exports.getAllUsers)();
    // Por email
    const emailMap = {};
    users.forEach(u => {
        var _a;
        const email = (_a = u.email) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim();
        if (email && email.length > 0) {
            if (!emailMap[email])
                emailMap[email] = [];
            emailMap[email].push(`${u.companyName} (${u.id})`);
        }
    });
    // Por nombre de empresa
    const companyMap = {};
    users.forEach(u => {
        var _a;
        const company = (_a = u.companyName) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim();
        if (company && company.length > 0) {
            if (!companyMap[company])
                companyMap[company] = [];
            companyMap[company].push(`${u.email} (${u.id})`);
        }
    });
    // Por Instagram
    const igMap = {};
    users.forEach(u => {
        var _a;
        const ig = (_a = u.instagram) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace('@', '').trim();
        if (ig && ig.length > 0) {
            if (!igMap[ig])
                igMap[ig] = [];
            igMap[ig].push(`${u.companyName} (${u.id})`);
        }
    });
    const byEmail = Object.entries(emailMap)
        .filter(([_, arr]) => arr.length > 1)
        .map(([email, users]) => ({ email, count: users.length, users }));
    const byCompany = Object.entries(companyMap)
        .filter(([_, arr]) => arr.length > 1)
        .map(([company, users]) => ({ company, count: users.length, users }));
    const byInstagram = Object.entries(igMap)
        .filter(([_, arr]) => arr.length > 1)
        .map(([instagram, users]) => ({ instagram, count: users.length, users }));
    console.log('📊 ANÁLISIS DE DUPLICADOS:');
    console.log(`Total usuarios: ${users.length}`);
    console.log(`Emails duplicados: ${byEmail.length}`, byEmail);
    console.log(`Empresas duplicadas: ${byCompany.length}`, byCompany);
    console.log(`Instagram duplicados: ${byInstagram.length}`, byInstagram);
    return {
        byEmail,
        byCompany,
        byInstagram,
        total: users.length,
        duplicates: byEmail.length + byCompany.length + byInstagram.length
    };
};
exports.detectDuplicateUsers = detectDuplicateUsers;
