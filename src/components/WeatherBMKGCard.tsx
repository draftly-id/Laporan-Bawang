import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  Compass,
  AlertTriangle,
  Calendar,
  Sparkles,
  RefreshCw,
  Sun,
  ShieldCheck,
  MapPin,
  TrendingDown,
  TrendingUp,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { LiveWeatherData, BMKGPrediksiMusim } from '../types';
import {
  fetchLiveWeatherData,
  BMKG_PREDIKSI_MUSIM_ENREKANG,
  ENREKANG_KECAMATAN_COORDS,
} from '../services/weatherService';

interface WeatherBMKGCardProps {
  initialKecamatan?: string;
  onSelectKecamatan?: (kec: string) => void;
  compact?: boolean;
}

export const WeatherBMKGCard: React.FC<WeatherBMKGCardProps> = ({
  initialKecamatan = 'Anggeraja',
  onSelectKecamatan,
  compact = false,
}) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>(initialKecamatan);
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'TELEMETRI' | 'PREDIKSI_MUSIM' | 'REKOMENDASI'>('TELEMETRI');

  const bmkgData: BMKGPrediksiMusim = BMKG_PREDIKSI_MUSIM_ENREKANG;

  const loadWeather = async (kec: string) => {
    setLoading(true);
    try {
      const data = await fetchLiveWeatherData(kec);
      setWeatherData(data);
    } catch (err) {
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedKecamatan);
  }, [selectedKecamatan]);

  const handleKecamatanChange = (kec: string) => {
    setSelectedKecamatan(kec);
    if (onSelectKecamatan) onSelectKecamatan(kec);
  };

  const currentMonthIdx = new Date().getMonth();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-900 dark:text-white shadow-md dark:shadow-2xl space-y-5 transition-colors">
      {/* Header with Title and Kecamatan Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 rounded-2xl shrink-0">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Monitoring Cuaca Real-Time & Klimatologi BMKG
              </h2>
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stasiun Klimatologi BMKG Sulsel & Sensor Telemetri Agrometeorologi Kab. Enrekang
            </p>
          </div>
        </div>

        {/* Location selector & refresh button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedKecamatan}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-8 pr-3 py-2 text-xs font-semibold focus:border-cyan-500 focus:outline-none shadow-sm"
            >
              {Object.keys(ENREKANG_KECAMATAN_COORDS).map((kec) => (
                <option key={kec} value={kec}>
                  {ENREKANG_KECAMATAN_COORDS[kec].name} ({ENREKANG_KECAMATAN_COORDS[kec].altMdpl} mdpl)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadWeather(selectedKecamatan)}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl transition cursor-pointer"
            title="Perbarui Data Cuaca"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('TELEMETRI')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'TELEMETRI'
              ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" /> Kelembaban & Curah Hujan Real-Time
        </button>

        <button
          onClick={() => setActiveTab('PREDIKSI_MUSIM')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'PREDIKSI_MUSIM'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Prediksi Puncak Hujan & Kemarau BMKG
        </button>

        <button
          onClick={() => setActiveTab('REKOMENDASI')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'REKOMENDASI'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Mitigasi Agronomis
        </button>
      </div>

      {/* TAB 1: REAL-TIME TELEMETRY */}
      {activeTab === 'TELEMETRI' && weatherData && (
        <div className="space-y-4">
          {/* Key Metric 4-Box Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Box 1: Kelembaban Udara (RH) */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-500" /> Kelembaban Udara
                </span>
                <span className="text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-300 dark:border-cyan-800">
                  RH %
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {weatherData.kelembabanPercent}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {weatherData.kelembabanPercent > 80
                    ? 'Sangat Lembab'
                    : weatherData.kelembabanPercent >= 65
                    ? 'Optimal Bawang'
                    : 'Cenderung Kering'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    weatherData.kelembabanPercent > 85
                      ? 'bg-rose-500'
                      : weatherData.kelembabanPercent >= 65
                      ? 'bg-cyan-500'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${weatherData.kelembabanPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>Ideal Bawang: 65-80%</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-mono">Real-time</span>
              </div>
            </div>

            {/* Box 2: Curah Hujan Real-Time */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-blue-500" /> Curah Hujan
                </span>
                <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                  mm / Jam & Hari
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {weatherData.curahHujanMmJam}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">mm/jam</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({weatherData.curahHujanMmHari} mm/hari)</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <span>Kondisi:</span>
                <strong className="text-blue-600 dark:text-blue-300">
                  {weatherData.curahHujanMmJam > 10
                    ? 'Hujan Lebat'
                    : weatherData.curahHujanMmJam > 2.5
                    ? 'Hujan Sedang'
                    : weatherData.curahHujanMmJam > 0
                    ? 'Gerimis / Ringan'
                    : 'Tidak Ada Hujan'}
                </strong>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 flex justify-between">
                <span>Akumulasi Bulanan:</span>
                <span className="text-blue-600 dark:text-blue-300 font-bold font-mono">~{weatherData.curahHujanMmBulanEst} mm</span>
              </div>
            </div>

            {/* Box 3: Suhu & Ketinggian */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-500" /> Suhu Pegunungan
                </span>
                <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                  °C
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {weatherData.suhuC}°C
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Min {weatherData.suhuMinC}° / Max {weatherData.suhuMaxC}°
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Elevasi Wilayah:</span>
                <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                  {ENREKANG_KECAMATAN_COORDS[weatherData.kecamatan]?.altMdpl || 950} mdpl
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 flex justify-between">
                <span>Cuaca:</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{weatherData.kondisiCuaca} {weatherData.kodeIkon}</span>
              </div>
            </div>

            {/* Box 4: Angin & Tekanan */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-500" /> Angin & Tekanan
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  Km/Jam
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {weatherData.kecepatanAnginKmh}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">km/jam</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({weatherData.arahAngin})</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Tekanan Udara:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-300">{weatherData.tekananUdaraHpa} hPa</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 flex justify-between">
                <span>Awan:</span>
                <span className="text-slate-700 dark:text-slate-200">{weatherData.tutupanAwanPercent}% Tutupan</span>
              </div>
            </div>
          </div>

          {/* Status Kesesuaian Bawang & Evaluasi Agronomis */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              weatherData.statusKesesuaianBawang === 'SANGAT_BAIK'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : weatherData.statusKesesuaianBawang === 'WASPADA_JAMUR'
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
                : weatherData.statusKesesuaianBawang === 'WASPADA_KEKERINGAN'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                : 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/40 text-cyan-900 dark:text-cyan-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/10 shrink-0 mt-0.5 shadow-sm">
                {weatherData.statusKesesuaianBawang === 'WASPADA_JAMUR' ||
                weatherData.statusKesesuaianBawang === 'WASPADA_KEKERINGAN' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Evaluasi Kesesuaian Tanam Real-Time ({weatherData.lokasi})
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {weatherData.keteranganAgronomis}
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 self-end sm:self-center">
              Waktu Sinkronisasi: <strong className="text-slate-800 dark:text-white">{weatherData.waktuUpdate}</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BMKG PEAK SEASON PREDICTION (PUNCAK HUJAN & KEMARAU) */}
      {activeTab === 'PREDIKSI_MUSIM' && (
        <div className="space-y-5">
          {/* Dual Season Highlight Cards: Puncak Hujan vs Puncak Kemarau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Puncak Hujan */}
            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/80 dark:to-slate-950 border border-blue-200 dark:border-blue-500/40 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-500/30">
                  <CloudRain className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md border border-blue-300 dark:border-blue-700 font-bold">
                  Analisis BMKG ZOM 319
                </span>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Prakiraan Resmi BMKG
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  🌧️ Puncak Musim Hujan: <span className="text-blue-600 dark:text-blue-300">{bmkgData.puncakMusimHujan}</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Awal Musim Hujan:</span>
                  <strong className="text-slate-900 dark:text-white">{bmkgData.awalMusimHujan}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sifat Hujan Puncak:</span>
                  <strong className="text-blue-600 dark:text-blue-300">{bmkgData.sifatHujanPuncak}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Puncak Curah Hujan:</span>
                  <strong className="text-blue-600 dark:text-blue-300 font-mono">310 - 340 mm/bulan</strong>
                </div>
              </div>

              <div className="p-2.5 bg-blue-100 dark:bg-blue-950/90 rounded-lg text-[11px] text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mitigasi Bhabinkamtibmas:</strong> Hindari tanam terbuka tanpa bedengan tinggi. Pastikan saluran drainase di lereng pegunungan Enrekang lancar untuk mencegah erosi dan busuk akar.
                </span>
              </div>
            </div>

            {/* Card Puncak Kemarau */}
            <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/80 dark:to-slate-950 border border-amber-200 dark:border-amber-500/40 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-500/30">
                  <Sun className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-md border border-amber-300 dark:border-amber-700 font-bold">
                  Analisis BMKG ZOM 319
                </span>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Prakiraan Resmi BMKG
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  ☀️ Puncak Musim Kemarau: <span className="text-amber-600 dark:text-amber-300">{bmkgData.puncakMusimKemarau}</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Awal Musim Kemarau:</span>
                  <strong className="text-slate-900 dark:text-white">{bmkgData.awalMusimKemarau}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sifat Kemarau:</span>
                  <strong className="text-amber-600 dark:text-amber-300">{bmkgData.sifatKemarau}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Curah Hujan Terendah:</span>
                  <strong className="text-amber-600 dark:text-amber-300 font-mono">45 - 65 mm/bulan</strong>
                </div>
              </div>

              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/90 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Peluang Panen Emas:</strong> Periode terbaik penjemuran dan pasca panen bawang putih lokal agar kadar air umbi optimal (&lt;80%) dan daya simpan lebih dari 6 bulan.
                </span>
              </div>
            </div>
          </div>

          {/* Indikator Global Iklim (ENSO & IOD) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Indeks ENSO (El Niño / La Niña):</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                {bmkgData.indeksElNinoLaNina}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Indeks IOD (Indian Ocean Dipole):</span>
              <span className="font-bold text-cyan-800 dark:text-cyan-400 font-mono bg-cyan-100 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-800">
                {bmkgData.indeksDipoleMode}
              </span>
            </div>
          </div>

          {/* 12-Month Rainfall Trend Chart BMKG */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Profil Curah Hujan Bulanan (mm) BMKG Kabupaten Enrekang
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data Normal Klimatologis 30 Tahun Stasiun Klimatologi Maros / BMKG Sulsel
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Musim Hujan
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> Kemarau
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bmkgData.prakiraanBulanan}
                  margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis
                    dataKey="bulan"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} mm`, 'Curah Hujan']}
                  />
                  <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Batas Kering (100mm)', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={300} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Batas Basah (300mm)', fill: '#38bdf8', fontSize: 10 }} />
                  <Bar dataKey="curahHujanMm" radius={[6, 6, 0, 0]}>
                    {bmkgData.prakiraanBulanan.map((entry, index) => {
                      const isCurrent = index === currentMonthIdx;
                      let color = '#3b82f6';
                      if (entry.statusMusim === 'Kemarau') color = '#f59e0b';
                      if (entry.statusMusim === 'Peralihan (Pancaroba)') color = '#06b6d4';
                      if (isCurrent) color = '#10b981'; // Green for active month
                      return <Cell key={`cell-${index}`} fill={color} stroke={isCurrent ? '#ffffff' : undefined} strokeWidth={isCurrent ? 2 : 0} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              * Kolom hijau menandakan bulan berjalan ({bmkgData.prakiraanBulanan[currentMonthIdx]?.bulan}).
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BMKG & AGRONOMIST MITIGATION RECOMMENDATIONS */}
      {activeTab === 'REKOMENDASI' && (
        <div className="space-y-4 text-xs">
          {/* Optimal planting window */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Rekomendasi Kalender Tanam Bawang Putih BMKG - Kementan
            </h4>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
              {bmkgData.rekomendasiTanam.waktuTanamOptimal}
            </p>
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300">
              <strong className="text-emerald-700 dark:text-emerald-400">Fase Kritis Pasokan Air:</strong> {bmkgData.rekomendasiTanam.faseKritisAir}
            </div>
          </div>

          {/* Early Warning List */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/40 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Peringatan Dini Cuaca & Iklim BMKG untuk Wilayah Binaan
            </h4>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              {bmkgData.rekomendasiTanam.peringatanDini.map((warn, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pest & Disease Mitigation Protocol */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-cyan-300 dark:border-cyan-500/40 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" /> Protokol Mitigasi Hama & Penyakit Akibat Variabilitas Iklim
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {bmkgData.rekomendasiTanam.mitigasiHamaPenyakit.map((mit, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400 font-bold">Langkah {idx + 1}</div>
                  <div className="text-slate-700 dark:text-slate-200">{mit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
