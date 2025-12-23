// services/shareStorage.ts
// Funciones de almacenamiento de registros de cumplimiento (compartidos)

export interface ShareRecord {
  id: string;
  profileId: string;
  profileName: string;
  type: 'shared_to' | 'received_from'; // shared_to = yo compartí, received_from = me compartieron
  contentUrl: string;
  timestamp: string;
  userId: string;
}

const SHARE_RECORDS_KEY = 'tribu_share_records';

export const getShareRecords = (): ShareRecord[] => {
  try {
    const stored = localStorage.getItem(SHARE_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const saveShareRecord = (record: Omit<ShareRecord, 'id' | 'timestamp'>): ShareRecord => {
  const records = getShareRecords();
  const newRecord: ShareRecord = {
    ...record,
    id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  records.push(newRecord);
  localStorage.setItem(SHARE_RECORDS_KEY, JSON.stringify(records));
  return newRecord;
};

export const clearShareRecords = (): void => {
  localStorage.removeItem(SHARE_RECORDS_KEY);
};

