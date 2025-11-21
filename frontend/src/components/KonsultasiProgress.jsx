export default function KonsultasiProgress({ konsultasi }) {
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Histori & Jadwal Konsultasi
      </h3>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-gray-600">
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Topik</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {konsultasi.map((k, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2">{k.tanggal}</td>
                <td className="px-4 py-2">{k.topik}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    k.status === "Selesai"
                      ? "text-green-600"
                      : k.status === "Dijadwalkan"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {k.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
