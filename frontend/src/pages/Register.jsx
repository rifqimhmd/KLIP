import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { UPT_BY_PROVINCE, UPT_PROVINCES } from '../lib/uptOptions';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    email: '',
    password: '',
    password_confirmation: '',
    pangkat_golongan: '',
    jabatan: '',
    bagian: '',
    daftar_sebagai: '',
    organization_detail: '',
    no_wa: '',
    status_pengguna: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedUptProvince, setSelectedUptProvince] = useState('');
  const navigate = useNavigate();

  // List of directorates
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'daftar_sebagai') {
      setFormData((prev) => ({ ...prev, daftar_sebagai: value, organization_detail: '' }));
      setSelectedUptProvince('');
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUptProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedUptProvince(province);
    setFormData((prev) => ({ ...prev, organization_detail: '' }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting registration with data:', {
        ...formData,
        password: '***',
        password_confirmation: '***'
      });
      
      const response = await api.post('/api/register', formData);
      console.log('Registration successful:', response.data);
      
      setSuccess(true);
      setError(null);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      const errorMsg = err?.response?.data?.message || 
                       err?.response?.data?.errors?.nip?.[0] ||
                       err?.response?.data?.errors?.email?.[0] ||
                       err?.response?.data?.errors?.password?.[0] ||
                       'Registrasi gagal';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
            Daftar Akun
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Bergabunglah dengan platform kami
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              Registrasi berhasil! Anda akan dialihkan ke halaman login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama lengkap sesuai identitas"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* NIP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder="Nomor Induk Pegawai"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contoh@klinikpatnal.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Konfirmasi password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Daftar Sebagai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daftar Sebagai <span className="text-red-600">*</span>
              </label>
              <select
                name="daftar_sebagai"
                value={formData.daftar_sebagai}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Unit --</option>
                <option value="UPT">UPT: Daerah</option>
                <option value="Kanwil">Kanwil: Provinsi</option>
                <option value="Ditjenpas">Ditjenpas: Direktorat Jenderal Pemasyarakatan</option>
              </select>
            </div>

            {/* Pangkat/Golongan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pangkat/Golongan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="pangkat_golongan"
                value={formData.pangkat_golongan}
                onChange={handleChange}
                placeholder="Contoh: Penata / III-C"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jabatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                placeholder="Contoh: Staf Pengawasan"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bagian */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bagian <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="bagian"
                value={formData.bagian}
                onChange={handleChange}
                placeholder="Contoh: Kepatuhan Internal"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Directorat Selection - Only show if Ditjenpas is selected */}
            {formData.daftar_sebagai === 'Ditjenpas' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Direktorat <span className="text-red-600">*</span>
                </label>
                <select
                  name="organization_detail"
                  value={formData.organization_detail}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Direktorat --</option>
                  {directorates.map((dir, index) => (
                    <option key={index} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.daftar_sebagai === 'Kanwil' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Kanwil <span className="text-red-600">*</span>
                </label>
                <select
                  name="organization_detail"
                  value={formData.organization_detail}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Kanwil --</option>
                  {kanwilList.map((kanwil, index) => (
                    <option key={index} value={kanwil}>
                      {kanwil}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.daftar_sebagai === 'UPT' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Provinsi UPT <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedUptProvince}
                    onChange={handleUptProvinceChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {UPT_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih UPT <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedUptName}
                    onChange={handleUptDetailChange}
                    required
                    disabled={!selectedUptProvince}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">-- Pilih UPT --</option>
                    {(UPT_BY_PROVINCE[selectedUptProvince] || []).map((upt, index) => (
                      <option key={`${selectedUptProvince}-${index}`} value={upt}>
                        {upt}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* No WA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="no_wa"
                value={formData.no_wa}
                onChange={handleChange}
                placeholder="+62 812-3456-7890"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Pengguna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Pengguna <span className="text-red-600">*</span>
              </label>
              <select
                name="status_pengguna"
                value={formData.status_pengguna}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Tipe Pengguna --</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Psikolog">Psikolog</option>
                <option value="Asisten Psikolog">Asisten Psikolog</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
              </button>
            </div>

            {/* Link ke Login */}
            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Login di sini
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
