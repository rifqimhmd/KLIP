import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { Eye, EyeOff, Lock, User, ArrowRight, CheckCircle, MessageCircle, Settings } from 'lucide-react';
import TextCaptcha from '../components/TextCaptcha';
import ConfirmModal from '../components/ConfirmModal';

export default function Login() {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [logos, setLogos] = useState({
    home_logo: null,
    login_logo_kemenkumham: null,
    login_logo_ditjen: null
  });
  
  // CAPTCHA states
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  
  // Login confirmation modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Fetch logos from site-settings
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await api.get("/site-settings");
        setLogos({
          home_logo: res.data?.home_logo || null,
          login_logo_kemenkumham: res.data?.login_logo_kemenkumham || null,
          login_logo_ditjen: res.data?.login_logo_ditjen || null
        });
      } catch (err) {
        console.error("Failed to fetch logos:", err);
      }
    };
    fetchLogos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate CAPTCHA
    if (!captchaValid || !captchaInput) {
      setError('Jawaban CAPTCHA salah atau belum diisi. Silakan coba lagi.');
      return;
    }
    
    // Show confirmation modal before login
    const identifier = nip.trim();
    if (!identifier || !password.trim()) {
      setError('NIP dan password harus diisi.');
      return;
    }
    
    setPendingLoginData({ identifier, password: password.trim() });
    setShowLoginModal(true);
  };
  
  const executeLogin = async () => {
    setShowLoginModal(false);
    setLoading(true);
    
    const { identifier, password: userPassword } = pendingLoginData;
    console.log('Login request data:', { nip: identifier, password: userPassword });
    try {
      // POST to login route (returns bearer token)
      // No CSRF token needed for Sanctum bearer token auth
      const response = await api.post('/login', { nip: identifier, password: userPassword });

      // Store the token
      const token = response.data.access_token;
      localStorage.setItem('auth_token', token);

      // Set the token in axios headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Re-fetch current user to avoid stale profile data from any cached response.
      const meResponse = await api.get('/user');
      const currentUser = meResponse?.data?.user || meResponse?.data;

      // On success redirect based on user role
      const role = currentUser?.status_pengguna || currentUser?.daftar_sebagai || response?.data?.user?.status_pengguna || response?.data?.user?.daftar_sebagai;

      // Normalize role to consistent format - preserve actual role
      const normalizedRole = role ?
        (role.toLowerCase() === 'admin' ? 'Admin' :
          role.toLowerCase() === 'psikolog' ? 'Psikolog' :
            role.toLowerCase() === 'asisten psikolog' ? 'Asisten Psikolog' :
              'User') : 'User';

      localStorage.setItem('auth_user_role', normalizedRole);
      localStorage.setItem('auth_user_data', JSON.stringify(currentUser || response?.data?.user));

      const defaultPath = normalizedRole === 'Admin' ? '/admin/dashboard' : '/dashboard';
      navigate(from !== '/dashboard' ? from : defaultPath, { replace: true });
    } catch (err) {
      const backendMessage =
        err?.response?.data?.errors?.nip?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message;
      setError(backendMessage || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <img 
            src={logos.home_logo || "/Logo.png"} 
            alt="KLIP Logo" 
            className="h-10 w-auto drop-shadow-md" 
          />
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Selamat Datang<br />di Patnal Integrity Hub
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Platform konsultasi psikologi dan teknis kepatuhan internal digital untuk pegawai pemasyarakatan.
          </p>
          <div className="space-y-3">
            {[
              'Konsultasi Psikologi & Teknis',
              'Layanan Psikologi & Teknis Terpercaya',
              'Data Aman & Terjamin',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-200 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logos */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            {logos.login_logo_kemenkumham && (
              <img 
                src={logos.login_logo_kemenkumham} 
                alt="Kementerian Imigrasi dan Pemasyarakatan" 
                className="h-16 w-auto drop-shadow-md"
              />
            )}
            {logos.login_logo_ditjen && (
              <img 
                src={logos.login_logo_ditjen} 
                alt="Direktorat Jenderal Pemasyarakatan" 
                className="h-14 w-auto drop-shadow-md"
              />
            )}
          </div>
          <p className="text-blue-200 text-xs">
            © {new Date().getFullYear()} Kementerian Imigrasi dan Pemasyarakatan - Direktorat Jenderal Pemasyarakatan
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden justify-center mb-8">
            <img src="/Logo.png" alt="KLIP Logo" className="h-12 w-auto" />
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Masuk Akun</h2>
              <p className="text-gray-500 text-sm mt-1">Masukkan NIP atau email dan password Anda</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
              {/* NIP / Email */}
              <div>
                <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700 mb-1.5">
                  NIP / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="login-identifier"
                    name="identifier"
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Masukkan NIP atau email"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA - Text Scrambled */}
              <TextCaptcha 
                onValidate={setCaptchaValid}
                onChange={setCaptchaInput}
              />

              {/* Forgot password */}
              <div className="flex justify-end">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  Lupa password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-blue-200 hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              {/* Quick Access - Konsultasi */}
              <div className="mb-6 text-center">
                <p className="text-xs text-gray-500 mb-3">Akses Cepat Konsultasi</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/consultation-psikolog"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-purple-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Konsultasi Psikolog
                  </a>
                  <a
                    href="/consultation-teknis"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm hover:shadow-blue-200"
                  >
                    <Settings className="w-4 h-4" />
                    Konsultasi Teknis
                  </a>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Belum punya akun?{' '}
                  <a href="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                    Daftar sekarang
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Confirmation Modal */}
      <ConfirmModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={executeLogin}
        title="Konfirmasi Login"
        message={`Anda akan login dengan NIP: ${pendingLoginData?.identifier || ''}. Pastikan data Anda sudah benar.`}
        confirmText="Ya, Login"
        cancelText="Batal"
        type="login"
      />
    </div>
  );
}
