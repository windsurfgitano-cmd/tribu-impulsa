
import React, { useState, useEffect, FormEvent, useMemo, useRef } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Activity, Users, Settings, LogOut, User as UserIcon, CheckCircle, ArrowRight, Briefcase, Sparkles, MapPin, Globe, Instagram, Calendar, ArrowLeft, Bell, Edit2, Save, X, Share2, Download, FolderSync, TrendingUp, AlertTriangle, AlertCircle, Clock, Send, HelpCircle, ChevronRight, BarChart3, RefreshCw, Zap, Lock, CreditCard, Crown, Gift, Home, Type, Handshake, ExternalLink, MessageCircle, Star, Eye, EyeOff } from 'lucide-react';
import { AFFINITY_OPTIONS, CATEGORY_MAPPING, MatchProfile, TribeAssignments } from './types';
import { TRIBE_CATEGORY_OPTIONS } from './data/tribeCategories';
import { REGIONS, ALL_COMUNAS, searchComunas, searchRegions } from './constants/geography';
import { AFFINITIES } from './constants/affinities';
import { generateMockMatches, getProfileById, getMockActivity, getMyProfile, generateTribeAssignments } from './services/matchService';
import { UserProfile } from './services/databaseService';
import { forceReloadRealUsers } from './services/realUsersData';
import { ensureTribeAssignments } from './services/tribeAlgorithm';
import { enableAutoBackup, downloadBackup, checkDataIntegrity } from './services/dataPersistence';
import {
  initializeFirebase,
  onForegroundMessage,
  getNotificationStatus,
  sendLocalNotification,
  syncProfileToCloud,
  getProfileFromCloud,
  syncChecklistProgress
} from './services/firebaseService';
import { ensureInitialized } from './services/productionInit';
import { AppLayout } from './components/layout';

// ============================================
// INICIALIZACIÓN DE PRODUCCIÓN
// ============================================

// Inicializar Firebase y Firestore automáticamente
initializeFirebase();

// Inicializar producción y cargar usuarios
(async () => {
  try {
    await ensureInitialized();
    console.log('✅ Producción inicializada');

    // Cargar usuarios REALES + sincronizar con Firebase
    await forceReloadRealUsers();
    console.log('✅ Usuarios cargados y sincronizados');

    // Sincronizar fotos de perfil desde Firebase (para ver fotos actualizadas)
    try {
      const { syncPhotosFromFirebase } = await import('./services/firebaseService');
      const photosUpdated = await syncPhotosFromFirebase();
      if (photosUpdated > 0) {
        console.log(`✅ ${photosUpdated} fotos actualizadas desde Firebase`);
      }
    } catch (photoErr) {
      console.log('⚠️ Sync de fotos pendiente');
    }

    // Generar asignaciones de tribu si es necesario
    ensureTribeAssignments();
  } catch (err) {
    console.error('❌ Error inicializando:', err);
  }
})();

// Habilitar auto-backup
enableAutoBackup();

// Escuchar notificaciones en primer plano
onForegroundMessage((payload: unknown) => {
  const data = payload as { notification?: { title?: string; body?: string } };
  if (data.notification) {
    sendLocalNotification(
      data.notification.title || 'Tribu Impulsa',
      data.notification.body || 'Nueva notificación'
    );
  }
});

console.log('🚀 Tribu Impulsa v2.0 - PWA Producción');
console.log('📊 Integridad de datos:', checkDataIntegrity());
console.log('🔔 Estado notificaciones:', getNotificationStatus());

// ============================================
// SINCRONIZACIÓN AUTOMÁTICA CON FIRESTORE
// ============================================

// Sincronizar usuario a la nube
export const syncUserToCloud = async (user: UserProfile) => {
  try {
    await syncProfileToCloud({
      id: user.id,
      name: user.name,
      companyName: user.companyName,
      category: user.category,
      location: user.city,
      bio: user.bio,
      instagram: user.instagram,
      website: user.website,
      phone: user.phone,
      email: user.email
    });
    console.log('☁️ Usuario sincronizado a la nube:', user.email);
  } catch (error) {
    console.error('Error sincronizando usuario:', error);
  }
};

// Sincronizar checklist a la nube
export const syncChecklistToCloud = async (userId: string, checklist: { toShare: Record<string, boolean>; shareWithMe: Record<string, boolean> }) => {
  try {
    const completed = Object.values(checklist.toShare).filter(Boolean).length +
      Object.values(checklist.shareWithMe).filter(Boolean).length;
    const total = Object.keys(checklist.toShare).length + Object.keys(checklist.shareWithMe).length;

    await syncChecklistProgress(userId, {
      completed,
      total,
      items: { ...checklist.toShare, ...checklist.shareWithMe }
    });
    console.log('☁️ Checklist sincronizado:', `${completed}/${total}`);
  } catch (error) {
    console.error('Error sincronizando checklist:', error);
  }
};

