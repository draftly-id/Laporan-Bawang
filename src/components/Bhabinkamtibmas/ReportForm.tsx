import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Save,
  MapPin,
  Users,
  Sprout,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  UserAccount,
  LaporanBudidaya,
  JenisTanah,
  JenisIrigasi,
  PertumbuhanTanaman,
  PhotoBukti,
} from '../../types';
import { GpsPickerMap } from '../GpsPickerMap';
import { WatermarkCanvas } from '../WatermarkCanvas';
import { submitOrUpdateReport } from '../../services/appState';

interface ReportFormProps {
  currentUser: UserAccount;
  existingReport?: LaporanBudidaya | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  currentUser,
  existingReport,
  onSuccess,
  onCancel,
}) => {
  // Module B: Kelompok Tani
  const [namaKelompok, setNamaKelompok] = useState(
    existingReport?.kelompokTani.namaKelompok || ''
  );
  const [ketuaKelompok, setKetuaKelompok] = useState(
    existingReport?.kelompokTani.ketuaKelompok || ''
  );
  const [noHpKetua, setNoHpKetua] = useState(
    existingReport?.kelompokTani.noHpKetua || ''
  );
  const [pplName, setPplName] = useState(
    existingReport?.kelompokTani.pplName || ''
  );
  const [noHpPpl, setNoHpPpl] = useState(
    existingReport?.kelompokTani.noHpPpl || ''
  );

  // Module C: Lahan & Agrikultur
  const [desaKelurahan, setDesaKelurahan] = useState(
    existingReport?.dataLahan.desaKelurahan ||
      currentUser.wilayahBinaan.split(',')[0] ||
      'Kalosi'
  );
  const [rtRw, setRtRw] = useState(existingReport?.dataLahan.rtRw || 'RT 02 / RW 01');
  const [kecamatan, setKecamatan] = useState(
    existingReport?.dataLahan.kecamatan || 'Alla'
  );
  const [kabupaten, setKabupaten] = useState(
    existingReport?.dataLahan.kabupaten || 'Enrekang'
  );
  const [provinsi, setProvinsi] = useState(
    existingReport?.dataLahan.provinsi || 'Sulawesi Selatan'
  );
  const [lat, setLat] = useState<number>(
    existingReport?.dataLahan.latitude || -3.5642
  );
  const [lng, setLng] = useState<number>(
    existingReport?.dataLahan.longitude || 119.7731
  );

  const [luasLahanTotalM2, setLuasLahanTotalM2] = useState<number>(
    existingReport?.dataLahan.luasLahanTotalM2 || 15000
  );
  const [luasTanamM2, setLuasTanamM2] = useState<number>(
    existingReport?.dataLahan.luasTanamM2 || 12000
  );
  const [jumlahBibitKg, setJumlahBibitKg] = useState<number>(
    existingReport?.dataLahan.jumlahBibitKg || 1440
  );
  const [produksiPanenKg, setProduksiPanenKg] = useState<number>(
    existingReport?.dataLahan.produksiPanenKg || 13200
  );
  const [ketinggianMdpl, setKetinggianMdpl] = useState<number>(
    existingReport?.dataLahan.ketinggianMdpl || 1100
  );
  const [jenisTanah, setJenisTanah] = useState<JenisTanah>(
    existingReport?.dataLahan.jenisTanah || 'Andosol (Sangat Subur)'
  );
  const [jenisIrigasi, setJenisIrigasi] = useState<JenisIrigasi>(
    existingReport?.dataLahan.jenisIrigasi || 'Mata Air Pegunungan'
  );
  const [curahHujanMmBulan, setCurahHujanMmBulan] = useState<number>(
    existingReport?.dataLahan.curahHujanMmBulan || 160
  );
  const [varietasBawang, setVarietasBawang] = useState<string>(
    existingReport?.dataLahan.varietasBawang || 'Great Black / Lumbu Hijau'
  );
  const [statusTanaman, setStatusTanaman] = useState<PertumbuhanTanaman>(
    existingReport?.statusTanaman || 'Vegetatif (0-45 HST)'
  );

  // Module D: Catatan & Foto
  const [catatanLapangan, setCatatanLapangan] = useState(
    existingReport?.catatanLapangan || ''
  );
  const [buktiFoto, setBuktiFoto] = useState<PhotoBukti[]>(
    existingReport?.buktiFoto || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleAddPhoto = (photo: PhotoBukti) => {
    setBuktiFoto((prev) => [photo, ...prev]);
  };

  const handleSave = (isDraft: boolean) => {
    if (!namaKelompok.trim()) {
      setErrorText('Nama Kelompok Tani wajib diisi.');
      return;
    }
    if (!desaKelurahan.trim()) {
      setErrorText('Lokasi Desa/Kelurahan wajib diisi.');
      return;
    }
    if (buktiFoto.length === 0) {
      setErrorText('Wajib mengunggah minimal 1 foto dokumentasi lahan ber-watermark GPS sebelum menyimpan atau mengirim laporan.');
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    try {
      const payload: Partial<LaporanBudidaya> = {
        id: existingReport?.id,
        kelompokTani: {
          namaKelompok,
          ketuaKelompok,
          noHpKetua,
          pplName,
          noHpPpl,
        },
        dataLahan: {
          desaKelurahan,
          rtRw,
          kecamatan,
          kabupaten,
          provinsi,
          latitude: lat,
          longitude: lng,
          luasLahanTotalM2,
          luasTanamM2,
          jumlahBibitKg,
          produksiPanenKg,
          ketinggianMdpl,
          jenisTanah,
          jenisIrigasi,
          curahHujanMmBulan,
          varietasBawang,
        },
        catatanLapangan,
        statusTanaman,
        buktiFoto,
      };

      submitOrUpdateReport(payload, isDraft);
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setErrorText(err.message || 'Gagal menyimpan laporan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xl space-y-6">
      {/* Header Form */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {existingReport ? 'Edit / Perbarui Pendataan Lahan' : 'Form Input Pendataan Bawang Putih'}
            </h2>
            <p className="text-xs text-slate-400">
              Petugas: <span className="font-semibold text-amber-400">{currentUser.name}</span> ({currentUser.username}) • {currentUser.polres}
            </p>
          </div>
        </div>
      </div>

      {errorText && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* SECTION B: Kelompok Tani */}
      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Users className="w-4 h-4" /> B. Data Kelompok Tani & Pendamping Lapangan (PPL)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Nama Kelompok Tani / Koperasi *</label>
            <input
              type="text"
              required
              value={namaKelompok}
              onChange={(e) => setNamaKelompok(e.target.value)}
              placeholder="e.g. Poktan Tani Makmur"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Ketua Kelompok Tani</label>
            <input
              type="text"
              value={ketuaKelompok}
              onChange={(e) => setKetuaKelompok(e.target.value)}
              placeholder="Nama lengkap ketua"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">No. HP Ketua Kelompok</label>
            <input
              type="text"
              value={noHpKetua}
              onChange={(e) => setNoHpKetua(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Petugas Penyuluh Pertanian (PPL)</label>
            <input
              type="text"
              value={pplName}
              onChange={(e) => setPplName(e.target.value)}
              placeholder="Nama PPL Dinas"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">No. HP Penyuluh (PPL)</label>
            <input
              type="text"
              value={noHpPpl}
              onChange={(e) => setNoHpPpl(e.target.value)}
              placeholder="0813xxxxxxxx"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION C: Data Lahan & Agrikultur */}
      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> C. Data Lahan & GPS Maps Interactive
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Desa / Kelurahan *</label>
            <input
              type="text"
              value={desaKelurahan}
              onChange={(e) => setDesaKelurahan(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">RT / RW</label>
            <input
              type="text"
              value={rtRw}
              onChange={(e) => setRtRw(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kecamatan</label>
            <input
              type="text"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kabupaten / Kota</label>
            <input
              type="text"
              value={kabupaten}
              onChange={(e) => setKabupaten(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* GPS Picker Map Component */}
        <GpsPickerMap
          lat={lat}
          lng={lng}
          locationLabel={`${desaKelurahan}, ${kecamatan}`}
          onChangeLocation={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
        />

        {/* Land & Crop Quantities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
          <div>
            <label className="block text-slate-400 mb-1">Total Luas Lahan Potensial (m²)</label>
            <input
              type="number"
              min="100"
              value={luasLahanTotalM2}
              onChange={(e) => setLuasLahanTotalM2(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 font-semibold focus:border-amber-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              = {(luasLahanTotalM2 / 10000).toFixed(2)} Hektar
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Luas Tanam Aktif (m²)</label>
            <input
              type="number"
              min="100"
              value={luasTanamM2}
              onChange={(e) => setLuasTanamM2(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 font-semibold focus:border-amber-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              = {(luasTanamM2 / 10000).toFixed(2)} Hektar
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Jumlah Bibit Ditanam (Kg)</label>
            <input
              type="number"
              value={jumlahBibitKg}
              onChange={(e) => setJumlahBibitKg(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 font-semibold focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Varietas Bibit Bawang Putih *</label>
            <div className="relative">
              <input
                type="text"
                list="varietas-list"
                value={varietasBawang}
                onChange={(e) => setVarietasBawang(e.target.value)}
                placeholder="Pilih atau ketik varietas..."
                className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
              />
              <datalist id="varietas-list">
                <option value="Great Black (Unggul Enrekang)" />
                <option value="Lumbu Hijau (Lokal Enrekang)" />
                <option value="Lumbu Kuning" />
                <option value="Super Philip" />
                <option value="Tawangmangu Baru" />
                <option value="Sangga Sembalun" />
                <option value="Honan / Impor Budi" />
              </datalist>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Contoh: Great Black, Lumbu Hijau, Super Philip
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Estimasi/Realisasi Panen (Kg)</label>
            <input
              type="number"
              value={produksiPanenKg}
              onChange={(e) => setProduksiPanenKg(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 font-semibold focus:border-amber-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              = {(produksiPanenKg / 1000).toFixed(2)} Ton
            </span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Status Pertumbuhan Tanaman</label>
            <select
              value={statusTanaman}
              onChange={(e) => setStatusTanaman(e.target.value as PertumbuhanTanaman)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="Olahan Tanah">Olahan Tanah</option>
              <option value="Bibit / Tanam Baru">Bibit / Tanam Baru</option>
              <option value="Vegetatif (0-45 HST)">Vegetatif (0-45 HST)</option>
              <option value="Generatif (46-90 HST)">Generatif (46-90 HST)</option>
              <option value="Siap Panen (90+ HST)">Siap Panen (90+ HST)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Ketinggian Lahan (mdpl)</label>
            <input
              type="number"
              value={ketinggianMdpl}
              onChange={(e) => setKetinggianMdpl(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Jenis Tanah</label>
            <select
              value={jenisTanah}
              onChange={(e) => setJenisTanah(e.target.value as JenisTanah)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="Andosol (Sangat Subur)">Andosol (Sangat Subur)</option>
              <option value="Latosol (Cokelat/Merah)">Latosol (Cokelat/Merah)</option>
              <option value="Regosol (Vulkanik Pasir)">Regosol (Vulkanik Pasir)</option>
              <option value="Aluvial (Endapan)">Aluvial (Endapan)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Pengairan / Irigasi</label>
            <select
              value={jenisIrigasi}
              onChange={(e) => setJenisIrigasi(e.target.value as JenisIrigasi)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="Irigasi Teknis / Perpipaan">Irigasi Teknis / Perpipaan</option>
              <option value="Mata Air Pegunungan">Mata Air Pegunungan</option>
              <option value="Pompa Air / Sumur Dalam">Pompa Air / Sumur Dalam</option>
              <option value="Tadah Hujan">Tadah Hujan</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION D: Catatan Lapangan & Bukti Foto Watermark */}
      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> D. Catatan Lapangan & Upload Foto Watermark GPS
          </span>
          <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
            * Wajib Upload Foto
          </span>
        </h3>

        <div className="text-xs">
          <label className="block text-slate-400 mb-1">
            Catatan Lapangan Bhabinkamtibmas (Kendala Hama, Cuaca, Perkembangan Pupuk)
          </label>
          <textarea
            rows={3}
            value={catatanLapangan}
            onChange={(e) => setCatatanLapangan(e.target.value)}
            placeholder="Tuliskan kendala hama, kecukupan pupuk, atau kondisi tanaman di lapangan..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Watermark Canvas Component */}
        <WatermarkCanvas
          officerName={currentUser.name}
          officerNrp={currentUser.username}
          locationName={`${desaKelurahan}, ${kecamatan}`}
          latitude={lat}
          longitude={lng}
          onPhotoCaptured={handleAddPhoto}
        />

        {/* Attached Photos Preview */}
        {buktiFoto.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">
              Foto Bukti Lapangan Terlampir ({buktiFoto.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {buktiFoto.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                >
                  <img src={p.url} alt="Bukti" className="w-full h-36 object-cover" />
                  <div className="p-2 text-[10px] text-slate-300 bg-slate-950/90 border-t border-slate-800 truncate">
                    {p.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
        >
          Batal
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4 text-amber-400" /> Simpan Draf Lokal
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Send className="w-4 h-4" /> Kirim Laporan Resmi
          </button>
        </div>
      </div>
    </div>
  );
};
