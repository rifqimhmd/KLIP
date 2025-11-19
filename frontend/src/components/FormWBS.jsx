import { useState, useRef } from "react";

/**
 * Full multi-step WBS form (React + TailwindCSS)
 * - Desktop: full width
 * - Asterisk (*) = red
 * - Multi-step (1: Detail, 2: Terlapor, 3: Lampiran)
 * - Validation for steps
 * - Drag & drop + file input (simulated upload with progress)
 * - Responsive table for terlapor
 * - Responsive, compact time inputs (date wider on mobile)
 *
 * Paste this component in your React app (Tailwind required).
 */

export default function FormWBS() {
  const [step, setStep] = useState(1);

  // --- Step 1 data ---
  const [dataInfo, setDataInfo] = useState({
    perihal: "",
    alamat: "",
    provinsi: "",
    kabupaten: "",
    unit: "",
    tanggal: "",
    jam: "",
    menit: "",
    uraian: "",
  });

  // --- Step 2 data ---
  const [terlapor, setTerlapor] = useState([]);
  const [formTerlapor, setFormTerlapor] = useState({
    nama: "",
    nip: "",
    unit: "",
    jabatan: "",
  });

  // --- Step 3 data ---
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dropRef = useRef(null);

  // Generic change handlers
  const handleChangeInfo = (e) =>
    setDataInfo({ ...dataInfo, [e.target.name]: e.target.value });

  const handleChangeTerlapor = (e) =>
    setFormTerlapor({ ...formTerlapor, [e.target.name]: e.target.value });

  const addTerlapor = () => {
    const namaFinal =
      formTerlapor.nama.trim() === "" ? "Anonym" : formTerlapor.nama.trim();
    setTerlapor((prev) => [...prev, { ...formTerlapor, nama: namaFinal }]);
    setFormTerlapor({ nama: "", nip: "", unit: "", jabatan: "" });
  };

  const removeTerlapor = (idx) =>
    setTerlapor((prev) => prev.filter((_, i) => i !== idx));

  // Validation
  const validateStep1 = () => {
    const required = [
      "perihal",
      "alamat",
      "provinsi",
      "kabupaten",
      "unit",
      "tanggal",
      "jam",
      "menit",
      "uraian",
    ];
    return required.every((k) => (dataInfo[k] ?? "").toString().trim() !== "");
  };

  const validateStep2 = () => terlapor.length > 0;

  const nextStep = () => {
    if (step === 1 && !validateStep1())
      return alert("Mohon lengkapi semua field wajib di Step 1.");
    if (step === 2 && !validateStep2())
      return alert("Tambahkan minimal satu terlapor pada Step 2.");
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // File handling (drag-drop + input)
  const handleFileInput = (e) => {
    const selected = [...e.target.files];
    processFiles(selected);
    e.target.value = null; // reset input
  };

  const processFiles = (fileList) => {
    const validFiles = [];
    fileList.forEach((f) => {
      if (f.size > 20 * 1024 * 1024) {
        alert(`${f.name} lebih dari 20MB — file di-skip.`);
      } else {
        validFiles.push(f);
      }
    });

    if (validFiles.length > 0) simulateUpload(validFiles);
  };

  const simulateUpload = (incomingFiles) => {
    setUploadProgress(0);
    // simulate progress to 100% then add files
    let progress = 0;
    const interval = setInterval(() => {
      progress += 12 + Math.floor(Math.random() * 6); // 12-17 step
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setFiles((prev) => [...prev, ...incomingFiles]);
          setUploadProgress(0);
        }, 300);
      } else {
        setUploadProgress(progress);
      }
    }, 120);
  };

  const dragOver = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add("border-blue-500", "bg-blue-50");
  };

  const dragLeave = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("border-blue-500", "bg-blue-50");
  };

  const dropFile = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("border-blue-500", "bg-blue-50");
    const dropped = [...e.dataTransfer.files];
    processFiles(dropped);
  };

  // Final submit
  const submitFinal = () => {
    // basic check
    if (!validateStep1()) return alert("Data Step 1 belum lengkap.");
    if (!validateStep2()) return alert("Tambahkan minimal satu terlapor.");
    // simulate submit
    alert("Pengaduan berhasil dibuat!");
    console.log("SUBMIT:", { dataInfo, terlapor, files });
    // reset optional:
    // setStep(1); setDataInfo(...); setTerlapor([]); setFiles([]);
  };

  return (
    <div className="w-full max-w-none p-6 md:p-10 bg-white ">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Informasi Penting Terkait Kejadian
        </h1>
        <div className="w-28 h-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-300" />
      </header>

      {/* Step indicator */}
      <nav className="flex items-center justify-between mb-8 gap-4 text-sm">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  step === 1
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                1
              </div>
              <span>Detail</span>
            </div>

            <div
              className={`flex items-center gap-2 ${
                step === 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  step === 2
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                2
              </div>
              <span>Terlapor</span>
            </div>

            <div
              className={`flex items-center gap-2 ${
                step === 3 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  step === 3
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                3
              </div>
              <span>Lampiran</span>
            </div>
          </div>
        </div>

        {/* simple progress */}
        <div className="w-40">
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </nav>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2">
            Detail Informasi
          </h2>

          {/* Perihal */}
          <div>
            <label className="block font-medium mb-1">
              Perihal <span className="text-red-600">*</span>
            </label>
            <input
              name="perihal"
              value={dataInfo.perihal}
              onChange={handleChangeInfo}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block font-medium mb-1">
              Alamat Kejadian <span className="text-red-600">*</span>
            </label>
            <textarea
              name="alamat"
              rows={2}
              value={dataInfo.alamat}
              onChange={handleChangeInfo}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Provinsi + Kabupaten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Provinsi <span className="text-red-600">*</span>
              </label>
              <input
                name="provinsi"
                value={dataInfo.provinsi}
                onChange={handleChangeInfo}
                placeholder="Contoh: Aceh"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Kabupaten/Kota <span className="text-red-600">*</span>
              </label>
              <input
                name="kabupaten"
                value={dataInfo.kabupaten}
                onChange={handleChangeInfo}
                placeholder="Contoh: Kab. Nagan Raya"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:gap-4 md:items-stretch">
            {/* Unit */}
            <div className="flex-1 flex flex-col">
              <label className="block font-medium mb-1">
                Unit Kejadian <span className="text-red-600">*</span>
              </label>
              <input
                name="unit"
                value={dataInfo.unit}
                onChange={handleChangeInfo}
                placeholder="Contoh: Lapas Kelas I XX"
                className="w-full h-full border border-gray-300 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Waktu */}
            <div className="flex-1 flex flex-col mt-4 md:mt-0">
              <label className="block font-medium mb-1">
                Perkiraan Waktu Kejadian <span className="text-red-600">*</span>
              </label>

              <div className="flex flex-wrap gap-2 items-center h-full">
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="date"
                    name="tanggal"
                    value={dataInfo.tanggal}
                    onChange={handleChangeInfo}
                    className="w-full h-full border border-gray-300 rounded-xl px-3 py-3"
                  />
                </div>

                <div className="w-20 md:w-1/6">
                  <input
                    type="number"
                    name="jam"
                    min="0"
                    max="23"
                    value={dataInfo.jam}
                    onChange={handleChangeInfo}
                    placeholder="Jam"
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-center"
                  />
                </div>

                <div className="w-20 md:w-1/6">
                  <input
                    type="number"
                    name="menit"
                    min="0"
                    max="59"
                    value={dataInfo.menit}
                    onChange={handleChangeInfo}
                    placeholder="Menit"
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Uraian */}
          <div>
            <label className="block font-medium mb-1">
              Uraian <span className="text-red-600">*</span>
            </label>
            <textarea
              name="uraian"
              rows={4}
              value={dataInfo.uraian}
              onChange={handleChangeInfo}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="text-xs text-gray-500 mt-2">
              Uraian lebih detail dapat dilampirkan pada langkah Lampiran.
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Selanjutnya →
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: TERLAPOR */}
      {step === 2 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2">
            Terlapor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              name="nama"
              placeholder="Nama"
              value={formTerlapor.nama}
              onChange={handleChangeTerlapor}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
            <input
              name="nip"
              placeholder="NIP"
              value={formTerlapor.nip}
              onChange={handleChangeTerlapor}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
            <input
              name="unit"
              placeholder="Unit"
              value={formTerlapor.unit}
              onChange={handleChangeTerlapor}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
            <input
              name="jabatan"
              placeholder="Jabatan"
              value={formTerlapor.jabatan}
              onChange={handleChangeTerlapor}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <button
              onClick={addTerlapor}
              type="button"
              className="bg-green-600 text-white px-4 py-3 rounded-xl w-full md:w-auto text-center font-medium shadow-sm active:scale-[0.98] transition"
            >
              + Tambah Terlapor
            </button>

            <div className="text-sm text-gray-500 md:whitespace-nowrap text-center md:text-left">
              (Kosongkan nama untuk menyimpan sebagai "Anonym")
            </div>
          </div>

          {/* Responsive table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-3 py-2 text-left">Nama</th>
                  <th className="border px-3 py-2 text-left">NIP</th>
                  <th className="border px-3 py-2 text-left">Unit</th>
                  <th className="border px-3 py-2 text-left">Jabatan</th>
                  <th className="border px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {terlapor.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border px-3 py-4 text-center text-gray-500"
                    >
                      Belum ada terlapor.
                    </td>
                  </tr>
                ) : (
                  terlapor.map((t, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-3 py-2">{t.nama}</td>
                      <td className="border px-3 py-2">{t.nip}</td>
                      <td className="border px-3 py-2">{t.unit}</td>
                      <td className="border px-3 py-2">{t.jabatan}</td>
                      <td className="border px-3 py-2 text-center">
                        <button
                          onClick={() => removeTerlapor(i)}
                          className="text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-200 rounded-xl"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              Selanjutnya →
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: LAMPIRAN */}
      {step === 3 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2">
            Lampiran
          </h2>

          {/* Drag & Drop */}
          <div
            ref={dropRef}
            onDragOver={dragOver}
            onDragLeave={dragLeave}
            onDrop={dropFile}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition"
            aria-label="Area drop file"
          >
            <p className="text-gray-600 mb-2">
              Seret & lepas file ke sini, atau klik tombol untuk memilih file.
            </p>

            <div className="flex items-center justify-center gap-3">
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                  Pilih File
                </span>
              </label>

              <span className="text-sm text-gray-500">
                Ukuran max 20MB / file
              </span>
            </div>
          </div>

          {/* Upload progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-blue-600 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Files list */}
          <div>
            <h3 className="font-medium mb-2">File terupload</h3>
            {files.length === 0 ? (
              <div className="text-sm text-gray-500">Belum ada file.</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="truncate max-w-[70%]">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {Math.round(f.size / 1024)} KB
                      </span>
                      <button
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-red-600 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-200 rounded-xl"
            >
              ← Sebelumnya
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // quick go back to step 1 for editing if needed
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl"
              >
                Edit
              </button>

              <button
                onClick={submitFinal}
                className="px-6 py-3 bg-green-600 text-white rounded-xl"
              >
                Buat Pengaduan
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
