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
} from 'lucide-react';
import { UserAccount, LaporanBudidaya } from './types';
import {
  getCurrentUser,
  getReports,
  subscribeState,
  logoutUser,
} from './services/appState';

import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PredictiveAnalysisModal } from './components/PredictiveAnalysisModal';
import { GoogleSheetsIntegrationModal } from './components/Admin/GoogleSheetsIntegrationModal';
import { WeatherBMKGCard } from './components/WeatherBMKGCard';

// Bhabinkamtibmas Components
import { MyReportsList } from './components/Bhabinkamtibmas/MyReportsList';
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
  const [bhabinTab, setBhabinTab] = useState<'MY_REPORTS' | 'NEW_REPORT' | 'CUACA_BMKG' | 'PANDUAN_KEMENTAN'>('MY_REPORTS');
  const [editingDraft, setEditingDraft] = useState<LaporanBudidaya | null>(null);

  // Admin Active Sub-tab
  const [adminTab, setAdminTab] = useState<
    'DASHBOARD' | 'GIS' | 'CUACA_BMKG' | 'REVISIONS' | 'USERS'
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Role Navigation Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm dark:shadow-md transition-colors">
          {/* Active Context Identity */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.role === 'ADMIN_PUSAT' ? <Shield className="w-5 h-5" /> : <Sprout className="w-5 h-5" />}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentUser.name}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold">
                  {currentUser.role === 'ADMIN_PUSAT' ? 'ADMIN POLRES ENREKANG' : `BHABINKAMTIBMAS - ${currentUser.rank}`}
                </span>
                <button
                  onClick={() => {
                    logoutUser();
                  }}
                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/80 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 rounded-md transition cursor-pointer"
                  title="Keluar dari Sistem (Log Out)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentUser.polres} • {currentUser.polsek} ({currentUser.wilayahBinaan})
              </p>
            </div>
          </div>

          {/* Role Specific Navigation Tabs */}
          {currentUser.role === 'BHABINKAMTIBMAS' ? (
            /* Bhabinkamtibmas View Switcher */
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('MY_REPORTS');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  bhabinTab === 'MY_REPORTS'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Daftar Laporan Saya
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('NEW_REPORT');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  bhabinTab === 'NEW_REPORT'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Input Laporan Lahan Baru
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('CUACA_BMKG');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  bhabinTab === 'CUACA_BMKG'
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" /> Cuaca & BMKG
              </button>

              <button
                onClick={() => {
                  setEditingDraft(null);
                  setBhabinTab('PANDUAN_KEMENTAN');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  bhabinTab === 'PANDUAN_KEMENTAN'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Panduan Budidaya Kementan
              </button>
            </div>
          ) : (
            /* Admin Pusat View Switcher */
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setAdminTab('DASHBOARD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === 'DASHBOARD'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>

              <button
                onClick={() => setAdminTab('GIS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === 'GIS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Peta GIS
              </button>

              <button
                onClick={() => setAdminTab('CUACA_BMKG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === 'CUACA_BMKG'
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" /> Cuaca BMKG
              </button>

              <button
                onClick={() => setAdminTab('REVISIONS')}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === 'REVISIONS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Persetujuan Revisi
                {pendingRevisionsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {pendingRevisionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminTab('USERS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === 'USERS'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Akun User
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
                onOpenRevisions={() => setAdminTab('REVISIONS')}
                onOpenUserMgmt={() => setAdminTab('USERS')}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenPredictive={(report) => handleOpenPredictive(report)}
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
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 py-4 px-4 text-xs mt-auto transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 dark:text-slate-200">SIPERBAWA POLRES ENREKANG Presisi Agro</span>
            <span>• Pendataan Lahan Budidaya Bawang Putih Terintegrasi</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Hak Cipta © 2026 Polres Enrekang - Polda Sulawesi Selatan. All rights reserved.
          </div>
        </div>
      </footer>

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
