export default function WBSProgress({ wbsProgress }) {
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Progress WBS</h3>

      <ul className="space-y-3">
        {wbsProgress.map((w, i) => (
          <li
            key={i}
            className="flex justify-between py-2 border-b border-gray-200"
          >
            <span className="font-medium text-gray-700">{w.nomor}</span>
            <span
              className={`font-semibold ${
                w.status === "Ditinjau" ? "text-blue-600" : "text-green-600"
              }`}
            >
              {w.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
