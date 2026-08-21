import {
  UserAccount,
  LaporanBudidaya,
  NotificationItem,
  AuditLog,
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin',
    username: 'admin.enrekang',
    password: 'AdminEnrekang123!',
    name: 'Admin Polres Enrekang',
    rank: 'ADMIN',
    polres: 'Polres Enrekang',
    polsek: 'Satbinmas Polres Enrekang',
    wilayahBinaan: 'Wilayah Hukum Polres Enrekang (Sulawesi Selatan)',
    role: 'ADMIN_PUSAT',
    status: 'AKTIF',
    phone: '082348818991',
  },
];

export const INITIAL_REPORTS: LaporanBudidaya[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
