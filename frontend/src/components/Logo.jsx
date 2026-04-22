import { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function Logo({ className = "h-10 w-auto", alt = "Patnal Integrity Hub" }) {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.get("/site-settings");
        if (res.data?.home_logo) {
          setLogoUrl(res.data.home_logo);
        }
      } catch (err) {
        console.error("Failed to fetch logo:", err);
      }
    };
    fetchLogo();
  }, []);

  return (
    <img
      src={logoUrl || "/Logo.png"}
      alt={alt}
      className={`object-contain ${className}`}
    />
  );
}
