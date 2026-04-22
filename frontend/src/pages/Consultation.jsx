import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import { LayoutDashboard, ClipboardList, FileBarChart2, Plus, History, MessageSquare, Home, CheckCircle, X, UserCheck, Settings, FileText, Send } from 'lucide-react';

export default function Consultation() {
  const navigate = useNavigate();
  const [view, setView] = useState('menu'); // menu | history | choose_psikolog | create | create_teknis
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
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [assistants, setAssistants] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  const [showConsent, setShowConsent] = useState(false);
  const [consentChecks, setConsentChecks] = useState({ c1: false, c2: false, c3: false });
  const allChecked = consentChecks.c1 && consentChecks.c2 && consentChecks.c3;

  function openConsent() {
    setConsentChecks({ c1: false, c2: false, c3: false });
    setShowConsent(true);
  }

  function handleConsentProceed() {
    setShowConsent(false);
    setView('create');
  }

  const [form, setForm] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
  });

  const [teknisForm, setTeknisForm] = useState({
    subject: '',
    description: '',
    urgency: 'medium', // low | medium | high
    subdit: 'advokasi', // advokasi | pencegahan
    category: 'patnal_integritas', // patnal_integritas | kepatuhan | investigasi | pelanggaran
    attachment: null,
  });

  const selectedPsychologist = useMemo(
    () => psychologists.find((item) => item.id === selectedPsychologistId) || null,
    [psychologists, selectedPsychologistId]
  );

  const normalizeCaseStatus = (status) => {
    if (status === 'reviewed') return 'in_progress';
    return status || 'pending';
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = normalizeCaseStatus(status);
    if (normalizedStatus === 'completed') return 'Selesai';
    if (normalizedStatus === 'in_progress') return 'Diproses';
    if (normalizedStatus === 'needs_referral') return 'Perlu Rujukan';
    return 'Tunggu';
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = normalizeCaseStatus(status);
    if (normalizedStatus === 'completed') return 'bg-green-100 text-green-800';
    if (normalizedStatus === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (normalizedStatus === 'needs_referral') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const normalizeLocationType = (value) => {
    const normalized = (value || '').toLowerCase();
    if (!normalized) return 'unknown';
    if (normalized === 'upt' || normalized === 'kanwil' || normalized === 'ditjenpas') {
      return normalized;
    }
    return 'other';
  };

  const getLocationLabel = (consultation) => {
    const locationType = normalizeLocationType(consultation?.user?.daftar_sebagai);
    const detail = (consultation?.user?.organization_detail || '').trim();
    if (!detail) return '-';

    if (locationType === 'upt') {
      const [wilayah, uptName] = detail.split(' - ').map((item) => item?.trim());
      if (wilayah && uptName) return `${wilayah} - ${uptName}`;
    }

    return detail;
  };

  const availableLocationDetails = useMemo(() => {
    const options = new Set();

    consultations.forEach((consultation) => {
      const type = normalizeLocationType(consultation?.user?.daftar_sebagai);
      const detail = getLocationLabel(consultation);
      if (!detail || detail === '-') return;
      if (locationTypeFilter !== 'all' && type !== locationTypeFilter) return;
      options.add(detail);
    });

    return Array.from(options).sort((a, b) => a.localeCompare(b, 'id'));
  }, [consultations, locationTypeFilter]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const type = normalizeLocationType(consultation?.user?.daftar_sebagai);
      const detail = getLocationLabel(consultation);

      if (locationTypeFilter !== 'all' && type !== locationTypeFilter) {
        return false;
      }

      if (locationDetailFilter !== 'all' && detail !== locationDetailFilter) {
        return false;
      }

      return true;
    });
  }, [consultations, locationTypeFilter, locationDetailFilter]);

  useEffect(() => {
    setLocationDetailFilter('all');
  }, [locationTypeFilter]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUser();
  }, [navigate]);

  // Fetch user data
  async function fetchUser() {
    try {
      const response = await api.get('/user');
      const userData = response?.data?.user || response?.data;

      if ((userData?.status_pengguna || '').toLowerCase() === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    } finally {
      setAuthChecking(false);
    }
  }

  // Fetch consultations when history view is selected
  useEffect(() => {
    if (view === 'history') {
      fetchConsultations();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'choose_psikolog' && !isPsikolog) {
      fetchPsychologists();
    }
  }, [view, isPsikolog]);

  async function fetchPsychologists() {
    setPsychologistsLoading(true);
    setError(null);

    try {
      const response = await api.get('/consultations/psychologists');
      const list = Array.isArray(response?.data) ? response.data : [];
      setPsychologists(list);
      if (list.length > 0 && !selectedPsychologistId) {
        const available = list.find((item) => item.is_available);
        setSelectedPsychologistId(available?.id ?? list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch psychologists:', err);
      setError('Gagal memuat daftar psikolog.');
    } finally {
      setPsychologistsLoading(false);
    }
  }

  async function fetchConsultations() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data);
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
      setError('Gagal memuat riwayat konsultasi');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailability() {
    if (!isPsikolog || availabilitySaving) return;

    const nextValue = !(user?.is_available ?? true);
    setError(null);
    setSuccess(null);

    try {
      setAvailabilitySaving(true);
      const response = await api.put('/consultations/psychologists/availability', {
        is_available: nextValue,
      });

      const updatedAvailability = Boolean(response?.data?.is_available ?? nextValue);
      setUser((prev) => ({
        ...prev,
        is_available: updatedAvailability,
      }));
      setSuccess(`Status psikolog berhasil diperbarui menjadi ${updatedAvailability ? 'Tersedia' : 'Tidak Tersedia'}.`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memperbarui status psikolog.');
    } finally {
      setAvailabilitySaving(false);
    }
  }

  function openConsultationDetail(consultation) {
    setSelectedConsultation(consultation);
    setFollowUpForm({
      status: normalizeCaseStatus(consultation?.status),
      notes: consultation?.notes || '',
    });
    setSelectedAssigneeId('');
    if (isOnlyPsikolog && assistants.length === 0) {
      fetchAssistants();
    }
  }

  async function fetchAssistants() {
    try {
      const response = await api.get('/consultations/assistants');
      setAssistants(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch assistants:', err);
    }
  }

  async function handleAssign() {
    if (!selectedConsultation || !selectedAssigneeId) return;
    setError(null);
    try {
      setAssigningId(selectedAssigneeId);
      const response = await api.post(`/consultations/${selectedConsultation.id}/assign`, {
        assignee_id: Number(selectedAssigneeId),
      });
      const updated = response?.data?.consultation;
      if (updated) {
        setSelectedConsultation(updated);
        setConsultations((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }
      setSuccess('Konsultasi berhasil didelegasikan.');
      setSelectedAssigneeId('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mendelegasikan konsultasi.');
    } finally {
      setAssigningId(null);
    }
  }

  async function handleSubmitFollowUp() {
    if (!selectedConsultation) return;

    setError(null);

    try {
      setFollowUpSubmitting(true);
      const response = await api.put(`/consultations/${selectedConsultation.id}`, {
        status: followUpForm.status,
        notes: followUpForm.notes,
      });

      const updatedConsultation = response?.data?.consultation;
      if (updatedConsultation) {
        setSelectedConsultation(updatedConsultation);
        setConsultations((prev) =>
          prev.map((item) => (item.id === updatedConsultation.id ? updatedConsultation : item))
        );
      }

      setSuccess('Tindak lanjut psikolog berhasil disimpan.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan tindak lanjut psikolog.');
    } finally {
      setFollowUpSubmitting(false);
    }
  }

  async function handleMarkCompleted() {
    if (!selectedConsultation) return;
    setError(null);
    try {
      setMarkingCompleted(true);
      const response = await api.post(`/consultations/${selectedConsultation.id}/complete`);
      const updatedConsultation = response?.data?.consultation;
      if (updatedConsultation) {
        setSelectedConsultation(updatedConsultation);
        setConsultations((prev) =>
          prev.map((item) => (item.id === updatedConsultation.id ? updatedConsultation : item))
        );
      }
      setSuccess('Konsultasi berhasil ditandai selesai.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menandai konsultasi sebagai selesai.');
    } finally {
      setMarkingCompleted(false);
    }
  }

  async function handleExportConsultations(format) {
    setExportingFormat(format);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get(`/consultations/export/${format}`, {
        responseType: 'blob',
      });

      // Check if the response is actually an error (JSON blob)
      const contentType = response.headers?.['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json?.message || 'Gagal export laporan');
      }

      const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const disposition = response.headers?.['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename="?([^"\s]+)"?/i);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = filenameMatch?.[1] || `laporan-konsultasi-${timestamp}.${format === 'pdf' ? 'pdf' : 'csv'}`;

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 200);

      setSuccess(`File ${format.toUpperCase()} berhasil diunduh.`);
    } catch (err) {
      setError(err?.message || 'Gagal export laporan konsultasi.');
    } finally {
      setExportingFormat(null);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleTeknisChange(e) {
    const { name, value } = e.target;
    setTeknisForm((p) => ({ ...p, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setTeknisForm((p) => ({ ...p, attachment: file }));
  }

  async function handleTeknisSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('subject', teknisForm.subject);
      formData.append('description', teknisForm.description);
      formData.append('urgency', teknisForm.urgency);
      formData.append('subdit', teknisForm.subdit);
      formData.append('category', teknisForm.category);
      if (teknisForm.attachment) {
        formData.append('attachment', teknisForm.attachment);
      }
      formData.append('type', 'teknis');

      await api.post('/consultations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Konsultasi PATNAL berhasil dikirim. Tim kami akan segera merespon.');
      setTeknisForm({
        subject: '',
        description: '',
        urgency: 'medium',
        subdit: 'advokasi',
        category: 'patnal_integritas',
        attachment: null,
      });
      setView('history');
    } catch (err) {
      console.error('Submit PATNAL consultation failed:', err);
      if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Gagal mengirim konsultasi PATNAL. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resolvePhotoUrl(photoUrl) {
    if (!photoUrl) return '';
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    const apiBaseUrl = (api?.defaults?.baseURL || '').replace(/\/$/, '');
    return `${apiBaseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedPsychologistId) {
      setError('Silakan pilih psikolog terlebih dahulu.');
      setView('choose_psikolog');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/consultations', {
        ...form,
        psikolog_id: selectedPsychologistId,
      });
      setSuccess('Konsultasi berhasil dikirim. Mohon ditunggu, data sedang kami proses. Silakan cek menu chat secara berkala.');
      setForm({ q1:'',q2:'',q3:'',q4:'',q5:'',q6:'',q7:'' });
      localStorage.setItem('profilingCompleted', 'true');
      setView('history');
    } catch (err) {
      console.error('Submit consultation failed:', err);
      if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Gagal mengirim konsultasi. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  }

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isPsikolog ? 'Konsultasi Psikolog' : 'Konsultasi Teknis'}
                </h1>
                <p className="text-gray-600">
                  {isPsikolog 
                    ? 'Layanan konsultasi psikologis untuk kesehatan mental dan wellbeing.'
                    : 'Layanan konsultasi teknis untuk kepatuhan dan regulasi internal.'}
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
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat hasil assesment klien Anda dan kelola konsultasi yang sedang berlangsung.</p>
                      </button>

                      <button onClick={() => setView('history')} className="group text-left bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                          <History className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Riwayat Konsultasi</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat status dan detail konsultasi sebelumnya untuk monitoring dan pelaporan.</p>
                      </button>

                      <a href="/chat" className="group text-left bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                          <MessageSquare className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Chat Klien</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Akses percakapan langsung dengan klien untuk sesi konseling interaktif.</p>
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
                      <button onClick={isPsikolog ? openConsent : () => setView('create_teknis')} className={`group text-left bg-gradient-to-br ${isPsikolog ? 'from-purple-50 to-indigo-50 border-purple-100' : 'from-blue-50 to-cyan-50 border-blue-100'} rounded-2xl border shadow-sm hover:shadow-lg hover:border-blue-200 transition-all p-6 overflow-hidden relative h-full`}>
                        <div className={`absolute top-0 right-0 w-20 h-20 ${isPsikolog ? 'bg-purple-50' : 'bg-blue-50'} rounded-bl-full opacity-70`} />
                        <div className={`w-12 h-12 rounded-xl ${isPsikolog ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center mb-4 ${isPsikolog ? 'group-hover:bg-purple-600' : 'group-hover:bg-blue-600'} transition-colors`}>
                          {isPsikolog ? (
                            <Plus className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                          ) : (
                            <Settings className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                          )}
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">
                          {isPsikolog ? 'Buat Konsultasi Psikolog' : 'Buat Konsultasi Teknis'}
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {isPsikolog 
                            ? 'Isi form profiling untuk memulai sesi konseling dengan psikolog bersertifikat.'
                            : 'Ajukan pertanyaan teknis seputar compliance, regulasi, dan SOP.'}
                        </p>
                      </button>

                      <button onClick={() => setView('history')} className="group text-left bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                          <History className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Riwayat Konsultasi</p>
                        <p className="text-sm text-gray-500 leading-relaxed">Lihat status dan detail konsultasi sebelumnya untuk monitoring perkembangan.</p>
                      </button>

                      <a href="/chat" className="group text-left bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all p-6 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                          <MessageSquare className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">{isPsikolog ? 'Chat Klien' : 'Chat dengan Konsultan Teknis'}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{isPsikolog ? 'Akses percakapan langsung dengan klien untuk sesi konseling interaktif.' : 'Dapatkan konsultasi langsung dari konsultan teknis PATNAL.'}</p>
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
          
          {loading && <p className="text-sm text-gray-600">Memuat riwayat...</p>}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchConsultations}
                className="text-sm font-medium underline hover:no-underline whitespace-nowrap"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Notice for regular users when they have an active consultation */}
          {!isPsikolog && !isAdmin && !loading && consultations.length > 0 && (
            <div className="mb-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-semibold">Mohon ditunggu,</span> data sedang kami proses. Silakan cek menu <a href="/chat" className="underline font-medium hover:text-blue-900">chat</a> secara berkala.
              </p>
            </div>
          )}

          {isPsikolog && consultations.length > 0 && (
            <div className="mb-4 p-4 border border-blue-100 bg-blue-50 rounded-2xl">
              <p className="text-sm font-semibold text-blue-800 mb-3">Filter Wilayah / UPT</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-blue-700 mb-1">Tipe Lokasi</label>
                  <select
                    value={locationTypeFilter}
                    onChange={(e) => setLocationTypeFilter(e.target.value)}
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="upt">UPT</option>
                    <option value="kanwil">Kanwil</option>
                    <option value="ditjenpas">Direktorat (Ditjenpas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-blue-700 mb-1">Lokasi / Unit</label>
                  <select
                    value={locationDetailFilter}
                    onChange={(e) => setLocationDetailFilter(e.target.value)}
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Semua Lokasi</option>
                    {availableLocationDetails.map((detail) => (
                      <option key={detail} value={detail}>{detail}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                Menampilkan {filteredConsultations.length} dari {consultations.length} data assesment.
              </p>
            </div>
          )}
          
          {!loading && consultations.length === 0 && (
            <p className="text-sm text-gray-600">Belum ada riwayat konsultasi.</p>
          )}

          {!loading && consultations.length > 0 && filteredConsultations.length === 0 && (
            <p className="text-sm text-gray-600">Tidak ada data assesment pada filter lokasi yang dipilih.</p>
          )}

          {!loading && filteredConsultations.length > 0 && (
            <div className="space-y-4">
              {filteredConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                  onClick={() => openConsultationDetail(consultation)}
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-base text-gray-900">Konsultasi #{consultation.id}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        <span className="font-medium">{consultation.user?.name || '-'}</span>
                        {consultation.user?.organization_detail
                          ? <span className="text-gray-400"> · {getLocationLabel(consultation)}</span>
                          : null}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(consultation.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(consultation.status)}`}>
                      {getStatusLabel(consultation.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    <span className="font-medium text-gray-700">Keluhan:</span> {consultation.q3}
                  </p>
                  {consultation.psikolog && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Ditangani: {consultation.psikolog.name}
                    </p>
                  )}
                  {consultation.notes && (
                    <div className="mt-2 px-3 py-2 bg-blue-50 rounded-xl text-xs text-blue-800">
                      <strong>Catatan:</strong> {consultation.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

                  <div className="mt-5 flex items-center gap-3">
                    {!isPsikolog && (
                      <button
                        onClick={() => setView('create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        <Plus className="w-4 h-4" /> Buat Konsultasi Baru
                      </button>
                    )}
                    <button
                      onClick={() => setView('menu')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                    >
                      Kembali
                    </button>
                  </div>
                </div>
              )}
            </>

          </div>
        </div>
      </div>

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

              {view === 'choose_psikolog' && !isPsikolog && (
                <div className="mt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Pilih Psikolog</h2>
                    <button onClick={() => setView('create')} className="text-gray-600 hover:underline">
                      Kembali ke Form
                    </button>
                  </div>

                  {psychologistsLoading && (
                    <p className="text-sm text-gray-600">Memuat daftar psikolog...</p>
                  )}

                  {!psychologistsLoading && psychologists.length === 0 && (
                    <p className="text-sm text-gray-600">Belum ada psikolog terdaftar.</p>
                  )}

                  {!psychologistsLoading && psychologists.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {psychologists.map((psikolog) => {
                        const isSelected = selectedPsychologistId === psikolog.id;

                        return (
                          <button
                            type="button"
                            key={psikolog.id}
                            onClick={() => setSelectedPsychologistId(psikolog.id)}
                            className={`flex flex-col items-center text-center rounded-xl border p-6 transition ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                            }`}
                          >
                            {psikolog.foto ? (
                              <img
                                src={resolvePhotoUrl(psikolog.foto)}
                                alt={`Foto ${psikolog.name}`}
                                className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 mb-4"
                              />
                            ) : (
                              <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-4xl font-bold border-2 border-blue-200 mb-4">
                                {(psikolog.name || 'P').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="font-bold text-gray-900 text-base leading-tight">{psikolog.name}</p>
                            {psikolog.nip ? (
                              <p className="text-xs text-gray-500 mt-1 font-mono">NIP: {psikolog.nip}</p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-1 italic">NIP tidak tersedia</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{psikolog.organization_detail || '-'}</p>
                            <span
                              className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full ${
                                psikolog.is_available
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {psikolog.is_available ? '✓ Tersedia' : '✕ Tidak Tersedia'}
                            </span>
                            {isSelected && (
                              <span className="mt-2 text-xs font-semibold text-blue-600">✓ Dipilih</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setView('create')}
                      disabled={!selectedPsychologistId || psychologistsLoading || (selectedPsychologist && !selectedPsychologist.is_available)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Lanjutkan ke Assesment
                    </button>
                    {selectedPsychologist && !selectedPsychologist.is_available && (
                      <p className="text-sm text-red-600">Psikolog terpilih sedang tidak tersedia, pilih yang berstatus tersedia.</p>
                    )}
                  </div>
                </div>
              )}

              {view === 'create' && (
                <div className="mt-2">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Form Profiling Konsultasi</h2>
                  <p className="text-sm text-gray-500 mb-5">Jawab setiap pertanyaan dengan jujur untuk membantu psikolog memahami kondisi Anda.</p>

          {/* Psikolog profile card */}
          {selectedPsychologist ? (
            <div className="mb-5 border border-blue-200 rounded-2xl bg-blue-50 p-4 flex items-center gap-4">
              {selectedPsychologist.foto ? (
                <img src={resolvePhotoUrl(selectedPsychologist.foto)} alt={`Foto ${selectedPsychologist.name}`} className="w-16 h-16 rounded-full object-cover border-2 border-blue-300 flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-2xl font-bold border-2 border-blue-300 flex-shrink-0">
                  {(selectedPsychologist.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-medium mb-0.5">Psikolog yang menangani</p>
                <p className="font-bold text-blue-900 text-base truncate">{selectedPsychologist.name}</p>
                {selectedPsychologist.nip ? (
                  <p className="text-xs text-blue-700 font-mono mt-0.5">NIP: {selectedPsychologist.nip}</p>
                ) : (
                  <p className="text-xs text-blue-400 italic mt-0.5">NIP tidak tersedia</p>
                )}
                {selectedPsychologist.organization_detail && (
                  <p className="text-xs text-blue-600 mt-0.5 truncate">{selectedPsychologist.organization_detail}</p>
                )}
                <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  selectedPsychologist.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedPsychologist.is_available ? '✓ Tersedia' : '✕ Tidak Tersedia'}
                </span>
              </div>
              <button type="button" onClick={() => setView('choose_psikolog')} className="flex-shrink-0 text-xs text-blue-600 underline hover:text-blue-800">
                Ganti
              </button>
            </div>
          ) : (
            <div className="mb-5 border border-yellow-200 rounded-2xl bg-yellow-50 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-yellow-800">Belum memilih psikolog. Pilih psikolog terlebih dahulu sebelum mengisi form.</p>
              <button type="button" onClick={() => setView('choose_psikolog')} className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                Pilih Psikolog
              </button>
            </div>
          )}

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

              {view === 'create_teknis' && (
                <div className="mt-2">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Form Konsultasi Teknis PATNAL</h2>
                  <p className="text-sm text-gray-500 mb-5">Ajukan pertanyaan mengenai kepatuhan internal, integritas, dan regulasi PATNAL.</p>

                  <form onSubmit={handleTeknisSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
                      <input
                        type="text"
                        name="subject"
                        value={teknisForm.subject}
                        onChange={handleTeknisChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Pertanyaan mengenai integritas dan kepatuhan internal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subdit PATNAL</label>
                      <select
                        name="subdit"
                        value={teknisForm.subdit}
                        onChange={handleTeknisChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="advokasi">Fasilitasi Advokasi & Investigasi Internal</option>
                        <option value="pencegahan">Pencegahan & Pengendalian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Konsultasi</label>
                      <select
                        name="category"
                        value={teknisForm.category}
                        onChange={handleTeknisChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="patnal_integritas">PATNAL & Integritas</option>
                        <option value="kepatuhan">Kepatuhan Internal</option>
                        <option value="investigasi">Investigasi Internal</option>
                        <option value="pelanggaran">Pelanggaran Disiplin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Urgensi</label>
                      <select
                        name="urgency"
                        value={teknisForm.urgency}
                        onChange={handleTeknisChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail</label>
                      <textarea
                        name="description"
                        value={teknisForm.description}
                        onChange={handleTeknisChange}
                        required
                        rows={5}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jelaskan secara detail pertanyaan mengenai PATNAL, integritas, atau kepatuhan internal..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (Opsional)</label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG (Max 5MB)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Konsultasi Teknis'}
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

      </div>
  );
}
