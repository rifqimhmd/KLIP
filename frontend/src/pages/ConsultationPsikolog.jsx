import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import { LayoutDashboard, ClipboardList, FileBarChart2, Plus, History, MessageSquare, Home, CheckCircle, X, UserCheck, Settings, ArrowLeft, Send } from 'lucide-react';

export default function ConsultationPsikolog() {
  const navigate = useNavigate();
  const [view, setView] = useState('menu'); // menu | history | choose_psikolog | create
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    status: 'in_progress',
    notes: '',
  });
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const isPsikolog = user?.status_pengguna === 'Psikolog' || user?.status_pengguna === 'Asisten Psikolog';
  const isOnlyPsikolog = user?.status_pengguna === 'Psikolog'; // pure psikolog — can assign to asisten
  const isAdmin = user?.status_pengguna === 'Admin';
  const canExport = isPsikolog || isAdmin;
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [locationDetailFilter, setLocationDetailFilter] = useState('all');
  const [psychologists, setPsychologists] = useState([]);
  const [psychologistsLoading, setPsychologistsLoading] = useState(false);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(null);
  const selectedPsychologist = useMemo(() => {
    return psychologists.find(p => p.id === selectedPsychologistId) || null;
  }, [psychologists, selectedPsychologistId]);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [assistants, setAssistants] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecks, setConsentChecks] = useState({
    c1: false,
    c2: false,
    c3: false,
  });
  const [form, setForm] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        const currentUser = response.data;
        setUser(currentUser);
        setAuthChecking(false);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setAuthChecking(false);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch psychologists when needed
  useEffect(() => {
    if (view === 'choose_psikolog' && !isPsikolog) {
      setPsychologistsLoading(true);
      api.get('/psychologists')
        .then((res) => {
          const list = res.data || [];
          setPsychologists(list);
          // Auto-select first available psychologist if none selected
          if (list.length > 0 && !selectedPsychologistId) {
            const firstAvailable = list.find(p => p.is_available);
            if (firstAvailable) setSelectedPsychologistId(firstAvailable.id);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch psychologists:', err);
          setPsychologists([]);
        })
        .finally(() => {
          setPsychologistsLoading(false);
        });
    }
  }, [view, isPsikolog]);

  // Fetch assistants when needed
  useEffect(() => {
    if (isOnlyPsikolog) {
      api.get('/consultations/assistants')
        .then((res) => {
          setAssistants(res.data || []);
        })
        .catch((err) => {
          console.error('Failed to fetch assistants:', err);
          setAssistants([]);
        });
    }
  }, [isOnlyPsikolog]);

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

  const openConsent = () => setShowConsent(true);
  const allChecked = useMemo(() => consentChecks.c1 && consentChecks.c2 && consentChecks.c3, [consentChecks]);

  const handleConsentProceed = () => {
    setShowConsent(false);
    setView('choose_psikolog');
  };

  const resolvePhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    // If the path already starts with http, return as is
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    // Otherwise, construct the full URL
    const baseUrl = api.defaults.baseURL || 'http://localhost:8000';
    return `${baseUrl}/storage/${photoPath}`;
  };

  const handleChoosePsychologist = (psychologistId) => {
    setSelectedPsychologistId(psychologistId);
  };

  const handleAssign = async () => {
    if (!selectedAssigneeId) return;
    
    setAssigningId(selectedAssigneeId);
    try {
      await api.post(`/consultations/${selectedConsultation.id}/assign`, {
        assignee_id: selectedAssigneeId
      });
      
      // Update the selected consultation with the new assignment
      const assignedPsychologist = selectedAssigneeId === user?.id 
        ? user 
        : [...psychologists, ...assistants].find(p => p.id === selectedAssigneeId);
      
      setSelectedConsultation(prev => ({
        ...prev,
        psychologist: assignedPsychologist
      }));
      
      setSelectedAssigneeId('');
    } catch (err) {
      console.error('Failed to assign consultation:', err);
    } finally {
      setAssigningId(null);
    }
  };

  const handleMarkCompleted = async () => {
    setMarkingCompleted(true);
    try {
      await api.post(`/consultations/${selectedConsultation.id}/complete`);
      setSelectedConsultation(prev => ({
        ...prev,
        status: 'completed'
      }));
    } catch (err) {
      console.error('Failed to mark as completed:', err);
    } finally {
      setMarkingCompleted(false);
    }
  };

  const handleToggleAvailability = async () => {
    setAvailabilitySaving(true);
    try {
      const newStatus = !user.is_available;
      await api.put('/consultations/psychologists/availability', {
        is_available: newStatus
      });
      setUser(prev => ({
        ...prev,
        is_available: newStatus
      }));
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs_referral':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return 'Menunggu';
      case 'in_progress':
        return 'Diproses';
      case 'needs_referral':
        return 'Perlu Rujukan';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  const normalizeCaseStatus = (status) => {
    if (!status) return status;
    return status.toLowerCase().replace(/_/g, ' ');
  };

  const handleExportConsultations = async (format) => {
    setExportingFormat(format);
    try {
      const response = await api.get(`/consultations/export/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consultations.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export consultations:', err);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleSubmitFollowUp = async () => {
    setFollowUpSubmitting(true);
    try {
      await api.put(`/consultations/${selectedConsultation.id}`, followUpForm);
      setSelectedConsultation(prev => ({
        ...prev,
        status: followUpForm.status,
        notes: followUpForm.notes
      }));
      setFollowUpForm({ status: 'in_progress', notes: '' });
    } catch (err) {
      console.error('Failed to submit follow-up:', err);
    } finally {
      setFollowUpSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!selectedPsychologistId) {
      setError('Silakan pilih psikolog terlebih dahulu sebelum mengisi asesmen.');
      setView('choose_psikolog');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...form,
        type: 'psikolog'
      };
      // Jika psikolog sudah dipilih, sertakan ID-nya
      // Jika tidak, sistem backend akan auto-assign psikolog yang tersedia
      if (selectedPsychologistId) {
        payload.psikolog_id = selectedPsychologistId;
      }
      const response = await api.post('/consultations', payload);

      setSuccess('Konsultasi berhasil diajukan!');
      setForm({
        q1: '',
        q2: '',
        q3: '',
        q4: '',
        q5: '',
        q6: '',
        q7: '',
      });
      setSelectedPsychologistId(null);
      setView('menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan konsultasi');
    } finally {
      setSubmitting(false);
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
      {/* Informed Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Informed Consent</h2>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Sebelum melanjutkan, harap baca dan setujui pernyataan berikut dengan memberi tanda centang pada setiap poin.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { key: 'c1', text: 'Bersedia untuk berpartisipasi mengikuti seluruh prosedur dalam proses konseling Patnal Integrity Hub.' },
                { key: 'c2', text: 'Menyetujui adanya perekaman data terkait informasi yang diberikan sebagai keperluan administrasi layanan.' },
                { key: 'c3', text: 'Seluruh informasi pribadi dan isi sesi konseling akan dijaga kerahasiaannya.' },
              ].map(({ key, text }, idx) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={consentChecks[key]}
                      onChange={(e) =>
                        setConsentChecks((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        consentChecks[key]
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {consentChecks[key] && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-blue-700 mr-1">{idx + 1}.</span>
                    {text}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConsent(false)}
                className="flex-1 text-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConsentProceed}
                disabled={!allChecked}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  allChecked
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Saya Setuju &amp; Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for consultation detail */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedConsultation(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Konsultasi #{selectedConsultation.id}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-medium text-gray-700">{selectedConsultation.user?.name || '-'}</span>
                  <span className="mx-1 text-gray-300">·</span>
                  {new Date(selectedConsultation.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedConsultation(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status + psikolog */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedConsultation.status)}`}>
                {getStatusLabel(selectedConsultation.status)}
              </span>
              {selectedConsultation.psikolog && (
                <span className="text-xs text-blue-600 font-medium">· Ditangani: {selectedConsultation.psikolog.name}</span>
              )}
            </div>

            {/* Q&A */}
            <div className="space-y-3 mb-5">
              {[
                { q: '1. Apa yang membuat Anda memutuskan untuk mengikuti konseling?', a: selectedConsultation.q1 },
                { q: '2. Rangkaian aktivitas dalam dua minggu terakhir', a: selectedConsultation.q2 },
                { q: '3. Keluhan/permasalahan yang ingin dikonsultasikan', a: selectedConsultation.q3 },
                { q: '4. Apa yang akan terjadi jika tidak segera ditangani?', a: selectedConsultation.q4 },
                { q: '5. Bentuk dukungan dari lingkungan sekitar', a: selectedConsultation.q5 },
                { q: '6. Tantangan yang membuat melanggar prinsip kepatuhan', a: selectedConsultation.q6 },
                { q: '7. Harapan setelah melakukan sesi konseling', a: selectedConsultation.q7 },
              ].map(({ q, a }, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">{q}</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

            {/* Catatan psikolog */}
            {selectedConsultation.notes && (
              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">Catatan Psikolog</p>
                <p className="text-sm text-blue-900">{selectedConsultation.notes}</p>
              </div>
            )}

            {/* Tandai Selesai — for user when needs_referral */}
            {!isPsikolog && !isAdmin && normalizeCaseStatus(selectedConsultation.status) === 'needs_referral' && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 mb-3">
                  Anda dirujuk ke psikiater. Setelah selesai mengunjungi psikiater, tandai konsultasi ini sebagai selesai.
                </p>
                <button
                  type="button"
                  onClick={handleMarkCompleted}
                  disabled={markingCompleted}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {markingCompleted ? 'Memproses...' : 'Tandai Selesai'}
                </button>
              </div>
            )}

            {/* Tindak Lanjut — for psikolog */}
            {isPsikolog && (
              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-blue-800">Tindak Lanjut Psikolog</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={followUpForm.status}
                    onChange={(e) => setFollowUpForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Tunggu</option>
                    <option value="in_progress">Diproses</option>
                    <option value="needs_referral">Perlu Rujukan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Psikolog</label>
                  <textarea
                    value={followUpForm.notes}
                    onChange={(e) => setFollowUpForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Tulis catatan tindak lanjut untuk klien"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmitFollowUp}
                  disabled={followUpSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {followUpSubmitting ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}
                </button>
              </div>
            )}

            {/* Delegasikan ke Asisten */}
            {isOnlyPsikolog && (
              <div className="mb-5 bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold text-orange-800">Delegasikan ke Asisten Psikolog</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Oper tugas penanganan konsultasi ini ke Asisten Psikolog. Anda juga bisa mengambil kembali dengan memilih diri sendiri.
                </p>
                {selectedConsultation?.psikolog && selectedConsultation.psikolog.id !== user?.id && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-200 rounded-lg text-sm">
                    <span className="text-orange-700 font-medium">Saat ini ditangani oleh:</span>
                    <span className="text-orange-900">{selectedConsultation.psikolog.name}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <select
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">— Pilih Asisten / Ambil Kembali —</option>
                    <option value={user?.id}>Saya sendiri (ambil kembali)</option>
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}{a.is_available ? '' : ' (Tidak Tersedia)'}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={!selectedAssigneeId || assigningId !== null}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 whitespace-nowrap"
                  >
                    {assigningId !== null ? 'Mendelegasikan...' : 'Delegasikan'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Konsultasi Psikolog</h1>
                <p className="text-gray-600">
                  Layanan konsultasi psikologis untuk kesehatan mental dan wellbeing.
                </p>
              </div>
              <UserDropdownMenu user={user} onLogout={handleLogout} />
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <>
              {view === 'menu' && (
                <>
                  {isPsikolog && (
                    <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl border ${
                      user?.is_available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          user?.is_available ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <CheckCircle className={`w-5 h-5 ${user?.is_available ? 'text-green-600' : 'text-red-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Status Ketersediaan</p>
                          <p className={`text-xs font-medium ${user?.is_available ? 'text-green-700' : 'text-red-700'}`}>
                            {user?.is_available ? 'Anda tersedia untuk konsultasi' : 'Anda tidak tersedia'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleAvailability}
                        disabled={availabilitySaving}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                          user?.is_available ? 'bg-green-500' : 'bg-red-400'
                        } ${availabilitySaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                        aria-label="Toggle ketersediaan psikolog"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            user?.is_available ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {isPsikolog ? (
                    <>
                      <button onClick={() => setView('history')} className="group text-left bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                          <ClipboardList className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Hasil Assesment</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat hasil assesment klien Anda dan Kelola konsultasi yang sedang berlangsung.</p>
                      </button>

                      <button onClick={() => setView('history')} className="group text-left bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                          <History className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Riwayat Konsultasi</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat status dan detail konsultasi sebelumnya untuk monitoring dan pelaporan.</p>
                      </button>

                      <a href="/chat?expert=psikolog" className="group text-left bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                          <MessageSquare className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Chat Konsultasi Psikolog</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Akses percakapan dengan klien untuk sesi konseling.</p>
                      </a>

                      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm p-6 h-full flex flex-col justify-center">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                          <FileBarChart2 className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Laporan & Analitik</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Akses laporan lengkap dan analitik konsultasi untuk keperluan administrasi.</p>
                        <a href="/reports" className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm">
                          Lihat Laporan <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <button onClick={openConsent} className="group text-left bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 rounded-2xl border shadow-sm hover:shadow-lg hover:border-purple-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                          <Plus className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Buat Konsultasi Psikolog</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Isi form profiling untuk memulai sesi konseling dengan psikolog bersertifikat.</p>
                      </button>

                      <button onClick={() => setView('history')} className="group text-left bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                          <History className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Riwayat Konsultasi</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat status dan detail konsultasi sebelumnya untuk monitoring perkembangan.</p>
                      </button>

                      <a href="/chat?expert=psikolog" className="group text-left bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                          <MessageSquare className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Chat Konsultasi Psikolog</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat dan lanjutkan chat konsultasi psikolog Anda.</p>
                      </a>

                      <a href="/dashboard" className="group text-left bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                          <Home className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Kembali ke Dashboard</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Kembali ke ringkasan fitur dan progres integritas Anda.</p>
                      </a>
                    </>
                  )}
                  </div>
                </>
              )}

              {view === 'choose_psikolog' && !isPsikolog && (
                <div className="mt-4">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Tim Psikologi</h2>
                    <p className="text-gray-600 text-lg">Konselor profesional kami siap mendampingi kesehatan mental dan wellbeing Anda.</p>
                  </div>

                  {psychologistsLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Memuat data tim psikologi...</p>
                    </div>
                  )}

                  {!psychologistsLoading && psychologists.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500">Belum ada Psikologi yang terdaftar saat ini.</p>
                    </div>
                  )}

                  {!psychologistsLoading && psychologists.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 place-items-center">
                      {psychologists.map((psikolog) => {
                        const isSelected = selectedPsychologistId === psikolog.id;

                        return (
                          <div 
                            key={psikolog.id} 
                            onClick={() => psikolog.is_available && setSelectedPsychologistId(psikolog.id)}
                            className={`group bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden cursor-pointer ${
                              isSelected 
                                ? 'border-purple-500 shadow-xl scale-105' 
                                : 'border-purple-100/50 shadow-lg hover:shadow-xl hover:border-purple-300'
                            } ${!psikolog.is_available ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                          >
                            {isSelected && (
                              <div className="absolute top-4 right-4 bg-purple-600 text-white rounded-full p-1 shadow-lg z-10">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                            
                            <div className="flex flex-col items-center text-center relative z-10">
                              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 bg-white shadow-lg mb-6 transition-transform duration-500 ${isSelected ? 'border-purple-400 scale-110' : 'border-purple-100 group-hover:scale-105'}`}>
                                {psikolog.foto ? (
                                  <img
                                    src={resolvePhotoUrl(psikolog.foto)}
                                    alt={psikolog.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/placeholder-avatar.svg'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-3xl font-bold">
                                    {(psikolog.name || 'P').charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{psikolog.name}</h3>
                              <p className="text-sm text-purple-600 font-semibold mb-3">Psikolog Profesional</p>
                              
                              <div className="space-y-1 mb-4">
                                <p className="text-xs text-gray-500 font-mono">NIP: {psikolog.nip || '-'}</p>
                                <p className="text-xs text-gray-400 line-clamp-2">{psikolog.organization_detail || 'Direktorat Kepatuhan Internal'}</p>
                              </div>

                              <div className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${
                                psikolog.is_available 
                                  ? 'bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {psikolog.is_available ? 'Tersedia untuk Konsultasi' : 'Sedang Tidak Tersedia'}
                              </div>
                            </div>

                            {/* Decorative element */}
                            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/20 rounded-full transition-transform duration-700 ${isSelected ? 'scale-150' : 'group-hover:scale-125'}`} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setView('create')}
                      disabled={psychologistsLoading || !selectedPsychologistId}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    >
                      <Send className="w-5 h-5" />
                      Lanjutkan ke Form Asesmen
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('menu')}
                      className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {view === 'create' && (
                <div className="mt-2">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">Form Profiling Konsultasi</h2>
                      <p className="text-sm text-gray-500">Jawab setiap pertanyaan dengan jujur untuk membantu psikolog memahami kondisi Anda.</p>
                    </div>
                    <button onClick={() => setView('choose_psikolog')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                  </div>

                  {/* Info Card */}
                  <div className="mb-5 border border-blue-100 rounded-2xl bg-blue-50/50 p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Informasi:</strong> Setelah Anda mengisi form ini, sistem akan mencarikan psikolog yang tersedia untuk menangani konsultasi Anda.
                    </p>
                  </div>

          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'q1', label: '1. Apa yang membuat Anda memutuskan untuk mengikuti konseling?' },
              { name: 'q2', label: '2. Ceritakan rangkaian aktivitas yang Anda lakukan dalam dua minggu terakhir!' },
              { name: 'q3', label: '3. Tulis keluhan/permasalahan yang ingin Anda konsultasikan! (Semakin detail akan semakin baik)' },
              { name: 'q4', label: '4. Apa yang akan terjadi jika permasalahan ini tidak segera ditangani?' },
              { name: 'q5', label: '5. Ceritakan bentuk dukungan dari lingkungan sekitar Anda!' },
              { name: 'q6', label: '6. Apa tantangan yang membuat Anda melanggar prinsip kepatuhan?' },
              { name: 'q7', label: '7. Apa harapan Anda setelah melakukan sesi konseling nanti?' },
            ].map(({ name, label }) => (
              <div key={name} className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <textarea
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                />
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Kirim Konsultasi'}
              </button>
              <button
                type="button"
                onClick={() => setView('menu')}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Batal
              </button>
            </div>
          </form>
                </div>
              )}

              {view === 'history' && (
                <div className="mt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Riwayat Konsultasi</h2>
            {canExport && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleExportConsultations('pdf')}
                  disabled={exportingFormat !== null}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {exportingFormat === 'pdf' ? 'Mengunduh...' : 'Export PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportConsultations('excel')}
                  disabled={exportingFormat !== null}
                  className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {exportingFormat === 'excel' ? 'Mengunduh...' : 'Export Excel'}
                </button>
              </div>
            )}
          </div>
          
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Riwayat Konsultasi</h3>
            <p className="text-gray-600 mb-6">Fitur riwayat konsultasi sedang dalam pengembangan.</p>
            <button
              onClick={() => setView('menu')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
