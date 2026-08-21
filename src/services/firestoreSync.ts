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
  saveNotifications,
  subscribeState,
} from './appState';
import { INITIAL_USERS } from '../data/mockData';

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
  private unsubscribeUsers: (() => void) | null = null;
  private unsubscribeDailyReports: (() => void) | null = null;
  private unsubscribeAuditLogs: (() => void) | null = null;
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

  // Real-time listeners for all core collections from Firestore
  private async startRealtimeListeners() {
    try {
      // 1. Reports listener
      const reportsCol = collection(db, FIRESTORE_COLLECTIONS.REPORTS);
      this.unsubscribeReports = onSnapshot(
        reportsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudReports: LaporanBudidaya[] = [];
            snapshot.forEach((docSnap) => {
              cloudReports.push(docSnap.data() as LaporanBudidaya);
            });

            const localReports = getReports();
            const localMap = new Map(localReports.map((r) => [r.id, r]));

            cloudReports.forEach((cr) => {
              localMap.set(cr.id, cr);
            });

            const merged = Array.from(localMap.values()).filter(
              (r) =>
                !r.userPolres?.toLowerCase().includes('toraja') &&
                !r.dataLahan?.kabupaten?.toLowerCase().includes('toraja')
            );

            localStorage.setItem('siperbawa_reports_v4_clean', JSON.stringify(merged));
            this.lastSyncTime = new Date();
            this.syncError = null;
            this.notifyStatus();
          }
        },
        (error) => {
          console.warn('Firestore reports snapshot error:', error);
          this.syncError = error.message;
          this.notifyStatus();
        }
      );

      // 2. Users Account listener
      const usersCol = collection(db, FIRESTORE_COLLECTIONS.USERS);
      this.unsubscribeUsers = onSnapshot(
        usersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudUsers: UserAccount[] = [];
            snapshot.forEach((docSnap) => {
              cloudUsers.push(docSnap.data() as UserAccount);
            });

            const localUsers = getUsers();
            const userMap = new Map(localUsers.map((u) => [u.id, u]));

            cloudUsers.forEach((cu) => {
              userMap.set(cu.id, cu);
            });

            const mergedUsers = Array.from(userMap.values()).filter(
              (u) => !u.polres?.toLowerCase().includes('toraja')
            );

            localStorage.setItem('siperbawa_users_v4_clean', JSON.stringify(mergedUsers));
            this.lastSyncTime = new Date();
            this.syncError = null;
            this.notifyStatus();
          }
        },
        (error) => {
          console.warn('Firestore users snapshot error:', error);
        }
      );

      // 3. Daily Reports listener
      const dailyReportsCol = collection(db, FIRESTORE_COLLECTIONS.DAILY_REPORTS);
      this.unsubscribeDailyReports = onSnapshot(
        dailyReportsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudDaily: LaporanHarian[] = [];
            snapshot.forEach((docSnap) => {
              cloudDaily.push(docSnap.data() as LaporanHarian);
            });

            const localDaily = getDailyReports();
            const dailyMap = new Map(localDaily.map((d) => [d.id, d]));

            cloudDaily.forEach((cd) => {
              dailyMap.set(cd.id, cd);
            });

            localStorage.setItem('siperbawa_daily_reports_v4_clean', JSON.stringify(Array.from(dailyMap.values())));
            this.lastSyncTime = new Date();
            this.syncError = null;
            this.notifyStatus();
          }
        },
        (error) => {
          console.warn('Firestore daily reports snapshot error:', error);
        }
      );

      // 4. Audit Logs listener
      const auditCol = collection(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS);
      this.unsubscribeAuditLogs = onSnapshot(
        auditCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudLogs: AuditLog[] = [];
            snapshot.forEach((docSnap) => {
              cloudLogs.push(docSnap.data() as AuditLog);
            });

            const localLogs = getAuditLogs();
            const logMap = new Map(localLogs.map((l) => [l.id, l]));

            cloudLogs.forEach((cl) => {
              logMap.set(cl.id, cl);
            });

            localStorage.setItem('siperbawa_audit_logs_v4_clean', JSON.stringify(Array.from(logMap.values()).slice(0, 100)));
            this.lastSyncTime = new Date();
            this.notifyStatus();
          }
        },
        (error) => {
          console.warn('Firestore audit logs snapshot error:', error);
        }
      );
    } catch (err: any) {
      console.warn('Failed to start realtime listeners:', err);
    }
  }

  // Sync initial seed or existing local data to Firestore if cloud collection is empty
  public async initialCloudSync(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      // 1. Sync Users
      const usersCol = collection(db, FIRESTORE_COLLECTIONS.USERS);
      const userSnapshot = await getDocs(usersCol);
      const localUsers = getUsers();

      if (userSnapshot.empty && localUsers.length > 0) {
        const batch = writeBatch(db);
        localUsers.forEach((u) => {
          batch.set(doc(db, FIRESTORE_COLLECTIONS.USERS, u.id), u);
        });
        await batch.commit();
      } else if (!userSnapshot.empty) {
        const cloudUsers: UserAccount[] = [];
        userSnapshot.forEach((d) => cloudUsers.push(d.data() as UserAccount));
        const userMap = new Map<string, UserAccount>();
        INITIAL_USERS.forEach((u) => userMap.set(u.id, u));
        localUsers.forEach((u) => userMap.set(u.id, u));
        cloudUsers.forEach((u) => userMap.set(u.id, u));
        saveUsers(Array.from(userMap.values()));
      }

      // 2. Sync Reports
      const reportsCol = collection(db, FIRESTORE_COLLECTIONS.REPORTS);
      const reportSnapshot = await getDocs(reportsCol);
      const localReports = getReports();

      if (reportSnapshot.empty && localReports.length > 0) {
        const batch = writeBatch(db);
        localReports.forEach((report) => {
          batch.set(doc(db, FIRESTORE_COLLECTIONS.REPORTS, report.id), report);
        });
        await batch.commit();
      } else if (!reportSnapshot.empty) {
        const cloudReports: LaporanBudidaya[] = [];
        reportSnapshot.forEach((docSnap) => {
          cloudReports.push(docSnap.data() as LaporanBudidaya);
        });

        const mergedMap = new Map<string, LaporanBudidaya>();
        localReports.forEach((r) => mergedMap.set(r.id, r));
        cloudReports.forEach((r) => mergedMap.set(r.id, r));
        saveReports(Array.from(mergedMap.values()));
      }

      // 3. Sync Daily Reports
      const dailyCol = collection(db, FIRESTORE_COLLECTIONS.DAILY_REPORTS);
      const dailySnapshot = await getDocs(dailyCol);
      const localDaily = getDailyReports();

      if (dailySnapshot.empty && localDaily.length > 0) {
        const batch = writeBatch(db);
        localDaily.forEach((d) => {
          batch.set(doc(db, FIRESTORE_COLLECTIONS.DAILY_REPORTS, d.id), d);
        });
        await batch.commit();
      } else if (!dailySnapshot.empty) {
        const cloudDaily: LaporanHarian[] = [];
        dailySnapshot.forEach((docSnap) => {
          cloudDaily.push(docSnap.data() as LaporanHarian);
        });
        const dailyMap = new Map<string, LaporanHarian>();
        localDaily.forEach((d) => dailyMap.set(d.id, d));
        cloudDaily.forEach((d) => dailyMap.set(d.id, d));
        saveDailyReports(Array.from(dailyMap.values()));
      }

      this.lastSyncTime = new Date();
      this.syncError = null;
      this.notifyStatus();

      return {
        success: true,
        syncedCount: localReports.length + localUsers.length,
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

  // Save single user to Firestore
  public async saveUserToCloud(user: UserAccount): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, user.id);
      await setDoc(docRef, user, { merge: true });
      this.lastSyncTime = new Date();
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Failed to save user to Firestore:', err);
      this.syncError = err.message;
      this.notifyStatus();
      return false;
    }
  }

  // Delete user from Firestore
  public async deleteUserFromCloud(userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
      await deleteDoc(docRef);
      this.lastSyncTime = new Date();
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Failed to delete user from Firestore:', err);
      return false;
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

  // Save single audit log to Firestore
  public async saveAuditLogToCloud(log: AuditLog): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS, log.id);
      await setDoc(docRef, log, { merge: true });
      return true;
    } catch (err: any) {
      console.warn('Failed to save audit log to Firestore:', err);
      return false;
    }
  }

  // Save single notification to Firestore
  public async saveNotificationToCloud(notif: NotificationItem): Promise<boolean> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notif.id);
      await setDoc(docRef, notif, { merge: true });
      return true;
    } catch (err: any) {
      console.warn('Failed to save notification to Firestore:', err);
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
      return { success: true, count: reports.length + dailyReports.length + users.length };
    } catch (err: any) {
      this.syncError = err.message;
      this.notifyStatus();
      return { success: false, count: 0, error: err.message };
    }
  }

  private async syncPendingLocalToCloud() {
    const localUsers = getUsers();
    for (const u of localUsers) {
      this.saveUserToCloud(u).catch(() => {});
    }

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
