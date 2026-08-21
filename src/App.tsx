import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  LayoutDashboard,
  MapPin,
  FileCheck2,
  Users,
  Sparkles,
  Download,
  Shield,
  Sprout,
  CheckCircle2,
  AlertCircle,
  LogOut,
  CloudRain,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';
import { UserAccount, LaporanBudidaya } from './types';
import {
  getCurrentUser,
  getReports,
  subscribeState,
  logoutUser,
} from './services/appState';
import { firestoreSync } from './services/firestoreSync';

import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PredictiveAnalysisModal } from './components/PredictiveAnalysisModal';
import { GoogleSheetsIntegrationModal } from './components/Admin/GoogleSheetsIntegrationModal';
import { WeatherBMKGCard } from './components/WeatherBMKGCard';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';

// Bhabinkamtibmas Components
import { MyReportsList } from './components/Bhabinkamtibmas/MyReportsList';
import { DailyReportsList } from './components/Bhabinkamtibmas/DailyReportsList';
import { ReportForm } from './components/Bhabinkamtibmas/ReportForm';
import { PanduanBudidayaKementan } from './components/Bhabinkamtibmas/PanduanBudidayaKementan';

// Admin Pusat Components
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { GisMapView } from './components/Admin/GisMapView';
import { RevisionApprovals } from './components/Admin/RevisionApprovals';
import { UserManagement } from './components/Admin/UserManagement';
import { ReportExportModal } from './components/Admin/ReportExportModal';

