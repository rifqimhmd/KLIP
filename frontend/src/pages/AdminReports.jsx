import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import UserDropdownMenu from "../components/UserDropdownMenu";
import { LayoutDashboard, FileBarChart2, RefreshCw } from "lucide-react";

export default function AdminReports() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [exportingType, setExportingType] = useState("");
  const [consultations, setConsultations] = useState([]);
  const [chartRange, setChartRange] = useState("daily");

  useEffect(() => {
    document.title = "Admin Laporan - KLIP";
    checkAdmin();
  }, []);

  const isAdminUser = (userData) => {
    const role = (userData?.status_pengguna || "").toLowerCase();
    const legacyRole = (userData?.daftar_sebagai || "").toLowerCase();
    return role === "admin" || legacyRole === "admin";
  };

  const fetchConsultations = async () => {
    try {
      setDataLoading(true);
      const response = await api.get("/api/consultations");
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
      setConsultations(payload);
    } catch (error) {
      console.error("Error loading report data:", error);
      setConsultations([]);
    } finally {
      setDataLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/api/user");
      const userData = response?.data?.user || response?.data;

      if (!isAdminUser(userData)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setUser(userData);
      await fetchConsultations();
    } catch (error) {
      console.error("Error checking admin:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      } else {
        navigate("/");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common.Authorization;
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common.Authorization;
      navigate("/");
    }
  };

  const handleExportConsultations = async (type) => {
    try {
      setExportingType(type);
      const response = await api.get(`/api/consultations/export/${type}`, {
        responseType: "blob",
      });

      // Guard against JSON error response wrapped as blob
      const contentType = response.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json?.message || "Gagal export laporan");
      }

      const fallbackName = `laporan-konsultasi-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${type === "pdf" ? "pdf" : "csv"}`;
      const disposition = response.headers?.["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename="?([^"\s]+)"?/i);
      const filename = filenameMatch?.[1] || fallbackName;

      const blob = new Blob([response.data], {
        type: type === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 200);
    } catch (error) {
      console.error("Gagal export laporan:", error);
      alert(error?.message || "Gagal export laporan konsultasi");
    } finally {
      setExportingType("");
    }
  };

  const chartData = useMemo(() => {
    const safeDate = (value) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const dayLabel = (date) => {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      return `${dd}/${mm}`;
    };

    const monthLabel = (date) => {
      return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    };

    const buildSeries = (range) => {
      const now = new Date();
      const counts = new Map();
      const labels = [];
      const keys = [];

      if (range === "daily") {
        for (let i = 13; i >= 0; i -= 1) {
          const date = new Date(now);
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - i);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          keys.push(key);
          labels.push(dayLabel(date));
          counts.set(key, 0);
        }

        consultations.forEach((item) => {
          const date = safeDate(item.created_at);
          if (!date) return;
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          if (counts.has(key)) {
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });
      }

      if (range === "monthly") {
        for (let i = 11; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          keys.push(key);
          labels.push(monthLabel(date));
          counts.set(key, 0);
        }

        consultations.forEach((item) => {
          const date = safeDate(item.created_at);
          if (!date) return;
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (counts.has(key)) {
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });
      }

      if (range === "yearly") {
        for (let i = 4; i >= 0; i -= 1) {
          const year = now.getFullYear() - i;
          const key = String(year);
          keys.push(key);
          labels.push(key);
          counts.set(key, 0);
        }

        consultations.forEach((item) => {
          const date = safeDate(item.created_at);
          if (!date) return;
          const key = String(date.getFullYear());
          if (counts.has(key)) {
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });
      }

      return labels.map((label, index) => ({
        label,
        value: counts.get(keys[index]) || 0,
      }));
    };

    return buildSeries(chartRange);
  }, [consultations, chartRange]);

  const chartSvg = useMemo(() => {
    if (!chartData.length) return null;

    const width = 900;
    const height = 320;
    const paddingX = 56;
    const paddingTop = 28;
    const paddingBottom = 48;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxValue = Math.max(1, ...chartData.map((item) => item.value));

    const points = chartData.map((item, index) => {
      const x = paddingX + (chartWidth / Math.max(1, chartData.length - 1)) * index;
      const y = paddingTop + chartHeight - (item.value / maxValue) * chartHeight;
      return { ...item, x, y };
    });

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

    return {
      width,
      height,
      maxValue,
      points,
      polyline,
      yAxisTicks: 4,
      paddingX,
      paddingTop,
      paddingBottom,
      chartHeight,
      chartWidth,
    };
  }, [chartData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat laporan admin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600 max-w-xl w-full">
          Akses laporan admin tidak valid.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/Logo.png" alt="KLIP" className="h-10 md:h-11 w-auto object-contain" />
          </a>
          <UserDropdownMenu user={user} onLogout={handleLogout} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
              </div>
              <nav className="pb-2">
                <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition text-sm border-l-4 border-transparent">
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" /> Dashboard
                </a>
                <a href="/admin/reports" className="flex items-center gap-3 px-4 py-2.5 text-blue-700 bg-blue-50 font-semibold text-sm border-l-4 border-blue-600">
                  <FileBarChart2 className="w-4 h-4 flex-shrink-0" /> Laporan
                </a>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Laporan Konsultasi</h1>
                  <p className="text-sm text-gray-600 mt-1">Grafik tren data konsultasi untuk kebutuhan monitoring admin.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportConsultations("pdf")}
                    disabled={exportingType === "pdf" || exportingType === "excel"}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    {exportingType === "pdf" ? "Export PDF..." : "Export PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportConsultations("excel")}
                    disabled={exportingType === "pdf" || exportingType === "excel"}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm"
                  >
                    {exportingType === "excel" ? "Export Excel..." : "Export Excel"}
                  </button>
                  <button
                    onClick={fetchConsultations}
                    disabled={dataLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
                    {dataLoading ? "Memuat..." : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChartRange("daily")}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${chartRange === "daily" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  Harian
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange("monthly")}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${chartRange === "monthly" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange("yearly")}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${chartRange === "yearly" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  Tahunan
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600 mb-3">
                  {chartRange === "daily" && "Menampilkan tren 14 hari terakhir."}
                  {chartRange === "monthly" && "Menampilkan tren 12 bulan terakhir."}
                  {chartRange === "yearly" && "Menampilkan tren 5 tahun terakhir."}
                </p>

                {!chartSvg ? (
                  <p className="text-sm text-gray-600">Belum ada data laporan.</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${chartSvg.width} ${chartSvg.height}`} className="min-w-[720px] w-full h-[320px]">
                      <rect x="0" y="0" width={chartSvg.width} height={chartSvg.height} fill="#f9fafb" rx="10" />

                      {Array.from({ length: chartSvg.yAxisTicks + 1 }).map((_, idx) => {
                        const value = Math.round((chartSvg.maxValue / chartSvg.yAxisTicks) * (chartSvg.yAxisTicks - idx));
                        const y = chartSvg.paddingTop + (chartSvg.chartHeight / chartSvg.yAxisTicks) * idx;
                        return (
                          <g key={`y-${idx}`}>
                            <line x1={chartSvg.paddingX} y1={y} x2={chartSvg.paddingX + chartSvg.chartWidth} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                            <text x={chartSvg.paddingX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{value}</text>
                          </g>
                        );
                      })}

                      <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={chartSvg.polyline} strokeLinecap="round" strokeLinejoin="round" />

                      {chartSvg.points.map((point, idx) => (
                        <g key={`p-${idx}`}>
                          <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
                          <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="11" fill="#1f2937">{point.value}</text>
                          <text x={point.x} y={chartSvg.height - 16} textAnchor="middle" fontSize="11" fill="#6b7280">{point.label}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
