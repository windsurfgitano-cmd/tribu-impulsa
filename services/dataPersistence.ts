// Sistema de Persistencia de Datos - Tribu Impulsa
// Permite exportar e importar todos los datos para no perderlos

export interface DataBackup {
  version: string;
  exportedAt: string;
  data: {
    users: unknown[];
    notifications: unknown[];
    interactions: unknown[];
    reports: unknown[];
    assignments: unknown;
    checklists: unknown;
    onboarding: unknown;
  };
}

// Todas las keys de localStorage que usamos
const STORAGE_KEYS = [
  'tribu_users',
  'tribu_notifications',
  'tribu_interactions',
  'tribu_reports',
  'tribu_assignments',
  'tribu_assignments_updated',
  'tribu_checklists',
  'tribu_onboarding',
  'tribeReportsLog',
  'tribe_session',
  'tribe_survey_complete',
  'current_user_id'
];

// Exportar todos los datos a un objeto JSON
export const exportAllData = (): DataBackup => {
  const data: Record<string, unknown> = {};
  
  for (const key of STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  }
  
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    data: {
      users: data['tribu_users'] as unknown[] || [],
      notifications: data['tribu_notifications'] as unknown[] || [],
      interactions: data['tribu_interactions'] as unknown[] || [],
      reports: data['tribu_reports'] as unknown[] || [],
      assignments: data['tribu_assignments'] || {},
      checklists: data['tribu_checklists'] || {},
      onboarding: data['tribu_onboarding'] || {}
    }
  };
};

// Importar datos desde un backup
export const importAllData = (backup: DataBackup): { success: boolean; message: string } => {
  try {
    if (!backup.version || !backup.data) {
      return { success: false, message: 'Formato de backup inválido' };
    }
    
    // Restaurar cada tipo de dato
    if (backup.data.users) {
      localStorage.setItem('tribu_users', JSON.stringify(backup.data.users));
    }
    if (backup.data.notifications) {
      localStorage.setItem('tribu_notifications', JSON.stringify(backup.data.notifications));
    }
    if (backup.data.interactions) {
      localStorage.setItem('tribu_interactions', JSON.stringify(backup.data.interactions));
    }
    if (backup.data.reports) {
      localStorage.setItem('tribu_reports', JSON.stringify(backup.data.reports));
    }
    if (backup.data.assignments) {
      localStorage.setItem('tribu_assignments', JSON.stringify(backup.data.assignments));
    }
    if (backup.data.checklists) {
      localStorage.setItem('tribu_checklists', JSON.stringify(backup.data.checklists));
    }
    if (backup.data.onboarding) {
      localStorage.setItem('tribu_onboarding', JSON.stringify(backup.data.onboarding));
    }
    
    return { 
      success: true, 
      message: `Datos restaurados desde backup del ${new Date(backup.exportedAt).toLocaleDateString()}` 
    };
  } catch (error) {
    return { success: false, message: `Error al importar: ${error}` };
  }
};

// Descargar backup como archivo JSON
export const downloadBackup = (): void => {
  const backup = exportAllData();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `tribu-impulsa-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Subir y restaurar desde archivo
export const uploadAndRestoreBackup = (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content) as DataBackup;
        const result = importAllData(backup);
        resolve(result);
      } catch (error) {
        resolve({ success: false, message: `Error al leer archivo: ${error}` });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Error al leer el archivo' });
    };
    
    reader.readAsText(file);
  });
};

// Auto-backup cada hora (guarda en localStorage con timestamp)
export const enableAutoBackup = (): void => {
  const BACKUP_KEY = 'tribu_auto_backup';
  const BACKUP_INTERVAL = 60 * 60 * 1000; // 1 hora
  
  const doBackup = () => {
    const backup = exportAllData();
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    console.log('💾 Auto-backup guardado:', new Date().toLocaleTimeString());
  };
  
  // Backup inicial
  doBackup();
  
  // Backup periódico
  setInterval(doBackup, BACKUP_INTERVAL);
};

// Restaurar desde auto-backup
export const restoreFromAutoBackup = (): { success: boolean; message: string } => {
  const BACKUP_KEY = 'tribu_auto_backup';
  const stored = localStorage.getItem(BACKUP_KEY);
  
  if (!stored) {
    return { success: false, message: 'No hay auto-backup disponible' };
  }
  
  try {
    const backup = JSON.parse(stored) as DataBackup;
    return importAllData(backup);
  } catch {
    return { success: false, message: 'Error al restaurar auto-backup' };
  }
};

// Verificar integridad de datos
export const checkDataIntegrity = (): { 
  isValid: boolean; 
  issues: string[];
  stats: Record<string, number>;
} => {
  const issues: string[] = [];
  const stats: Record<string, number> = {};
  
  // Verificar usuarios
  try {
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    stats['users'] = users.length;
    if (users.length === 0) issues.push('No hay usuarios cargados');
  } catch {
    issues.push('Datos de usuarios corruptos');
    stats['users'] = 0;
  }
  
  // Verificar asignaciones
  try {
    const assignments = JSON.parse(localStorage.getItem('tribu_assignments') || '{}');
    stats['assignments'] = Object.keys(assignments).length;
  } catch {
    issues.push('Datos de asignaciones corruptos');
    stats['assignments'] = 0;
  }
  
  // Verificar reportes
  try {
    const reports = JSON.parse(localStorage.getItem('tribu_reports') || '[]');
    stats['reports'] = reports.length;
  } catch {
    issues.push('Datos de reportes corruptos');
    stats['reports'] = 0;
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    stats
  };
};

// Limpiar todos los datos (reset completo)
export const clearAllData = (): void => {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  console.log('🗑️ Todos los datos eliminados');
};

export default {
  exportAllData,
  importAllData,
  downloadBackup,
  uploadAndRestoreBackup,
  enableAutoBackup,
  restoreFromAutoBackup,
  checkDataIntegrity,
  clearAllData
};
