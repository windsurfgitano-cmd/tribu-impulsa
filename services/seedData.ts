// Seed Data - YA NO SE USA
// Los usuarios reales están en services/realUsersData.ts
// Este archivo se mantiene solo por compatibilidad con imports antiguos

import { UserProfile } from './databaseService';

// ⚠️ ARRAY VACÍO - No agregar datos fake aquí
// Los 9 usuarios reales están en services/realUsersData.ts
export const SEED_USERS: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'surveyCompleted' | 'tribeAssigned'>[] = [];

// Función deshabilitada - Ya no cargamos seed users fake
export const loadSeedUsers = (): void => {
  console.log('⚠️ loadSeedUsers() deshabilitada - Solo usuarios reales de Firebase');
};

// Función deshabilitada - Ya no cargamos seed users fake
export const resetAndLoadSeed = (): void => {
  console.log('⚠️ resetAndLoadSeed() deshabilitada - Solo usuarios reales de Firebase');
};
