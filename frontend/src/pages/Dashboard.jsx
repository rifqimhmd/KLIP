import MainLayout from "../layouts/MainLayout";
import { useEffect } from "react";

import Profil from "../components/Profil";
import KonsultasiProgress from "../components/KonsultasiProgress";
import WBSProgress from "../components/WBSProgress";

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
          <Profil initialUser={initialUser} />

          <div className="md:w-2/3 w-full flex flex-col gap-6">
            <KonsultasiProgress konsultasi={konsultasi} />
            <WBSProgress wbsProgress={wbsProgress} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
