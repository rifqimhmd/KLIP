import MainLayout from "../layouts/MainLayout";
import FormWBS from "../components/FormWBS";
import { useEffect } from "react";

export default function WBS() {
  useEffect(() => {
    document.title = "Klinik Patnal - WBS";
  }, []);
  return (
    <MainLayout>
      <FormWBS />
    </MainLayout>
  );
}
