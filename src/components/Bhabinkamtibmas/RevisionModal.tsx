import React, { useState } from 'react';
import { X, FileEdit, AlertTriangle, Send } from 'lucide-react';
import { LaporanBudidaya } from '../../types';
import { requestReportRevision } from '../../services/appState';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  laporan: LaporanBudidaya;
  onSuccess: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  onClose,
  laporan,
  onSuccess,
}) => {
  const [alasanRevisi, setAlasanRevisi] = useState('');
  const [newLuasTanamM2, setNewLuasTanamM2] = useState(
    laporan.dataLahan.luasTanamM2
  );
  const [newBibitKg, setNewBibitKg] = useState(laporan.dataLahan.jumlahBibitKg);
  const [newProduksiKg, setNewProduksiKg] = useState(
    laporan.dataLahan.produksiPanenKg
  );
  const [newCatatan, setNewCatatan] = useState(laporan.catatanLapangan);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!alasanRevisi.trim() || alasanRevisi.trim().length < 10) {
      setError('Alasan pengajuan revisi wajib diisi minimal 10 karakter.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const proposedData: Partial<LaporanBudidaya> = {
        dataLahan: {
          ...laporan.dataLahan,
          luasTanamM2: newLuasTanamM2,
          jumlahBibitKg: newBibitKg,
          produksiPanenKg: newProduksiKg,
        },
        catatanLapangan: newCatatan,
      };

      requestReportRevision(laporan.id, alasanRevisi, proposedData);
      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan revisi data.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg text-slate-900 dark:text-white shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-base">Ajukan Revisi / Koreksi Data</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold mb-0.5">Aturan Koreksi Data Terkirim</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Data terkirim tidak dapat langsung diubah oleh user. Pengajuan revisi akan ditinjau dan diverifikasi oleh Admin Pusat sebelum diperbarui.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Koreksi / Revisi Data *
            </label>
            <textarea
              rows={3}
              value={alasanRevisi}
              onChange={(e) => setAlasanRevisi(e.target.value)}
              placeholder="Jelaskan alasan koreksi data (contoh: Salah input luas tanam, ada penambahan blok tanam, dsb)..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
            <h4 className="font-semibold text-amber-700 dark:text-amber-400">
              Data Usulan Perubahan (Proposed Changes):
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Luas Tanam Aktif (m²)</label>
                <input
                  type="number"
                  value={newLuasTanamM2}
                  onChange={(e) => setNewLuasTanamM2(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Jumlah Bibit (Kg)</label>
                <input
                  type="number"
                  value={newBibitKg}
                  onChange={(e) => setNewBibitKg(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Proyeksi Panen (Kg)</label>
                <input
                  type="number"
                  value={newProduksiKg}
                  onChange={(e) => setNewProduksiKg(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Keterangan Catatan</label>
                <input
                  type="text"
                  value={newCatatan}
                  onChange={(e) => setNewCatatan(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Kirim Permohonan Revisi
          </button>
        </div>
      </div>
    </div>
  );
};
