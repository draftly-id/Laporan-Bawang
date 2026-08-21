import React, { useState } from 'react';
import {
  CalendarCheck,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Camera,
  FileText,
  User,
  Sprout,
  ShieldCheck,
  Printer,
  ChevronRight,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Users,
  Eye,
  X,
  Sparkles,
  Download,
  Building2,
  Navigation,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  UserAccount,
  LaporanHarian,
  LaporanBudidaya,
  KategoriMonitoring,
} from '../../types';
import {
  getDailyReports,
  deleteDailyReport,
} from '../../services/appState';
import { DailyReportFormModal } from './DailyReportFormModal';

interface DailyReportsListProps {
  currentUser: UserAccount;
  existingReports: LaporanBudidaya[];
  onRefresh: () => void;
}

export const DailyReportsList: React.FC<DailyReportsListProps> = ({
  currentUser,
  existingReports,
  onRefresh,
}) => {
  const [dailyReports, setDailyReports] = useState<LaporanHarian[]>(getDailyReports());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolsek, setSelectedPolsek] = useState<string>('ALL');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('ALL');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LaporanHarian | null>(null);
  const [viewingDetailReport, setViewingDetailReport] = useState<LaporanHarian | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const refreshList = () => {
    setDailyReports(getDailyReports());
    onRefresh();
  };

  // Extract unique Polseks and Officers for filter dropdowns
  const listPolsek = Array.from(
    new Set(dailyReports.map((r) => r.polsek).filter(Boolean))
  ).sort();

  const listOfficers = Array.from(
    new Set(
      dailyReports
        .filter((r) => selectedPolsek === 'ALL' || r.polsek === selectedPolsek)
        .map((r) => r.userName)
        .filter(Boolean)
    )
  ).sort();

  // Filter reports: if currentUser is Bhabin, STRICTLY show their own reports only
  const userFilteredReports = dailyReports.filter((r) => {
    if (currentUser.role === 'BHABINKAMTIBMAS') {
      const isMatchId = Boolean(r.userId && currentUser.id && r.userId === currentUser.id);
      const isMatchNrp = Boolean(
        r.userNrp &&
        currentUser.username &&
        r.userNrp.toLowerCase().trim() === currentUser.username.toLowerCase().trim()
      );
      const isMatchName = Boolean(
        r.userName &&
        currentUser.name &&
        r.userName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
      );
      return isMatchId || isMatchNrp || isMatchName;
    }
    return true; // Admin Pusat sees all reports from all personnel
  });

  // Calculate KPIs based on the filtered scope
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const totalKunjungan = userFilteredReports.length;
  const kunjunganHariIni = userFilteredReports.filter((r) => r.tanggalKunjungan === todayStr).length;
  const kunjunganBulanIni = userFilteredReports.filter((r) =>
    r.tanggalKunjungan?.startsWith(currentMonthStr)
  ).length;
  const uniquePetani = new Set(
    userFilteredReports.map((r) => r.namaPetaniAtauKelompok.toLowerCase().trim())
  ).size;
  const totalFoto = userFilteredReports.reduce(
    (acc, r) => acc + (r.dokumentasiFoto?.length || 0),
    0
  );

  // Polsek activity counts for Admin breakdown (Only calculated from all reports for Admin)
  const polsekCounts: Record<string, number> = {};
  if (currentUser.role === 'ADMIN_PUSAT') {
    dailyReports.forEach((r) => {
      const pol = r.polsek || 'Polres Enrekang';
      polsekCounts[pol] = (polsekCounts[pol] || 0) + 1;
    });
  }

  // Apply filters
  const filteredList = userFilteredReports.filter((r) => {
    // Search filter
    const matchSearch =
      r.namaPetaniAtauKelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lokasiLahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.catatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.polsek.toLowerCase().includes(searchTerm.toLowerCase());

    // Polsek filter
    const matchPolsek = selectedPolsek === 'ALL' || r.polsek === selectedPolsek;

    // Officer filter
    const matchOfficer = selectedOfficer === 'ALL' || r.userName === selectedOfficer;

    // Kategori filter
    const matchKategori =
      selectedKategori === 'ALL' || r.kategoriMonitoring === selectedKategori;

    // Period filter
    let matchPeriod = true;
    if (selectedPeriod === 'TODAY') {
      matchPeriod = r.tanggalKunjungan === todayStr;
    } else if (selectedPeriod === 'MONTH') {
      matchPeriod = r.tanggalKunjungan?.startsWith(currentMonthStr);
    } else if (selectedPeriod === 'WEEK') {
      const reportDate = new Date(r.tanggalKunjungan);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchPeriod = reportDate >= sevenDaysAgo;
    }

    return matchSearch && matchPolsek && matchOfficer && matchKategori && matchPeriod;
  });

  const handleDelete = (id: string, namaPetani: string) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus Laporan Harian Kunjungan ke "${namaPetani}"?`
      )
    ) {
      deleteDailyReport(id);
      refreshList();
    }
  };

  const handlePrintOfficialDoc = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      alert('Tidak ada data laporan yang sesuai filter untuk diekspor.');
      return;
    }

    const headers = [
      'ID Laporan',
      'Tanggal Kunjungan',
      'Waktu (WITA)',
      'Petugas Bhabinkamtibmas',
      'Pangkat/NRP',
      'Kesatuan Polsek',
      'Nama Petani / Poktan',
      'Lokasi Lahan',
      'Kategori Monitoring',
      'Kondisi Tanaman',
      'Catatan Temuan',
      'Arahan & Himbauan Kamtibmas',
      'Latitude',
      'Longitude',
      'Jumlah Foto Bukti',
      'Status',
    ];

    const rows = filteredList.map((r) => [
      `"${r.id}"`,
      `"${r.tanggalKunjungan}"`,
      `"${r.waktuKunjungan || '09:00'}"`,
      `"${r.userName}"`,
      `"${r.userRank} / ${r.userNrp}"`,
      `"${r.polsek}"`,
      `"${r.namaPetaniAtauKelompok.replace(/"/g, '""')}"`,
      `"${r.lokasiLahan.replace(/"/g, '""')}"`,
      `"${r.kategoriMonitoring}"`,
      `"${r.kondisiTanaman}"`,
      `"${r.catatan.replace(/"/g, '""')}"`,
      `"${(r.tindakanBhabinkamtibmas || '').replace(/"/g, '""')}"`,
      `"${r.latitude}"`,
      `"${r.longitude}"`,
      `"${r.dokumentasiFoto?.length || 0}"`,
      `"${r.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Laporan_Harian_Bhabinkamtibmas_Enrekang_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner - Distinct for Bhabinkamtibmas vs Admin Pusat */}
      {currentUser.role === 'BHABINKAMTIBMAS' ? (
        /* BHABINKAMTIBMAS PERSONAL FIELD DASHBOARD HEADER */
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/20 p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bhabinkamtibmas Presisi • Polsek {currentUser.polsek || 'Enrekang'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Jurnal Sambang & Monitoring Petani Binaan
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                Buku catatan digital kegiatan kunjungan tatap muka, pendampingan komoditas bawang putih, dialog kamtibmas, dan pemantauan kondisi lahan di wilayah binaan Anda.
              </p>

              {/* Officer Profile Summary Pill */}
              <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-slate-200">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{currentUser.rank || 'Bripka'} {currentUser.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">(NRP: {currentUser.username})</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-amber-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Desa/Kel. Binaan: <strong className="text-white">{currentUser.wilayahBinaan || 'Wilayah Hukum'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
              <button
                onClick={() => {
                  setEditingReport(null);
                  setIsFormOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>+ Input Laporan Kunjungan Sambang</span>
              </button>
            </div>
          </div>

          {/* Bhabinkamtibmas Personal KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Sambang Saya</p>
                <p className="text-lg font-extrabold text-white leading-none mt-0.5">
                  {totalKunjungan} <span className="text-[11px] font-normal text-slate-400">Kegiatan</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Hari Ini / Bulan Ini</p>
                <p className="text-lg font-extrabold text-white leading-none mt-0.5">
                  {kunjunganHariIni} <span className="text-[11px] font-normal text-slate-400">/ {kunjunganBulanIni} bln</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Petani Binaan Saya</p>
                <p className="text-lg font-extrabold text-white leading-none mt-0.5">
                  {uniquePetani} <span className="text-[11px] font-normal text-slate-400">Sasaran</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Foto Dokumentasi Saya</p>
                <p className="text-lg font-extrabold text-white leading-none mt-0.5">
                  {totalFoto} <span className="text-[11px] font-normal text-slate-400">Foto Bukti</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN PUSAT COMMAND CENTER HEADER */
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>🛡️ Satbinmas Command Center • Monitoring Laporan Harian Jajaran</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                Monitoring Seluruh Laporan Harian Sambang Bhabinkamtibmas
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Pemantauan real-time kegiatan sambang, dialog kamtibmas, pendampingan petani binaan, dan dokumentasi berstempel waktu dari seluruh personel Polsek jajaran Polres Enrekang.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                title="Unduh Rekap Spreadsheet (CSV) Seluruh Laporan Jajaran"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Admin Pusat Command Center KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Kunjungan Jajaran</p>
                <p className="text-lg font-bold text-white leading-none mt-0.5">
                  {totalKunjungan} <span className="text-[11px] font-normal text-slate-400">Laporan</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Hari Ini / Bulan Ini (Jajaran)</p>
                <p className="text-lg font-bold text-white leading-none mt-0.5">
                  {kunjunganHariIni} <span className="text-[11px] font-normal text-slate-400">/ {kunjunganBulanIni} bln</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Petani Sasaran</p>
                <p className="text-lg font-bold text-white leading-none mt-0.5">
                  {uniquePetani} <span className="text-[11px] font-normal text-slate-400">Sasaran</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Dokumentasi Berstempel</p>
                <p className="text-lg font-bold text-white leading-none mt-0.5">
                  {totalFoto} <span className="text-[11px] font-normal text-slate-400">Foto</span>
                </p>
              </div>
            </div>
          </div>

          {/* Polsek Breakdown Chips for Admin */}
          {Object.keys(polsekCounts).length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Distribusi Polsek:
              </span>
              {Object.entries(polsekCounts).map(([polsekName, count]) => (
                <button
                  key={polsekName}
                  onClick={() => setSelectedPolsek(selectedPolsek === polsekName ? 'ALL' : polsekName)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedPolsek === polsekName
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <span>{polsekName}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-amber-300 font-mono">
                    {count}
                  </span>
                </button>
              ))}
              {selectedPolsek !== 'ALL' && (
                <button
                  onClick={() => setSelectedPolsek('ALL')}
                  className="text-[10px] text-rose-400 hover:underline ml-1"
                >
                  ✕ Reset Polsek
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              currentUser.role === 'ADMIN_PUSAT'
                ? 'Cari petani, kelompok, Bhabin, Polsek, catatan...'
                : 'Cari petani binaan, lokasi lahan, catatan...'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-amber-500 text-slate-950'
                  : 'hover:text-white'
              }`}
              title="Tampilan Kartu Lengkap"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'hover:text-white'
              }`}
              title="Tampilan Tabel Rekapitulasi (Kapan, Siapa, Apa)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel Rekap</span>
            </button>
          </div>

          {/* Polsek Dropdown (ONLY for Admin Pusat) */}
          {currentUser.role === 'ADMIN_PUSAT' && listPolsek.length > 0 && (
            <select
              value={selectedPolsek}
              onChange={(e) => {
                setSelectedPolsek(e.target.value);
                setSelectedOfficer('ALL');
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">🏢 Semua Polsek</option>
              {listPolsek.map((pol) => (
                <option key={pol} value={pol}>
                  {pol}
                </option>
              ))}
            </select>
          )}

          {/* Officer Dropdown (ONLY for Admin Pusat) */}
          {currentUser.role === 'ADMIN_PUSAT' && listOfficers.length > 1 && (
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">👮 Semua Personel</option>
              {listOfficers.map((off) => (
                <option key={off} value={off}>
                  {off}
                </option>
              ))}
            </select>
          )}

          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedPeriod('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedPeriod === 'ALL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedPeriod('TODAY')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedPeriod === 'TODAY'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setSelectedPeriod('WEEK')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedPeriod === 'WEEK'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setSelectedPeriod('MONTH')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedPeriod === 'MONTH'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Rutin / Pemantauan Vegetatif">Rutin / Pemantauan Vegetatif</option>
            <option value="Pengecekan Hama & Penyakit">Pengecekan Hama & Penyakit</option>
            <option value="Pendampingan Pemupukan & Pengairan">Pendampingan Pemupukan & Pengairan</option>
            <option value="Kesiapan & Estimasi Panen">Kesiapan & Estimasi Panen</option>
            <option value="Edukasi & Sambang Kamtibmas Petani">Edukasi & Sambang Kamtibmas Petani</option>
            <option value="Koordinasi PPL & Kelompok Tani">Koordinasi PPL & Kelompok Tani</option>
          </select>
        </div>
      </div>

      {/* Reports Content Area */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">
            {currentUser.role === 'BHABINKAMTIBMAS'
              ? 'Belum Ada Laporan Kunjungan Sambang Saya'
              : 'Belum Ada Laporan Harian Masuk dari Jajaran'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            {searchTerm || selectedPolsek !== 'ALL' || selectedOfficer !== 'ALL' || selectedKategori !== 'ALL' || selectedPeriod !== 'ALL'
              ? 'Tidak ditemukan laporan yang sesuai dengan filter pencarian Anda.'
              : currentUser.role === 'ADMIN_PUSAT'
              ? 'Belum ada data laporan sambang yang dikirimkan oleh personel Bhabinkamtibmas. Laporan dari jajaran Polsek akan masuk secara real-time begitu dikirimkan oleh petugas di lapangan.'
              : 'Mulai dokumentasikan kegiatan sambang dan monitoring lahan petani binaan dengan menekan tombol di bawah.'}
          </p>
          {currentUser.role === 'BHABINKAMTIBMAS' && (
            <button
              onClick={() => {
                setEditingReport(null);
                setIsFormOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Laporan Kunjungan Pertama</span>
            </button>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE REKAPITULASI (KAPAN, SIAPA, APA) */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <List className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-white">
                {currentUser.role === 'BHABINKAMTIBMAS'
                  ? `Jurnal Kunjungan Sambang Saya (${filteredList.length} Laporan)`
                  : `Tabel Rekapitulasi Monitoring Jajaran Polsek (${filteredList.length} Laporan)`}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              {currentUser.role === 'BHABINKAMTIBMAS'
                ? 'Fokus pada catatan lapangan dan riwayat kunjungan Anda'
                : 'Menampilkan data waktu (Kapan), personel (Siapa), dan kegiatan (Apa)'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">📅 Tanggal & Waktu</th>
                  {currentUser.role === 'ADMIN_PUSAT' && (
                    <th className="py-3 px-4">👮 Siapa (Bhabinkamtibmas)</th>
                  )}
                  <th className="py-3 px-4">🌾 Petani & Lokasi Lahan</th>
                  <th className="py-3 px-4">🌱 Kondisi Tanaman & Kategori</th>
                  <th className="py-3 px-4">📋 Catatan & Arahan Sambang</th>
                  <th className="py-3 px-4 text-center">📷 Foto</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    {/* 1. KAPAN */}
                    <td className="py-3 px-4 whitespace-nowrap align-top">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(item.tanggalKunjungan).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {item.waktuKunjungan || '09:00'} WITA
                      </div>
                    </td>

                    {/* 2. SIAPA (Only for Admin) */}
                    {currentUser.role === 'ADMIN_PUSAT' && (
                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{item.userName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.userRank} • NRP: {item.userNrp}
                        </div>
                        <div className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {item.polsek}
                        </div>
                      </td>
                    )}

                    {/* 3. SASARAN PETANI & LOKASI */}
                    <td className="py-3 px-4 align-top max-w-[200px]">
                      <div className="font-bold text-white">{item.namaPetaniAtauKelompok}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{item.lokasiLahan}</span>
                      </div>
                      {item.latitude && item.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:underline mt-1"
                        >
                          <Navigation className="w-2.5 h-2.5" /> Titik GPS
                        </a>
                      )}
                    </td>

                    {/* 4. KONDISI & KATEGORI */}
                    <td className="py-3 px-4 align-top max-w-[160px]">
                      <div className="space-y-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                          {item.kategoriMonitoring}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-medium border border-emerald-800/40">
                          <Sprout className="w-2.5 h-2.5 text-emerald-400" />
                          {item.kondisiTanaman}
                        </span>
                      </div>
                    </td>

                    {/* 5. CATATAN & ARAHAN */}
                    <td className="py-3 px-4 align-top max-w-[260px]">
                      <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                        "{item.catatan}"
                      </p>
                      {item.tindakanBhabinkamtibmas && (
                        <div className="text-[10px] text-amber-300/90 mt-1 line-clamp-2">
                          👮 <span className="font-semibold">Arahan:</span> {item.tindakanBhabinkamtibmas}
                        </div>
                      )}
                    </td>

                    {/* 6. FOTO */}
                    <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                      {item.dokumentasiFoto && item.dokumentasiFoto.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          {item.dokumentasiFoto.slice(0, 2).map((f, fIdx) => (
                            <img
                              key={f.id || fIdx}
                              src={f.url}
                              alt="Dokumentasi"
                              onClick={() => setSelectedPhotoPreview(f.url)}
                              className="w-10 h-8 rounded object-cover border border-slate-700 hover:border-amber-400 cursor-pointer transition"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                          {item.dokumentasiFoto.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{item.dokumentasiFoto.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[10px]">-</span>
                      )}
                    </td>

                    {/* 7. AKSI */}
                    <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingDetailReport(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          title="Buka Format Laporan Dinas & Cetak"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        {currentUser.role === 'BHABINKAMTIBMAS' && (
                          <button
                            onClick={() => {
                              setEditingReport(item);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Laporan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(item.id, item.namaPetaniAtauKelompok)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW WITH WHO / WHEN / WHAT SECTIONS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-200 group"
            >
              <div className="space-y-3.5">
                {/* 1. KAPAN (Waktu Sambang) & POLSEK */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {new Date(item.tanggalKunjungan).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" /> {item.waktuKunjungan || '09:00'} WITA
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-400" /> {item.polsek}
                    </span>
                    {item.status === 'DRAFT_LOKAL' ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                        Draf
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Terkirim
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. SIAPA (Petugas Bhabinkamtibmas) */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {item.userRank} {item.userName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        NRP: {item.userNrp} • Binaan: <span className="text-slate-300">{item.wilayahBinaan}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                    Bhabinkamtibmas
                  </span>
                </div>

                {/* 3. KEGIATAN DI LOKASI (Sasaran, Temuan & Arahan) */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Petani: {item.namaPetaniAtauKelompok}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{item.lokasiLahan}</span>
                      </p>
                    </div>

                    {item.latitude && item.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-sky-400 rounded-lg flex items-center gap-1 transition shrink-0"
                        title="Buka Koordinat GPS di Google Maps"
                      >
                        <Navigation className="w-3 h-3" /> Maps
                      </a>
                    )}
                  </div>

                  {/* Badges for Category & Plant Condition */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                      {item.kategoriMonitoring}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 text-[10px] font-medium border border-emerald-800/40 flex items-center gap-1">
                      <Sprout className="w-3 h-3 text-emerald-400" />
                      {item.kondisiTanaman}
                    </span>
                  </div>

                  {/* Notes Snippet */}
                  <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 space-y-1.5">
                    <p className="text-[11px] text-slate-300 line-clamp-3 italic">
                      "{item.catatan}"
                    </p>
                    {item.tindakanBhabinkamtibmas && (
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-amber-300/90 flex items-start gap-1">
                        <span className="font-bold shrink-0">👮 Arahan Bhabin:</span>
                        <span className="line-clamp-2">{item.tindakanBhabinkamtibmas}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photos Thumbnail Preview */}
                {item.dokumentasiFoto && item.dokumentasiFoto.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dokumentasi Berstempel ({item.dokumentasiFoto.length} foto)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {item.dokumentasiFoto.map((p, pIdx) => (
                        <div
                          key={p.id || pIdx}
                          onClick={() => setSelectedPhotoPreview(p.url)}
                          className="w-16 h-12 rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 shrink-0 cursor-pointer transition relative group/img"
                        >
                          <img
                            src={p.url}
                            alt="Foto Bukti"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition duration-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3.5 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {item.id}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingDetailReport(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    title="Buka Format Laporan Dinas Resmi & Cetak PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Detail / Cetak</span>
                  </button>

                  {currentUser.role === 'BHABINKAMTIBMAS' && (
                    <button
                      onClick={() => {
                        setEditingReport(item);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Edit Laporan"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id, item.namaPetaniAtauKelompok)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Hapus Laporan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <DailyReportFormModal
        currentUser={currentUser}
        existingReports={existingReports}
        editReport={editingReport}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          refreshList();
        }}
      />

      {/* Modal Detail / Preview Laporan Dinas Resmi untuk Cetak PDF */}
      {viewingDetailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header Controls */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                  {viewingDetailReport.id}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  Format Laporan Kegiatan Sambang Petani
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOfficialDoc}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setViewingDetailReport(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Official Document Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 text-xs printable-content bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              {/* Kop Surat Dinas */}
              <div className="border-b-2 border-slate-900 dark:border-slate-300 pb-4 text-center space-y-1">
                <p className="text-[11px] font-bold tracking-wider uppercase">
                  KEPOLISIAN NEGARA REPUBLIK INDONESIA
                </p>
                <p className="text-[11px] font-bold tracking-wider uppercase">
                  DAERAH SULAWESI SELATAN - RESOR ENREKANG
                </p>
                <p className="text-[10px] font-medium tracking-wide uppercase text-slate-600 dark:text-slate-400">
                  SATUAN PEMBINAAN MASYARAKAT (SATBINMAS) / {viewingDetailReport.polsek.toUpperCase()}
                </p>
                <div className="pt-2">
                  <h3 className="text-sm font-extrabold underline uppercase tracking-wide">
                    LAPORAN HASIL SAMBANG & MONITORING KETAHANAN PANGAN
                  </h3>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    PENDAMPINGAN BUDIDAYA BAWANG PUTIH BHABINKAMTIBMAS
                  </p>
                </div>
              </div>

              {/* Data Tabel Laporan */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">I. IDENTITAS PETUGAS</p>
                    <p className="font-bold">{viewingDetailReport.userRank} {viewingDetailReport.userName}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">NRP: {viewingDetailReport.userNrp}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Kesatuan: {viewingDetailReport.polsek}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Wilayah Binaan: {viewingDetailReport.wilayahBinaan}</p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">II. WAKTU & SASARAN</p>
                    <p className="font-bold">
                      {new Date(viewingDetailReport.tanggalKunjungan).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Pukul: {viewingDetailReport.waktuKunjungan || '09:00'} WITA</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Petani / Kelompok: <span className="font-bold text-slate-900 dark:text-white">{viewingDetailReport.namaPetaniAtauKelompok}</span></p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Lokasi Lahan: {viewingDetailReport.lokasiLahan}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      GPS: Lat {viewingDetailReport.latitude.toFixed(6)}, Long {viewingDetailReport.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* III. Uraian Hasil Monitoring */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    III. URAIAN HASIL MONITORING & PEMANTAUAN LAHAN
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Kategori Kegiatan: </span>
                      <span className="font-bold">{viewingDetailReport.kategoriMonitoring}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Kondisi Tanaman di Lapangan: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{viewingDetailReport.kondisiTanaman}</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Catatan Temuan / Perkembangan Tanaman:</p>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        {viewingDetailReport.catatan}
                      </p>
                    </div>
                    {viewingDetailReport.tindakanBhabinkamtibmas && (
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">Himbauan Kamtibmas & Arahan Petugas:</p>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30">
                          {viewingDetailReport.tindakanBhabinkamtibmas}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* IV. Dokumentasi Kegiatan */}
                {viewingDetailReport.dokumentasiFoto && viewingDetailReport.dokumentasiFoto.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      IV. DOKUMENTASI KEGIATAN LAPANGAN (WATERMARK DINAS)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewingDetailReport.dokumentasiFoto.map((foto, idx) => (
                        <div
                          key={foto.id || idx}
                          className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm"
                        >
                          <img
                            src={foto.url}
                            alt={`Dokumentasi Lapangan ${idx + 1}`}
                            className="w-full h-48 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tanda Tangan */}
                <div className="pt-6 flex justify-between items-end border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <p>SIPERBAWA - POLRES ENREKANG</p>
                    <p>Sistem Informasi Ketahanan Pangan</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[11px]">Enrekang, {new Date(viewingDetailReport.tanggalKunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-[11px] font-semibold">Petugas Bhabinkamtibmas Pelaksana,</p>
                    <div className="h-16 flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-60" />
                    </div>
                    <p className="font-bold underline">{viewingDetailReport.userName}</p>
                    <p className="text-[10px]">{viewingDetailReport.userRank} NRP. {viewingDetailReport.userNrp}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Foto Zoom */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
            <img
              src={selectedPhotoPreview}
              alt="Preview Foto Watermark"
              className="w-full h-auto max-h-[85vh] object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
