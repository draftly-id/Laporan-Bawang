import React, { useState } from 'react';
import {
  BookOpen,
  Sprout,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Droplets,
  Sun,
  Award,
  AlertTriangle,
  Bug,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Thermometer,
  Mountain,
  Bookmark,
  Share2,
  Sparkles,
} from 'lucide-react';

interface PanduanItem {
  id: string;
  kategori: 'SYARAT_TUMBUH' | 'BENIH_VARIETAS' | 'LAHAN_MULSA' | 'PEMUPUKAN_AIR' | 'HAMA_PENYAKIT' | 'PANEN_PASCA';
  kategoriLabel: string;
  judul: string;
  subjudul: string;
  sumberResmi: string;
  ringkasan: string;
  poinPenting: string[];
  langkahPraktis: { judul: string; deskripsi: string }[];
  tipsBhabinkamtibmas: string;
  icon: string;
}

const PANDUAN_DATA: PanduanItem[] = [
  {
    id: 'syarat-agroekologi',
    kategori: 'SYARAT_TUMBUH',
    kategoriLabel: '1. Syarat Tumbuh & Agroklimat',
    judul: 'Persyaratan Agroklimat & Lahan Bawang Putih Dataran Tinggi',
    subjudul: 'Standar Standarisasi Direktorat Jenderal Hortikultura Kementan RI & Balitsa',
    sumberResmi: 'Pedoman Teknis Budidaya Bawang Putih - Ditjen Hortikultura Kementan RI 2024',
    ringkasan:
      'Tanaman bawang putih (Allium sativum L.) memerlukan iklim sejuk dan kering dengan penyinaran matahari penuh. Kabupaten Enrekang (Kec. Alla, Anggeraja, Baraka, Masalle) merupakan sentra ideal berbasis elevasi pegunungan.',
    poinPenting: [
      'Elevasi Ideal: 800 - 1.800 meter di atas permukaan laut (mdpl). Ketinggian < 600 mdpl menghasilkan umbi kecil tanpa siung (bontot).',
      'Suhu Udara Optimal: 15°C – 22°C pada fase vegetatif; 20°C – 25°C pada fase pembentukan & pematangan umbi.',
      'Curah Hujan: 100 – 200 mm/bulan. Menghindari tanam pada puncak musim hujan dengan curah hujan > 300 mm/bln untuk mencegah busuk akar.',
      'Penyinaran: Hari panjang (> 12 jam/hari) dengan intensitas cahaya penuh untuk memicu inisiasi pembentukan siung umbi.',
      'Tanah: Jenis Andosol atau Latosol bertekstur lempung berpasir, gembur, drainase sangat baik, solum dalam (>30 cm), pH tanah 6.0 – 6.8.',
    ],
    langkahPraktis: [
      {
        judul: 'Uji Kemasaman Tanah (pH)',
        deskripsi:
          'Gunakan pH meter tanah pada beberapa titik sampel lahan petani. Jika pH < 6.0, wajib lakukan pengapuran menggunakan Kalsit / Dolomit 1.5 - 2 ton/Ha 2-3 minggu sebelum tanam.',
      },
      {
        judul: 'Pengaturan Kemiringan & Drainase Lahan Lereng',
        deskripsi:
          'Pada lahan berlereng khas Enrekang, buat guludan/terasering kontur searah garis kontur untuk mencegah erosi pupuk dan lapisan tanah atas.',
      },
    ],
    tipsBhabinkamtibmas:
      'Pastikan petani binaan tidak menanam di lahan bekas tanaman Solanaceae (tomat, cabai, terong) atau sesama Allium berturut-turut tanpa jeda rotasi tanaman jagung/palawija untuk memutus siklus inokulum patogen tanah.',
    icon: 'Mountain',
  },
  {
    id: 'varietas-benih-unggul',
    kategori: 'BENIH_VARIETAS',
    kategoriLabel: '2. Pemilihan Benih & Varietas',
    judul: 'Varietas Unggul Bersertifikat & Perlakuan Benih (Seed Treatment)',
    subjudul: 'Pemberian Sertifikasi Mutu Balai Pengawasan & Sertifikasi Benih (BPSB)',
    sumberResmi: 'Kepmentan No. 89/Kpts/TP.020/2021 & Balai Penelitian Tanaman Sayuran (BALITSA)',
    ringkasan:
      'Kualitas benih menyumbang 40% keberhasilan panen. Benih harus memiliki masa dormansi yang cukup (3–4 bulan simpan), bebas dari nematoda batang dan virus bawaan umbi.',
    poinPenting: [
      'Varietas Rekomendasi Enrekang: Lumbu Hijau (daya adaptasi tinggi, siung besar), Lumbu Kuning, Tawangmangu Baru, dan Sangga Sembalun.',
      'Ciri Benih Berkualitas: Siung bernas padat, kulit kering mengkilap tidak berkerut, titik tumbuh hijau muda sudah mulai tampak di ujung umbi (dormansi pecah), bobot rata-rata 1.5 - 3 gram/siung.',
      'Kebutuhan Benih: 1.000 – 1.400 kg benih siung / Hektar (tergantung ukuran siung dan jarak tanam).',
      'Pemisahan Siung: Dilakukan 1-2 hari sebelum tanam. Buang siung yang keropos, busuk, berjamur, atau terserang hama.',
    ],
    langkahPraktis: [
      {
        judul: 'Perlakuan Benih Hayati (Seed Treatment)',
        deskripsi:
          'Rendam siung benih dalam larutan agens hayati Trichoderma harzianum (20-30 gr/liter air) atau bakterisida/fungisida kontak selama 15-20 menit, lalu tiriskan dan angin-anginkan di tempat teduh.',
      },
      {
        judul: 'Pemberian Zat Pengatur Tumbuh Alami',
        deskripsi:
          'Dapat ditambahkan ekstrak bawang merah lokal (mengandung auksin & giberelin alami) untuk menyeragamkan kecepatan perkecambahan benih.',
      },
    ],
    tipsBhabinkamtibmas:
      'Edukasi kelompok tani binaan agar selalu membeli benih berlabel biru/ungu resmi BPSB dan memeriksa faktur sertifikat karantina jika mendatangkan benih dari luar daerah guna mencegah masuknya patogen luar.',
    icon: 'Sparkles',
  },
  {
    id: 'pengolahan-lahan-mulsa',
    kategori: 'LAHAN_MULSA',
    kategoriLabel: '3. Pengolahan Tanah & Mulsa',
    judul: 'Pengolahan Tanah Maksimal, Bedengan & Pemasangan Mulsa Plastik (MPHP)',
    subjudul: 'SOP Manajemen Media Tanam Ramah Lingkungan & Konservasi Air',
    sumberResmi: 'SOP Budidaya Bawang Putih Ramah Lingkungan - Kementan RI',
    ringkasan:
      'Struktur tanah gembur aerasi baik mutlak dibutuhkan karena umbi bawang putih berkembang di dalam lapisan atas tanah. Penggunaan Mulsa Plastik Hitam Perak (MPHP) meningkatkan efisiensi hara & mencegah erosi.',
    poinPenting: [
      'Pembajakan/Pencangkulan: Olah tanah 2 kali sedalam 25–35 cm sampai tanah benar-benar remah, bersihkan sisa perakaran dan gulma.',
      'Dimensi Bedengan Ideal: Lebar 100 – 120 cm, tinggi bedengan 30 – 40 cm (musim hujan) atau 20 – 25 cm (musim kemarau), lebar parit drainase 40 – 50 cm.',
      'Pemberian Pupuk Kandang Fermentasi: 15 – 20 ton/Ha (atau 1.5 - 2 kg/m²) pupuk kandang sapi/kambing yang sudah matang sempurna (C/N ratio < 15) dicampur rata di lapisan atas bedengan.',
      'Aplikasi Mulsa MPHP: Pasang mulsa hitam perak saat terik matahari siang agar plastik lentur dan kencang. Sisi perak menghadap ke atas untuk memantulkan sinar dan menghalau hama trips/kutu daun.',
      'Pelubangan Mulsa: Buat lubang tanam berdiameter 5–7 cm menggunakan pembolong kaleng panas dengan jarak 10 x 10 cm atau 15 x 15 cm.',
    ],
    langkahPraktis: [
      {
        judul: 'Pemberian Dolomit / Kapur Pertanian',
        deskripsi:
          'Taburkan kapur pertanian (Dolomit) 1–2 ton/Ha secara merata bersamaan dengan pengolahan tanah pertama jika pH tanah di bawah 6.0.',
      },
      {
        judul: 'Pemupukan Dasar Sebelum Tutup Mulsa',
        deskripsi:
          'Aplikasi pupuk SP-36 (150-200 kg/ha) + NPK 15-15-15 (200 kg/ha) + Petroganik/Kompos, aduk rata dengan tanah bedengan 5-7 hari sebelum penutupan mulsa.',
      },
    ],
    tipsBhabinkamtibmas:
      'Parit antar bedengan harus memiliki saluran pembuangan utama yang lancar. Genangan air lebih dari 6 jam saat hujan lebat dapat memicu pembusukan siung benih yang baru ditanam.',
    icon: 'Layers',
  },
  {
    id: 'tanam-pemupukan-irigasi',
    kategori: 'PEMUPUKAN_AIR',
    kategoriLabel: '4. Penanaman, Pemupukan & Air',
    judul: 'Manajemen Penanaman, Pemupukan Berimbang & Kebutuhan Air Presisi',
    subjudul: 'Formulasi Pemupukan Spesifik Lokasi Berdasarkan Rekomendasi Balitbangtan',
    sumberResmi: 'Petunjuk Teknis Pemupukan Berimbang Tanaman Sayuran Umbi - Kementan',
    ringkasan:
      'Kebutuhan hara bawang putih terbagi dalam 3 fase utama: Vegetatif Awal (0-30 HST), Pembentukan Umbi (30-65 HST), dan Pengisian & Pematangan Umbi (65-90 HST).',
    poinPenting: [
      'Cara Menanam Siung: Tancapkan siung benih tegak lurus dengan kedalaman 2/3 bagian siung masuk ke dalam tanah, ujung mata tunas menghadap ke atas. Tutup tipis dengan abu sekam atau tanah gembur.',
      'Jarak Tanam: 10 x 10 cm untuk siung ukuran kecil-sedang (populasi ~600.000 pohon/ha) atau 15 x 15 cm untuk siung ukuran besar (populasi ~400.000 pohon/ha).',
      'Pemupukan Susulan I (15 - 20 HST): Kocor NPK 16-16-16 (5-7 gram/liter) + ZA (3-5 gram/liter) untuk memacu pertumbuhan vegetatif akar dan daun hijau.',
      'Pemupukan Susulan II (35 - 40 HST): Kocor NPK 16-16-16 + KNO3 Merah (Kalium Nitrat) untuk memperkuat dinding sel dan inisiasi pembelahan siung.',
      'Pemupukan Susulan III (55 - 60 HST): Aplikasi pupuk tinggi Kalium dan Fosfat (KNO3 Putih + MKP) untuk memadatkan siung dan meningkatkan bobot umbi basah & kering.',
      'Pemberian Unsur Mikro: Semprot pupuk daun berkandungan Boron (B), Seng (Zn), dan Kalsium (Ca) pada umur 30, 45, dan 60 HST.',
    ],
    langkahPraktis: [
      {
        judul: 'Irigasi / Penyiraman Terjadwal',
        deskripsi:
          'Pada umur 0-30 HST: siram 1-2 hari sekali (pagi/sore). Umur 31-70 HST: siram 2-3 hari sekali. Umur 75-90 HST: kurangi penyiraman (4-5 hari sekali). Hentikan total penyiraman 10-14 hari sebelum panen agar kulit umbi kering dan tahan simpan.',
      },
      {
        judul: 'Penyiangan & Perawatan Lubang Tanam',
        deskripsi:
          'Cabut guloma yang tumbuh di lubang mulsa secara manual dan hati-hati agar tidak merusak perakaran serabut bawang putih yang dangkal.',
      },
    ],
    tipsBhabinkamtibmas:
      'Ingatkan petani binaan agar TIDAK memberikan pupuk Nitrogen (Urea/ZA) berlebih pada umur di atas 60 HST karena akan memicu tanaman rimbun daun (rebah) namun umbi kecil serta rentan terserang jamur trotol.',
    icon: 'Droplets',
  },
  {
    id: 'pengendalian-hama-penyakit',
    kategori: 'HAMA_PENYAKIT',
    kategoriLabel: '5. Perlindungan Tanaman (PHT)',
    judul: 'Pengendalian Hama & Penyakit Terpadu (PHT) Sesuai SOP Kementan',
    subjudul: 'Identifikasi Dini, Ambang Batas Ekonomi & Penggunaan Pestisida Bijak',
    sumberResmi: 'Panduan Pengenalan & Pengendalian OPT Bawang Putih - Ditlin Hortikultura Kementan RI',
    ringkasan:
      'Penyakit utama di dataran tinggi Enrekang adalah Bercak Ungu (Trotol), Layu Fusarium (Moler), dan Busuk Daun Stemphylium, sedangkan hama utama adalah Kutu Daun Thrips dan Ulat Grayak.',
    poinPenting: [
      'Bercak Ungu / Trotol (Alternaria porri): Gejala bercak kecil melekuk warna kelabu keputihan berpusat ungu pada daun. Dipicu kelembaban > 85% dan suhu hangat. Pengendalian: Semprot fungisida berbahan aktif Difenokonazol, Mankozeb, atau Azoksistrobin secara bergantian.',
      'Layu Fusarium / Moler (Fusarium oxysporum): Gejala daun menguning, meliuk berputar (moler), pangkal umbi membusuk dan akar habis. Pengendalian: Kocor agens hayati Trichoderma harzianum + Pseudomonas fluorescens sejak olah tanah dan umur 15, 30 HST.',
      'Hama Trips (Thrips tabaci): Daun berbintik perak kecokelatan, daun keriting mengering. Pengendalian: Pasang perangkap lekat kuning (Yellow Sticky Trap) 40 buah/Ha + semprot insektisida nabati / Abamektin atau Spinetoram.',
      'Ulat Grayak (Spodoptera exigua): Daun berlubang dan transparan dimakan ulat dari dalam rongga daun. Pengendalian: Pasang feromon perangkap exi (Feromon-S) + aplikasi agens hayati Bacillus thuringiensis (Bt).',
      'Embun Bulu / Downy Mildew (Peronospora destructor): Daun pucat layu berlapisan tepung ungu pucat saat kabut pagi. Pengendalian: Fungisida sistemik Metalaksil / Simoksanil.',
    ],
    langkahPraktis: [
      {
        judul: 'Penerapan PHT Ramah Lingkungan',
        deskripsi:
          'Prioritaskan penggunaan musuh alami, pestisida nabati (mimba, tembakau, gadung), dan perangkap fisik sebelum menggunakan pestisida kimiawi.',
      },
      {
        judul: 'Rotasi Golongan Bahan Aktif Pestisida',
        deskripsi:
          'Jangan gunakan satu bahan aktif kimia secara terus-menerus untuk mencegah resistensi hama/patogen di sentra binaan.',
      },
    ],
    tipsBhabinkamtibmas:
      'Ajak petani melakukan pengamatan rutin (monitoring mingguan) di petak sampel. Bila ditemukan 1-2 tanaman bergejala moler, segera cabut bersama tanah di sekitarnya dan musnahkan (bakar/kubur) agar spora tidak menyebar ke rumpun lain.',
    icon: 'Bug',
  },
  {
    id: 'panen-pasca-panen',
    kategori: 'PANEN_PASCA',
    kategoriLabel: '6. Panen & Pascapanen Mutu Tinggi',
    judul: 'Kriteria Panen Tepat Waktu, Pengeringan (Curing) & Standar Pascapanen',
    subjudul: 'Standardisasi Mutu Fisik Bawang Putih SNI 01-3160-1992 & Pasar Ekspor/Lokal',
    sumberResmi: 'Pedoman Penanganan Pascapanen Bawang Putih - Ditjen Hortikultura Kementan RI',
    ringkasan:
      'Panen pada waktu yang tepat dan proses pengeringan (*curing*) yang benar menentukan 50% daya simpan dan harga jual bawang putih di pasar.',
    poinPenting: [
      'Umur Panen Standar: 95 – 120 HST (Hari Setelah Tanam) tergantung varietas dan ketinggian tempat (di atas 1.000 mdpl umur panen lebih panjang sekitar 115-125 HST).',
      'Karakteristik Siap Panen: 70% – 85% daun tanaman telah menguning dan pucuknya rebah lemas, batang semu lunak, kulit umbi telah berserat padat dan tampak bentuk siung menonjol.',
      'Waktu Pemanenan: Lakukan pada pagi hari saat cuaca cerah dan tanah tidak becek basah. Jangan mencabut saat hujan.',
      'Teknik Panen: Cabut batang tanaman secara perlahan bersama umbinya, bersihkan tanah yang menempel pada perakaran tanpa mencuci dengan air.',
      'Proses Pelayuan & Penjemuran (Curing): Jemur di atas terpal selama 5–10 hari dengan posisi daun menutupi umbi (agar umbi tidak terpapar sinar matahari langsung dan tidak gosong/melepuh).',
      'Pengikatan & Penggantungan: Ikat per 1–2 kg dengan daun keringnya, gantung di rak gudang berventilasi baik (suhu 25-30°C, RH 60-70%) untuk penyimpanan jangka panjang atau calon benih.',
    ],
    langkahPraktis: [
      {
        judul: 'Penyortiran & Grading Mutu',
        deskripsi:
          'Kelas Super: Diameter umbi > 4.5 cm, siung padat bernas, kulit mulus. Kelas I: Diameter 3.5 - 4.5 cm. Kelas II: Diameter 2.5 - 3.5 cm.',
      },
      {
        judul: 'Penyimpanan Calon Benih',
        deskripsi:
          'Untuk benih musim tanam berikutnya, simpan dalam bentuk ikatan gantung selama 3-4 bulan sampai masa dormansi berakhir dan muncul titik tunas hijau.',
      },
    ],
    tipsBhabinkamtibmas:
      'Bantu kelompok tani menghubungkan hasil panen yang sudah ter-grading rapi langsung ke Asosiasi Petani Bawang Putih / Pasar Induk Makasar atau BUMN Pangan agar harga petani terlindungi dari permainan tengkulak.',
    icon: 'Award',
  },
];

