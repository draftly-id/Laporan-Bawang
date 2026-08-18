import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Send,
  LogOut,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LaporanBudidaya } from '../../types';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../../services/googleAuth';
import {
  createSpreadsheetWithData,
  appendReportToSpreadsheet,
  getUserSpreadsheets,
  readSpreadsheetValues,
  clearSpreadsheetDataRows,
  GoogleDriveFile,
} from '../../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: LaporanBudidaya[];
}

export const GoogleSheetsIntegrationModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  reports,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Spreadsheet Creation / Selection State
  const [customTitle, setCustomTitle] = useState('');
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);
  const [createdSheetId, setCreatedSheetId] = useState<string | null>(null);

  // Existing Drive Files State
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        fetchDriveFiles(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setSuccessMsg(`Berhasil terhubung dengan Google Account (${result.user.email})`);
        fetchDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan autentikasi Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setCreatedSheetUrl(null);
    setCreatedSheetId(null);
    setDriveFiles([]);
  };

  const fetchDriveFiles = async (authToken?: string) => {
    const activeToken = authToken || token || (await getAccessToken());
    if (!activeToken) return;

    setIsLoadingFiles(true);
    try {
      const files = await getUserSpreadsheets(activeToken);
      setDriveFiles(files);
      if (files.length > 0 && !selectedFileId) {
        setSelectedFileId(files[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNewSheet = async () => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setError('Silakan Login dengan Google terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const title =
        customTitle.trim() ||
        `SIPERBAWA POLRI - Rekapitulasi Bawang Putih (${new Date().toISOString().slice(0, 10)})`;
      const result = await createSpreadsheetWithData(activeToken, title, reports);

      setCreatedSheetId(result.spreadsheetId);
      setCreatedSheetUrl(result.spreadsheetUrl);
      setSuccessMsg(`Google Spreadsheet baru berhasil dibuat dan disimpan di Google Drive Anda!`);
      fetchDriveFiles(activeToken);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat Google Spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToSelectedSheet = async () => {
    if (!selectedFileId) {
      setError('Pilih Google Sheet dari daftar terlebih dahulu.');
      return;
    }

    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setError('Silakan Login dengan Google terlebih dahulu.');
      return;
    }

    const targetFile = driveFiles.find((f) => f.id === selectedFileId);

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      for (const report of reports) {
        await appendReportToSpreadsheet(activeToken, selectedFileId, report);
      }
      setSuccessMsg(
        `Berhasil menyinkronkan ${reports.length} laporan ke spreadsheet "${targetFile?.name}".`
      );
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan data ke Google Sheet yang dipilih.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelectedSheet = async () => {
    if (!selectedFileId) {
      setError('Pilih Google Sheet dari daftar terlebih dahulu.');
      return;
    }

    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setError('Silakan Login dengan Google terlebih dahulu.');
      return;
    }

    const targetFile = driveFiles.find((f) => f.id === selectedFileId);

    if (
      !window.confirm(
        `Apakah Anda yakin ingin MENGOSONGKAN seluruh baris data pada spreadsheet "${targetFile?.name || selectedFileId}"? Baris judul header akan tetap dipertahankan.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await clearSpreadsheetDataRows(activeToken, selectedFileId, 'A2:Z1000');
      setSuccessMsg(
        `Berhasil mengosongkan seluruh baris data pada spreadsheet "${targetFile?.name}".`
      );
    } catch (err: any) {
      setError(err.message || 'Gagal mengosongkan data pada Google Sheet yang dipilih.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl text-white shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Integrasi Google Sheets & Drive</h3>
              <p className="text-xs text-slate-400">
                Ekspor, sinkronisasi, dan olah rekapitulasi data lahan secara real-time
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

        {/* Modal Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Auth Bar */}
          {!user ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Hubungkan Akun Google Anda</h4>
                <p className="text-slate-400 mt-0.5">
                  Otorisasi akses Google Drive & Sheets untuk mengekspor rekapitulasi laporan Bhabinkamtibmas langsung ke akun Anda.
                </p>
              </div>

              {/* Official Google Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl shadow transition text-xs mx-auto border border-slate-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoading ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{user.displayName || 'Google Account'}</span>
                    <span className="px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-700/60 font-semibold">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Putus Koneksi
              </button>
            </div>
          )}

          {/* Alert Error / Success */}
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action 1: Create New Google Sheet */}
          {user && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-400" /> 1. Buat Google Spreadsheet Baru (Instant Export)
                </h4>
                <span className="text-[10px] text-amber-400 font-mono">
                  {reports.length} Laporan Siap Diekspor
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-400">Judul Spreadsheet (Opsional):</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`SIPERBAWA POLRI - Rekapitulasi Bawang Putih (${new Date().toISOString().slice(0, 10)})`}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleCreateNewSheet}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isLoading ? 'Sedang Memproses...' : 'Buat Spreadsheet Baru di Drive'}</span>
                </button>

                {createdSheetUrl && (
                  <a
                    href={createdSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg flex items-center gap-1.5 shadow"
                  >
                    <span>Buka di Google Sheets</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action 2: Existing Google Sheets from Drive */}
          {user && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-sky-400" /> 2. Pilih Google Sheet yang Sudah Ada di Drive
                </h4>

                <button
                  onClick={() => fetchDriveFiles()}
                  disabled={isLoadingFiles}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Refresh daftar file"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {driveFiles.length === 0 ? (
                <p className="text-slate-500 italic">
                  {isLoadingFiles
                    ? 'Sedang memuat file dari Google Drive...'
                    : 'Belum ada Google Spreadsheet ditemukan di Google Drive Anda.'}
                </p>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedFileId}
                    onChange={(e) => setSelectedFileId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 focus:border-sky-500 focus:outline-none"
                  >
                    {driveFiles.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name} (Terakhir diubah: {file.modifiedTime?.slice(0, 10)})
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncToSelectedSheet}
                        disabled={isLoading || !selectedFileId}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg flex items-center gap-2 shadow"
                      >
                        <Send className="w-4 h-4" />
                        <span>Sinkronkan Data ke Sheet Ini</span>
                      </button>

                      <button
                        onClick={handleClearSelectedSheet}
                        disabled={isLoading || !selectedFileId}
                        className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold rounded-lg flex items-center gap-1.5 shadow"
                        title="Kosongkan semua baris data di spreadsheet ini"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>Kosongkan Isi Spreadsheet</span>
                      </button>
                    </div>

                    {selectedFileId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${selectedFileId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Pratinjau File</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
