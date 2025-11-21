import { useState } from "react";

export default function Profil({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [editField, setEditField] = useState({});

  const toggleEdit = (field) => {
    if (field === "status") return;
    setEditField({ ...editField, [field]: !editField[field] });
  };

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = () => {
    alert("Perubahan disimpan (dummy)");
    setEditField({});
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fotoURL = URL.createObjectURL(file);
      setUser({ ...user, foto: fotoURL });
    }
  };

  return (
    <div className="md:w-1/3 w-full p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Data Profil
      </h3>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36 md:w-44 md:h-44">
          <img
            src={user.foto}
            className="w-full h-full object-cover rounded-full ring-4 ring-blue-100 shadow"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 rounded-full transition-opacity cursor-pointer">
            <label
              htmlFor="fotoUpload"
              className="text-white text-lg bg-blue-600 px-2 py-1 rounded shadow"
            >
              🖊
            </label>
          </div>
          <input
            type="file"
            id="fotoUpload"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
          />
        </div>

        <h4 className="text-lg font-semibold text-gray-800">{user.nama}</h4>
      </div>

      <div className="mt-6 space-y-4">
        {[
          { label: "NIP", field: "nip" },
          { label: "Nama", field: "nama" },
          { label: "Pangkat/Golongan", field: "pangkat" },
          { label: "Jabatan", field: "jabatan" },
          { label: "Bagian", field: "bagian" },
          { label: "Unit Kerja", field: "unit" },
          { label: "Tipe", field: "tipe" },
          { label: "Email", field: "email" },
          { label: "Status", field: "status" },
        ].map((item) => (
          <div
            key={item.field}
            className="flex items-center justify-between pb-2 border-b border-gray-200"
          >
            <div>
              <span className="text-gray-500 text-xs">{item.label}</span>

              {item.field === "status" ? (
                <p
                  className={`font-medium mt-0.5 ${
                    user.status === "Aktif" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.status}
                </p>
              ) : editField[item.field] ? (
                <input
                  type="text"
                  value={user[item.field]}
                  onChange={(e) => handleChange(item.field, e.target.value)}
                  className="border px-2 py-1 w-full rounded mt-1 text-sm shadow-sm"
                />
              ) : (
                <p className="text-gray-800 mt-0.5">{user[item.field]}</p>
              )}
            </div>

            {item.field !== "status" && (
              <button
                onClick={() => toggleEdit(item.field)}
                className="text-gray-400 hover:text-blue-600 transition"
              >
                🖉
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
