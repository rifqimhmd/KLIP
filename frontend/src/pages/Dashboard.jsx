import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

import KonsultasiProgress from "../components/KonsultasiProgress";
// import WBSProgress from "../components/WBSProgress";
import UserDropdownMenu from "../components/UserDropdownMenu";

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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img
                src="/Logo.png"
                alt="Patnal Integrity Hub"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <UserDropdownMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow">
              <nav className="py-2">
                <a
                  href="/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium border-l-4 border-blue-600 bg-blue-50"
                >
                  Dashboard
                </a>
                <a
                  href="/consultation"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  Konsultasi
                </a>
                {isPsikolog && (
                  <a
                    href="/reports"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    Laporan
                  </a>
                )}
              </nav>
            </div>

            {/* Chat dengan Psikolog (User) */}
            {!isPsikolog && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-600 text-lg">💬</span>
                  <h3 className="text-sm font-semibold text-gray-800">Chat dengan Psikolog</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Dapatkan konsultasi langsung dari psikolog bersertifikat kami.<br />
                  <span className="text-gray-400">(Hanya dapat diakses setelah menyelesaikan profiling)</span>
                </p>
                <a
                  href="/chat"
                  className="block w-full text-center bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition"
                >
                  Buka Chat
                </a>
              </div>
            )}

            {/* Chat dengan Klien (Psikolog) */}
            {isPsikolog && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-600 text-lg">💬</span>
                  <h3 className="text-sm font-semibold text-gray-800">Chat dengan Klien</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Akses percakapan langsung dengan klien yang sedang dalam sesi konsultasi.
                </p>
                <a
                  href="/chat"
                  className="block w-full text-center bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition"
                >
                  Buka Chat
                </a>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="w-full space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Halo, {registeredName}. Bagaimana harimu?
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Tidak perlu terburu-buru. Mulai saat kamu sudah nyaman.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">{isPsikolog ? "Assesment" : "Konsultasi"}</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <a href="/consultation" className="bg-blue-600 text-white px-4 py-2 rounded text-center">{isPsikolog ? "Assesment" : "Konsultasi"}</a>
                  <a href="/consultation" className="bg-gray-100 border px-4 py-2 rounded text-center">{isPsikolog ? "Riwayat Assesment" : "Riwayat Konsultasi"}</a>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