import { LoginView } from './components/Auth/LoginView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const [reports, setReports] = useState<LaporanBudidaya[]>(getReports());

  // Bhabinkamtibmas Active Sub-tab
  const [bhabinTab, setBhabinTab] = useState<
    'MY_REPORTS' | 'DAILY_REPORTS' | 'NEW_REPORT' | 'CUACA_BMKG' | 'PANDUAN_KEMENTAN'
  >('MY_REPORTS');
  const [editingDraft, setEditingDraft] = useState<LaporanBudidaya | null>(null);

  // Admin Active Sub-tab
  const [adminTab, setAdminTab] = useState<
    'DASHBOARD' | 'DAILY_REPORTS' | 'GIS' | 'CUACA_BMKG' | 'REVISIONS' | 'USERS'
  >('DASHBOARD');

  // Modals & Drawers State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPredictiveOpen, setIsPredictiveOpen] = useState(false);
  const [predictiveTargetReport, setPredictiveTargetReport] = useState<LaporanBudidaya | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);

  // Sync state when changes happen anywhere in the app
  const refreshData = () => {
    setCurrentUser(getCurrentUser());
    setReports(getReports());
  };

  useEffect(() => {
    refreshData();
    firestoreSync.init().catch(() => {});
    return subscribeState(refreshData);
  }, []);

  const handleOpenPredictive = (report?: LaporanBudidaya) => {
    setPredictiveTargetReport(report || null);
    setIsPredictiveOpen(true);
  };

  const handleSelectReportFromNotif = (laporanId: string) => {
    if (!currentUser) return;
    const report = reports.find((r) => r.id === laporanId);
    if (currentUser.role === 'ADMIN_PUSAT') {
      if (report?.status === 'PENGAJUAN_REVISI') {
        setAdminTab('REVISIONS');
      } else {
        setAdminTab('DASHBOARD');
      }
    } else {
      setBhabinTab('MY_REPORTS');
    }
  };

  const pendingRevisionsCount = reports.filter(
    (r) => r.status === 'PENGAJUAN_REVISI'
  ).length;

  if (!currentUser) {
    return <LoginView onLoginSuccess={refreshData} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors">
      {/* Navbar with Role Switcher & Notifications */}
      <Navbar
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenPredictiveModal={() => handleOpenPredictive()}
        onOpenGoogleSheets={
          currentUser.role === 'ADMIN_PUSAT'
            ? () => setIsGoogleSheetsOpen(true)
            : undefined
        }
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6">
        {/* Offline State & Queue Synchronization Banner */}
        <OfflineSyncBanner />

        {/* Role Navigation Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
          {/* Active Context Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.role === 'ADMIN_PUSAT' ? <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="truncate max-w-[180px] sm:max-w-none">{currentUser.name}</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                  {currentUser.role === 'ADMIN_PUSAT' ? 'ADMIN POLRES ENREKANG' : `BHABIN • ${currentUser.rank || 'BRIPKA'}`}
                </span>
                <button
                  onClick={() => {
                    logoutUser();
                  }}
                  className="p-1 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 rounded-lg transition cursor-pointer"
                  title="Keluar dari Sistem (Log Out)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                {currentUser.polres} • {currentUser.polsek} {currentUser.wilayahBinaan ? `(${currentUser.wilayahBinaan})` : ''}
              </p>
            </div>
          </div>

          {/* Role Specific Navigation Tabs (Horizontal swipe/scroll for tablets/desktops) */}
          {currentUser.role === 'BHABINKAMTIBMAS' ? (
            /* Bhabinkamtibmas View Switcher */
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 sm:p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('MY_REPORTS');
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  bhabinTab === 'MY_REPORTS'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> <span>Laporan Lahan</span>
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('DAILY_REPORTS');
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  bhabinTab === 'DAILY_REPORTS'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" /> <span>Laporan Sambang</span>
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('NEW_REPORT');
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  bhabinTab === 'NEW_REPORT'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> <span>+ Lahan Baru</span>
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('CUACA_BMKG');
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  bhabinTab === 'CUACA_BMKG'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" /> <span>Cuaca BMKG</span>
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('PANDUAN_KEMENTAN');
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  bhabinTab === 'PANDUAN_KEMENTAN'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> <span>Panduan</span>
              </button>
            </div>
          ) : (
            /* Admin Pusat View Switcher */
            <div className="flex items-center gap-1 bg-slate-950 p-1 sm:p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setAdminTab('DASHBOARD')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  adminTab === 'DASHBOARD'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> <span>Dashboard</span>
              </button>

              <button
                onClick={() => setAdminTab('DAILY_REPORTS')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  adminTab === 'DAILY_REPORTS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" /> <span>Laporan Sambang</span>
              </button>

              <button
                onClick={() => setAdminTab('GIS')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  adminTab === 'GIS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> <span>Peta GIS</span>
              </button>

              <button
                onClick={() => setAdminTab('CUACA_BMKG')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  adminTab === 'CUACA_BMKG'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" /> <span>Cuaca</span>
              </button>

              <button
                onClick={() => setAdminTab('REVISIONS')}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  adminTab === 'REVISIONS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" /> <span>Revisi</span>
                {pendingRevisionsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {pendingRevisionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminTab('USERS')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  adminTab === 'USERS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> <span>Akun</span>
              </button>
            </div>
          )}
        </div>

        {/* View Content Rendering */}
        {currentUser.role === 'BHABINKAMTIBMAS' ? (
          <div>
            {bhabinTab === 'NEW_REPORT' ? (
              <ReportForm
                currentUser={currentUser}
                existingReport={editingDraft}
                onSuccess={() => {
                  setEditingDraft(null);
                  setBhabinTab('MY_REPORTS');
                  refreshData();
                }}
                onCancel={() => {
                  setEditingDraft(null);
                  setBhabinTab('MY_REPORTS');
                }}
              />
            ) : bhabinTab === 'DAILY_REPORTS' ? (
              <DailyReportsList
                currentUser={currentUser}
                existingReports={reports}
                onRefresh={refreshData}
              />
            ) : bhabinTab === 'CUACA_BMKG' ? (
              <WeatherBMKGCard
                initialKecamatan={
                  currentUser.wilayahBinaan?.includes('Kec.')
                    ? currentUser.wilayahBinaan.split('Kec.')[1].split(',')[0].trim()
                    : 'Anggeraja'
                }
              />
            ) : bhabinTab === 'PANDUAN_KEMENTAN' ? (
              <PanduanBudidayaKementan />
            ) : (
              <MyReportsList
                currentUser={currentUser}
                reports={reports}
                onAddNew={() => {
                  setEditingDraft(null);
                  setBhabinTab('NEW_REPORT');
                }}
                onEditDraft={(draft) => {
                  setEditingDraft(draft);
                  setBhabinTab('NEW_REPORT');
                }}
                onOpenPredictive={(report) => handleOpenPredictive(report)}
                onRefresh={refreshData}
              />
            )}
          </div>
        ) : (
          <div>
            {adminTab === 'DASHBOARD' && (
              <AdminDashboard
                currentUser={currentUser}
                reports={reports}
                onRefresh={refreshData}
                onOpenGis={() => setAdminTab('GIS')}
                onOpenWeather={() => setAdminTab('CUACA_BMKG')}
                onOpenDailyReports={() => setAdminTab('DAILY_REPORTS')}
                onOpenRevisions={() => setAdminTab('REVISIONS')}
                onOpenUserMgmt={() => setAdminTab('USERS')}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenPredictive={(report) => handleOpenPredictive(report)}
              />
            )}

            {adminTab === 'DAILY_REPORTS' && (
              <DailyReportsList
                currentUser={currentUser}
                existingReports={reports}
                onRefresh={refreshData}
              />
            )}

            {adminTab === 'GIS' && (
              <GisMapView
                reports={reports}
                onOpenPredictive={(report) => handleOpenPredictive(report)}
              />
            )}

            {adminTab === 'CUACA_BMKG' && (
              <WeatherBMKGCard initialKecamatan="Anggeraja" />
            )}

            {adminTab === 'REVISIONS' && (
              <RevisionApprovals reports={reports} onRefresh={refreshData} />
            )}

            {adminTab === 'USERS' && (
              <UserManagement onRefresh={refreshData} />
            )}
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-4 text-xs mt-auto transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-200">SIPERBAWA POLRES ENREKANG Presisi Agro</span>
            <span>• Pendataan Lahan & Monitoring Bhabinkamtibmas</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Hak Cipta © 2026 Polres Enrekang - Polda Sulawesi Selatan. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Gadget Bottom Navigation Bar (Visible only on mobile screens < 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {currentUser.role === 'BHABINKAMTIBMAS' ? (
          <>
            <button
              onClick={() => {
                setEditingDraft(null);
                setBhabinTab('MY_REPORTS');
              }}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                bhabinTab === 'MY_REPORTS'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Lahan</span>
            </button>

            <button
              onClick={() => {
                setEditingDraft(null);
                setBhabinTab('DAILY_REPORTS');
              }}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                bhabinTab === 'DAILY_REPORTS'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Sambang</span>
            </button>

            <button
              onClick={() => {
                setEditingDraft(null);
                setBhabinTab('NEW_REPORT');
              }}
              className="flex flex-col items-center justify-center -mt-4 bg-amber-500 text-slate-950 p-2.5 rounded-full shadow-lg border-2 border-slate-900 active:scale-95 transition"
              title="Input Lahan Baru"
            >
              <PlusCircle className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                setEditingDraft(null);
                setBhabinTab('CUACA_BMKG');
              }}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                bhabinTab === 'CUACA_BMKG'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Cuaca</span>
            </button>

            <button
              onClick={() => {
                setEditingDraft(null);
                setBhabinTab('PANDUAN_KEMENTAN');
              }}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                bhabinTab === 'PANDUAN_KEMENTAN'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Panduan</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAdminTab('DASHBOARD')}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                adminTab === 'DASHBOARD'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Dashboard</span>
            </button>

            <button
              onClick={() => setAdminTab('DAILY_REPORTS')}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                adminTab === 'DAILY_REPORTS'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Sambang</span>
            </button>

            <button
              onClick={() => setAdminTab('GIS')}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                adminTab === 'GIS'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Peta GIS</span>
            </button>

            <button
              onClick={() => setAdminTab('CUACA_BMKG')}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                adminTab === 'CUACA_BMKG'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Cuaca</span>
            </button>

            <button
              onClick={() => setAdminTab('REVISIONS')}
              className={`relative flex flex-col items-center justify-center p-1 rounded-xl transition ${
                adminTab === 'REVISIONS'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-5 h-5 mb-0.5" />
              {pendingRevisionsCount > 0 && (
                <span className="absolute top-0 right-1.5 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">
                  {pendingRevisionsCount}
                </span>
              )}
              <span className="text-[10px] leading-none">Revisi</span>
            </button>
          </>
        )}
      </nav>

      {/* Slide-over Notifications Center */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        currentUser={currentUser}
        onSelectReport={handleSelectReportFromNotif}
      />

      {/* Predictive Harvest Analysis Modal */}
      <PredictiveAnalysisModal
        isOpen={isPredictiveOpen}
        onClose={() => setIsPredictiveOpen(false)}
        initialReport={predictiveTargetReport}
        reports={reports}
      />

      {/* Executive Report & PDF Export Modal (Admin Only) */}
      {currentUser.role === 'ADMIN_PUSAT' && (
        <ReportExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          reports={reports}
          onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        />
      )}

      {/* Google Sheets Integration Modal (Admin Only) */}
      {currentUser.role === 'ADMIN_PUSAT' && (
        <GoogleSheetsIntegrationModal
          isOpen={isGoogleSheetsOpen}
          onClose={() => setIsGoogleSheetsOpen(false)}
          reports={reports}
        />
      )}
    </div>
  );
}
