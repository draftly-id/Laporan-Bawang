import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  UserX,
  UserCheck,
  Search,
  ShieldCheck,
  Edit2,
  X,
  Check,
  Trash2,
  Save,
  SlidersHorizontal,
  AlertTriangle,
  MapPin,
  Building2,
} from 'lucide-react';
import { UserAccount, UserStatus } from '../../types';
import {
  getUsers,
  saveUsers,
  addAuditLog,
  getCurrentUser,
  updateAdminPassword,
} from '../../services/appState';

interface UserManagementProps {
  onRefresh: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onRefresh }) => {
  const [users, setUsersList] = useState<UserAccount[]>(getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Admin Change Password Modal State
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminNewPassInput, setAdminNewPassInput] = useState('');
  const [adminConfirmPassInput, setAdminConfirmPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState<string | null>(null);
  const [adminPassSuccess, setAdminPassSuccess] = useState<string | null>(null);

  // Edit User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserAccount>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);

  // Delete User Confirmation State
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // New User Form State
  const [newNrp, setNewNrp] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('BRIPKA');
  const [newPolsek, setNewPolsek] = useState('Polsek Enrekang');
  const [newPolres, setNewPolres] = useState('Polres Enrekang');
  
  // Rincian Wilayah Binaan
  const [newAlamat, setNewAlamat] = useState('');
  const [newDesa, setNewDesa] = useState('Kalosi');
  const [newKecamatan, setNewKecamatan] = useState('Alla');
  const [newKabupaten, setNewKabupaten] = useState('Enrekang');
  const [newPhone, setNewPhone] = useState('081234567890');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.wilayahBinaan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newNrp.trim() || !newName.trim()) return;

    // Build structured Wilayah Binaan string
    const wilayahParts: string[] = [];
    if (newAlamat.trim()) wilayahParts.push(`Alamat: ${newAlamat.trim()}`);
    if (newDesa.trim()) wilayahParts.push(`Desa ${newDesa.trim()}`);
    if (newKecamatan.trim()) wilayahParts.push(`Kec. ${newKecamatan.trim()}`);
    if (newKabupaten.trim()) wilayahParts.push(`Kab. ${newKabupaten.trim()}`);

    const combinedWilayah =
      wilayahParts.length > 0
        ? wilayahParts.join(', ')
        : 'Desa Kalosi, Kec. Alla, Kab. Enrekang';

    const newUser: UserAccount = {
      id: `user-bhabin-${Date.now()}`,
      username: newNrp,
      name: newName,
      rank: newRank,
      polres: newPolres || 'Polres Enrekang',
      polsek: newPolsek || 'Polsek Enrekang',
      wilayahBinaan: combinedWilayah,
      role: 'BHABINKAMTIBMAS',
      status: 'AKTIF',
      phone: newPhone,
    };

    const updated = [...users, newUser];
    setUsersList(updated);
    saveUsers(updated);

    const admin = getCurrentUser();
    addAuditLog({
      actorId: admin.id,
      actorName: admin.name,
      actorRole: admin.role,
      actionType: 'USER_MANAGEMENT',
      targetInfo: `User Baru: ${newName} (${newNrp})`,
      details: `Registrasi akun Bhabinkamtibmas Polsek ${newPolsek} - Wilayah: ${combinedWilayah}`,
    });

    setShowAddModal(false);
    // Reset fields
    setNewNrp('');
    setNewName('');
    setNewAlamat('');
    onRefresh();
  };

  // Start Editing User
  const handleStartEdit = (user: UserAccount) => {
    setUserToEdit({ ...user });
    setShowEditModal(true);
  };

  // Inline Start Editing
  const handleStartInlineEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditForm({ ...user });
  };

  // Save User Changes (Simpan Data)
  const handleSaveUser = (updatedData: UserAccount) => {
    if (!updatedData.name.trim() || !updatedData.username.trim()) return;

    const updated = users.map((u) => (u.id === updatedData.id ? updatedData : u));
    setUsersList(updated);
    saveUsers(updated);

    const admin = getCurrentUser();
    addAuditLog({
      actorId: admin.id,
      actorName: admin.name,
      actorRole: admin.role,
      actionType: 'USER_MANAGEMENT',
      targetInfo: `User: ${updatedData.name} (${updatedData.username})`,
      details: `Pembaruan data user (Simpan Data): ${updatedData.rank} - ${updatedData.wilayahBinaan}`,
    });

    setShowEditModal(false);
    setUserToEdit(null);
    setEditingUserId(null);
    setEditForm({});
    onRefresh();
  };

  // Confirm Delete User (Hapus Data)
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    if (userToDelete.role === 'ADMIN_PUSAT') {
      alert('Akun Admin Utama tidak dapat dihapus demi keamanan sistem.');
      setUserToDelete(null);
      return;
    }

    const updated = users.filter((u) => u.id !== userToDelete.id);
    setUsersList(updated);
    saveUsers(updated);

    const admin = getCurrentUser();
    addAuditLog({
      actorId: admin.id,
      actorName: admin.name,
      actorRole: admin.role,
      actionType: 'USER_MANAGEMENT',
      targetInfo: `Hapus User: ${userToDelete.name} (${userToDelete.username})`,
      details: `Penghapusan data akun user dari sistem`,
    });

    setUserToDelete(null);
    onRefresh();
  };

  const handleAdminPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError(null);
    setAdminPassSuccess(null);

    if (!adminNewPassInput.trim() || adminNewPassInput.trim().length < 6) {
      setAdminPassError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (adminNewPassInput.trim() !== adminConfirmPassInput.trim()) {
      setAdminPassError('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    const success = updateAdminPassword(adminNewPassInput.trim());
    if (success) {
      setAdminPassSuccess('Kata sandi Admin berhasil diperbarui!');
      setTimeout(() => {
        setShowAdminPassModal(false);
        setAdminPassSuccess(null);
        setAdminNewPassInput('');
        setAdminConfirmPassInput('');
      }, 1500);
    } else {
      setAdminPassError('Gagal memperbarui kata sandi admin.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-amber-400" /> Manajemen Akun Bhabinkamtibmas (User Control)
          </h2>
          <p className="text-xs text-slate-400">
            Registrasi, edit data, hapus user, simpan data, dan pembaruan hak akses
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
        >
          <UserPlus className="w-4 h-4" /> Registrasi User Baru
        </button>
      </div>

      {/* Admin Security Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                ADMIN SATBINMAS POLRES ENREKANG
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                ● Aktif
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              Akun Pengelola Utama Command Center (admin.enrekang)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAdminPassModal(true);
            setAdminPassError(null);
            setAdminPassSuccess(null);
            setAdminNewPassInput('');
            setAdminConfirmPassInput('');
          }}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Ubah Kata Sandi Admin</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan Nama, NRP, atau Wilayah Binaan..."
          className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
            <tr>
              <th className="p-3">Identitas Petugas (NRP)</th>
              <th className="p-3">Kesatuan Polsek / Polres</th>
              <th className="p-3">Wilayah Binaan (Alamat, Desa, Kec, Kab)</th>
              <th className="p-3">Status Akun</th>
              <th className="p-3 text-right">Menu Set Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {filteredUsers.map((user) => {
              const isInlineEditing = editingUserId === user.id;

              if (isInlineEditing) {
                return (
                  <tr key={user.id} className="bg-slate-800/90 border-l-4 border-amber-500">
                    <td className="p-2 space-y-1">
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Nama Lengkap"
                          className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={editForm.rank || ''}
                          onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                          placeholder="Pangkat"
                          className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={editForm.username || ''}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          placeholder="NRP"
                          className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="No HP"
                          className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                        />
                      </div>
                    </td>

                    <td className="p-2 space-y-1">
                      <input
                        type="text"
                        value={editForm.polres || ''}
                        onChange={(e) => setEditForm({ ...editForm, polres: e.target.value })}
                        placeholder="Polres"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={editForm.polsek || ''}
                        onChange={(e) => setEditForm({ ...editForm, polsek: e.target.value })}
                        placeholder="Polsek"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        value={editForm.wilayahBinaan || ''}
                        onChange={(e) => setEditForm({ ...editForm, wilayahBinaan: e.target.value })}
                        placeholder="Wilayah Binaan"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <select
                        value={editForm.status || 'AKTIF'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                        className="bg-slate-950 border border-slate-700 text-amber-300 rounded px-2 py-1 text-xs font-bold"
                      >
                        <option value="AKTIF">AKTIF</option>
                        <option value="MUTASI">MUTASI</option>
                        <option value="NONAKTIF">NONAKTIF</option>
                      </select>
                    </td>

                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSaveUser(editForm as UserAccount)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                          title="Simpan Data"
                        >
                          <Save className="w-3.5 h-3.5" /> Simpan Data
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserId(null);
                            setEditForm({});
                          }}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={user.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        {user.rank}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      NRP: {user.username} • {user.phone}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-amber-300 font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{user.polsek || 'Polsek Enrekang'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-4.5">{user.polres || 'Polres Enrekang'}</div>
                  </td>

                  <td className="p-3 font-medium text-slate-300">
                    {user.wilayahBinaan}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === 'AKTIF'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : user.status === 'MUTASI'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    {/* Menu Set Aksi */}
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Perintah Edit */}
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/40 flex items-center gap-1 transition"
                        title="Edit Data User"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>

                      {/* Perintah Hapus Data */}
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-semibold border border-rose-700/60 flex items-center gap-1 transition"
                        title="Hapus Data User"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Data
                      </button>

                      {/* Quick Inline Edit Toggle */}
                      <button
                        onClick={() => handleStartInlineEdit(user)}
                        className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
                        title="Edit Cepat Baris"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal (With Simpan Data) */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" /> Edit Data User ({userToEdit.username})
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setUserToEdit(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">NRP / Username</label>
                  <input
                    type="text"
                    value={userToEdit.username}
                    onChange={(e) => setUserToEdit({ ...userToEdit, username: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pangkat</label>
                  <input
                    type="text"
                    value={userToEdit.rank}
                    onChange={(e) => setUserToEdit({ ...userToEdit, rank: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={userToEdit.phone}
                    onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Akun</label>
                  <select
                    value={userToEdit.status}
                    onChange={(e) => setUserToEdit({ ...userToEdit, status: e.target.value as UserStatus })}
                    className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="MUTASI">MUTASI</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kesatuan Polsek *</label>
                  <input
                    type="text"
                    value={userToEdit.polsek}
                    onChange={(e) => setUserToEdit({ ...userToEdit, polsek: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Polres Naungan</label>
                  <input
                    type="text"
                    value={userToEdit.polres}
                    onChange={(e) => setUserToEdit({ ...userToEdit, polres: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center justify-between">
                  <span>Wilayah Binaan Bhabinkamtibmas</span>
                  <span className="text-[10px] text-slate-500">(Alamat, Desa, Kecamatan, Kabupaten)</span>
                </label>
                <input
                  type="text"
                  value={userToEdit.wilayahBinaan}
                  onChange={(e) => setUserToEdit({ ...userToEdit, wilayahBinaan: e.target.value })}
                  placeholder="e.g. Alamat: Dusun Tanete, Desa Kalosi, Kec. Alla, Kab. Enrekang"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setUserToEdit(null);
                }}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveUser(userToEdit)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" /> Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Konfirmasi Hapus Data User</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-bold text-white">{userToDelete.name} ({userToDelete.rank})</div>
              <div className="text-slate-400">NRP: <span className="font-mono text-amber-300">{userToDelete.username}</span></div>
              <div className="text-slate-400">Wilayah: {userToDelete.wilayahBinaan}</div>
            </div>

            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus data user ini secara permanen dari database sistem?
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Data Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" /> Registrasi Akun Bhabinkamtibmas
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">NRP / Username *</label>
                  <input
                    type="text"
                    value={newNrp}
                    onChange={(e) => setNewNrp(e.target.value)}
                    placeholder="e.g. 90050123"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pangkat</label>
                  <input
                    type="text"
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                    placeholder="e.g. BRIPKA"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Bripka Supriyanto, S.H."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">No. HP / WA</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 081234567890"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Ganti Polres menjadi Polsek */}
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center justify-between">
                    <span>Kesatuan Polsek *</span>
                    <span className="text-[10px] text-amber-400 font-normal">Polres Enrekang</span>
                  </label>
                  <input
                    type="text"
                    value={newPolsek}
                    onChange={(e) => setNewPolsek(e.target.value)}
                    placeholder="e.g. Polsek Enrekang / Polsek Alla"
                    className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rincian Wilayah Binaan Masing-Masing */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-amber-400" /> Wilayah Binaan Bhabinkamtibmas
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">1. Alamat / RT RW / Dusun / Lingkungan</label>
                  <input
                    type="text"
                    value={newAlamat}
                    onChange={(e) => setNewAlamat(e.target.value)}
                    placeholder="e.g. Dusun Tanete, RT 01 / RW 02"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">2. Desa / Kelurahan *</label>
                    <input
                      type="text"
                      value={newDesa}
                      onChange={(e) => setNewDesa(e.target.value)}
                      placeholder="e.g. Kalosi"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">3. Kecamatan *</label>
                    <input
                      type="text"
                      value={newKecamatan}
                      onChange={(e) => setNewKecamatan(e.target.value)}
                      placeholder="e.g. Alla"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">4. Kabupaten / Kota *</label>
                  <input
                    type="text"
                    value={newKabupaten}
                    onChange={(e) => setNewKabupaten(e.target.value)}
                    placeholder="e.g. Enrekang"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow transition"
              >
                <Save className="w-4 h-4" /> Simpan User Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Change Password Modal */}
      {showAdminPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Ubah Kata Sandi Admin</h3>
                  <p className="text-[10px] text-slate-400">Akun: admin.enrekang (Satbinmas)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminPassModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminPassError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{adminPassError}</span>
              </div>
            )}

            {adminPassSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{adminPassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdminPasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Kata Sandi Baru (Minimal 6 Karakter) *
                </label>
                <input
                  type="password"
                  required
                  value={adminNewPassInput}
                  onChange={(e) => setAdminNewPassInput(e.target.value)}
                  placeholder="Masukkan kata sandi baru..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-2 px-3 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Ulangi / Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  value={adminConfirmPassInput}
                  onChange={(e) => setAdminConfirmPassInput(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-2 px-3 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAdminPassModal(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Simpan Perubahan Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

