import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { Send, User, MessageSquare, CheckCircle } from 'lucide-react';

const Survey = () => {
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    kemudahanPenggunaan: 0,
    kemudahanInformasi: 0,
    tampilanWebsite: 0,
    kenyamananPenggunaan: 0,
    pemahamanInformasi: 0,
    kesesuaianKebutuhan: 0,
    kepuasanInformasi: 0,
    tingkatKepuasan: 0,
    keinginanMenggunakan: 0,
    kemungkinanRekomendasi: 0,
    saranHarapan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi semua pertanyaan skala harus diisi
    const scaleQuestions = [
      'kemudahanPenggunaan', 'kemudahanInformasi', 'tampilanWebsite',
      'kenyamananPenggunaan', 'pemahamanInformasi', 'kesesuaianKebutuhan',
      'kepuasanInformasi', 'tingkatKepuasan', 'keinginanMenggunakan',
      'kemungkinanRekomendasi'
    ];

    const unansweredQuestions = scaleQuestions.filter(q => formData[q] === 0);

    if (unansweredQuestions.length > 0) {
      alert('Silakan jawab semua pertanyaan skala 1-5 terlebih dahulu');
      return;
    }

    setIsSubmitting(true);

    try {
      // Kirim data ke backend API
      const response = await fetch('http://localhost:8000/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        // Reset form
        setFormData({
          nama: '',
          nip: '',
          kemudahanPenggunaan: 0,
          kemudahanInformasi: 0,
          tampilanWebsite: 0,
          kenyamananPenggunaan: 0,
          pemahamanInformasi: 0,
          kesesuaianKebutuhan: 0,
          kepuasanInformasi: 0,
          tingkatKepuasan: 0,
          keinginanMenggunakan: 0,
          kemungkinanRekomendasi: 0,
          saranHarapan: ''
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Survey submission error:', response.status, errorData);
        const errorMessage = errorData.message || errorData.error || 'Terjadi kesalahan saat mengirim survey. Silakan coba lagi.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Gagal mengirim survey. Pastikan koneksi internet stabil dan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Terima Kasih!</h2>
            <p className="text-gray-600 mb-6">
              Survey kepuasan Anda telah berhasil dikirim.
              Feedback Anda sangat berharga untuk meningkatkan kualitas layanan kami.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Isi Survey Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ScaleQuestion = ({ name, question, value, onChange }) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="font-medium text-gray-800 mb-3">{question}</p>
        <div className="flex items-center justify-between space-x-2">
          <span className="text-xs text-gray-500">1 (Sangat Tidak Setuju)</span>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((scale) => (
              <label key={scale} className="flex items-center">
                <input
                  type="radio"
                  name={name}
                  value={scale}
                  checked={value === scale}
                  onChange={() => onChange(name, scale)}
                  className="sr-only"
                />
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${value === scale
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}>
                  {scale}
                </div>
              </label>
            ))}
          </div>
          <span className="text-xs text-gray-500">5 (Sangat Setuju)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <a href="/" className="inline-flex items-center gap-3 group">
              <Logo
                className="h-12 w-auto transition-transform group-hover:scale-105"
                alt="Patnal Integrity Hub"
              />
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  Patnal Integrity Hub
                </h2>
              </div>
            </a>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Survey Kepuasan</h1>
          <p className="text-gray-600">
            Feedback Anda sangat penting untuk meningkatkan kualitas layanan Patnal Integrity Hub
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Form Section - Full width */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama/NIP Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <label className="text-sm font-semibold text-blue-800">
                      Identitas (Opsional)
                    </label>
                  </div>
                  <p className="text-xs text-blue-600 mb-3">
                    Lebih baik anonim agar jujur dalam memberikan feedback
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        placeholder="Opsional"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIP
                      </label>
                      <input
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        placeholder="Opsional"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Skala Questions */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                      Pertanyaan Skala Kepuasan
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Menggunakan skala: <span className="font-semibold">1 (Sangat Tidak Setuju)</span> hingga <span className="font-semibold">5 (Sangat Setuju)</span>
                    </p>
                  </div>

                  <ScaleQuestion
                    name="kemudahanPenggunaan"
                    question="Seberapa mudah Anda menggunakan website ini?"
                    value={formData.kemudahanPenggunaan}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="kemudahanInformasi"
                    question="Seberapa mudah Anda menemukan informasi yang Anda cari di website ini?"
                    value={formData.kemudahanInformasi}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="tampilanWebsite"
                    question="Bagaimana pendapat Anda tentang tampilan website ini?"
                    value={formData.tampilanWebsite}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="kenyamananPenggunaan"
                    question="Seberapa nyaman Anda saat menggunakan website ini?"
                    value={formData.kenyamananPenggunaan}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="pemahamanInformasi"
                    question="Menurut Anda, apakah informasi yang tersedia mudah dipahami?"
                    value={formData.pemahamanInformasi}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="kesesuaianKebutuhan"
                    question="Sejauh mana informasi di website ini sesuai dengan kebutuhan Anda?"
                    value={formData.kesesuaianKebutuhan}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="kepuasanInformasi"
                    question="Seberapa membantu website ini dalam memenuhi kebutuhan informasi Anda?"
                    value={formData.kepuasanInformasi}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="tingkatKepuasan"
                    question="Bagaimana tingkat kepuasan Anda saat menggunakan website ini?"
                    value={formData.tingkatKepuasan}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="keinginanMenggunakan"
                    question="Seberapa besar keinginan Anda untuk menggunakan website ini kembali?"
                    value={formData.keinginanMenggunakan}
                    onChange={handleRadioChange}
                  />

                  <ScaleQuestion
                    name="kemungkinanRekomendasi"
                    question="Seberapa besar kemungkinan Anda merekomendasikan website ini kepada orang lain?"
                    value={formData.kemungkinanRekomendasi}
                    onChange={handleRadioChange}
                  />
                </div>

                {/* Saran dan Harapan */}
                <div>
                  <div className="flex items-center mb-3">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                    <label className="text-sm font-semibold text-gray-800">
                      Apa saran atau harapan Anda terhadap Website ini?
                    </label>
                  </div>
                  <textarea
                    name="saranHarapan"
                    value={formData.saranHarapan}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Bagikan saran dan harapan Anda untuk perbaikan website kami..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Kirim Survey
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
