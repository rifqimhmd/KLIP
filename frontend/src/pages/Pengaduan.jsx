import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../lib/axios";
import {
  AlertCircle,
  Upload,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Clock,
  MapPin,
  User,
  Building,
  ChevronRight,
} from "lucide-react";

const KATEGORI_OPTIONS = [
  { value: "", label: "Pilih Kategori" },
  { value: "penyalahgunaan_wewenang", label: "Penyalahgunaan Wewenang" },
  { value: "pelanggaran_kode_etik", label: "Pelanggaran Kode Etik" },
  { value: "pungutan_liar", label: "Pungutan Liar" },
  { value: "disiplin_pegawai", label: "Disiplin Pegawai" },
  { value: "lainnya", label: "Lainnya" },
];

const LOKASI_OPTIONS = [
  { value: "", label: "Pilih Unit Kerja/Direktorat" },
  { value: "sekretariat_ditjenpas", label: "Sekretariat Ditjenpas" },
  { value: "direktorat_pemasyarakatan", label: "Direktorat Pemasyarakatan" },
  { value: "direktorat_kesehatan", label: "Direktorat Perawatan Kesehatan dan Rehabilitasi" },
  { value: "direktorat_pengawasan", label: "Direktorat Pengawasan" },
  { value: "pusat_data", label: "Pusat Data dan Informasi" },
  { value: "balai_diklat", label: "Balai Diklat" },
  { value: "lainnya", label: "Lainnya" },
];

