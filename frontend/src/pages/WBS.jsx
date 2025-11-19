import MainLayout from "../layouts/MainLayout";
import FormWBS from "../components/FormWBS";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Klinik Patnal - Konsultasi Mudah, Laporan Cepat";
  }, []);
  return (
    <MainLayout>
      <FormWBS />
    </MainLayout>
  );
}