export const PanduanBudidayaKementan: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('SEMUA');
  const [expandedCardId, setExpandedCardId] = useState<string | null>('syarat-agroekologi');
  const [activeModalItem, setActiveModalItem] = useState<PanduanItem | null>(null);

  const filteredPanduan = PANDUAN_DATA.filter((item) => {
    const matchesKategori =
      selectedKategori === 'SEMUA' || item.kategori === selectedKategori;
    const matchesSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ringkasan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poinPenting.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.tipsBhabinkamtibmas.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesKategori && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-white space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                SOP Resmi Kementan RI
              </span>
              <span className="text-[10px] text-slate-400">Direktorat Jenderal Hortikultura & Balitsa</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
              Panduan Lengkap Budidaya Bawang Putih Presisi
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Modul edukasi agronomis terpadu untuk pendampingan Bhabinkamtibmas kepada kelompok tani binaan di Kabupaten Enrekang.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Materi Terverifikasi Kementan 2024-2026</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari SOP (e.g. pupuk, fusarium, dormansi, jarak tanam)..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar text-xs">
            <button
              onClick={() => setSelectedKategori('SEMUA')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'SEMUA'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Semua Modul ({PANDUAN_DATA.length})
            </button>
            <button
              onClick={() => setSelectedKategori('SYARAT_TUMBUH')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'SYARAT_TUMBUH'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Syarat Tumbuh
            </button>
            <button
              onClick={() => setSelectedKategori('BENIH_VARIETAS')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'BENIH_VARIETAS'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Benih & Varietas
            </button>
            <button
              onClick={() => setSelectedKategori('LAHAN_MULSA')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'LAHAN_MULSA'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Lahan & Mulsa
            </button>
            <button
              onClick={() => setSelectedKategori('PEMUPUKAN_AIR')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'PEMUPUKAN_AIR'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Pupuk & Air
            </button>
            <button
              onClick={() => setSelectedKategori('HAMA_PENYAKIT')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'HAMA_PENYAKIT'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Hama & Penyakit (PHT)
            </button>
            <button
              onClick={() => setSelectedKategori('PANEN_PASCA')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedKategori === 'PANEN_PASCA'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Panen & Pascapanen
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <Mountain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Elevasi Rekomendasi</span>
              <span className="text-white font-black text-sm">800 - 1.800 mdpl</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg shrink-0">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Suhu Optimal</span>
              <span className="text-white font-black text-sm">15°C – 22°C</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Kebutuhan Benih</span>
              <span className="text-white font-black text-sm">1.0 - 1.4 Ton/Ha</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Umur Panen</span>
              <span className="text-white font-black text-sm">95 – 120 Hari</span>
            </div>
          </div>
        </div>

        {/* Modules Accordion List */}
        <div className="space-y-3">
          {filteredPanduan.length === 0 ? (
            <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Tidak ada materi SOP yang cocok dengan kata kunci "{searchTerm}".
            </div>
          ) : (
            filteredPanduan.map((item, idx) => {
              const isExpanded = expandedCardId === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-slate-950 border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'border-emerald-500/50 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header (Click to toggle) */}
                  <div
                    onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                    className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-3 hover:bg-slate-900/60 transition select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-slate-800">
                            {item.kategoriLabel}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.sumberResmi}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          {item.judul}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {item.ringkasan}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalItem(item);
                        }}
                        className="hidden sm:flex px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-semibold rounded-lg border border-slate-700 items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> Buka Penuh
                      </button>

                      <div className="p-1 text-slate-400 hover:text-white">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Card Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-900/40 border-t border-slate-800 space-y-4 text-xs">
                      {/* Summary Banner */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                        <span className="font-bold text-white block mb-1">📋 Ringkasan SOP Kementan:</span>
                        {item.ringkasan}
                      </div>

                      {/* Key Points */}
                      <div>
                        <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Poin Kunci & Parameter Standar Kementan:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.poinPenting.map((point, pIdx) => (
                            <div
                              key={pIdx}
                              className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2 text-slate-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practical Steps */}
                      <div>
                        <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Prosedur Teknis di Lapangan:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {item.langkahPraktis.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1"
                            >
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-mono">
                                  {sIdx + 1}
                                </span>
                                <span>{step.judul}</span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed pl-6.5">
                                {step.deskripsi}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bhabinkamtibmas Mentoring Tip Box */}
                      <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-xl text-slate-200 space-y-1">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Instruksi Pendampingan Bhabinkamtibmas (Actionable Advice):</span>
                        </div>
                        <p className="text-xs text-amber-200/90 leading-relaxed">
                          {item.tipsBhabinkamtibmas}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Full Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl text-white shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  {activeModalItem.kategoriLabel}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {activeModalItem.judul}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeModalItem.sumberResmi}
                </p>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 leading-relaxed">
                <h4 className="font-bold text-white mb-1.5 text-sm">Penjelasan Komprehensif:</h4>
                <p>{activeModalItem.ringkasan}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  Daftar Standar & Parameter Resmi Kementan:
                </h4>
                <ul className="space-y-2">
                  {activeModalItem.poinPenting.map((p, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5 text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  Instruksi Langkah demi Langkah:
                </h4>
                <div className="space-y-2.5">
                  {activeModalItem.langkahPraktis.map((l, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-white text-xs">
                        Langkah {idx + 1}: {l.judul}
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-2 border-l-2 border-amber-500/50">
                        {l.deskripsi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl text-slate-200 space-y-1.5">
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Panduan Khusus Pendampingan Bhabinkamtibmas:
                </div>
                <p className="leading-relaxed text-slate-300">
                  {activeModalItem.tipsBhabinkamtibmas}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                SOP Kementan RI • Presisi Agro Bawang Putih Polres Enrekang
              </span>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Tutup Modul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
