import MainLayout from "../layouts/MainLayout";
import Banner from "../components/Banner";
import Produk from "../components/Produk";
import PustakaDokumen from "../components/PustakaDokumen";
import VideoEdukasi from "../components/VideoEdukasi";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Klinik Patnal - Konsultasi Mudah, Laporan Cepat";
  }, []);
  return (
    <MainLayout>
      <Banner />
      <Produk />
      <PustakaDokumen />
      <VideoEdukasi />
    </MainLayout>
  );
}
