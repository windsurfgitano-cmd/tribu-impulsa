import { useEffect, useMemo, useState } from 'react';

type ProfilesProgress = {
  current: number;
  target: number;
  percent: number;
  remaining: number;
  nextMilestone: number;
  loading: boolean;
};

const DEFAULT_TARGET = 1000;

export const useProfilesProgress = (): ProfilesProgress => {
  const [current, setCurrent] = useState<number>(1);
  const [target, setTarget] = useState<number>(DEFAULT_TARGET);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const { getFirestoreInstance } = await import('../services/firebaseService');
        const { doc, onSnapshot } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (!db) {
          setLoading(false);
          return;
        }

        const statsRef = doc(db, 'system_stats', 'global');
        unsubscribe = onSnapshot(
          statsRef,
          snapshot => {
            const data = snapshot.data() || {};
            setCurrent(typeof data.profilesCompleted === 'number' ? data.profilesCompleted : 0);
            setTarget(typeof data.profilesTarget === 'number' ? data.profilesTarget : DEFAULT_TARGET);
            setLoading(false);
          },
          error => {
            console.error('❌ Error escuchando system_stats/global:', error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('❌ Error inicializando hook useProfilesProgress:', error);
        setLoading(false);
      }
    };

    init();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const stats = useMemo(() => {
    const safeTarget = target || DEFAULT_TARGET;
    const percent = Math.min(100, Math.round((current / safeTarget) * 100));
    const remaining = Math.max(0, safeTarget - current);
    const milestoneStep = 50;
    const nextMilestone = current >= safeTarget
      ? safeTarget
      : Math.min(safeTarget, Math.ceil(current / milestoneStep) * milestoneStep || milestoneStep);

    return {
      current,
      target: safeTarget,
      percent,
      remaining,
      nextMilestone,
      loading
    };
  }, [current, target, loading]);

  return stats;
};
