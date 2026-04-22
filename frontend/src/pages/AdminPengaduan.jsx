import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../lib/axios";
import {
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_COLORS = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  diproses: { bg: "bg-blue-100", text: "text-blue-700", label: "Diproses" },
  selesai: { bg: "bg-green-100", text: "text-green-700", label: "Selesai" },
  ditolak: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
};

const KATEGORI_LABELS = {
  penyalahgunaan_wewenang: "Penyalahgunaan Wewenang",
  pelanggaran_kode_etik: "Pelanggaran Kode Etik",
  pungutan_liar: "Pungutan Liar",
  disiplin_pegawai: "Disiplin Pegawai",
  lainnya: "Lainnya",
};

export default function AdminPengaduan() {
  const [pengaduans, setPengaduans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPengaduan, setSelectedPengaduan] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Manajemen Pengaduan - Admin";
    fetchPengaduans();
  }, []);

  const fetchPengaduans = async () => {
    try {
      setLoading(true);
      
      // DEBUG: Cek token dan role
      const token = localStorage.getItem("auth_token");
      const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
      console.log("DEBUG - Token:", token ? "ADA" : "KOSONG");
      console.log("DEBUG - Token Value:", token);
      console.log("DEBUG - User:", user);
      console.log("DEBUG - Role:", user?.role);
      
      const response = await api.get("/admin/pengaduan");
      console.log("DEBUG - Response:", response.data);
      setPengaduans(response.data.data);
    } catch (err) {
      console.error("Error fetching pengaduans:", err);
      console.error("Response error:", err.response?.data);
      console.error("Status:", err.response?.status);
      setError(err.response?.data?.error || "Gagal memuat data pengaduan");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id) => {
    if (!updateStatus) return;
    
    setSubmitting(true);
    try {
      await api.put(`/admin/pengaduan/${id}/status`, {
        status: updateStatus,
        catatan_admin: catatanAdmin,
      });
      
      // Refresh data
      fetchPengaduans();
      setSelectedPengaduan(null);
      setUpdateStatus("");
      setCatatanAdmin("");
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Gagal mengupdate status");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Manajemen Pengaduan</h1>
                  <p className="text-blue-100 text-sm">
                    Kelola dan proses pengaduan dari pegawai
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(STATUS_COLORS).map(([key, colors]) => {
                const count = pengaduans.filter((p) => p.status === key).length;
                return (
                  <div
                    key={key}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                  >
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {key === "pending" && <Clock className="w-3.5 h-3.5" />}
                      {key === "diproses" && <FileText className="w-3.5 h-3.5" />}
                      {key === "selesai" && <CheckCircle className="w-3.5 h-3.5" />}
                      {key === "ditolak" && <XCircle className="w-3.5 h-3.5" />}
                      {colors.label}
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Daftar Pengaduan
                </h2>
              </div>

              {pengaduans.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada pengaduan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Kejadian
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Anonim
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pengaduans.map((pengaduan) => (
                        <tr key={pengaduan.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            #{pengaduan.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {KATEGORI_LABELS[pengaduan.kategori] || pengaduan.kategori}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {pengaduan.lokasi}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(pengaduan.tanggal_kejadian)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                STATUS_COLORS[pengaduan.status]?.bg || "bg-gray-100"
                              } ${
                                STATUS_COLORS[pengaduan.status]?.text || "text-gray-700"
                              }`}
                            >
                              {STATUS_COLORS[pengaduan.status]?.label || pengaduan.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {pengaduan.anonim ? (
                              <span className="text-purple-600 font-medium">Ya</span>
                            ) : (
                              <span className="text-gray-500">Tidak</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedPengaduan(pengaduan)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                            >
                              <Eye className="w-4 h-4" />
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedPengaduan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Detail Pengaduan #{selectedPengaduan.id}
                </h3>
                <button
                  onClick={() => setSelectedPengaduan(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informasi Dasar */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Informasi Dasar
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Kategori</p>
                    <p className="text-sm font-medium text-gray-800">
                      {KATEGORI_LABELS[selectedPengaduan.kategori]}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedPengaduan.lokasi}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Tanggal Kejadian</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(selectedPengaduan.tanggal_kejadian)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Jam Kejadian</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedPengaduan.jam_kejadian || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inti Pengaduan */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Inti Pengaduan
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Nama Terlapor</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedPengaduan.nama_terlapor || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Jabatan Terlapor</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedPengaduan.jabatan_terlapor || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Deskripsi Kejadian</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedPengaduan.deskripsi_kejadian}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Tempat Kejadian</p>
                    <p className="text-sm text-gray-800">
                      {selectedPengaduan.tempat_kejadian}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Alasan Pelanggaran</p>
                    <p className="text-sm text-gray-800">
                      {selectedPengaduan.alasan_pelanggaran || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bukti Pendukung */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Bukti Pendukung
                </h4>
                {selectedPengaduan.files?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPengaduan.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada file terlampir</p>
                )}
              </div>

              {/* Saksi */}
              {selectedPengaduan.saksi && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Saksi
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800">{selectedPengaduan.saksi}</p>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Update Status
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Baru
                    </label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Pilih Status</option>
                      <option value="pending">Pending</option>
                      <option value="diproses">Diproses</option>
                      <option value="selesai">Selesai</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Admin
                    </label>
                    <textarea
                      value={catatanAdmin}
                      onChange={(e) => setCatatanAdmin(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Tambahkan catatan untuk pengaduan ini..."
                    />
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(selectedPengaduan.id)}
                    disabled={!updateStatus || submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? "Menyimpan..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