export default function Pengaduan() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Informasi Dasar
    kategori: "",
    lokasi: "",
    tanggal_kejadian: "",
    jam_kejadian: "",
    // Inti Pengaduan
    nama_terlapor: "",
    jabatan_terlapor: "",
    deskripsi_kejadian: "",
    tempat_kejadian: "",
    alasan_pelanggaran: "",
    // Bukti Pendukung
    saksi: "",
    // Pernyataan
    anonim: false,
    pernyataan_kebenaran: false,
  });

  useEffect(() => {
    document.title = "Formulir Pengaduan - Patnal Integrity Hub";
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} tidak valid. Hanya JPG, PNG, atau PDF yang diperbolehkan.`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal 5MB.`);
        return false;
      }
      return true;
    });
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (!formData.kategori || !formData.lokasi || !formData.tanggal_kejadian) {
      setError("Mohon lengkapi semua field Informasi Dasar yang wajib diisi.");
      return;
    }
    if (!formData.deskripsi_kejadian || !formData.tempat_kejadian) {
      setError("Mohon lengkapi deskripsi dan tempat kejadian.");
      return;
    }
    if (!formData.pernyataan_kebenaran) {
      setError("Anda harus mencentang pernyataan kebenaran untuk melanjutkan.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "files") {
          // Convert boolean ke 1/0 untuk Laravel
          const value = typeof formData[key] === "boolean" 
            ? (formData[key] ? 1 : 0) 
            : formData[key];
          data.append(key, value);
        }
      });
      // Append files
      uploadedFiles.forEach((file) => {
        data.append("files[]", file);
      });

      const response = await api.post("/pengaduan", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          kategori: "",
          lokasi: "",
          tanggal_kejadian: "",
          jam_kejadian: "",
          nama_terlapor: "",
          jabatan_terlapor: "",
          deskripsi_kejadian: "",
          tempat_kejadian: "",
          alasan_pelanggaran: "",
          saksi: "",
          anonim: false,
          pernyataan_kebenaran: false,
        });
        setUploadedFiles([]);
      }
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data);
      
      // Tampilkan error validasi Laravel
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        setError(validationErrors.join("\n"));
      } else {
        setError(err.response?.data?.message || "Terjadi kesalahan saat mengirim pengaduan.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Pengaduan Berhasil Dikirim!
            </h2>
            <p className="text-gray-600 mb-6">
              Terima kasih atas laporan Anda. Tim kami akan meninjau pengaduan Anda dan memberikan
              update melalui email/dashboard.
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              formData.anonim ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            }`}>
              {formData.anonim ? (
                <><EyeOff className="w-4 h-4" /> Identitas Dirahasiakan</>
              ) : (
                <><Eye className="w-4 h-4" /> Identitas Terbuka</>
              )}
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Kirim Pengaduan Lain
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Sistem Pengaduan Internal
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Formulir Pengaduan
              </h1>
              <p className="text-blue-100 text-lg">
                Sampaikan laporan mengenai penyalahgunaan wewenang, pelanggaran kode etik,
                atau indikasi tindak pidana di lingkungan Ditjenpas.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Informasi Dasar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Informasi Dasar</h2>
                      <p className="text-sm text-gray-500">Data umum mengenai pengaduan</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Pengaduan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    >
                      {KATEGORI_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lokasi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi Kejadian <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      >
                        {LOKASI_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Waktu */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Kejadian <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="tanggal_kejadian"
                        value={formData.tanggal_kejadian}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perkiraan Jam
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          name="jam_kejadian"
                          value={formData.jam_kejadian}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Inti Pengaduan */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Inti Pengaduan</h2>
                      <p className="text-sm text-gray-500">Detail mengenai pelanggaran yang dilaporkan</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Siapa yang dilaporkan */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Terlapor (Opsional)
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="nama_terlapor"
                          value={formData.nama_terlapor}
                          onChange={handleInputChange}
                          placeholder="Nama lengkap jika diketahui"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan Terlapor (Opsional)
                      </label>
                      <input
                        type="text"
                        name="jabatan_terlapor"
                        value={formData.jabatan_terlapor}
                        onChange={handleInputChange}
                        placeholder="Jabatan/Unit kerja"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Apa yang terjadi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apa yang terjadi? <span className="text-red-500">*</span>
                      <span className="block text-xs text-gray-500 font-normal mt-1">
                        Deskripsi kronologi kejadian secara lengkap dan jelas
                      </span>
                    </label>
                    <textarea
                      name="deskripsi_kejadian"
                      value={formData.deskripsi_kejadian}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Jelaskan secara rinci apa yang terjadi, termasuk urutan kejadian..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                      required
                    />
                  </div>

                  {/* Di mana */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Di mana kejadian berlangsung? <span className="text-red-500">*</span>
                      <span className="block text-xs text-gray-500 font-normal mt-1">
                        Tempat spesifik di lingkungan kantor atau lokasi dinas
                      </span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        name="tempat_kejadian"
                        value={formData.tempat_kejadian}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Contoh: Ruang rapat lantai 3, Gedung A, atau Lokasi Dinas di Lapas..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Mengapa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mengapa hal ini dianggap pelanggaran?
                      <span className="block text-xs text-gray-500 font-normal mt-1">
                        Penjelasan singkat mengenai aturan yang dirasa dilanggar
                      </span>
                    </label>
                    <textarea
                      name="alasan_pelanggaran"
                      value={formData.alasan_pelanggaran}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Jelaskan dasar aturan/ketentuan yang dilanggar..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Bukti Pendukung */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Bukti Pendukung</h2>
                      <p className="text-sm text-gray-500">Lampiran untuk memperkuat pengaduan</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Upload Files */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unggah Bukti
                      <span className="block text-xs text-gray-500 font-normal mt-1">
                        Foto, Dokumen PDF, atau Screenshot (Maks. 5MB per file)
                      </span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition"
                    >
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-1">
                        Klik atau drag file ke sini untuk upload
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, PDF (Max 5MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* File List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Saksi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saksi (Opsional)
                      <span className="block text-xs text-gray-500 font-normal mt-1">
                        Apakah ada orang lain yang melihat/mengetahui kejadian?
                      </span>
                    </label>
                    <textarea
                      name="saksi"
                      value={formData.saksi}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Sebutkan nama/inisial saksi jika ada..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Pernyataan Kerahasiaan & Kebenaran */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl shadow-sm border border-violet-200 overflow-hidden">
                <div className="px-6 py-4 bg-violet-100/50 border-b border-violet-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-200 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-violet-700" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Pernyataan Kerahasiaan & Kebenaran</h2>
                      <p className="text-sm text-gray-500">Untuk melindungi dari laporan palsu</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Anonimitas */}
                  <div className="bg-white rounded-xl p-4 border border-violet-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="anonim"
                        checked={formData.anonim}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          Saya ingin identitas saya dirahasiakan
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Identitas Anda akan tetap dirahasiakan dari pihak terlapor, namun tetap terekam di sistem untuk keperluan verifikasi.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Pernyataan Kebenaran */}
                  <div className="bg-white rounded-xl p-4 border border-violet-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="pernyataan_kebenaran"
                        checked={formData.pernyataan_kebenaran}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mt-0.5"
                        required
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          Pernyataan Kebenaran <span className="text-red-500">*</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Saya menyatakan bahwa informasi yang saya berikan adalah benar dan dapat dipertanggungjawabkan. Saya memahami bahwa laporan palsu dapat dikenakan sanksi sesuai ketentuan yang berlaku.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Wajib diisi
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg shadow-blue-600/25"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Pengaduan
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

