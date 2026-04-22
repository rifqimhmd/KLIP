import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import Logo from '../components/Logo';
import { LayoutDashboard, Lock, Eye, EyeOff } from 'lucide-react';

export default function UpdatePassword() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.new_password !== formData.new_password_confirmation) {
      setError('Password baru tidak cocok');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password baru minimal 8 karakter');
      return;
    }

    try {
      setUpdating(true);
      await api.post('/update-password', {
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.new_password_confirmation,
      });

      setSuccess('Password berhasil diubah');
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
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
                <a href="/update-password" className="flex items-center gap-3 px-4 py-2.5 text-blue-700 bg-blue-50 font-semibold text-sm border-l-4 border-blue-600">
                  <Lock className="w-4 h-4 flex-shrink-0" /> Ubah Password
                </a>
              </nav>
            </div>
          </aside>

          {/* Update Password Form */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Ubah Password</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Saat Ini <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      required
                      placeholder="Minimal 8 karakter"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="new_password_confirmation"
                      value={formData.new_password_confirmation}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
