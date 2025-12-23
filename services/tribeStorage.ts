// services/tribeStorage.ts
// Gestión del almacenamiento local de asignaciones de tribu

import { MatchProfile, TribeAssignments } from '../types';
import { generateTribeAssignments } from './matchService';
import { syncTribeAssignments, logInteraction } from './firebaseService';
import { getUserStorageKey } from '../utils/storage';

// Claves de storage
const TRIBE_ASSIGNMENTS_KEY = 'tribeAssignmentsData';
const TRIBE_STATUS_KEY = 'tribeAssignmentStatus';
const TRIBE_CHECKLIST_KEY = 'tribeAssignmentsChecklist';
const TRIBE_REPORTS_KEY = 'tribeReportsLog';
const TRIBE_SYNC_KEY = 'tribeAssignmentsSyncedAt';

// Tipos
export type AssignmentChecklist = {
  toShare: Record<string, boolean>;
  shareWithMe: Record<string, boolean>;
};

export type TribeStatus = 'PENDIENTE' | 'EN PROCESO' | 'COMPLETADO';

export type TribeReport = {
  targetId: string;
  targetName: string;
  targetOwner: string;
  reason: string;
  timestamp: string;
};

/**
 * Construye un checklist basado en las asignaciones
 */
export const buildChecklistFromAssignments = (
  data: TribeAssignments, 
  existing?: AssignmentChecklist
): AssignmentChecklist => {
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

/**
 * Marca la última sincronización de tribu
 */
export const stampTribeSync = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_SYNC_KEY), new Date().toLocaleString('es-CL'));
};

/**
 * Obtiene la última fecha de sincronización
 */
export const getTribeSyncedAt = (): string => {
  if (typeof window === 'undefined') return new Date().toLocaleString('es-CL');
  return localStorage.getItem(getUserStorageKey(TRIBE_SYNC_KEY)) ?? new Date().toLocaleString('es-CL');
};

/**
 * Obtiene las asignaciones de tribu almacenadas o genera nuevas
 */
export const getStoredTribeAssignments = (category: string, userId?: string): TribeAssignments => {
  if (typeof window === 'undefined') {
    return generateTribeAssignments(category, userId);
  }

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

/**
 * Persiste las asignaciones de tribu localmente y en Firebase
 */
export const persistTribeAssignments = async (data: TribeAssignments, userId?: string): Promise<void> => {
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

/**
 * Obtiene el estado del checklist
 */
export const getStoredChecklistState = (assignments: TribeAssignments): AssignmentChecklist => {
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

/**
 * Persiste el estado del checklist
 */
export const persistChecklistState = (data: AssignmentChecklist): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_CHECKLIST_KEY), JSON.stringify(data));
};

/**
 * Compara dos checklists para verificar si son iguales
 */
export const checklistsAreEqual = (a: AssignmentChecklist, b: AssignmentChecklist): boolean => {
  const compare = (mapA: Record<string, boolean>, mapB: Record<string, boolean>) => {
    const keysA = Object.keys(mapA);
    if (keysA.length !== Object.keys(mapB).length) return false;
    return keysA.every(key => mapA[key] === mapB[key]);
  };

  return compare(a.toShare, b.toShare) && compare(a.shareWithMe, b.shareWithMe);
};

/**
 * Obtiene el estado de la tribu
 */
export const getStoredTribeStatus = (): TribeStatus => {
  if (typeof window === 'undefined') return 'PENDIENTE';
  return (localStorage.getItem(getUserStorageKey(TRIBE_STATUS_KEY)) as TribeStatus) ?? 'PENDIENTE';
};

/**
 * Persiste el estado de la tribu
 */
export const persistTribeStatus = (status: TribeStatus): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_STATUS_KEY), status);
};

/**
 * Resetea todo el almacenamiento de tribu
 */
export const resetTribeStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getUserStorageKey(TRIBE_ASSIGNMENTS_KEY));
  localStorage.removeItem(getUserStorageKey(TRIBE_CHECKLIST_KEY));
  localStorage.removeItem(getUserStorageKey(TRIBE_STATUS_KEY));
  localStorage.removeItem(getUserStorageKey(TRIBE_REPORTS_KEY));
};

/**
 * Obtiene los reportes almacenados
 */
export const getStoredReports = (): TribeReport[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(getUserStorageKey(TRIBE_REPORTS_KEY));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Error reading tribe reports', error);
    return [];
  }
};

/**
 * Persiste un nuevo reporte
 */
export const persistReport = (report: TribeReport): void => {
  if (typeof window === 'undefined') return;
  const current = getStoredReports();
  const next = [...current, report];
  localStorage.setItem(getUserStorageKey(TRIBE_REPORTS_KEY), JSON.stringify(next));

  // ☁️ Sincronizar a Firestore
  const userId = localStorage.getItem('tribu_current_user');
  if (userId) {
    logInteraction(userId, 'report', {
      targetId: report.targetId,
      targetName: report.targetName,
      reason: report.reason,
      timestamp: report.timestamp
    });
  }
};

/**
 * Obtiene un snapshot de estadísticas de tribu
 */
export const getTribeStatsSnapshot = (userCategory: string, userId?: string) => {
  const assignments = getStoredTribeAssignments(userCategory, userId);
  const checklist = getStoredChecklistState(assignments);
  const completed = Object.values(checklist.toShare).filter(Boolean).length + 
                   Object.values(checklist.shareWithMe).filter(Boolean).length;
  const total = assignments.toShare.length + assignments.shareWithMe.length;
  const reports = getStoredReports().length;
  const syncedAt = getTribeSyncedAt();
  
  return {
    completed,
    total,
    pending: Math.max(total - completed, 0),
    reports,
    syncedAt
  };
};

