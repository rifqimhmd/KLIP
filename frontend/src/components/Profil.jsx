import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useToast } from "./Toast";

export default function Profil({ initialUser }) {
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const toast = useToast();
  const [user, setUser] = useState(initialUser);
  const [editField, setEditField] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const toggleEdit = (field) => {
    if (field === "status" || field === "status_pengguna") return;
    setEditField({ ...editField, [field]: !editField[field] });
  };

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = async () => {
    if (!currentPassword) {
      toast.warning('Masukkan password saat ini untuk menyimpan perubahan.');
      return;
    }
    try {
      setSaving(true);

      const payload = {
        current_password: currentPassword,
        name: user.nama,
        email: user.email,
        no_wa: user.no_wa,
        pangkat_golongan: user.pangkat,
        jabatan: user.jabatan,
        bagian: user.bagian,
        organization_detail: user.unit,
      };

      const response = await api.put("/profile/update", payload);
      const updatedUser = response?.data?.user;

      if (updatedUser) {
        setUser((prev) => ({
          ...prev,
          nama: updatedUser.name || prev.nama,
          email: updatedUser.email || prev.email,
          no_wa: updatedUser.no_wa || prev.no_wa,
          pangkat: updatedUser.pangkat_golongan || prev.pangkat,
          jabatan: updatedUser.jabatan || prev.jabatan,
          bagian: updatedUser.bagian || prev.bagian,
          unit: updatedUser.organization_detail || updatedUser.daftar_sebagai || prev.unit,
        }));
      }

      toast.success("Perubahan disimpan");
      setEditField({});
      setCurrentPassword('');
    } catch (error) {
      toast.error(
        error?.response?.data?.errors?.email?.[0] ||
        error?.response?.data?.errors?.no_wa?.[0] ||
        error?.response?.data?.errors?.current_password?.[0] ||
        error?.response?.data?.message ||
        "Gagal menyimpan perubahan"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("File harus berupa gambar (image).");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.warning("Ukuran foto maksimal 1MB.");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setUser({ ...user, foto: localPreviewUrl });

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("foto", file);
      formData.append("foto_position_x", String(user?.foto_position_x ?? 50));
      formData.append("foto_position_y", String(user?.foto_position_y ?? 50));
      const response = await api.post("/profile/update-foto", formData);
      setUser((prev) => ({
        ...prev,
        foto: response.data?.foto || localPreviewUrl,
        foto_position_x: Number(response.data?.foto_position_x ?? prev.foto_position_x ?? 50),
        foto_position_y: Number(response.data?.foto_position_y ?? prev.foto_position_y ?? 50),
      }));
      toast.success("Foto profil berhasil diperbarui");
    } catch (error) {
      toast.error(
        error?.response?.data?.errors?.foto?.[0] ||
          error?.response?.data?.message ||
          "Gagal upload foto"
      );
    } finally {
      setUploading(false);
    }
  };

  const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return "";
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    return `${apiBaseUrl}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
  };

  return (
    <div className="w-full p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Data Profil
      </h3>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36 md:w-44 md:h-44">
          <img
            src={resolvePhotoUrl(user.foto)}
            className="w-full h-full object-cover rounded-full ring-4 ring-blue-100 shadow"
            style={{ objectPosition: `${user?.foto_position_x ?? 50}% ${user?.foto_position_y ?? 50}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 rounded-full transition-opacity cursor-pointer">
            <label
              htmlFor="fotoUpload"
              className="text-white text-lg bg-blue-600 px-2 py-1 rounded shadow"
            >
              🖊
            </label>
          </div>
          <input
            type="file"
            id="fotoUpload"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFotoChange}
          />
        </div>

        <h4 className="text-lg font-semibold text-gray-800">{user.nama}</h4>
      </div>

      <div className="mt-6 space-y-4">
        {[
          { label: "NIP", field: "nip" },
          { label: "Nama", field: "nama" },
          { label: "No WhatsApp", field: "no_wa" },
          { label: "Pangkat/Golongan", field: "pangkat" },
          { label: "Jabatan", field: "jabatan" },
          { label: "Bagian", field: "bagian" },
          { label: "Unit Kerja", field: "unit" },
          { label: "Tipe Pengguna", field: "status_pengguna" },
          { label: "Email", field: "email" },
          { label: "Status", field: "status" },
        ].map((item) => (
          <div
            key={item.field}
            className="flex items-center justify-between pb-2 border-b border-gray-200"
          >
            <div>
              <span className="text-gray-500 text-xs">{item.label}</span>

              {item.field === "status" ? (
                <p
                  className={`font-medium mt-0.5 ${
                    user.status === "Aktif" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.status}
                </p>
              ) : item.field === "status_pengguna" ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-white text-sm ${
                    user.status_pengguna === "User" ? "bg-blue-500" :
                    user.status_pengguna === "Admin" ? "bg-red-500" :
                    user.status_pengguna === "Psikolog" ? "bg-green-500" :
                    "bg-gray-500"
                  }`}>
                    {user.status_pengguna}
                  </span>
                </div>
              ) : editField[item.field] ? (
                <input
                  type="text"
                  value={user[item.field]}
                  onChange={(e) => handleChange(item.field, e.target.value)}
                  className="border px-2 py-1 w-full rounded mt-1 text-sm shadow-sm"
                />
              ) : (
                <p className="text-gray-800 mt-0.5">{user[item.field]}</p>
              )}
            </div>

            {item.field !== "status" && item.field !== "status_pengguna" && (
              <button
                onClick={() => toggleEdit(item.field)}
                className="text-gray-400 hover:text-blue-600 transition"
              >
                🖉
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="mb-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Masukkan password saat ini untuk menyimpan"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Konfirmasi password diperlukan untuk menyimpan perubahan</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