// Cargar perfil desde la nube
const loadUserFromCloud = async (userId: string): Promise<UserProfile | null> => {
  try {
    const cloudProfile = await getProfileFromCloud(userId);
    if (cloudProfile) {
      console.log('☁️ Perfil cargado desde la nube:', cloudProfile.email);
      return cloudProfile as unknown as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error cargando perfil de la nube:', error);
    return null;
  }
};

export const SURVEY_CATEGORY_OPTIONS = TRIBE_CATEGORY_OPTIONS;

// Afinidades generadas desde constants/affinities.ts - formato "Grupo - Label"
export const SURVEY_AFFINITY_OPTIONS = AFFINITIES.map(aff => `${aff.group} - ${aff.label}`);

export const SURVEY_SCOPE_OPTIONS = [
  { value: 'LOCAL', label: 'LOCAL (sólo si operas en una comuna específica)' },
  { value: 'REGIONAL', label: 'REGIONAL (si cubres una o varias regiones de Chile)' },
  { value: 'NACIONAL', label: 'NACIONAL (llegas a todo Chile)' }
];

export const SURVEY_REVENUE_OPTIONS = [
  'Menos de $500.000',
  '$500.000 - $2.000.000',
  '$2.000.000 - $5.000.000',
  '$5.000.000 - $10.000.000',
  'Más de $10.000.000'
];

// IMPORTANTE: Todas las claves usan el userId para segregar datos por usuario
export const getUserStorageKey = (baseKey: string): string => {
  const userId = localStorage.getItem('tribu_current_user') || 'guest';
  return `${baseKey}_${userId}`;
};

const TRIBE_ASSIGNMENTS_KEY = 'tribeAssignmentsData';
const TRIBE_STATUS_KEY = 'tribeAssignmentStatus';
const TRIBE_CHECKLIST_KEY = 'tribeAssignmentsChecklist';
const TRIBE_REPORTS_KEY = 'tribeReportsLog';
const TRIBE_SYNC_KEY = 'tribeAssignmentsSyncedAt';

type AssignmentChecklist = {
  toShare: Record<string, boolean>;
  shareWithMe: Record<string, boolean>;
};

type TribeStatus = 'PENDIENTE' | 'EN PROCESO' | 'COMPLETADO';

type TribeReport = {
  targetId: string;
  targetName: string;      // Nombre del emprendimiento
  targetOwner: string;     // Nombre del dueño
  reason: string;
  timestamp: string;
};

const buildChecklistFromAssignments = (data: TribeAssignments, existing?: AssignmentChecklist): AssignmentChecklist => {
  const buildMap = (list: MatchProfile[], previous: Record<string, boolean> = {}) => {
    return list.reduce<Record<string, boolean>>((acc, profile) => {
      acc[profile.id] = previous[profile.id] ?? false;
      return acc;
    }, {});
  };

  return {
    toShare: buildMap(data.toShare, existing?.toShare),
    shareWithMe: buildMap(data.shareWithMe, existing?.shareWithMe)
  };
};

const stampTribeSync = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_SYNC_KEY), new Date().toLocaleString('es-CL'));
};

const getTribeSyncedAt = (): string => {
  if (typeof window === 'undefined') return new Date().toLocaleString('es-CL');
  return localStorage.getItem(getUserStorageKey(TRIBE_SYNC_KEY)) ?? new Date().toLocaleString('es-CL');
};

const getStoredTribeAssignments = (category: string, userId?: string): TribeAssignments => {
  if (typeof window === 'undefined') {
    return generateTribeAssignments(category, userId);
  }

  // Key específica por usuario para que cada uno tenga sus propias asignaciones
  const storageKey = getUserStorageKey(TRIBE_ASSIGNMENTS_KEY);

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    const generated = generateTribeAssignments(category, userId);
    localStorage.setItem(storageKey, JSON.stringify(generated));
    stampTribeSync();
    return generated;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.toShare || !parsed?.shareWithMe) {
      throw new Error('invalid assignments');
    }
    return parsed;
  } catch (error) {
    console.warn('Error reading stored assignments', error);
    const fallback = generateTribeAssignments(category, userId);
    localStorage.setItem(storageKey, JSON.stringify(fallback));
    stampTribeSync();
    return fallback;
  }
};

const persistTribeAssignments = async (data: TribeAssignments, userId?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_ASSIGNMENTS_KEY), JSON.stringify(data));

  // Sincronizar a Firebase
  if (userId) {
    const month = new Date().toISOString().slice(0, 7); // "2025-01"
    await syncTribeAssignments(userId, {
      toShareIds: data.toShare.map(p => p.id),
      shareWithMeIds: data.shareWithMe.map(p => p.id),
      month
    });
  }
};

const getStoredChecklistState = (assignments: TribeAssignments): AssignmentChecklist => {
  if (typeof window === 'undefined') {
    return buildChecklistFromAssignments(assignments);
  }

  const storageKey = getUserStorageKey(TRIBE_CHECKLIST_KEY);
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    const initial = buildChecklistFromAssignments(assignments);
    localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = buildChecklistFromAssignments(assignments, parsed);
    localStorage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn('Error reading checklist', error);
    const fallback = buildChecklistFromAssignments(assignments);
    localStorage.setItem(storageKey, JSON.stringify(fallback));
    return fallback;
  }
};

const persistChecklistState = (data: AssignmentChecklist) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_CHECKLIST_KEY), JSON.stringify(data));
};

const checklistsAreEqual = (a: AssignmentChecklist, b: AssignmentChecklist): boolean => {
  const compare = (mapA: Record<string, boolean>, mapB: Record<string, boolean>) => {
    const keysA = Object.keys(mapA);
    if (keysA.length !== Object.keys(mapB).length) return false;
    return keysA.every(key => mapA[key] === mapB[key]);
  };

  return compare(a.toShare, b.toShare) && compare(a.shareWithMe, b.shareWithMe);
};

// Función para comprimir imagen
const compressImage = (file: File, maxWidth: number = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedBase64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const App = () => {
  console.log('🔍 App component mounting...');
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
