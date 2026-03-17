import React, { useEffect, useState } from "react";

export default function Produk() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem('auth_user_role'));
  }, []);

  const showChat = role === 'User' || role === 'Psikolog';

  return (
    <section
      className="
    relative w-full overflow-hidden 
    bg-gradient-to-r from-white to-blue-50 
    mt-4
  "
    >
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-10">
        {/* === Kiri: Teks & Tombol Produk === */}
        <div
          className="
      flex-1 
      text-center md:text-left 
      pt-10 md:pt-20 
      pb-10 md:pb-20
    "
        >
          <p className="text-blue-600 font-semibold text-sm md:text-base">
            Konsultasi? Gampang kok! ada PATNAL disini.
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-blue-600 leading-snug mt-4 md:mt-6">
            Trust me! 
          </h2>
          
        <p className="text-3xl md:text-5xl font-bold text-blue-600 leading-snug ">
            Di sini kamu bisa ngomong bebas,<br />
            tanpa takut di-judge!
        </p>
          
          <p className="text-gray-700 mt-4 mb-10 text-base md:text-lg">
            Patnal di sini buat bantu kamu cari solusi.
          </p>

          <div className={`flex md:justify-start justify-center mt-6 gap-4 flex-wrap`}>
            {/* ── Chat Card (User & Psikolog only) — kiri ── */}
            {showChat && (
              <a
                href="/chat"
                className={`
                group relative rounded-2xl px-6 py-5
                flex items-center justify-between
                w-full md:w-[540px] lg:w-[580px]
                bg-white
                border border-gray-200/70 shadow-sm
                hover:shadow-lg hover:border-indigo-100
                transition-all duration-300
              `}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-50/30 to-white opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>

                <div className="text-left relative z-10 space-y-1.5">
                  <p className="text-gray-500 text-sm">💬 Fitur Chat</p>

                  <h3 className="text-indigo-600 font-bold text-xl tracking-tight group-hover:text-indigo-700 transition-colors">
                    Chat dengan Psikolog
                  </h3>

                  <p className="text-gray-600 text-xs leading-relaxed">
                    Konsultasi langsung dari psikolog bersertifikat kami.<br />
                    <span className="text-gray-400">(Setelah menyelesaikan profiling)</span>
                  </p>

                  <div className="flex items-center gap-1 text-indigo-600 text-sm font-medium pt-1">
                    <span className="transition-all duration-300 group-hover:translate-x-1">Mulai Chat</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5">
                  💬
                </div>
              </a>
            )}

            {/* ── Konsultasi Card (guest only) ── */}
            {!showChat && (
              <a
                href="/consultation"
                className="
              group relative rounded-2xl px-6 py-5
              flex items-center justify-between
              bg-white
              border border-gray-200/70 shadow-sm
              hover:shadow-lg hover:border-blue-100
              transition-all duration-300
              w-full md:w-[540px] lg:w-[580px]
            "
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/30 to-white opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>

                <div className="text-left relative z-10 space-y-1.5">
                  <p className="text-gray-500 text-sm">Konsultasi untuk saya</p>

                  <h3 className="text-blue-600 font-bold text-xl tracking-tight group-hover:text-blue-700 transition-colors">
                    Konsultasi
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    Layanan konsultasi profesional.
                  </p>

                  <div className="flex items-center gap-1 text-blue-600 text-sm font-medium pt-1">
                    <span className="transition-all duration-300 group-hover:translate-x-1">Pilih</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <img
                  src="/images/konsultasi.png"
                  alt="Konsultasi"
                  className="w-16 h-16 object-contain relative z-10 flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5"
                />
              </a>
            )}
          </div>
        </div>

        {/* === Kanan: Gambar Ilustrasi === */}
        <div
          className="
    flex-1 flex justify-center md:justify-end
    pt-10 md:pt-20 lg:pt-24
  "
        >
          <div
            className="
    relative 
    w-full

    translate-y-[8px]          /* HP kecil */
    sm:translate-y-[12px]      /* HP besar */
    md:translate-y-[16px]      /* Tablet */
    lg:translate-y-[20px]      /* Desktop 1024–1279 */
    xl:translate-y-[18px]      /* Desktop 1280–1440 (1366 masuk sini) */
    2xl:translate-y-[16px]     /* Layar sangat besar (≥1536) */

    max-w-[380px]
    sm:max-w-[480px]
    md:max-w-[720px]
    lg:max-w-[920px]
    xl:max-w-[1100px]
    2xl:max-w-[1280px]
  "
          >
            {/* Glow */}
            <div
              className="
        absolute inset-0 
        bg-gradient-to-br from-blue-100/40 to-blue-50/0 
        rounded-3xl blur-2xl 
        opacity-60 pointer-events-none
      "
            ></div>

            {/* Image */}
            <img
              src="/images/produk.png"
              alt="Produk Patnal Integrity Hub"
              className="
        relative z-10
        w-full
        h-auto
        object-contain
        transition-all duration-500 
        drop-shadow-xl
        group-hover:scale-[1.03]
        group-hover:-translate-y-1
      "
            />
          </div>
        </div>
      </div>
    </section>
  );
}
