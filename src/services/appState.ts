import {
  UserAccount,
  LaporanBudidaya,
  NotificationItem,
  AuditLog,
  RevisionRequest,
  StatusLaporan,
  DataPanen,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'siperbawa_users_v4_clean',
  REPORTS: 'siperbawa_reports_v4_clean',
  NOTIFICATIONS: 'siperbawa_notifications_v4_clean',
  AUDIT_LOGS: 'siperbawa_audit_logs_v4_clean',
  CURRENT_USER: 'siperbawa_current_user_v4_clean',
};

// Purge any legacy demo mock keys from previous sessions
try {
  [
    'siperbawa_users_v3',
    'siperbawa_reports_v3',
    'siperbawa_notifications_v3',
    'siperbawa_audit_logs_v3',
    'siperbawa_current_user_v3',
    'siperbawa_users_v2',
    'siperbawa_reports_v2',
    'siperbawa_users',
    'siperbawa_reports',
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
} catch (_) {}

// Listeners for custom real-time events
type StateListener = () => void;
const listeners: Set<StateListener> = new Set();

export function subscribeState(listener: StateListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStateChanged() {
  listeners.forEach((l) => l());
}

// 1. User Management
export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const stored: UserAccount[] = JSON.parse(raw);
      const mergedMap = new Map<string, UserAccount>();
      INITIAL_USERS.forEach((u) => mergedMap.set(u.id, u));
      stored.forEach((u) => {
        // Automatically migrate legacy admin name if needed
        if (u.id === 'user-admin' || u.role === 'ADMIN_PUSAT') {
          mergedMap.set(u.id, {
            ...u,
            name: 'Admin Polres Enrekang',
            rank: u.rank === 'BRIPTU' ? 'ADMIN' : u.rank,
          });
        } else {
          mergedMap.set(u.id, u);
        }
      });
      return Array.from(mergedMap.values()).filter(
        (u) => !u.polres.toLowerCase().includes('toraja')
      );
    }
  } catch (e) {
    console.error('Failed to parse users', e);
  }
  return INITIAL_USERS.filter((u) => !u.polres.toLowerCase().includes('toraja'));
}

export function saveUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  notifyStateChanged();
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw === 'LOGGED_OUT' || !raw) return null;
    const u = JSON.parse(raw);
    const allUsers = getUsers();
    const matched = allUsers.find((item) => item.id === u.id);
    if (matched) return matched;
    if (u.role === 'ADMIN_PUSAT') {
      return { ...u, name: 'Admin Polres Enrekang' };
    }
  } catch (e) {
    console.error('Failed to parse current user', e);
  }
  return null;
}

export function setCurrentUser(user: UserAccount) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  addAuditLog({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    actionType: 'USER_LOGIN',
    targetInfo: `Akun: ${user.name}`,
    details: `Pengguna ${user.name} (${user.rank}) berhasil masuk ke dalam sistem SIPERBAWA POLRI.`,
  });
  notifyStateChanged();
}

export function logoutUser() {
  const current = getCurrentUser();
  if (current) {
    addAuditLog({
      actorId: current.id,
      actorName: current.name,
      actorRole: current.role,
      actionType: 'USER_LOGOUT',
      targetInfo: `Akun: ${current.name}`,
      details: `Pengguna ${current.name} (${current.rank}) keluar dari sistem SIPERBAWA POLRI.`,
    });
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'LOGGED_OUT');
  notifyStateChanged();
}

export function loginWithCredentials(
  usernameOrNrp: string,
  passwordInput?: string
): UserAccount | null {
  const allUsers = getUsers();
  const matched = allUsers.find((u) => {
    const isUsernameMatch =
      u.username.toLowerCase() === usernameOrNrp.trim().toLowerCase() ||
      u.id.toLowerCase() === usernameOrNrp.trim().toLowerCase();

    if (!isUsernameMatch) return false;

    // If account has a set password, validate it if provided or require match
    if (u.password && passwordInput) {
      return u.password === passwordInput.trim();
    }

    return true;
  });

  if (matched) {
    setCurrentUser(matched);
    return matched;
  }
  return null;
}

