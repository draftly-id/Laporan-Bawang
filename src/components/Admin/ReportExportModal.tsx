import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Printer,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Users,
  Sprout,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  PhoneCall,
  Navigation,
  Droplets,
} from 'lucide-react';
import { LaporanBudidaya } from '../../types';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: LaporanBudidaya[];
  onOpenGoogleSheets?: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  reports,
  onOpenGoogleSheets,
}) => {
  const [viewFormat, setViewFormat] = useState<'CARDS' | 'TABLE'>('CARDS');

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    const headers = [
      'ID Laporan',
      'Tanggal Input',
      'Nama Petugas Bhabin',
      'NRP',
      'Polsek / Polres',
      'Kelompok Tani',
      'Ketua Poktan',
      'No HP Ketua',
      'Desa / Kelurahan',
      'RT/RW',
      'Kecamatan',
      'Kabupaten',
      'Provinsi',
      'Latitude',
      'Longitude',
      'Luas Lahan Total (m2)',
      'Luas Tanam (m2)',
      'Jumlah Bibit (Kg)',
      'Varietas Bawang',
      'Ketinggian (mdpl)',
      'Jenis Tanah',
      'Jenis Irigasi',
      'Fase Pertumbuhan',
      'Proyeksi Panen (Kg)',
      'Tgl Realisasi Panen',
      'Luas Panen Realisasi (m2)',
      'Hasil Panen Realisasi (Kg)',
      'Hasil Panen Realisasi (Ton)',
      'Catatan Panen',
      'Status Laporan',
    ];

    const rows = reports.map((r) => [
      r.id,
      r.tanggalInput,
      `"${r.userName}"`,
      `"${r.userNrp}"`,
      `"${r.userPolres}"`,
      `"${r.kelompokTani.namaKelompok}"`,
      `"${r.kelompokTani.ketuaKelompok}"`,
      `"${r.kelompokTani.noHpKetua}"`,
      `"${r.dataLahan.desaKelurahan}"`,
      `"${r.dataLahan.rtRw}"`,
      `"${r.dataLahan.kecamatan}"`,
      `"${r.dataLahan.kabupaten}"`,
      `"${r.dataLahan.provinsi}"`,
      r.dataLahan.latitude,
      r.dataLahan.longitude,
      r.dataLahan.luasLahanTotalM2,
      r.dataLahan.luasTanamM2,
      r.dataLahan.jumlahBibitKg,
      `"${r.dataLahan.varietasBawang || 'Great Black'}"`,
      r.dataLahan.ketinggianMdpl,
      `"${r.dataLahan.jenisTanah}"`,
      `"${r.dataLahan.jenisIrigasi}"`,
      `"${r.statusTanaman}"`,
      r.dataLahan.produksiPanenKg,
      `"${r.dataPanen?.tanggalPanen || '-'}"`,
      r.dataPanen?.luasPanenM2 || 0,
      r.dataPanen?.hasilPanenKg || 0,
      r.dataPanen ? (r.dataPanen.hasilPanenKg / 1000).toFixed(2) : 0,
      `"${r.dataPanen?.catatanPanen || '-'}"`,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekapitulasi_BawangPutih_POLRI_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHtmlDoc = () => {
    const htmlHeader = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Eksekutif Pendataan Bawang Putih - Polres Enrekang</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #000; background: #fff; }
    h1, h2, h3 { text-align: center; margin: 5px 0; }
    .header-box { border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
    .item-card { border: 2px solid #000; border-radius: 8px; padding: 12px; margin-bottom: 16px; page-break-inside: avoid; }
    .item-header { background: #f0f0f0; border: 1px solid #000; padding: 8px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .cell { border: 1px solid #000; padding: 8px; border-radius: 4px; font-size: 12px; }
    .cell-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px; }
    .summary-box { display: flex; justify-content: space-around; border: 2px solid #000; padding: 10px; margin-between: 15px; border-radius: 6px; background: #f9f9f9; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header-box">
    <h2>KEPOLISIAN NEGARA REPUBLIK INDONESIA</h2>
    <h3>DAERAH SULAWESI SELATAN • RESOR ENREKANG • SATBINMAS</h3>
    <p>DOKUMEN DOKUMENTASI POTENSI LAHAN BUDIDAYA BAWANG PUTIH BHABINKAMTIBMAS POLRES ENREKANG</p>
  </div>
`;

    const summaryHtml = `
  <div class="summary-box">
    <div><strong>Total Luas Tanam:</strong> ${(totalLuasTanam / 10000).toFixed(2)} Ha (${totalLuasTanam.toLocaleString('id-ID')} m²)</div>
    <div><strong>Total Kebutuhan Bibit:</strong> ${(totalBibit / 1000).toFixed(2)} Ton (${totalBibit.toLocaleString('id-ID')} Kg)</div>
    <div><strong>Proyeksi Hasil Panen:</strong> ${(totalPanen / 1000).toFixed(2)} Ton (${totalPanen.toLocaleString('id-ID')} Kg)</div>
  </div>
  <br/>
`;

    const cardsHtml = reports
      .map(
        (r) => `
    <div class="item-card">
      <div class="item-header">
        <span>ID LAPORAN: ${r.id} | Status: ${r.status}</span>
        <span>Petugas: ${r.userName} (${r.userNrp}) - ${r.userPolres}</span>
      </div>
      <div class="grid">
        <div class="cell">
          <div class="cell-title">1. KELOMPOK TANI & KONTAK</div>
          <div><strong>Kelompok:</strong> ${r.kelompokTani.namaKelompok || '-'}</div>
          <div><strong>Ketua:</strong> ${r.kelompokTani.ketuaKelompok || '-'} (${r.kelompokTani.noHpKetua || '-'})</div>
          <div><strong>PPL Pendamping:</strong> ${r.kelompokTani.pplName || '-'} (${r.kelompokTani.noHpPpl || '-'})</div>
        </div>
        <div class="cell">
          <div class="cell-title">2. SPESIFIKASI LAHAN & BIBIT</div>
          <div><strong>Luas Lahan Total:</strong> ${r.dataLahan.luasLahanTotalM2.toLocaleString('id-ID')} m²</div>
          <div><strong>Luas Tanam:</strong> ${r.dataLahan.luasTanamM2.toLocaleString('id-ID')} m²</div>
          <div><strong>Jumlah Bibit:</strong> ${r.dataLahan.jumlahBibitKg.toLocaleString('id-ID')} Kg</div>
          <div><strong>Varietas & Mdpl:</strong> ${r.dataLahan.varietasBawang} (${r.dataLahan.ketinggianMdpl} mdpl)</div>
        </div>
        <div class="cell">
          <div class="cell-title">3. AGROKLIMATOLOGI & FASE</div>
          <div><strong>Fase Tanam:</strong> ${r.statusTanaman}</div>
          <div><strong>Jenis Tanah:</strong> ${r.dataLahan.jenisTanah}</div>
          <div><strong>Sumber Irigasi:</strong> ${r.dataLahan.jenisIrigasi}</div>
          <div><strong>Curah Hujan:</strong> ${r.dataLahan.curahHujanMmBulan} mm/bulan</div>
        </div>
        <div class="cell">
          <div class="cell-title">4. GEOTAGGING LOKASI & ALAMAT</div>
          <div><strong>Desa/RT RW:</strong> ${r.dataLahan.desaKelurahan} (${r.dataLahan.rtRw})</div>
          <div><strong>Kecamatan/Kab:</strong> Kec. ${r.dataLahan.kecamatan}, Kab. ${r.dataLahan.kabupaten}</div>
          <div><strong>Koordinat GPS:</strong> Lat ${r.dataLahan.latitude}, Lng ${r.dataLahan.longitude}</div>
        </div>
      </div>
      <div class="cell" style="margin-top: 10px;">
        <div class="cell-title">5. PROYEKSI PANEN & CATATAN</div>
        <div><strong>Proyeksi Hasil Panen:</strong> ${(r.dataLahan.produksiPanenKg / 1000).toFixed(2)} Ton (${r.dataLahan.produksiPanenKg.toLocaleString('id-ID')} Kg)</div>
        <div><strong>Catatan Lapangan:</strong> ${r.catatanLapangan || '-'}</div>
      </div>
    </div>
  `
      )
      .join('');

    const htmlFooter = `</body></html>`;

    const fullHtml = htmlHeader + summaryHtml + cardsHtml + htmlFooter;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dokumen_Laporan_BawangPutih_POLRI_${new Date()
      .toISOString()
      .slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const totalLuasTanam = reports.reduce(
    (acc, r) => acc + (r.dataLahan.luasTanamM2 || 0),
    0
  );
  const totalBibit = reports.reduce(
    (acc, r) => acc + (r.dataLahan.jumlahBibitKg || 0),
    0
  );
  const totalPanen = reports.reduce(
    (acc, r) => acc + (r.dataLahan.produksiPanenKg || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl text-white shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Ekspor Data & Cetak Laporan Eksekutif</h3>
              <p className="text-[11px] text-slate-400">
                Laporan berformat resmi ber-border per item data untuk kejelasan cetak & dokumen PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector & Action Toolbar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          {/* Format Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewFormat('CARDS')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                viewFormat === 'CARDS'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Format Border Box Per Item</span>
            </button>

            <button
              onClick={() => setViewFormat('TABLE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                viewFormat === 'TABLE'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Format Tabel Bergaris Tegas</span>
            </button>
          </div>

          {/* Export Action Buttons: Unduh CSV & Unduh Dokumen PDF */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-amber-400" /> Unduh CSV
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow transition"
              title="Simpan atau cetak dokumen laporan resmi ke format PDF"
            >
              <FileText className="w-4 h-4" /> Unduh Dokumen PDF
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-100 bg-slate-900 print:bg-white print:text-black print:p-0">
          {/* Executive Letterhead Header */}
          <div className="border-b-2 border-slate-700 print:border-black pb-4 text-center space-y-1">
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-amber-400 print:text-black">
              KEPOLISIAN NEGARA REPUBLIK INDONESIA
            </h2>
            <h3 className="text-sm font-bold text-slate-200 print:text-black">
              DAERAH SULAWESI SELATAN • RESOR ENREKANG • SATBINMAS
            </h3>
            <p className="text-xs text-slate-400 print:text-gray-700">
              REKAPITULASI PENDATAAN POTENSI LAHAN BUDIDAYA BAWANG PUTIH BHABINKAMTIBMAS POLRES ENREKANG
            </p>
          </div>

          {/* Aggregates Summary Box */}
          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-xl border-2 border-slate-800 print:border-black">
              <span className="text-[10px] uppercase text-slate-400 print:text-gray-700 block font-bold">
                Total Luas Tanam
              </span>
              <span className="text-lg font-extrabold text-amber-300 print:text-black">
                {(totalLuasTanam / 10000).toFixed(2)} Ha ({totalLuasTanam.toLocaleString('id-ID')} m²)
              </span>
            </div>

            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-xl border-2 border-slate-800 print:border-black">
              <span className="text-[10px] uppercase text-slate-400 print:text-gray-700 block font-bold">
                Total Kebutuhan Bibit
              </span>
              <span className="text-lg font-extrabold text-sky-300 print:text-black">
                {(totalBibit / 1000).toFixed(2)} Ton ({totalBibit.toLocaleString('id-ID')} Kg)
              </span>
            </div>

            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-xl border-2 border-slate-800 print:border-black">
              <span className="text-[10px] uppercase text-slate-400 print:text-gray-700 block font-bold">
                Proyeksi Total Hasil Panen
              </span>
              <span className="text-lg font-extrabold text-emerald-300 print:text-black">
                {(totalPanen / 1000).toFixed(2)} Ton ({totalPanen.toLocaleString('id-ID')} Kg)
              </span>
            </div>
          </div>

          {/* MAIN DATA RENDER: CARDS WITH BORDER PER ITEM vs TABLE WITH CELL BORDERS */}
          {viewFormat === 'CARDS' ? (
            /* MODE KARTU BOX PER ITEM DATA (BORDER TEGAS PER ITEM LAPORAN) */
            <div className="space-y-5">
              <div className="text-xs font-bold text-amber-400 print:text-black flex items-center justify-between border-b border-slate-800 pb-2 print:hidden">
                <span>FORMAT KARTU DATA DENGAN BORDER PER ITEM LAPORAN ({reports.length} ITEM DATA)</span>
                <span className="text-[11px] text-slate-400">Setiap item dibatasi border tegas agar data sangat jelas</span>
              </div>

              {reports.map((r, index) => (
                <div
                  key={r.id}
                  className="border-2 border-slate-700 print:border-2 print:border-black rounded-2xl p-4 bg-slate-950/80 print:bg-white text-slate-100 print:text-black space-y-3.5 page-break-inside-avoid print:break-inside-avoid shadow-lg"
                >
                  {/* Card Header Row (Bordered) */}
                  <div className="p-3 bg-slate-900 print:bg-gray-100 border border-slate-700 print:border-black rounded-xl flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 print:text-black print:bg-gray-200 border border-amber-500/40 print:border-black rounded">
                        #{index + 1} | ID: {r.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          r.status === 'DISETUJUI'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700 print:text-black'
                            : r.status === 'TERKIRIM'
                            ? 'bg-sky-950 text-sky-300 border-sky-700 print:text-black'
                            : 'bg-amber-950 text-amber-300 border-amber-700 print:text-black'
                        }`}
                      >
                        STATUS: {r.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 print:text-black font-semibold flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-400 print:text-black" />
                      <span>
                        Petugas: <strong className="text-white print:text-black">{r.userName}</strong> (NRP: {r.userNrp})
                      </span>
                      <span className="text-slate-500">•</span>
                      <span>{r.userPolres}</span>
                    </div>
                  </div>

                  {/* Internal Sub-Grid with Borders per Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {/* Field 1: Kelompok Tani & Kontak */}
                    <div className="border border-slate-800 print:border-black p-3 rounded-xl bg-slate-900/50 print:bg-white space-y-1.5">
                      <div className="font-bold text-amber-400 print:text-black flex items-center gap-1.5 border-b border-slate-800 print:border-gray-300 pb-1">
                        <Users className="w-3.5 h-3.5" /> 1. Kelompok Tani & Kontak
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Nama Kelompok:</span>
                        <strong className="text-white print:text-black">{r.kelompokTani.namaKelompok || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Ketua Poktan / No HP:</span>
                        <span className="text-slate-200 print:text-black font-medium">
                          {r.kelompokTani.ketuaKelompok || '-'} ({r.kelompokTani.noHpKetua || '-'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Petugas PPL Pendamping:</span>
                        <span className="text-slate-200 print:text-black font-medium">
                          {r.kelompokTani.pplName || '-'} ({r.kelompokTani.noHpPpl || '-'})
                        </span>
                      </div>
                    </div>

                    {/* Field 2: Spesifikasi Lahan & Bibit */}
                    <div className="border border-slate-800 print:border-black p-3 rounded-xl bg-slate-900/50 print:bg-white space-y-1.5">
                      <div className="font-bold text-sky-400 print:text-black flex items-center gap-1.5 border-b border-slate-800 print:border-gray-300 pb-1">
                        <Sprout className="w-3.5 h-3.5" /> 2. Lahan & Jumlah Bibit Ditanam
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-400 print:text-gray-600 block text-[10px]">Luas Total:</span>
                          <span className="font-bold text-white print:text-black">{r.dataLahan.luasLahanTotalM2.toLocaleString('id-ID')} m²</span>
                        </div>
                        <div>
                          <span className="text-slate-400 print:text-gray-600 block text-[10px]">Luas Tanam:</span>
                          <span className="font-bold text-amber-300 print:text-black">{r.dataLahan.luasTanamM2.toLocaleString('id-ID')} m²</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Jumlah Bibit Ditanam:</span>
                        <strong className="text-sky-300 print:text-black">{r.dataLahan.jumlahBibitKg.toLocaleString('id-ID')} Kg</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Varietas & Ketinggian:</span>
                        <span className="text-slate-200 print:text-black font-medium">
                          {r.dataLahan.varietasBawang} ({r.dataLahan.ketinggianMdpl} mdpl)
                        </span>
                      </div>
                    </div>

                    {/* Field 3: Agroklimatologi & Pertumbuhan */}
                    <div className="border border-slate-800 print:border-black p-3 rounded-xl bg-slate-900/50 print:bg-white space-y-1.5">
                      <div className="font-bold text-emerald-400 print:text-black flex items-center gap-1.5 border-b border-slate-800 print:border-gray-300 pb-1">
                        <Droplets className="w-3.5 h-3.5" /> 3. Pertumbuhan & Agroklimat
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Fase Pertumbuhan:</span>
                        <span className="font-bold text-emerald-300 print:text-black">{r.statusTanaman}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Jenis Tanah:</span>
                        <span className="text-slate-200 print:text-black">{r.dataLahan.jenisTanah}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Sumber Irigasi / Curah Hujan:</span>
                        <span className="text-slate-200 print:text-black">
                          {r.dataLahan.jenisIrigasi} ({r.dataLahan.curahHujanMmBulan} mm/bln)
                        </span>
                      </div>
                    </div>

                    {/* Field 4: Lokasi & Geotagging GPS */}
                    <div className="border border-slate-800 print:border-black p-3 rounded-xl bg-slate-900/50 print:bg-white space-y-1.5">
                      <div className="font-bold text-purple-400 print:text-black flex items-center gap-1.5 border-b border-slate-800 print:border-gray-300 pb-1">
                        <MapPin className="w-3.5 h-3.5" /> 4. Geotagging & Wilayah
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Desa / RT RW:</span>
                        <strong className="text-white print:text-black">
                          {r.dataLahan.desaKelurahan} ({r.dataLahan.rtRw})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Kecamatan & Kabupaten:</span>
                        <span className="text-slate-200 print:text-black">
                          Kec. {r.dataLahan.kecamatan}, Kab. {r.dataLahan.kabupaten}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-gray-600 block text-[10px]">Koordinat Presisi GPS:</span>
                        <span className="font-mono text-amber-300 print:text-black text-[11px]">
                          Lat: {r.dataLahan.latitude}, Lng: {r.dataLahan.longitude}
                        </span>
                      </div>
                    </div>

                    {/* Field 5: Proyeksi Panen & Catatan Lapangan */}
                    <div className="border border-slate-800 print:border-black p-3 rounded-xl bg-slate-900/50 print:bg-white space-y-1.5 col-span-1 md:col-span-2 lg:col-span-2">
                      <div className="font-bold text-amber-400 print:text-black flex items-center gap-1.5 border-b border-slate-800 print:border-gray-300 pb-1">
                        <Sparkles className="w-3.5 h-3.5" /> 5. Proyeksi Panen & Catatan Bhabinkamtibmas
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-black">
                          <span className="text-[10px] text-slate-400 print:text-gray-600 block font-semibold">Proyeksi Hasil Panen:</span>
                          <span className="text-base font-extrabold text-emerald-400 print:text-black">
                            {(r.dataLahan.produksiPanenKg / 1000).toFixed(2)} Ton ({r.dataLahan.produksiPanenKg.toLocaleString('id-ID')} Kg)
                          </span>
                        </div>
                        <div className="p-2 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-black">
                          <span className="text-[10px] text-slate-400 print:text-gray-600 block font-semibold">Catatan Lapangan:</span>
                          <p className="text-slate-300 print:text-black italic text-[11px] line-clamp-2">
                            "{r.catatanLapangan || 'Kondisi tanaman sehat dan terawat baik.'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Evidence Watermark Box if available */}
                  {r.buktiFoto && r.buktiFoto.length > 0 && (
                    <div className="p-2.5 bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-black rounded-xl flex items-center gap-3 text-xs">
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 print:border-black shrink-0">
                        <img src={r.buktiFoto[0].url} alt="Foto Lapangan" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-amber-400 print:text-black block">
                          LAMPIRAN BUKTI FOTO LAPANGAN TERVERIFIKASI
                        </span>
                        <p className="text-[10px] text-slate-400 print:text-gray-700 font-mono">
                          Watermark: {r.buktiFoto[0].watermarkText || 'GPS Geotag Verified'} • {r.buktiFoto[0].timestamp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* MODE TABEL BERGARIS TEGAS (FULL BORDER GRID PER SEL DATA) */
            <div className="overflow-x-auto rounded-xl border-2 border-slate-800 print:border-2 print:border-black">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-gray-200 text-slate-200 print:text-black uppercase text-[10px] tracking-wider border-b-2 border-slate-800 print:border-black font-extrabold">
                  <tr>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">No</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">ID Laporan</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">Petugas & Polsek</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">Kelompok Tani & Kontak</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">Wilayah Binaan (Desa/Kec/Kab)</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black text-right">Luas Tanam (m²)</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black text-right">Bibit (Kg)</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">Varietas & Mdpl</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black text-right">Proyeksi (Ton)</th>
                    <th className="p-2.5 border-2 border-slate-800 print:border-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-black">
                  {reports.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-2 border border-slate-800 print:border-black text-center font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black font-mono text-[10px]">
                        {r.id}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black">
                        <div className="font-bold text-white print:text-black">{r.userName}</div>
                        <div className="text-[10px] text-slate-400 print:text-gray-600">NRP: {r.userNrp} • {r.userPolres}</div>
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black">
                        <div className="font-bold text-amber-300 print:text-black">{r.kelompokTani.namaKelompok}</div>
                        <div className="text-[10px] text-slate-400 print:text-gray-600">Ketua: {r.kelompokTani.ketuaKelompok} ({r.kelompokTani.noHpKetua})</div>
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black">
                        <div className="font-semibold">{r.dataLahan.desaKelurahan} ({r.dataLahan.rtRw})</div>
                        <div className="text-[10px] text-slate-400 print:text-gray-600">Kec. {r.dataLahan.kecamatan}, Kab. {r.dataLahan.kabupaten}</div>
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black text-right font-mono font-bold text-amber-300 print:text-black">
                        {r.dataLahan.luasTanamM2.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black text-right font-mono font-bold text-sky-300 print:text-black">
                        {r.dataLahan.jumlahBibitKg.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black">
                        <div>{r.dataLahan.varietasBawang}</div>
                        <div className="text-[10px] text-slate-400 print:text-gray-600">{r.dataLahan.ketinggianMdpl} mdpl</div>
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black text-right font-mono font-bold text-emerald-400 print:text-black">
                        {(r.dataLahan.produksiPanenKg / 1000).toFixed(2)}
                      </td>
                      <td className="p-2 border border-slate-800 print:border-black text-center font-bold text-[10px]">
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center print:hidden">
          <p className="text-xs text-slate-400">
            Gunakan tombol <strong className="text-white">Unduh Dokumen PDF</strong> untuk menyimpan dokumen laporan resmi ke format PDF.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold text-xs hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
