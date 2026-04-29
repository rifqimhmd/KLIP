import { Clock, Shield, FileText, Sparkles } from 'lucide-react';

export default function WasIn() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Fitur Baru Akan Datang</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Was-In
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whistleblower System Internal - Sistem pengaduan internal yang aman dan terintegrasi
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-12 text-center relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
            
            {/* Clock Icon Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Clock className="w-16 h-16 text-white animate-pulse" />
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border-2 border-dashed border-blue-300 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </div>

            {/* Text Content */}
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Coming Soon
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                Fitur Was-In sedang dalam pengembangan. Nantikan kemudahan pengaduan internal dengan sistem yang aman, anonim, dan terintegrasi penuh.
              </p>

              {/* Feature Preview Cards */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Aman & Anonim</h4>
                  <p className="text-sm text-gray-600">Sistem pelaporan dengan proteksi identitas pelapor</p>
                </div>
                
                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Terintegrasi</h4>
                  <p className="text-sm text-gray-600">Terhubung dengan sistem pengaduan yang sudah ada</p>
                </div>
                
                <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Real-time</h4>
                  <p className="text-sm text-gray-600">Tracking status laporan secara real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
