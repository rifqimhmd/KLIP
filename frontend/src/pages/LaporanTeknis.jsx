import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/axios';
import UserDropdownMenu from '../components/UserDropdownMenu';
import {
  LayoutDashboard,
  ChevronLeft,
  Calendar,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function LaporanTeknis() {
  const navigate = useNavigate();
  const { jenis } = useParams();
  const [user, setUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Auth check
  useEffect(() => {
    api.get('/user')
      .then((r) => {
        const userData = r.data?.user ?? r.data;
        setUser(userData);
        
        const isKonsultanTeknis =
          userData?.status_pengguna === 'Konsultan Teknis' ||
          userData?.status_pengguna === 'Admin';
        if (!isKonsultanTeknis) {
          navigate('/dashboard');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Fetch consultations
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    api.get('/consultations?type=teknis')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        setConsultations(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Set default date range based on jenis
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    
    switch (jenis) {
      case 'harian':
        start = new Date(today);
        break;
      case 'bulanan':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'tahunan':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  }, [jenis]);

  const filteredConsultations = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return consultations;
    
    return consultations.filter(c => {
      const createdAt = new Date(c.created_at);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      return createdAt >= start && createdAt <= end;
    });
  }, [consultations, dateRange]);

  const stats = useMemo(() => {
    const total = filteredConsultations.length;
    const completed = filteredConsultations.filter(c => c.status === 'completed').length;
    const pending = filteredConsultations.filter(c => c.status === 'pending').length;
    const inProgress = filteredConsultations.filter(c => c.status === 'in_progress').length;
    
    const byCategory = {};
    filteredConsultations.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });
    
    return { total, completed, pending, inProgress, byCategory };
  }, [filteredConsultations]);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Dynamic import jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text(`LAPORAN ${jenis.toUpperCase()} KONSULTASI TEKNIS`, 105, 20, { align: 'center' });
      
      // Info
      doc.setFontSize(12);
      doc.text(`Periode: ${dateRange.start} s/d ${dateRange.end}`, 14, 35);
      doc.text(`Total Konsultasi: ${stats.total}`, 14, 42);
      doc.text(`Selesai: ${stats.completed} | Menunggu: ${stats.pending} | Diproses: ${stats.inProgress}`, 14, 49);
      
      // Table Header
      let y = 65;
      doc.setFillColor(200, 200, 200);
      doc.rect(14, y - 5, 182, 10, 'F');
      doc.setFontSize(10);
      doc.text('No', 16, y);
      doc.text('Tanggal', 30, y);
      doc.text('Subjek', 60, y);
      doc.text('Kategori', 110, y);
      doc.text('Status', 150, y);
      
      // Table Data
      y += 10;
      filteredConsultations.forEach((c, i) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(i + 1), 16, y);
        doc.text(new Date(c.created_at).toLocaleDateString('id-ID'), 30, y);
        doc.text(c.subject?.substring(0, 30) || '-', 60, y);
        doc.text(c.category || '-', 110, y);
        doc.text(c.status || '-', 150, y);
        y += 7;
      });
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 290);
      
      doc.save(`laporan-${jenis}-${dateRange.start}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Gagal export PDF. Pastikan library jsPDF terinstall: npm install jspdf');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Dynamic import xlsx
      const XLSX = await import('xlsx');
      
      // Prepare data
      const data = filteredConsultations.map((c, i) => ({
        'No': i + 1,
        'Tanggal': new Date(c.created_at).toLocaleDateString('id-ID'),
        'Subjek': c.subject,
        'Kategori': c.category,
        'Status': c.status === 'completed' ? 'Selesai' : c.status === 'in_progress' ? 'Diproses' : 'Menunggu',
        'Pengguna': c.user?.name || '-',
        'Ditangani Oleh': c.assigned_to ? (c.assigned_to === user?.id ? 'Anda' : 'Konsultan lain') : '-'
      }));
      
      // Add summary row
      data.push({
        'No': '',
        'Tanggal': '',
        'Subjek': 'RINGKASAN',
        'Kategori': '',
        'Status': '',
        'Pengguna': '',
        'Ditangani Oleh': ''
      });
      data.push({
        'No': '',
        'Tanggal': '',
        'Subjek': `Total: ${stats.total}`,
        'Kategori': `Selesai: ${stats.completed}`,
        'Status': `Menunggu: ${stats.pending}`,
        'Pengguna': `Diproses: ${stats.inProgress}`,
        'Ditangani Oleh': ''
      });
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 12 },  // Tanggal
        { wch: 40 },  // Subjek
        { wch: 20 },  // Kategori
        { wch: 12 },  // Status
        { wch: 20 },  // Pengguna
        { wch: 20 }   // Ditangani Oleh
      ];
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
      
      // Download
      XLSX.writeFile(wb, `laporan-${jenis}-${dateRange.start}.xlsx`);
    } catch (err) {
      console.error('Excel export error:', err);
      // Fallback to CSV if xlsx not available
      const headers = ['No', 'Tanggal', 'Subjek', 'Kategori', 'Status', 'Pengguna', 'Ditangani Oleh'];
      const rows = filteredConsultations.map((c, i) => [
        i + 1,
        new Date(c.created_at).toLocaleDateString('id-ID'),
        c.subject,
        c.category,
        c.status,
        c.user?.name || '-',
        c.assigned_to ? (c.assigned_to === user?.id ? 'Anda' : 'Konsultan lain') : '-'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const BOM = '\ufeff';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-${jenis}-${dateRange.start}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Library xlsx tidak tersedia. Menggunakan fallback CSV.\n\nUntuk Excel asli, install: npm install xlsx');
    } finally {
      setExporting(false);
    }
  };

  const getTitle = () => {
    switch (jenis) {
      case 'harian': return 'Laporan Harian';
      case 'bulanan': return 'Laporan Bulanan';
      case 'tahunan': return 'Laporan Tahunan';
      default: return 'Laporan';
    }
  };

  const getIcon = () => {
    switch (jenis) {
      case 'harian': return <Calendar className="w-6 h-6" />;
      case 'bulanan': return <BarChart3 className="w-6 h-6" />;
      case 'tahunan': return <TrendingUp className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('auth_token');
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/konsultan-teknis/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{getTitle()}</h1>
              <p className="text-xs text-gray-500">Konsultan Teknis - {jenis?.toUpperCase()}</p>
            </div>
          </div>
          {user && <UserDropdownMenu user={user} onLogout={handleLogout} />}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter & Export Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-700">Filter Periode:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Dari:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sampai:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                disabled={exporting || filteredConsultations.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button
                onClick={exportToExcel}
                disabled={exporting || filteredConsultations.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Konsultasi</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Menunggu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-sm text-gray-500">Diproses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-500">Selesai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Daftar Konsultasi</h3>
            <p className="text-sm text-gray-500">Periode: {dateRange.start} s/d {dateRange.end}</p>
          </div>
          
          {filteredConsultations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada data konsultasi untuk periode ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subjek</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pengguna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredConsultations.map((c, i) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{i + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(c.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{c.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === 'completed' ? 'bg-green-100 text-green-700' :
                          c.status === 'in_progress' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.status === 'completed' ? 'Selesai' :
                           c.status === 'in_progress' ? 'Diproses' : 'Menunggu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.user?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
