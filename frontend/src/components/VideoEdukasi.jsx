import React, { useState, useEffect } from "react";

export default function VideoEdukasi() {
  const videos = [
    { id: 1, url: "https://www.youtube.com/embed/bFmGdzeEV0s" },
    { id: 2, url: "https://www.youtube.com/embed/6YOkAL8BoUU" },
    { id: 3, url: "https://www.youtube.com/embed/aVgihMIhi6c" },
    { id: 4, url: "https://www.youtube.com/embed/nP94bjzVUVY" },
    { id: 5, url: "https://www.youtube.com/embed/OkgbKHkErjs" },
    { id: 6, url: "https://www.youtube.com/embed/wygiJONYlQA" },
    { id: 7, url: "https://www.youtube.com/embed/XyBxnqWxWns" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  // === RESPONSIVE BREAKPOINT ===
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // === MAX INDEX (agar tidak keluar batas) ===
  const maxIndex = Math.max(0, videos.length - visibleCount);

  const nextThumb = () => {
    setCarouselIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const prevThumb = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // === SWIPE HANDLERS ===
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchEndX;

    // threshold minimal biar ga sensitif
    if (swipeDistance > 50) nextThumb(); // swipe kiri → next
    if (swipeDistance < -50) prevThumb(); // swipe kanan → prev
  };

  return (
    <section
      id="videoedukasi"
      className="relative w-full bg-gradient-to-r from-blue-50 to-white py-10 md:py-20"
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        {/* VIDEO UTAMA */}
        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            key={videos[currentIndex].id}
            className="w-full h-full"
            src={videos[currentIndex].url}
            title="Video Edukasi Utama"
            allowFullScreen
          ></iframe>
        </div>

        {/* CAROUSEL */}
        <div className="relative w-full max-w-5xl mx-auto mt-10 select-none">
          {/* tombol kiri */}
          <button
            onClick={prevThumb}
            disabled={carouselIndex <= 0}
            className={`absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg 
            border border-blue-200 text-blue-600 rounded-full w-10 h-10 
            items-center justify-center hover:bg-blue-50 z-10 flex
            ${carouselIndex <= 0 ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            ❮
          </button>

          <div
            className="overflow-hidden w-full max-w-5xl mx-auto px-6 md:px-12"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex gap-5 md:gap-10 transition-transform duration-500"
              style={{
                transform: `translateX(-${
                  carouselIndex * (100 / visibleCount)
                }%)`,
              }}
            >
              {videos.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`
          min-w-[calc(50%-10px)] max-w-[calc(50%-10px)]
          md:min-w-[calc((100%-80px)/3)] md:max-w-[calc((100%-80px)/3)]
          aspect-video rounded-xl overflow-hidden 
          cursor-pointer shadow-lg transition ring-4
          ${currentIndex === i ? "ring-blue-400" : "ring-transparent"}
        `}
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

          {/* tombol kanan */}
          <button
            onClick={nextThumb}
            disabled={carouselIndex >= maxIndex}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg 
            border border-blue-200 text-blue-600 rounded-full w-10 h-10 
            items-center justify-center hover:bg-blue-50 z-10 flex
            ${
              carouselIndex >= maxIndex ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            ❯
          </button>
        </div>
      </div>
    </section>
  );
}
