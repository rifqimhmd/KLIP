export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200">
      <div className="container mx-auto px-6 py-6 text-center text-sm">
        © {new Date().getFullYear()} Klinik Patnal - Direktorat Jenderal
        Pemasyarakatan — All rights reserved.
      </div>
    </footer>
  );
}