export function updateAdminPassword(newPassword: string, adminUsername?: string): boolean {
  try {
    const allUsers = getUsers();
    let found = false;
    const updatedUsers = allUsers.map((u) => {
      const isTargetAdmin =
        u.role === 'ADMIN_PUSAT' ||
        u.id === 'user-admin' ||
        (adminUsername && u.username.toLowerCase() === adminUsername.trim().toLowerCase());

      if (isTargetAdmin) {
        found = true;
        return {
          ...u,
          password: newPassword.trim(),
        };
      }
      return u;
    });

    if (found) {
      saveUsers(updatedUsers);
      addAuditLog({
        actorId: 'user-admin',
        actorName: 'Admin Polres Enrekang',
        actorRole: 'ADMIN_PUSAT',
        actionType: 'USER_MANAGEMENT',
        targetInfo: 'Akun Admin',
        details: 'Kata sandi akun Admin Satbinmas Polres Enrekang berhasil diperbarui / direset.',
      });
      return true;
    }
  } catch (err) {
    console.error('Error updating admin password:', err);
  }
  return false;
}

// 2. Reports Management
export function getReports(): LaporanBudidaya[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (raw) {
      const parsed: LaporanBudidaya[] = JSON.parse(raw);
      return parsed.filter(
        (r) =>
          !r.userPolres.toLowerCase().includes('toraja') &&
          !r.dataLahan.kabupaten.toLowerCase().includes('toraja')
      );
    }
  } catch (e) {
    console.error('Failed to parse reports', e);
  }
  return INITIAL_REPORTS.filter(
    (r) =>
      !r.userPolres.toLowerCase().includes('toraja') &&
      !r.dataLahan.kabupaten.toLowerCase().includes('toraja')
  );
}

export function saveReports(reports: LaporanBudidaya[]) {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  notifyStateChanged();
}

// Add or update report
export function submitOrUpdateReport(
  reportData: Partial<LaporanBudidaya>,
  isDraft: boolean = false
): LaporanBudidaya {
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
      const newStatus: StatusLaporan = isDraft ? 'DRAFT_LOKAL' : 'TERKIRIM';
      reports[index] = {
        ...reports[index],
        ...reportData,
        status: isDraft ? 'DRAFT_LOKAL' : reports[index].status === 'DRAFT_LOKAL' ? 'TERKIRIM' : reports[index].status,
        tanggalUpdate: now,
      } as LaporanBudidaya;
      targetReport = reports[index];
    } else {
      throw new Error('Report not found');
    }
  } else {
    // New report creation
    const newId = `LAP-${new Date().getFullYear()}-${String(
      reports.length + 1
    ).padStart(3, '0')}`;

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
      tanggalInput: now,
      tanggalUpdate: now,
    };

    reports.unshift(targetReport);
  }

  saveReports(reports);

  // Sync to Cloud Firestore if available and not a draft
  try {
    import('./firestoreSync').then(({ firestoreSync }) => {
      if (!isDraft) {
        firestoreSync.saveReportToCloud(targetReport).catch(() => {});
      }
    }).catch(() => {});
  } catch (_) {}

  // If not draft, trigger real-time notification to ADMIN_PUSAT
  if (!isDraft) {
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
  }

  return targetReport;
}

