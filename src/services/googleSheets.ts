import { LaporanBudidaya } from '../types';

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

/**
 * Creates a new Google Spreadsheet with all current reports data formatted nicely.
 */
export async function createSpreadsheetWithData(
  accessToken: string,
  title: string,
  reports: LaporanBudidaya[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const headers = [
    'ID Laporan',
    'Tanggal Input',
    'Nama Bhabinkamtibmas',
    'NRP',
    'Polres',
    'Kelompok Tani',
    'Ketua Poktan',
    'HP Ketua Poktan',
    'Desa / Kelurahan',
    'Kecamatan',
    'Kabupaten',
    'Luas Lahan Total (m²)',
    'Luas Tanam (m²)',
    'Jumlah Bibit (Kg)',
    'Varietas Bawang',
    'Proyeksi Panen (Kg)',
    'Tgl Realisasi Panen',
    'Luas Panen Realisasi (m²)',
    'Hasil Panen Realisasi (Kg)',
    'Hasil Panen Realisasi (Ton)',
    'Catatan Panen',
    'Ketinggian (mdpl)',
    'Jenis Tanah',
    'Status Tanaman',
    'Status Laporan',
    'Latitude',
    'Longitude',
  ];

  const rows = reports.map((r) => [
    r.id,
    r.tanggalInput,
    r.userName,
    r.userNrp,
    r.userPolres,
    r.kelompokTani.namaKelompok,
    r.kelompokTani.ketuaKelompok,
    r.kelompokTani.noHpKetua,
    r.dataLahan.desaKelurahan,
    r.dataLahan.kecamatan,
    r.dataLahan.kabupaten,
    r.dataLahan.luasLahanTotalM2,
    r.dataLahan.luasTanamM2,
    r.dataLahan.jumlahBibitKg,
    r.dataLahan.varietasBawang || 'Great Black',
    r.dataLahan.produksiPanenKg,
    r.dataPanen?.tanggalPanen || '-',
    r.dataPanen?.luasPanenM2 || 0,
    r.dataPanen?.hasilPanenKg || 0,
    r.dataPanen ? (r.dataPanen.hasilPanenKg / 1000).toFixed(2) : 0,
    r.dataPanen?.catatanPanen || '-',
    r.dataLahan.ketinggianMdpl,
    r.dataLahan.jenisTanah,
    r.statusTanaman,
    r.status,
    r.dataLahan.latitude,
    r.dataLahan.longitude,
  ]);

  const body = {
    properties: {
      title: title || `SIPERBAWA POLRI - Rekapitulasi Budidaya Bawang Putih (${new Date().toISOString().slice(0, 10)})`,
    },
    sheets: [
      {
        properties: {
          title: 'Rekapitulasi Bawang Putih',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: headers.map((h) => ({
                  userEnteredValue: { stringValue: h },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.06, green: 0.15, blue: 0.28 }, // Navy Police Blue
                    horizontalAlignment: 'CENTER',
                  },
                })),
              },
              ...rows.map((row) => ({
                values: row.map((val) => {
                  if (typeof val === 'number') {
                    return {
                      userEnteredValue: { numberValue: val },
                    };
                  }
                  return {
                    userEnteredValue: { stringValue: String(val) },
                  };
                }),
              })),
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || 'Gagal membuat Google Spreadsheet baru'
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId || '108vYuvsrv0YgkCCDIqxcHIL6ajczi0h6AXNuEUIzeTw';
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Appends a new report row to an existing Google Spreadsheet
 */
export async function appendReportToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  report: LaporanBudidaya
): Promise<void> {
  const rowData = [
    report.id,
    report.tanggalInput,
    report.userName,
    report.userNrp,
    report.userPolres,
    report.kelompokTani.namaKelompok,
    report.kelompokTani.ketuaKelompok,
    report.kelompokTani.noHpKetua,
    report.dataLahan.desaKelurahan,
    report.dataLahan.kecamatan,
    report.dataLahan.kabupaten,
    report.dataLahan.luasLahanTotalM2,
    report.dataLahan.luasTanamM2,
    report.dataLahan.jumlahBibitKg,
    report.dataLahan.varietasBawang || 'Great Black',
    report.dataLahan.produksiPanenKg,
    report.dataPanen?.tanggalPanen || '-',
    report.dataPanen?.luasPanenM2 || 0,
    report.dataPanen?.hasilPanenKg || 0,
    report.dataPanen ? (report.dataPanen.hasilPanenKg / 1000).toFixed(2) : 0,
    report.dataPanen?.catatanPanen || '-',
    report.dataLahan.ketinggianMdpl,
    report.dataLahan.jenisTanah,
    report.statusTanaman,
    report.status,
    report.dataLahan.latitude,
    report.dataLahan.longitude,
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal menambahkan baris ke Google Sheets');
  }
}

/**
 * Searches user's Google Drive for existing spreadsheets
 */
export async function getUserSpreadsheets(
  accessToken: string
): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=20&orderBy=modifiedTime%20desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal mengambil daftar Google Sheets dari Drive');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Reads values from a Google Spreadsheet
 */
export async function readSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range = 'A1:Z100'
): Promise<string[][]> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal membaca data dari Google Sheets');
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Clears all data rows in an existing spreadsheet (keeping the header row intact)
 */
export async function clearSpreadsheetDataRows(
  accessToken: string,
  spreadsheetId: string
): Promise<void> {
  // 1. First fetch spreadsheet metadata to get the active sheet name or sheetId
  let sheetTitle = '';
  let sheetIdNumber = 0;

  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      if (metaData.sheets && metaData.sheets.length > 0) {
        sheetTitle = metaData.sheets[0].properties?.title || '';
        sheetIdNumber = metaData.sheets[0].properties?.sheetId || 0;
      }
    }
  } catch (e) {
    console.warn('Could not fetch sheet metadata, falling back to batchUpdate', e);
  }

  // 2. Perform clear using batchUpdate DeleteDimension / clear range
  const escapedTitle = sheetTitle ? `'${sheetTitle.replace(/'/g, "''")}'!` : '';
  const rangeToClear = `${escapedTitle}A2:ZZ5000`;

  const clearResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeToClear)}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );

  if (!clearResponse.ok) {
    // If range clear fails, try fallback batchUpdate to delete rows starting from index 1 (row 2)
    const batchUpdateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetIdNumber,
                  dimension: 'ROWS',
                  startIndex: 1,
                },
              },
            },
          ],
        }),
      }
    );

    if (!batchUpdateRes.ok) {
      const err = await clearResponse.json().catch(() => ({}));
      const errBatch = await batchUpdateRes.json().catch(() => ({}));
      throw new Error(
        err.error?.message ||
          errBatch.error?.message ||
          'Gagal mengosongkan data di Google Sheets. Pastikan akun Google memiliki izin edit pada file ini.'
      );
    }
  }
}
