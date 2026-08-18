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
import { LaporanBudidaya, UserAccount } from '../../types';
import { adminDeleteReport } from '../../services/appState';

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKab, setSelectedKab] = useState('SEMUA');
  const [selectedKecamatan, setSelectedKecamatan] = useState('SEMUA');
  const [selectedDesa, setSelectedDesa] = useState('SEMUA');
  const [deleteModalReport, setDeleteModalReport] = useState<LaporanBudidaya | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

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

          <button
            onClick={onOpenRevisions}
            className="relative px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
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
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
          >
            <Download className="w-4 h-4" /> Ekspor & PDF
          </button>
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

        {/* Volume Bibit Ditanam */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Jumlah Bibit Ditanam
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
    </div>
  );
};
