import React, { useState } from 'react';
import {
  FileText,
  MapPin,
  Clock,
  Sparkles,
  FileEdit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  PhoneCall,
  MessageSquare,
  Sprout,
  Users,
  WifiOff,
  CloudCheck,
  RefreshCw,
  Database,
} from 'lucide-react';
import { LaporanBudidaya, UserAccount, StatusLaporan } from '../../types';
import { RevisionModal } from './RevisionModal';
import { PanenInputModal } from './PanenInputModal';

interface MyReportsListProps {
  currentUser: UserAccount;
  reports: LaporanBudidaya[];
  onAddNew?: () => void;
  onEditDraft: (report: LaporanBudidaya) => void;
  onOpenPredictive: (report: LaporanBudidaya) => void;
  onRefresh: () => void;
}

export const MyReportsList: React.FC<MyReportsListProps> = ({
  currentUser,
  reports,
  onEditDraft,
  onOpenPredictive,
  onRefresh,
}) => {
  const [selectedReportForRevision, setSelectedReportForRevision] =
    useState<LaporanBudidaya | null>(null);
  const [selectedReportForPanen, setSelectedReportForPanen] =
    useState<LaporanBudidaya | null>(null);

  // Filter reports submitted by this user or in their area
  const myReports = reports.filter(
    (r) => r.userId === currentUser.id || r.userNrp === currentUser.username
  );

  const totalLuasM2 = myReports.reduce((acc, r) => acc + (r.dataLahan.luasTanamM2 || 0), 0);
  const totalPanenKg = myReports.reduce((acc, r) => acc + (r.dataPanen?.hasilPanenKg || 0), 0);
  const totalVerified = myReports.filter((r) => r.status === 'DISETUJUI').length;

  const getStatusBadge = (status: StatusLaporan) => {
    switch (status) {
      case 'DRAFT_LOKAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Draf Lokal
          </span>
        );
      case 'TERKIRIM':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-700/60 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-400" /> Terkirim
          </span>
        );
      case 'PENGAJUAN_REVISI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600/60 flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3 text-amber-400" /> Pengajuan Revisi
          </span>
        );
      case 'DISETUJUI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Disetujui Admin
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" /> Ditolak
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Dashboard Bhabinkamtibmas Pendamping Petani
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser.rank} {currentUser.name} • {currentUser.polsek} ({currentUser.wilayahBinaan})
          </p>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Poktan Binaan</span>
          <div className="text-xl font-black text-white font-mono">{myReports.length} Kelompok</div>
          <span className="text-[10px] text-amber-400">Wilayah Binaan Aktif</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Luas Lahan</span>
          <div className="text-xl font-black text-white font-mono">{(totalLuasM2 / 10000).toFixed(2)} Ha</div>
          <span className="text-[10px] text-sky-400">{totalLuasM2.toLocaleString()} m²</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Realisasi Panen</span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {totalPanenKg > 0 ? `${(totalPanenKg / 1000).toFixed(2)} Ton` : '0 Kg'}
          </div>
          <span className="text-[10px] text-emerald-300 font-mono">{totalPanenKg.toLocaleString()} Kg total</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Status Laporan</span>
          <div className="text-xl font-black text-white font-mono">{totalVerified} / {myReports.length}</div>
          <span className="text-[10px] text-emerald-400">Disetujui Admin</span>
        </div>
      </div>

      {/* Section Title for Reports */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-400" /> Daftar Pelaporan Lahan & Hasil Panen Binaan ({myReports.length})
        </h3>
      </div>

      {/* Reports Grid */}
      {myReports.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Sprout className="w-12 h-12 mx-auto text-slate-700" />
          <p className="font-semibold text-slate-300 text-sm">
            Belum ada data pelaporan bawang putih di wilayah binaan Anda.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Silakan gunakan menu tab <span className="text-amber-400 font-semibold">"Input Laporan Lahan Baru"</span> pada navigasi di atas untuk menambahkan data lahan kelompok tani binaan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myReports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-lg space-y-3 hover:border-slate-700 transition"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {report.id}
                    </span>
                    {report.syncStatus === 'PENDING_SYNC' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <WifiOff className="w-2.5 h-2.5" /> Tersimpan Offline
                      </span>
                    )}
                    {report.isOfflineCreated && report.syncStatus === 'SYNCED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                        <CloudCheck className="w-2.5 h-2.5" /> Sinkron Online
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white">
                    {report.kelompokTani.namaKelompok || 'Poktan Bawang Putih'}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {report.dataLahan.desaKelurahan}, {report.dataLahan.kecamatan}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(report.status)}
                </div>
              </div>

              {/* Tonnage, Area & Seed Variety Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl text-center border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Luas Tanam</span>
                  <span className="font-bold text-amber-300">
                    {report.dataLahan.luasTanamM2.toLocaleString('id-ID')} m²
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Bibit</span>
                  <span className="font-bold text-sky-300">
                    {report.dataLahan.jumlahBibitKg.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Varietas Bibit</span>
                  <span className="font-bold text-amber-400 truncate block px-1" title={report.dataLahan.varietasBawang || 'Great Black'}>
                    {report.dataLahan.varietasBawang || 'Great Black'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Hasil Panen</span>
                  <span className="font-bold text-emerald-400">
                    {(report.dataLahan.produksiPanenKg / 1000).toFixed(2)} Ton
                  </span>
                </div>
              </div>

              {/* Farmer & PPL contacts with WA */}
              <div className="text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Ketua Poktan: {report.kelompokTani.ketuaKelompok || '-'}
                  </span>
                  <span className="font-mono text-slate-300">
                    {report.kelompokTani.noHpKetua || '-'}
                  </span>
                </div>

                {report.kelompokTani.noHpKetua && (
                  <a
                    href={`https://wa.me/${report.kelompokTani.noHpKetua.replace(
                      /[^0-9]/g,
                      ''
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WA Ketua
                  </a>
                )}
              </div>

              {/* Photo preview if present */}
              {report.buktiFoto && report.buktiFoto.length > 0 && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800">
                  <img
                    src={report.buktiFoto[0].url}
                    alt="Foto Lapangan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-slate-950/90 text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded">
                    GPS Watermark Verified
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setSelectedReportForPanen(report)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                  title="Input Tanggal, Luas, dan Hasil Produksi Panen"
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{report.dataPanen ? 'Edit Hasil Panen' : 'Input Hasil Panen'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Predictive Analysis Quick Button */}
                  <button
                    onClick={() => onOpenPredictive(report)}
                    className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg font-semibold flex items-center gap-1 transition"
                    title="Jalankan Analisis Prediktif Panen"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Analisis Panen</span>
                  </button>

                  {report.status === 'DRAFT_LOKAL' ? (
                    <button
                      onClick={() => onEditDraft(report)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <FileEdit className="w-3.5 h-3.5" /> Edit Draf
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedReportForRevision(report)}
                      disabled={report.status === 'PENGAJUAN_REVISI'}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 border transition ${
                        report.status === 'PENGAJUAN_REVISI'
                          ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      {report.status === 'PENGAJUAN_REVISI'
                        ? 'Menunggu'
                        : 'Revisi'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panen Input Modal */}
      {selectedReportForPanen && (
        <PanenInputModal
          isOpen={!!selectedReportForPanen}
          onClose={() => setSelectedReportForPanen(null)}
          laporan={selectedReportForPanen}
          onSuccess={onRefresh}
        />
      )}

      {/* Revision Modal */}
      {selectedReportForRevision && (
        <RevisionModal
          isOpen={!!selectedReportForRevision}
          onClose={() => setSelectedReportForRevision(null)}
          laporan={selectedReportForRevision}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
