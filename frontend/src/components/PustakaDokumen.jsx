import React from "react";

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

        {/* List Dokumen */}
        <ul className="max-w-3xl mx-auto space-y-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => openPdf(item.file)}
                className="
                  w-full flex items-center gap-4 
                  px-5 py-4 
                  bg-white hover:bg-blue-50 
                  border border-gray-200 rounded-xl
                  shadow-sm hover:shadow-md
                  transition-all duration-200
                  group
                "
              >
                {/* Nomor */}
                <span className="text-blue-600 font-bold text-lg w-8 text-center">
                  {index + 1}.
                </span>
                
                {/* Thumbnail kecil */}
                <div className="w-10 h-14 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Judul */}
                <span className="flex-1 text-left text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                  {item.title}
                </span>

                {/* Icon panah */}
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
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
    </section>
  );
}
