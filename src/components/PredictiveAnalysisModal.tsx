import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CloudRain,
  Mountain,
  Droplets,
  Layers,
  Award,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PredictiveAnalysisInput,
  PredictiveAnalysisResult,
  JenisTanah,
  JenisIrigasi,
  LaporanBudidaya,
} from '../types';
import { calculateGarlicYieldPrediction } from '../services/predictiveEngine';
import { WeatherBMKGCard } from './WeatherBMKGCard';

interface PredictiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReport?: LaporanBudidaya | null;
  reports?: LaporanBudidaya[];
}

export const PredictiveAnalysisModal: React.FC<PredictiveAnalysisModalProps> = ({
  isOpen,
  onClose,
  initialReport,
  reports = [],
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'KALKULATOR' | 'CUACA_BMKG'>('KALKULATOR');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [luasTanamM2, setLuasTanamM2] = useState<number>(10000);
  const [ketinggianMdpl, setKetinggianMdpl] = useState<number>(950);
  const [jenisTanah, setJenisTanah] = useState<JenisTanah>(
    'Andosol (Sangat Subur)'
  );
  const [jenisIrigasi, setJenisIrigasi] = useState<JenisIrigasi>(
    'Irigasi Teknis / Perpipaan'
  );
  const [curahHujanMmBulan, setCurahHujanMmBulan] = useState<number>(160);
  const [jumlahBibitKg, setJumlahBibitKg] = useState<number>(1200);
  const [varietasBawang, setVarietasBawang] = useState<string>('Lumbu Hijau');
  const [kabupaten, setKabupaten] = useState<string>('Enrekang');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictiveAnalysisResult | null>(null);

  // Populate from initialReport if supplied
  useEffect(() => {
    if (initialReport) {
      const d = initialReport.dataLahan;
      setSelectedReportId(initialReport.id);
      setLuasTanamM2(d.luasTanamM2 || 10000);
      setKetinggianMdpl(d.ketinggianMdpl || 950);
      setJenisTanah(d.jenisTanah || 'Andosol (Sangat Subur)');
      setJenisIrigasi(d.jenisIrigasi || 'Irigasi Teknis / Perpipaan');
      setCurahHujanMmBulan(d.curahHujanMmBulan || 160);
      setJumlahBibitKg(d.jumlahBibitKg || 1200);
      setVarietasBawang(d.varietasBawang || 'Lumbu Hijau');
      const locStr = d.kecamatan
        ? `Enrekang (Kec. ${d.kecamatan})`
        : d.kabupaten || 'Enrekang';
      setKabupaten(locStr);
    } else {
      setKabupaten('Enrekang');
    }
  }, [initialReport]);

  // Handler when selecting a report from dashboard list
  const handleSelectReportFromDashboard = (reportId: string) => {
    setSelectedReportId(reportId);
    if (!reportId) return;

    const selected = reports.find((r) => r.id === reportId);
    if (selected) {
      const d = selected.dataLahan;
      setLuasTanamM2(d.luasTanamM2 || 10000);
      setKetinggianMdpl(d.ketinggianMdpl || 950);
      setJenisTanah(d.jenisTanah || 'Andosol (Sangat Subur)');
      setJenisIrigasi(d.jenisIrigasi || 'Irigasi Teknis / Perpipaan');
      setCurahHujanMmBulan(d.curahHujanMmBulan || 160);
      setJumlahBibitKg(d.jumlahBibitKg || 1200);
      setVarietasBawang(d.varietasBawang || 'Lumbu Hijau');
      const locStr = d.kecamatan
        ? `Enrekang (Kec. ${d.kecamatan})`
        : d.kabupaten || 'Enrekang';
      setKabupaten(locStr);
    }
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    runAnalysis();
  }, [
    luasTanamM2,
    ketinggianMdpl,
    jenisTanah,
    jenisIrigasi,
    curahHujanMmBulan,
    jumlahBibitKg,
    varietasBawang,
    kabupaten,
  ]);

  const runAnalysis = async () => {
    setLoading(true);
    const payload: PredictiveAnalysisInput = {
      luasTanamM2,
      ketinggianMdpl,
      jenisTanah,
      jenisIrigasi,
      curahHujanMmBulan,
      jumlahBibitKg,
      varietasBawang,
      kabupaten,
    };

    try {
      // Call server backend route for AI-enhanced analytics or fallback to local calculation engine
      const res = await fetch('/api/predict-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setResult(json.data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API offline or error, falling back to local engine', e);
    }

    // Local engine fallback
    const localRes = calculateGarlicYieldPrediction(payload);
    setResult(localRes);
    setLoading(false);
  };

  // Derive list of unique locations from reports + default Enrekang Kecamatan
  const defaultEnrekangLocations = [
    'Enrekang',
    'Enrekang (Kec. Alla)',
    'Enrekang (Kec. Anggeraja)',
    'Enrekang (Kec. Baraka)',
    'Enrekang (Kec. Bungin)',
    'Enrekang (Kec. Cendana)',
    'Enrekang (Kec. Curio)',
    'Enrekang (Kec. Enrekang)',
    'Enrekang (Kec. Maiwa)',
    'Enrekang (Kec. Malua)',
    'Enrekang (Kec. Masalle)',
    'Enrekang (Kec. Buntu Batu)',
  ];

  const reportLocations = reports.map((r) =>
    r.dataLahan.kecamatan
      ? `Enrekang (Kec. ${r.dataLahan.kecamatan})`
      : r.dataLahan.kabupaten || 'Enrekang'
  );

  const availableLocations = Array.from(
    new Set([...defaultEnrekangLocations, ...reportLocations])
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl text-slate-900 dark:text-white shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 rounded-xl">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Modul Analisis Prediktif & Agrometeorologi BMKG
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estimasi hasil panen presisi berbasis AI, telemetri real-time cuaca, dan prediksi iklim BMKG Enrekang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 px-4 sm:px-6 pt-3 pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveModalTab('KALKULATOR')}
            className={`py-2 px-4 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'KALKULATOR'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Kalkulator Prediksi Panen AI
          </button>

          <button
            onClick={() => setActiveModalTab('CUACA_BMKG')}
            className={`py-2 px-4 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeModalTab === 'CUACA_BMKG'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <CloudRain className="w-4 h-4" /> Telemetri Cuaca & Prediksi Musim BMKG
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeModalTab === 'CUACA_BMKG' ? (
            <WeatherBMKGCard
              initialKecamatan={
                kabupaten.includes('Kec.')
                  ? kabupaten.split('Kec.')[1].replace(')', '').trim()
                  : 'Anggeraja'
              }
            />
          ) : (
            <>
              {/* Quick Dashboard Report Selector */}
          {reports.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-slate-950/80 border border-amber-300 dark:border-amber-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg">
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Pilih Laporan Binaan dari Dashboard</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Gunakan data lokasi & lahan Bhabinkamtibmas untuk estimasi otomatis</span>
                </div>
              </div>
              <select
                value={selectedReportId}
                onChange={(e) => handleSelectReportFromDashboard(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-800 dark:text-amber-300 text-xs rounded-xl px-3 py-2 font-semibold focus:border-amber-500 focus:outline-none max-w-md shadow-sm"
              >
                <option value="">-- Parameter Custom / Pilih Laporan --</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.kelompokTani.namaKelompok} - Desa {r.dataLahan.desaKelurahan} (Kec. {r.dataLahan.kecamatan}, Kab. {r.dataLahan.kabupaten})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Top Inputs Grid */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Parameter Lahan & Agrikultur
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium">
                  Luas Tanam Aktif (m²)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={luasTanamM2}
                  onChange={(e) => setLuasTanamM2(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  = {(luasTanamM2 / 10000).toFixed(2)} Hektar (Ha)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Ketinggian Tempat (mdpl)
                </label>
                <input
                  type="number"
                  min="100"
                  max="2500"
                  value={ketinggianMdpl}
                  onChange={(e) => setKetinggianMdpl(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Optimal garlic: 800-1,200 mdpl
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Curah Hujan (mm/bulan)
                </label>
                <input
                  type="number"
                  min="10"
                  max="600"
                  value={curahHujanMmBulan}
                  onChange={(e) => setCurahHujanMmBulan(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Ideal: 100 - 220 mm/bln
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium">
                  Kebutuhan Bibit (Kg)
                </label>
                <input
                  type="number"
                  min="10"
                  value={jumlahBibitKg}
                  onChange={(e) => setJumlahBibitKg(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Standar: ~1.2 Ton/Ha
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium">Jenis Tanah</label>
                <select
                  value={jenisTanah}
                  onChange={(e) => setJenisTanah(e.target.value as JenisTanah)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Andosol (Sangat Subur)">Andosol (Vulkanik Subur)</option>
                  <option value="Latosol (Cokelat/Merah)">Latosol (Cokelat/Merah)</option>
                  <option value="Regosol (Vulkanik Pasir)">Regosol (Pasir Vulkanik)</option>
                  <option value="Aluvial (Endapan)">Aluvial (Endapan Sungai)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Pengelolaan Irigasi
                </label>
                <select
                  value={jenisIrigasi}
                  onChange={(e) => setJenisIrigasi(e.target.value as JenisIrigasi)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Irigasi Teknis / Perpipaan">Irigasi Teknis / Perpipaan</option>
                  <option value="Mata Air Pegunungan">Mata Air Pegunungan</option>
                  <option value="Pompa Air / Sumur Dalam">Pompa Air / Sumur Dalam</option>
                  <option value="Tadah Hujan">Tadah Hujan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium">Varietas Bawang</label>
                <input
                  type="text"
                  value={varietasBawang}
                  onChange={(e) => setVarietasBawang(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Lokasi / Kabupaten (Polres Enrekang)
                </label>
                <select
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-amber-800 dark:text-amber-300 font-bold rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
                >
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Visual Output */}
          {result && (
            <div className="space-y-4">
              {/* Main Numbers Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Expected Tonnage */}
                <div className="bg-gradient-to-br from-emerald-100 to-white dark:from-emerald-950 dark:to-slate-900 border border-emerald-300 dark:border-emerald-500/40 rounded-xl p-4 text-center shadow-sm">
                  <span className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-bold block mb-1">
                    Estimasi Hasil Panen (Rata-Rata)
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1">
                    {(result.estimasiPanenExpectedKg / 1000).toFixed(2)}{' '}
                    <span className="text-lg text-emerald-700 dark:text-emerald-300">Ton</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Rentang: {(result.estimasiPanenMinKg / 1000).toFixed(2)} Ton -{' '}
                    {(result.estimasiPanenMaxKg / 1000).toFixed(2)} Ton ({result.estimasiPanenExpectedKg.toLocaleString('id-ID')} Kg)
                  </div>
                </div>

                {/* Productivity Rating */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center flex flex-col justify-center shadow-sm">
                  <span className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block mb-1">
                    Tingkat Produktivitas Lahan
                  </span>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 my-1">
                    {result.produktivitasTonPerHa} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">Ton/Hektar</span>
                  </div>
                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 w-fit mx-auto">
                    <Award className="w-3.5 h-3.5" /> {result.kategoriPerforma}
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center flex flex-col justify-center shadow-sm">
                  <span className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400 font-bold block mb-1">
                    Skor Keyakinan Model
                  </span>
                  <div className="text-3xl font-extrabold text-sky-700 dark:text-sky-300 my-1">
                    {result.confidenceScorePercent}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-1">
                    <div
                      className="bg-sky-500 dark:bg-sky-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.confidenceScorePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Factors Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <h5 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-300 mb-3">
                  Faktor Koreksi Mikroklimat & Agroklimat
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Faktor Ketinggian:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {result.faktorFaktor.faktorKetinggian.label}
                      </span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded">
                      x{result.faktorFaktor.faktorKetinggian.score}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Faktor Jenis Tanah:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {result.faktorFaktor.faktorTanah.label}
                      </span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded">
                      x{result.faktorFaktor.faktorTanah.score}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Faktor Irigasi:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {result.faktorFaktor.faktorIrigasi.label}
                      </span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded">
                      x{result.faktorFaktor.faktorIrigasi.score}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Faktor Iklim / Curah Hujan:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {result.faktorFaktor.faktorIklim.label}
                      </span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded">
                      x{result.faktorFaktor.faktorIklim.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agronomical Recommendations */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 shadow-sm">
                <h5 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Rekomendasi Agronomis Presisi (Pakar AI & Dinas Pertanian)
                </h5>

                <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                  {result.rekomendasiAgronomis.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                        Poin {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Peta Mikroklimat Bawang Putih POLRI Presisi • Update Agustus 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-semibold transition cursor-pointer"
          >
            Tutup Analisis
          </button>
        </div>
      </div>
    </div>
  );
};
