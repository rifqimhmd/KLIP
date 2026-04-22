import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Inbox,
  User,
  Calendar,
  Tag,
  Building2,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export default function KonsultanTeknisDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active' | 'completed'
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Auth check - hanya berjalan sekali saat mount
  useEffect(() => {
    let isMounted = true;

    api.get('/user')
      .then((r) => {
        if (!isMounted) return;
        const userData = r.data?.user ?? r.data;
        setUser(userData);

        // Redirect jika bukan konsultan teknis atau admin
        const isKonsultanTeknis =
          userData?.status_pengguna === 'Konsultan Teknis' ||
          userData?.status_pengguna === 'Admin';
        if (!isKonsultanTeknis) {
          navigate('/dashboard');
        }
      })
      .catch(() => {
        if (isMounted) navigate('/login');
      });

    return () => { isMounted = false; };
  }, []);

  // Fetch consultations
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setLoading(true);

    api.get('/consultations?type=teknis')
      .then((r) => {
        if (!isMounted) return;
        const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        setConsultations(list);
      })
      .catch((err) => {
        if (isMounted) console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_role');
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Filter consultations
  const pendingConsultations = consultations.filter((c) =>
    c.status === 'pending' && !c.assigned_to
  );
  const activeConsultations = consultations.filter((c) =>
    (c.status === 'pending' || c.status === 'in_progress') && c.assigned_to
  );
  const completedConsultations = consultations.filter((c) =>
    c.status === 'completed'
  );

  const getCategoryLabel = (category) => {
    const labels = {
      'patnal_integritas': 'PATNAL & Integritas',
      'kepatuhan': 'Kepatuhan Internal',
      'investigasi': 'Investigasi Internal',
      'pelanggaran': 'Pelanggaran Disiplin'
    };
    return labels[category] || category;
  };

  const getSubditLabel = (subdit) => {
    const labels = {
      'advokasi': 'Fasilitasi Advokasi & Investigasi Internal',
      'pencegahan': 'Pencegahan & Pengendalian'
    };
    return labels[subdit] || subdit;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      'high': 'Tinggi',
      'medium': 'Sedang',
      'low': 'Rendah'
    };
    return labels[urgency] || urgency;
  };

  const getStatusColor = (status, assignedTo) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (assignedTo) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const getStatusLabel = (status, assignedTo) => {
    if (status === 'completed') return 'Selesai';
    if (assignedTo) return 'Ditangani';
    return 'Menunggu';
  };

  const openChat = (consultationId) => {
    navigate(`/chat/${consultationId}?expert=kasubdit`);
  };

  const viewDetail = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailModal(true);
  };

  const updateStatus = async (consultationId, newStatus) => {
    try {
      await api.put(`/consultations/${consultationId}/teknis`, {
        status: newStatus
      });
      // Refresh consultations list
      const response = await api.get('/consultations?type=teknis');
      setConsultations(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Gagal mengubah status: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const renderConsultationCard = (c) => (
    <div
      key={c.id}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">#{c.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(c.urgency)}`}>
              {getUrgencyLabel(c.urgency)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(c.status, c.assigned_to)}`}>
              {getStatusLabel(c.status, c.assigned_to)}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 truncate">{c.subject}</h3>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {c.user?.name || 'User'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(c.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg">
              <Building2 className="w-3.5 h-3.5" />
              {getSubditLabel(c.subdit)}
            </span>
            <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              <Tag className="w-3.5 h-3.5" />
              {getCategoryLabel(c.category)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {c.status !== 'completed' && (
            <>
              {/* Tombol Chat */}
              <button
                onClick={() => openChat(c.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {c.assigned_to ? 'Lanjutkan Chat' : 'Mulai Chat'}
              </button>

              {/* Tombol Status - muncul untuk konsultan yang bisa handle (unassigned atau assigned ke mereka) */}
              {(c.assigned_to === null || c.assigned_to === user?.id) && (
                <>
                  {c.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(c.id, 'in_progress')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Diproses
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(c.id, 'completed')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Selesai
                  </button>
                </>
              )}
            </>
          )}
          <button
            onClick={() => viewDetail(c)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Detail
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (message) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  );

  const renderTabButton = (tab, label, count, icon) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition -mb-px ${
        activeTab === tab
          ? 'border-cyan-600 text-cyan-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
          activeTab === tab ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Dashboard Konsultan Teknis</h1>
              <p className="text-xs text-gray-500">Kelola konsultasi kepatuhan internal</p>
            </div>
          </div>
          {user && <UserDropdownMenu user={user} onLogout={handleLogout} />}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingConsultations.length}</p>
                <p className="text-sm text-gray-500">Menunggu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeConsultations.length}</p>
                <p className="text-sm text-gray-500">Sedang Ditangani</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedConsultations.length}</p>
                <p className="text-sm text-gray-500">Selesai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Laporan */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            Laporan Konsultasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Laporan Harian */}
            <a
              href="/laporan/harian"
              className="group bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Laporan Harian</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Lihat ringkasan konsultasi harian dengan filter tanggal.</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Lihat Laporan
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Laporan Bulanan */}
            <a
              href="/laporan/bulanan"
              className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Laporan Bulanan</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Analisis trend konsultasi per bulan dengan grafik statistik.</p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                Lihat Laporan
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Laporan Tahunan */}
            <a
              href="/laporan/tahunan"
              className="group bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 hover:shadow-lg hover:border-emerald-300 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Laporan Tahunan</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Evaluasi kinerja tahunan dan perbandingan dengan tahun sebelumnya.</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                Lihat Laporan
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl border border-gray-200 border-b-0">
          <div className="flex border-b border-gray-200 px-4">
            {renderTabButton('pending', 'Menunggu', pendingConsultations.length, <Clock className="w-4 h-4" />)}
            {renderTabButton('active', 'Sedang Ditangani', activeConsultations.length, <MessageSquare className="w-4 h-4" />)}
            {renderTabButton('completed', 'Selesai', completedConsultations.length, <History className="w-4 h-4" />)}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Memuat konsultasi...</p>
            </div>
          ) : (
            <>
              {activeTab === 'pending' && (
                pendingConsultations.length > 0
                  ? <div className="space-y-4">{pendingConsultations.map(renderConsultationCard)}</div>
                  : renderEmptyState('Tidak ada konsultasi yang menunggu')
              )}
              {activeTab === 'active' && (
                activeConsultations.length > 0
                  ? <div className="space-y-4">{activeConsultations.map(renderConsultationCard)}</div>
                  : renderEmptyState('Tidak ada konsultasi yang sedang ditangani')
              )}
              {activeTab === 'completed' && (
                completedConsultations.length > 0
                  ? <div className="space-y-4">{completedConsultations.map(renderConsultationCard)}</div>
                  : renderEmptyState('Tidak ada konsultasi yang selesai')
              )}
            </>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Detail Konsultasi #{selectedConsultation.id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subjek</label>
                  <p className="font-semibold text-gray-900">{selectedConsultation.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedConsultation.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subdit</label>
                    <p className="text-gray-700">{getSubditLabel(selectedConsultation.subdit)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kategori</label>
                    <p className="text-gray-700">{getCategoryLabel(selectedConsultation.category)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tingkat Urgensi</label>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(selectedConsultation.urgency)}`}>
                      {getUrgencyLabel(selectedConsultation.urgency)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedConsultation.status, selectedConsultation.assigned_to)}`}>
                      {getStatusLabel(selectedConsultation.status, selectedConsultation.assigned_to)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Diajukan Oleh</label>
                  <p className="text-gray-700">{selectedConsultation.user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedConsultation.created_at).toLocaleString('id-ID')}
                  </p>
                </div>

                {selectedConsultation.assigned_to && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ditangani Oleh</label>
                    <p className="text-gray-700">{selectedConsultation.assigned_to?.name || 'Konsultan'}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {selectedConsultation.status !== 'completed' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openChat(selectedConsultation.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Buka Chat
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
