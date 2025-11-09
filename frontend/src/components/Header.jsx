import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState({
    produk: false,
    konten: false,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowMobileMenu(false);
  };

  const closeLoginModal = () => setShowLoginModal(false);

  const toggleFormMode = () => setIsRegister(!isRegister);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <>
      {/* === HEADER === */}
      <header
        id="main-header"
        className={`bg-white text-gray-800 shadow-md sticky top-0 z-50 transition-transform duration-500 ${
          scrollHidden ? "-translate-y-full" : ""
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 py-2.5 md:px-6 md:py-4">
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
                src="../public/images/Logo.PNG"
                alt="Klinik Patnal"
                className="h-10 md:h-12 w-auto drop-shadow-sm"
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

            {/* === DROPDOWN PRODUK === */}
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
                    href="/pelaporan"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-b-lg"
                  >
                    Pelaporan
                  </a>
                </div>
              )}
            </div>

            <a
              href="/psikolog"
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              List Psikolog
            </a>

            {/* === DROPDOWN KONTEN === */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("konten")}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition py-2 focus:outline-none"
              >
                <span>Konten</span>
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
                    href="#artikel"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    Artikel
                  </a>
                  <a
                    href="#video-edukasi"
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

          {/* === TOMBOL LOGIN DESKTOP === */}
          <div className="hidden md:flex">
            <button
              onClick={openLoginModal}
              className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm text-base"
            >
              Masuk
            </button>
          </div>
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

        {/* === PRODUK MOBILE === */}
        <button
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
        </button>
        {mobileDropdown.produk && (
          <div className="flex flex-col bg-gray-50">
            <a
              href="/konsultasi"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Konsultasi
            </a>
            <a
              href="/pelaporan"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Pelaporan
            </a>
          </div>
        )}

        <a
          href="/psikolog"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
        >
          List Psikolog
        </a>

        {/* === KONTEN MOBILE === */}
        <button
          onClick={() => toggleMobileDropdown("konten")}
          className="w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 flex justify-between items-center"
        >
          <span>Konten</span>
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
              href="#artikel"
              className="block px-10 py-2 text-gray-700 hover:bg-blue-100"
            >
              Artikel
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

        <div className="px-6 py-4">
          <button
            onClick={openLoginModal}
            className="block w-full text-center bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
          >
            Masuk
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* === LOGIN / REGISTER MODAL === */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fadeIn">
          <div className="relative bg-white rounded-lg shadow-2xl w-[90%] max-w-sm p-8 transform transition-all duration-300 scale-95 animate-slideUp">
            {/* Tombol close */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={25} strokeWidth={2.5} />
            </button>

            {/* Judul */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
              {isRegister ? "Buat Akun Baru" : "Selamat Datang Kembali"}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {isRegister
                ? "Daftar untuk mengakses layanan kami"
                : "Masuk untuk mengakses layanan Anda"}
            </p>

            {/* Form */}
            <form className="space-y-4">
              {/* NIP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Masukkan NIP"
                  required
                />
              </div>

              {isRegister && (
                <>
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nama lengkap anda"
                      required
                    />
                  </div>

                  {/* Tipe Pengguna */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Pengguna
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all duration-200 appearance-none"
                      required
                      defaultValue=""
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        backgroundSize: "1.2em",
                      }}
                    >
                      <option value="" disabled>
                        Pilih tipe pengguna...
                      </option>
                      <option value="psikolog">Psikolog</option>
                      <option value="pegawai">Pegawai</option>
                    </select>
                  </div>
                </>
              )}

              {/* Kata Sandi */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 text-lg"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Tombol submit */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                {isRegister ? "Daftar" : "Masuk"}
              </button>
            </form>

            {/* Switch form */}
            <p className="text-center text-sm text-gray-600 mt-5">
              {isRegister ? (
                <>
                  Sudah punya akun?{" "}
                  <button
                    onClick={toggleFormMode}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Masuk di sini
                  </button>
                </>
              ) : (
                <>
                  Belum punya akun?{" "}
                  <button
                    onClick={toggleFormMode}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Daftar di sini
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
