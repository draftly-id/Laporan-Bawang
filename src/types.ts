export type UserRole = 'BHABINKAMTIBMAS' | 'ADMIN_PUSAT';

export type UserStatus = 'AKTIF' | 'MUTASI' | 'PENSIUN' | 'NONAKTIF';

export interface UserAccount {
  id: string;
  username: string; // NRP or Username
  nrp?: string;
  password?: string; // Secret passcode
  name: string;
  rank: string; // e.g. BRIPKA, AIPDA, BRIPAD
  polres: string;
  polsek: string;
  wilayahBinaan: string; // Desa/Kelurahan & Kecamatan
  desa?: string;
  kecamatan?: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt?: string;
}

export type StatusLaporan = 
  | 'DRAFT_LOKAL'
  | 'TERKIRIM'
  | 'PENGAJUAN_REVISI'
  | 'DISETUJUI'
  | 'DITOLAK';

export type SyncStatus = 'SYNCED' | 'PENDING_SYNC' | 'SYNC_ERROR';

export type PertumbuhanTanaman = 'Olahan Tanah' | 'Bibit / Tanam Baru' | 'Vegetatif (0-45 HST)' | 'Generatif (46-90 HST)' | 'Siap Panen (90+ HST)';
export type StatusTanaman = PertumbuhanTanaman;

export type JenisTanah = 'Andosol (Sangat Subur)' | 'Latosol (Cokelat/Merah)' | 'Regosol (Vulkanik Pasir)' | 'Aluvial (Endapan)';

export type JenisIrigasi = 'Irigasi Teknis / Perpipaan' | 'Pompa Air / Sumur Dalam' | 'Tadah Hujan' | 'Mata Air Pegunungan';

export interface KelompokTani {
  namaKelompok: string;
  ketuaKelompok: string;
  noHpKetua: string;
  pplName: string;
  noHpPpl: string;
}

export interface DataLahan {
  desaKelurahan: string;
  rtRw: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  latitude: number;
  longitude: number;
  luasLahanTotalM2: number; // in m2
  luasTanamM2: number; // in m2
  jumlahBibitKg: number; // in Kg
  produksiPanenKg: number; // Realized or initial estimate
  ketinggianMdpl: number; // e.g., 900 mdpl
  jenisTanah: JenisTanah;
  jenisIrigasi: JenisIrigasi;
  curahHujanMmBulan: number;
  varietasBawang: string; // e.g., 'Lumbu Hijau', 'Lumbu Kuning', 'Great Black'
}

export interface PhotoBukti {
  id: string;
  url: string;
  timestamp: string;
  watermarkText: string;
  lat: number;
  lng: number;
  officerName: string;
}

export type BuktiFoto = PhotoBukti;

export type KategoriMonitoring =
  | 'Rutin / Pemantauan Vegetatif'
  | 'Pengecekan Hama & Penyakit'
  | 'Pendampingan Pemupukan & Pengairan'
  | 'Kesiapan & Estimasi Panen'
  | 'Edukasi & Sambang Kamtibmas Petani'
  | 'Koordinasi PPL & Kelompok Tani';

export interface LaporanHarian {
  id: string;
  userId: string;
  userName: string;
  userNrp: string;
  userRank: string;
  polsek: string;
  wilayahBinaan: string;
  // Detail Pelaporan Kunjungan
  tanggalKunjungan: string; // YYYY-MM-DD
  waktuKunjungan: string; // HH:mm
  namaPetaniAtauKelompok: string;
  lokasiLahan: string; // Desa/Dusun/Kelompok Tani
  kategoriMonitoring: KategoriMonitoring;
  kondisiTanaman: string; // e.g. Subur & Normal, Perlu Pengairan, Terserang Hama, Siap Panen
  catatan: string; // Catatan hasil monitoring, dialog dengan petani
  tindakanBhabinkamtibmas?: string; // Arahan kamtibmas, edukasi, rekomendasi
  dokumentasiFoto: PhotoBukti[];
  latitude: number;
  longitude: number;
  status: 'TERKIRIM' | 'DRAFT_LOKAL';
  laporanLahanId?: string; // Relasi ke ID Laporan Budidaya Utama jika ada
  createdAt: string;
  updatedAt: string;
}

export interface DataPanen {
  tanggalPanen: string;
  luasPanenM2: number;
  hasilPanenKg: number;
  catatanPanen: string;
  fotoPanen: BuktiFoto[];
}

export interface LaporanBudidaya {
  id: string;
  userId: string;
  userName: string;
  userNrp: string;
  userPolres: string;
  kelompokTani: KelompokTani;
  dataLahan: DataLahan;
  catatanLapangan: string;
  statusTanaman: PertumbuhanTanaman;
  buktiFoto: PhotoBukti[];
  dataPanen?: DataPanen;
  status: StatusLaporan;
  syncStatus?: SyncStatus;
  isOfflineCreated?: boolean;
  offlineSavedAt?: string;
  tanggalInput: string;
  tanggalUpdate: string;
  revisiPending?: RevisionRequest;
}

