import { LaporanBudidaya, SyncStatus } from '../types';
import {
  getReports,
  saveReports,
  addNotification,
  addAuditLog,
  getCurrentUser,
} from './appState';

export interface SyncQueueItem {
  id: string;
  laporanId: string;
  action: 'CREATE' | 'UPDATE' | 'PANEN';
  createdAt: string;
  retryCount: number;
  reportData: Partial<LaporanBudidaya>;
}

const OFFLINE_STORAGE_KEYS = {
  SYNC_QUEUE: 'siperbawa_offline_sync_queue_v1',
  LAST_SYNC: 'siperbawa_last_sync_timestamp_v1',
};

type SyncListener = () => void;
const syncListeners: Set<SyncListener> = new Set();

export function subscribeSyncStatus(listener: SyncListener) {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

function notifySyncChanged() {
  syncListeners.forEach((fn) => fn());
}

/**
 * Get all queued offline reports waiting to be synchronized
 */
export function getOfflineQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline sync queue', e);
    return [];
  }
}

/**
 * Save queue back to localStorage
 */
export function saveOfflineQueue(queue: SyncQueueItem[]) {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    notifySyncChanged();
  } catch (e) {
    console.error('Failed to save offline sync queue', e);
  }
}

/**
 * Enqueue a report for offline synchronization
 */
