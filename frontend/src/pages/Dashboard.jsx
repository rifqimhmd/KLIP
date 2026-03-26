import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

import KonsultasiProgress from "../components/KonsultasiProgress";
// import WBSProgress from "../components/WBSProgress";
import UserDropdownMenu from "../components/UserDropdownMenu";
import {
  LayoutDashboard,
  ClipboardList,
  FileBarChart2,
  MessageCircle,
  ChevronRight,
  HeartHandshake,
  History,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const isPsikolog = user?.status_pengguna === "Psikolog";
  const registeredName = (user?.name || user?.nama || "").trim() || "Teman";

  useEffect(() => {
    document.title = "Patnal Integrity Hub- Dashboard";
    // Blokir tombol Back browser agar tidak keluar dari dashboard
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    fetchUser();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/api/user");
      const currentUser = response.data;
      if (currentUser?.status_pengguna === "Admin") {
        navigate("/admin/dashboard");
        return;
      }
      setUser(currentUser);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
      // Clear the stored token
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      // Still clear token even if logout fails
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="/Logo.png"
              alt="Patnal Integrity Hub"
              className="h-10 md:h-11 w-auto object-contain"
            />
          </a>
          <UserDropdownMenu user={user} onLogout={handleLogout} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0 space-y-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
              </div>
              <nav className="pb-2">
                <a
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 text-blue-700 bg-blue-50 font-semibold border-l-4 border-blue-600 text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  Dashboard
                </a>
                <a
                  href="/consultation"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                >
                  <ClipboardList className="w-4 h-4 flex-shrink-0" />
                  Konsultasi
                </a>
                {isPsikolog && (
                  <a
                    href="/reports"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                  >
                    <FileBarChart2 className="w-4 h-4 flex-shrink-0" />
                    Laporan
                  </a>
                )}
              </nav>
            </div>

            {/* Chat Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl shadow-md p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-sm font-semibold">
                  {isPsikolog ? "Chat dengan Klien" : "Chat dengan Psikolog"}
                </h3>
              </div>
              <p className="text-xs text-purple-100 mb-4 leading-relaxed">
                {isPsikolog
                  ? "Akses percakapan langsung dengan klien yang sedang dalam sesi konsultasi."
                  : "Dapatkan konsultasi langsung dari psikolog bersertifikat kami."}
              </p>
              {!isPsikolog && (
                <p className="text-xs text-purple-200 mb-3 -mt-2">
                  (Tersedia setelah menyelesaikan profiling)
                </p>
              )}
              <a
                href="/chat"
                className="flex items-center justify-center gap-1.5 w-full bg-white text-purple-700 font-semibold text-xs py-2 rounded-xl hover:bg-purple-50 transition"
              >
                Buka Chat
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -right-2 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm text-blue-100 font-medium">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Halo, {registeredName}! 👋
                </h2>
                <p className="mt-1 text-blue-100 text-sm">
                  Tidak perlu terburu-buru. Mulai saat kamu sudah nyaman.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Aksi Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Konsultasi / Assessment */}
                <a
                  href="/consultation"
                  className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                      <HeartHandshake className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{isPsikolog ? "Assessment" : "Konsultasi"}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isPsikolog ? "Kelola sesi assessment klien" : "Mulai sesi konsultasi baru"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </a>

                {/* Riwayat */}
                <a
                  href="/consultation"
                  className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                      <History className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {isPsikolog ? "Riwayat Assessment" : "Riwayat Konsultasi"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lihat riwayat sesi sebelumnya
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </a>
              </div>
            </div>

            {/* WBS sementara di-hide, tidak dihapus */}
            {false && (
              <WBSProgress wbsProgress={[
                { nomor: "WBS-001", status: "Ditinjau" },
                { nomor: "WBS-002", status: "Ditindaklanjuti" },
                { nomor: "WBS-003", status: "Ditinjau" },
              ]} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
