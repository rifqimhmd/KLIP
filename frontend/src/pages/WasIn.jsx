import { Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WasIn() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      
      <div className="text-center relative z-10 px-4">
        {/* Logo PATNAL */}
        <Link to="/" className="inline-block mb-8">
          <div className="text-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PATNAL
            </span>
            <span className="text-sm text-gray-500 block mt-1">Integrity Hub</span>
          </div>
        </Link>

        {/* Sparkle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Fitur Akan Datang</span>
        </div>

        {/* Clock Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
            <Clock className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* COMING SOON Text */}
        <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4 tracking-tight animate-pulse">
          COMING
        </h1>
        <h1 className="text-7xl md:text-9xl font-black text-gray-900 tracking-tight">
          SOON
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-xl text-gray-600 max-w-md mx-auto">
          Was-In sedang dalam pengembangan
        </p>
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
    </main>
  );
}
