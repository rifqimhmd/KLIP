import React, { useState } from "react";
import api from "../lib/axios";

export default function DocumentForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "peraturan",
    sub_category: "",
    cover: "",
    file: "",
    description: "",
    type: "pdf",
    video_url: "",
  });

  const categoryOptions = {
    peraturan: [
      { id: "uu-perppu", label: "UU / Perppu" },
      { id: "pp", label: "Peraturan Pemerintah (PP)" },
      { id: "perpres", label: "Peraturan Presiden (Perpres)" },
      { id: "permen", label: "Peraturan Menteri (Permen)" },
      { id: "peraturan-lainnya", label: "Peraturan Lainnya" },
    ],
    ebook: [
      { id: "sop", label: "Standar Operasional Prosedur (SOP)" },
      { id: "panduan", label: "Panduan & Petunjuk" },
      { id: "modul", label: "Modul Pembelajaran" },
      { id: "lainnya", label: "Lainnya" },
    ],
    edukasi: [
      { id: "video-training", label: "Video Training" },
      { id: "video-tutorial", label: "Video Tutorial" },
      { id: "webinar", label: "Webinar" },
      { id: "lainnya", label: "Lainnya" },
    ],
  };

  const typeOptions = [
    { value: "pdf", label: "PDF" },
    { value: "ebook", label: "E-Book" },
    { value: "video", label: "Video" },
    { value: "other", label: "Lainnya" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset sub_category jika category berubah
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        sub_category: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validasi form
      if (!formData.title.trim()) {
        setError("Judul dokumen harus diisi");
        setLoading(false);
        return;
      }

      if (!formData.sub_category) {
        setError("Kategori dokumen harus dipilih");
        setLoading(false);
        return;
      }

      if (formData.type === "pdf" && !formData.file) {
        setError("File PDF harus diupload");
        setLoading(false);
        return;
      }

      if (formData.type === "video" && !formData.video_url) {
        setError("URL Video harus diisi (contoh: https://www.youtube.com/embed/...)");
        setLoading(false);
        return;
      }

      await api.post("/documents", formData);

      setSuccess(true);
      setFormData({
        title: "",
        category: "peraturan",
        sub_category: "",
        cover: "",
        file: "",
        description: "",
        type: "pdf",
        video_url: "",
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error("Error uploading document:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengunggah dokumen. Pastikan semua data sudah benar."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-green-600 mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Dokumen Berhasil Diunggah!
        </h3>
        <p className="text-green-700">
          Dokumen Anda telah dikirim dan menunggu persetujuan admin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Tambah Dokumen Baru
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Judul Dokumen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Dokumen *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Masukkan judul dokumen"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Tipe Dokumen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipe Dokumen *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Utama *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="peraturan">Himpunan Peraturan</option>
            <option value="ebook">Standar Operasional Pelaksanaan</option>
            <option value="edukasi">Edukasi</option>
          </select>
        </div>

        {/* Sub Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub Kategori *
          </label>
          <select
            name="sub_category"
            value={formData.sub_category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- Pilih Sub Kategori --</option>
            {(categoryOptions[formData.category] || []).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Masukkan deskripsi dokumen (opsional)"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* File URL (untuk PDF atau e-book) */}
        {(formData.type === "pdf" || formData.type === "ebook") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL File {formData.type === "pdf" ? "PDF" : ""} *
            </label>
            <input
              type="url"
              name="file"
              value={formData.file}
              onChange={handleChange}
              placeholder="https://example.com/dokumen.pdf"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.type === "pdf" || formData.type === "ebook"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan link dari cloud storage seperti Google Drive, Dropbox, atau iCloud
            </p>
          </div>
        )}

        {/* Video URL (untuk video) */}
        {formData.type === "video" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Video Embed URL *
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/embed/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.type === "video"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan URL embed dari YouTube, bukan URL biasa
            </p>
          </div>
        )}

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Cover Image (opsional)
          </label>
          <input
            type="url"
            name="cover"
            value={formData.cover}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Gambar akan ditampilkan sebagai cover dokumen
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Dokumen yang Anda upload harus menunggu persetujuan admin sebelum dipublikasikan.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Mengunggah..." : "Unggah Dokumen"}
          </button>
        </div>
      </form>
    </div>
  );
}
