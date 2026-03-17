import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/axios";

export default function Header() {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

        const response = await api.get("/api/user");
        const userData = response?.data?.user || response?.data;
        setCurrentUser(userData || null);
      } catch (error) {
        setCurrentUser(null);
        localStorage.removeItem("auth_token");
      }
    };

    fetchCurrentUser();
  }, []);

  const dashboardPath =
    currentUser?.status_pengguna === "Admin" ? "/admin/dashboard" : "/dashboard";

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
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
                src="/Logo.png"
                alt="Patnal Integrity Hub"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* === NAVIGASI DESKTOP (Tanpa Dropdown) === */}
          <nav className="hidden md:flex space-x-10 font-medium text-[15px] items-center">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition">Beranda</a>
            
            <a href="/consultation" className="text-gray-700 hover:text-blue-600 transition">Konsultasi</a>

            {/* Sekarang Media Informasi langsung berupa Link (bukan Button Dropdown) */}
            <a 
              href={location.pathname === "/" ? "#pustakadokumen" : "/#pustakadokumen"} 
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Media Informasi
            </a>

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
          <a href="/consultation" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Konsultasi</a>
          
          <a 
            href={location.pathname === "/" ? "#pustakadokumen" : "/#pustakadokumen"} 
            className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" 
            onClick={closeMobileMenu}
          >
            Media Informasi
          </a>

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
