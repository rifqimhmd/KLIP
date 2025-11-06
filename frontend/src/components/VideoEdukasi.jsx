import React from "react";

export default function VideoEdukasi() {
  return (
    <section
      id="video-edukasi"
      className="relative w-full bg-gradient-to-r from-blue-50 to-white py-10 md:py-20"
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        {/* Video Wrapper */}
        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/jnwOBr7DtKA"
            title="Video Edukasi Klinik Patnal"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
