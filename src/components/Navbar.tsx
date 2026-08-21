import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Bell,
  Users,
  TrendingUp,
  ChevronDown,
  Sparkles,
  LogOut,
  User,
  Shield,
  FileSpreadsheet,
  BadgeCheck,
  Building2,
  MapPin,
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  getCurrentUser,
  getNotifications,
  subscribeState,
  logoutUser,
} from '../services/appState';
import { OfflineSyncBanner } from './OfflineSyncBanner';
import siperbawaLogo from '../assets/images/siperbawa_official_logo_1787295974614.jpg';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenPredictiveModal: () => void;
  onOpenGoogleSheets?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onOpenPredictiveModal,
  onOpenGoogleSheets,
}) => {
  const [currentUser, setCurrUser] = useState<UserAccount>(getCurrentUser());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshNavbarState = () => {
    const user = getCurrentUser();
    setCurrUser(user);

    // Calculate unread notifications for current user/role
    const notifs = getNotifications();
    const count = notifs.filter((n) => {
      if (n.isRead) return false;
      if (user?.role === 'ADMIN_PUSAT') {
        return n.targetRole === 'ADMIN_PUSAT';
      } else {
        return n.recipientUserId === user?.id || n.targetRole === 'BHABINKAMTIBMAS';
      }
    }).length;

    setUnreadCount(count);
  };

  useEffect(() => {
    refreshNavbarState();
    return subscribeState(refreshNavbarState);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 text-white shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 shadow-sm overflow-hidden p-0.5 sm:p-1 flex items-center justify-center shrink-0">
              <img
                src={siperbawaLogo || '/logo.png'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                alt="Logo Siperbawa Polres Enrekang"
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-xs xs:text-sm sm:text-base lg:text-lg tracking-tight text-white truncate">
                  SIPERBAWA
                </h1>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  Polres Enrekang
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden md:block">
                Sistem Pendampingan & Budidaya Bawang Putih Bhabinkamtibmas
              </p>
            </div>
          </div>

          {/* Quick Actions & User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Offline Sync Status Badge */}
            <OfflineSyncBanner compact={true} />

            {/* Google Sheets Integration Quick Trigger (Only for Admin Polres) */}
            {onOpenGoogleSheets && currentUser?.role === 'ADMIN_PUSAT' && (
              <button
                onClick={onOpenGoogleSheets}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                title="Integrasi Google Sheets & Drive (Admin Polres)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Google Sheets</span>
              </button>
            )}

            {/* Predictive Harvest Calculator Quick Trigger */}
            <button
              onClick={onOpenPredictiveModal}
              className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Analisis Prediktif Hasil Panen"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Prediksi Panen</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Pusat Notifikasi Real-time"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile & Secure Log Out Menu */}
            {currentUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl px-2 sm:px-2.5 py-1.5 text-left transition cursor-pointer"
                  title="Menu Profil Pengguna"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {currentUser.role === 'ADMIN_PUSAT' ? 'ADM' : 'BHB'}
                  </div>

                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[130px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-medium leading-tight">
                      {currentUser.role === 'ADMIN_PUSAT'
                        ? 'Admin Polres Enrekang'
                        : currentUser.rank}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile & Log Out Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-3 text-xs space-y-3 animate-fadeIn">
                    {/* User Identity Header */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Profil Sedang Aktif
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                          {currentUser.status || 'AKTIF'}
                        </span>
                      </div>

                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{currentUser.name}</span>
                      </div>

                      <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>
                          {currentUser.role === 'ADMIN_PUSAT'
                            ? 'Administrator Utama Satbinmas'
                            : `${currentUser.rank || 'Personel'} • NRP: ${currentUser.username}`}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800/80">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{currentUser.polsek} • {currentUser.polres}</span>
                      </div>

                      {currentUser.wilayahBinaan && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">Binaan: {currentUser.wilayahBinaan}</span>
                        </div>
                      )}
                    </div>

                    {/* Log Out Action */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logoutUser();
                        }}
                        className="w-full px-3.5 py-2.5 bg-rose-950/90 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800/80 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar dari Sistem (Log Out)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

