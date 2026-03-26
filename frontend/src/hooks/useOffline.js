import { useEffect, useState } from 'react';
import OfflineManager from '../services/offline/OfflineManager';

export function useOfflineStatus() {
  const [status, setStatus] = useState(OfflineManager.getStatus());

  useEffect(() => {
    const unsubscribe = OfflineManager.subscribe((newStatus) => {
      setStatus({
        isOnline: newStatus === 'online',
        lastUpdated: new Date(),
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
}

export function useOnlineOnly() {
  const { isOnline } = useOfflineStatus();
  return isOnline;
}
