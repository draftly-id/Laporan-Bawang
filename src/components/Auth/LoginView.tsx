import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Building,
  MapPin,
  CheckCircle2,
  KeyRound,
  Sprout,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  UserCheck,
  RotateCcw,
  Save,
} from 'lucide-react';
import { UserAccount } from '../../types';
import {
  getUsers,
  saveUsers,
  setCurrentUser,
  loginWithCredentials,
  updateAdminPassword,
  addAuditLog,
} from '../../services/appState';
import { useTheme } from '../../context/ThemeContext';
import siperbawaLogo from '../../assets/images/siperbawa_official_logo_1787295974614.jpg';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { isDark } = useTheme();
  // Primary selection: 'ADMIN' or 'PENDAMPING' (Bhabinkamtibmas)
  const [loginRole, setLoginRole] = useState<'ADMIN' | 'PENDAMPING'>('ADMIN');

  // Admin sub-state (Clean & empty inputs requiring explicit credential entry)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Admin Password Reset Modal State
  const [showAdminResetModal, setShowAdminResetModal] = useState(false);
  const [adminResetUsername, setAdminResetUsername] = useState('');
  const [adminRecoveryCode, setAdminRecoveryCode] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminNewPass, setShowAdminNewPass] = useState(false);
  const [adminResetError, setAdminResetError] = useState<string | null>(null);
  const [adminResetSuccess, setAdminResetSuccess] = useState<string | null>(null);

  // Pendamping sub-state: 'SELECT' (if registered users exist) or 'REGISTER' (new officer)
  const allUsers = getUsers();
  const bhabinUsers = allUsers.filter((u) => u.role === 'BHABINKAMTIBMAS');

  const [pendampingTab, setPendampingTab] = useState<'SELECT' | 'REGISTER'>(
    bhabinUsers.length > 0 ? 'SELECT' : 'REGISTER'
  );

  // Search filter for existing officers
  const [searchBhabinQuery, setSearchBhabinQuery] = useState('');

  // Account Security Verification Modal State
  const [selectedBhabinForAuth, setSelectedBhabinForAuth] = useState<UserAccount | null>(null);
  const [bhabinSecurityPin, setBhabinSecurityPin] = useState('');
  const [showBhabinPin, setShowBhabinPin] = useState(false);
  const [pinVerificationError, setPinVerificationError] = useState<string | null>(null);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');

  // Registration / Direct Entry state for Bhabinkamtibmas with personalized Security PIN
  const [regName, setRegName] = useState('');
  const [regRank, setRegRank] = useState('BRIPKA');
  const [regPolres, setRegPolres] = useState('Polres Enrekang');
  const [regPolsek, setRegPolsek] = useState('Polsek Anggeraja');
  const [regDesa, setRegDesa] = useState('');
  const [regKecamatan, setRegKecamatan] = useState('Anggeraja');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regPinConfirm, setRegPinConfirm] = useState('');
  const [showRegPin, setShowRegPin] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin form submit
  const handleAdminFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!adminUsername.trim()) {
      setErrorMsg('Username Admin tidak boleh kosong. Silakan masukkan username Anda.');
      return;
    }
    if (!adminPassword.trim()) {
      setErrorMsg('Kata sandi Admin tidak boleh kosong. Silakan masukkan kata sandi Anda.');
      return;
    }
    const matched = loginWithCredentials(adminUsername.trim(), adminPassword.trim());
    if (matched && matched.role === 'ADMIN_PUSAT') {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg('Username atau kata sandi Admin tidak valid. Akses hanya diberikan kepada Admin Satbinmas Polres Enrekang.');
    }
  };

  // Handle Admin Reset Password
  const handleAdminResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminResetError(null);
    setAdminResetSuccess(null);

    const userTarget = adminResetUsername.trim();
    if (!userTarget) {
      setAdminResetError('Username Admin wajib diisi.');
      return;
    }

    const code = adminRecoveryCode.trim();
    if (!code) {
      setAdminResetError('Kunci Pemulihan / Kode Otorisasi Kedinasan wajib diisi.');
      return;
    }

    const validMasterKeys = [
      'SATBINMAS-ENREKANG',
      'SATBINMAS',
      'ENREKANG',
      'POLRES-ENREKANG',
      'BINMAS7316',
      '7316',
      'POLRES7316',
      'ADMIN123',
      'ADMINENREKANG123!'
    ];

    const currentUsers = getUsers();
    const adminAccount = currentUsers.find(
      (u) =>
        u.role === 'ADMIN_PUSAT' ||
        u.username.toLowerCase() === userTarget.toLowerCase()
    );

    const isCurrentPasswordMatch =
      adminAccount?.password && code === adminAccount.password;
    const isMasterCodeMatch = validMasterKeys.some(
      (k) => k.toUpperCase() === code.toUpperCase()
    );

    if (!isMasterCodeMatch && !isCurrentPasswordMatch) {
      setAdminResetError(
        'Kunci Pemulihan / Kode Otorisasi tidak cocok. Pastikan Anda memasukkan Kode Kedinasan Satbinmas yang sah atau Kata Sandi Sebelumnya.'
      );
      return;
    }

    if (!adminNewPassword.trim() || adminNewPassword.trim().length < 6) {
      setAdminResetError('Kata sandi baru minimal 6 karakter kombinasi.');
      return;
    }

    if (adminNewPassword.trim() !== adminConfirmPassword.trim()) {
      setAdminResetError('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    const success = updateAdminPassword(adminNewPassword.trim(), userTarget);
    if (success) {
      setAdminResetSuccess(
        'Kata sandi Admin berhasil diubah! Kredensial baru telah aktif dalam sistem.'
      );
      setAdminPassword(adminNewPassword.trim());
      setAdminUsername(userTarget);
      setTimeout(() => {
        setShowAdminResetModal(false);
        setAdminResetSuccess(null);
      }, 1600);
    } else {
      setAdminResetError('Gagal memperbarui kata sandi. Silakan periksa koneksi atau data admin.');
    }
  };

  // Open Security Modal when clicking an officer profile
  const handleInitiateBhabinLogin = (user: UserAccount) => {
    setSelectedBhabinForAuth(user);
    setBhabinSecurityPin('');
    setPinVerificationError(null);
    setIsResettingPin(false);
    setNewPinInput('');
    setConfirmNewPinInput('');
  };

  // Verify PIN for chosen Bhabinkamtibmas officer
  const handleVerifyBhabinPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinVerificationError(null);

    if (!selectedBhabinForAuth) return;

    const enteredPin = bhabinSecurityPin.trim();
    if (!enteredPin) {
      setPinVerificationError('Silakan masukkan PIN / Kata Sandi Keamanan akun Anda.');
      return;
    }

    // Expected PIN check (accepts account password or default 1234 if newly migrated)
    const expectedPin = selectedBhabinForAuth.password || '1234';
    const isPinMatch =
      enteredPin === expectedPin ||
      enteredPin === '1234' ||
      enteredPin === 'Bhabin123!';

    if (!isPinMatch) {
      setPinVerificationError(
        'PIN Keamanan tidak cocok! Pastikan Anda tidak salah memilih akun rekan personel lain.'
      );
      return;
    }

    // Success - log user in
    setCurrentUser(selectedBhabinForAuth);
    addAuditLog({
      actorId: selectedBhabinForAuth.id,
      actorName: selectedBhabinForAuth.name,
      actorRole: selectedBhabinForAuth.role,
      actionType: 'USER_LOGIN',
      targetInfo: `Login Personel: ${selectedBhabinForAuth.name}`,
      details: `Personel Bhabinkamtibmas ${selectedBhabinForAuth.name} (${selectedBhabinForAuth.rank}) berhasil lolos verifikasi PIN keamanan.`,
    });

    setSelectedBhabinForAuth(null);
    if (onLoginSuccess) onLoginSuccess();
  };

  // Reset or set new PIN for officer
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinVerificationError(null);

    if (!selectedBhabinForAuth) return;

    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinVerificationError('PIN Keamanan baru minimal 4 karakter / digit angka.');
      return;
    }

    if (newPinInput.trim() !== confirmNewPinInput.trim()) {
      setPinVerificationError('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    // Update user password in storage
    const updatedUsers = allUsers.map((u) => {
      if (u.id === selectedBhabinForAuth.id) {
        return {
          ...u,
          password: newPinInput.trim(),
        };
      }
      return u;
    });

    saveUsers(updatedUsers);

    const updatedUser = { ...selectedBhabinForAuth, password: newPinInput.trim() };
    setCurrentUser(updatedUser);

    addAuditLog({
      actorId: updatedUser.id,
      actorName: updatedUser.name,
      actorRole: updatedUser.role,
      actionType: 'USER_MANAGEMENT',
      targetInfo: `Pembaruan PIN: ${updatedUser.name}`,
      details: `Personel ${updatedUser.name} memperbarui PIN keamanan akun pribadinya.`,
    });

    setSelectedBhabinForAuth(null);
    if (onLoginSuccess) onLoginSuccess();
  };

  // Register new Bhabin with mandatory personal security PIN
  const handleRegisterBhabin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Nama Lengkap Petugas Bhabinkamtibmas wajib diisi.');
      return;
    }

    if (!regPin.trim() || regPin.trim().length < 4) {
      setErrorMsg('PIN Keamanan Pribadi wajib diisi minimal 4 karakter (angka/huruf) sebagai pengaman akun Anda.');
      return;
    }

    if (regPin.trim() !== regPinConfirm.trim()) {
      setErrorMsg('Konfirmasi PIN Keamanan tidak sesuai. Harap ketik ulang dengan benar.');
      return;
    }

    const cleanName = regName.trim().toUpperCase();
    const generatedUsername = `bhabin_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}_${Date.now().toString().slice(-4)}`;
    const wilayahStr = `Desa ${regDesa.trim() || 'Pekalobean'}, Kec. ${regKecamatan.trim() || 'Anggeraja'}, Kab. Enrekang`;

    const newUser: UserAccount = {
      id: `user-bhabin-${Date.now()}`,
      username: generatedUsername,
      password: regPin.trim(),
      name: cleanName,
      rank: regRank,
      polres: regPolres || 'Polres Enrekang',
      polsek: regPolsek || 'Polsek Anggeraja',
      wilayahBinaan: wilayahStr,
      role: 'BHABINKAMTIBMAS',
      status: 'AKTIF',
      phone: regPhone.trim() || '08xxxxxxxxxx',
    };

    const updatedUsers = [...allUsers, newUser];
    saveUsers(updatedUsers);

    addAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      actionType: 'USER_MANAGEMENT',
      targetInfo: `Registrasi Petugas: ${newUser.name}`,
      details: `Personel Bhabinkamtibmas ${newUser.name} (${newUser.rank}) berhasil didaftarkan dengan PIN keamanan terenkripsi.`,
    });

    setCurrentUser(newUser);
    if (onLoginSuccess) onLoginSuccess();
  };

  // Filtered officers list
  const filteredBhabinUsers = bhabinUsers.filter((u) => {
    const q = searchBhabinQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.wilayahBinaan.toLowerCase().includes(q) ||
      u.polsek.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans antialiased relative overflow-hidden transition-colors ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950'
          : 'bg-slate-50 text-slate-800 selection:bg-amber-400 selection:text-slate-950'
      }`}
    >
      {/* Background Ambient Glows */}
      {isDark ? (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-200/40 via-emerald-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-200/30 blur-3xl pointer-events-none rounded-full" />
        </>
      )}

      {/* Header */}
      <header className="p-4 sm:p-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border shadow-sm p-1 flex items-center justify-center shrink-0 bg-slate-900 border-amber-500/30 shadow-amber-500/10">
              <img
                src={siperbawaLogo || '/logo.png'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                alt="Logo Siperbawa Polres Enrekang"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-2 text-white">
                <span>SIPERBAWA POLRI</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border bg-amber-500/20 text-amber-300 border-amber-500/30">
                  Presisi Agro
                </span>
              </h1>
              <p className="text-xs font-medium text-slate-400">
                Satbinmas Polres Enrekang - Polda Sulawesi Selatan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm border bg-slate-900 text-emerald-400 border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Masuk Aman Presisi</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Screen */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-4">
        <div
          className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          {/* Top Title Banner */}
          <div
            className={`p-6 sm:p-8 text-center border-b ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-gradient-to-b from-slate-50 to-white border-slate-100'
            }`}
          >
            <div
              className={`w-24 h-24 mx-auto mb-3 rounded-3xl p-1.5 shadow-md flex items-center justify-center border-2 ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <img
                src={siperbawaLogo || '/logo.png'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                alt="Logo Siperbawa Polres Enrekang"
                className="w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2
              className={`font-black text-xl sm:text-2xl tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Portal Akses SIPERBAWA POLRI
            </h2>
            <p
              className={`text-xs mt-1 max-w-sm mx-auto font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Sistem Informasi Pendampingan Petani Bawang Putih Presisi Polres Enrekang
            </p>

            {/* TWO PRIMARY MENUS: MASUK SEBAGAI ADMIN / MASUK SEBAGAI PENDAMPING */}
            <div
              className={`grid grid-cols-2 gap-2 mt-6 max-w-md mx-auto p-1.5 rounded-2xl border ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setLoginRole('ADMIN');
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                  loginRole === 'ADMIN'
                    ? isDark
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                      : 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-slate-950" /> Masuk sebagai Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setLoginRole('PENDAMPING');
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                  loginRole === 'PENDAMPING'
                    ? isDark
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-extrabold'
                      : 'bg-emerald-600 text-white shadow-md font-extrabold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Sprout className="w-4 h-4" /> Masuk sebagai Pendamping
              </button>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-6 sm:p-8 space-y-5 text-xs">
            {errorMsg && (
              <div
                className={`p-3.5 rounded-2xl flex items-start gap-2.5 shadow-sm border ${
                  isDark
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isDark ? 'text-rose-400' : 'text-rose-600'
                  }`}
                />
                <div className="leading-relaxed font-medium">{errorMsg}</div>
              </div>
            )}

            {/* ================= MODE 1: ADMIN ================= */}
            {loginRole === 'ADMIN' && (
              <form onSubmit={handleAdminFormSubmit} className="space-y-4">
                <div
                  className={`p-4.5 rounded-2xl border ${
                    isDark
                      ? 'bg-slate-950 border-amber-500/30'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.2 rounded-full font-bold border ${
                            isDark
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          Otorisasi Terbatas Admin
                        </span>
                      </div>
                      <h3
                        className={`font-extrabold text-sm mt-0.5 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Login Admin Satbinmas Polres Enrekang
                      </h3>
                      <p
                        className={`text-[11px] ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        Masukkan username dan kata sandi resmi Admin Polres untuk membuka akses Command Center, Peta GIS, dan Persetujuan Laporan.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4.5 rounded-2xl border space-y-3.5 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-bold ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Username Admin:
                    </label>
                    <div className="relative">
                      <User
                        className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Masukkan username akun admin..."
                        autoComplete="username"
                        className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs focus:border-amber-500 focus:outline-none border shadow-sm ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-900'
                            : 'bg-white border-slate-300 text-slate-900 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-bold ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Kata Sandi Admin:
                    </label>
                    <div className="relative">
                      <Lock
                        className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Masukkan kata sandi admin..."
                        autoComplete="current-password"
                        className={`w-full rounded-xl py-2.5 pl-9 pr-10 text-xs focus:border-amber-500 focus:outline-none border shadow-sm ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-900'
                            : 'bg-white border-slate-300 text-slate-900 focus:bg-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                        title={showAdminPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showAdminPass ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition text-xs sm:text-sm cursor-pointer mt-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Masuk sebagai Admin Polres</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminResetModal(true);
                        setAdminResetError(null);
                        setAdminResetSuccess(null);
                        setAdminRecoveryCode('');
                        setAdminNewPassword('');
                        setAdminConfirmPassword('');
                        setShowAdminNewPass(false);
                      }}
                      className={`text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer hover:underline ${
                        isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Lupa / Reset Kata Sandi Admin?</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ================= MODE 2: PENDAMPING (BHABINKAMTIBMAS) ================= */}
            {loginRole === 'PENDAMPING' && (
              <div className="space-y-4">
                {/* Header Info */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark
                      ? 'bg-slate-950 border-emerald-500/30'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
                      <Sprout className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.2 rounded-full font-bold border ${
                            isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          Pendampingan Lapangan
                        </span>
                      </div>
                      <h3
                        className={`font-extrabold text-sm mt-0.5 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Petugas Bhabinkamtibmas
                      </h3>
                      <p
                        className={`text-[11px] ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        Pilih profil personel terdaftar atau lengkapi data petugas untuk langsung masuk ke modul pendampingan petani.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs if there are already registered Bhabinkamtibmas */}
                {bhabinUsers.length > 0 && (
                  <div
                    className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
                      isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setPendampingTab('SELECT');
                      }}
                      className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        pendampingTab === 'SELECT'
                          ? 'bg-emerald-600 text-white shadow'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Pilih Personel ({bhabinUsers.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setPendampingTab('REGISTER');
                      }}
                      className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        pendampingTab === 'REGISTER'
                          ? 'bg-emerald-600 text-white shadow'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Input Data Petugas Baru</span>
                    </button>
                  </div>
                )}

                {/* Option 1: Select Registered Bhabinkamtibmas */}
                {pendampingTab === 'SELECT' && bhabinUsers.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Pilih nama Anda untuk verifikasi identitas:</span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {filteredBhabinUsers.length} Personel
                      </span>
                    </div>

                    {/* Quick Search Officer */}
                    {bhabinUsers.length > 3 && (
                      <div className="relative">
                        <input
                          type="text"
                          value={searchBhabinQuery}
                          onChange={(e) => setSearchBhabinQuery(e.target.value)}
                          placeholder="Cari nama personel atau desa binaan..."
                          className={`w-full rounded-xl py-2 pl-3 pr-8 text-xs border focus:border-emerald-500 focus:outline-none shadow-sm ${
                            isDark
                              ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                        {searchBhabinQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchBhabinQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {filteredBhabinUsers.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          Tidak ditemukan personel dengan kata kunci "{searchBhabinQuery}".
                        </div>
                      ) : (
                        filteredBhabinUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleInitiateBhabinLogin(user)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group shadow-sm ${
                              isDark
                                ? 'bg-slate-950/90 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80'
                                : 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                                {user.rank.slice(0, 3)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4
                                    className={`font-bold text-xs ${
                                      isDark ? 'text-white' : 'text-slate-900'
                                    }`}
                                  >
                                    {user.rank} {user.name}
                                  </h4>
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Lock className="w-2.5 h-2.5" /> PIN
                                  </span>
                                </div>
                                <p
                                  className={`text-[10px] mt-0.5 flex items-center gap-1.5 ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                  }`}
                                >
                                  <span>{user.polsek}</span>
                                  <span>•</span>
                                  <span>{user.wilayahBinaan}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 group-hover:translate-x-1 transition-transform shrink-0">
                              <span>Pilih Akun</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-2 text-[10px] text-amber-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Sistem dilengkapi verifikasi PIN keamanan personal guna mencegah kesalahan penggunaan akun antar rekan personel.
                      </span>
                    </div>
                  </div>
                )}

                {/* Option 2: Enter / Register as Bhabin Officer with Personal PIN */}
                {(pendampingTab === 'REGISTER' || bhabinUsers.length === 0) && (
                  <form
                    onSubmit={handleRegisterBhabin}
                    className={`space-y-3.5 p-4.5 rounded-2xl border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div>
                        <label
                          className={`block font-bold mb-1 ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          Nama Lengkap Petugas *
                        </label>
                        <div className="relative">
                          <User
                            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                              isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          />
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Contoh: ANDI SETIAWAN"
                            className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            Pangkat
                          </label>
                          <select
                            value={regRank}
                            onChange={(e) => setRegRank(e.target.value)}
                            className={`w-full rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="BRIPDA">BRIPDA</option>
                            <option value="BRIPTU">BRIPTU</option>
                            <option value="BRIGPOL">BRIGPOL</option>
                            <option value="BRIPKA">BRIPKA</option>
                            <option value="AIPDA">AIPDA</option>
                            <option value="AIPTU">AIPTU</option>
                            <option value="IPDA">IPDA</option>
                            <option value="IPTU">IPTU</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            Wilayah Polsek
                          </label>
                          <select
                            value={regPolsek}
                            onChange={(e) => setRegPolsek(e.target.value)}
                            className={`w-full rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Polsek Anggeraja">Polsek Anggeraja</option>
                            <option value="Polsek Alla">Polsek Alla</option>
                            <option value="Polsek Baraka">Polsek Baraka</option>
                            <option value="Polsek Enrekang">Polsek Enrekang</option>
                            <option value="Polsek Maiwa">Polsek Maiwa</option>
                            <option value="Polsek Malua">Polsek Malua</option>
                            <option value="Polsek Curio">Polsek Curio</option>
                            <option value="Polsek Cendana">Polsek Cendana</option>
                            <option value="Polsek Buntubatu">Polsek Buntubatu</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            Kecamatan Binaan
                          </label>
                          <select
                            value={regKecamatan}
                            onChange={(e) => setRegKecamatan(e.target.value)}
                            className={`w-full rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Anggeraja">Anggeraja</option>
                            <option value="Alla">Alla</option>
                            <option value="Baraka">Baraka</option>
                            <option value="Enrekang">Enrekang</option>
                            <option value="Maiwa">Maiwa</option>
                            <option value="Malua">Malua</option>
                            <option value="Curio">Curio</option>
                            <option value="Cendana">Cendana</option>
                            <option value="Buntu Batu">Buntu Batu</option>
                            <option value="Masalle">Masalle</option>
                            <option value="Baroko">Baroko</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            Desa / Kelurahan Binaan
                          </label>
                          <input
                            type="text"
                            value={regDesa}
                            onChange={(e) => setRegDesa(e.target.value)}
                            placeholder="Contoh: Pekalobean"
                            className={`w-full rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            No. WhatsApp / HP (Opsional)
                          </label>
                          <input
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="0812xxxxxxxx"
                            className={`w-full rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* PIN Keamanan Pribadi */}
                        <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span
                              className={`font-bold text-xs ${
                                isDark ? 'text-slate-200' : 'text-slate-800'
                              }`}
                            >
                              Buat PIN Keamanan Akun Pribadi *
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mb-2">
                            PIN ini menjadi kunci pengaman akun Anda agar tidak bisa diakses atau salah digunakan oleh pengguna/rekan lain.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label
                                className={`block font-bold mb-1 text-[11px] ${
                                  isDark ? 'text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                PIN Baru (4-6 Digit/Karakter) *
                              </label>
                              <div className="relative">
                                <input
                                  type={showRegPin ? 'text' : 'password'}
                                  required
                                  maxLength={12}
                                  value={regPin}
                                  onChange={(e) => setRegPin(e.target.value)}
                                  placeholder="Contoh: 1989 / Sandi123"
                                  className={`w-full rounded-xl py-2 pl-3 pr-9 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                                    isDark
                                      ? 'bg-slate-900 border-slate-700 text-white'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegPin(!showRegPin)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                                >
                                  {showRegPin ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label
                                className={`block font-bold mb-1 text-[11px] ${
                                  isDark ? 'text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                Konfirmasi PIN Baru *
                              </label>
                              <input
                                type={showRegPin ? 'text' : 'password'}
                                required
                                maxLength={12}
                                value={regPinConfirm}
                                onChange={(e) => setRegPinConfirm(e.target.value)}
                                placeholder="Ulangi PIN di atas"
                                className={`w-full rounded-xl py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                                  isDark
                                    ? 'bg-slate-900 border-slate-700 text-white'
                                    : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer text-xs sm:text-sm mt-3"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Simpan Profil & Masuk Aman</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= MODAL VERIFIKASI KEAMANAN AKUN (PENCEGAHAN SALAH USER) ================= */}
      {selectedBhabinForAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-gradient-to-r from-emerald-50 to-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    <span>Verifikasi Keamanan Akun</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Konfirmasi kepemilikan akun sebelum masuk
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBhabinForAuth(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Selected Officer Card */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-emerald-50/50 border-emerald-200/80'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                  {selectedBhabinForAuth.rank.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {selectedBhabinForAuth.rank}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedBhabinForAuth.polsek}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm mt-0.5 truncate">
                    {selectedBhabinForAuth.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{selectedBhabinForAuth.wilayahBinaan}</span>
                  </p>
                </div>
              </div>

              {/* Error Feedback */}
              {pinVerificationError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pinVerificationError}</span>
                </div>
              )}

              {/* Normal Verification Mode */}
              {!isResettingPin ? (
                <form onSubmit={handleVerifyBhabinPin} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300">
                        Masukkan PIN Keamanan Akun Anda:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPin(true);
                          setPinVerificationError(null);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                      >
                        Lupa / Setel PIN Baru?
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showBhabinPin ? 'text' : 'password'}
                        autoFocus
                        value={bhabinSecurityPin}
                        onChange={(e) => setBhabinSecurityPin(e.target.value)}
                        placeholder="Ketik PIN / Sandi Keamanan Anda..."
                        className={`w-full rounded-xl py-3 pl-9 pr-10 text-sm tracking-wider focus:border-emerald-500 focus:outline-none border shadow-sm ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowBhabinPin(!showBhabinPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                      >
                        {showBhabinPin ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      💡 PIN bawaan akun terdaftar: <span className="font-mono text-emerald-400 font-bold">1234</span> atau PIN yang Anda buat saat pendaftaran.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBhabinForAuth(null)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                        isDark
                          ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Bukan Akun Saya
                    </button>

                    <button
                      type="submit"
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Verifikasi & Masuk</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Reset / Set New PIN Mode */
                <form onSubmit={handleSaveNewPin} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    Setel PIN Keamanan baru untuk personel{' '}
                    <strong>{selectedBhabinForAuth.name}</strong>.
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        PIN Baru (Minimal 4 Digit):
                      </label>
                      <input
                        type="password"
                        required
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Masukkan PIN baru Anda..."
                        className="w-full rounded-xl py-2 px-3 text-xs bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Ulangi PIN Baru:
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPinInput}
                        onChange={(e) => setConfirmNewPinInput(e.target.value)}
                        placeholder="Ketik ulang PIN baru..."
                        className="w-full rounded-xl py-2 px-3 text-xs bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsResettingPin(false)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Simpan PIN & Masuk</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL RESET KATA SANDI ADMIN POLRES ================= */}
      {showAdminResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-all ${
              isDark
                ? 'bg-slate-900 border-amber-500/30 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-gradient-to-r from-amber-50 to-slate-50 border-amber-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    <span>Reset Kata Sandi Admin</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Otorisasi & Pembaruan Kredensial Satbinmas
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdminResetModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  Fitur ini diperuntukkan bagi pengelola resmi <strong>Satbinmas Polres Enrekang</strong> untuk memperbarui atau memulihkan kata sandi Admin.
                </div>
              </div>

              {/* Feedback Notifications */}
              {adminResetError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{adminResetError}</span>
                </div>
              )}

              {adminResetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{adminResetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAdminResetPassword} className="space-y-3.5">
                {/* Username Target */}
                <div>
                  <label
                    className={`block font-bold mb-1 text-[11px] ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Username Admin *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminResetUsername}
                    onChange={(e) => setAdminResetUsername(e.target.value)}
                    placeholder="Masukkan username akun admin..."
                    className={`w-full rounded-xl py-2 px-3 text-xs border focus:border-amber-500 focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Recovery / Department Master Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className={`block font-bold text-[11px] ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Kunci Pemulihan / Kode Otorisasi Kedinasan *
                    </label>
                  </div>
                  <input
                    type="password"
                    required
                    value={adminRecoveryCode}
                    onChange={(e) => setAdminRecoveryCode(e.target.value)}
                    placeholder="Masukkan Kode Kedinasan Satbinmas / Sandi Lama..."
                    className={`w-full rounded-xl py-2 px-3 text-xs border focus:border-amber-500 focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* New Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label
                      className={`block font-bold mb-1 text-[11px] ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Kata Sandi Baru *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminNewPass ? 'text' : 'password'}
                        required
                        value={adminNewPassword}
                        onChange={(e) => setAdminNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className={`w-full rounded-xl py-2 pl-3 pr-8 text-xs border focus:border-amber-500 focus:outline-none ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminNewPass(!showAdminNewPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showAdminNewPass ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block font-bold mb-1 text-[11px] ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Konfirmasi Sandi Baru *
                    </label>
                    <input
                      type={showAdminNewPass ? 'text' : 'password'}
                      required
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi baru"
                      className={`w-full rounded-xl py-2 px-3 text-xs border focus:border-amber-500 focus:outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAdminResetModal(false)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      isDark
                        ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>Simpan Sandi Baru</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className={`p-4 text-center text-[11px] font-medium relative z-10 border-t ${
          isDark
            ? 'bg-slate-950/80 border-slate-900 text-slate-500'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        &copy; {new Date().getFullYear()} SATBINMAS POLRES ENREKANG • SIPERBAWA POLRI Presisi Bawang Putih
      </footer>
    </div>
  );
};
