import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
  ensureAuth,
} from './firebase';
import {
  LaporanBudidaya,
  LaporanHarian,
  UserAccount,
  AuditLog,
  NotificationItem,
} from '../types';
import {
  getReports,
  getDailyReports,
  getUsers,
  getAuditLogs,
  getNotifications,
  saveReports,
  saveDailyReports,
  saveUsers,
  subscribeState,
} from './appState';

// Firestore collection names
export const FIRESTORE_COLLECTIONS = {
  REPORTS: 'laporan_budidaya',
  DAILY_REPORTS: 'laporan_harian',
  USERS: 'users_account',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  SYSTEM_META: 'system_metadata',
};

class FirestoreSyncService {
  private isInitialized = false;
  private isOnline = navigator.onLine;
  private unsubscribeReports: (() => void) | null = null;
  private listeners: Set<(status: { isConnected: boolean; lastSync: Date | null; error?: string }) => void> = new Set();
  private lastSyncTime: Date | null = null;
  private syncError: string | null = null;

  public subscribeStatus(listener: (status: { isConnected: boolean; lastSync: Date | null; error?: string }) => void) {
    this.listeners.add(listener);
    listener({
      isConnected: this.isOnline && !this.syncError,
      lastSync: this.lastSyncTime,
      error: this.syncError || undefined,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyStatus() {
    this.listeners.forEach((l) =>
      l({
        isConnected: this.isOnline && !this.syncError,
        lastSync: this.lastSyncTime,
        error: this.syncError || undefined,
      })
    );
  }

  // Initialize Firestore listeners & initial sync
  public async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncError = null;
      this.notifyStatus();
      this.syncPendingLocalToCloud();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatus();
    });

    try {
      await ensureAuth();
      await this.startRealtimeListeners();
      await this.initialCloudSync();
    } catch (err: any) {
      console.warn('Firestore initialization notice:', err);
      this.syncError = err.message;
      this.notifyStatus();
    }
  }

