import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  UserCheck,
  UserPlus,
  AlertCircle,
  Building,
  MapPin,
  CheckCircle2,
  KeyRound,
  Sprout,
  Users,
} from 'lucide-react';
import { UserAccount } from '../../types';
import {
  getUsers,
  saveUsers,
  setCurrentUser,
  loginWithCredentials,
  addAuditLog,
} from '../../services/appState';
import { useTheme } from '../../context/ThemeContext';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { isDark } = useTheme();
  // Primary selection: 'ADMIN' or 'PENDAMPING' (Bhabinkamtibmas)
  const [loginRole, setLoginRole] = useState<'ADMIN' | 'PENDAMPING'>('ADMIN');

  // Admin sub-state
  const [adminUsername, setAdminUsername] = useState('admin.enrekang');
  const [adminPassword, setAdminPassword] = useState('AdminEnrekang123!');

  // Pendamping sub-state
  const [pendampingMode, setPendampingMode] = useState<'SELECT' | 'NRP' | 'REGISTER'>('SELECT');
  const [nrpInput, setNrpInput] = useState('');
  const [passInput, setPassInput] = useState('Bhabin123!');

  // Registration state for new Bhabinkamtibmas
  const [regNrp, setRegNrp] = useState('');
  const [regName, setRegName] = useState('');
  const [regRank, setRegRank] = useState('BRIPKA');
  const [regPolres, setRegPolres] = useState('Polres Enrekang');
  const [regPolsek, setRegPolsek] = useState('Polsek Anggeraja');
  const [regDesa, setRegDesa] = useState('');
  const [regKecamatan, setRegKecamatan] = useState('Anggeraja');
  const [regPhone, setRegPhone] = useState('081234567890');
  const [regPassword, setRegPassword] = useState('Bhabin123!');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allUsers = getUsers();
  const adminUser = allUsers.find((u) => u.role === 'ADMIN_PUSAT');
  const bhabinUsers = allUsers.filter((u) => u.role === 'BHABINKAMTIBMAS');

  // Direct fast login for Admin
  const handleQuickLoginAdmin = () => {
    if (adminUser) {
      setCurrentUser(adminUser);
      if (onLoginSuccess) onLoginSuccess();
    } else {
      const fallbackAdmin: UserAccount = {
        id: 'user-admin-enrekang',
        username: 'admin.enrekang',
        name: 'ADMIN SATBINMAS POLRES ENREKANG',
        rank: 'AKP',
        polres: 'Polres Enrekang',
        polsek: 'Polres Enrekang',
        wilayahBinaan: 'Seluruh Kabupaten Enrekang',
        role: 'ADMIN_PUSAT',
        status: 'AKTIF',
        phone: '081144002233',
      };
      setCurrentUser(fallbackAdmin);
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  // Admin form submit
  const handleAdminFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const matched = loginWithCredentials(adminUsername, adminPassword);
    if (matched) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg('Kredensial Admin tidak cocok. Gunakan admin.enrekang / AdminEnrekang123!');
    }
  };

  // Direct fast login for Pendamping (Bhabinkamtibmas)
  const handleSelectBhabin = (user: UserAccount) => {
    setCurrentUser(user);
    if (onLoginSuccess) onLoginSuccess();
  };

  // Manual NRP submit for Bhabin
  const handleNrpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!nrpInput.trim()) {
      setErrorMsg('NRP Petugas Bhabinkamtibmas tidak boleh kosong.');
      return;
    }
    const matched = loginWithCredentials(nrpInput.trim(), passInput.trim());
    if (matched) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg(`NRP ${nrpInput} atau kata sandi tidak cocok. Pastikan NRP terdaftar atau pilih dari daftar pendamping.`);
    }
  };

  // Register new Bhabin
  const handleRegisterBhabin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regNrp.trim()) {
      setErrorMsg('NRP Petugas tidak boleh kosong.');
      return;
    }
    if (!regName.trim()) {
      setErrorMsg('Nama Lengkap Petugas Bhabinkamtibmas tidak boleh kosong.');
      return;
    }

    const existing = allUsers.find(
      (u) => u.username.toLowerCase() === regNrp.trim().toLowerCase()
    );
    if (existing) {
      setErrorMsg(`NRP '${regNrp}' sudah terdaftar dalam sistem.`);
      return;
    }

    const wilayahStr = `Desa ${regDesa.trim() || 'Pekalobean'}, Kec. ${regKecamatan.trim() || 'Anggeraja'}, Kab. Enrekang`;

    const newUser: UserAccount = {
      id: `user-bhabin-${Date.now()}`,
      username: regNrp.trim(),
      password: regPassword.trim() || 'Bhabin123!',
      name: regName.trim().toUpperCase(),
      rank: regRank,
      polres: regPolres || 'Polres Enrekang',
      polsek: regPolsek || 'Polsek Anggeraja',
      wilayahBinaan: wilayahStr,
      role: 'BHABINKAMTIBMAS',
      status: 'AKTIF',
      phone: regPhone.trim(),
    };

    const updatedUsers = [...allUsers, newUser];
    saveUsers(updatedUsers);

    addAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      actionType: 'USER_MANAGEMENT',
      targetInfo: `Registrasi Mandiri: ${newUser.name} (${newUser.username})`,
      details: `Personel Bhabinkamtibmas ${newUser.name} (${newUser.rank}) berhasil melakukan registrasi akun baru.`,
    });

    setCurrentUser(newUser);
    if (onLoginSuccess) onLoginSuccess();
  };

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
                src="/src/assets/images/garlic_app_logo_1787017115652.jpg"
                alt="Logo Bawang Putih Siperbawa"
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
              className={`w-20 h-20 mx-auto mb-3 rounded-2xl p-1.5 shadow-md flex items-center justify-center border-2 ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <img
                src="/src/assets/images/garlic_app_logo_1787017115652.jpg"
                alt="Logo Bawang Putih"
                className="w-full h-full object-cover rounded-xl"
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
              <div className="space-y-5">
                <div
                  className={`p-5 rounded-2xl border space-y-4 ${
                    isDark
                      ? 'bg-slate-950 border-amber-500/30'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                          isDark
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        Command Center Admin Polres
                      </span>
                      <h3
                        className={`font-extrabold text-base mt-1 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Admin Satbinmas Polres Enrekang
                      </h3>
                      <p
                        className={`text-xs mt-0.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        Akses penuh agregasi wilayah, peta GIS, audit log, integrasi Google Sheets, dan persetujuan laporan.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Fast Login Button */}
                  <button
                    type="button"
                    onClick={handleQuickLoginAdmin}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Masuk Langsung sebagai Admin Polres</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Optional Custom Admin Credentials Input */}
                <form onSubmit={handleAdminFormSubmit} className="space-y-3 pt-2">
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Atau Masuk dengan Akun Admin Kustom:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        className={`block font-bold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Username Admin:
                      </label>
                      <div className="relative">
                        <User
                          className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        />
                        <input
                          type="text"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          className={`w-full rounded-xl py-2 pl-8 pr-3 text-xs focus:border-amber-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className={`block font-bold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Kata Sandi:
                      </label>
                      <div className="relative">
                        <Lock
                          className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        />
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className={`w-full rounded-xl py-2 pl-8 pr-3 text-xs focus:border-amber-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    <KeyRound
                      className={`w-3.5 h-3.5 ${
                        isDark ? 'text-amber-400' : 'text-amber-600'
                      }`}
                    />
                    <span>Verifikasi Kredensial Admin</span>
                  </button>
                </form>
              </div>
            )}

            {/* ================= MODE 2: PENDAMPING (BHABINKAMTIBMAS) ================= */}
            {loginRole === 'PENDAMPING' && (
              <div className="space-y-4">
                {/* Sub-tabs for Pendamping: Pilih Petugas | Input NRP | Daftar Baru */}
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
                      setPendampingMode('SELECT');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      pendampingMode === 'SELECT'
                        ? 'bg-emerald-600 text-white shadow'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Pilih Petugas Bhabin
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setPendampingMode('NRP');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      pendampingMode === 'NRP'
                        ? 'bg-emerald-600 text-white shadow'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Masuk via NRP
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setPendampingMode('REGISTER');
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      pendampingMode === 'REGISTER'
                        ? 'bg-emerald-600 text-white shadow'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Registrasi Bhabin
                  </button>
                </div>

                {/* Sub-view 1: Quick Select Active Bhabinkamtibmas */}
                {pendampingMode === 'SELECT' && (
                  <div className="space-y-2">
                    <div
                      className={`text-xs flex items-center justify-between mb-1 font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <span>Pilih Akun Petugas Pendamping Binaan (1-Klik):</span>
                      <span
                        className={`font-mono font-bold ${
                          isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}
                      >
                        {bhabinUsers.length} Personel Aktif
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {bhabinUsers.length === 0 ? (
                        <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950 text-slate-400 space-y-2">
                          <Users className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs font-semibold text-slate-300">
                            Belum Ada Akun Bhabinkamtibmas Terdaftar
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Silakan lakukan pendaftaran personel baru melalui menu{' '}
                            <button
                              type="button"
                              onClick={() => setPendampingMode('REGISTER')}
                              className="text-emerald-400 font-bold underline hover:text-emerald-300 inline"
                            >
                              Registrasi Bhabin
                            </button>{' '}
                            atau login menggunakan NRP.
                          </p>
                        </div>
                      ) : (
                        bhabinUsers.map((bhabin) => (
                          <div
                            key={bhabin.id}
                            onClick={() => handleSelectBhabin(bhabin)}
                            className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-between group border shadow-sm ${
                              isDark
                                ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                                : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-emerald-500'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold transition ${
                                    isDark
                                      ? 'text-white group-hover:text-emerald-300'
                                      : 'text-slate-900 group-hover:text-emerald-700'
                                  }`}
                                >
                                  {bhabin.rank} {bhabin.name}
                                </span>
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                    isDark
                                      ? 'bg-slate-900 text-emerald-400 border-slate-800'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  NRP {bhabin.username}
                                </span>
                              </div>
                              <div
                                className={`text-[11px] flex items-center gap-2 font-medium ${
                                  isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                <span
                                  className={
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }
                                >
                                  {bhabin.polsek}
                                </span>
                                <span>•</span>
                                <span>{bhabin.wilayahBinaan}</span>
                              </div>
                            </div>

                            <div
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 shrink-0 shadow-sm ${
                                isDark
                                  ? 'bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-slate-950'
                                  : 'bg-emerald-100 group-hover:bg-emerald-600 text-emerald-800 group-hover:text-white'
                              }`}
                            >
                              <span>Masuk</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-view 2: Login via NRP */}
                {pendampingMode === 'NRP' && (
                  <form
                    onSubmit={handleNrpSubmit}
                    className={`space-y-3 p-4 rounded-2xl border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <label
                        className={`block font-bold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        NRP Petugas Bhabinkamtibmas:
                      </label>
                      <div className="relative">
                        <User
                          className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        />
                        <input
                          type="text"
                          value={nrpInput}
                          onChange={(e) => setNrpInput(e.target.value)}
                          placeholder="Masukkan NRP (Contoh: 82041102)"
                          className={`w-full rounded-xl py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className={`block font-bold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Kata Sandi / Passcode:
                      </label>
                      <div className="relative">
                        <Lock
                          className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        />
                        <input
                          type="password"
                          value={passInput}
                          onChange={(e) => setPassInput(e.target.value)}
                          placeholder="Kata sandi..."
                          className={`w-full rounded-xl py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none border shadow-sm ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer"
                    >
                      <span>Masuk sebagai Pendamping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Sub-view 3: Register Bhabin */}
                {pendampingMode === 'REGISTER' && (
                  <form
                    onSubmit={handleRegisterBhabin}
                    className={`space-y-3 p-4 rounded-2xl border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label
                          className={`block font-bold mb-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          NRP Petugas *
                        </label>
                        <input
                          type="text"
                          required
                          value={regNrp}
                          onChange={(e) => setRegNrp(e.target.value)}
                          placeholder="e.g. 89050123"
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

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
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
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
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          className={`block font-bold mb-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          Nama Lengkap Petugas *
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. ANDI SETIAWAN"
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block font-bold mb-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          Polsek
                        </label>
                        <input
                          type="text"
                          value={regPolsek}
                          onChange={(e) => setRegPolsek(e.target.value)}
                          placeholder="e.g. Polsek Anggeraja"
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block font-bold mb-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          Kecamatan Binaan
                        </label>
                        <input
                          type="text"
                          value={regKecamatan}
                          onChange={(e) => setRegKecamatan(e.target.value)}
                          placeholder="e.g. Anggeraja"
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
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
                          placeholder="e.g. Pekalobean"
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block font-bold mb-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          No. HP / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0812xxxxxxxx"
                          className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none border ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftar & Langsung Masuk</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

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
