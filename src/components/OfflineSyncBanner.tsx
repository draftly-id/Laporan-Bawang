import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  CloudOff,
  CloudCheck,
} from 'lucide-react';
import { useOfflineSync } from '../services/useOfflineSync';

interface OfflineSyncBannerProps {
  compact?: boolean;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({ compact = false }) => {
  const {
    isOnline,
    pendingQueueCount,
    isSyncing,
    lastSyncTime,
    triggerManualSync,
  } = useOfflineSync();

  if (isOnline && pendingQueueCount === 0 && !isSyncing) {
    return null;
  }

  if (compact) {
    return (
      <div
        id="offline-sync-badge-compact"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all ${
          !isOnline
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            : pendingQueueCount > 0
            ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mode Offline</span>
            {pendingQueueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono text-[10px]">
                {pendingQueueCount} antrean
              </span>
            )}
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>Menyinkronkan...</span>
          </>
        ) : (
          <>
            <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pendingQueueCount} data menunggu sinkron</span>
            <button
              onClick={() => triggerManualSync()}
              className="ml-1 text-[11px] underline hover:text-white font-bold cursor-pointer"
            >
              Sinkron Sekarang
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      id="offline-sync-full-banner"
      className={`rounded-2xl border p-4 shadow-md transition-all ${
        !isOnline
          ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border-amber-500/40 text-amber-100'
          : pendingQueueCount > 0
          ? 'bg-gradient-to-r from-sky-950/70 via-slate-900 to-sky-950/50 border-sky-500/40 text-sky-100'
          : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              !isOnline
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'bg-sky-500/20 border-sky-500/30 text-sky-400'
            }`}
          >
            {!isOnline ? (
              <WifiOff className="w-5 h-5 animate-pulse" />
            ) : isSyncing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Database className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                {!isOnline
                  ? 'Koneksi Offline (Tanpa Internet)'
                  : isSyncing
                  ? 'Sedang Melakukan Sinkronisasi Data...'
                  : 'Siap Sinkronisasi Data Offline'}
              </span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                  !isOnline
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                }`}
              >
                {!isOnline ? 'Lokal Storage Aktif' : 'Otomatis Online'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {!isOnline
                ? 'Petugas Bhabinkamtibmas tetap dapat mengisi dan menyimpan laporan di kebun binaan. Semua data tersimpan aman di perangkat (localStorage) dan akan otomatis disinkronkan saat terhubung kembali.'
                : `${pendingQueueCount} laporan budidaya yang dibuat saat offline siap dikirimkan ke pangkalan data pusat.`}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {pendingQueueCount > 0 && isOnline && (
            <button
              onClick={() => triggerManualSync()}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          )}

          {!isOnline && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{pendingQueueCount} Tersimpan Lokal</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
