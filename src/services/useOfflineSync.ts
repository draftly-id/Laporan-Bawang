import { useState, useEffect } from 'react';
import {
  getOfflineQueue,
  processOfflineSyncQueue,
  SyncQueueItem,
  subscribeSyncStatus,
} from './offlineSyncService';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<SyncQueueItem[]>(getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        await processOfflineSyncQueue();
        setLastSyncTime(new Date());
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = subscribeSyncStatus(() => {
      setQueue(getOfflineQueue());
    });

    // Check on mount if we're online and there are pending items
    if (navigator.onLine && getOfflineQueue().length > 0) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const triggerManualSync = async () => {
    if (!navigator.onLine) {
      throw new Error('Perangkat masih dalam keadaan offline (tidak ada koneksi internet).');
    }
    setIsSyncing(true);
    try {
      const result = await processOfflineSyncQueue();
      setLastSyncTime(new Date());
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingQueueCount: queue.length,
    pendingQueue: queue,
    isSyncing,
    lastSyncTime,
    triggerManualSync,
  };
}
