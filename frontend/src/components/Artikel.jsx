import React, { useState } from "react";

export default function Artikel() {
  const [activeTab, setActiveTab] = useState("terbaru");

  const tabs = [
    { key: "terbaru", label: "Terbaru" },
    { key: "populer", label: "Terpopuler" },
  ];

  const articles = {
    terbaru: [
      {
        img: "/images/banner/1.png",
        title: "Kegiatan Edukasi di Klinik Patnal",
        desc: "Klinik Patnal mengadakan kegiatan edukasi terkait kesehatan mental bagi warga binaan...",
      },
      {
        img: "/images/banner/2.png",
        title: "Sosialisasi Layanan Konsultasi Online",
        desc: "Layanan konsultasi online kini dapat diakses melalui platform digital Klinik Patnal...",
      },
      {
        img: "/images/banner/3.png",
        title: "Pelatihan Deteksi Dini di UPT Pemasyarakatan",
        desc: "Petugas mengikuti pelatihan deteksi dini gangguan keamanan dan ketertiban...",
      },
      {
        img: "/images/banner/1.png",
        title: "Inovasi Layanan Pelaporan di Klinik Patnal",
        desc: "Klinik Patnal meluncurkan sistem pelaporan berbasis digital untuk memudahkan akses...",
      },
    ],
    populer: [
      {
        img: "/images/banner/2.png",
        title: "Tips Menjaga Kesehatan Mental di Lapas",
        desc: "Edukasi tentang pentingnya menjaga keseimbangan mental bagi warga binaan...",
      },
      {
        img: "/images/banner/3.png",
        title: "Kegiatan Sosialisasi di Rutan",
        desc: "Petugas Klinik Patnal menyampaikan edukasi kesehatan kepada warga binaan...",
      },
      {
        img: "/images/banner/1.png",
        title: "Workshop Penanganan Krisis",
        desc: "Pelatihan untuk meningkatkan respon petugas terhadap kondisi darurat di lapas...",
      },
      {
        img: "/images/banner/2.png",
        title: "Pelayanan Kesehatan Rutin",
        desc: "Kegiatan pemeriksaan kesehatan rutin bagi narapidana terus ditingkatkan...",
      },
    ],
  };

  return (
    <section id="artikel" className="py-16">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header kiri */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Artikel
          </h2>
          <p className="text-gray-600 mt-2 text-base md:text-lg">
            Informasi terbaru seputar Klinik Patnal dan Pemasyarakatan
          </p>
        </div>

        {/* Tabs kiri */}
        <div className="flex space-x-6 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-2 text-lg font-semibold transition-colors duration-200 ${
                activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.label}
              <span
                aria-hidden
                className={`block h-[2px] bg-blue-600 rounded-full mt-2 transition-all duration-300 ${
                  activeTab === tab.key ? "w-full" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Grid Artikel */}
        <div
          key={activeTab}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-400"
        >
          {articles[activeTab].map((art, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={art.img}
                  alt={art.title}
                  className="w-full h-44 object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3">{art.desc}</p>

                <div className="mt-4 flex items-center justify-between">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
                  >
                    Baca Selengkapnya
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>

                  <time className="text-xs text-gray-400">1 hari lalu</time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