// Bhabinkamtibmas Request Revision
export function requestReportRevision(
  laporanId: string,
  alasanRevisi: string,
  proposedData: Partial<LaporanBudidaya>
) {
  const reports = getReports();
  const currentUser = getCurrentUser();
  const index = reports.findIndex((r) => r.id === laporanId);

  if (index === -1) throw new Error('Report not found');

  const report = reports[index];
  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const revisionReq: RevisionRequest = {
    id: `REV-${Date.now().toString().slice(-6)}`,
    laporanId,
    userId: currentUser.id,
    userName: currentUser.name,
    userNrp: currentUser.username,
    tanggalPengajuan: now,
    alasanRevisi,
    dataBaruProposed: proposedData,
    dataLamaOriginal: JSON.parse(JSON.stringify(report)),
    status: 'PENDING',
  };

  reports[index].status = 'PENGAJUAN_REVISI';
  reports[index].revisiPending = revisionReq;
  reports[index].tanggalUpdate = now;

  saveReports(reports);

  // Notify Admin Pusat
  addNotification({
    recipientUserId: 'ADMIN_ALL',
    targetRole: 'ADMIN_PUSAT',
    title: 'Pengajuan Revisi / Koreksi Data',
    message: `${currentUser.name} mengajukan koreksi data pada laporan ${laporanId}. Alasan: "${alasanRevisi}"`,
    type: 'REVISION_SUBMITTED',
    laporanId,
    revisionId: revisionReq.id,
    priority: 'high',
  });

  addAuditLog({
    actorId: currentUser.id,
    actorName: currentUser.name,
    actorRole: currentUser.role,
    actionType: 'REQUEST_REVISION',
    laporanId,
    targetInfo: `Laporan ${laporanId}`,
    details: `Pengajuan revisi: ${alasanRevisi}`,
  });
}

// Admin Process Revision Request (Approve or Reject)
export function handleRevisionDecision(
  laporanId: string,
  approve: boolean,
  adminNotes?: string
) {
  const reports = getReports();
  const currentUser = getCurrentUser(); // Admin
  const index = reports.findIndex((r) => r.id === laporanId);

  if (index === -1) throw new Error('Report not found');

  const report = reports[index];
  const rev = report.revisiPending;

  if (!rev) throw new Error('No pending revision request found for this report');

  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (approve) {
    // Apply proposed data changes
    if (rev.dataBaruProposed.kelompokTani) {
      report.kelompokTani = { ...report.kelompokTani, ...rev.dataBaruProposed.kelompokTani };
    }
    if (rev.dataBaruProposed.dataLahan) {
      report.dataLahan = { ...report.dataLahan, ...rev.dataBaruProposed.dataLahan };
    }
    if (rev.dataBaruProposed.catatanLapangan !== undefined) {
      report.catatanLapangan = rev.dataBaruProposed.catatanLapangan;
    }
    if (rev.dataBaruProposed.statusTanaman !== undefined) {
      report.statusTanaman = rev.dataBaruProposed.statusTanaman;
    }

    report.status = 'DISETUJUI';
    rev.status = 'APPROVED';
  } else {
    report.status = 'DITOLAK';
    rev.status = 'REJECTED';
  }

  rev.catatanAdmin = adminNotes;
  rev.tanggalKeputusan = now;
  rev.adminHandlerName = currentUser.name;
  report.tanggalUpdate = now;

  saveReports(reports);

  // Sync revision update to Cloud Firestore
  try {
    import('./firestoreSync').then(({ firestoreSync }) => {
      firestoreSync.saveReportToCloud(report).catch(() => {});
    }).catch(() => {});
  } catch (_) {}

  // Notify the specific Bhabinkamtibmas officer!
  addNotification({
    recipientUserId: rev.userId,
    targetRole: 'BHABINKAMTIBMAS',
    title: approve
      ? '✅ Pengajuan Revisi DISETUJUI'
      : '❌ Pengajuan Revisi DITOLAK',
    message: approve
      ? `Admin Pusat telah menyetujui koreksi data pada Laporan ${laporanId}. Data lahan berhasil diperbarui.`
      : `Pengajuan revisi Laporan ${laporanId} ditolak oleh Admin. Catatan Admin: "${
          adminNotes || 'Sesuai dengan verifikasi fisik.'
        }"`,
    type: approve ? 'REVISION_APPROVED' : 'REVISION_REJECTED',
    laporanId,
    revisionId: rev.id,
    priority: 'high',
  });

  addAuditLog({
    actorId: currentUser.id,
    actorName: currentUser.name,
    actorRole: currentUser.role,
    actionType: approve ? 'APPROVE_REVISION' : 'REJECT_REVISION',
    laporanId,
    targetInfo: `Revisi Laporan ${laporanId}`,
    details: `${approve ? 'Menyetujui' : 'Menolak'} revisi dari ${rev.userName}. ${
      adminNotes ? `Catatan: ${adminNotes}` : ''
    }`,
  });
}

