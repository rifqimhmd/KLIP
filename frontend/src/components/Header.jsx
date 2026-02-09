import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState({
    konten: false,
  });

  // === HIDE HEADER ON SCROLL ===
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      setScrollHidden(currentScroll > lastScroll && currentScroll > 80);
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setMobileDropdown({ konten: false });
  };

  const toggleMobileDropdown = (menu) => {
    setMobileDropdown((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
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
              onClick={toggleMobileMenu}
              className="md:hidden focus:outline-none mr-4 relative w-6 h-5"
            >
              <span className={`absolute left-0 block h-[2px] w-6 bg-gray-700 transition-all duration-300 ${showMobileMenu ? "rotate-45 top-2.5" : "top-0"}`}></span>
              <span className={`absolute left-0 top-2 block h-[2px] w-6 bg-gray-700 transition-all duration-300 ${showMobileMenu ? "opacity-0" : "opacity-100"}`}></span>
              <span className={`absolute left-0 block h-[2px] w-6 bg-gray-700 transition-all duration-300 ${showMobileMenu ? "-rotate-45 top-2.5" : "top-4"}`}></span>
            </button>

            <a href="/" className="flex items-center">
              <img
                src="/Logo.png"
                alt="Klinik Patnal"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* === NAVIGASI DESKTOP === */}
          <nav className="hidden md:flex space-x-10 font-medium text-[15px] items-center">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition">Beranda</a>
            
            <a href="https://konsultasi.klinikpatnal.com/" className="text-gray-700 hover:text-blue-600 transition">Konsultasi</a>

            {/* Dropdown Media Informasi (Hanya Pustaka Dokumen) */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown("konten")}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition focus:outline-none"
              >
                <span>Media Informasi</span>
                <svg className={`h-4 w-4 transition-transform ${openDropdown === "konten" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openDropdown === "konten" && (
                <div className="absolute left-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
                  <a
                    href={location.pathname === "/" ? "#pustakadokumen" : "/"}
                    className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Pustaka Dokumen
                  </a>
                </div>
              )}
            </div>

            <a href="/tentang" className="text-gray-700 hover:text-blue-600 transition">Tentang Kami</a>
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
          <span className="font-bold text-xl text-blue-600 uppercase tracking-tight">Klinik Patnal</span>
        </div>

        <nav className="flex flex-col py-4">
          <a href="/" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Beranda</a>
          <a href="https://konsultasi.klinikpatnal.com/" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Konsultasi</a>
          
          <button
            onClick={() => toggleMobileDropdown("konten")}
            className="w-full text-left px-6 py-4 text-gray-700 hover:bg-blue-50 flex justify-between items-center font-medium border-b border-gray-50"
          >
            <span>Media Informasi</span>
            <svg className={`w-4 h-4 transition-transform ${mobileDropdown.konten ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {mobileDropdown.konten && (
            <div className="bg-gray-50">
              <a
                href={location.pathname === "/" ? "#pustakadokumen" : "/"}
                className="block px-12 py-3 text-sm text-gray-600 hover:text-blue-600"
                onClick={closeMobileMenu}
              >
                Pustaka Dokumen
              </a>
            </div>
          )}

          <a href="/tentang" className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium border-b border-gray-50" onClick={closeMobileMenu}>Tentang Kami</a>
        </nav>
      </div>

      {/* Overlay Mobile */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[55] transition-opacity" onClick={closeMobileMenu}></div>
      )}
    </>
  );
}
