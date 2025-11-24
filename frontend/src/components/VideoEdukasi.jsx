import React, { useState } from "react";

export default function VideoEdukasi() {
  const videos = [
    { id: 1, url: "https://www.youtube.com/embed/jnwOBr7DtKA" },
    { id: 2, url: "https://www.youtube.com/embed/ScMzIvxBSi4" },
    { id: 3, url: "https://www.youtube.com/embed/ysz5S6PUM-U" },
    { id: 4, url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <section
      id="videoedukasi"
      className="relative w-full bg-gradient-to-r from-blue-50 to-white py-10 md:py-20"
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        {/* VIDEO UTAMA */}
        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
          {/* LEFT */}
          <button
            onClick={prevVideo}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white 
                       text-gray-700 px-3 py-2 rounded-full shadow-lg transition z-20"
          >
            ◀
          </button>

          {/* VIDEO */}
          <iframe
            key={videos[currentIndex].id}
            className="w-full h-full pointer-events-none" // <--- penting agar tombol bisa diklik
            src={videos[currentIndex].url}
            title="Video Edukasi Utama"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>

          {/* RIGHT */}
          <button
            onClick={nextVideo}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white 
                       text-gray-700 px-3 py-2 rounded-full shadow-lg transition z-20"
          >
            ▶
          </button>
        </div>

        {/* VIDEO LIST KECIL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {videos.map((v, i) => (
            <div
              key={v.id}
              onClick={() => setCurrentIndex(i)}
              className="w-full aspect-video cursor-pointer rounded-xl overflow-hidden shadow-lg
                         hover:ring-4 hover:ring-blue-300 transition"
            >
              <iframe
                className="w-full h-full pointer-events-none"
                src={v.url}
                title={`Video ${v.id}`}
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