// Admin Direct Delete
export function adminDeleteReport(laporanId: string, reason: string) {
  let reports = getReports();
  const currentUser = getCurrentUser();
  const target = reports.find((r) => r.id === laporanId);

  reports = reports.filter((r) => r.id !== laporanId);
  saveReports(reports);

  // Sync deletion to Cloud Firestore
  try {
    import('./firestoreSync').then(({ firestoreSync }) => {
      firestoreSync.deleteReportFromCloud(laporanId).catch(() => {});
    }).catch(() => {});
  } catch (_) {}

  if (target) {
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'DELETE_REPORT',
      laporanId,
      targetInfo: `Laporan ${laporanId} (${target.dataLahan.desaKelurahan})`,
      details: `Penghapusan laporan oleh Admin. Alasan: ${reason}`,
    });
  }
}

// 3. Notifications Management
export function getNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse notifications', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
  notifyStateChanged();
}

export function addNotification(
  item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>
) {
  const notifications = getNotifications();
  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newNotif: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    isRead: false,
  };

  notifications.unshift(newNotif);
  saveNotifications(notifications);
}

export function markNotificationAsRead(id: string) {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications[index].isRead = true;
    saveNotifications(notifications);
  }
}

export function markAllNotificationsAsRead(userRole: string, userId: string) {
  const notifications = getNotifications();
  const updated = notifications.map((n) => {
    if (
      (n.targetRole === userRole && (n.recipientUserId === 'ADMIN_ALL' || n.recipientUserId === userId)) ||
      n.recipientUserId === userId
    ) {
      return { ...n, isRead: true };
    }
    return n;
  });
  saveNotifications(updated);
}

// 4. Audit Logs
export function getAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse audit logs', e);
  }
  return INITIAL_AUDIT_LOGS;
}

export function addAuditLog(item: Omit<AuditLog, 'id' | 'timestamp'>) {
  const logs = getAuditLogs();
  const now = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newLog: AuditLog = {
    ...item,
    id: `log-${Date.now()}`,
    timestamp: now,
  };

  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  notifyStateChanged();
}

export function savePanenData(laporanId: string, dataPanen: DataPanen) {
  const reports = getReports();
  const currentUser = getCurrentUser();
  const index = reports.findIndex((r) => r.id === laporanId);
  if (index === -1) throw new Error('Report not found');

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isOffline = !isOnline;
  const now = new Date().toLocaleString('id-ID');

  reports[index].dataPanen = dataPanen;
  reports[index].dataLahan.produksiPanenKg = dataPanen.hasilPanenKg;
  reports[index].statusTanaman = 'Siap Panen (90+ HST)';
  reports[index].tanggalUpdate = now;

  if (isOffline) {
    reports[index].syncStatus = 'PENDING_SYNC';
    reports[index].offlineSavedAt = now;
  }

  saveReports(reports);

  if (currentUser) {
    if (!isOffline) {
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actionType: 'UPDATE_REPORT',
        laporanId,
        targetInfo: `Hasil Panen Laporan ${laporanId}`,
        details: `Menginput realisasi panen: Tgl ${dataPanen.tanggalPanen}, Luas ${dataPanen.luasPanenM2} m², Produksi ${(dataPanen.hasilPanenKg / 1000).toFixed(2)} Ton.`,
      });

      addNotification({
        recipientUserId: 'ADMIN_ALL',
        targetRole: 'ADMIN_PUSAT',
        title: 'Realisasi Hasil Panen Terinput',
        message: `${currentUser.name} menginput hasil produksi panen untuk ${reports[index].kelompokTani.namaKelompok} sebesar ${(dataPanen.hasilPanenKg / 1000).toFixed(2)} Ton.`,
        type: 'NEW_REPORT',
        laporanId,
        priority: 'high',
      });
    } else {
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actionType: 'UPDATE_REPORT',
        laporanId,
        targetInfo: `[OFFLINE] Hasil Panen Laporan ${laporanId}`,
        details: `Tersimpan secara offline: Tgl ${dataPanen.tanggalPanen}, Hasil ${(dataPanen.hasilPanenKg / 1000).toFixed(2)} Ton. Menunggu sinkronisasi internet.`,
      });
    }
  }
}

