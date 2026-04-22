import React, { useState, useEffect } from "react";
import api from "../lib/axios";

export default function PustakaDokumenDynamic() {
  // Default documents untuk fallback jika API error
  const defaultDocuments = [
    {
      id: 1,
      user_id: 1,
      title: "Kode Etik Pegawai Pemasyarakatan",
      category: "peraturan",
      sub_category: "permen",
      cover: "https://i.ibb.co.com/BH4xyT8j/Cover-Kode-Etik-Pegawai-Pemasyarakatan.jpg",
      file: "/pdf/Kode Etik Pegawai Pemasyarakatan.pdf",
      type: "pdf",
      status: "published",
    },
    {
      id: 2,
      user_id: 1,
      title: "Netralitas ASN dalam Pilkada",
      category: "peraturan",
      sub_category: "permen",
      cover: "https://i.ibb.co.com/xSfwxmzG/Cover-Pelanggaran-Netralitas-dan-Wewenang-ASN-dalam-Pilkada.jpg",
      file: "/pdf/Netralitas ASN dalam Pilkada.pdf",
      type: "pdf",
      status: "published",
    },
    {
      id: 3,
      user_id: 1,
      title: "Permen Iminpas No. 1 Tahun 2024",
      category: "peraturan",
      sub_category: "permen",
      cover: "https://i.ibb.co.com/XZmH47nT/Cover-Permen-Iminpas-No-1-Tahun-2024.jpg",
      file: "/pdf/Permen Iminpas No. 1 Tahun 2024.pdf",
      type: "pdf",
      status: "published",
    },
    {
      id: 4,
      user_id: 1,
      title: "PP No. 94 Tahun 2021 tentang Disiplin PNS",
      category: "peraturan",
      sub_category: "pp",
      cover: "https://i.ibb.co.com/zTM85KyH/Cover-PP-No-94-Tahun-2021-tentang-Disiplin-PNS.jpg",
      file: "/pdf/PP No. 94 Tahun 2021 tentang Disiplin PNS.pdf",
      type: "pdf",
      status: "published",
    },
    {
      id: 5,
      user_id: 1,
      title: "Disiplin Berat ASN: Perspektif Hukum",
      category: "peraturan",
      sub_category: "permen",
      cover: "https://i.ibb.co.com/tTZ0fRjh/Cover-Sanski.jpg",
      file: "/pdf/Disiplin Berat ASN: Perspektif Hukum.pdf",
      type: "pdf",
      status: "published",
    },
    {
      id: 6,
      user_id: 1,
      title: "UU ASN No.20 Tahun 2023 Tentang ASN",
      category: "peraturan",
      sub_category: "uu-perppu",
      cover: "https://i.ibb.co.com/1Gk7b2nc/Cover-UU-ASN-No-20-Tahun-2023-Tentang-ASN.jpg",
      file: "/pdf/UU ASN No.20 Tahun 2023 Tentang ASN.pdf",
      type: "pdf",
      status: "published",
    },
  ];

  // Default videos jika belum ada di database
  const defaultVideos = [
    { id: 1, video_url: "https://www.youtube.com/embed/bFmGdzeEV0s", type: "video" },
    { id: 2, video_url: "https://www.youtube.com/embed/6YOkAL8BoUU", type: "video" },
    { id: 3, video_url: "https://www.youtube.com/embed/aVgihMIhi6c", type: "video" },
    { id: 4, video_url: "https://www.youtube.com/embed/nP94bjzVUVY", type: "video" },
    { id: 5, video_url: "https://www.youtube.com/embed/OkgbKHkErjs", type: "video" },
    { id: 6, video_url: "https://www.youtube.com/embed/wygiJONYlQA", type: "video" },
    { id: 7, video_url: "https://www.youtube.com/embed/XyBxnqWxWns", type: "video" },
  ];

  // State untuk dokumen
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk kategori utama
  const [openCategories, setOpenCategories] = useState({
    peraturan: false,
    ebook: false,
    edukasi: false,
  });

  // State untuk sub-kategori (nested)
  const [openSubs, setOpenSubs] = useState({});

  // State untuk video edukasi
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/documents");
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      const docs = payload.filter(
        (doc) =>
          doc.type === "pdf" || doc.type === "ebook" || doc.type === "other"
      );
      const vids = payload.filter((doc) => doc.type === "video");

      // Use DB data; fall back to hardcoded defaults only if DB is completely empty
      setDocuments(docs.length > 0 ? docs : defaultDocuments);
      setVideos(vids.length > 0 ? vids : defaultVideos);
      setError(null);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Gagal memuat dokumen");
      setDocuments(defaultDocuments);
      setVideos(defaultVideos);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents dari API
  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const update = () => {
      setVisibleCount(window.innerWidth < 640 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, videos.length - visibleCount);

  const nextThumb = () => {
    setCarouselIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const prevThumb = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    const d = touchStartX - touchEndX;
    if (d > 50) nextThumb();
    if (d < -50) prevThumb();
  };

  const toggleCategory = (cat) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleSub = (subId) => {
    setOpenSubs((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const openPdf = async (fileUrl) => {
    if (!fileUrl) {
      alert("Maaf, file dokumen ini tidak tersedia.");
      return;
    }
    // External URLs (Google Drive, etc.) — open directly to avoid CORS
    if (fileUrl.startsWith("http")) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      return;
    }
    // Local PDFs — fetch as blob
    try {
      const finalUrl = window.location.origin + fileUrl;
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

  // Kelompokkan dokumen berdasarkan kategori dan sub_kategori
  const groupDocumentsByCategory = () => {
    const grouped = {
      peraturan: {},
      ebook: {},
      edukasi: {},
    };

    documents.forEach((doc) => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = {};
      }
      if (!grouped[doc.category][doc.sub_category]) {
        grouped[doc.category][doc.sub_category] = [];
      }
      grouped[doc.category][doc.sub_category].push(doc);
    });

    return grouped;
  };

  const groupedDocs = groupDocumentsByCategory();

  // Sub kategori untuk peraturan
  const subKategoriPeraturan = [
    { id: "uu-perppu", title: "Undang-Undang (UU) / Peraturan Pemerintah Pengganti Undang-Undang (Perppu)" },
    { id: "pp", title: "Peraturan Pemerintah (PP)" },
    { id: "perpres", title: "Peraturan Presiden (Perpres)" },
    { id: "permen", title: "Peraturan Menteri (Permen)" },
    { id: "peraturan-lainnya", title: "Peraturan Lainnya" },
  ];

  if (loading) {
    return (
      <section id="pustakadokumen" className="py-12">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <p className="text-gray-500">Memuat dokumen...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pustakadokumen" className="py-12">
      <div className="container mx-auto px-6 md:px-12">
        {/* Judul - Centered */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Pustaka Dokumen</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kumpulan dokumen pendukung ini disusun sebagai referensi dalam pelaksanaan 
            konsultasi dan layanan di Patnal Integrity Hub.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div
          className="w-full max-w-screen-2xl mx-auto
          px-3 sm:px-4 md:px-6 lg:px-10 xl:px-16
          space-y-4 md:space-y-5"
        >
          {/* ========================================= */}
          {/* KATEGORI 1: Himpunan Peraturan             */}
          {/* ========================================= */}
          <div className="bg-white rounded-xl shadow-sm md:shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory("peraturan")}
              className="w-full flex items-center justify-between
                px-4 sm:px-5 lg:px-6 py-3 sm:py-4
                hover:bg-blue-50 active:bg-blue-100
                transition-colors duration-200"
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
                <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
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

            {/* Sub-Kategori List */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openCategories.peraturan ? "max-h-[3000px]" : "max-h-0"
              }`}
            >
              <div className="border-t border-gray-100">
                {subKategoriPeraturan.map((sub) => (
                  <div
                    key={sub.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    {/* Sub Header */}
                    <button
                      onClick={() => toggleSub(sub.id)}
                      className="w-full flex items-center justify-between
                        px-5 sm:px-7 lg:px-9
                        py-3
                        hover:bg-blue-50/70
                        transition-colors duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${
                            openSubs[sub.id] ? "rotate-90" : ""
                          }`}
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
                        <span className="text-left text-gray-700 font-medium text-xs sm:text-sm lg:text-base">
                          {sub.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {(groupedDocs.peraturan[sub.id] || []).length > 0
                          ? `${groupedDocs.peraturan[sub.id].length} dokumen`
                          : "Kosong"}
                      </span>
                    </button>

                    {/* Sub Items */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openSubs[sub.id] ? "max-h-[1000px]" : "max-h-0"
                      }`}
                    >
                      {groupedDocs.peraturan[sub.id] && groupedDocs.peraturan[sub.id].length > 0 ? (
                        <ul className="bg-gray-50/50">
                          {groupedDocs.peraturan[sub.id].map((item) => (
                            <li
                              key={item.id}
                              className="border-t border-gray-100"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 px-8 sm:px-10 lg:px-12 py-3">
                                {item.file ? (
                                  <button
                                    onClick={() => openPdf(item.file)}
                                    className="w-full flex items-center gap-3 hover:bg-blue-50 
                                      transition-all duration-200 group -mx-3 px-3 py-2 rounded"
                                  >
                                    {item.cover ? (
                                      <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0">
                                        <img
                                          src={item.cover}
                                          alt={item.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0 bg-blue-50 border border-blue-200 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-bold text-blue-600">PDF</span>
                                      </div>
                                    )}
                                    <span className="flex-1 text-left text-gray-700 text-xs sm:text-sm lg:text-base group-hover:text-blue-600 transition-colors">
                                      {item.title}
                                    </span>
                                    <svg
                                      className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0"
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
                                ) : (
                                  <div className="w-full flex items-center gap-3 -mx-3 px-3 py-2 rounded opacity-70">
                                    {item.cover ? (
                                      <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0">
                                        <img
                                          src={item.cover}
                                          alt={item.title}
                                          className="w-full h-full object-cover grayscale opacity-80"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-gray-200 flex flex-col items-center justify-center opacity-80">
                                        <span className="text-[10px] font-bold text-gray-400">PDF</span>
                                      </div>
                                    )}
                                    <span className="flex-1 text-left text-gray-700 text-xs sm:text-sm lg:text-base">
                                      {item.title}
                                      <span className="ml-2 text-xs text-red-500 font-medium italic">(File tidak tersedia)</span>
                                    </span>
                                  </div>
                                )}
                                {item.status === "draft" && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full ml-2">
                                    Draft
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-gray-50/50 border-t border-gray-100 px-10 py-4 text-center">
                          <p className="text-gray-400 text-xs sm:text-sm">
                            Belum ada dokumen
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* KATEGORI 2: Standar Operasional Pelaksanaan          */}
          {/* ========================================= */}
          <div className="bg-white rounded-xl shadow-sm md:shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory("ebook")}
              className="w-full flex items-center justify-between
                px-4 sm:px-5 lg:px-6 py-3 sm:py-4
                hover:bg-blue-50 active:bg-blue-100
                transition-colors duration-200"
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
                <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
                  Standar Operasional Pelaksanaan
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openCategories.ebook ? "max-h-40" : "max-h-0"
              }`}
            >
              <div className="border-t border-gray-100 px-6 py-8 text-center">
                {groupedDocs.ebook && Object.keys(groupedDocs.ebook).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedDocs.ebook).map(([subCat, items]) => (
                      <div key={subCat}>
                        <h4 className="font-semibold text-gray-700 mb-2">{subCat}</h4>
                        <ul className="space-y-2">
                          {items.map((item) => (
                            <li key={item.id} className="text-gray-600">
                              {item.file ? (
                                <button
                                  onClick={() => openPdf(item.file)}
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {item.title}
                                </button>
                              ) : (
                                item.title
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Belum ada dokumen</p>
                )}
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* KATEGORI 3: Edukasi (Video)                */}
          {/* ========================================= */}
          {(videos.length > 0 || (groupedDocs.edukasi && Object.keys(groupedDocs.edukasi).length > 0)) && (
            <div className="bg-white rounded-xl shadow-sm md:shadow-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCategory("edukasi")}
                className="w-full flex items-center justify-between
                  px-4 sm:px-5 lg:px-6 py-3 sm:py-4
                  hover:bg-blue-50 active:bg-blue-100
                  transition-colors duration-200"
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
                  <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
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

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openCategories.edukasi ? "max-h-[1600px]" : "max-h-0"
                }`}
              >
                <div className="border-t border-gray-100 p-4 md:p-6 bg-gradient-to-b from-blue-50/50 to-white">
                  {/* Edukasi PDF Documents */}
                  {groupedDocs.edukasi && Object.keys(groupedDocs.edukasi).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
                        Dokumen Edukasi
                      </h4>
                      <ul className="space-y-2">
                        {Object.values(groupedDocs.edukasi).flat().map((item) => (
                          <li key={item.id} className="border border-gray-100 rounded-lg bg-white">
                            <button
                              onClick={() => openPdf(item.file)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50
                                transition-colors duration-200 group rounded-lg text-left"
                            >
                                {item.cover ? (
                                  <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0">
                                    <img
                                      src={item.cover}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-11 rounded overflow-hidden shadow-sm flex-shrink-0 bg-blue-50 border border-blue-200 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-bold text-blue-600">PDF</span>
                                  </div>
                                )}
                              <svg
                                className="w-5 h-5 text-red-500 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="flex-1 text-gray-700 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                                {item.title}
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0"
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
                  )}

                  {/* Video Edukasi */}
                  {videos[currentIndex] && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-6 max-h-[70vh]">
                      <iframe
                        key={videos[currentIndex].id}
                        className="w-full h-full"
                        src={videos[currentIndex].video_url}
                        title="Video Edukasi Utama"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="relative select-none">
                    <button
                      onClick={prevThumb}
                      disabled={carouselIndex <= 0}
                      className={`absolute -left-2 md:-left-3 top-1/2 -translate-y-1/2 bg-white shadow-md 
                        border border-blue-200 text-blue-600 rounded-full w-8 h-8 
                        flex items-center justify-center hover:bg-blue-50 z-10 text-sm
                        ${carouselIndex <= 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      ❮
                    </button>

                    <div
                      className="overflow-hidden mx-6 md:mx-8"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div
                        className="flex gap-3 md:gap-4 transition-transform duration-500"
                        style={{
                          transform: `translateX(-${
                            carouselIndex * (100 / visibleCount)
                          }%)`,
                        }}
                      >
                        {videos.map((v, i) => (
                          <div
                            key={v.id}
                            onClick={() => setCurrentIndex(i)}
                            className={`
                              min-w-[calc(50%-6px)] max-w-[calc(50%-6px)]
                              md:min-w-[calc(33.333%-11px)] md:max-w-[calc(33.333%-11px)]
                              aspect-video rounded-lg overflow-hidden 
                              cursor-pointer shadow-md transition-all ring-2
                              hover:shadow-lg hover:scale-[1.02]
                              ${currentIndex === i ? "ring-blue-500" : "ring-transparent"}
                            `}
                          >
                            <iframe
                              className="w-full h-full pointer-events-none"
                              src={v.video_url}
                              title={`Video ${v.id}`}
                            ></iframe>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={nextThumb}
                      disabled={carouselIndex >= maxIndex}
                      className={`absolute -right-2 md:-right-3 top-1/2 -translate-y-1/2 bg-white shadow-md 
                        border border-blue-200 text-blue-600 rounded-full w-8 h-8 
                        flex items-center justify-center hover:bg-blue-50 z-10 text-sm
                        ${carouselIndex >= maxIndex ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      ❯
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
