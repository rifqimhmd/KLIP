import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

import KonsultasiProgress from "../components/KonsultasiProgress";
// import WBSProgress from "../components/WBSProgress";
import UserDropdownMenu from "../components/UserDropdownMenu";
import Logo from "../components/Logo";
import {
  LayoutDashboard,
  ClipboardList,
  FileBarChart2,
  ChevronRight,
  HeartHandshake,
  History,
  Sparkles,
  Building2,
  MessageSquare,
  User,
  Calendar,
  Clock,
  Bell,
  TrendingUp,
  Shield,
  HeadphonesIcon,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isPsikolog = user?.status_pengguna === "Psikolog" || user?.status_pengguna === "Asisten Psikolog";
  const isKonsultanTeknis = user?.status_pengguna === "Konsultan Teknis" || user?.status_pengguna === "Admin";
  const isRegularUser = !isPsikolog && !isKonsultanTeknis;
  const registeredName = (user?.name || user?.nama || "").trim() || "User";

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return "Selamat Pagi";      // 00:00 - 10:59
    if (hour < 15) return "Selamat Siang";     // 11:00 - 14:59
    if (hour < 18) return "Selamat Sore";      // 15:00 - 17:59
    return "Selamat Malam";                    // 18:00 - 23:59
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleBadge = () => {
    if (isPsikolog) return { text: "Psikolog", color: "bg-emerald-100 text-emerald-700", icon: HeadphonesIcon };
    if (isKonsultanTeknis) return { text: "Konsultan Teknis", color: "bg-amber-100 text-amber-700", icon: Shield };
    return { text: "Pengguna", color: "bg-blue-100 text-blue-700", icon: User };
  };

  // Define fetchUser as function declaration (hoisted)
  async function fetchUser() {
    try {
      const response = await api.get("/user");
      const currentUser = response.data;
      console.log("User data from API:", currentUser);
      console.log("User name:", currentUser?.name);
      console.log("User nama:", currentUser?.nama);
      if (currentUser?.status_pengguna === "Admin") {
        navigate("/admin/dashboard");
        return;
      }
      setUser(currentUser);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      navigate("/login");
    }
  }

  useEffect(() => {
    document.title = "Patnal Integrity Hub- Dashboard";
    // Blokir tombol Back browser agar tidak keluar dari dashboard
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    // Call fetchUser
    let isMounted = true;
    const loadUser = async () => {
      if (isMounted) {
        await fetchUser();
      }
    };
    loadUser();

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
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
            <Logo className="h-10 md:h-11 w-auto" alt="Patnal Integrity Hub" />
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
                {isPsikolog ? (
                  <a
                    href="/consultation-psikolog"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                  >
                    <ClipboardList className="w-4 h-4 flex-shrink-0" />
                    Konsultasi Psikolog
                  </a>
                ) : (
                  <>
                    <a
                      href="/consultation-teknis"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                    >
                      <ClipboardList className="w-4 h-4 flex-shrink-0" />
                      Konsultasi Teknis
                    </a>
                    <a
                      href="/consultation-psikolog"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                    >
                      <ClipboardList className="w-4 h-4 flex-shrink-0" />
                      Konsultasi Psikolog
                    </a>
                    <a
                      href="/chat?expert=kasubdit"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      Chat Teknis
                    </a>
                    <a
                      href="/chat?expert=psikolog"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      Chat Psikolog
                    </a>
                  </>
                )}
                {isPsikolog && (
                  <a
                    href="/reports"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                  >
                    <FileBarChart2 className="w-4 h-4 flex-shrink-0" />
                    Laporan
                  </a>
                )}
                {isKonsultanTeknis && (
                  <a
                    href="/konsultan-teknis/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent"
                  >
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    Dashboard Konsultan
                  </a>
                )}
              </nav>
            </div>

          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Modern Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-xl">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 shadow-inner">
                    {getInitials(registeredName)}
                  </div>
                </div>
                
                {/* Welcome Text */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    {getGreeting()}, {registeredName.split(" ")[0]}!
                  </h2>
                  <p className="text-blue-100 text-lg max-w-xl">
                    {isPsikolog 
                      ? "Semangat membantu klien hari ini. Setiap sesi adalah kesempatan untuk membuat perubahan positif."
                      : isKonsultanTeknis
                      ? "Selamat bekerja! Anda memiliki akses penuh untuk mengelola sistem."
                      : "Selamat datang kembali. Jangan ragu untuk memulai konsultasi kapan saja Anda butuhkan."}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="flex-shrink-0">
                  {(() => {
                    const role = getRoleBadge();
                    const Icon = role.icon;
                    return (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${role.color} font-medium text-sm shadow-sm`}>
                        <Icon className="w-4 h-4" />
                        {role.text}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Aktif
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{isPsikolog ? "12" : isKonsultanTeknis ? "45" : "3"}</p>
                <p className="text-sm text-gray-500">{isPsikolog ? "Sesi Hari Ini" : isKonsultanTeknis ? "Total Pengguna" : "Konsultasi Aktif"}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{isPsikolog ? "156" : isKonsultanTeknis ? "89" : "5"}</p>
                <p className="text-sm text-gray-500">{isPsikolog ? "Sesi Selesai" : isKonsultanTeknis ? "Konsultasi" : "Riwayat"}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">Rata-rata</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{isPsikolog ? "45m" : isKonsultanTeknis ? "2h" : "30m"}</p>
                <p className="text-sm text-gray-500">{isPsikolog ? "Durasi Sesi" : isKonsultanTeknis ? "Respon Time" : "Konsultasi"}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600">100%</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">Aktif</p>
                <p className="text-sm text-gray-500">Status Layanan</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Aksi Cepat</h3>
                <span className="text-sm text-gray-500">Akses fitur utama</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Primary Action */}
                <a
                  href={isPsikolog ? "/consultation-psikolog" : "/consultation"}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      <HeartHandshake className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white text-lg mb-1">
                      {isPsikolog ? "Kelola Assessment" : "Mulai Konsultasi"}
                    </h4>
                    <p className="text-blue-100 text-sm">
                      {isPsikolog ? "Akses daftar assessment klien" : "Konsultasi dengan psikolog profesional"}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                      Lanjutkan <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </a>

                {/* Chat Action */}
                <a
                  href={isPsikolog ? "/chat?expert=psikolog" : "/chat?expert=kasubdit"}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-1">
                    {isPsikolog ? "Chat Klien" : "Chat Langsung"}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {isPsikolog ? "Komunikasi dengan klien" : "Konsultasi teknis via chat"}
                  </p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </a>

                {/* History Action */}
                <a
                  href="/consultation"
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                    <History className="w-6 h-6 text-violet-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-1">
                    Riwayat
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Lihat riwayat konsultasi
                  </p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </a>

                {/* Reports - Psikolog only */}
                {isPsikolog && (
                  <a
                    href="/reports"
                    className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                      <FileBarChart2 className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-1">
                      Laporan
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Generate laporan & statistik
                    </p>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </a>
                )}

                {/* Admin Dashboard - Konsultan only */}
                {isKonsultanTeknis && (
                  <a
                    href="/konsultan-teknis/dashboard"
                    className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-colors">
                      <Building2 className="w-6 h-6 text-rose-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-1">
                      Dashboard Konsultan
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Kelola sistem & pengguna
                    </p>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                  </a>
                )}

                {/* Info/Help */}
                <a
                  href="/tentang"
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-4 group-hover:bg-sky-200 transition-colors">
                    <FileText className="w-6 h-6 text-sky-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-1">
                    Tentang Kami
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Informasi layanan & kontak
                  </p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>

            {/* Recent Activity / Tips Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Tips */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Tips Hari Ini</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-bold text-sm">1</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isPsikolog 
                        ? "Ingat untuk memberikan ruang bagi klien dalam berbicara dan mengekspresikan perasaan."
                        : "Luangkan waktu 10 menit setiap hari untuk mindfulness atau meditasi ringan."}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isPsikolog
                        ? "Dokumentasikan setiap sesi dengan lengkap untuk evaluasi berkala."
                        : "Jika merasa cemas, jangan ragu untuk menjadwalkan konsultasi dengan psikolog."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Status Layanan</h3>
                  <span className="ml-auto px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    Online
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-gray-700">Konsultasi Psikolog</span>
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">Tersedia</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-gray-700">Chat Langsung</span>
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700">Jam Operasional</span>
                    </div>
                    <span className="text-sm text-gray-600">08:00 - 17:00 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <KonsultasiProgress />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
