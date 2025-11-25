import React, { useRef } from "react";

export default function PustakaDokumen({ itemsProp }) {
  const defaultItems = [
    {
      id: "tester-1",
      title: "Dokumen 1",
      cover: "/images/pelaporan.png",
      file: "/pdf/tester.pdf",
    },
    {
      id: "tester-2",
      title: "Dokumen 2",
      cover: "/images/pelaporan.png",
      file: "/pdf/tester.pdf",
    },
    {
      id: "tester-2",
      title: "Dokumen 3",
      cover: "/images/pelaporan.png",
      file: "/pdf/tester.pdf",
    },
    {
      id: "tester-2",
      title: "Dokumen 4",
      cover: "/images/pelaporan.png",
      file: "/pdf/tester.pdf",
    },
    {
      id: "tester-2",
      title: "Dokumen 5",
      cover: "/images/pelaporan.png",
      file: "/pdf/tester.pdf",
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
      flex gap-6
      w-full
      ${items.length < 5 ? "md:justify-center" : "md:justify-start"}
    `}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openPdf(item.file)}
                  className="
  w-[140px] h-[200px]
  sm:w-[180px] sm:h-[240px]
  md:w-[220px] md:h-[300px]
  lg:w-[240px] lg:h-[320px]

  flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl

  bg-white/80 backdrop-blur-sm
  shadow-md border border-gray-200

  hover:bg-white/60
  hover:shadow-lg
  hover:-translate-y-[2px]

  transition-all duration-300 ease-out
"
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Title bar modern */}
                    <div
                      className="
              absolute bottom-0 left-0 right-0
              bg-gradient-to-t from-black/70 via-black/40 to-transparent
              px-3 py-2
            "
                    >
                      <h3 className="text-white text-sm md:text-base font-semibold line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}

              {/* Spacer kanan — pendek sesuai permintaan */}
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
