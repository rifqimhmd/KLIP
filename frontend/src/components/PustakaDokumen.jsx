import React, { useRef } from "react";

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
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  // === fungsi buka PDF lewat Google Docs (anti IDM)
  const openPdf = async (fileUrl) => {
    try {
      // pastikan URL absolut
      const finalUrl = fileUrl.startsWith("http")
        ? fileUrl
        : window.location.origin + fileUrl;

      // ambil pdf sebagai blob
      const response = await fetch(finalUrl, {
        headers: { "Cache-Control": "no-cache" },
      });

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // buka pdf manual (tanpa download)
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

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border border-blue-200 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 z-10"
          >
            ❮
          </button>
          <div
            className="overflow-x-auto scrollbar-hide scroll-smooth py-4 
  px-8 md:px-14"
            ref={scrollRef}
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className={`
      flex gap-6 w-full
      ${items.length < 5 ? "md:justify-center" : "md:justify-start"}
    `}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openPdf(item.file)}
                  className="
          w-[150px] h-[220px]
          sm:w-[190px] sm:h-[260px]
          md:w-[230px] md:h-[320px]
          lg:w-[250px] lg:h-[340px]

          flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl

          bg-white/70 backdrop-blur-sm
          shadow-xl border border-gray-300

          hover:bg-white/80
          hover:shadow-2xl
          hover:-translate-y-1

          transition-all duration-300 ease-out
        "
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Title bar sangat kontras */}
                    <div
                      className="
              absolute bottom-0 left-0 right-0
              bg-gradient-to-t 
              from-black/90 via-black/70 to-transparent
              px-3 py-3
            "
                    >
                      <h3
                        className="
                text-white text-sm md:text-base font-semibold 
                line-clamp-2 leading-tight
                drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]
              "
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}

              <div className="w-4 sm:w-6 md:w-10 flex-shrink-0"></div>
            </div>
          </div>

          <button
            onClick={scrollRight}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border border-blue-200 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 z-10"
          >
            ❯
          </button>
        </div>
      </div>
    </section>
  );
}
