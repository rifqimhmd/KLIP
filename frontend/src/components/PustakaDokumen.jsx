import React, { useState } from "react";

export default function PustakaDokumen({ itemsProp }) {
  const defaultItems = [
    {
      id: "1",
      title: "Kode Etik Pegawai Pemasyarakatan",
      cover:
        "https://i.ibb.co.com/BH4xyT8j/Cover-Kode-Etik-Pegawai-Pemasyarakatan.jpg",
      file: "/pdf/Kode Etik Pegawai Pemasyarakatan.pdf",
    },
    {
      id: "2",
      title: "Netralitas ASN dalam Pilkada",
      cover:
        "https://i.ibb.co.com/xSfwxmzG/Cover-Pelanggaran-Netralitas-dan-Wewenang-ASN-dalam-Pilkada.jpg",
      file: "/pdf/Netralitas ASN dalam Pilkada.pdf",
    },
    {
      id: "3",
      title: "Permen Iminpas No. 1 Tahun 2024",
      cover:
        "https://i.ibb.co.com/XZmH47nT/Cover-Permen-Iminpas-No-1-Tahun-2024.jpg",
      file: "/pdf/Permen Iminpas No. 1 Tahun 2024.pdf",
    },
    {
      id: "4",
      title: "PP No. 94 Tahun 2021 tentang Disiplin PNS",
      cover:
        "https://i.ibb.co.com/zTM85KyH/Cover-PP-No-94-Tahun-2021-tentang-Disiplin-PNS.jpg",
      file: "/pdf/PP No. 94 Tahun 2021 tentang Disiplin PNS.pdf",
    },
    {
      id: "5",
      title: "Disiplin Berat ASN: Perspektif Hukum",
      cover: "https://i.ibb.co.com/tTZ0fRjh/Cover-Sanski.jpg",
      file: "/pdf/Disiplin Berat ASN: Perspektif Hukum.pdf",
    },
    {
      id: "6",
      title: "UU ASN No.20 Tahun 2023 Tentang ASN",
      cover:
        "https://i.ibb.co.com/1Gk7b2nc/Cover-UU-ASN-No-20-Tahun-2023-Tentang-ASN.jpg",
      file: "/pdf/UU ASN No.20 Tahun 2023 Tentang ASN.pdf",
    },
  ];

  const items = itemsProp?.length ? itemsProp : defaultItems;
  
  // State untuk kategori yang terbuka
  const [openCategories, setOpenCategories] = useState({
    peraturan: false,
    ebook: false,
    edukasi: false,
  });

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // === fungsi buka PDF
  const openPdf = async (fileUrl) => {
    try {
      const finalUrl = fileUrl.startsWith("http")
        ? fileUrl
        : window.location.origin + fileUrl;

      const response = await fetch(finalUrl, {
        headers: { "Cache-Control": "no-cache" },
      });

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("PDF gagal dibuka:", err);
    }
  };

  return (
    <section id="pustakadokumen" className="py-12">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-3xl font-bold mb-3 text-center">Pustaka Dokumen</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Kumpulan dokumen pendukung ini disiapkan sebagai referensi utama dalam
          kegiatan konsultasi dan layanan di Klinik Patnal, guna memastikan
          setiap proses kepatuhan, pengambilan keputusan, dan prosedur
          operasional berjalan berdasarkan informasi yang akurat, jelas, dan
          terdokumentasi dengan baik.
        </p>

        {/* Kategori List */}
        <div className="max-w-3xl mx-auto space-y-3">
          
          {/* === Kategori 1: Himpunan Peraturan Perundang-undangan === */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory("peraturan")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-semibold text-gray-800">
                  Himpunan Peraturan Perundang-Undangan
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                  openCategories.peraturan ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* List Dokumen */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openCategories.peraturan ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <ul className="border-t border-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => openPdf(item.file)}
                      className="
                        w-full flex items-center gap-4 
                        px-6 py-3 
                        hover:bg-blue-50 
                        transition-all duration-200
                        group
                      "
                    >
                      {/* Thumbnail kecil */}
                      <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0">
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Judul */}
                      <span className="flex-1 text-left text-gray-700 text-sm group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>

                      {/* Icon panah */}
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
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
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* === Kategori 2: E-book/Jurnal Pustaka === */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory("ebook")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="font-semibold text-gray-800">
                  E-book/Jurnal Pustaka
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                  openCategories.ebook ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Empty State */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openCategories.ebook ? "max-h-40" : "max-h-0"
              }`}
            >
              <div className="border-t border-gray-100 px-6 py-8 text-center">
                <p className="text-gray-400 text-sm">Belum ada dokumen</p>
              </div>
            </div>
          </div>

          {/* === Kategori 3: Edukasi === */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory("edukasi")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-semibold text-gray-800">
                  Edukasi
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                  openCategories.edukasi ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Empty State */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openCategories.edukasi ? "max-h-40" : "max-h-0"
              }`}
            >
              <div className="border-t border-gray-100 px-6 py-8 text-center">
                <p className="text-gray-400 text-sm">Belum ada dokumen</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