// 7. Full Database Backup & Preventative Data Export
export interface DatabaseBackupPayload {
  metadata: {
    systemName: string;
    version: string;
    exportTimestamp: string;
    exportDateFormatted: string;
    exportedBy: string;
    exportedByRole: string;
    organization: string;
    description: string;
  };
  summary: {
    totalReports: number;
    totalUsers: number;
    totalAuditLogs: number;
    totalNotifications: number;
    totalLuasTanamM2: number;
    totalProduksiPanenKg: number;
    totalBibitKg: number;
  };
  data: {
    users: UserAccount[];
    reports: LaporanBudidaya[];
    notifications: NotificationItem[];
    auditLogs: AuditLog[];
  };
}

export function generateDatabaseBackup(): DatabaseBackupPayload {
  const users = getUsers();
  const reports = getReports();
  const notifications = getNotifications();
  const auditLogs = getAuditLogs();
  const currentUser = getCurrentUser();

  const totalLuas = reports.reduce((acc, r) => acc + (r.dataLahan?.luasTanamM2 || 0), 0);
  const totalPanen = reports.reduce((acc, r) => acc + (r.dataLahan?.produksiPanenKg || 0), 0);
  const totalBibit = reports.reduce((acc, r) => acc + (r.dataLahan?.jumlahBibitKg || 0), 0);

  const now = new Date();

  return {
    metadata: {
      systemName: 'SIPERBAWA - POLRES ENREKANG (Sistem Informasi Pendataan Budidaya Bawang)',
      version: '4.0.0',
      exportTimestamp: now.toISOString(),
      exportDateFormatted: now.toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
      exportedBy: currentUser ? `${currentUser.name} (${currentUser.rank || 'ADMIN'})` : 'Admin Polres Enrekang',
      exportedByRole: currentUser?.role || 'ADMIN_PUSAT',
      organization: 'Satbinmas Polres Enrekang - Polda Sulawesi Selatan',
      description: 'Salinan cadangan database lokal lengkap (preventif offline backup) mencakup data laporan budidaya, kelompok tani, foto dokumentasi geospasial, akun pengguna, dan riwayat audit log.',
    },
    summary: {
      totalReports: reports.length,
      totalUsers: users.length,
      totalAuditLogs: auditLogs.length,
      totalNotifications: notifications.length,
      totalLuasTanamM2: totalLuas,
      totalProduksiPanenKg: totalPanen,
      totalBibitKg: totalBibit,
    },
    data: {
      users,
      reports,
      notifications,
      auditLogs,
    },
  };
}

export function downloadDatabaseBackup(): {
  filename: string;
  sizeBytes: number;
  summary: DatabaseBackupPayload['summary'];
} {
  const backupPayload = generateDatabaseBackup();
  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const currentUser = getCurrentUser();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `BACKUP_DATABASE_SIPERBAWA_POLRES_ENREKANG_${dateStr}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Add audit log entry for this backup
  if (currentUser) {
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'BACKUP_DATABASE',
      targetInfo: 'Database Salinan Cadangan (JSON)',
      details: `Mengunduh backup lokal lengkap database (${backupPayload.summary.totalReports} laporan, ${backupPayload.summary.totalUsers} akun pengguna, ${backupPayload.summary.totalAuditLogs} audit log). File: ${filename}`,
    });

    addNotification({
      recipientUserId: currentUser.id,
      targetRole: 'ADMIN_PUSAT',
      title: 'Backup Database Lokal Berhasil Diunduh',
      message: `Salinan database (${filename}) berhasil dibuat dan disimpan ke perangkat lokal. Total ${backupPayload.summary.totalReports} laporan tersimpan aman.`,
      type: 'SYSTEM_ALERT',
      priority: 'medium',
    });
  }

  return {
    filename,
    sizeBytes: blob.size,
    summary: backupPayload.summary,
  };
}

