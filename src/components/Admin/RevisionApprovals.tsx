import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react';
import { LaporanBudidaya } from '../../types';
import { handleRevisionDecision } from '../../services/appState';

interface RevisionApprovalsProps {
  reports: LaporanBudidaya[];
  onRefresh: () => void;
}

export const RevisionApprovals: React.FC<RevisionApprovalsProps> = ({
  reports,
  onRefresh,
}) => {
  const pendingRevisions = reports.filter(
    (r) => r.status === 'PENGAJUAN_REVISI' && r.revisiPending
  );

  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const handleDecision = (laporanId: string, approve: boolean) => {
    const notes = adminNotes[laporanId] || '';
    handleRevisionDecision(laporanId, approve, notes);
    onRefresh();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Persetujuan Permohonan Revisi / Koreksi Data
          </h2>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {pendingRevisions.length} Menunggu Persetujuan
        </span>
      </div>

      {pendingRevisions.length === 0 ? (
        <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
          <p className="text-sm font-semibold text-slate-300">
            Tidak ada permohonan revisi data yang menggantung.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Seluruh pengajuan revisi dari Bhabinkamtibmas telah diproses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRevisions.map((report) => {
            const rev = report.revisiPending!;
            const proposedData = rev.dataBaruProposed.dataLahan || report.dataLahan;
            const originalData = rev.dataLamaOriginal.dataLahan || report.dataLahan;

            return (
              <div
                key={report.id}
                className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-4 shadow-lg"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {report.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Revisi ID: {rev.id}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white mt-1">
                      {report.kelompokTani.namaKelompok} ({report.dataLahan.desaKelurahan})
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Pengaju: <span className="text-slate-200 font-semibold">{rev.userName}</span> ({rev.userNrp}) • {rev.tanggalPengajuan}
                    </p>
                  </div>
                </div>

                {/* Reason Banner */}
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-300">
                  <span className="font-bold block mb-1">💬 Alasan Koreksi User:</span>
                  <p className="text-slate-200 italic">"{rev.alasanRevisi}"</p>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Original Data */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-rose-400 block border-b border-slate-800 pb-1">
                      ❌ Data Lama (Existing)
                    </span>
                    <div className="flex justify-between text-slate-300">
                      <span>Luas Tanam:</span>
                      <span className="font-mono">{originalData.luasTanamM2} m²</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Jumlah Bibit:</span>
                      <span className="font-mono">{originalData.jumlahBibitKg} Kg</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Proyeksi Panen:</span>
                      <span className="font-mono">{originalData.produksiPanenKg} Kg</span>
                    </div>
                  </div>

                  {/* Proposed Data */}
                  <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-500/40 space-y-1.5">
                    <span className="font-bold text-emerald-400 block border-b border-slate-800 pb-1">
                      ✅ Data Usulan Baru (Proposed)
                    </span>
                    <div className="flex justify-between text-emerald-300 font-bold">
                      <span>Luas Tanam:</span>
                      <span className="font-mono">{proposedData.luasTanamM2} m²</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 font-bold">
                      <span>Jumlah Bibit:</span>
                      <span className="font-mono">{proposedData.jumlahBibitKg} Kg</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 font-bold">
                      <span>Proyeksi Panen:</span>
                      <span className="font-mono">{proposedData.produksiPanenKg} Kg</span>
                    </div>
                  </div>
                </div>

                {/* Admin Response Note */}
                <div className="text-xs space-y-1">
                  <label className="block text-slate-400 font-medium">
                    Catatan Verifikasi Admin (Opsional):
                  </label>
                  <input
                    type="text"
                    value={adminNotes[report.id] || ''}
                    onChange={(e) =>
                      setAdminNotes({ ...adminNotes, [report.id]: e.target.value })
                    }
                    placeholder="Contoh: Disetujui setelah konfirmasi data fisik PPL..."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Decision Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleDecision(report.id, false)}
                    className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" /> Tolak Revisi
                  </button>

                  <button
                    onClick={() => handleDecision(report.id, true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Setujui Revisi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
