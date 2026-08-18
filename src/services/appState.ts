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
      stored.forEach((u) => mergedMap.set(u.id, u));
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
    if (raw === 'LOGGED_OUT') return null;
    if (raw) {
      const u = JSON.parse(raw);
      const allUsers = getUsers();
      const matched = allUsers.find((item) => item.id === u.id);
      if (matched) return matched;
    }
  } catch (e) {
    console.error('Failed to parse current user', e);
  }
  
  // Default to first user (Admin) if not explicitly logged out
  if (localStorage.getItem(STORAGE_KEYS.CURRENT_USER) === null) {
    const allUsers = getUsers();
    return allUsers[0] || null;
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

  reports[index].dataPanen = dataPanen;
  reports[index].dataLahan.produksiPanenKg = dataPanen.hasilPanenKg;
  reports[index].statusTanaman = 'Siap Panen (90+ HST)';
  reports[index].tanggalUpdate = new Date().toLocaleString('id-ID');

  saveReports(reports);

  if (currentUser) {
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
  }
}
