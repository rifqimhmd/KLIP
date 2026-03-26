import MainLayout from "../layouts/MainLayout";
import Banner from "../components/Banner";
import Produk from "../components/Produk";
import PustakaDokumenDynamic from "../components/PustakaDokumenDynamic";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    document.title = "Patnal Integrity Hub - Konsultasi Aman, Respons Tepat";
  }, []);

  const token = localStorage.getItem("auth_token");
  if (token) {
    const role = localStorage.getItem("auth_user_role");
    const redirectPath = role === "Admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <MainLayout>
      <Banner />
      <Produk />
      <PustakaDokumenDynamic />
    </MainLayout>
  );
}
