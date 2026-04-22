import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileBarChart2,
  ClipboardList,
  Users,
  MessageSquare,
  BookOpen,
  Image,
  ImagePlay,
  ArrowLeft,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  Star,
  TrendingUp,
  LogOut,
  Plus,
  CheckCircle,
  Shield,
} from "lucide-react";
import api from "../services/api";
import Logo from "../components/Logo";

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const emptyUserForm = {
    name: "",
    nip: "",
    email: "",
    no_wa: "",
    instansi: "",
    pangkat_golongan: "",
    jabatan: "",
    daftar_sebagai: "User",
    organization_detail: "",
    password: "",
    password_confirmation: "",
  };

  const [view, setView] = useState("menu");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [users, setUsers] = useState([]);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docForm, setDocForm] = useState({ title: "", category: "", sub_category: "", type: "pdf", url: "" });
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docError, setDocError] = useState("");
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [docUploadFile, setDocUploadFile] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docFormOpen, setDocFormOpen] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", order: 0, is_active: true });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [siteImages, setSiteImages] = useState({ konsultasi_image: null, produk_image: null });
  const [siteImageUploading, setSiteImageUploading] = useState({});
  const [siteImageError, setSiteImageError] = useState("");
  const [produkImages, setProdukImages] = useState({ produk_image_1: null, produk_image_2: null, produk_image_3: null, produk_image_4: null });
  const [produkImageUploading, setProdukImageUploading] = useState({});
  const [produkImageError, setProdukImageError] = useState("");
  const [produkImageFiles, setProdukImageFiles] = useState({});
  const [kasubditPhotos, setKasubditPhotos] = useState({});
  const [kasubditPhotoUploading, setKasubditPhotoUploading] = useState({});
  const [kasubditPhotoError, setKasubditPhotoError] = useState("");
  const [logos, setLogos] = useState({
    login_logo_kemenkumham: null,
    login_logo_ditjen: null,
    home_logo: null
  });
  const [logoUploading, setLogoUploading] = useState({});
  const [logoError, setLogoError] = useState("");
  const [psychologistPhotos, setPsychologistPhotos] = useState({});
  const [psychologistPhotoUploading, setPsychologistPhotoUploading] = useState({});
  const [psychologistPhotoError, setPsychologistPhotoError] = useState("");

  useEffect(() => {
    document.title = "Dashboard - KLIP";
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    checkAdmin();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleViewChange = (newView) => {
    if (isTransitioning || newView === view) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 100);
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin logout?")) return;
    
    try {
      await api.post("/logout");
    } catch (err) {
      void err;
    } finally {
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/user");
      const userData = response?.data?.user || response?.data;
      
      if (!userData) {
        navigate("/login");
        return;
      }

      // Check admin role using consistent logic with login
      const role = userData?.status_pengguna || userData?.daftar_sebagai;
      const normalizedRole = role ? (role.toLowerCase() === 'admin' ? 'Admin' : 'User') : 'User';
      
      if (normalizedRole !== 'Admin') {
        navigate("/dashboard");
        return;
      }

      setRegisteredName(userData.name || "Admin");
      fetchAdminData();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/login");
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await api.get("/admin/banners");
      setBanners(res.data?.banners || []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setBannerError("Gagal memuat data banner.");
    }
  };

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const [usersRes, consultationsRes, documentsRes, bannersRes, siteImagesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/consultations"),
        api.get("/admin/documents"),
        api.get("/admin/banners"),
        api.get("/site-settings")
      ]);

      setUsers(usersRes.data?.users || []);
      setConsultations(consultationsRes.data?.consultations || []);
      setDocuments(documentsRes.data?.documents || []);
      setBanners(bannersRes.data?.banners || []);
      
      const siteData = siteImagesRes.data || {};
      setSiteImages({
        konsultasi_image: siteData.konsultasi_image || null,
        produk_image: siteData.produk_image || null
      });
      
      setLogos({
        login_logo_kemenkumham: siteData.login_logo_kemenkumham || null,
        login_logo_ditjen: siteData.login_logo_ditjen || null,
        home_logo: siteData.home_logo || null
      });
      
      setProdukImages({
        produk_image_1: siteData.produk_image_1 || null,
        produk_image_2: siteData.produk_image_2 || null,
        produk_image_3: siteData.produk_image_3 || null,
        produk_image_4: siteData.produk_image_4 || null
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserSubmitting(true);
    setUserError("");

    try {
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, userForm);
      } else {
        await api.post("/admin/users", userForm);
      }
      
      await fetchAdminData();
      resetUserForm();
      setUserFormOpen(false);
      setEditingUserId(null);
    } catch (error) {
      setUserError(error.response?.data?.message || "Gagal menyimpan user");
    } finally {
      setUserSubmitting(false);
    }
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
    setUserError("");
  };

  const openEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      nip: user.nip || "",
      email: user.email,
      no_wa: user.no_wa || "",
      instansi: user.instansi || "",
      pangkat_golongan: user.pangkat_golongan || "",
      jabatan: user.jabatan || "",
      daftar_sebagai: user.daftar_sebagai || "User",
      organization_detail: user.organization_detail || "",
      password: "",
      password_confirmation: "",
    });
    setUserFormOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchAdminData();
    } catch (error) {
      alert("Gagal menghapus user");
    }
  };

  const handleApproveUser = async (userId) => {
    if (!confirm("Yakin ingin approve user ini?")) return;
    
    try {
      await api.post(`/admin/users/${userId}/approve`);
      await fetchAdminData();
      alert("User berhasil diapprove!");
    } catch (error) {
      alert("Gagal approve user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRejectUser = async (userId) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;
    
    try {
      await api.post(`/admin/users/${userId}/reject`, { rejection_reason: reason });
      await fetchAdminData();
      alert("User berhasil direject!");
    } catch (error) {
      alert("Gagal reject user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDocFormChange = (e) => {
    const { name, value } = e.target;
    setDocForm(prev => {
      const newForm = { ...prev, [name]: value };
      if (name === "category") {
        newForm.sub_category = "";
      }
      return newForm;
    });
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    setDocSubmitting(true);
    setDocError("");

    if ((docForm.type === "pdf" || docForm.type === "ebook" || docForm.type === "other") && !docUploadFile && !editingDocId) {
      setDocError("Mohon unggah file dokumen terlebih dahulu.");
      setDocSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      if (docForm.type === "video") {
        let finalUrl = docForm.url;
        if (finalUrl && finalUrl.includes("youtube.com/watch?v=")) {
          try {
            const videoId = new URL(finalUrl).searchParams.get("v");
            if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
          } catch (e) {}
        } else if (finalUrl && finalUrl.includes("youtu.be/")) {
          const videoId = finalUrl.split("youtu.be/")[1]?.split("?")[0];
          if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        formData.append("video_url", finalUrl);
      } else {
        if (docUploadFile) {
          formData.append("file", docUploadFile);
          formData.append("file_type", "upload");
        } else if (docForm.url) {
          formData.append("file", docForm.url);
          formData.append("file_type", "url");
        } else {
          formData.append("file", "");
        }
      }
      formData.append("title", docForm.title);
      formData.append("category", docForm.category);
      formData.append("sub_category", docForm.sub_category);
      formData.append("type", docForm.type);

      if (editingDocId) {
        await api.post(`/admin/documents/${editingDocId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      
      await fetchAdminData();
      resetDocForm();
      setDocFormOpen(false);
      setEditingDocId(null);
    } catch (error) {
      setDocError(error.response?.data?.message || "Gagal menyimpan dokumen");
    } finally {
      setDocSubmitting(false);
    }
  };

  const resetDocForm = () => {
    setDocForm({ title: "", category: "", sub_category: "", type: "pdf", url: "" });
    setDocUploadFile(null);
    setDocError("");
  };

  const openEditDoc = (doc) => {
    setDocForm({
      title: doc.title || "",
      category: doc.category || "",
      sub_category: doc.sub_category || "",
      type: doc.type || "pdf",
      url: doc.url || ""
    });
    setEditingDocId(doc.id);
    setDocFormOpen(true);
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    
    try {
      await api.delete(`/admin/documents/${docId}`);
      await fetchAdminData();
    } catch (error) {
      alert("Gagal menghapus dokumen");
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setBannerSubmitting(true);
    setBannerError("");

    try {
      const formData = new FormData();
      formData.append("title", bannerForm.title);
      formData.append("subtitle", bannerForm.subtitle);
      formData.append("order", bannerForm.order);
      formData.append("is_active", bannerForm.is_active);
      if (bannerFile) {
        formData.append("image", bannerFile);
      }

      if (editingBannerId) {
        await api.post(`/admin/banners/${editingBannerId}`, formData);
      } else {
        await api.post("/admin/banners", formData);
      }
      
      await fetchAdminData();
      resetBannerForm();
      setBannerFormOpen(false);
      setEditingBannerId(null);
    } catch (error) {
      setBannerError(error.response?.data?.message || "Gagal menyimpan banner");
    } finally {
      setBannerSubmitting(false);
    }
  };

  const resetBannerForm = () => {
    setBannerForm({ title: "", subtitle: "", order: 0, is_active: true });
    setBannerFile(null);
    setBannerError("");
  };

  const openEditBanner = (banner) => {
    setBannerForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      order: banner.order || 0,
      is_active: banner.is_active !== undefined ? banner.is_active : true
    });
    setEditingBannerId(banner.id);
    setBannerFormOpen(true);
  };

  const handleSiteImageUpload = async (key, file) => {
    if (!file) return;
    setSiteImageUploading((prev) => ({ ...prev, [key]: true }));
    setSiteImageError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post(`/admin/site-settings/${key}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSiteImages((prev) => ({ ...prev, [key]: res.data?.data?.url }));
    } catch (err) {
      setSiteImageError(err.response?.data?.message || err.response?.data?.error || "Gagal mengupload gambar.");
    } finally {
      setSiteImageUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleProdukImageFileChange = (key, file) => {
    setProdukImageFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleProdukImageUpload = async () => {
    const fd = new FormData();
    
    console.log('Files to upload:', produkImageFiles);
    
    Object.entries(produkImageFiles).forEach(([key, file]) => {
      if (file) {
        fd.append(key, file);
        console.log(`Appending ${key}:`, file.name, file.size, file.type);
      }
    });

    // Check if any files were added
    const hasFiles = Object.values(produkImageFiles).some(file => file !== null);
    if (!hasFiles) {
      setProdukImageError("Pilih setidaknya satu gambar untuk diupload.");
      return;
    }

    setProdukImageUploading({ all: true });
    setProdukImageError("");
    
    try {
      console.log('Sending request to /admin/produk-images');
      
      const res = await api.post("/admin/produk-images", fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      console.log('Upload response:', res.data);
      
      setProdukImages(prev => ({ ...prev, ...res.data.updated_images }));
      setProdukImageFiles({});
      setProdukImageError("");
      alert("Gambar produk berhasil diperbarui!");
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.response?.data?.errors?.file?.[0] ||
                        "Gagal mengupload gambar produk.";
      
      setProdukImageError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setProdukImageUploading({ all: false });
    }
  };

  // Handle Kasubdit Photo Upload
  const handleKasubditPhotoFileChange = (id, file) => {
    setKasubditPhotos(prev => ({ ...prev, [id]: file }));
  };

  const handleKasubditPhotoUpload = async (id) => {
    const file = kasubditPhotos[id];
    if (!file) {
      alert('Pilih foto terlebih dahulu');
      return;
    }

    setKasubditPhotoUploading(prev => ({ ...prev, [id]: true }));
    setKasubditPhotoError("");

    try {
      const fd = new FormData();
      fd.append('photo', file);

      const res = await api.post(`/kasubdit/${id}/upload-photo`, fd);

      alert('Foto berhasil diupload!');
      setKasubditPhotos(prev => ({ ...prev, [id]: null }));
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        "Gagal mengupload foto.";
      setKasubditPhotoError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setKasubditPhotoUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle Psychologist Photo Upload
  const handlePsychologistPhotoFileChange = (id, file) => {
    setPsychologistPhotos(prev => ({ ...prev, [id]: file }));
  };

  const handlePsychologistPhotoUpload = async (id) => {
    const file = psychologistPhotos[id];
    if (!file) {
      alert('Pilih foto terlebih dahulu');
      return;
    }

    setPsychologistPhotoUploading(prev => ({ ...prev, [id]: true }));
    setPsychologistPhotoError("");

    try {
      const fd = new FormData();
      fd.append('foto', file);

      await api.post(`/admin/users/${id}/update-foto`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Foto psikolog berhasil diupload!');
      setPsychologistPhotos(prev => ({ ...prev, [id]: null }));
      fetchAdminData(); // Refresh user list to get updated photo URLs
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        "Gagal mengupload foto.";
      setPsychologistPhotoError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setPsychologistPhotoUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle Banner Upload
  const handleBannerUpload = async (order, file) => {
    if (!file) return;
    setBannerSubmitting(true);
    setBannerError("");

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("order", order);

      const res = await api.post("/admin/banners", fd);

      alert(`Banner ${order} berhasil diupload!`);
      fetchBanners();
    } catch (err) {
      console.error("Banner upload error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal mengupload banner.";
      setBannerError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setBannerSubmitting(false);
    }
  };

  // Handle Toggle Banner Active
  const handleToggleBannerActive = async (id, isActive) => {
    try {
      await api.put(`/admin/banners/${id}`, { is_active: isActive });
      fetchBanners();
      alert(`Banner ${isActive ? "diaktifkan" : "dinonaktifkan"}!`);
    } catch (err) {
      console.error("Toggle banner error:", err);
      alert("Gagal mengubah status banner.");
    }
  };

  // Handle Delete Banner
  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      return;
    }

    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
      alert("Banner berhasil dihapus!");
    } catch (err) {
      console.error("Delete banner error:", err);
      alert("Gagal menghapus banner.");
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (logoKey, file) => {
    if (!file) return;
    
    setLogoUploading({ ...logoUploading, [logoKey]: true });
    setLogoError("");

    try {
      const fd = new FormData();
      fd.append(logoKey, file);

      const res = await api.post("/admin/logos", fd);
      
      alert("Logo berhasil diupload!");
      fetchAdminData();
    } catch (err) {
      console.error("Logo upload error:", err);
      const errorMessage = err.response?.data?.message || "Gagal mengupload logo.";
      setLogoError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLogoUploading({ ...logoUploading, [logoKey]: false });
    }
  };

  const kasubditPersons = [
    { id: 1, name: 'LILIK SUJANDI, Bc.IP., S.IP., M.Si', position: 'Direktur Kepatuhan Internal' },
    { id: 2, name: 'ERIES SUGIANTO, A.Md.IP., S.H., M.Si.', position: 'Subdirektorat Pencegahan dan Pengendalian' },
    { id: 3, name: 'RIKO PURNAMA CANDRA, A.Md.IP., S.H', position: 'Subdirektorat Fasilitasi Advokasi dan Investigasi Internal' },
    { id: 4, name: 'ERWAN PRASETYO, A.Md.IP., S.H., M.H.', position: 'Ketua Kelompok Kerja Edukasi Pencegahan Korupsi dan Pengendalian Gratifikasi' },
    { id: 5, name: 'IDAM WAHJU KUNTJORO, A.Md.IP, SH, MH', position: 'Ketua Kelompok Kerja Pemantauan Kinerja dan Zona Integritas' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white shadow-lg h-screen sticky top-0 border-r border-gray-200 z-10">
          <div className="p-6">
            <button 
              onClick={() => handleViewChange("menu")}
              className="flex flex-col items-start gap-2 mb-8 text-left hover:opacity-80 transition-opacity w-full outline-none overflow-hidden"
            >
              <Logo className="h-10 max-w-full" alt="Logo Patnal" />
              <div className="w-full">
                <h1 className="font-bold text-gray-800 text-sm truncate">Admin Panel</h1>
              </div>
            </button>
            <nav className="pb-2">
              <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-blue-700 bg-blue-50 font-semibold border-l-4 border-blue-600 text-sm">
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                Dashboard
              </a>
              <a href="/admin/reports" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <FileBarChart2 className="w-4 h-4 flex-shrink-0" />
                Laporan
              </a>
              <a href="/admin/survey" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <Star className="w-4 h-4 flex-shrink-0" />
                Survey Kepuasan
              </a>
              <a href="/admin/pengaduan" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <Shield className="w-4 h-4 flex-shrink-0" />
                Pengaduan
              </a>
              <div className="mx-4 my-2 border-t border-gray-100" />
              <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                Dashboard Pengguna
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-6 md:p-8 space-y-6">
          {/* Welcome + Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-5 text-white shadow-lg flex-1">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 right-10 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-blue-100">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Halo, {registeredName}! </h2>
                <p className="text-blue-100 text-xs mt-1">Pusat data master dan monitoring operasional admin.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAdminData}
                disabled={dataLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm text-sm font-medium transition"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
                {dataLoading ? "Memuat..." : "Refresh"}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-sm text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {view === "menu" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Monitoring Konsultasi */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("consultation"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                  <ClipboardList className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Monitoring Konsultasi</p>
                <p className="text-xs text-gray-500 mb-3">Lihat semua sesi konsultasi yang aktif.</p>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Total: {consultations.length} sesi</span>
              </button>

              {/* Manajemen User */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("users"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:bg-green-600 transition-colors">
                  <Users className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Manajemen User</p>
                <p className="text-xs text-gray-500 mb-3">Tambah, edit, dan hapus user.</p>
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Total: {users.length} user</span>
              </button>

              {/* Manajemen Dokumen */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("documents"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-600 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Manajemen Dokumen</p>
                <p className="text-xs text-gray-500 mb-3">Upload dan kelola dokumen PDF.</p>
                <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">Total: {documents.length} dokumen</span>
              </button>

              {/* Survey Kepuasan */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("survey"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                  <Star className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Survey Kepuasan</p>
                <p className="text-xs text-gray-500 mb-3">Lihat hasil dan analisis survey kepuasan pengguna.</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Analytics</span>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Export</span>
                </div>
              </button>

              
              {/* Gambar Produk */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("produk_images"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors">
                  <Image className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Gambar Produk</p>
                <p className="text-xs text-gray-500 mb-3">Upload 4 gambar produk layanan.</p>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">4 Slot</span>
              </button>

              {/* Kelola Foto Psikolog */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("psychologist_photos"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
                  <Plus className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Foto Psikolog</p>
                <p className="text-xs text-gray-500 mb-3">Upload foto profil tim psikolog.</p>
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {users.filter(u => (u.status_pengguna || u.daftar_sebagai) === 'Psikolog').length} Psikolog
                </span>
              </button>

              {/* Kelola Banner */}
              <button
                onClick={() => { fetchBanners(); handleViewChange("banners"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:bg-pink-600 transition-colors">
                  <Image className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Kelola Gambar Banner</p>
                <p className="text-xs text-gray-500 mb-2">Upload dan atur 4 banner pada halaman Beranda.</p>
                <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full font-medium">4 Banners</span>
              </button>

              {/* Kelola Logo */}
              <button
                onClick={() => { fetchAdminData(); handleViewChange("logos"); }}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
                  <span className="text-lg">🏛️</span>
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Kelola Logo</p>
                <p className="text-xs text-gray-500 mb-2">Upload logo untuk halaman login dan beranda.</p>
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">3 Logos</span>
              </button>

              {/* Upload Foto Kasubdit */}
              <button
                onClick={() => handleViewChange("kasubdit_photos")}
                className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200 p-5 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-50 rounded-bl-full opacity-70" />
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center mb-3 group-hover:bg-cyan-600 transition-colors">
                  <Users className="w-5 h-5 text-cyan-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">Upload Foto Kasubdit</p>
                <p className="text-xs text-gray-500">Upload foto untuk 5 pimpinan Direktorat Kepatuhan Internal.</p>
                <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full font-medium">5 Photos</span>
              </button>
            </div>
          )}

          {/* VIEWS */}
          {view === "consultation" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  Monitoring Konsultasi
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              {consultations.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Belum ada data konsultasi untuk ditampilkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.slice(0, 20).map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.user?.name || "Anonymous"}</p>
                          <p className="text-sm text-gray-500">{item.created_at}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : item.status === "ended"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "users" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Manajemen User
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { resetUserForm(); setUserFormOpen(true); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    + Tambah User
                  </button>
                  <button
                    onClick={() => handleViewChange("pending_users")}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                  >
                    Pending Users
                  </button>
                  <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Belum ada user terdaftar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                          <td className="px-4 py-3 text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              user.status_approval === "approved" 
                                ? "bg-green-100 text-green-700" 
                                : user.status_approval === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {user.status_approval || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {user.status_approval === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApproveUser(user.id)}
                                    className="px-3 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectUser(user.id)}
                                    className="px-3 py-1 text-xs rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => openEditUser(user)}
                                className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* User Form Modal */}
              {userFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingUserId ? "Edit User" : "Tambah User Baru"}
                      </h3>
                    </div>

                    <form id="user-form" onSubmit={handleUserSubmit} className="px-6 py-4 space-y-4">
                      {/* Basic Info */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informasi Dasar</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="name"
                              value={userForm.name}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIP <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="nip"
                              value={userForm.nip}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            name="email"
                            value={userForm.email}
                            onChange={handleUserFormChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                          <input
                            type="text"
                            name="no_wa"
                            value={userForm.no_wa}
                            onChange={handleUserFormChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instansi <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="instansi"
                            value={userForm.instansi || ""}
                            onChange={handleUserFormChange}
                            required
                            placeholder="Masukkan instansi"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Organization */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Organisasi</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai <span className="text-red-500">*</span></label>
                            <select
                              name="daftar_sebagai"
                              value={userForm.daftar_sebagai}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="User">User</option>
                              <option value="Psikolog">Psikolog</option>
                              <option value="Admin">Admin</option>
                              <option value="Kanwil">Kanwil</option>
                              <option value="UPT">UPT</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                            <select
                              name="role"
                              value={userForm.role}
                              onChange={handleUserFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="user">User</option>
                              <option value="psikolog">Psikolog</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Password {editingUserId && <span className="text-gray-400 normal-case font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password {!editingUserId && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={userForm.password}
                              onChange={handleUserFormChange}
                              placeholder="Minimal 8 karakter"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                            <input
                              type="password"
                              name="password_confirmation"
                              value={userForm.password_confirmation}
                              onChange={handleUserFormChange}
                              placeholder="Ulangi password"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </form>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                      <button
                        type="button"
                        onClick={() => { setUserFormOpen(false); resetUserForm(); }}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        form="user-form"
                        disabled={userSubmitting}
                        className={`px-5 py-2 rounded-lg text-sm text-white font-medium transition-all disabled:opacity-50 ${
                          editingUserId ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
                        }`}
                      >
                        {userSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Menyimpan...
                          </span>
                        ) : (
                          editingUserId ? "Simpan Perubahan" : "Buat Akun"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "pending_users" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  User Pending Approval
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleViewChange("users")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Semua User
                  </button>
                </div>
              </div>

              {users.filter(u => u.status_approval === "pending").length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Tidak ada user yang menunggu approval.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">NIP</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Daftar Sebagai</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Tanggal Daftar</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.status_approval === "pending").map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                          <td className="px-4 py-3 text-gray-600">{user.email}</td>
                          <td className="px-4 py-3 text-gray-600">{user.nip}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                              {user.daftar_sebagai}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="px-3 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(user.id)}
                                className="px-3 py-1 text-xs rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === "documents" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  Manajemen Dokumen
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { resetDocForm(); setDocFormOpen(true); }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                  >
                    + Tambah Dokumen
                  </button>
                  <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari dokumen..."
                  value={docSearchTerm}
                  onChange={(e) => setDocSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {documents.filter((d) =>
                d.title?.toLowerCase().includes(docSearchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  Belum ada dokumen
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Judul</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Kategori</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Sub Kategori</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Tipe</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents
                        .filter((d) =>
                          d.title?.toLowerCase().includes(docSearchTerm.toLowerCase())
                        )
                        .map((doc) => {
                          // Ekstrak YouTube video ID dari embed URL atau watch URL
                          const getYtId = (url) => {
                            if (!url) return null;
                            const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
                            if (embedMatch) return embedMatch[1];
                            try {
                              const u = new URL(url);
                              return u.searchParams.get('v') || u.pathname.split('/').pop();
                            } catch { return null; }
                          };
                          const ytId = doc.type === 'video' ? getYtId(doc.video_url || doc.url) : null;
                          return (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {ytId ? (
                                  <div className="relative flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-gray-100 group">
                                    <img
                                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                      alt={doc.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition">
                                      <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                  </div>
                                ) : null}
                                <span className="font-medium text-gray-800 max-w-xs truncate">{doc.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{doc.category}</td>
                            <td className="px-4 py-3 text-gray-600">{doc.sub_category}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                doc.type === "video"
                                  ? "bg-blue-100 text-blue-700"
                                  : doc.type === "pdf"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {doc.type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditDoc(doc)}
                                  className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Document Form Modal */}
              {docFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingDocId ? "Edit Dokumen" : "Tambah Dokumen Baru"}
                      </h3>
                    </div>

                    <form id="doc-form" onSubmit={handleDocSubmit} className="px-6 py-4 space-y-4">
                      {/* Type Selection */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tipe Dokumen</p>
                        <div className="grid grid-cols-3 gap-3">
                          {["pdf", "video", "ebook", "other"].map((type) => (
                            <label key={type} className="flex items-center">
                              <input
                                type="radio"
                                name="type"
                                value={type}
                                checked={docForm.type === type}
                                onChange={handleDocFormChange}
                                className="mr-2"
                              />
                              <span className="text-sm capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Category Selection */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kategori</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Utama <span className="text-red-500">*</span></label>
                            <select
                              name="category"
                              value={docForm.category}
                              onChange={handleDocFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">-- Pilih Kategori --</option>
                              <option value="peraturan">Himpunan Peraturan</option>
                              <option value="ebook">Standar Operasional</option>
                              <option value="edukasi">Edukasi</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Kategori <span className="text-red-500">*</span></label>
                            <select
                              name="sub_category"
                              value={docForm.sub_category}
                              onChange={handleDocFormChange}
                              required
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">-- Pilih Sub Kategori --</option>
                              {(categoryOptions[docForm.category] || []).map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Content */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Konten</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="title"
                              value={docForm.title}
                              onChange={handleDocFormChange}
                              placeholder="Masukkan judul dokumen..."
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              required
                            />
                          </div>

                          {(docForm.type === "pdf" || docForm.type === "ebook" || docForm.type === "other") && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Dokumen <span className="text-red-500">*</span>
                              </label>
                              <div className="space-y-2">
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-orange-400 transition-colors"
                                  onClick={() => document.getElementById("doc-file-input").click()}
                                >
                                  {docUploadFile ? (
                                    <div className="text-green-600 font-medium">{docUploadFile.name}</div>
                                  ) : (
                                    <div className="text-gray-500">
                                      <div className="text-2xl mb-1">+</div>
                                      <div className="text-sm">Klik untuk upload file</div>
                                    </div>
                                  )}
                                </div>
                                <input
                                  id="doc-file-input"
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => setDocUploadFile(e.target.files[0])}
                                  className="hidden"
                                />
                              </div>
                            </div>
                          )}

                          {docForm.type === "video" && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Video <span className="text-red-500">*</span></label>
                                <input
                                  type="url"
                                  name="url"
                                  value={docForm.url}
                                  onChange={handleDocFormChange}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  required
                                />
                              </div>
                              {/* Preview thumbnail YouTube secara real-time */}
                              {(() => {
                                const url = docForm.url || "";
                                let ytId = null;
                                const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
                                if (embedMatch) ytId = embedMatch[1];
                                else {
                                  try {
                                    const u = new URL(url);
                                    ytId = u.searchParams.get('v') || (url.includes('youtu.be') ? u.pathname.split('/').pop() : null);
                                  } catch { /* invalid url */ }
                                }
                                if (!ytId) return null;
                                return (
                                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                    <div className="relative w-full" style={{paddingBottom: '56.25%'}}>
                                      <img
                                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25">
                                        <div className="bg-red-600 rounded-full p-3 shadow-lg">
                                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-3 py-2">
                                      <p className="text-xs text-gray-500 truncate">youtube.com/watch?v={ytId}</p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </form>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                      <button
                        type="button"
                        onClick={() => { setDocFormOpen(false); resetDocForm(); }}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        form="doc-form"
                        disabled={docSubmitting}
                        className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {docSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Menyimpan...
                          </>
                        ) : (
                          editingDocId ? "Simpan Perubahan" : "Tambah Dokumen"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "banners" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Image className="w-5 h-5 text-pink-600" />
                  Kelola Gambar Banner (4 Banner)
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <p className="text-gray-600 mb-6">Upload dan atur 4 banner untuk ditampilkan di halaman Beranda. Setiap banner memiliki gambar, judul, dan subtitle.</p>

              {bannerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{bannerError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((bannerNum) => {
                  const banner = banners.find(b => b.order === bannerNum);
                  return (
                    <div key={bannerNum} className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-5 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Banner {bannerNum}</h3>
                        {banner?.is_active && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Banner Preview */}
                        <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 bg-white">
                          {banner?.image_url ? (
                            <img
                              src={banner.image_url}
                              alt={`Banner ${bannerNum}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
                              <Image className="w-10 h-10 mb-2" />
                              <p className="text-xs">Belum ada gambar</p>
                            </div>
                          )}
                        </div>

                        {/* Banner Info */}
                        {banner && (
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-gray-800 truncate">{banner.title || "Tidak ada judul"}</p>
                            <p className="text-gray-500 text-xs truncate">{banner.subtitle || "Tidak ada subtitle"}</p>
                          </div>
                        )}

                        {/* Upload Button */}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBannerUpload(bannerNum, e.target.files[0])}
                            className="hidden"
                            id={`banner-input-${bannerNum}`}
                          />
                          <button
                            onClick={() => document.getElementById(`banner-input-${bannerNum}`).click()}
                            disabled={bannerSubmitting}
                            className="w-full px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:bg-gray-400 text-sm font-medium"
                          >
                            {bannerSubmitting ? "Mengupload..." : (banner ? "Ganti Gambar" : "Upload Gambar")}
                          </button>
                        </div>

                        {/* Toggle Active */}
                        {banner && (
                          <button
                            onClick={() => handleToggleBannerActive(banner.id, !banner.is_active)}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${
                              banner.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {banner.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        )}

                        {/* Delete Button */}
                        {banner && (
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                          >
                            Hapus Banner
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Note */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Tips:</strong> Ukuran gambar banner yang disarankan adalah <strong>1600x800 pixels</strong> (ratio 2:1) untuk tampilan terbaik di berbagai perangkat.
                </p>
              </div>
            </div>
          )}

          {view === "logos" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  Kelola Logo
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              {logoError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
                  {logoError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Login Logo Kemenkumham */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Logo Login Kemenkumham</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Halaman Login</span>
                  </div>
                  
                  <div className="mb-4">
                    {logos.login_logo_kemenkumham ? (
                      <img 
                        src={logos.login_logo_kemenkumham} 
                        alt="Logo Kemenkumham"
                        className="w-full h-20 object-contain rounded-lg border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-gray-400 text-sm">Belum ada logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="file"
                      id="logo-kemenkumham-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload('login_logo_kemenkumham', e.target.files[0])}
                    />
                    <button
                      onClick={() => document.getElementById('logo-kemenkumham-input').click()}
                      disabled={logoUploading['login_logo_kemenkumham']}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 text-sm font-medium"
                    >
                      {logoUploading['login_logo_kemenkumham'] ? "Mengupload..." : (logos.login_logo_kemenkumham ? "Ganti Logo" : "Upload Logo")}
                    </button>
                  </div>
                </div>

                {/* Login Logo Ditjen */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Logo Login Ditjen</h3>
                    <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">Halaman Login</span>
                  </div>
                  
                  <div className="mb-4">
                    {logos.login_logo_ditjen ? (
                      <img 
                        src={logos.login_logo_ditjen} 
                        alt="Logo Ditjen"
                        className="w-full h-20 object-contain rounded-lg border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-gray-400 text-sm">Belum ada logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="file"
                      id="logo-ditjen-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload('login_logo_ditjen', e.target.files[0])}
                    />
                    <button
                      onClick={() => document.getElementById('logo-ditjen-input').click()}
                      disabled={logoUploading['login_logo_ditjen']}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 text-sm font-medium"
                    >
                      {logoUploading['login_logo_ditjen'] ? "Mengupload..." : (logos.login_logo_ditjen ? "Ganti Logo" : "Upload Logo")}
                    </button>
                  </div>
                </div>

                {/* Home Logo */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Logo Halaman Awal</h3>
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Beranda</span>
                  </div>
                  
                  <div className="mb-4">
                    {logos.home_logo ? (
                      <img 
                        src={logos.home_logo} 
                        alt="Logo Beranda"
                        className="w-full h-20 object-contain rounded-lg border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-gray-400 text-sm">Belum ada logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="file"
                      id="logo-home-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload('home_logo', e.target.files[0])}
                    />
                    <button
                      onClick={() => document.getElementById('logo-home-input').click()}
                      disabled={logoUploading['home_logo']}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 text-sm font-medium"
                    >
                      {logoUploading['home_logo'] ? "Mengupload..." : (logos.home_logo ? "Ganti Logo" : "Upload Logo")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Tips:</strong> Ukuran logo yang disarankan adalah <strong>200x200 pixels</strong> atau <strong>400x400 pixels</strong> untuk tampilan terbaik.
                </p>
              </div>
            </div>
          )}

          {view === "produk_images" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Image className="w-5 h-5 text-indigo-600" />
                  Kelola Gambar Produk
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Images Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Gambar Produk Saat Ini</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          {produkImages[`produk_image_${num}`] ? (
                            <img
                              src={`http://localhost:8000/${produkImages[`produk_image_${num}`]}`}
                              alt={`Produk Image ${num}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-sm font-medium text-gray-700">Produk {num}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Gambar Produk Baru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Produk {num}
                        </label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                          onClick={() => document.getElementById(`produk-image-${num}`).click()}
                        >
                          {produkImageFiles[`produk_image_${num}`] ? (
                            <div className="space-y-2">
                              <div className="text-green-600 font-medium">
                                {produkImageFiles[`produk_image_${num}`].name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(produkImageFiles[`produk_image_${num}`].size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Image className="w-8 h-8 mx-auto text-gray-400" />
                              <div className="text-sm text-gray-600">Klik untuk upload</div>
                              <div className="text-xs text-gray-500">JPG, PNG, GIF (Max 2MB)</div>
                            </div>
                          )}
                        </div>
                        <input
                          id={`produk-image-${num}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProdukImageFileChange(`produk_image_${num}`, e.target.files[0])}
                          className="hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {produkImageError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{produkImageError}</p>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleProdukImageUpload}
                    disabled={produkImageUploading.all}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {produkImageUploading.all ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4" />
                        Upload Gambar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "survey" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  Survey Kepuasan
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <div className="space-y-6">
                {/* Survey Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Total Survey</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">0</p>
                    <p className="text-sm text-blue-600">Respons</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Kepuasan</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900">0%</p>
                    <p className="text-sm text-green-600">Rata-rata</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LayoutGrid className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Bulan Ini</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">0</p>
                    <p className="text-sm text-purple-600">Survey</p>
                  </div>
                </div>

                {/* Survey Actions */}
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    <FileBarChart2 className="w-4 h-4 inline mr-2" />
                    Lihat Laporan
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh Data
                  </button>
                </div>

                {/* Placeholder untuk data survey */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600 text-sm">
                  <Star className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700 mb-1">Data Survey Kepuasan</p>
                  <p>Fitur analisis survey kepuasan akan segera tersedia.</p>
                </div>
              </div>
            </div>
          )}

          {view === "kasubdit_photos" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  Upload Foto Kasubdit
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <p className="text-gray-600 mb-6">Upload foto untuk 5 pimpinan Direktorat Kepatuhan Internal. Foto akan ditampilkan di halaman Konsultasi Teknis.</p>

              {kasubditPhotoError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{kasubditPhotoError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kasubditPersons.map((person) => (
                  <div key={person.id} className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-100 shadow-lg">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{person.name}</h3>
                      <p className="text-xs text-cyan-600">{person.position}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-cyan-300 rounded-lg p-4 bg-white">
                        {kasubditPhotos[person.id] ? (
                          <div className="text-center">
                            <img
                              src={URL.createObjectURL(kasubditPhotos[person.id])}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
                            />
                            <p className="text-xs text-gray-600">{kasubditPhotos[person.id].name}</p>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 text-cyan-300" />
                            <p className="text-sm">Pilih foto untuk upload</p>
                            <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleKasubditPhotoFileChange(person.id, e.target.files[0])}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200"
                      />

                      <button
                        onClick={() => handleKasubditPhotoUpload(person.id)}
                        disabled={kasubditPhotoUploading[person.id] || !kasubditPhotos[person.id]}
                        className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {kasubditPhotoUploading[person.id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Image className="w-4 h-4" />
                            Upload Foto
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "psychologist_photos" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Upload Foto Tim Psikolog
                </h2>
                <button onClick={() => handleViewChange("menu")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              </div>

              <p className="text-gray-600 mb-6">Upload foto untuk tim Psikolog PATNAL. Foto ini akan ditampilkan pada halaman "Pilih Psikolog" bagi pengguna.</p>

              {psychologistPhotoError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{psychologistPhotoError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users
                  .filter(user => (user.status_pengguna || user.daftar_sebagai) === 'Psikolog')
                  .map((psikolog) => (
                  <div key={psikolog.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 shadow-lg">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{psikolog.name}</h3>
                      <p className="text-xs text-purple-600">{psikolog.jabatan || 'Psikolog'}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">{psikolog.nip || 'NIP: -'}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-white">
                        {psychologistPhotos[psikolog.id] ? (
                          <div className="text-center">
                            <img
                              src={URL.createObjectURL(psychologistPhotos[psikolog.id])}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
                            />
                            <p className="text-xs text-gray-600 truncate max-w-full">{psychologistPhotos[psikolog.id].name}</p>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            {psikolog.foto ? (
                              <img
                                src={`http://localhost:8000/${psikolog.foto}`}
                                alt={psikolog.name}
                                className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border border-purple-200"
                                onError={(e) => { e.target.src = '/placeholder-avatar.svg'; }}
                              />
                            ) : (
                              <Users className="w-12 h-12 mx-auto mb-2 text-purple-200" />
                            )}
                            <p className="text-sm">Pilih foto untuk {psikolog.foto ? 'ganti' : 'upload'}</p>
                            <p className="text-xs text-gray-400">JPG, PNG (Max 2MB)</p>
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePsychologistPhotoFileChange(psikolog.id, e.target.files[0])}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                      />

                      <button
                        onClick={() => handlePsychologistPhotoUpload(psikolog.id)}
                        disabled={psychologistPhotoUploading[psikolog.id] || !psychologistPhotos[psikolog.id]}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {psychologistPhotoUploading[psikolog.id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Image className="w-4 h-4" />
                            {psikolog.foto ? 'Perbarui Foto' : 'Simpan Foto'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {users.filter(user => (user.status_pengguna || user.daftar_sebagai) === 'Psikolog').length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Belum ada user dengan peran "Psikolog" yang ditemukan.</p>
                  <button 
                    onClick={() => handleViewChange("users")}
                    className="mt-4 text-purple-600 font-semibold hover:underline"
                  >
                    Tambah Psikolog di Manajemen User
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
