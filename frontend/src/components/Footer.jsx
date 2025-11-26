import { Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
          {/* Brand + Copyright */}
          <div className="text-center md:text-left text-gray-800">
            © {new Date().getFullYear()} Klinik Patnal • Direktorat Jenderal
            Pemasyarakatan
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4 text-blue-600">
            <a
              href="mailto:dit.patnal@gmail.com"
              className="flex items-center gap-1 hover:underline"
            >
              <Mail size={15} className="opacity-70" />
              <span>dit.patnal@gmail.com</span>
            </a>

            <a
              href="https://wa.me/6281217265748"
              target="_blank"
              className="flex items-center gap-1 hover:underline"
            >
              <MessageCircle size={15} className="opacity-70" />
              <span>0812-1726-5748</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
