import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/axios";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showKonsultasiDropdown, setShowKonsultasiDropdown] = useState(false);
  const [homeLogo, setHomeLogo] = useState(null);

  // === HIDE HEADER ON SCROLL ===
  useEffect(() => {
    let lastScroll = 0;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.pageYOffset;
          setScrollHidden(currentScroll > lastScroll && currentScroll > 80);
          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setCurrentUser(null);
          return;
        }

        const response = await api.get("/user");
        const userData = response?.data?.user || response?.data;
        setCurrentUser(userData || null);
      } catch {
        setCurrentUser(null);
        localStorage.removeItem("auth_token");
      }
    };

    fetchCurrentUser();

    // Fetch home logo from site-settings
    const fetchHomeLogo = async () => {
      try {
        const res = await api.get("/site-settings");
        if (res.data?.home_logo) {
          setHomeLogo(res.data.home_logo);
        }
      } catch (err) {
        console.error("Failed to fetch home logo:", err);
      }
    };
    fetchHomeLogo();
  }, []);

  const dashboardPath =
    currentUser?.status_pengguna === "Admin" ? "/admin/dashboard" : "/dashboard";

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      void err;
    } finally {
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/";
    }
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <>
      {/* === HEADER === */}
      <header
        id="main-header"
        className={`bg-white text-gray-800 shadow-sm sticky top-0 z-50 transition-transform duration-500 ${
          scrollHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 py-2.5 md:px-8 md:py-4">
          
          {/* === KIRI: LOGO & HAMBURGER === */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden focus:outline-none mr-4 relative w-6 h-5"
            >
              <span className={`absolute left-0 block h-[2px] w-6 bg-gray-700 transition-all duration-300 ${showMobileMenu ? "rotate-45 top-2.5" : "top-0"}`}></span>
              <span className={`absolute left-0 top-2 block h-[2px] w-6 bg-gray-700 transition-all duration-300 ${showMobileMenu ? "opacity-0" : "opacity-100"}`}></span>
              <span className={`absolute left-0 block h-[2px] w-6 bg-gray-700 transition-all duration-300 ${showMobileMenu ? "-rotate-45 top-2.5" : "top-4"}`}></span>
            </button>

            <a href="/" className="flex items-center">
              <img
                src={homeLogo || "/Logo.png"}
                alt="Patnal Integrity Hub"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* === NAVIGASI DESKTOP (Dengan Dropdown Konsultasi) === */}
          <nav className="hidden md:flex space-x-10 font-medium text-[15px] items-center">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition">Beranda</a>
            
            {/* Dropdown Konsultasi */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowKonsultasiDropdown(true)}
                onMouseLeave={() => setShowKonsultasiDropdown(false)}
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
              >
                Konsultasi
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showKonsultasiDropdown && (
                <div
                  onMouseEnter={() => setShowKonsultasiDropdown(true)}
                  onMouseLeave={() => setShowKonsultasiDropdown(false)}
                  className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <a
                    href="/consultation"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Konsultasi Psikolog
                  </a>
                  <a
                    href="/konsultasi-teknis"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Konsultasi Teknis
                  </a>
                </div>
              )}
            </div>

            {/* Sekarang Media Informasi langsung berupa Link (bukan Button Dropdown) */}
            <a 
              href={location.pathname === "/" ? "#pustakadokumen" : "/#pustakadokumen"} 
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Media Informasi
            </a>

            <a href="/pengaduan" className="text-gray-700 hover:text-blue-600 transition">Pengaduan</a>

            <a href="/survey" className="text-gray-700 hover:text-blue-600 transition">Survey Kepuasan</a>

            <a href="/tentang" className="text-gray-700 hover:text-blue-600 transition">Tentang Kami</a>

            {currentUser ? (
              <>
                <a href={dashboardPath} className="text-gray-700 hover:text-blue-600 transition">{currentUser.name}</a>
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 transition">Logout</button>
              </>
            ) : (
              <a href="/login" className="text-gray-700 hover:text-blue-600 transition">Login</a>
            )}
          </nav>
        </div>
      </header>

      {/* === SIDEBAR MOBILE === */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-white border-r border-gray-100 transform transition-transform duration-500 ease-in-out md:hidden z-[60] shadow-2xl ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <span className="font-bold text-xl text-blue-600 uppercase tracking-tight">Patnal Integrity Hub</span>
        </div>

        <nav className="flex flex-col py-4">
          <a href="/" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Beranda</a>
          
          {/* Dropdown Konsultasi Mobile */}
          <div className="border-b border-gray-50">
            <div className="px-6 py-4 text-gray-700 font-medium flex items-center justify-between">
              Konsultasi
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="bg-gray-50">
              <a href="/consultation" className="block px-12 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm" onClick={closeMobileMenu}>
                Konsultasi Psikolog
              </a>
              <a href="/konsultasi-teknis" className="block px-12 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm" onClick={closeMobileMenu}>
                Konsultasi Teknis
              </a>
            </div>
          </div>
          
          <a 
            href={location.pathname === "/" ? "#pustakadokumen" : "/#pustakadokumen"} 
            className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" 
            onClick={closeMobileMenu}
          >
            Media Informasi
          </a>

          <a href="/pengaduan" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Pengaduan</a>

          <a href="/survey" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Survey Kepuasan</a>

          <a href="/tentang" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Tentang Kami</a>

          {currentUser ? (
            <>
              <a href={dashboardPath} className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>{currentUser.name}</a>
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                className="px-6 py-4 text-left text-red-600 hover:bg-red-50 font-medium border-b border-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Login</a>
          )}
        </nav>
      </div>

      {/* Overlay Mobile */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[55] transition-opacity" onClick={closeMobileMenu}></div>
      )}
    </>
  );
}
