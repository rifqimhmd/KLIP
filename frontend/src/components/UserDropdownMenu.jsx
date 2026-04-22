import { useEffect, useRef, useState } from "react";
import api from "../lib/axios";

export default function UserDropdownMenu({ user, onLogout, onUserUpdate }) {
  const [open, setOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(Boolean(user?.is_available ?? true));
  const [savingAvailability, setSavingAvailability] = useState(false);
  const containerRef = useRef(null);

  const isAdmin = (user?.status_pengguna || "").toLowerCase() === "admin";
  const isPsikolog = (user?.status_pengguna || "").toLowerCase() === "psikolog";
  const dashboardPath = isAdmin ? "/admin/dashboard" : "/dashboard";

  useEffect(() => {
    setIsAvailable(Boolean(user?.is_available ?? true));
  }, [user?.is_available]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleAvailability = async () => {
    if (!isPsikolog || savingAvailability) return;

    const nextValue = !isAvailable;
    try {
      setSavingAvailability(true);
      const response = await api.put("/consultations/psychologists/availability", {
        is_available: nextValue,
      });

      const updated = Boolean(response?.data?.is_available ?? nextValue);
      setIsAvailable(updated);

      if (typeof onUserUpdate === "function") {
        onUserUpdate({
          ...user,
          is_available: updated,
        });
      }
    } catch (error) {
      console.error("Failed to update psychologist availability:", error);
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700"
      >
        <span>{user?.name || "User"}</span>
        {isPsikolog && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isAvailable ? "Tersedia" : "Tidak Tersedia"}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <a href={dashboardPath} className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Dashboard
          </a>
          <a href="/profile" className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Profil
          </a>
          <a href="/update-password" className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Ubah Password
          </a>
          {isPsikolog && (
            <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Status Psikolog</span>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={savingAvailability}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                  isAvailable ? "bg-green-500" : "bg-red-500"
                } ${savingAvailability ? "opacity-60 cursor-not-allowed" : ""}`}
                aria-label="Toggle status psikolog"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailable ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
