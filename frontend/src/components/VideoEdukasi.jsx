import React, { useState } from "react";

export default function VideoEdukasi() {
  const videos = [
    { id: 1, url: "https://www.youtube.com/embed/aVgihMIhi6c" },
    { id: 2, url: "https://www.youtube.com/embed/bFmGdzeEV0s" },
    { id: 3, url: "https://www.youtube.com/embed/6YOkAL8BoUU" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const nextThumb = () => {
    setCarouselIndex((prev) => (prev < videos.length - 1 ? prev + 1 : prev));
  };

  const prevThumb = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <section
      id="videoedukasi"
      className="relative w-full bg-gradient-to-r from-blue-50 to-white py-10 md:py-20"
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        {/* === VIDEO UTAMA === */}
        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            key={videos[currentIndex].id}
            className="w-full h-full"
            src={videos[currentIndex].url}
            title="Video Edukasi Utama"
            allowFullScreen
          ></iframe>
        </div>

        {/* === CAROUSEL === */}
        <div className="relative max-w-3xl mx-auto mt-10 select-none">
          {/* tombol kiri */}
          <button
            onClick={prevThumb}
            disabled={carouselIndex <= 0}
            className={`absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg 
  border border-blue-200 text-blue-600 rounded-full w-10 h-10 
  items-center justify-center hover:bg-blue-50 z-10 hidden md:flex
  ${carouselIndex <= 0 ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            ❮
          </button>

          {/* thumbnail wrapper */}
          <div
            className="overflow-hidden px-6 md:px-12"
            onTouchStart={(e) => (window.touchStartX = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const diff = e.changedTouches[0].clientX - window.touchStartX;
              if (diff > 50) prevThumb();
              if (diff < -50) nextThumb();
            }}
          >
            <div
              className="flex gap-4 md:gap-5 transition-transform duration-500"
              style={{
                transform: `translateX(calc(-${carouselIndex} * (250px + 1rem)))`,
              }}
            >
              {videos.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`min-w-[250px] md:min-w-[300px] aspect-video rounded-xl overflow-hidden 
            cursor-pointer shadow-lg transition ring-4 ${
              currentIndex === i ? "ring-blue-400" : "ring-transparent"
            }`}
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

          <button
            onClick={nextThumb}
            disabled={carouselIndex >= videos.length - 1}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg 
  border border-blue-200 text-blue-600 rounded-full w-10 h-10 
  items-center justify-center hover:bg-blue-50 z-10 hidden md:flex
  ${carouselIndex >= videos.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            ❯
          </button>
        </div>
      </div>
    </section>
  );
}
