// hooks/useTribe.ts
// Hook para gestión de asignaciones de tribu

import { useState, useEffect, useCallback } from 'react';
import { TribeAssignments } from '../types';
import {
  getStoredTribeAssignments,
  getStoredChecklistState,
  persistChecklistState,
  getStoredTribeStatus,
  persistTribeStatus,
  getTribeStatsSnapshot,
  checklistsAreEqual,
  AssignmentChecklist,
  TribeStatus,
  TribeReport,
  persistReport,
  getStoredReports
} from '../services/tribeStorage';

export type TribeState = {
  assignments: TribeAssignments | null;
  checklist: AssignmentChecklist;
  status: TribeStatus;
  stats: {
    completed: number;
    total: number;
    pending: number;
    reports: number;
    syncedAt: string;
  };
  isLoading: boolean;
};

export type TribeActions = {
  toggleShare: (profileId: string, type: 'toShare' | 'shareWithMe') => void;
  updateStatus: (status: TribeStatus) => void;
  submitReport: (report: Omit<TribeReport, 'timestamp'>) => void;
  refreshAssignments: () => void;
};

/**
 * Hook para gestión de tribu y asignaciones
 */
export const useTribe = (userCategory: string, userId?: string): TribeState & TribeActions => {
  const [assignments, setAssignments] = useState<TribeAssignments | null>(null);
  const [checklist, setChecklist] = useState<AssignmentChecklist>({ toShare: {}, shareWithMe: {} });
  const [status, setStatus] = useState<TribeStatus>('PENDIENTE');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    if (!userCategory) return;
    
    const loadedAssignments = getStoredTribeAssignments(userCategory, userId);
    const loadedChecklist = getStoredChecklistState(loadedAssignments);
    const loadedStatus = getStoredTribeStatus();
    
    setAssignments(loadedAssignments);
    setChecklist(loadedChecklist);
    setStatus(loadedStatus);
    setIsLoading(false);
  }, [userCategory, userId]);

  // Toggle de compartir
  const toggleShare = useCallback((profileId: string, type: 'toShare' | 'shareWithMe') => {
    setChecklist(prev => {
      const updated = {
        ...prev,
        [type]: {
          ...prev[type],
          [profileId]: !prev[type][profileId]
        }
      };
      
      // Persistir cambios
      if (!checklistsAreEqual(prev, updated)) {
        persistChecklistState(updated);
      }
      
      return updated;
    });
  }, []);

  // Actualizar estado
  const updateStatus = useCallback((newStatus: TribeStatus) => {
    setStatus(newStatus);
    persistTribeStatus(newStatus);
  }, []);

  // Enviar reporte
  const submitReport = useCallback((report: Omit<TribeReport, 'timestamp'>) => {
    const fullReport: TribeReport = {
      ...report,
      timestamp: new Date().toISOString()
    };
    persistReport(fullReport);
  }, []);

  // Refrescar asignaciones
  const refreshAssignments = useCallback(() => {
    if (!userCategory) return;
    setIsLoading(true);
    const loadedAssignments = getStoredTribeAssignments(userCategory, userId);
    const loadedChecklist = getStoredChecklistState(loadedAssignments);
    setAssignments(loadedAssignments);
    setChecklist(loadedChecklist);
    setIsLoading(false);
  }, [userCategory, userId]);

  // Calcular stats
  const stats = assignments ? getTribeStatsSnapshot(userCategory, userId) : {
    completed: 0,
    total: 0,
    pending: 0,
    reports: 0,
    syncedAt: new Date().toLocaleString('es-CL')
  };

  return {
    assignments,
    checklist,
    status,
    stats,
    isLoading,
    toggleShare,
    updateStatus,
    submitReport,
    refreshAssignments
  };
};

