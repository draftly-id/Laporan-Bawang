import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Bell,
  Users,
  TrendingUp,
  ChevronDown,
  Sparkles,
  LogOut,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  getUsers,
  getCurrentUser,
  setCurrentUser,
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
  const [allUsers, setAllUsers] = useState<UserAccount[]>(getUsers());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const refreshNavbarState = () => {
    const user = getCurrentUser();
    setCurrUser(user);
    setAllUsers(getUsers());

    // Calculate unread notifications for current user/role
    const notifs = getNotifications();
    const count = notifs.filter((n) => {
      if (n.isRead) return false;
      if (user.role === 'ADMIN_PUSAT') {
        return n.targetRole === 'ADMIN_PUSAT';
      } else {
        return n.recipientUserId === user.id || n.targetRole === 'BHABINKAMTIBMAS';
      }
    }).length;

    setUnreadCount(count);
  };

  useEffect(() => {
    refreshNavbarState();
    return subscribeState(refreshNavbarState);
  }, []);

  const handleSwitchUser = (selectedUser: UserAccount) => {
    setCurrentUser(selectedUser);
    setDropdownOpen(false);
  };

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

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Offline Sync Status Badge */}
            <OfflineSyncBanner compact={true} />

            {/* Google Sheets Integration Quick Trigger (Only for Admin Polres) */}
            {onOpenGoogleSheets && currentUser.role === 'ADMIN_PUSAT' && (
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

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl px-2 sm:px-2.5 py-1.5 text-left transition cursor-pointer"
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

              {/* Role Switcher Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 divide-y divide-slate-800 text-xs">
                  <div className="px-3 py-2 text-[11px] text-slate-400 font-medium">
                    Pilih Akun Pengguna (Simulasi Skenario):
                  </div>

                  <div className="py-1 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              <span>{u.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                                {u.role === 'ADMIN_PUSAT' ? 'ADMIN' : 'BHABIN'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {u.username} • {u.polres}
                            </div>
                          </div>

                          {isSelected && (
                            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Log Out Action */}
                  <div className="pt-2 border-t border-slate-800/80 mt-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logoutUser();
                      }}
                      className="w-full px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Sistem (Log Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
