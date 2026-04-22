import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import Logo from '../components/Logo';
import { UPT_BY_PROVINCE, UPT_PROVINCES } from '../lib/uptOptions';
import { LayoutDashboard, User } from 'lucide-react';

const directorates = [
  'Sekretariat Direktorat Jenderal Pemasyarakatan',
  'Direktorat Perawatan Kesehatan dan Rehabilitasi',
  'Direktorat Pelayanan Tahanan dan Anak',
  'Direktorat Pembinaan Narapidana dan Anak Binaan',
  'Direktorat Pembimbingan Kemasyarakatan',
  'Direktorat Pengamanan dan Intelijen',
  'Direktorat Teknologi Informasi dan Kerja Sama Pemasyarakatan',
  'Direktorat Sistem dan Strategi Penyelenggaraan Pemasyarakatan',
  'Direktorat Kepatuhan Internal',
];

const kanwilList = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'D.I Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimatan Timur',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
];

export default function Profile() {
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    no_wa: '',
    daftar_sebagai: '',
    organization_detail: '',
    current_password: '',
  });
  const [selectedUptProvince, setSelectedUptProvince] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      const userData = response?.data?.user || response?.data;
      const initialDaftarSebagai = userData.daftar_sebagai || '';
      const initialOrganizationDetail = userData.organization_detail || '';
      setUser(userData);
      setPhotoZoom(Number(userData?.foto_position_x ?? 0));
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        no_wa: userData.no_wa || '',
        daftar_sebagai: initialDaftarSebagai,
        organization_detail: initialOrganizationDetail,
        current_password: '',
      });

      if (initialDaftarSebagai === 'UPT') {
        const [province] = initialOrganizationDetail.split(' - ');
        setSelectedUptProvince((province || '').trim());
      } else {
        setSelectedUptProvince('');
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    if (!file.type?.startsWith('image/')) {
      setError('File harus berupa gambar (image).');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setError('Ukuran foto maksimal 1MB.');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload if needed
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('foto_position_x', String(photoZoom));

      const response = await api.post('/profile/update-foto', formData);

      if (response?.data?.user) {
        setUser(response.data.user);
      }

      setSuccess('Foto profil berhasil diperbarui');
    } catch (err) {
      setError(
        err?.response?.data?.errors?.foto?.[0] ||
        err?.response?.data?.message ||
        'Gagal upload foto'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePhotoPosition = async () => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('foto_position_x', String(photoZoom));

      const response = await api.post('/profile/update-foto', formData);
      if (response?.data?.user) {
        setUser(response.data.user);
      }

      setSuccess('Zoom foto profil berhasil disimpan');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan posisi foto');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form data
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        no_wa: user?.no_wa || '',
        daftar_sebagai: user?.daftar_sebagai || '',
        organization_detail: user?.organization_detail || '',
        current_password: '',
      });

      if (user?.daftar_sebagai === 'UPT') {
        const [province] = (user?.organization_detail || '').split(' - ');
        setSelectedUptProvince((province || '').trim());
      } else {
        setSelectedUptProvince('');
      }
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'daftar_sebagai') {
      setFormData((prev) => ({
        ...prev,
        daftar_sebagai: value,
        organization_detail: '',
      }));
      setSelectedUptProvince('');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUptProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedUptProvince(province);
    setFormData((prev) => ({
      ...prev,
      organization_detail: '',
    }));
  };

  const handleUptDetailChange = (e) => {
    const uptName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      organization_detail: uptName ? `${selectedUptProvince} - ${uptName}` : '',
    }));
  };

  const selectedUptName = formData.organization_detail.startsWith(`${selectedUptProvince} - `)
    ? formData.organization_detail.replace(`${selectedUptProvince} - `, '')
    : '';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.daftar_sebagai && !formData.organization_detail) {
      setError('Detail unit wajib dipilih.');
      return;
    }

    setUpdating(true);

    try {
      await api.put('/profile/update', formData);
      setSuccess('Profil berhasil diperbarui');
      await fetchUser();
      setIsEditing(false);
      setFormData(prev => ({ ...prev, current_password: '' }));
    } catch (err) {
      // Show field-level validation errors if available
      const errors = err?.response?.data?.errors;
      if (errors) {
        const messages = Object.values(errors).flat().join(' ');
        setError(messages);
      } else {
        setError(err?.response?.data?.message || 'Gagal memperbarui profil');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      // Clear the stored token
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear token even if logout fails
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/');
    }
  };

  const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return '';
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    return `${apiBaseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <Logo className="h-10 md:h-11 w-auto" alt="KLIP" />
          </a>
          <UserDropdownMenu user={user} onLogout={handleLogout} />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
              </div>
              <nav className="pb-2">
                <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" /> Dashboard
                </a>
                <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-blue-700 bg-blue-50 font-semibold text-sm border-l-4 border-blue-600">
                  <User className="w-4 h-4 flex-shrink-0" /> Profil Saya
                </a>
              </nav>
            </div>
          </aside>

          {/* Profile Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Profil Saya</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  {success}
                </div>
              )}

              {/* Foto Profil */}
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold mb-4">Foto Profil</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover transition-transform duration-200" style={{ transform: `scale(${1 + (photoZoom / 100) * 1.5})`, transformOrigin: '50% 50%' }} />
                      ) : user?.foto ? (
                        <img src={resolvePhotoUrl(user.foto)} alt="Profil" className="w-full h-full object-cover transition-transform duration-200" style={{ transform: `scale(${1 + (photoZoom / 100) * 1.5})`, transformOrigin: '50% 50%' }} />
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada foto</span>
                      )}
                    </div>
                    <label className="mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={updating}
                        className="hidden"
                      />
                      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {updating ? 'Uploading...' : 'Ubah foto profil'}
                      </span>
                    </label>

                    <div className="mt-4 w-56">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-600">Zoom foto</label>
                        <span className="text-xs text-gray-500">{(1 + (photoZoom / 100) * 1.5).toFixed(1)}×</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">−</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={photoZoom}
                          onChange={(e) => setPhotoZoom(Number(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-400">+</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSavePhotoPosition}
                        disabled={updating || !user?.foto}
                        className="mt-3 w-full text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Menyimpan...' : 'Simpan Zoom Foto'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Profil */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Informasi Pribadi</h3>
                  <button
                    onClick={handleEditToggle}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isEditing ? 'Batal' : 'Edit Profil'}
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                      <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded">{user?.nip}</p>
                      <p className="text-xs text-gray-500 mt-1">NIP tidak dapat diubah</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user?.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user?.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No WhatsApp</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="no_wa"
                          value={formData.no_wa}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user?.no_wa}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status Pengguna</label>
                      <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded">{user?.status_pengguna}</p>
                      <p className="text-xs text-gray-500 mt-1">Status tidak dapat diubah</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai</label>
                      {isEditing ? (
                        <select
                          name="daftar_sebagai"
                          value={formData.daftar_sebagai}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Pilih Unit --</option>
                          <option value="UPT">UPT: Daerah</option>
                          <option value="Kanwil">Kanwil: Provinsi</option>
                          <option value="Ditjenpas">Ditjenpas: Direktorat Jenderal Pemasyarakatan</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded">{user?.daftar_sebagai || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit/Direktorat</label>

                      {isEditing ? (
                        <>
                          {formData.daftar_sebagai === 'Ditjenpas' && (
                            <select
                              name="organization_detail"
                              value={formData.organization_detail}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Pilih Direktorat --</option>
                              {directorates.map((dir) => (
                                <option key={dir} value={dir}>{dir}</option>
                              ))}
                            </select>
                          )}

                          {formData.daftar_sebagai === 'Kanwil' && (
                            <select
                              name="organization_detail"
                              value={formData.organization_detail}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Pilih Kanwil --</option>
                              {kanwilList.map((kanwil) => (
                                <option key={kanwil} value={kanwil}>{kanwil}</option>
                              ))}
                            </select>
                          )}

                          {formData.daftar_sebagai === 'UPT' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <select
                                value={selectedUptProvince}
                                onChange={handleUptProvinceChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Pilih Provinsi --</option>
                                {UPT_PROVINCES.map((province) => (
                                  <option key={province} value={province}>{province}</option>
                                ))}
                              </select>

                              <select
                                value={selectedUptName}
                                onChange={handleUptDetailChange}
                                disabled={!selectedUptProvince}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              >
                                <option value="">-- Pilih UPT --</option>
                                {(UPT_BY_PROVINCE[selectedUptProvince] || []).map((upt, index) => (
                                  <option key={`${selectedUptProvince}-${index}`} value={upt}>{upt}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {!formData.daftar_sebagai && (
                            <p className="text-xs text-gray-500 mt-1">Pilih "Daftar Sebagai" terlebih dulu.</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded">{user?.organization_detail || '-'}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Konfirmasi Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="current_password"
                          value={formData.current_password}
                          onChange={handleInputChange}
                          required
                          placeholder="Masukkan password saat ini untuk menyimpan perubahan"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Wajib diisi untuk mengkonfirmasi identitas Anda</p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={updating}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
