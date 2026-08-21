import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Trash2,
  Sprout,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import {
  UserAccount,
  LaporanBudidaya,
  LaporanHarian,
  KategoriMonitoring,
  PhotoBukti,
} from '../../types';
import { WatermarkCanvas } from '../WatermarkCanvas';
import { submitOrUpdateDailyReport } from '../../services/appState';

interface DailyReportFormModalProps {
  currentUser: UserAccount;
  existingReports: LaporanBudidaya[];
  editReport?: LaporanHarian | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const KATEGORI_OPTIONS: KategoriMonitoring[] = [
  'Rutin / Pemantauan Vegetatif',
  'Pengecekan Hama & Penyakit',
  'Pendampingan Pemupukan & Pengairan',
  'Kesiapan & Estimasi Panen',
  'Edukasi & Sambang Kamtibmas Petani',
  'Koordinasi PPL & Kelompok Tani',
];

const KONDISI_OPTIONS = [
  'Subur & Pertumbuhan Sangat Baik',
  'Normal / Vegetatif Stabil',
  'Perlu Tambahan Air / Irigasi',
  'Perlu Pemupukan Susulan',
  'Terindikasi Hama Ulat / Jamur Daun',
  'Siap Masuk Masa Panen',
];

export const DailyReportFormModal: React.FC<DailyReportFormModalProps> = ({
  currentUser,
  existingReports,
  editReport,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedLaporanId, setSelectedLaporanId] = useState<string>('');
  const [namaPetani, setNamaPetani] = useState<string>('');
  const [lokasiLahan, setLokasiLahan] = useState<string>('');
  const [tanggalKunjungan, setTanggalKunjungan] = useState<string>('');
  const [waktuKunjungan, setWaktuKunjungan] = useState<string>('');
  const [kategoriMonitoring, setKategoriMonitoring] = useState<KategoriMonitoring>(
    'Rutin / Pemantauan Vegetatif'
  );
  const [kondisiTanaman, setKondisiTanaman] = useState<string>(
    'Subur & Pertumbuhan Sangat Baik'
  );
  const [catatan, setCatatan] = useState<string>('');
  const [tindakanBhabin, setTindakanBhabin] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(-3.5642);
  const [longitude, setLongitude] = useState<number>(119.7731);
  const [photos, setPhotos] = useState<PhotoBukti[]>([]);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      if (editReport) {
        setSelectedLaporanId(editReport.laporanLahanId || '');
        setNamaPetani(editReport.namaPetaniAtauKelompok || '');
        setLokasiLahan(editReport.lokasiLahan || '');
        setTanggalKunjungan(editReport.tanggalKunjungan);
        setWaktuKunjungan(editReport.waktuKunjungan);
        setKategoriMonitoring(editReport.kategoriMonitoring);
        setKondisiTanaman(editReport.kondisiTanaman || 'Subur & Pertumbuhan Sangat Baik');
        setCatatan(editReport.catatan || '');
        setTindakanBhabin(editReport.tindakanBhabinkamtibmas || '');
        setLatitude(editReport.latitude || -3.5642);
        setLongitude(editReport.longitude || 119.7731);
        setPhotos(editReport.dokumentasiFoto || []);
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const hh = String(today.getHours()).padStart(2, '0');
        const min = String(today.getMinutes()).padStart(2, '0');

        setTanggalKunjungan(`${yyyy}-${mm}-${dd}`);
        setWaktuKunjungan(`${hh}:${min}`);
        setSelectedLaporanId('');
        setNamaPetani('');
        setLokasiLahan(currentUser.wilayahBinaan || 'Kabupaten Enrekang');
        setKategoriMonitoring('Rutin / Pemantauan Vegetatif');
        setKondisiTanaman('Subur & Pertumbuhan Sangat Baik');
        setCatatan('');
        setTindakanBhabin('');
        setPhotos([]);

        // Try getting current GPS automatically
        detectCurrentGps();
      }
      setErrorMsg(null);
      setShowCamera(false);
    }
  }, [isOpen, editReport]);

  const detectCurrentGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage('GPS tidak didukung oleh browser Anda.');
      return;
    }
    setIsDetectingGps(true);
    setGpsMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsDetectingGps(false);
        setGpsMessage('Koordinat GPS berhasil dideteksi akurat!');
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsMessage('Tidak dapat mengambil GPS otomatis, menggunakan koordinat wilayah.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectExistingLaporan = (lapId: string) => {
    setSelectedLaporanId(lapId);
    if (lapId) {
      const found = existingReports.find((r) => r.id === lapId);
      if (found) {
        const pName = found.kelompokTani.ketuaKelompok
          ? `${found.kelompokTani.namaKelompok} (Bpk. ${found.kelompokTani.ketuaKelompok})`
          : found.kelompokTani.namaKelompok;
        setNamaPetani(pName);
        setLokasiLahan(
          `${found.dataLahan.desaKelurahan}, Kec. ${found.dataLahan.kecamatan}, Kab. ${found.dataLahan.kabupaten}`
        );
        if (found.dataLahan.latitude && found.dataLahan.longitude) {
          setLatitude(found.dataLahan.latitude);
          setLongitude(found.dataLahan.longitude);
        }
      }
    }
  };

  const handleAddPhoto = (newPhoto: PhotoBukti) => {
    setPhotos((prev) => [...prev, newPhoto]);
    setShowCamera(false);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (isDraft: boolean = false) => {
    if (!tanggalKunjungan) {
      setErrorMsg('Tanggal kunjungan wajib diisi.');
      return;
    }
    if (!namaPetani.trim()) {
      setErrorMsg('Nama Petani atau Kelompok Tani binaan wajib diisi.');
      return;
    }
    if (!catatan.trim() && !isDraft) {
      setErrorMsg('Catatan hasil kunjungan/monitoring wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      submitOrUpdateDailyReport(
        {
          id: editReport?.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userNrp: currentUser.username,
          userRank: currentUser.rank,
          polsek: currentUser.polsek,
          wilayahBinaan: currentUser.wilayahBinaan,
          tanggalKunjungan,
          waktuKunjungan: waktuKunjungan || '09:00',
          namaPetaniAtauKelompok: namaPetani.trim(),
          lokasiLahan: lokasiLahan.trim() || currentUser.wilayahBinaan,
          kategoriMonitoring,
          kondisiTanaman,
          catatan: catatan.trim(),
          tindakanBhabinkamtibmas: tindakanBhabin.trim(),
          dokumentasiFoto: photos,
          latitude,
          longitude,
          laporanLahanId: selectedLaporanId || undefined,
        },
        isDraft
      );

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal menyimpan laporan harian.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {editReport ? 'Edit Laporan Harian Kunjungan' : 'Form Laporan Harian Sambang / Monitoring'}
              </h3>
              <p className="text-xs text-slate-400">
                Personel Pelaksana: <span className="text-amber-300 font-semibold">{currentUser.rank} {currentUser.name}</span> ({currentUser.polsek})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Waktu & Target Kunjungan */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <Clock className="w-4 h-4" />
              <span>1. Waktu & Sasaran Kunjungan Petani</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tanggal Kunjungan / Sambang <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggalKunjungan}
                    onChange={(e) => setTanggalKunjungan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Waktu / Jam Pelaksanaan
                </label>
                <input
                  type="time"
                  value={waktuKunjungan}
                  onChange={(e) => setWaktuKunjungan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hubungkan ke Laporan Lahan Terdaftar */}
            {existingReports.length > 0 && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Hubungkan dengan Data Lahan Terdaftar (Opsional)
                </label>
                <select
                  value={selectedLaporanId}
                  onChange={(e) => handleSelectExistingLaporan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Input Manual / Petani Binaan Baru --</option>
                  {existingReports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.kelompokTani.namaKelompok} (Ketua: {r.kelompokTani.ketuaKelompok || '-'}) - {r.dataLahan.desaKelurahan}, Kec. {r.dataLahan.kecamatan}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Petani / Kelompok Tani Binaan <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={namaPetani}
                  onChange={(e) => setNamaPetani(e.target.value)}
                  placeholder="Contoh: Kelompok Tani Sipatuo / Bpk. Mustofa"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Lokasi Lahan / Dusun / Desa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={lokasiLahan}
                  onChange={(e) => setLokasiLahan(e.target.value)}
                  placeholder="Contoh: Dusun Buntukasisi, Desa Mendatte, Kec. Anggeraja"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kategori & Hasil Monitoring */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <Sprout className="w-4 h-4" />
              <span>2. Kategori Kegiatan & Hasil Monitoring Tanaman</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kategori Monitoring
                </label>
                <select
                  value={kategoriMonitoring}
                  onChange={(e) => setKategoriMonitoring(e.target.value as KategoriMonitoring)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  {KATEGORI_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kondisi Tanaman Bawang Putih
                </label>
                <select
                  value={kondisiTanaman}
                  onChange={(e) => setKondisiTanaman(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  {KONDISI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Catatan Hasil Monitoring / Temuan Lapangan <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Deskripsikan kondisi lahan, tinggi tanaman, daun, ketersediaan air, kendala hama, atau diskusi dengan petani..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Arahan Bhabinkamtibmas / Himbauan Kamtibmas & Pendampingan
              </label>
              <textarea
                rows={2}
                value={tindakanBhabin}
                onChange={(e) => setTindakanBhabin(e.target.value)}
                placeholder="Himbauan keamanan lingkungan lahan, koordinasi jadwal pengairan dengan PPL, anjuran penanganan hama..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 3: Koordinat GPS */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <MapPin className="w-4 h-4" />
                <span>3. Titik Koordinat GPS Lahan</span>
              </div>
              <button
                type="button"
                onClick={detectCurrentGps}
                disabled={isDetectingGps}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Mengambil GPS...
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3 h-3" /> Ambil Posisi Saat Ini
                  </>
                )}
              </button>
            </div>

            {gpsMessage && (
              <p className="text-[11px] text-amber-400 italic">{gpsMessage}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dokumentasi Kegiatan & Watermark */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Camera className="w-4 h-4" />
                <span>4. Dokumentasi Foto Kegiatan (Stempel Resmi POLRI)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCamera(!showCamera)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow transition"
              >
                <Camera className="w-3.5 h-3.5" />
                {showCamera ? 'Tutup Pengambilan Foto' : '+ Tambah Foto Berstempel'}
              </button>
            </div>

            {showCamera && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-amber-500/30 space-y-3">
                <p className="text-slate-300 text-[11px]">
                  Ambil foto langsung atau unggah foto dokumentasi sambang/monitoring. Sistem otomatis menambahkan watermark stempel dinas POLRI, nama personel, koordinat GPS, dan waktu kegiatan.
                </p>
                <WatermarkCanvas
                  officerName={currentUser.name}
                  officerNrp={currentUser.username}
                  locationName={lokasiLahan || currentUser.wilayahBinaan}
                  latitude={latitude}
                  longitude={longitude}
                  onPhotoCaptured={handleAddPhoto}
                />
              </div>
            )}

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-center">
                <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                <p className="font-semibold text-slate-400">Belum ada dokumentasi foto kegiatan</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Klik tombol "+ Tambah Foto Berstempel" di atas untuk melampirkan bukti sambang lapangan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md aspect-video"
                  >
                    <img
                      src={p.url}
                      alt={`Dokumentasi ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-2">
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        Foto #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.id)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Laporan tersimpan langsung ke arsip Satbinmas Polres Enrekang</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition text-xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold transition text-xs"
            >
              Simpan Draf
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Kirim Laporan Harian
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
