import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";

export default function Dashboard() {
  useEffect(() => {
    document.title = "Klinik Patnal - Dashboard";
  }, []);

  const initialUser = {
    foto: "/images/profile.jpg",
    nip: "123456789",
    nama: "Rifqi Muhammad",
    pangkat: "Penata / IIIC",
    jabatan: "Staf Pengawasan",
    bagian: "Klinik Patnal",
    unit: "Divisi Kepatuhan Internal",
    tipe: "Pegawai",
    email: "rifqi@example.com",
    status: "Aktif",
  };

  const [user, setUser] = useState(initialUser);
  const [editField, setEditField] = useState({});

  const toggleEdit = (field) => {
    if (field === "status") return;
    setEditField({ ...editField, [field]: !editField[field] });
  };

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = () => {
    alert("Perubahan disimpan (dummy)");
    setEditField({});
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fotoURL = URL.createObjectURL(file);
      setUser({ ...user, foto: fotoURL });
    }
  };

  const konsultasi = [
    { tanggal: "2025-11-01", topik: "Konsultasi Internal", status: "Selesai" },
    {
      tanggal: "2025-11-10",
      topik: "Laporan WBS",
      status: "Menunggu Tindak Lanjut",
    },
    {
      tanggal: "2025-11-15",
      topik: "Pertanyaan Kepatuhan",
      status: "Dijadwalkan",
    },
  ];

  const wbsProgress = [
    { nomor: "WBS-001", status: "Ditinjau" },
    { nomor: "WBS-002", status: "Ditindaklanjuti" },
    { nomor: "WBS-003", status: "Ditinjau" },
  ];

  return (
    <MainLayout>
      <div className="w-full p-6 md:p-10 bg-white space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Dashboard Pengguna
        </h1>

        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* PROFIL PENGGUNA */}
          <div className="md:w-1/3 w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Data Profil
            </h3>

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <img
                  src={user.foto}
                  className="w-full h-full object-cover border border-gray-300 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 cursor-pointer rounded-full transition-opacity">
                  <label
                    htmlFor="fotoUpload"
                    className="text-white text-xl bg-blue-600 px-2 py-1 rounded cursor-pointer"
                  >
                    🖊
                  </label>
                </div>
                <input
                  type="file"
                  id="fotoUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </div>

              <h4 className="text-lg font-semibold">{user.nama}</h4>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { label: "NIP", field: "nip" },
                { label: "Nama", field: "nama" },
                { label: "Pangkat/Golongan", field: "pangkat" },
                { label: "Jabatan", field: "jabatan" },
                { label: "Bagian", field: "bagian" },
                { label: "Unit Kerja", field: "unit" },
                { label: "Tipe", field: "tipe" },
                { label: "Email", field: "email" },
                { label: "Status", field: "status" },
              ].map((item) => (
                <div
                  key={item.field}
                  className="flex items-center justify-between py-2 border-b border-gray-200"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    {item.field === "status" ? (
                      <span
                        className={`${
                          user.status === "Aktif"
                            ? "text-green-600"
                            : "text-red-600"
                        } font-medium`}
                      >
                        {user.status}
                      </span>
                    ) : editField[item.field] ? (
                      <input
                        type="text"
                        value={user[item.field]}
                        onChange={(e) =>
                          handleChange(item.field, e.target.value)
                        }
                        className="border px-2 py-1 w-full rounded"
                      />
                    ) : (
                      <span>{user[item.field]}</span>
                    )}
                  </div>

                  {item.field !== "status" && (
                    <button
                      onClick={() => toggleEdit(item.field)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      🖉
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>

          {/* KONSULTASI & WBS */}
          <div className="md:w-2/3 w-full flex flex-col gap-6">
            {/* Histori & Jadwal Konsultasi */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Histori & Jadwal Konsultasi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                      <th className="px-3 py-2 text-left">Topik</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {konsultasi.map((k, i) => (
                      <tr
                        key={i}
                        className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                      >
                        <td className="px-3 py-2">{k.tanggal}</td>
                        <td className="px-3 py-2">{k.topik}</td>
                        <td
                          className={`px-3 py-2 font-medium ${
                            k.status === "Selesai"
                              ? "text-green-600"
                              : k.status === "Dijadwalkan"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {k.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress WBS */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Progress WBS</h3>
              <ul>
                {wbsProgress.map((w, i) => (
                  <li
                    key={i}
                    className="flex justify-between py-2 border-b border-gray-200"
                  >
                    <span>{w.nomor}</span>
                    <span
                      className={`font-medium ${
                        w.status === "Ditinjau"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {w.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
