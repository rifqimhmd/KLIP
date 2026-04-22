import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { UPT_BY_PROVINCE, UPT_PROVINCES } from '../lib/uptOptions';
import Logo from '../components/Logo';
import { Eye, EyeOff, X } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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

  const pangkatGolonganOptions = [
    'Ia', 'Ib', 'Ic', 'Id', 'Ie',
    'IIa', 'IIb', 'IIc', 'IId', 'IIe',
    'IIIa', 'IIIb', 'IIIc', 'IIId', 'IIIe',
    'IVa', 'IVb', 'IVc', 'IVd', 'IVe',
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

    if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password harus mengandung kombinasi huruf dan angka');
      setLoading(false);
      return;
    }

    if (formData.status_pengguna !== 'Admin' && !/^\d{16}$/.test(formData.nip)) {
      setError('NIP harus tepat 16 digit angka');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat dan Ketentuan sebelum mendaftar');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting registration with data:', {
        ...formData,
        password: '***',
        password_confirmation: '***'
      });
      
      const response = await api.post('/register', formData);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block cursor-pointer">
            <Logo className="h-14 w-auto mx-auto mb-4 drop-shadow hover:opacity-80 transition-opacity" alt="KLIP Logo" />
          </a>
          <h1 className="text-3xl font-bold text-blue-700">Daftar Akun</h1>
          <p className="text-gray-500 mt-1 text-sm">Isi data diri Anda untuk bergabung dengan kami</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Progress bar top */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-400" />

          <div className="p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Registrasi berhasil! Anda akan dialihkan ke halaman login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Seksi: Informasi Akun ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informasi Akun</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-4">
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nama lengkap sesuai identitas"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NIP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        NIP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleChange}
                        placeholder="Nomor Induk Pegawai"
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {formData.status_pengguna !== 'Admin' && (
                        <p className="text-xs text-gray-400 mt-1">Harus tepat 16 digit angka</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nama@email.com"
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Min. 8 karakter"
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Kombinasi huruf &amp; angka, min. 8 karakter</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Konfirmasi Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswordConfirm ? 'text' : 'password'}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder="Ulangi password"
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition">
                          {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Seksi: Informasi Kepegawaian ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informasi Kepegawaian</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-4">
                  {/* Daftar Sebagai */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Daftar Sebagai <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="daftar_sebagai"
                      value={formData.daftar_sebagai}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">-- Pilih Unit --</option>
                      <option value="UPT">UPT: Daerah</option>
                      <option value="Kanwil">Kanwil: Provinsi</option>
                      <option value="Ditjenpas">Ditjenpas: Direktorat Jenderal Pemasyarakatan</option>
                    </select>
                  </div>

                  {formData.daftar_sebagai === 'Ditjenpas' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pilih Direktorat <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="organization_detail"
                        value={formData.organization_detail}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      >
                        <option value="">-- Pilih Direktorat --</option>
                        {directorates.map((dir, index) => (
                          <option key={index} value={dir}>{dir}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.daftar_sebagai === 'Kanwil' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pilih Kanwil <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="organization_detail"
                        value={formData.organization_detail}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      >
                        <option value="">-- Pilih Kanwil --</option>
                        {kanwilList.map((kanwil, index) => (
                          <option key={index} value={kanwil}>{kanwil}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.daftar_sebagai === 'UPT' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Pilih Provinsi UPT <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedUptProvince}
                          onChange={handleUptProvinceChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                        >
                          <option value="">-- Pilih Provinsi --</option>
                          {UPT_PROVINCES.map((province) => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Pilih UPT <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedUptName}
                          onChange={handleUptDetailChange}
                          required
                          disabled={!selectedUptProvince}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          <option value="">-- Pilih UPT --</option>
                          {(UPT_BY_PROVINCE[selectedUptProvince] || []).map((upt, index) => (
                            <option key={`${selectedUptProvince}-${index}`} value={upt}>{upt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pangkat */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pangkat/Golongan <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="pangkat_golongan"
                        value={formData.pangkat_golongan}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      >
                        <option value="">-- Pilih Pangkat/Golongan --</option>
                        {pangkatGolonganOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jabatan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Jabatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleChange}
                        placeholder="Contoh: Staf Pengawasan"
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Bagian */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Instansi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="instansi"
                      value={formData.instansi}
                      onChange={handleChange}
                      placeholder="Contoh: Kepatuhan Internal"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* ── Seksi: Kontak & Tipe ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Kontak &amp; Tipe Pengguna</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* No WA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="no_wa"
                      value={formData.no_wa}
                      onChange={handleChange}
                      placeholder="+62 812-3456-7890"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Status Pengguna */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tipe Pengguna <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status_pengguna"
                      value={formData.status_pengguna}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">-- Pilih Tipe Pengguna --</option>
                      <option value="User">User</option>
                      <option value="Psikolog">Psikolog</option>
                      <option value="Asisten Psikolog">Asisten Psikolog</option>
                      <option value="Konsultan Teknis">Konsultan Teknis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="pt-2">
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    Saya telah membaca dan menyetujui{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      Syarat dan Ketentuan
                    </button>
                    {' '}penggunaan aplikasi KLIP. Saya menyatakan bahwa data yang diisi adalah benar dan dapat dipertanggungjawabkan.
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-blue-200 hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Mendaftar...
                    </>
                  ) : 'Daftar Sekarang'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Sudah punya akun?{' '}
                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                  Login di sini
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Syarat dan Ketentuan Penggunaan website</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-gray-600 leading-relaxed">
              <p className="text-gray-500 text-xs">Berlaku sejak: 1 Januari 2025</p>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">1. Penerimaan Syarat</h3>
                <p>Dengan mendaftar dan menggunakan aplikasi <strong>KLIP (Konsultasi Layanan Informasi Pemasyarakatan)</strong>, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku di bawah ini.</p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">2. Penggunaan Akun</h3>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Akun hanya dapat digunakan oleh pegawai yang berwenang di lingkungan Pemasyarakatan.</li>
                  <li>Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan aktivitas yang terjadi pada akun Anda.</li>
                  <li>Dilarang keras meminjamkan, mengalihkan, atau menyalahgunakan akun kepada pihak lain.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">3. Kebenaran Data</h3>
                <p>Pengguna wajib mengisi data registrasi secara lengkap dan benar sesuai identitas resmi. Pemalsuan data dapat mengakibatkan penonaktifan akun dan tindakan hukum sesuai peraturan yang berlaku.</p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">4. Kerahasiaan Informasi</h3>
                <p>Seluruh informasi, dokumen, dan materi yang tersedia di dalam aplikasi bersifat rahasia dan hanya diperuntukkan bagi pengguna yang berwenang. Dilarang menyebarluaskan informasi tersebut kepada pihak yang tidak berkepentingan.</p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">5. Privasi Data</h3>
                <p>Data pribadi yang Anda berikan akan digunakan semata-mata untuk keperluan operasional aplikasi Patnal Integrity Hub dan tidak akan diberikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum atau peraturan yang berlaku.</p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">6. Kewajiban Pengguna</h3>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Menggunakan aplikasi sesuai dengan tujuan yang ditetapkan.</li>
                  <li>Tidak melakukan tindakan yang dapat merusak, mengganggu, atau mencuri data sistem.</li>
                  <li>Segera melaporkan kepada administrator jika menemukan celah keamanan atau penyalahgunaan.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">7. Perubahan Syarat</h3>
                <p>Pengelola Patnal Integrity Hub berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui aplikasi dan berlaku sejak tanggal pengumuman.</p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-1">8. Hukum yang Berlaku</h3>
                <p>Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia dan peraturan perundang-undangan terkait penyelenggaraan Pemasyarakatan.</p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                onClick={() => { setAgreedToTerms(true); setShowTermsModal(false); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
              >
                Saya Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}