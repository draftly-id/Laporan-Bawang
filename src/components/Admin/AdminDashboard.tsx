import React, { useState } from 'react';
import {
  ShieldAlert,
  BarChart3,
  MapPin,
  FileEdit,
  Users,
  Download,
  History,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Sprout,
  CloudRain,
  Database,
  FileJson,
  Check,
  HardDrive,
  Cloud,
  RefreshCw,
  CalendarCheck,
  Calendar,
  Building2,
  Navigation,
  Eye,
  Camera,
  ChevronRight,
  User,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LaporanBudidaya, UserAccount, LaporanHarian } from '../../types';
import { adminDeleteReport, downloadDatabaseBackup, getDailyReports } from '../../services/appState';
import { firestoreSync } from '../../services/firestoreSync';

interface AdminDashboardProps {
  currentUser: UserAccount;
  reports: LaporanBudidaya[];
  onRefresh: () => void;
  onOpenGis: () => void;
  onOpenWeather?: () => void;
  onOpenRevisions: () => void;
  onOpenUserMgmt: () => void;
  onOpenExport: () => void;
  onOpenPredictive: (report: LaporanBudidaya) => void;
  onOpenDailyReports?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  reports,
  onRefresh,
  onOpenGis,
  onOpenWeather,
  onOpenRevisions,
  onOpenUserMgmt,
  onOpenExport,
  onOpenPredictive,
  onOpenDailyReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKab, setSelectedKab] = useState('SEMUA');
  const [selectedKecamatan, setSelectedKecamatan] = useState('SEMUA');
  const [selectedDesa, setSelectedDesa] = useState('SEMUA');
  const [deleteModalReport, setDeleteModalReport] = useState<LaporanBudidaya | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedDailyPhoto, setSelectedDailyPhoto] = useState<string | null>(null);

  // Daily Sambang reports
  const dailyReports: LaporanHarian[] = getDailyReports();
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyTodayCount = dailyReports.filter((r) => r.tanggalKunjungan === todayStr).length;
  const uniquePetaniSambang = new Set(dailyReports.map((r) => r.namaPetaniAtauKelompok.toLowerCase().trim())).size;
  const totalFotoSambang = dailyReports.reduce((acc, r) => acc + (r.dokumentasiFoto?.length || 0), 0);

  // Backup Modal State
  const [backupModalData, setBackupModalData] = useState<{
    isOpen: boolean;
    filename: string;
    sizeBytes: number;
    summary: {
      totalReports: number;
      totalUsers: number;
      totalAuditLogs: number;
      totalNotifications: number;
      totalLuasTanamM2: number;
      totalProduksiPanenKg: number;
      totalBibitKg: number;
    };
  } | null>(null);

  const handleBackupLokal = () => {
    const res = downloadDatabaseBackup();
    setBackupModalData({
      isOpen: true,
      filename: res.filename,
      sizeBytes: res.sizeBytes,
      summary: res.summary,
    });
    onRefresh();
  };

  // Cloud Sync Handler State
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncFeedback, setCloudSyncFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handlePushToCloud = async () => {
    setIsCloudSyncing(true);
    setCloudSyncFeedback(null);
    try {
      const result = await firestoreSync.forcePushAllToCloud();
      if (result.success) {
        setCloudSyncFeedback({
          success: true,
          message: `Berhasil sinkronisasi ${result.count} data laporan ke Google Firebase Cloud Firestore.`,
        });
      } else {
        setCloudSyncFeedback({
          success: false,
          message: `Sinkronisasi gagal: ${result.error || 'Terjadi kesalahan jaringan'}`,
        });
      }
    } catch (err: any) {
      setCloudSyncFeedback({
        success: false,
        message: `Koneksi bermasalah: ${err.message}`,
      });
    } finally {
      setIsCloudSyncing(false);
      onRefresh();
      setTimeout(() => {
        setCloudSyncFeedback(null);
      }, 7000);
    }
  };

  // Extract unique Kecamatan and Desa for filter dropdowns
  const listKecamatan = Array.from(
    new Set(reports.map((r) => r.dataLahan.kecamatan).filter(Boolean))
  ).sort();

  const listDesa = Array.from(
    new Set(
      reports
        .filter(
          (r) =>
            selectedKecamatan === 'SEMUA' || r.dataLahan.kecamatan === selectedKecamatan
        )
        .map((r) => r.dataLahan.desaKelurahan)
        .filter(Boolean)
    )
  ).sort();

  // Filtering reports by Kabupaten, Kecamatan, Desa, and Search Term
  const filteredReports = reports.filter((r) => {
    const matchesKab =
      selectedKab === 'SEMUA' || r.dataLahan.kabupaten === selectedKab;
    const matchesKec =
      selectedKecamatan === 'SEMUA' || r.dataLahan.kecamatan === selectedKecamatan;
    const matchesDesa =
      selectedDesa === 'SEMUA' || r.dataLahan.desaKelurahan === selectedDesa;
    const matchesSearch =
      r.dataLahan.desaKelurahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dataLahan.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kelompokTani.namaKelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesKab && matchesKec && matchesDesa && matchesSearch;
  });

  // Key Aggregations based on Filtered Reports
  const totalLahanPotensialM2 = filteredReports.reduce(
    (acc, r) => acc + (r.dataLahan.luasLahanTotalM2 || 0),
    0
  );
  const totalLuasTanamM2 = filteredReports.reduce(
    (acc, r) => acc + (r.dataLahan.luasTanamM2 || 0),
    0
  );
  const totalBibitKg = filteredReports.reduce(
    (acc, r) => acc + (r.dataLahan.jumlahBibitKg || 0),
    0
  );
  const totalPanenKg = filteredReports.reduce(
    (acc, r) => acc + (r.dataLahan.produksiPanenKg || 0),
    0
  );

  // Realisasi Panen Aggregations (Input Bhabinkamtibmas)
  const totalRealisasiPanenKg = filteredReports.reduce(
    (acc, r) => acc + (r.dataPanen?.hasilPanenKg || 0),
    0
  );
  const totalLuasRealisasiPanenM2 = filteredReports.reduce(
    (acc, r) => acc + (r.dataPanen?.luasPanenM2 || 0),
    0
  );
  const laporanPanenList = filteredReports.filter(
    (r) => r.dataPanen && r.dataPanen.hasilPanenKg > 0
  );

  const pendingRevisionsCount = reports.filter(
    (r) => r.status === 'PENGAJUAN_REVISI'
  ).length;

  // Chart Data Aggregations (Per Kecamatan or Kabupaten based on selection)
  const regionMap: Record<
    string,
    { region: string; luasTanamHa: number; panenTon: number; realisasiTon: number; bibitTon: number }
  > = {};

  filteredReports.forEach((r) => {
    const regionName = selectedKecamatan === 'SEMUA'
      ? (r.dataLahan.kecamatan ? `Kec. ${r.dataLahan.kecamatan}` : r.dataLahan.kabupaten || 'Lainnya')
      : `Desa ${r.dataLahan.desaKelurahan}`;
    if (!regionMap[regionName]) {
      regionMap[regionName] = {
        region: regionName,
        luasTanamHa: 0,
        panenTon: 0,
        realisasiTon: 0,
        bibitTon: 0,
      };
    }
    regionMap[regionName].luasTanamHa += Number(
      (r.dataLahan.luasTanamM2 / 10000).toFixed(2)
    );
    regionMap[regionName].panenTon += Number(
      (r.dataLahan.produksiPanenKg / 1000).toFixed(2)
    );
    regionMap[regionName].realisasiTon += Number(
      ((r.dataPanen?.hasilPanenKg || 0) / 1000).toFixed(2)
    );
    regionMap[regionName].bibitTon += Number(
      (r.dataLahan.jumlahBibitKg / 1000).toFixed(2)
    );
  });

  const chartDataByRegion = Object.values(regionMap);

  // Status Tanaman Pie Chart Data
  const stageCounts: Record<string, number> = {};
  filteredReports.forEach((r) => {
    const stage = r.statusTanaman || 'Vegetatif';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const pieColors = ['#38bdf8', '#f59e0b', '#10b981', '#a855f7', '#ec4899'];
  const pieData = Object.keys(stageCounts).map((key, i) => ({
    name: key,
    value: stageCounts[key],
    color: pieColors[i % pieColors.length],
  }));

  const handleDeleteSubmit = () => {
    if (!deleteModalReport || !deleteReason.trim()) return;
    adminDeleteReport(deleteModalReport.id, deleteReason);
    setDeleteModalReport(null);
    setDeleteReason('');
    onRefresh();
  };

  // Executive KPI Summary Calculations (All-time and Current Month)
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);
  const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);

  const sambangBulanIni = dailyReports.filter((r) => r.tanggalKunjungan?.startsWith(currentMonthStr)).length;
  const sambangBulanLalu = dailyReports.filter((r) => r.tanggalKunjungan?.startsWith(lastMonthStr)).length;
  const sambangGrowthPercent =
    sambangBulanLalu > 0
      ? (((sambangBulanIni - sambangBulanLalu) / sambangBulanLalu) * 100).toFixed(1)
      : sambangBulanIni > 0
      ? '+100'
      : '0.0';

  const totalLahanAktifAll = reports.length;
  const totalLuasLahanAktifHaAll = (
    reports.reduce((acc, r) => acc + (r.dataLahan?.luasTanamM2 || 0), 0) / 10000
  ).toFixed(2);
  const totalKelompokTaniAll = new Set(
    reports.map((r) => r.kelompokTani?.namaKelompok || r.namaPetani).filter(Boolean)
  ).size;
  const totalPolsekAktifAll = new Set(
    reports.map((r) => r.polsek).concat(dailyReports.map((r) => r.polsek)).filter(Boolean)
  ).size;
  const totalBhabinAktifAll = new Set(
    reports.map((r) => r.userId || r.userName).concat(dailyReports.map((r) => r.userId || r.userName)).filter(Boolean)
  ).size;
  const totalEstimasiPanenTonAll = (
    reports.reduce((acc, r) => acc + (r.dataLahan?.produksiPanenKg || 0), 0) / 1000
  ).toFixed(1);
  const totalRealisasiPanenTonAll = (
    reports.reduce((acc, r) => acc + (r.dataPanen?.hasilPanenKg || 0), 0) / 1000
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Role Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Command Center Polres Enrekang
            </span>
            <span className="text-xs text-slate-400">• Control Panel Admin Polres Enrekang</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Dashboard Manajemen & Monitoring Budidaya Bawang Putih
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengelola: <span className="text-amber-300 font-semibold">{currentUser.name}</span> ({currentUser.polres})
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onOpenGis}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
          >
            <MapPin className="w-4 h-4 text-amber-400" /> Peta GIS
          </button>

          {onOpenWeather && (
            <button
              onClick={onOpenWeather}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold flex items-center gap-1.5 transition"
            >
              <CloudRain className="w-4 h-4 text-cyan-400" /> Cuaca BMKG
            </button>
          )}

          {onOpenDailyReports && (
            <button
              onClick={onOpenDailyReports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Buka Pusat Monitoring Laporan Harian Sambang Bhabinkamtibmas Seluruh Polsek"
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Monitoring Sambang</span>
              {dailyReports.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {dailyReports.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenRevisions}
            className="relative px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileEdit className="w-4 h-4 text-amber-400" /> Revisi Data
            {pendingRevisionsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingRevisionsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenUserMgmt}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
          >
            <Users className="w-4 h-4 text-amber-400" /> User Control
          </button>

          <button
            onClick={onOpenExport}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Ekspor & PDF
          </button>

          <button
            onClick={handlePushToCloud}
            disabled={isCloudSyncing}
            className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-amber-900/30 transition border border-amber-400/30 cursor-pointer"
            title="Sinkronisasi seluruh data lokal ke Google Firebase Cloud Firestore secara real-time"
          >
            {isCloudSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 text-amber-200 animate-spin" /> Sinkronisasi...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-amber-200" /> Sinkron Firestore
              </>
            )}
          </button>

          <button
            onClick={handleBackupLokal}
            className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition border border-indigo-400/30 cursor-pointer"
            title="Unduh salinan cadangan lengkap database lokal (format JSON) ke perangkat Anda sebagai tindakan preventif"
          >
            <Database className="w-4 h-4 text-indigo-200" /> Backup Lokal
          </button>
        </div>
      </div>

      {/* Cloud Sync Feedback Banner */}
      {cloudSyncFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in transition-all ${
            cloudSyncFeedback.success
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {cloudSyncFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{cloudSyncFeedback.message}</span>
          </div>
          <button
            onClick={() => setCloudSyncFeedback(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ringkasan Statistik Operasional Eksekutif (Executive Summary Overview Cards) */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Ringkasan Eksekutif & Overview Operasional
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 hidden sm:inline-block">
                  Live Status
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Overview instan budidaya, intensitas sambang lapangan, dan tren kinerja operasional ({currentMonthName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Presisi Bhabinkamtibmas Polres Enrekang</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Lahan Aktif */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 text-white shadow-md transition duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Lahan Aktif
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 tracking-tight">
                  {totalLahanAktifAll}{' '}
                  <span className="text-xs font-semibold text-slate-300">Lahan</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] truncate">
                {totalLuasLahanAktifHaAll} Ha ({totalKelompokTaniAll} Poktan)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                <Layers className="w-3 h-3" />
                <span>{totalPolsekAktifAll} Polsek</span>
              </span>
            </div>
          </div>

          {/* Card 2: Total Kunjungan Sambang Bulan Ini */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-4 text-white shadow-md transition duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sambang Bulan Ini
                </span>
                <div className="text-2xl sm:text-3xl font-black text-sky-400 mt-1 tracking-tight">
                  {sambangBulanIni}{' '}
                  <span className="text-xs font-semibold text-slate-300">Kunjungan</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] truncate">
                {dailyTodayCount} hari ini • {uniquePetaniSambang} Petani
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                <Camera className="w-3 h-3" />
                <span>{totalFotoSambang} Foto</span>
              </span>
            </div>
          </div>

          {/* Card 3: Tren Pertumbuhan & Keaktifan Personel */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 text-white shadow-md transition duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tren Pertumbuhan Sambang
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tracking-tight flex items-center gap-1">
                  <span>
                    {Number(sambangGrowthPercent) >= 0 ? `+${sambangGrowthPercent}%` : `${sambangGrowthPercent}%`}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                {Number(sambangGrowthPercent) >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] truncate">
                {totalBhabinAktifAll} Bhabin Aktif Melapor
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                <ArrowUpRight className="w-3 h-3" />
                <span>Aktif</span>
              </span>
            </div>
          </div>

          {/* Card 4: Proyeksi & Hasil Panen */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 text-white shadow-md transition duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Proyeksi & Hasil Panen
                </span>
                <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1 tracking-tight">
                  {totalEstimasiPanenTonAll}{' '}
                  <span className="text-xs font-semibold text-slate-300">Ton Est.</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-purple-300 text-[11px] font-semibold truncate">
                Riil: {totalRealisasiPanenTonAll} Ton ({laporanPanenList.length} Poktan)
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                <span>Panen</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Spesifik Wilayah Kerja Bhabinkamtibmas */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Filter className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                Filter Produksi Spesifik Wilayah Kerja Bhabinkamtibmas
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih Kecamatan atau Desa untuk memfilter seluruh data produksi, grafik, dan matriks laporan
              </p>
            </div>
          </div>

          {(selectedKecamatan !== 'SEMUA' || selectedDesa !== 'SEMUA' || searchTerm !== '') && (
            <button
              onClick={() => {
                setSelectedKecamatan('SEMUA');
                setSelectedDesa('SEMUA');
                setSearchTerm('');
                setSelectedKab('SEMUA');
              }}
              className="text-xs bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl font-bold transition self-start md:self-auto flex items-center gap-1"
            >
              ✕ Reset Filter Wilayah
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Filter Kecamatan */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
              Kecamatan:
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => {
                setSelectedKecamatan(e.target.value);
                setSelectedDesa('SEMUA');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="SEMUA">🌐 Semua Kecamatan (Polres Enrekang)</option>
              {listKecamatan.map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Desa / Kelurahan */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
              Desa / Kelurahan Binaan:
            </label>
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="SEMUA">🏡 Semua Desa / Kelurahan</option>
              {listDesa.map((desa) => (
                <option key={desa} value={desa}>
                  Desa {desa}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
              Pencarian Kata Kunci / Poktan:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Poktan, Bhabin, ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status Indicator Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Menampilkan Data:{' '}
              <strong className="text-amber-300">
                {selectedKecamatan === 'SEMUA' ? 'Seluruh Wilayah Hukum' : `Kec. ${selectedKecamatan}`}
                {selectedDesa !== 'SEMUA' ? ` • Desa ${selectedDesa}` : ''}
              </strong>
            </span>
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {filteredReports.length} dari {reports.length} Laporan Ditemukan
          </span>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Luas Lahan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Luas Lahan Potensial
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400 my-1">
            {(totalLahanPotensialM2 / 10000).toFixed(2)} <span className="text-xs text-slate-300 font-medium">Ha</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {totalLahanPotensialM2.toLocaleString('id-ID')} m²
          </p>
        </div>

        {/* Total Luas Tanam Aktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Luas Tanam Aktif
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-sky-400 my-1">
            {(totalLuasTanamM2 / 10000).toFixed(2)} <span className="text-xs text-slate-300 font-medium">Ha</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {((totalLuasTanamM2 / (totalLahanPotensialM2 || 1)) * 100).toFixed(1)}% Utilisasi Lahan
          </p>
        </div>

        {/* Volume Benih Ditanam */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Jumlah Benih yang Ditanam
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-400 my-1">
            {(totalBibitKg / 1000).toFixed(2)} <span className="text-xs text-slate-300 font-medium">Ton</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {totalBibitKg.toLocaleString('id-ID')} Kg
          </p>
        </div>

        {/* Proyeksi Hasil Panen */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Proyeksi Panen
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 my-1">
            {(totalPanenKg / 1000).toFixed(2)} <span className="text-xs text-slate-300 font-medium">Ton</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            ~{((totalPanenKg / (totalLuasTanamM2 || 1)) * 10).toFixed(1)} Ton/Ha Est.
          </p>
        </div>

        {/* Realisasi Hasil Panen (Bhabinkamtibmas) */}
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 opacity-10 text-emerald-400">
            <Sprout className="w-20 h-20" />
          </div>
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 block">
            🌾 Realisasi Panen
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-300 my-1">
            {(totalRealisasiPanenKg / 1000).toFixed(2)} <span className="text-xs text-slate-200 font-medium">Ton</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 font-mono font-semibold">
            {laporanPanenList.length} Poktan • {(totalLuasRealisasiPanenM2 / 10000).toFixed(2)} Ha Panen
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Yield vs Area per Regency */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Rekapitulasi Luas Tanam (Ha) & Panen (Ton) Per Wilayah
            </h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataByRegion} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="luasTanamHa" name="Luas Tanam (Ha)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="panenTon" name="Proyeksi Panen (Ton)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realisasiTon" name="Realisasi Panen (Ton)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Crop Growth Stages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3 flex flex-col">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Distribusi Fase Pertumbuhan
            </h3>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={4}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs border-t border-slate-800 pt-2">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </span>
                <span className="font-bold text-white">{p.value} Laporan</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matriks Laporan Realisasi Hasil Panen (Bhabinkamtibmas) */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-emerald-300 flex items-center gap-2">
                Matriks Realisasi Hasil Produksi Panen (Input Bhabinkamtibmas)
              </h3>
              <p className="text-xs text-slate-400">
                Data resmi realisasi panen lapangan yang diinput langsung oleh petugas Bhabinkamtibmas wilayah binaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <span className="text-slate-400">Total Terpanen:</span>
            <span className="font-extrabold text-amber-300 text-sm">
              {(totalRealisasiPanenKg / 1000).toFixed(2)} Ton
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">
              {laporanPanenList.length} Laporan Poktan
            </span>
          </div>
        </div>

        {laporanPanenList.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/50 rounded-xl border border-slate-800/80">
            Belum ada laporan realisasi panen yang diinput oleh Bhabinkamtibmas. Data akan muncul otomatis saat Bhabinkamtibmas menginput tanggal, luas, dan hasil panen.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3">Tanggal Panen</th>
                  <th className="p-3">Kelompok Tani & Desa</th>
                  <th className="p-3">Bhabinkamtibmas</th>
                  <th className="p-3">Varietas Bibit</th>
                  <th className="p-3">Luas Panen (m²)</th>
                  <th className="p-3">Proyeksi (Ton)</th>
                  <th className="p-3">Realisasi (Ton)</th>
                  <th className="p-3">Catatan / Kualitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {laporanPanenList.map((r) => {
                  const dataP = r.dataPanen!;
                  const realisasiTon = (dataP.hasilPanenKg / 1000).toFixed(2);
                  const proyeksiTon = (r.dataLahan.produksiPanenKg / 1000).toFixed(2);
                  const deviasiPct = Math.round((dataP.hasilPanenKg / (r.dataLahan.produksiPanenKg || 1)) * 100);

                  return (
                    <tr key={`panen-${r.id}`} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-emerald-300">{dataP.tanggalPanen}</div>
                        <div className="text-[10px] text-slate-500">ID: {r.id}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white">{r.kelompokTani.namaKelompok}</div>
                        <div className="text-[10px] text-slate-400">
                          Desa {r.dataLahan.desaKelurahan}, Kec. {r.dataLahan.kecamatan}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{r.userName}</div>
                        <div className="text-[10px] text-slate-400">{r.userPolres}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-bold">
                          {r.dataLahan.varietasBawang || 'Great Black'}
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-bold text-sky-300">
                          {dataP.luasPanenM2?.toLocaleString('id-ID')} m²
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ({(dataP.luasPanenM2 / 10000).toFixed(2)} Ha)
                        </div>
                      </td>

                      <td className="p-3 font-mono font-semibold text-slate-400">
                        {proyeksiTon} Ton
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-black text-amber-300 text-sm">
                          {realisasiTon} Ton
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            deviasiPct >= 100
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {deviasiPct}% Capaian Target
                        </span>
                      </td>

                      <td className="p-3">
                        <p className="text-[11px] text-slate-300 max-w-xs truncate italic">
                          {dataP.catatanPanen || 'Kondisi hasil panen baik.'}
                        </p>
                        {dataP.fotoPanen && dataP.fotoPanen.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {dataP.fotoPanen.map((f) => (
                              <img
                                key={f.id}
                                src={f.url}
                                alt="Foto Panen"
                                className="w-8 h-8 rounded border border-emerald-500/40 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monitoring Real-Time Laporan Harian Sambang Bhabinkamtibmas Presisi */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-amber-300">
                  Monitoring Laporan Harian Sambang Bhabinkamtibmas
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                  Presisi Agro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pemantauan terpusat kegiatan tatap muka, pendampingan kelompok tani, dan patroli dialogis ketahanan pangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDailyReports && (
              <button
                onClick={onOpenDailyReports}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <span>Lihat Seluruh Laporan ({dailyReports.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Daily Sambang Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Total Sambang</p>
              <p className="text-base font-extrabold text-white">
                {dailyReports.length} <span className="text-[10px] font-normal text-slate-400">Kegiatan</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Kunjungan Hari Ini</p>
              <p className="text-base font-extrabold text-sky-300">
                {dailyTodayCount} <span className="text-[10px] font-normal text-slate-400">Kegiatan</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Petani Didampingi</p>
              <p className="text-base font-extrabold text-emerald-300">
                {uniquePetaniSambang} <span className="text-[10px] font-normal text-slate-400">Sasaran</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Foto Berstempel</p>
              <p className="text-base font-extrabold text-purple-300">
                {totalFotoSambang} <span className="text-[10px] font-normal text-slate-400">Bukti</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recent Daily Sambang List */}
        {dailyReports.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/50 rounded-xl border border-slate-800/80">
            Belum ada data laporan harian kunjungan Bhabinkamtibmas. Laporan sambang akan masuk otomatis begitu diinput oleh personel di lapangan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dailyReports.slice(0, 6).map((d) => (
              <div
                key={d.id}
                className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 space-y-2.5 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      {d.tanggalKunjungan} • {d.waktuKunjungan || '09:00'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-400" /> {d.polsek}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{d.namaPetaniAtauKelompok}</span>
                      </h4>
                      {d.latitude && d.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                        >
                          <Navigation className="w-2.5 h-2.5" /> Maps
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{d.lokasiLahan}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-medium">
                      {d.kategoriMonitoring}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-medium border border-emerald-800/40 flex items-center gap-0.5">
                      <Sprout className="w-2.5 h-2.5 text-emerald-400" />
                      {d.kondisiTanaman}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/90 p-2 rounded-xl border border-slate-800/60">
                    "{d.catatan}"
                  </p>

                  {/* Photo Thumbnails */}
                  {d.dokumentasiFoto && d.dokumentasiFoto.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      {d.dokumentasiFoto.map((p, pIdx) => (
                        <img
                          key={p.id || pIdx}
                          src={p.url}
                          alt="Dokumentasi Sambang"
                          onClick={() => setSelectedDailyPhoto(p.url)}
                          className="w-12 h-9 rounded-lg object-cover border border-slate-700 hover:border-amber-400 cursor-pointer transition shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Bhabin: <strong className="text-slate-200">{d.userName}</strong>
                  </span>
                  {onOpenDailyReports && (
                    <button
                      onClick={onOpenDailyReports}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Buka Detail →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Panel CRUD Table for Reports */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white">
              Kontrol Data Penuh (CRUD & Verifikasi Laporan Wilayah)
            </h3>
            <p className="text-xs text-slate-400">
              Hak akses Admin Polres Enrekang untuk validasi, koreksi resmi, atau hapus data ganda/spam
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Desa, Poktan, Bhabin..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedKecamatan}
              onChange={(e) => {
                setSelectedKecamatan(e.target.value);
                setSelectedDesa('SEMUA');
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Kecamatan</option>
              {listKecamatan.map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CRUD Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3">ID & Tanggal</th>
                <th className="p-3">Kelompok Tani & Lokasi</th>
                <th className="p-3">Petugas Bhabinkamtibmas</th>
                <th className="p-3">Luas Tanam / Bibit</th>
                <th className="p-3">Proyeksi Panen</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi Control Admin</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Sprout className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        Belum Ada Data Laporan Masuk
                      </p>
                      <p className="text-xs text-slate-500">
                        Data budidaya akan otomatis muncul di sini setelah personel Bhabinkamtibmas mengirimkan laporan lapangan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-amber-400">{report.id}</div>
                      <div className="text-[10px] text-slate-500">{report.tanggalInput}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white">{report.kelompokTani.namaKelompok}</div>
                      <div className="text-[10px] text-slate-400">
                        Desa {report.dataLahan.desaKelurahan}, Kec. {report.dataLahan.kecamatan}, Kab. {report.dataLahan.kabupaten}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{report.userName}</div>
                      <div className="text-[10px] text-slate-400">{report.userPolres}</div>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="font-bold text-sky-300">
                        {report.dataLahan.luasTanamM2.toLocaleString('id-ID')} m²
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Bibit: {report.dataLahan.jumlahBibitKg.toLocaleString('id-ID')} Kg
                      </div>
                      <div className="text-[10px] text-amber-400 font-sans font-semibold">
                        Var: {report.dataLahan.varietasBawang || 'Great Black'}
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {(report.dataLahan.produksiPanenKg / 1000).toFixed(2)} Ton
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'DISETUJUI'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : report.status === 'PENGAJUAN_REVISI'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/60 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPredictive(report)}
                          className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1"
                          title="Analisis Prediktif"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Prediksi
                        </button>

                        <button
                          onClick={() => setDeleteModalReport(report)}
                          className="p-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[10px] font-bold flex items-center gap-1"
                          title="Hapus Laporan (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Konfirmasi Penghapusan Data (Admin)
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              Anda akan menghapus Laporan <span className="font-bold text-white">{deleteModalReport.id}</span> ({deleteModalReport.kelompokTani.namaKelompok}). Tindakan ini akan dicatat dalam Audit Log.
            </p>

            <div className="text-xs space-y-1">
              <label className="block text-slate-400 font-semibold">
                Alasan Penghapusan (Mandatory) *
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Contoh: Data ganda (duplicate), input tes/uji coba..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteModalReport(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={!deleteReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow"
              >
                Hapus Permanen & Catat Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Lokal Success & Information Modal */}
      {backupModalData && backupModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg p-5 sm:p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    Backup Database Lokal Berhasil
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Salinan file JSON telah diunduh ke perangkat Anda
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
              </span>
            </div>

            {/* File Info Box */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-amber-400" /> Nama Berkas:
                </span>
                <span className="font-mono text-[11px] text-amber-300 font-bold break-all">
                  {backupModalData.filename}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-900 pt-1.5">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-400" /> Ukuran File:
                </span>
                <span className="font-mono text-slate-200">
                  {(backupModalData.sizeBytes / 1024).toFixed(2)} KB ({backupModalData.sizeBytes.toLocaleString('id-ID')} bytes)
                </span>
              </div>
            </div>

            {/* Summary Statistics of Backed Up Data */}
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">
                Rangkuman Entitas Data yang Disalin:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Laporan Budidaya</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {backupModalData.summary.totalReports}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Akun User/Bhabin</span>
                  <span className="text-base font-extrabold text-sky-400">
                    {backupModalData.summary.totalUsers}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Audit Log</span>
                  <span className="text-base font-extrabold text-amber-400">
                    {backupModalData.summary.totalAuditLogs}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Notifikasi</span>
                  <span className="text-base font-extrabold text-purple-400">
                    {backupModalData.summary.totalNotifications}
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Preventative Notice */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-[11px] text-indigo-200/90 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>Tindakan Preventif Terjamin:</strong> File salinan cadangan JSON ini memuat seluruh data lahan, riwayat koordinat GPS, foto dokumentasi, dan catatan audit log secara komprehensif. Simpan berkas ini di penyimpanan lokal atau flashdisk eksternal sebagai proteksi kehilangan data.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={handleBackupLokal}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Ulang
              </button>

              <button
                onClick={() => setBackupModalData(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Sambang Photo Zoom Modal */}
      {selectedDailyPhoto && (
        <div
          onClick={() => setSelectedDailyPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-3 shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setSelectedDailyPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 flex items-center justify-center transition border border-white/20"
            >
              ✕
            </button>
            <img
              src={selectedDailyPhoto}
              alt="Dokumentasi Sambang Zoom"
              className="max-h-[80vh] w-auto object-contain rounded-2xl mx-auto"
              referrerPolicy="no-referrer"
            />
            <div className="text-center mt-2 text-xs text-slate-400">
              Dokumentasi Lapangan Sambang Bhabinkamtibmas Presisi - Satbinmas Polres Enrekang
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