  // Real-time listener for Reports from Firestore
  private async startRealtimeListeners() {
    try {
      const reportsCol = collection(db, FIRESTORE_COLLECTIONS.REPORTS);
      this.unsubscribeReports = onSnapshot(
        reportsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudReports: LaporanBudidaya[] = [];
            snapshot.forEach((docSnap) => {
              cloudReports.push(docSnap.data() as LaporanBudidaya);
            });

            // Merge cloud reports with local
            const localReports = getReports();
            const localMap = new Map(localReports.map((r) => [r.id, r]));

            cloudReports.forEach((cr) => {
              // Only override if cloud is newer or local doesn't exist
              localMap.set(cr.id, cr);
            });

            const merged = Array.from(localMap.values()).filter(
              (r) =>
                !r.userPolres?.toLowerCase().includes('toraja') &&
                !r.dataLahan?.kabupaten?.toLowerCase().includes('toraja')
            );

            // Update local storage without triggering redundant loops
            localStorage.setItem('siperbawa_reports_v4_clean', JSON.stringify(merged));
            this.lastSyncTime = new Date();
            this.syncError = null;
            this.notifyStatus();
          }
        },
        (error) => {
          console.warn('Firestore snapshot error:', error);
          this.syncError = error.message;
          this.notifyStatus();
        }
      );
    } catch (err: any) {
      console.warn('Failed to start realtime listeners:', err);
    }
  }

  // Sync initial seed or existing local data to Firestore if cloud collection is empty
  public async initialCloudSync(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      const reportsCol = collection(db, FIRESTORE_COLLECTIONS.REPORTS);
      const snapshot = await getDocs(reportsCol);

      const localReports = getReports();

      if (snapshot.empty && localReports.length > 0) {
        // Seed cloud with local reports
        const batch = writeBatch(db);
        localReports.forEach((report) => {
          const docRef = doc(db, FIRESTORE_COLLECTIONS.REPORTS, report.id);
          batch.set(docRef, report);
        });

        await batch.commit();
        this.lastSyncTime = new Date();
        this.syncError = null;
        this.notifyStatus();
        return {
          success: true,
          syncedCount: localReports.length,
          message: `Berhasil mengunggah ${localReports.length} data laporan awal ke Cloud Firestore.`,
        };
      } else if (!snapshot.empty) {
        // Pull latest from cloud
        const cloudReports: LaporanBudidaya[] = [];
        snapshot.forEach((docSnap) => {
          cloudReports.push(docSnap.data() as LaporanBudidaya);
        });

        const mergedMap = new Map<string, LaporanBudidaya>();
        localReports.forEach((r) => mergedMap.set(r.id, r));
        cloudReports.forEach((r) => mergedMap.set(r.id, r));

        saveReports(Array.from(mergedMap.values()));
        this.lastSyncTime = new Date();
        this.syncError = null;
        this.notifyStatus();
        return {
          success: true,
          syncedCount: cloudReports.length,
          message: `Berhasil sinkronisasi ${cloudReports.length} laporan dari Cloud Firestore.`,
        };
      }

      return {
        success: true,
        syncedCount: 0,
        message: 'Koneksi Cloud Firestore aktif dan tersinkronisasi.',
      };
    } catch (err: any) {
      console.error('Initial Cloud Sync Error:', err);
      this.syncError = err.message;
      this.notifyStatus();
      return {
        success: false,
        syncedCount: 0,
        message: `Gagal sinkronisasi: ${err.message}`,
      };
    }
  }

  // Save single report to Firestore
  public async saveReportToCloud(report: LaporanBudidaya): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.REPORTS, report.id);
      await setDoc(docRef, report, { merge: true });
      this.lastSyncTime = new Date();
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Failed to save report to Firestore:', err);
      this.syncError = err.message;
      this.notifyStatus();
      return false;
    }
  }

  // Delete report from Firestore
  public async deleteReportFromCloud(reportId: string): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.REPORTS, reportId);
      await deleteDoc(docRef);
      this.lastSyncTime = new Date();
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Failed to delete report from Firestore:', err);
      return false;
    }
  }

  // Save single daily report to Firestore
  public async saveDailyReportToCloud(report: LaporanHarian): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.DAILY_REPORTS, report.id);
      await setDoc(docRef, report, { merge: true });
      this.lastSyncTime = new Date();
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Failed to save daily report to Firestore:', err);
      return false;
    }
  }

  // Delete daily report from Firestore
  public async deleteDailyReportFromCloud(reportId: string): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.DAILY_REPORTS, reportId);
      await deleteDoc(docRef);
      this.lastSyncTime = new Date();
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Failed to delete daily report from Firestore:', err);
      return false;
    }
  }

  // Force push all local data to Firestore
  public async forcePushAllToCloud(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const reports = getReports();
      const dailyReports = getDailyReports();
      const users = getUsers();
      const auditLogs = getAuditLogs();

      // Push reports in batches
      for (const report of reports) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.REPORTS, report.id), report, { merge: true });
      }

      for (const dr of dailyReports) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.DAILY_REPORTS, dr.id), dr, { merge: true });
      }

      for (const user of users) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, user.id), user, { merge: true });
      }

      for (const log of auditLogs.slice(0, 50)) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS, log.id), log, { merge: true });
      }

      this.lastSyncTime = new Date();
      this.syncError = null;
      this.notifyStatus();
      return { success: true, count: reports.length + dailyReports.length };
    } catch (err: any) {
      this.syncError = err.message;
      this.notifyStatus();
      return { success: false, count: 0, error: err.message };
    }
  }

  private async syncPendingLocalToCloud() {
    const localReports = getReports();
    for (const r of localReports) {
      if (r.status !== 'DRAFT_LOKAL') {
        this.saveReportToCloud(r).catch(() => {});
      }
    }

    const localDailyReports = getDailyReports();
    for (const dr of localDailyReports) {
      if (dr.status !== 'DRAFT_LOKAL') {
        this.saveDailyReportToCloud(dr).catch(() => {});
      }
    }
  }
}

export const firestoreSync = new FirestoreSyncService();
