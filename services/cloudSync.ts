// services/cloudSync.ts
// Funciones para sincronizar datos con Firebase Cloud

import { UserProfile } from './databaseService';
import { syncProfileToCloud, syncChecklistProgress } from './firebaseService';

/**
 * Sincronizar usuario a la nube
 */
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

/**
 * Sincronizar checklist a la nube
 */
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

