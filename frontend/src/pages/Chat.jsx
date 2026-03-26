import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { getPusher } from '../lib/pusher';
import UserDropdownMenu from '../components/UserDropdownMenu';
import { MessageCircle } from 'lucide-react';

export default function Chat() {
  const { consultationId } = useParams();
  const navigate = useNavigate();

  const [user, setUser]               = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [inputValue, setInputValue]   = useState('');
  const [loading, setLoading]         = useState(!!consultationId); // false if no id
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState(null);
  const [deletingMsgId, setDeletingMsgId] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll]   = useState(false);
  const [confirmEndChat, setConfirmEndChat] = useState(false);
  const [endingChat, setEndingChat]       = useState(false);

  const bottomRef  = useRef(null);
  const channelRef = useRef(null);
  const pusherReady = useRef(false);
  const pollTimerRef = useRef(null);

  // â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    api.get('/api/user')
      .then((r) => setUser(r.data?.user ?? r.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  // â”€â”€â”€ Load consultation + message history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!consultationId) return;

    Promise.all([
      api.get(`/api/consultations/${consultationId}`),
      api.get(`/api/chat/${consultationId}/messages`),
    ])
      .then(([consultRes, msgRes]) => {
        setConsultation(consultRes.data);
        setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
      })
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError('Anda tidak memiliki akses ke sesi chat ini.');
        } else if (err?.response?.status === 404) {
          setError('Konsultasi tidak ditemukan.');
        } else {
          setError('Gagal memuat chat. Silakan coba lagi.');
        }
      })
      .finally(() => setLoading(false));
  }, [consultationId]);

  // â”€â”€â”€ Pusher real-time subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!consultationId) return;

    const pusher  = getPusher();
    const channel = pusher.subscribe(`private-consultation.${consultationId}`);
    channelRef.current = channel;
    pusherReady.current = false;

    channel.bind('pusher:subscription_succeeded', () => {
      pusherReady.current = true;
    });

    channel.bind('message.sent', (data) => {
      setMessages((prev) => {
        // Avoid duplicates (sender already added optimistically)
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    channel.bind('pusher:subscription_error', (err) => {
      console.error('Pusher subscription error:', err);
      pusherReady.current = false;
    });

    return () => {
      pusherReady.current = false;
      channel.unbind_all();
      pusher.unsubscribe(`private-consultation.${consultationId}`);
      channelRef.current = null;
    };
  }, [consultationId]);

  // ─── Polling fallback (when Pusher is not connected) ───────────────────────
  useEffect(() => {
    if (!consultationId) return;

    const POLL_INTERVAL = 3000;

    const poll = async () => {
      // Skip polling when Pusher is connected and subscribed
      if (pusherReady.current) return;
      try {
        const { data } = await api.get(`/api/chat/${consultationId}/messages`);
        const incoming = Array.isArray(data) ? data : [];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => String(m.id)));
          const newMsgs = incoming.filter(
            (m) => !existingIds.has(String(m.id)) && !String(m.id).startsWith('temp-')
          );
          if (newMsgs.length === 0) return prev;
          return [...prev, ...newMsgs];
        });
      } catch (_) {
        // silently ignore poll errors
      }
    };

    pollTimerRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [consultationId]);

  // â”€â”€â”€ Auto-scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // â”€â”€â”€ Send message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || sending) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      consultation_id: Number(consultationId),
      user_id: user.id,
      message: text,
      sender: { id: user.id, name: user.name, status_pengguna: user.status_pengguna },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInputValue('');
    setSending(true);

    try {
      const { data } = await api.post(`/api/chat/${consultationId}/messages`, { message: text });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputValue(text);
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = async (msgId) => {
    if (String(msgId).startsWith('temp-')) return;
    setDeletingMsgId(msgId);
    try {
      await api.delete(`/api/chat/${consultationId}/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setDeletingMsgId(null);
    }
  };

  const deleteAllMessages = async () => {
    setDeletingAll(true);
    try {
      await api.delete(`/api/chat/${consultationId}/messages`);
      setMessages([]);
      setConfirmDeleteAll(false);
    } catch (err) {
      console.error('Failed to delete all messages:', err);
    } finally {
      setDeletingAll(false);
    }
  };

  const endChat = async () => {
    setEndingChat(true);
    try {
      const { data } = await api.post(`/api/chat/${consultationId}/end`);
      setConsultation(data.consultation);
      setConfirmEndChat(false);
    } catch (err) {
      console.error('Failed to end chat:', err);
    } finally {
      setEndingChat(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch (_) {/* ignore */}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_role');
    navigate('/');
  };

  // â”€â”€â”€ Display helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isOwn   = (msg) => msg.user_id === user?.id;
  const roleTag = (role) => {
    if (role === 'Admin')    return { label: 'Admin',    color: 'bg-purple-100 text-purple-700' };
    if (role === 'Psikolog') return { label: 'Psikolog', color: 'bg-green-100 text-green-700' };
    return { label: 'User', color: 'bg-blue-100 text-blue-700' };
  };
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const partnerName = () => {
    if (!consultation || !user) return '…';
    if (user.status_pengguna === 'User')     return consultation.psikolog?.name ?? 'Psikolog';
    if (user.status_pengguna === 'Psikolog') return consultation.user?.name ?? 'User';
    return `${consultation.user?.name ?? 'User'} â†” ${consultation.psikolog?.name ?? 'Psikolog'}`;
  };

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat chat…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Link to="/dashboard" className="text-blue-600 underline text-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // ─── No consultationId: show picker ──────────────────────────────────────
  if (!consultationId) {
    return <ConsultationPicker user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/Logo.png" alt="KLIP" className="h-10 md:h-11 w-auto object-contain" />
          </Link>
          {user && <UserDropdownMenu user={user} onLogout={handleLogout} />}
        </div>
      </header>

      {/* Chat window */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6">
        {/* Room header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl px-5 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <p className="font-semibold truncate">Sesi #{consultationId} &ndash; {partnerName()}</p>
            <p className="text-xs text-blue-200 mt-0.5">{roleTag(user?.status_pengguna).label}</p>
          </div>
          <div className="flex items-center gap-2">
            {consultation?.status !== 'completed' && (
              <button
                onClick={() => setConfirmEndChat(true)}
                className="text-xs bg-green-500/80 hover:bg-green-600 px-3 py-1 rounded transition"
                title="Akhiri sesi chat"
              >
                Akhiri Chat
              </button>
            )}
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="text-xs bg-red-500/80 hover:bg-red-600 px-3 py-1 rounded transition"
              title="Hapus semua pesan"
            >
              Hapus Semua Chat
            </button>
            <Link
              to="/chat"
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
            >
              Kembali
            </Link>
          </div>
        </div>

        {/* Confirm end chat modal */}
        {confirmEndChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Akhiri Sesi Chat?</h3>
              <p className="text-sm text-gray-500 mb-5">
                Sesi chat akan ditandai sebagai selesai dan masuk ke <strong>Riwayat Chat</strong>. Pesan tidak dapat dikirim lagi.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmEndChat(false)}
                  disabled={endingChat}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={endChat}
                  disabled={endingChat}
                  className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {endingChat ? 'Mengakhiri…' : 'Ya, Akhiri Chat'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm delete all modal */}
        {confirmDeleteAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Semua Pesan?</h3>
              <p className="text-sm text-gray-500 mb-5">
                Semua pesan dalam sesi ini akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteAll(false)}
                  disabled={deletingAll}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={deleteAllMessages}
                  disabled={deletingAll}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {deletingAll ? 'Menghapus…' : 'Ya, Hapus Semua'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          className="flex-1 bg-white border-x border-gray-200 overflow-y-auto p-4 space-y-3"
          style={{ minHeight: 0, maxHeight: '60vh' }}
        >
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">
              Belum ada pesan. Mulailah percakapan!
            </p>
          )}

          {messages.map((msg) => {
            const own    = isOwn(msg);
            const tag    = roleTag(msg.sender?.status_pengguna);
            const isTemp = String(msg.id).startsWith('temp-');
            const canDelete = !isTemp && (own || user?.status_pengguna === 'Admin');

            return (
              <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[75%] flex flex-col gap-1 ${own ? 'items-end' : 'items-start'}`}>
                  {!own && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tag.color}`}>
                      {msg.sender?.name} &middot; {tag.label}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {own && canDelete && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={deletingMsgId === msg.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded disabled:cursor-not-allowed"
                        title="Hapus pesan"
                      >
                        {deletingMsgId === msg.id ? (
                          <span className="text-[10px]">…</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm leading-relaxed break-words
                        ${own
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'}
                        ${isTemp ? 'opacity-60' : ''}
                      `}
                    >
                      {msg.message}
                    </div>
                    {!own && canDelete && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={deletingMsgId === msg.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded disabled:cursor-not-allowed"
                        title="Hapus pesan"
                      >
                        {deletingMsgId === msg.id ? (
                          <span className="text-[10px]">…</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input / Completed notice */}
        {consultation?.status === 'completed' ? (
          <div className="bg-green-50 border border-green-200 rounded-b-2xl p-4 text-center flex-shrink-0">
            <p className="text-sm text-green-700 font-medium">Sesi chat telah selesai.</p>
            <p className="text-xs text-green-600 mt-1">Pesan di atas tersimpan sebagai riwayat chat.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-b-2xl p-3 flex items-end gap-2 flex-shrink-0">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={consultation?.status === 'completed' ? 'Sesi chat telah selesai' : 'Tulis pesan… (Enter untuk kirim, Shift+Enter baris baru)'}
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              disabled={consultation?.status === 'completed'}
            />
            <button
              onClick={sendMessage}
              disabled={consultation?.status === 'completed' || !inputValue.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white
                         px-4 py-2 rounded-lg text-sm font-medium transition flex-shrink-0"
            >
              {sending ? '…' : 'Kirim'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ConsultationPicker ────────────────────────────────────────────────────
// Shown when navigating to /chat without a consultationId.
function ConsultationPicker({ user, onLogout }) {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // consultation object
  const [deletingId, setDeletingId]       = useState(null);
  const [activeTab, setActiveTab]         = useState('active'); // 'active' | 'history'

  useEffect(() => {
    api.get('/api/consultations')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        // Only consultations that have a psikolog assigned (chat-eligible)
        setConsultations(list.filter((c) => c.psikolog_id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteConsultation = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await api.delete(`/api/consultations/${confirmDelete.id}`);
      setConsultations((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Failed to delete consultation:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const activeChats  = consultations.filter((c) => c.status !== 'completed');
  const historyChats = consultations.filter((c) => c.status === 'completed');

  const renderCard = (c, isHistory) => {
    const partner = user?.status_pengguna === 'User'
      ? (c.psikolog?.name ?? 'Psikolog')
      : (c.user?.name ?? 'User');
    const dateStr = c.updated_at
      ? new Date(c.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return (
      <div
        key={c.id}
        className={`w-full bg-white border rounded-lg px-5 py-4 flex items-center justify-between hover:shadow-sm transition
          ${isHistory ? 'border-gray-200 opacity-90' : 'border-gray-200 hover:border-blue-400'}`}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-800">Sesi #{c.id}</p>
            {isHistory && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Selesai</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.status_pengguna === 'User' ? 'Psikolog' : 'User'}: {partner}
          </p>
          {dateStr && <p className="text-xs text-gray-400 mt-0.5">{isHistory ? 'Diselesaikan' : 'Terakhir aktif'}: {dateStr}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setConfirmDelete(c)}
            className="text-xs text-red-500 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            Hapus Chat
          </button>
          <button
            onClick={() => navigate(`/chat/${c.id}`)}
            className={`text-sm font-medium hover:underline ${isHistory ? 'text-gray-600' : 'text-blue-600'}`}
          >
            {isHistory ? 'Lihat' : 'Buka'} &rarr;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/Logo.png" alt="KLIP" className="h-10 md:h-11 w-auto object-contain" />
          </Link>
          {user && <UserDropdownMenu user={user} onLogout={onLogout} />}
        </div>
      </header>

      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Chat Konsultasi</h2>
        <p className="text-sm text-gray-500 mb-6">Pilih sesi konsultasi untuk memulai atau melihat riwayat chat.</p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat Aktif
            {!loading && activeChats.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                {activeChats.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Riwayat Chat
            {!loading && historyChats.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {historyChats.length}
              </span>
            )}
          </button>
        </div>

        {loading && <p className="text-gray-400 text-sm">Memuat daftar konsultasi…</p>}

        {/* Active chats */}
        {!loading && activeTab === 'active' && (
          <div className="space-y-3">
            {activeChats.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500 mb-4">Belum ada sesi chat aktif.</p>
                <Link
                  to="/consultation"
                  className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Buat Konsultasi
                </Link>
              </div>
            ) : (
              activeChats.map((c) => renderCard(c, false))
            )}
          </div>
        )}

        {/* History chats */}
        {!loading && activeTab === 'history' && (
          <div className="space-y-3">
            {historyChats.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Belum ada riwayat chat yang selesai.</p>
                <p className="text-sm text-gray-400 mt-1">Riwayat muncul setelah sesi chat diakhiri.</p>
              </div>
            ) : (
              historyChats.map((c) => renderCard(c, true))
            )}
          </div>
        )}

        {/* Confirm delete all messages modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Riwayat Chat?</h3>
              <p className="text-sm text-gray-500 mb-1">
                Sesi <span className="font-medium">#{confirmDelete.id}</span> &ndash; {user?.status_pengguna === 'User' ? 'Psikolog' : 'User'}: {user?.status_pengguna === 'User' ? (confirmDelete.psikolog?.name ?? 'Psikolog') : (confirmDelete.user?.name ?? 'User')}
              </p>
              <p className="text-sm text-gray-500 mb-5">
                Riwayat chat ini akan dihapus permanen dari daftar Anda. Pihak lain tetap dapat melihatnya.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId === confirmDelete.id}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConsultation}
                  disabled={deletingId === confirmDelete.id}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {deletingId === confirmDelete.id ? 'Menghapus…' : 'Ya, Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
