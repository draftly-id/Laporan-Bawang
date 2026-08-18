import { PredictiveAnalysisInput, PredictiveAnalysisResult } from '../types';

export function calculateGarlicYieldPrediction(
  input: PredictiveAnalysisInput
): PredictiveAnalysisResult {
  const {
    luasTanamM2,
    ketinggianMdpl,
    jenisTanah,
    jenisIrigasi,
    curahHujanMmBulan,
    jumlahBibitKg,
    varietasBawang,
    kabupaten,
  } = input;

  // Base expected yield: 0.9 kg/m2 (or 9 Ton/Hektar)
  const baseYieldPerM2 = 0.9;

  // 1. Ketinggian Factor
  let factorKetinggianVal = 1.0;
  let labelKetinggian = 'Cukup Baik';
  if (ketinggianMdpl >= 800 && ketinggianMdpl <= 1300) {
    factorKetinggianVal = 1.18;
    labelKetinggian = `Sangat Optimal (${ketinggianMdpl} mdpl - Suhu Dingin Ideal)`;
  } else if (ketinggianMdpl >= 600 && ketinggianMdpl < 800) {
    factorKetinggianVal = 0.92;
    labelKetinggian = `Cukup (${ketinggianMdpl} mdpl - Potensi Pembentukan Umbi Sedang)`;
  } else if (ketinggianMdpl > 1300) {
    factorKetinggianVal = 0.98;
    labelKetinggian = `Tinggi (${ketinggianMdpl} mdpl - Siklus Pertumbuhan Lebih Lama)`;
  } else {
    factorKetinggianVal = 0.60;
    labelKetinggian = `Kurang Ideal (<600 mdpl - Perlu Varietas Dataran Rendah)`;
  }

  // 2. Tanah Factor
  let factorTanahVal = 1.0;
  let labelTanah = 'Latosol Cokelat';
  if (jenisTanah.includes('Andosol')) {
    factorTanahVal = 1.15;
    labelTanah = 'Andosol Vulkanik (Sangat Subur & Solum Dalam)';
  } else if (jenisTanah.includes('Latosol')) {
    factorTanahVal = 1.0;
    labelTanah = 'Latosol (Aerasi Cukup & Struktur Baik)';
  } else if (jenisTanah.includes('Regosol')) {
    factorTanahVal = 0.90;
    labelTanah = 'Regosol Vulkanik (Perlu Tambahan Bahan Organik High)';
  } else {
    factorTanahVal = 0.85;
    labelTanah = 'Aluvial (Drainase Perlu Diperhatikan)';
  }

  // 3. Irigasi Factor
  let factorIrigasiVal = 1.0;
  let labelIrigasi = 'Normal';
  if (jenisIrigasi.includes('Perpipaan') || jenisIrigasi.includes('Teknis')) {
    factorIrigasiVal = 1.12;
    labelIrigasi = 'Irigasi Teknis Kontinu (Pasokan Air Terjamin)';
  } else if (jenisIrigasi.includes('Mata Air')) {
    factorIrigasiVal = 1.10;
    labelIrigasi = 'Mata Air Pegunungan Segar';
  } else if (jenisIrigasi.includes('Pompa')) {
    factorIrigasiVal = 0.95;
    labelIrigasi = 'Pompa Air (Tergantung Ketersediaan Bahan Bakar/Listrik)';
  } else {
    factorIrigasiVal = 0.72;
    labelIrigasi = 'Tadah Hujan (Rentan Kekeringan saat Pembentukan Umbi)';
  }

  // 4. Iklim Factor
  let factorIklimVal = 1.0;
  let labelIklim = 'Normal';
  if (curahHujanMmBulan >= 100 && curahHujanMmBulan <= 220) {
    factorIklimVal = 1.08;
    labelIklim = `Ideal (${curahHujanMmBulan} mm/bln - Kelembaban Terkontrol)`;
  } else if (curahHujanMmBulan > 220 && curahHujanMmBulan <= 320) {
    factorIklimVal = 0.88;
    labelIklim = `Tinggi (${curahHujanMmBulan} mm/bln - Waspada Hama Bercak Ungu/Bakteri)`;
  } else if (curahHujanMmBulan > 320) {
    factorIklimVal = 0.70;
    labelIklim = `Sangat Tinggi (${curahHujanMmBulan} mm/bln - Risiko Busuk Umbi/Layum)`;
  } else {
    factorIklimVal = 0.82;
    labelIklim = `Cenderung Kering (${curahHujanMmBulan} mm/bln - Perlu Tambahan Mulsa & Gembor)`;
  }

  // Composite Multiplier
  const totalMultiplier =
    factorKetinggianVal * factorTanahVal * factorIrigasiVal * factorIklimVal;

  // Expected Yield calculation
  const expectedYieldKg = Math.round(luasTanamM2 * baseYieldPerM2 * totalMultiplier);
  const minYieldKg = Math.round(expectedYieldKg * 0.82);
  const maxYieldKg = Math.round(expectedYieldKg * 1.22);

  // Productivity per Ha (1 Ha = 10,000 m2)
  const produktivitasTonPerHa = Number(
    ((expectedYieldKg / (luasTanamM2 || 1)) * 10).toFixed(2)
  );

  // Kategori Performa
  let kategoriPerforma: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perhatian' = 'Baik';
  if (produktivitasTonPerHa >= 11) {
    kategoriPerforma = 'Sangat Baik';
  } else if (produktivitasTonPerHa >= 8.5) {
    kategoriPerforma = 'Baik';
  } else if (produktivitasTonPerHa >= 6.0) {
    kategoriPerforma = 'Cukup';
  } else {
    kategoriPerforma = 'Perlu Perhatian';
  }

  // Confidence Score (%)
  let confidenceScorePercent = 75;
  if (ketinggianMdpl > 0 && luasTanamM2 > 0) confidenceScorePercent += 10;
  if (jumlahBibitKg > 0) confidenceScorePercent += 5;
  if (jenisTanah && jenisIrigasi) confidenceScorePercent += 8;
  confidenceScorePercent = Math.min(98, confidenceScorePercent);

  // Recommendations Generation
  const rekomendasiAgronomis: string[] = [];

  // Seed & density checks
  if (jumlahBibitKg > 0 && luasTanamM2 > 0) {
    const idealSeedKg = Math.round((luasTanamM2 / 10000) * 1200); // ~1.2 Ton per Ha
    if (jumlahBibitKg < idealSeedKg * 0.7) {
      rekomendasiAgronomis.push(
        `Kebutuhan bibit (${jumlahBibitKg} kg) tampak di bawah standar ideal (~${Math.round(
          idealSeedKg
        )} kg untuk ${luasTanamM2} m²). Disarankan merapatkan jarak tanam 15x15 cm.`
      );
    } else {
      rekomendasiAgronomis.push(
        `Dosis bibit sudah proporsional untuk luas tanam ${luasTanamM2} m².`
      );
    }
  }

  // Soil & Fertilization advice
  if (jenisTanah.includes('Andosol')) {
    rekomendasiAgronomis.push(
      'Tanah Andosol: Berikan pupuk kandang matang 15-20 Ton/Ha & pupuk dasar NPK 15-15-15 (300 kg/Ha) serta tambahan Sulfur (Za/Gipsum) untuk ketajaman aroma umbi.'
    );
  } else {
    rekomendasiAgronomis.push(
      'Aplikasi pupuk organik kasgot/kompos matang 20 Ton/Ha dan tambahkan Kapur Dolomit jika pH tanah di bawah 6.0.'
    );
  }

  // Climate/Altitude specific advice
  if (curahHujanMmBulan > 220) {
    rekomendasiAgronomis.push(
      'Curah hujan cukup tinggi: Tingkatkan bedengan hingga 40-50 cm, aplikasikan fungisida bahan aktif Mankozeb/Karbendazim secara berkala untuk mencegah penyakit Layu Fusarium & Stemphylium.'
    );
  } else {
    rekomendasiAgronomis.push(
      'Pengairan rutin 2-3 hari sekali pada fase pembentukan umbi (40-75 HST). Hentikan pengairan 10 hari sebelum panen agar umbi lebih tahan simpan.'
    );
  }

  if (ketinggianMdpl < 800) {
    rekomendasiAgronomis.push(
      'Gunakan mulsa plastik hitam perak (MPHP) untuk menekan suhu tanah dan mengurangi paparan sinar matahari langsung di siang hari.'
    );
  } else {
    rekomendasiAgronomis.push(
      'Lokasi pegunungan sangat ideal. Pastikan penjemuran umbi pasca panen (curing) dilakukan 10-14 hari di gubuk penjemuran bertingkat.'
    );
  }

  return {
    estimasiPanenMinKg: minYieldKg,
    estimasiPanenExpectedKg: expectedYieldKg,
    estimasiPanenMaxKg: maxYieldKg,
    produktivitasTonPerHa,
    kategoriPerforma,
    confidenceScorePercent,
    faktorFaktor: {
      faktorKetinggian: { score: factorKetinggianVal, label: labelKetinggian },
      faktorTanah: { score: factorTanahVal, label: labelTanah },
      faktorIrigasi: { score: factorIrigasiVal, label: labelIrigasi },
      faktorIklim: { score: factorIklimVal, label: labelIklim },
    },
    rekomendasiAgronomis,
    cuacaKondisiSaatIni: {
      suhuC: ketinggianMdpl > 1000 ? 18 : ketinggianMdpl > 700 ? 22 : 28,
      kelembabanPercent: curahHujanMmBulan > 200 ? 82 : 68,
      statusCuaca: curahHujanMmBulan > 250 ? 'Hujan Ringan - Sedang' : 'Cerah Berawan',
    },
  };
}
