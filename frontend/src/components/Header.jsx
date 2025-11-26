// Updated Header component with login/register removed
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState({
    produk: false,
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

  const closeMobileMenu = () => setShowMobileMenu(false);

  const toggleMobileDropdown = (menu) => {
    setMobileDropdown((prev) => {
      const newState = { produk: false, konten: false };
      newState[menu] = !prev[menu];
      return newState;
    });
  };

  return (
    <>
      {/* === HEADER === */}
      <header
        id="main-header"
        className={`bg-white text-gray-800 shadow-md sticky top-0 z-50 transition-transform duration-500 ${
          scrollHidden ? "-translate-y-full" : ""
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 py-2.5 md:px-6 md:py-3">
          {/* === KIRI: LOGO & HAMBURGER === */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden focus:outline-none mr-2 relative w-5 h-5"
            >
              <span
                className={`absolute left-0 top-1/2 block h-[1.5px] w-5 bg-gray-700 transition-all duration-300 transform ${
                  showMobileMenu
                    ? "rotate-45 translate-y-0"
                    : "-translate-y-1.5"
                }`}
              ></span>
              <span
                className={`absolute left-0 top-1/2 block h-[1.5px] w-5 bg-gray-700 transition-all duration-300 ${
                  showMobileMenu ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`absolute left-0 top-1/2 block h-[1.5px] w-5 bg-gray-700 transition-all duration-300 transform ${
                  showMobileMenu
                    ? "-rotate-45 translate-y-0"
                    : "translate-y-1.5"
                }`}
              ></span>
            </button>

            <a href="/" className="flex items-center space-x-2">
              <img
                src="/Logo.png"
                alt="Klinik Patnal"
                className="h-10 md:h-[52px] w-auto drop-shadow-sm"
              />
            </a>
          </div>

          {/* === NAVIGASI DESKTOP === */}
          <nav className="hidden md:flex space-x-8 font-medium text-base relative items-center">
            <a
              href="/"
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Beranda
            </a>

            {/* 
            <div className="relative">
              <button
                onClick={() => toggleDropdown("produk")}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition py-2 focus:outline-none"
              >
                <span>Produk</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "produk" && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <a
                    href="/konsultasi"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-t-lg"
                  >
                    Konsultasi
                  </a>
                  <a
                    href="/wbs"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-b-lg"
                  >
                    Layanan WBS
                  </a>
                </div>
              )}
            </div> */}

            <a
              href="https://konsultasi.klinikpatnal.com/"
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Konsultasi
            </a>

            <div className="relative">
              <button
                onClick={() => toggleDropdown("konten")}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition py-2 focus:outline-none"
              >
                <span>Media Informasi</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "konten" && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <a
                    href={location.pathname === "/" ? "#pustakadokumen" : "/"}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    Pustaka Dokumen
                  </a>
                  <a
                    href={location.pathname === "/" ? "#videoedukasi" : "/"}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    Video Edukasi
                  </a>
                </div>
              )}
            </div>

            <a
              href="/tentang"
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Tentang Kami
            </a>
          </nav>
        </div>
      </header>

      {/* === SIDEBAR MOBILE === */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-white border-r border-gray-200 transform transition-transform duration-500 ease-in-out md:hidden z-40 overflow-y-auto shadow-lg ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <span className="font-semibold text-lg text-gray-800">Menu</span>
        </div>

        <a
          href="/"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          onClick={closeMobileMenu}
        >
          Beranda
        </a>
        <a
          href="https://konsultasi.klinikpatnal.com/"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          onClick={closeMobileMenu}
        >
          Konsultasi
        </a>
        {/* === PRODUK MOBILE === */}
        {/* <button
          onClick={() => toggleMobileDropdown("produk")}
          className="w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 flex justify-between items-center"
        >
          <span>Produk</span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 ${
              mobileDropdown.produk ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button> */}
        {mobileDropdown.produk && (
          <div className="flex flex-col bg-gray-50">
            <a
              href="/konsultasi"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Konsultasi
            </a>
            <a
              href="/wbs"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Layanan WBS
            </a>
          </div>
        )}

        {/* === KONTEN MOBILE === */}
        <button
          onClick={() => toggleMobileDropdown("konten")}
          className="w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 flex justify-between items-center"
        >
          <span>Media Informasi</span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 ${
              mobileDropdown.konten ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {mobileDropdown.konten && (
          <div className="flex flex-col bg-gray-50">
            <a
              href="#pustakadokumen"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Pustaka Dokumen
            </a>
            <a
              href="#video-edukasi"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Video Edukasi
            </a>
          </div>
        )}

        <a
          href="/tentang"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
        >
          Tentang Kami
        </a>
      </div>

      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={closeMobileMenu}
        ></div>
      )}
    </>
  );
}
