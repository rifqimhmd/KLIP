import MainLayout from "../layouts/MainLayout";
import Banner from "../components/Banner";
import Produk from "../components/Produk";
import Artikel from "../components/Artikel";
import VideoEdukasi from "../components/VideoEdukasi";

export default function Home() {
  return (
    <MainLayout>
      <Banner />
      <Produk />
      <Artikel />
      <VideoEdukasi />
    </MainLayout>
  );
}
