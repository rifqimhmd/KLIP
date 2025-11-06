import React from "react";

export default function Produk() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-white to-blue-50 mt-4">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-10">
        {/* === Kiri: Teks & Tombol Produk === */}
        <div className="flex-1 text-center md:text-left md:pt-0 pt-8">
          <p className="text-blue-600 font-semibold text-sm md:text-base">
            Temukan Layanan Konseling dan Pelaporan yang Profesional &
            Terpercaya
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-blue-600 leading-snug mt-4 md:mt-6">
            Bersama Kami, <br />
            Kamu Tidak Sendiri Lagi
          </h2>

          <p className="text-gray-700 mt-4 mb-10 text-base md:text-lg">
            Pilih layanan yang sesuai dengan kebutuhanmu.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
            {/* === Kartu Konsultasi === */}
            <a
              href="/konsultasi"
              className="group bg-white shadow-md rounded-xl p-5 flex items-center justify-between w-full sm:w-72 
                hover:bg-blue-50 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-left">
                <p className="text-gray-500 text-sm">Konsultasi untuk saya</p>
                <h3 className="text-blue-600 font-semibold text-lg group-hover:text-blue-700">
                  Konsultasi
                </h3>
                <div className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-2">
                  Pilih
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              <img
                src="/images/konsultasi.png"
                alt="Konsultasi"
                className="w-16 h-16 object-contain"
              />
            </a>

            {/* === Kartu Pelaporan === */}
            <a
              href="/pelaporan"
              className="group bg-white shadow-md rounded-xl p-5 flex items-center justify-between w-full sm:w-72 
                hover:bg-blue-50 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-left">
                <p className="text-gray-500 text-sm">Pelaporan untuk saya</p>
                <h3 className="text-blue-600 font-semibold text-lg group-hover:text-blue-700">
                  Pelaporan
                </h3>
                <div className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-2">
                  Pilih
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              <img
                src="/images/pelaporan.png"
                alt="Pelaporan"
                className="w-16 h-16 object-contain"
              />
            </a>
          </div>
        </div>

        {/* === Kanan: Gambar Ilustrasi === */}
        <div className="flex-1 flex justify-center md:justify-end md:pt-24">
          <img
            src="/images/produk.png"
            alt="Produk Klinik Patnal"
            className="w-80 md:w-[420px] max-w-full object-contain drop-shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
