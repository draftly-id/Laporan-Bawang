import React, { useState } from 'react';
import {
  X,
  Sprout,
  Calendar,
  Ruler,
  Scale,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { LaporanBudidaya, DataPanen, BuktiFoto } from '../../types';
import { savePanenData, getCurrentUser } from '../../services/appState';

interface PanenInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  laporan: LaporanBudidaya;
  onSuccess: () => void;
}

export const PanenInputModal: React.FC<PanenInputModalProps> = ({
  isOpen,
  onClose,
  laporan,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const currentUser = getCurrentUser();
  const existingPanen = laporan.dataPanen;

  const [tanggalPanen, setTanggalPanen] = useState<string>(
    existingPanen?.tanggalPanen || new Date().toISOString().split('T')[0]
  );
  const [luasPanenM2, setLuasPanenM2] = useState<number>(
    existingPanen?.luasPanenM2 || laporan.dataLahan.luasTanamM2 || 10000
  );
  const [hasilPanenKg, setHasilPanenKg] = useState<number>(
    existingPanen?.hasilPanenKg || laporan.dataLahan.produksiPanenKg || 7500
  );
  const [catatanPanen, setCatatanPanen] = useState<string>(
    existingPanen?.catatanPanen || ''
  );
  const [fotoPanen, setFotoPanen] = useState<BuktiFoto[]>(
    existingPanen?.fotoPanen || []
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFotoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const maxWidth = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw original photo
          ctx.drawImage(img, 0, 0, width, height);

          // Watermark Banner at bottom
          const bannerHeight = Math.max(130, Math.round(height * 0.22));
          const bannerY = height - bannerHeight;

          // Dark gradient overlay
          const gradient = ctx.createLinearGradient(0, bannerY - 20, 0, height);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(0.25, 'rgba(15, 23, 42, 0.88)');
          gradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)');

          ctx.fillStyle = gradient;
          ctx.fillRect(0, bannerY - 20, width, bannerHeight + 20);

          // Gold/Amber accent line
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(0, bannerY - 20, width, 4);

          // Text details
          const officerName = currentUser?.name || laporan.userName || 'BHABINKAMTIBMAS';
          const officerNrp = currentUser?.username || laporan.userNrp || '88040123';
          const lat = laporan.dataLahan.latitude;
          const lng = laporan.dataLahan.longitude;
          const nowStr = new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' WIB';

          const fontSizeMain = Math.max(14, Math.round(width * 0.024));
          const fontSizeSub = Math.max(12, Math.round(width * 0.02));

          const paddingX = Math.round(width * 0.03);
          let currentY = bannerY + Math.round(fontSizeMain * 0.9);

          // Header Title
          ctx.fillStyle = '#38bdf8'; // Sky blue
          ctx.font = `bold ${fontSizeSub}px sans-serif`;
          ctx.fillText(`🌾 DOKUMENTASI REALISASI PANEN - POLRES ENREKANG`, paddingX, currentY);

          // Row 1: Officer Name & NRP
          currentY += Math.round(fontSizeSub * 1.5);
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSizeMain}px sans-serif`;
          ctx.fillText(`👮 PETUGAS: ${officerName} (NRP: ${officerNrp})`, paddingX, currentY);

          // Row 2: GPS Coordinates
          currentY += Math.round(fontSizeSub * 1.5);
          ctx.fillStyle = '#fbbf24'; // Yellow-400
          ctx.font = `bold ${fontSizeSub}px sans-serif`;
          ctx.fillText(`📍 GPS KOORDINAT: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)} (${laporan.dataLahan.desaKelurahan})`, paddingX, currentY);

          // Row 3: Timestamp
          currentY += Math.round(fontSizeSub * 1.4);
          ctx.fillStyle = '#e2e8f0';
          ctx.font = `${fontSizeSub}px sans-serif`;
          ctx.fillText(`🕒 WAKTU DOKUMENTASI: ${nowStr}`, paddingX, currentY);

          const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.88);

          const newFoto: BuktiFoto = {
            id: `img-panen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: watermarkedUrl,
            timestamp: nowStr,
            watermarkText: `Petugas: ${officerName} (NRP: ${officerNrp}) | Waktu: ${nowStr} | GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            lat,
            lng,
            officerName,
          };

          setFotoPanen((prev) => [...prev, newFoto]);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!tanggalPanen) {
      setErrorMsg('Tanggal pelaksanaan panen tidak boleh kosong.');
      return;
    }
    if (!luasPanenM2 || luasPanenM2 <= 0) {
      setErrorMsg('Luas lahan panen (m²) harus diisi angka positif.');
      return;
    }
    if (!hasilPanenKg || hasilPanenKg <= 0) {
      setErrorMsg('Hasil produksi panen (Kg) harus diisi angka positif.');
      return;
    }
    if (fotoPanen.length === 0) {
      setErrorMsg('Wajib mengunggah minimal 1 foto dokumentasi panen ber-watermark GPS sebelum menyimpan.');
      return;
    }

    const dataPanenObj: DataPanen = {
      tanggalPanen,
      luasPanenM2: Number(luasPanenM2),
      hasilPanenKg: Number(hasilPanenKg),
      catatanPanen,
      fotoPanen,
    };

    try {
      savePanenData(laporan.id, dataPanenObj);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data realisasi panen.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-emerald-100 via-white to-white dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 border-b border-emerald-200 dark:border-emerald-500/20">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 rounded-xl">
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Input Hasil Produksi Panen
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 font-medium">
                {laporan.kelompokTani.namaKelompok} • {laporan.dataLahan.desaKelurahan}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/50 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick info banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Varietas Bibit:</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">{laporan.dataLahan.varietasBawang || 'Great Black'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Luas Tanam Awal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{laporan.dataLahan.luasTanamM2.toLocaleString('id-ID')} m² ({(laporan.dataLahan.luasTanamM2 / 10000).toFixed(2)} Ha)</span>
            </div>
          </div>

          {/* Tanggal Panen */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Tanggal Pelaksanaan Panen *
            </label>
            <input
              type="date"
              required
              value={tanggalPanen}
              onChange={(e) => setTanggalPanen(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Luas Lahan Panen & Hasil Panen Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Luas Lahan Panen (m²) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={luasPanenM2}
                onChange={(e) => setLuasPanenM2(Number(e.target.value))}
                placeholder="Contoh: 10000"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none text-sm"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                = <strong className="text-emerald-600 dark:text-emerald-400">{(luasPanenM2 / 10000).toFixed(2)}</strong> Hektar (Ha)
              </span>
            </div>

            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Hasil Produksi Panen (Kg) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={hasilPanenKg}
                onChange={(e) => setHasilPanenKg(Number(e.target.value))}
                placeholder="Contoh: 7500"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none text-sm"
              />
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1 block">
                = <strong>{(hasilPanenKg / 1000).toFixed(2)}</strong> Ton
              </span>
            </div>
          </div>

          {/* Catatan Panen */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Catatan Evaluasi / Kondisi Hasil Panen (Optional):
            </label>
            <textarea
              rows={3}
              value={catatanPanen}
              onChange={(e) => setCatatanPanen(e.target.value)}
              placeholder="Contoh: Kualitas umbi besar dan padat, tingkat penyusutan rendah, siap diserap pasar lokal..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none text-xs"
            />
          </div>

          {/* Foto Panen Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs">
                Dokumentasi Foto Bukti Kegiatan Panen:
              </label>
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                * Wajib Upload Foto
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow">
                <Upload className="w-3.5 h-3.5" /> Upload Foto Panen (Langsung dari Kamera / Galeri)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFotoUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {fotoPanen.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {fotoPanen.map((foto) => (
                  <div
                    key={foto.id}
                    className="relative rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-500/40 bg-slate-50 dark:bg-slate-950 p-2 space-y-2 group shadow-sm"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                      <img
                        src={foto.url}
                        alt="Foto Panen"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFotoPanen(fotoPanen.filter((f) => f.id !== foto.id))}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow transition cursor-pointer"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[10px] space-y-1 text-slate-700 dark:text-slate-300 font-mono">
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                        <span>👮</span>
                        <span>{foto.officerName || currentUser?.name} (NRP: {currentUser?.username || '88040123'})</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <span>🕒</span>
                        <span>{foto.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sky-700 dark:text-sky-400">
                        <span>📍</span>
                        <span>Lat: {foto.lat.toFixed(6)}, Lng: {foto.lng.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Realisasi Panen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
