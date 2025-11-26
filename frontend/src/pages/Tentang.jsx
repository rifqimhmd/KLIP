import MainLayout from "../layouts/MainLayout";
import { useEffect } from "react";
import { ShieldCheck, BookOpenCheck, MessageSquare } from "lucide-react";

export default function Tentang() {
  useEffect(() => {
    document.title = "Klinik Patnal - Tentang Kami";
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen w-full bg-gray-50 text-gray-800">
        {/* HERO */}
        <section className="relative w-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 text-white">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20 mix-blend-overlay"></div>

          <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center relative z-10">
            <img
              src="/icon.png"
              alt="Klinik Kepatuhan Internal"
              className="mx-auto mb-6 w-20 h-20 md:w-24 md:h-24 drop-shadow-xl animate-fadeIn"
            />

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm mb-2 animate-fadeInUp">
              Klinik Kepatuhan Internal
            </h1>

            <p className="text-lg md:text-xl font-medium opacity-90 animate-fadeInUp">
              Konsultasi Aman, Respons Tepat
            </p>
          </div>
        </section>

        {/* CONTENT CARD */}
        <section className="max-w-4xl mx-auto px-6 -mt-8 md:-mt-10 relative">
          <div
            className="
              bg-white/95 backdrop-blur-xl 
              p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-xl border border-white/40
              animate-fadeInUp
            "
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-gray-800">
              Tentang Kami
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed text-justify">
              <p>
                Klinik Kepatuhan Internal merupakan unit layanan yang berada di
                bawah Direktorat Kepatuhan Internal, berkomitmen untuk mendukung
                pelaksanaan kepatuhan yang efektif dan berkelanjutan di dalam
                organisasi. Klinik ini hadir sebagai pusat konsultasi, edukasi,
                dan pemecahan masalah terkait kepatuhan internal, guna
                memastikan seluruh proses dan aktivitas organisasi sesuai dengan
                peraturan, standar, dan kebijakan yang berlaku.
              </p>

              <p>
                Misi kami adalah memberikan layanan yang responsif dan
                terpercaya dalam penanganan isu-isu kepatuhan, serta mengedukasi
                seluruh pemangku kepentingan agar tercipta budaya kepatuhan yang
                kuat dan konsisten. Melalui pendekatan yang profesional dan
                berorientasi pada solusi, Klinik Kepatuhan Internal membantu
                mengidentifikasi, mencegah, dan mengatasi risiko kepatuhan
                sehingga organisasi dapat beroperasi secara transparan dan
                akuntabel.
              </p>

              <p>
                Kami berkomitmen tinggi untuk menjadi mitra yang handal bagi
                seluruh unit kerja dalam meningkatkan integritas dan tata kelola
                yang baik demi mencapai visi organisasi.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h3 className="text-2xl md:text-3xl font-semibold mb-12 text-gray-800 text-center">
            Fokus Layanan Klinik
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-12 h-12" />,
                title: "Kepatuhan Internal",
                desc: "Memastikan seluruh proses organisasi berjalan sesuai regulasi & standar.",
              },
              {
                icon: <BookOpenCheck className="w-12 h-12" />,
                title: "Edukasi & Sosialisasi",
                desc: "Meningkatkan pemahaman budaya kepatuhan & integritas di seluruh unit.",
              },
              {
                icon: <MessageSquare className="w-12 h-12" />,
                title: "Konsultasi & Solusi",
                desc: "Ruang konsultasi aman dengan respons cepat dan berorientasi solusi.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="
                  bg-white rounded-2xl p-8 shadow-lg border border-gray-100 
                  hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
                  text-center
                "
              >
                <div className="text-indigo-600 mx-auto mb-4">{item.icon}</div>
                <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
        .animate-fadeInUp {
          opacity: 0;
          transform: translateY(10px);
          animation: fadeInUp 0.8s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </MainLayout>
  );
}
