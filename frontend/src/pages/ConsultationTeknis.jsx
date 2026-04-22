import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import { LayoutDashboard, ClipboardList, FileBarChart2, Plus, History, MessageSquare, Home, CheckCircle, X, UserCheck, Settings, FileText, Send, Building2 } from 'lucide-react';

export default function ConsultationTeknis() {
  const navigate = useNavigate();
  const [view, setView] = useState('kasubdit_info'); // kasubdit_info | menu | history | create_teknis
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [kasubditInfo, setKasubditInfo] = useState(null);
  const [loadingKasubdit, setLoadingKasubdit] = useState(false);
  const [kasubditFetched, setKasubditFetched] = useState(false);
  const [kasubditError, setKasubditError] = useState(null);
  const isPsikolog = user?.status_pengguna === 'Psikolog' || user?.status_pengguna === 'Asisten Psikolog';
  const isKonsultanTeknis = user?.status_pengguna === 'Konsultan Teknis' || user?.status_pengguna === 'Admin';
  const isAdmin = user?.status_pengguna === 'Admin';
  const canExport = isPsikolog || isAdmin;
  const [exportingFormat, setExportingFormat] = useState(null);
  const [teknisForm, setTeknisForm] = useState({
    subject: '',
    description: '',
    subdit: 'advokasi',
    category: 'patnal_integritas',
    urgency: 'medium'
  });

  // Fetch user data on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        if (isMounted) {
          const currentUser = response.data;
          setUser(currentUser);
          setAuthChecking(false);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        if (isMounted) {
          setAuthChecking(false);
          navigate('/login');
        }
      }
    };
    
    fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Fetch kasubdit info after user is loaded
  useEffect(() => {
    if (!user || kasubditFetched) return;
    
    let isMounted = true;
    
    const fetchKasubditInfo = async () => {
      setLoadingKasubdit(true);
      setKasubditError(null);
      
      try {
        const response = await api.get('/kasubdit');
        if (isMounted) {
          setKasubditInfo(response.data);
          setKasubditFetched(true);
        }
      } catch (err) {
        console.error('Failed to fetch kasubdit info:', err);
        if (isMounted) {
          setKasubditError(err.response?.data?.message || 'Gagal memuat informasi Kasubdit.');
          setKasubditFetched(true); // Mark as fetched even on error to stop loading
        }
      } finally {
        if (isMounted) {
          setLoadingKasubdit(false);
        }
      }
    };
    
    fetchKasubditInfo();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleTeknisChange = (e) => {
    setTeknisForm({
      ...teknisForm,
      [e.target.name]: e.target.value
    });
  };

  const handleTeknisSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Debug: log data yang akan dikirim
    const payload = {
      ...teknisForm,
      type: 'teknis'
    };
    console.log('Submitting teknis consultation:', payload);

    try {
      const response = await api.post('/consultations', payload);
      console.log('Response:', response.data);

      const consultationId = response.data?.consultation?.id;
      setSuccess('Konsultasi teknis berhasil dikirim! Mengalihkan ke chat...');

      // Redirect ke chat setelah 1.5 detik
      setTimeout(() => {
        if (consultationId) {
          navigate(`/chat/${consultationId}?expert=kasubdit`);
        } else {
          setView('menu');
        }
      }, 1500);
    } catch (err) {
      console.error('Error submitting consultation:', err);
      console.error('Error response:', err.response?.data);

      // Tampilkan error detail dari validation
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
        setError(`Gagal mengirim: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Gagal mengirim konsultasi. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    // Handle file upload if needed
    console.log('File selected:', e.target.files[0]);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/');
    }
  };

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="w-full p-6 md:p-10 bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-full">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl border-0 p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">Konsultasi Teknis</h1>
                <p className="text-indigo-100 text-lg drop-shadow">
                  Layanan konsultasi teknis untuk kepatuhan dan regulasi internal dengan pendekatan modern.
                </p>
              </div>
              <UserDropdownMenu user={user} onLogout={handleLogout} />
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl border-0 p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-white/50"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/20 to-purple-50/20 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-50/20 to-indigo-50/20 rounded-full translate-y-24 -translate-x-24"></div>
            <div className="relative z-10">
            {view === 'kasubdit_info' && (
              <div className="py-8">
                {loadingKasubdit ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data...</p>
                  </div>
                ) : kasubditInfo && kasubditInfo.persons ? (
                  <div className="w-full">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800 mb-3">Tim Direktur Kepatuhan Internal</h2>
                      <p className="text-gray-600 text-lg">Pimpinan Direktorat Kepatuhan Internal dan Subdirektorat</p>
                    </div>

                    {/* Pisahkan Direktur dan Kepala Subdirektorat */}
                    {(() => {
                      const direktur = kasubditInfo.persons.find(p => p.position?.toLowerCase().includes('direktur'));
                      const lainnya = kasubditInfo.persons.filter(p => !p.position?.toLowerCase().includes('direktur'));

                      return (
                        <>
                          {/* Direktur - di atas sendiri full width */}
                          {direktur && (
                            <div className="flex justify-center mb-8">
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 max-w-md w-full">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg mb-4">
                                    <img
                                      src={direktur.photo || '/placeholder-avatar.svg'}
                                      alt={direktur.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-avatar.svg';
                                      }}
                                    />
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-1">{direktur.name}</h3>
                                  <p className="text-base text-indigo-600 font-semibold mb-3">{direktur.position}</p>
                                  <p className="text-sm text-gray-600 line-clamp-3">{direktur.description}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Kepala Subdirektorat - di bawah dalam grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {lainnya.map((person) => (
                              <div key={person.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg mb-4">
                                    <img
                                      src={person.photo || '/placeholder-avatar.svg'}
                                      alt={person.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-avatar.svg';
                                      }}
                                    />
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-800 mb-1">{person.name}</h3>
                                  <p className="text-sm text-indigo-600 font-semibold mb-3">{person.position}</p>
                                  <p className="text-xs text-gray-600 line-clamp-3">{person.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}

                    <div className="text-center">
                      <button
                        onClick={() => setView('menu')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Lanjutkan ke Konsultasi Teknis
                      </button>
                    </div>
                  </div>
                ) : kasubditError ? (
                  <div className="w-full max-w-xl mx-auto bg-red-50 border border-red-200 text-red-700 p-8 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-3">Gagal memuat data</h3>
                    <p className="mb-6 text-gray-700">{kasubditError}</p>
                    <button
                      onClick={() => {
                        setKasubditFetched(false);
                        setKasubditError(null);
                      }}
                      className="bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Memuat Informasi</h3>
                    <p className="text-gray-600">Mohon tunggu sebentar...</p>
                  </div>
                )}
              </div>
            )}

            {view === 'menu' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <button onClick={() => setView('create_teknis')} className="group text-left bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-2 border-indigo-200/50 rounded-3xl shadow-lg hover:shadow-xl hover:border-indigo-300 hover:scale-105 transition-all duration-300 p-8 overflow-hidden relative h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-200/40 to-blue-200/40 rounded-bl-full opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-xl mb-3 group-hover:text-indigo-700 transition-colors">Buat Konsultasi Teknis</p>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">Ajukan pertanyaan teknis seputar compliance, regulasi, dan SOP dengan pendekatan modern.</p>
                </button>

                <button onClick={() => setView('history')} className="group text-left bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 border-2 border-slate-200/50 rounded-3xl shadow-lg hover:shadow-xl hover:border-slate-300 hover:scale-105 transition-all duration-300 p-8 overflow-hidden relative h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-200/40 to-gray-200/40 rounded-bl-full opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <History className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-xl mb-3 group-hover:text-slate-700 transition-colors">Riwayat Konsultasi</p>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">Lihat status dan detail konsultasi sebelumnya untuk monitoring perkembangan yang akurat.</p>
                </button>

                <a href="/chat?expert=kasubdit" className="group text-left bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 border-2 border-cyan-200/50 rounded-3xl shadow-lg hover:shadow-xl hover:border-cyan-300 hover:scale-105 transition-all duration-300 p-8 overflow-hidden relative h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-200/40 to-blue-200/40 rounded-bl-full opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-xl mb-3 group-hover:text-cyan-700 transition-colors">Chat Konsultasi Teknis</p>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">Lihat dan lanjutkan chat konsultasi teknis Anda dengan konsultan PATNAL.</p>
                </a>

                <a href="/dashboard" className="group text-left bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200/50 rounded-3xl shadow-lg hover:shadow-xl hover:border-emerald-300 hover:scale-105 transition-all duration-300 p-8 overflow-hidden relative h-full xl:col-span-2 xl:max-w-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/40 to-green-200/40 rounded-bl-full opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 text-xl mb-3 group-hover:text-emerald-700 transition-colors">Kembali ke Dashboard</p>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">Kembali ke ringkasan fitur dan progres integritas Anda dengan tampilan yang intuitif.</p>
                </a>
              </div>
            )}

            {view === 'create_teknis' && (
              <div className="mt-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Form Konsultasi Teknis PATNAL</h2>
                  <p className="text-gray-600 text-lg">Ajukan pertanyaan mengenai kepatuhan internal, integritas, dan regulasi PATNAL dengan mudah.</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="w-full max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-lg">!</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-1">Gagal Mengirim</h4>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="w-full max-w-2xl mx-auto mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Berhasil!</h4>
                        <p className="text-green-700 text-sm">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleTeknisSubmit} className="w-full max-w-2xl mx-auto space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subjek Konsultasi</label>
                    <input
                      type="text"
                      name="subject"
                      value={teknisForm.subject}
                      onChange={handleTeknisChange}
                      required
                      className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
                      placeholder="Contoh: Pertanyaan mengenai integritas dan kepatuhan internal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subdit PATNAL</label>
                      <select
                        name="subdit"
                        value={teknisForm.subdit}
                        onChange={handleTeknisChange}
                        className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all bg-white"
                      >
                        <option value="advokasi">Fasilitasi Advokasi & Investigasi Internal</option>
                        <option value="pencegahan">Pencegahan & Pengendalian</option>
                      </select>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Konsultasi</label>
                      <select
                        name="category"
                        value={teknisForm.category}
                        onChange={handleTeknisChange}
                        className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all bg-white"
                      >
                        <option value="patnal_integritas">PATNAL & Integritas</option>
                        <option value="kepatuhan">Kepatuhan Internal</option>
                        <option value="investigasi">Investigasi Internal</option>
                        <option value="pelanggaran">Pelanggaran Disiplin</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat Urgensi</label>
                    <select
                      name="urgency"
                      value={teknisForm.urgency}
                      onChange={handleTeknisChange}
                        className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all bg-white"
                    >
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Detail</label>
                    <textarea
                      name="description"
                      value={teknisForm.description}
                      onChange={handleTeknisChange}
                      required
                      rows={6}
                      className="w-full border-2 border-rose-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all bg-white resize-none"
                      placeholder="Jelaskan secara detail pertanyaan mengenai PATNAL, integritas, atau kepatuhan internal..."
                    />
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lampiran (Opsional)</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      className="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG (Max 5MB)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    >
                      <Send className="w-5 h-5" />
                      {submitting ? 'Mengirim...' : 'Kirim Konsultasi Teknis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('menu')}
                      className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {view === 'history' && (
              <div className="mt-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">Riwayat Konsultasi</h2>
                  <p className="text-gray-600 text-lg">Pantau perkembangan konsultasi teknis Anda dengan mudah.</p>
                </div>
                
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <History className="w-12 h-12 text-slate-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Riwayat Konsultasi</h3>
                  <p className="text-gray-600 mb-8 text-lg">Fitur riwayat konsultasi sedang dalam pengembangan untuk memberikan pengalaman yang lebih baik.</p>
                  <button
                    onClick={() => setView('menu')}
                    className="px-8 py-4 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-2xl font-bold hover:from-slate-700 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Kembali ke Menu
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
