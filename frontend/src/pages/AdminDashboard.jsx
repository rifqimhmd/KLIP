import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import UserDropdownMenu from "../components/UserDropdownMenu";
import { UPT_BY_PROVINCE, UPT_PROVINCES } from "../lib/uptOptions";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const emptyUserForm = {
    name: "",
    nip: "",
    email: "",
    no_wa: "",
    pangkat_golongan: "",
    jabatan: "",
    bagian: "",
    daftar_sebagai: "",
    organization_detail: "",
    status_pengguna: "User",
    password: "",
    password_confirmation: "",
  };

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [view, setView] = useState("menu");
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatStats, setChatStats] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState("");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userUptProvince, setUserUptProvince] = useState("");

  // Document management state
  const emptyDocForm = {
    title: "", category: "peraturan", sub_category: "",
    cover: "", file: "", description: "", type: "pdf", video_url: "",
  };
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docFormOpen, setDocFormOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docForm, setDocForm] = useState(emptyDocForm);
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState("");
  const [docSearchTerm, setDocSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Dashboard - KLIP";
    checkAdmin();
  }, []);

  const isAdminUser = useCallback((userData) => {
    const role = (userData?.status_pengguna || "").toLowerCase();
    const legacyRole = (userData?.daftar_sebagai || "").toLowerCase();
    return role === "admin" || legacyRole === "admin";
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      setDataLoading(true);
      const [consultationsRes, usersRes, chatStatsRes] = await Promise.allSettled([
        api.get("/api/consultations"),
        api.get("/api/admin/users"),
        api.get("/api/chat/stats"),
      ]);
      setConsultations(
        consultationsRes.status === "fulfilled" ? consultationsRes.value.data : []
      );
      setUsers(
        usersRes.status === "fulfilled" ? usersRes.value.data : []
      );
      setChatStats(
        chatStatsRes.status === "fulfilled" ? chatStatsRes.value.data : null
      );
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !isAdminUser(user)) return undefined;

    const intervalId = setInterval(() => {
      fetchAdminData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user, isAdminUser, fetchAdminData]);

  const fetchDocuments = async () => {
    try {
      setDocLoading(true);
      const res = await api.get("/api/documents");
      const payload = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setDocuments(payload);
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setDocLoading(false);
    }
  };

  const docCategoryOptions = {
    peraturan: [
      { id: "uud", label: "UUD 1945" },
      { id: "tap-mpr", label: "TAP MPR" },
      { id: "uu-perppu", label: "UU / Perppu" },
      { id: "pp", label: "Peraturan Pemerintah (PP)" },
      { id: "perpres", label: "Peraturan Presiden (Perpres)" },
      { id: "permen", label: "Peraturan Menteri (Permen)" },
    ],
    ebook: [
      { id: "sop", label: "SOP" },
      { id: "panduan", label: "Panduan & Petunjuk" },
      { id: "modul", label: "Modul Pembelajaran" },
      { id: "lainnya", label: "Lainnya" },
    ],
    edukasi: [
      { id: "video-training", label: "Video Training" },
      { id: "video-tutorial", label: "Video Tutorial" },
      { id: "webinar", label: "Webinar" },
      { id: "lainnya", label: "Lainnya" },
    ],
  };

  const openAddDoc = () => {
    setDocForm(emptyDocForm);
    setEditingDocId(null);
    setDocError("");
    setDocFormOpen(true);
  };

  const openEditDoc = (doc) => {
    setDocForm({
      title: doc.title || "",
      category: doc.category || "peraturan",
      sub_category: doc.sub_category || "",
      cover: doc.cover || "",
      file: doc.file || "",
      description: doc.description || "",
      type: doc.type || "pdf",
      video_url: doc.video_url || "",
    });
    setEditingDocId(doc.id);
    setDocError("");
    setDocFormOpen(true);
  };

  const handleDocFormChange = (e) => {
    const { name, value } = e.target;
    setDocForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "category") updated.sub_category = "";
      return updated;
    });
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    setDocError("");
    if (!docForm.title.trim()) { setDocError("Judul harus diisi"); return; }
    if (!docForm.sub_category) { setDocError("Sub kategori harus dipilih"); return; }
    if ((docForm.type === "pdf" || docForm.type === "ebook") && !docForm.file) { setDocError("URL File harus diisi"); return; }
    if (docForm.type === "video" && !docForm.video_url) { setDocError("URL Video harus diisi"); return; }
    setDocSubmitting(true);
    try {
      if (editingDocId) {
        await api.put(`/api/documents/${editingDocId}`, docForm);
      } else {
        await api.post("/api/documents", docForm);
      }
      setDocFormOpen(false);
      setDocForm(emptyDocForm);
      setEditingDocId(null);
      fetchDocuments();
    } catch (err) {
      setDocError(err.response?.data?.message || err.response?.data?.error || "Gagal menyimpan dokumen");
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm("Hapus dokumen ini?")) return;
    try {
      await api.delete(`/api/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menghapus dokumen");
    }
  };

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/api/user");
      const userData = response?.data?.user || response?.data;

      if (!isAdminUser(userData)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setUser(userData);
      await fetchAdminData();
    } catch (error) {
      console.error("Error checking admin:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      } else {
        navigate("/");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/");
    }
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
    setEditingUserId(null);
    setUserError("");
    setUserUptProvince("");
  };

  const openCreateUserForm = () => {
    resetUserForm();
    setUserFormOpen(true);
  };

  const openEditUserForm = (selectedUser) => {
    setEditingUserId(selectedUser.id);
    setUserForm({
      name: selectedUser.name || "",
      nip: selectedUser.nip || "",
      email: selectedUser.email || "",
      no_wa: selectedUser.no_wa || "",
      pangkat_golongan: selectedUser.pangkat_golongan || "",
      jabatan: selectedUser.jabatan || "",
      bagian: selectedUser.bagian || "",
      daftar_sebagai: selectedUser.daftar_sebagai || "",
      organization_detail: selectedUser.organization_detail || "",
      status_pengguna: selectedUser.status_pengguna || "User",
      password: "",
      password_confirmation: "",
    });
    // Restore UPT province from organization_detail format "Province - UPT"
    if (selectedUser.daftar_sebagai === "UPT" && selectedUser.organization_detail) {
      const parts = selectedUser.organization_detail.split(" - ");
      setUserUptProvince(parts[0] || "");
    } else {
      setUserUptProvince("");
    }
    setUserError("");
    setUserFormOpen(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "daftar_sebagai") {
      setUserForm((prev) => ({ ...prev, daftar_sebagai: value, organization_detail: "" }));
      setUserUptProvince("");
      return;
    }
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserUptProvinceChange = (e) => {
    setUserUptProvince(e.target.value);
    setUserForm((prev) => ({ ...prev, organization_detail: "" }));
  };

  const handleUserUptDetailChange = (e) => {
    const uptName = e.target.value;
    setUserForm((prev) => ({
      ...prev,
      organization_detail: uptName ? `${userUptProvince} - ${uptName}` : "",
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError("");

    if (!editingUserId && !userForm.password) {
      setUserError("Password wajib diisi saat menambah user.");
      return;
    }

    if (userForm.password && userForm.password !== userForm.password_confirmation) {
      setUserError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setUserSubmitting(true);

      const payload = {
        name: userForm.name,
        nip: userForm.nip,
        email: userForm.email,
        no_wa: userForm.no_wa,
        pangkat_golongan: userForm.pangkat_golongan,
        jabatan: userForm.jabatan,
        bagian: userForm.bagian,
        daftar_sebagai: userForm.daftar_sebagai,
        organization_detail: userForm.organization_detail,
        status_pengguna: userForm.status_pengguna,
      };

      if (userForm.password) {
        payload.password = userForm.password;
        payload.password_confirmation = userForm.password_confirmation;
      }

      if (editingUserId) {
        await api.put(`/api/admin/users/${editingUserId}`, payload);
      } else {
        await api.post("/api/admin/users", payload);
      }

      setUserFormOpen(false);
      resetUserForm();
      await fetchAdminData();
      setView("users");
    } catch (error) {
      setUserError(
        error?.response?.data?.message ||
        error?.response?.data?.errors?.email?.[0] ||
        error?.response?.data?.errors?.nip?.[0] ||
        "Gagal menyimpan data user"
      );
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      await fetchAdminData();
    } catch (error) {
      alert(error?.response?.data?.message || "Gagal menghapus user");
    }
  };

  const consultationStats = useMemo(() => {
    return {
      pending: consultations.filter((item) => item.status === "pending").length,
      inProgress: consultations.filter((item) => item.status === "in_progress" || item.status === "reviewed").length,
      needsReferral: consultations.filter((item) => item.status === "needs_referral").length,
      completed: consultations.filter((item) => item.status === "completed").length,
    };
  }, [consultations]);

  const onlineUsersCount = useMemo(() => {
    return users.filter((item) => item.is_online).length;
  }, [users]);


  const USERS_PER_PAGE = 10;

  const filteredUsers = useMemo(() => {
    const keyword = userSearchTerm.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((item) => {
      const combined = [
        item.name,
        item.nip,
        item.email,
        item.status_pengguna,
        item.daftar_sebagai,
        item.organization_detail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return combined.includes(keyword);
    });
  }, [users, userSearchTerm]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  const paginatedUsers = useMemo(() => {
    const start = (usersCurrentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, usersCurrentPage]);

  useEffect(() => {
    setUsersCurrentPage(1);
  }, [userSearchTerm, users.length]);

  const registeredName = (user?.name || user?.nama || "").trim() || "Teman";

  // Trigger fetchAdminData after login/logout to refresh user statuses
  useEffect(() => {
    const handleStatusUpdate = async () => {
      await fetchAdminData();
    };

    window.addEventListener("userStatusUpdate", handleStatusUpdate);

    return () => {
      window.removeEventListener("userStatusUpdate", handleStatusUpdate);
    };
  }, [fetchAdminData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600 max-w-xl w-full">
          Data admin tidak ditemukan atau akses tidak valid.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Patnal Integrity Hub"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </a>
          <div className="flex items-center space-x-4">
            <UserDropdownMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <nav className="py-2">
                <a href="/admin/dashboard" className="block px-4 py-3 text-blue-600 bg-blue-50 font-medium border-l-4 border-blue-600">
                  Dashboard
                </a>
                <a href="/admin/reports" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Laporan
                </a>
              </nav>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">Pusat data master dan monitoring operasional admin.</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  disabled={dataLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {dataLoading ? "Memuat..." : "Refresh Data"}
                </button>
              </div>

              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Halo, {registeredName}. Bagaimana harimu?
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Semoga sehat selalu yaa!
                </p>
              </div>

              {view === "menu" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setView("consultation")}
                    className="text-left border border-purple-200 bg-purple-50 rounded-lg p-5 hover:bg-purple-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-purple-700 mb-1">Monitoring Konsultasi</p>
                    <p className="text-sm text-gray-600">Pantau status konsultasi klien secara menyeluruh.</p>
                    <p className="mt-3 text-sm font-semibold text-purple-700">
                      Tunggu: {consultationStats.pending} | Diproses: {consultationStats.inProgress} | Perlu Rujukan: {consultationStats.needsReferral} | Selesai: {consultationStats.completed}
                    </p>
                  </button>

                  <button
                    onClick={() => setView("users")}
                    className="text-left border border-orange-200 bg-orange-50 rounded-lg p-5 hover:bg-orange-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-orange-700 mb-1">Management Users</p>
                    <p className="text-sm text-gray-600">Tambah, ubah, dan hapus data user dari dashboard admin.</p>
                    <p className="mt-3 text-sm font-semibold text-orange-700">
                      Total User: {users.length} | Online: {onlineUsersCount} | Offline: {Math.max(users.length - onlineUsersCount, 0)}
                    </p>
                  </button>

                  <button
                    onClick={() => setView("chat")}
                    className="text-left border border-indigo-200 bg-indigo-50 rounded-lg p-5 hover:bg-indigo-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-indigo-700 mb-1">Monitoring Chat</p>
                    <p className="text-sm text-gray-600">Pantau sesi chat aktif yang sedang dikerjakan psikolog.</p>
                    <p className="mt-3 text-sm font-semibold text-indigo-700">
                      Chat Aktif: {chatStats?.active_total ?? "…"} | Selesai: {chatStats?.completed_total ?? "…"}
                    </p>
                  </button>

                  <a
                    href="/admin/reports"
                    className="text-left border border-teal-200 bg-teal-50 rounded-lg p-5 hover:bg-teal-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-teal-700 mb-1">Laporan Harian/Bulanan/Tahunan</p>
                    <p className="text-sm text-gray-600">Buka halaman laporan terpisah untuk melihat tren konsultasi.</p>
                    <p className="mt-3 text-sm font-semibold text-teal-700">Total Laporan: {consultations.length}</p>
                  </a>

                  <button
                    onClick={() => { setDocSearchTerm(""); fetchDocuments(); setView("documents"); }}
                    className="text-left border border-green-200 bg-green-50 rounded-lg p-5 hover:bg-green-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-green-700 mb-1">Kelola Pustaka Dokumen</p>
                    <p className="text-sm text-gray-600">Tambah, edit, dan hapus dokumen di pustaka.</p>
                    <p className="mt-3 text-sm font-semibold text-green-700">Total Dokumen: {documents.length}</p>
                  </button>

                  <a
                    href="/dashboard"
                    className="text-left border border-gray-200 bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-lg font-semibold text-gray-800 mb-1">Kembali ke Dashboard Pengguna</p>
                    <p className="text-sm text-gray-600">Buka tampilan dashboard standar pengguna.</p>
                  </a>
                </div>
              )}

              {view === "consultation" && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Monitoring Konsultasi</h2>
                    <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                      Kembali
                    </button>
                  </div>

                  {consultations.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data konsultasi untuk ditampilkan.</p>
                  ) : (
                    <div className="space-y-3">
                      {consultations.slice(0, 20).map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-800">Konsultasi #{item.id}</p>
                              <p className="text-xs text-gray-500">Klien: {item.user?.name || "-"}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : item.status === "in_progress" || item.status === "reviewed"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.status === "needs_referral"
                                    ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {item.status === "pending"
                                ? "Tunggu"
                                : item.status === "in_progress" || item.status === "reviewed"
                                  ? "Diproses"
                                  : item.status === "needs_referral"
                                    ? "Perlu Rujukan"
                                    : item.status === "completed"
                                      ? "Selesai"
                                      : item.status || "Tunggu"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.q3}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === "chat" && (
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Monitoring Chat</h2>
                    <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                      Kembali
                    </button>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-indigo-700">{chatStats?.active_total ?? "…"}</p>
                      <p className="text-sm text-indigo-600 mt-1">Chat Aktif</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-700">{chatStats?.completed_total ?? "…"}</p>
                      <p className="text-sm text-green-600 mt-1">Chat Selesai</p>
                    </div>
                  </div>

                  {/* Per psikolog table */}
                  <h3 className="text-base font-semibold text-gray-700 mb-3">Chat Aktif per Psikolog</h3>
                  {!chatStats ? (
                    <p className="text-sm text-gray-500">Memuat data…</p>
                  ) : chatStats.per_psikolog.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
                      Tidak ada sesi chat aktif saat ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatStats.per_psikolog.map((item) => (
                        <div
                          key={item.psikolog_id}
                          className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                              {item.psikolog_name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-medium text-gray-800">{item.psikolog_name}</p>
                          </div>
                          <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-0.5 rounded-full">
                            {item.active_chats} sesi aktif
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === "users" && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">Management Users</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openCreateUserForm}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Tambah User
                      </button>
                      <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                        Kembali
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Cari nama, NIP, email, role..."
                      className="w-full md:max-w-md border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <p className="text-sm text-gray-600">
                      Menampilkan {paginatedUsers.length} dari {filteredUsers.length} user
                    </p>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada user untuk ditampilkan.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nama</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">NIP</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedUsers.map((item) => (
                              <tr key={item.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-gray-600">{item.nip || "-"}</td>
                                <td className="px-4 py-3 text-gray-600">{item.email}</td>
                                <td className="px-4 py-3 text-gray-600">{item.status_pengguna || "-"}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      item.is_online
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {item.is_online ? "Online" : "Offline"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => openEditUserForm(item)}
                                      className="text-blue-600 hover:underline"
                                    >
                                      Ubah
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(item.id)}
                                      className="text-red-600 hover:underline"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Halaman {usersCurrentPage} dari {totalUserPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUsersCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={usersCurrentPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-50"
                          >
                            Sebelumnya
                          </button>
                          <button
                            type="button"
                            onClick={() => setUsersCurrentPage((prev) => Math.min(totalUserPages, prev + 1))}
                            disabled={usersCurrentPage === totalUserPages}
                            className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-50"
                          >
                            Berikutnya
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === "documents" && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-800">Kelola Pustaka Dokumen</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openAddDoc}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        + Tambah Dokumen
                      </button>
                      <button onClick={() => setView("menu")} className="text-sm text-gray-600 hover:underline">
                        Kembali
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Cari judul dokumen..."
                      value={docSearchTerm}
                      onChange={(e) => setDocSearchTerm(e.target.value)}
                      className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>

                  {docLoading ? (
                    <p className="text-gray-500 text-sm py-6 text-center">Memuat dokumen...</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Kategori</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Sub Kategori</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipe</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {documents
                            .filter((d) =>
                              d.title?.toLowerCase().includes(docSearchTerm.toLowerCase())
                            )
                            .map((doc, idx) => (
                              <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{doc.title}</td>
                                <td className="px-4 py-3 text-gray-600 capitalize">{doc.category}</td>
                                <td className="px-4 py-3 text-gray-600">{doc.sub_category}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    doc.type === "video"
                                      ? "bg-blue-100 text-blue-700"
                                      : doc.type === "pdf"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}>
                                    {doc.type?.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openEditDoc(doc)}
                                      className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDoc(doc.id)}
                                      className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {documents.filter((d) =>
                            d.title?.toLowerCase().includes(docSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                Belum ada dokumen
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {docFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${
              editingDocId ? "bg-blue-600" : "bg-green-600"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{editingDocId ? "Edit Dokumen" : "Tambah Dokumen Baru"}</h3>
                  <p className="text-xs text-white/70">{editingDocId ? "Perbarui informasi dokumen" : "Isi formulir untuk menambah dokumen"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setDocFormOpen(false); setDocForm(emptyDocForm); setEditingDocId(null); }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {docError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {docError}
                </div>
              )}

              <form onSubmit={handleDocSubmit} id="doc-form" className="space-y-5">
                {/* Tipe & Kategori */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Klasifikasi Dokumen</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Dokumen <span className="text-red-500">*</span></label>
                      <select name="type" value={docForm.type} onChange={handleDocFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="pdf">📄 PDF</option>
                        <option value="ebook">📚 E-Book</option>
                        <option value="video">🎥 Video</option>
                        <option value="other">📎 Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Utama <span className="text-red-500">*</span></label>
                      <select name="category" value={docForm.category} onChange={handleDocFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="peraturan">Himpunan Peraturan</option>
                        <option value="ebook">Standar Operasional</option>
                        <option value="edukasi">Edukasi</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Kategori <span className="text-red-500">*</span></label>
                    <select name="sub_category" value={docForm.sub_category} onChange={handleDocFormChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="">-- Pilih Sub Kategori --</option>
                      {(docCategoryOptions[docForm.category] || []).map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Konten */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Konten</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="title"
                        value={docForm.title}
                        onChange={handleDocFormChange}
                        placeholder="Masukkan judul dokumen..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {(docForm.type === "pdf" || docForm.type === "ebook" || docForm.type === "other") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL File <span className="text-red-500">*</span></label>
                        <input
                          type="url"
                          name="file"
                          value={docForm.file}
                          onChange={handleDocFormChange}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">💡 Bisa gunakan link Google Drive, Dropbox, OneDrive, dll.</p>
                      </div>
                    )}

                    {docForm.type === "video" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Embed URL <span className="text-red-500">*</span></label>
                        <input
                          type="url"
                          name="video_url"
                          value={docForm.video_url}
                          onChange={handleDocFormChange}
                          placeholder="https://www.youtube.com/embed/VIDEO_ID"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">💡 Gunakan format embed: youtube.com/embed/VIDEO_ID</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL Cover <span className="text-gray-400 font-normal">(opsional)</span></label>
                      <input
                        type="url"
                        name="cover"
                        value={docForm.cover}
                        onChange={handleDocFormChange}
                        placeholder="https://... (gambar thumbnail)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-gray-400 font-normal">(opsional)</span></label>
                      <textarea
                        name="description"
                        value={docForm.description}
                        onChange={handleDocFormChange}
                        rows="3"
                        placeholder="Deskripsi singkat tentang dokumen ini..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setDocFormOpen(false); setDocForm(emptyDocForm); setEditingDocId(null); }}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                form="doc-form"
                disabled={docSubmitting}
                className={`px-5 py-2 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50 ${
                  editingDocId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {docSubmitting ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Menyimpan...</span>
                ) : (editingDocId ? "Simpan Perubahan" : "Tambah Dokumen")}
              </button>
            </div>
          </div>
        </div>
      )}

      {userFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${
              editingUserId ? "bg-blue-600" : "bg-orange-500"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{editingUserId ? "Ubah Data User" : "Tambah User Baru"}</h3>
                  <p className="text-xs text-white/70">{editingUserId ? "Perbarui informasi akun pengguna" : "Isi formulir untuk membuat akun baru"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setUserFormOpen(false); resetUserForm(); }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
            {userError && (
              <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {userError}
              </div>
            )}

            <form onSubmit={handleUserSubmit} id="user-form" className="space-y-5">
              {/* Informasi Akun */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informasi Akun</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input name="name" value={userForm.name} onChange={handleUserFormChange} required placeholder="Masukkan nama lengkap" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIP <span className="text-red-500">*</span></label>
                    <input name="nip" value={userForm.nip} onChange={handleUserFormChange} required placeholder="Nomor Induk Pegawai" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} required placeholder="contoh@email.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No WhatsApp</label>
                    <input name="no_wa" value={userForm.no_wa} onChange={handleUserFormChange} placeholder="+62 812-3456-7890" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Informasi Jabatan */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informasi Jabatan</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pangkat / Golongan</label>
                    <input name="pangkat_golongan" value={userForm.pangkat_golongan} onChange={handleUserFormChange} placeholder="Penata / III-C" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                    <input name="jabatan" value={userForm.jabatan} onChange={handleUserFormChange} placeholder="Staf Pengawasan" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bagian</label>
                    <input name="bagian" value={userForm.bagian} onChange={handleUserFormChange} placeholder="Kepatuhan Internal" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                    <select name="status_pengguna" value={userForm.status_pengguna} onChange={handleUserFormChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="User">👤 User</option>
                      <option value="Psikolog">🧠 Psikolog</option>
                      <option value="Asisten Psikolog">🤝 Asisten Psikolog</option>
                      <option value="Admin">🛡️ Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Daftar Sebagai + Organization Detail */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Unit Kerja</p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai</label>
                <select name="daftar_sebagai" value={userForm.daftar_sebagai} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">-- Pilih Unit --</option>
                  <option value="UPT">UPT: Daerah</option>
                  <option value="Kanwil">Kanwil: Provinsi</option>
                  <option value="Ditjenpas">Ditjenpas: Direktorat Jenderal Pemasyarakatan</option>
                </select>
              </div>
              {userForm.daftar_sebagai === "Ditjenpas" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Direktorat</label>
                  <select name="organization_detail" value={userForm.organization_detail} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">-- Pilih Direktorat --</option>
                    {[
                      "Sekretariat Direktorat Jenderal Pemasyarakatan",
                      "Direktorat Perawatan Kesehatan dan Rehabilitasi",
                      "Direktorat Pelayanan Tahanan dan Anak",
                      "Direktorat Pembinaan Narapidana dan Anak Binaan",
                      "Direktorat Pembimbingan Kemasyarakatan",
                      "Direktorat Pengamanan dan Intelijen",
                      "Direktorat Teknologi Informasi dan Kerja Sama Pemasyarakatan",
                      "Direktorat Sistem dan Strategi Penyelenggaraan Pemasyarakatan",
                      "Direktorat Kepatuhan Internal",
                    ].map((dir) => <option key={dir} value={dir}>{dir}</option>)}
                  </select>
                </div>
              )}

              {userForm.daftar_sebagai === "Kanwil" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kanwil</label>
                  <select name="organization_detail" value={userForm.organization_detail} onChange={handleUserFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">-- Pilih Kanwil --</option>
                    {["Aceh","Bali","Banten","Bengkulu","D.I Yogyakarta","DKI Jakarta","Gorontalo","Jambi","Jawa Barat","Jawa Tengah","Jawa Timur","Kalimantan Barat","Kalimantan Selatan","Kalimantan Tengah","Kalimatan Timur","Kepulauan Bangka Belitung","Kepulauan Riau","Lampung","Maluku","Maluku Utara","Nusa Tenggara Barat","Nusa Tenggara Timur","Papua","Papua Barat","Riau","Sulawesi Barat","Sulawesi Selatan","Sulawesi Tengah","Sulawesi Tenggara","Sulawesi Utara","Sumatera Barat","Sumatera Selatan","Sumatera Utara"].map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              )}

              {userForm.daftar_sebagai === "UPT" && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Provinsi UPT</label>
                    <select value={userUptProvince} onChange={handleUserUptProvinceChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">-- Pilih Provinsi --</option>
                      {UPT_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih UPT</label>
                    <select
                      value={userForm.organization_detail.startsWith(`${userUptProvince} - `) ? userForm.organization_detail.replace(`${userUptProvince} - `, "") : ""}
                      onChange={handleUserUptDetailChange}
                      disabled={!userUptProvince}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">-- Pilih UPT --</option>
                      {(UPT_BY_PROVINCE[userUptProvince] || []).map((upt) => <option key={upt} value={upt}>{upt}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100" />

              {/* Password */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Password {editingUserId && <span className="text-gray-400 normal-case font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!editingUserId && <span className="text-red-500">*</span>}
                    </label>
                    <input type="password" name="password" value={userForm.password} onChange={handleUserFormChange} placeholder="Minimal 8 karakter" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                    <input type="password" name="password_confirmation" value={userForm.password_confirmation} onChange={handleUserFormChange} placeholder="Ulangi password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setUserFormOpen(false); resetUserForm(); }}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={userSubmitting}
                className={`px-5 py-2 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50 ${
                  editingUserId ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {userSubmitting ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Menyimpan...</span>
                ) : (editingUserId ? "Simpan Perubahan" : "Buat Akun")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
