import {
  BookOpen,
  ClipboardList,
  Image,
  Plus,
  Shield,
  Star,
  Users,
} from "lucide-react";

export default function AdminDashboardMenu({
  consultationsCount,
  usersCount,
  documentsCount,
  psychologistCount,
  onOpenConsultation,
  onOpenUsers,
  onOpenDocuments,
  onOpenSurvey,
  onOpenProdukImages,
  onOpenPsychologistPhotos,
  onOpenBanners,
  onOpenLogos,
  onOpenKasubditPhotos,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <button
        onClick={onOpenConsultation}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 p-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <p className="font-bold text-gray-800 text-base mb-2">
            Monitoring Konsultasi
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Lihat semua sesi konsultasi yang aktif.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">
              {consultationsCount} sesi
            </span>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
      </button>

      <button
        onClick={onOpenUsers}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-green-300 transition-all duration-300 p-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-shadow">
            <Users className="w-6 h-6 text-white" />
          </div>
          <p className="font-bold text-gray-800 text-base mb-2">
            Manajemen User
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Tambah, edit, dan hapus user.
          </p>
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-semibold">
            {usersCount} user
          </span>
        </div>
      </button>

      <button
        onClick={onOpenDocuments}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 transition-all duration-300 p-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-200 group-hover:shadow-orange-300 transition-shadow">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <p className="font-bold text-gray-800 text-base mb-2">
            Manajemen Dokumen
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Upload dan kelola dokumen PDF.
          </p>
          <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-semibold">
            {documentsCount} dokumen
          </span>
        </div>
      </button>

      <a
        href="/admin/pengaduan"
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-purple-300 transition-all duration-300 p-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-200 group-hover:shadow-purple-300 transition-shadow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="font-bold text-gray-800 text-base mb-2">
            Manajemen Pengaduan
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Lihat dan proses pengaduan pegawai.
          </p>
          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-semibold">
            Kelola Pengaduan
          </span>
        </div>
      </a>

      <button
        onClick={onOpenSurvey}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-pink-300 transition-all duration-300 p-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-pink-200 group-hover:shadow-pink-300 transition-shadow">
            <Star className="w-6 h-6 text-white" />
          </div>
          <p className="font-bold text-gray-800 text-base mb-2">
            Survey Kepuasan
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Lihat hasil dan analisis survey kepuasan pengguna.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-full font-semibold">
              Analytics
            </span>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-semibold">
              Export
            </span>
          </div>
        </div>
      </button>

      <button
        onClick={onOpenProdukImages}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full opacity-70" />
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors">
          <Image className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
        </div>
        <p className="font-semibold text-gray-800 text-sm mb-1">Gambar Produk</p>
        <p className="text-xs text-gray-500 mb-3">
          Upload 4 gambar produk layanan.
        </p>
        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
          4 Slot
        </span>
      </button>

      <button
        onClick={onOpenPsychologistPhotos}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 p-5 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
          <Plus className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
        </div>
        <p className="font-semibold text-gray-800 text-sm mb-1">Foto Psikolog</p>
        <p className="text-xs text-gray-500 mb-3">
          Upload foto profil tim psikologi.
        </p>
        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
          {psychologistCount} Psikolog
        </span>
      </button>

      <button
        onClick={onOpenBanners}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all duration-200 p-5 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full opacity-70" />
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:bg-pink-600 transition-colors">
          <Image className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors" />
        </div>
        <p className="font-semibold text-gray-800 text-sm mb-1">
          Kelola Gambar Banner
        </p>
        <p className="text-xs text-gray-500 mb-2">
          Upload dan atur 4 banner pada halaman Beranda.
        </p>
        <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full font-medium">
          4 Banners
        </span>
      </button>

      <button
        onClick={onOpenLogos}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 p-5 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
          <span className="text-lg">🏛️</span>
        </div>
        <p className="font-semibold text-gray-800 text-sm mb-1">Kelola Logo</p>
        <p className="text-xs text-gray-500 mb-2">
          Upload logo untuk halaman login dan beranda.
        </p>
        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
          3 Logos
        </span>
      </button>

      <button
        onClick={onOpenKasubditPhotos}
        className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200 p-5 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-50 rounded-bl-full opacity-70" />
        <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center mb-3 group-hover:bg-cyan-600 transition-colors">
          <Users className="w-5 h-5 text-cyan-600 group-hover:text-white transition-colors" />
        </div>
        <p className="font-semibold text-gray-800 text-sm mb-1">
          Upload Foto Kasubdit
        </p>
        <p className="text-xs text-gray-500">
          Upload foto untuk 5 pimpinan Direktorat Kepatuhan Internal.
        </p>
        <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full font-medium">
          5 Photos
        </span>
      </button>
    </div>
  );
}