export function enqueueOfflineReport(
  laporanId: string,
  action: 'CREATE' | 'UPDATE' | 'PANEN',
  reportData: Partial<LaporanBudidaya>
) {
  const queue = getOfflineQueue();
  const existingIdx = queue.findIndex((item) => item.laporanId === laporanId);

  const newItem: SyncQueueItem = {
    id: `QUEUE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    laporanId,
    action,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    reportData,
  };

  if (existingIdx !== -1) {
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }

  saveOfflineQueue(queue);
}

/**
 * Remove an item from the offline sync queue
 */
export function dequeueOfflineReport(laporanId: string) {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.laporanId !== laporanId);
  saveOfflineQueue(filtered);
}

/**
 * Submit or update a report with offline-first support.
 * If navigator is offline or forceOffline is true, saves to localStorage with PENDING_SYNC status.
 */
export function submitReportOfflineFirst(
  reportData: Partial<LaporanBudidaya>,
  isDraft: boolean = false
): { report: LaporanBudidaya; wasOffline: boolean } {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isOffline = !isOnline;

  const reports = getReports();
  const currentUser = getCurrentUser();
  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let targetReport: LaporanBudidaya;

  if (reportData.id) {
    // Existing report update
    const index = reports.findIndex((r) => r.id === reportData.id);
    if (index !== -1) {
      const syncStatus: SyncStatus = isOffline && !isDraft ? 'PENDING_SYNC' : 'SYNCED';
      reports[index] = {
        ...reports[index],
        ...reportData,
        status: isDraft ? 'DRAFT_LOKAL' : reports[index].status === 'DRAFT_LOKAL' ? 'TERKIRIM' : reports[index].status,
        syncStatus,
        isOfflineCreated: isOffline || reports[index].isOfflineCreated,
        offlineSavedAt: isOffline ? now : reports[index].offlineSavedAt,
        tanggalUpdate: now,
      } as LaporanBudidaya;
      targetReport = reports[index];

      if (isOffline && !isDraft) {
        enqueueOfflineReport(targetReport.id, 'UPDATE', targetReport);
      } else {
        dequeueOfflineReport(targetReport.id);
      }
    } else {
      throw new Error('Laporan tidak ditemukan.');
    }
  } else {
    // New report creation
    const newId = `LAP-${new Date().getFullYear()}-${String(
      reports.length + 1
    ).padStart(3, '0')}`;

    const syncStatus: SyncStatus = isDraft
      ? 'SYNCED'
      : isOffline
      ? 'PENDING_SYNC'
      : 'SYNCED';

    targetReport = {
      id: newId,
      userId: currentUser.id,
      userName: currentUser.name,
      userNrp: currentUser.username,
      userPolres: currentUser.polres,
      kelompokTani: reportData.kelompokTani || {
        namaKelompok: '',
        ketuaKelompok: '',
        noHpKetua: '',
        pplName: '',
        noHpPpl: '',
      },
      dataLahan: reportData.dataLahan || {
        desaKelurahan: '',
        rtRw: '',
        kecamatan: '',
        kabupaten: '',
        provinsi: 'Sulawesi Selatan',
        latitude: -3.5642,
        longitude: 119.7731,
        luasLahanTotalM2: 10000,
        luasTanamM2: 8000,
        jumlahBibitKg: 960,
        produksiPanenKg: 7200,
        ketinggianMdpl: 900,
        jenisTanah: 'Andosol (Sangat Subur)',
        jenisIrigasi: 'Irigasi Teknis / Perpipaan',
        curahHujanMmBulan: 150,
        varietasBawang: 'Lumbu Hijau',
      },
      catatanLapangan: reportData.catatanLapangan || '',
      statusTanaman: reportData.statusTanaman || 'Vegetatif (0-45 HST)',
      buktiFoto: reportData.buktiFoto || [],
      status: isDraft ? 'DRAFT_LOKAL' : 'TERKIRIM',
      syncStatus,
      isOfflineCreated: isOffline,
      offlineSavedAt: isOffline ? now : undefined,
      tanggalInput: now,
      tanggalUpdate: now,
    };

    reports.unshift(targetReport);

    if (isOffline && !isDraft) {
      enqueueOfflineReport(targetReport.id, 'CREATE', targetReport);
    }
  }

  saveReports(reports);

  // If online and not a draft, create immediate notification and audit log
  if (!isDraft && !isOffline) {
    addNotification({
      recipientUserId: 'ADMIN_ALL',
      targetRole: 'ADMIN_PUSAT',
      title: 'Laporan Lahan Masuk Baru',
      message: `${currentUser.name} (${currentUser.polres}) menginput data lahan ${targetReport.dataLahan.desaKelurahan} seluas ${targetReport.dataLahan.luasTanamM2} m².`,
      type: 'NEW_REPORT',
      laporanId: targetReport.id,
      priority: 'medium',
    });

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'CREATE_REPORT',
      laporanId: targetReport.id,
      targetInfo: `Laporan ${targetReport.id} (${targetReport.dataLahan.desaKelurahan})`,
      details: `Mengirimkan data lahan baru seluas ${targetReport.dataLahan.luasTanamM2} m²`,
    });
  } else if (!isDraft && isOffline) {
    // Add local audit log entry
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'CREATE_REPORT',
      laporanId: targetReport.id,
      targetInfo: `[OFFLINE] Laporan ${targetReport.id} (${targetReport.dataLahan.desaKelurahan})`,
      details: `Tersimpan di penyimpanan lokal (offline) seluas ${targetReport.dataLahan.luasTanamM2} m² - menunggu sinkronisasi internet`,
    });
  }

  return { report: targetReport, wasOffline: isOffline };
}

/**
 * Process all items currently queued in offline storage and sync them.
 */
export async function processOfflineSyncQueue(): Promise<{
  syncedCount: number;
  failedCount: number;
}> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const reports = getReports();
  let syncedCount = 0;
  let failedCount = 0;
  const remainingQueue: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      const repIdx = reports.findIndex((r) => r.id === item.laporanId);
      if (repIdx !== -1) {
        reports[repIdx] = {
          ...reports[repIdx],
          syncStatus: 'SYNCED',
        };

        // Trigger Admin notification and audit log upon successful sync
        addNotification({
          recipientUserId: 'ADMIN_ALL',
          targetRole: 'ADMIN_PUSAT',
          title: 'Sinkronisasi Laporan Offline Berhasil',
          message: `Laporan ${reports[repIdx].id} dari ${reports[repIdx].userName} (${reports[repIdx].dataLahan.desaKelurahan}) telah berhasil disinkronkan setelah kembali online.`,
          type: 'NEW_REPORT',
          laporanId: reports[repIdx].id,
          priority: 'medium',
        });

        addAuditLog({
          actorId: reports[repIdx].userId,
          actorName: reports[repIdx].userName,
          actorRole: 'BHABINKAMTIBMAS',
          actionType: 'CREATE_REPORT',
          laporanId: reports[repIdx].id,
          targetInfo: `[SYNC ONLINE] Laporan ${reports[repIdx].id}`,
          details: `Laporan offline berhasil disinkronkan ke server pusat saat online`,
        });

        syncedCount++;
      } else {
        // Report was deleted or not found
        syncedCount++;
      }
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err);
      failedCount++;
      remainingQueue.push({
        ...item,
        retryCount: item.retryCount + 1,
      });
    }
  }

  saveReports(reports);
  saveOfflineQueue(remainingQueue);
  localStorage.setItem(
    OFFLINE_STORAGE_KEYS.LAST_SYNC,
    new Date().toISOString()
  );

  return { syncedCount, failedCount };
}