export interface RevisionRequest {
  id: string;
  laporanId: string;
  userId: string;
  userName: string;
  userNrp: string;
  tanggalPengajuan: string;
  alasanRevisi: string;
  dataBaruProposed: Partial<LaporanBudidaya>;
  dataLamaOriginal: Partial<LaporanBudidaya>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatanAdmin?: string;
  tanggalKeputusan?: string;
  adminHandlerName?: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string; // user ID or 'ADMIN_ALL'
  targetRole: UserRole;
  title: string;
  message: string;
  type: 'NEW_REPORT' | 'REVISION_SUBMITTED' | 'REVISION_APPROVED' | 'REVISION_REJECTED' | 'SYSTEM_ALERT';
  laporanId?: string;
  revisionId?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actionType:
    | 'CREATE_REPORT'
    | 'REQUEST_REVISION'
    | 'APPROVE_REVISION'
    | 'REJECT_REVISION'
    | 'UPDATE_REPORT'
    | 'DELETE_REPORT'
    | 'USER_MANAGEMENT'
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'EXPORT_REPORT'
    | 'BACKUP_DATABASE';
  laporanId?: string;
  targetInfo: string;
  details: string;
  timestamp: string;
}

export interface PredictiveAnalysisInput {
  luasTanamM2: number;
  ketinggianMdpl: number;
  jenisTanah: JenisTanah;
  jenisIrigasi: JenisIrigasi;
  curahHujanMmBulan: number;
  jumlahBibitKg: number;
  varietasBawang: string;
  kabupaten: string;
}

export interface LiveWeatherData {
  lokasi: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  latitude: number;
  longitude: number;
  suhuC: number;
  suhuMinC: number;
  suhuMaxC: number;
  kelembabanPercent: number; // Kelembaban udara real-time
  curahHujanMmJam: number; // Curah hujan jam ini (mm)
  curahHujanMmHari: number; // Akumulasi curah hujan harian (mm)
  curahHujanMmBulanEst: number; // Estimasi bulanan (mm)
  kecepatanAnginKmh: number;
  arahAngin: string;
  tutupanAwanPercent: number;
  tekananUdaraHpa: number;
  kondisiCuaca: string;
  kodeIkon: string;
  waktuUpdate: string;
  statusKesesuaianBawang: 'SANGAT_BAIK' | 'OPTIMAL' | 'WASPADA_JAMUR' | 'WASPADA_KEKERINGAN';
  keteranganAgronomis: string;
}

export interface BMKGPrediksiMusim {
  zonaMusim: string; // e.g., 'ZOM 319 (Enrekang & Sekitarnya)'
  stasiunPemantau: string; // e.g., 'Stasiun Klimatologi Maros / BMKG Wilayah IV Makassar'
  awalMusimHujan: string; // e.g., 'Oktober Dasarian II'
  puncakMusimHujan: string; // e.g., 'Desember - Januari'
  sifatHujanPuncak: 'Atas Normal (AN)' | 'Normal (N)' | 'Bawah Normal (BN)';
  awalMusimKemarau: string; // e.g., 'Juni Dasarian I'
  puncakMusimKemarau: string; // e.g., 'Agustus - September'
  sifatKemarau: 'Normal (N)' | 'Lebih Kering (BN)' | 'Kemarau Basah (AN)';
  indeksElNinoLaNina: string; // e.g., 'ENSO Netral (Index +0.18)'
  indeksDipoleMode: string; // e.g., 'IOD Netral'
  rekomendasiTanam: {
    waktuTanamOptimal: string;
    faseKritisAir: string;
    peringatanDini: string[];
    mitigasiHamaPenyakit: string[];
  };
  prakiraanBulanan: {
    bulan: string;
    curahHujanMm: number;
    kategori: 'Rendah (0-100 mm)' | 'Menengah (100-300 mm)' | 'Tinggi (300-500 mm)' | 'Sangat Tinggi (>500 mm)';
    statusMusim: 'Hujan' | 'Peralihan (Pancaroba)' | 'Kemarau';
  }[];
}

export interface PredictiveAnalysisResult {
  estimasiPanenMinKg: number;
  estimasiPanenExpectedKg: number;
  estimasiPanenMaxKg: number;
  produktivitasTonPerHa: number;
  kategoriPerforma: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perhatian';
  confidenceScorePercent: number;
  faktorFaktor: {
    faktorKetinggian: { score: number; label: string };
    faktorTanah: { score: number; label: string };
    faktorIrigasi: { score: number; label: string };
    faktorIklim: { score: number; label: string };
  };
  rekomendasiAgronomis: string[];
  cuacaKondisiSaatIni?: {
    suhuC: number;
    kelembabanPercent: number;
    statusCuaca: string;
  };
}
