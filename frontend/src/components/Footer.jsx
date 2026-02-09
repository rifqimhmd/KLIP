import { Mail, MapPin, Facebook, Instagram, Youtube, Music2, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 p-10 font-sans border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Kolom 1: Deskripsi & Sosmed (Logo sudah dihapus) */}
        <div className="space-y-6">
          {/* Bagian Deskripsi langsung di atas */}
          <p className="text-[14px] text-gray-500 leading-relaxed text-justify max-w-md">
            Direktorat Jenderal Pemasyarakatan berkomitmen dalam membangun integritas dan 
            memberikan edukasi berkelanjutan bagi seluruh jajaran demi terciptanya 
            pelayanan yang transparan dan akuntabel.
          </p>

          <div className="pt-2">
            <h4 className="font-bold text-sm mb-4 tracking-wide text-gray-900 uppercase">Terhubung dengan kami</h4>
            <div className="flex space-x-6 text-gray-600">
              <a href="https://facebook.com/ditjenpas" target="_blank" rel="noopener noreferrer">
                <Facebook size={22} className="hover:text-blue-600 cursor-pointer transition" />
              </a>

              <a href="https://instagram.com/ditjenpas" target="_blank" rel="noopener noreferrer">
                <Instagram size={22} className="hover:text-pink-600 cursor-pointer transition" />
              </a>

              <a href="https://youtube.com/@patnalditjenpas" target="_blank" rel="noopener noreferrer">
                <Youtube size={22} className="hover:text-red-600 cursor-pointer transition" />
              </a>

              <a href="https://tiktok.com/@antikorupsi.ditjenpas" target="_blank" rel="noopener noreferrer">
                <Music2 size={22} className="hover:text-black cursor-pointer transition" />
              </a>
            </div>
          </div>
        </div>

        {/* Kolom 2: Kotak Kontak Langsung */}
        <div className="flex justify-end">
          <div className="bg-gray-50 p-6 rounded-xl space-y-5 text-[13px] border border-gray-200 shadow-sm w-full max-w-sm">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Kontak Kami</h4>
            
            <div className="flex items-start space-x-3 text-gray-700">
              <MapPin size={22} className="text-blue-600 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-bold block mb-1 text-gray-900">Alamat Kantor</span>
                Jl. Veteran No. 11, Jakarta Pusat, DKI Jakarta
              </p>
            </div>
            
            <div className="flex items-center space-x-3 border-t border-gray-200 pt-4">
              <MessageCircle size={20} className="text-green-600 shrink-0" />
              <a href="https://wa.me/6281217265748" target="_blank" className="hover:underline text-gray-800 font-semibold">
                0812-1726-5748
              </a>
            </div>

            <div className="flex items-center space-x-3 border-t border-gray-200 pt-4">
              <Mail size={20} className="text-blue-600 shrink-0" />
              <a href="mailto:dit.patnal@gmail.com" className="hover:underline text-blue-600 font-semibold">
                dit.patnal@gmail.com
              </a>
            </div>
          </div>
        </div>

      </div>
      
      {/* Garis Bawah & Copyright */}
      <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Patnal Integrity Hub • Direktorat Jenderal Pemasyarakatan
      </div>
    </footer>
  );
}
