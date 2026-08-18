import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  FilePlus,
  FileEdit,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { NotificationItem, UserAccount } from '../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/appState';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSelectReport: (laporanId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectReport,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const allNotifs = getNotifications();

  // Filter for current user role & audience
  const userNotifs = allNotifs.filter((n) => {
    if (currentUser.role === 'ADMIN_PUSAT') {
      return n.targetRole === 'ADMIN_PUSAT' || n.recipientUserId === 'ADMIN_ALL';
    } else {
      return n.recipientUserId === currentUser.id || n.targetRole === 'BHABINKAMTIBMAS';
    }
  });

  const filteredNotifs =
    filterMode === 'UNREAD' ? userNotifs.filter((n) => !n.isRead) : userNotifs;

  const handleItemClick = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    if (n.laporanId) {
      onSelectReport(n.laporanId);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(currentUser.role, currentUser.id);
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'REVISION_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'REVISION_REJECTED':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'REVISION_SUBMITTED':
        return <FileEdit className="w-5 h-5 text-amber-400" />;
      case 'NEW_REPORT':
        return <FilePlus className="w-5 h-5 text-sky-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col text-slate-900 dark:text-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Pusat Notifikasi</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua ({userNotifs.length})
            </button>
            <button
              onClick={() => setFilterMode('UNREAD')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                filterMode === 'UNREAD'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Belum Dibaca ({userNotifs.filter((n) => !n.isRead).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition cursor-pointer font-medium"
          >
            <CheckCheck className="w-4 h-4" /> Tandai Dibaca
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700 opacity-60" />
              <p className="text-sm font-medium">Tidak ada pemberitahuan</p>
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 rounded-xl border transition cursor-pointer group ${
                  item.isRead
                    ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-amber-50/60 dark:bg-slate-800/90 border-amber-300 dark:border-amber-500/40 shadow-sm dark:shadow-md hover:border-amber-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getNotifIcon(item.type)}</div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                      {item.message}
                    </p>

                    {item.laporanId && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                        <span>Lihat Detail Laporan</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
