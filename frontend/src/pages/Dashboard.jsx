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
      <div className="w-full p-6 md:p-10 bg-gray-50 space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Dashboard Pengguna
        </h1>

        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* PROFIL PENGGUNA */}
          <div className="md:w-1/3 w-full p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Data Profil
            </h3>

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-36 h-36 md:w-44 md:h-44">
                <img
                  src={user.foto}
                  className="w-full h-full object-cover rounded-full ring-4 ring-blue-100 shadow"
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
                  onChange={handleFotoChange}
                />
              </div>

              <h4 className="text-lg font-semibold text-gray-800">
                {user.nama}
              </h4>
            </div>

            <div className="mt-6 space-y-4">
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
                  className="flex items-center justify-between pb-2 border-b border-gray-200"
                >
                  <div>
                    <span className="text-gray-500 text-xs">{item.label}</span>

                    {item.field === "status" ? (
                      <p
                        className={`font-medium mt-0.5 ${
                          user.status === "Aktif"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {user.status}
                      </p>
                    ) : editField[item.field] ? (
                      <input
                        type="text"
                        value={user[item.field]}
                        onChange={(e) =>
                          handleChange(item.field, e.target.value)
                        }
                        className="border px-2 py-1 w-full rounded mt-1 text-sm shadow-sm"
                      />
                    ) : (
                      <p className="text-gray-800 mt-0.5">{user[item.field]}</p>
                    )}
                  </div>

                  {item.field !== "status" && (
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
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>

          {/* KONSULTASI & WBS */}
          <div className="md:w-2/3 w-full flex flex-col gap-6">
            {/* Histori & Jadwal Konsultasi */}
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Histori & Jadwal Konsultasi
              </h3>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-gray-600">
                      <th className="px-4 py-2 text-left">Tanggal</th>
                      <th className="px-4 py-2 text-left">Topik</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {konsultasi.map((k, i) => (
                      <tr key={i} className="odd:bg-white even:bg-gray-50">
                        <td className="px-4 py-2">{k.tanggal}</td>
                        <td className="px-4 py-2">{k.topik}</td>
                        <td
                          className={`px-4 py-2 font-medium ${
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
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Progress WBS
              </h3>

              <ul className="space-y-3">
                {wbsProgress.map((w, i) => (
                  <li
                    key={i}
                    className="flex justify-between py-2 border-b border-gray-200"
                  >
                    <span className="font-medium text-gray-700">{w.nomor}</span>
                    <span
                      className={`font-semibold ${
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
