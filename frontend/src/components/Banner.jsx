import { useEffect, useRef, useState, useCallback, useMemo } from "react";

const STATIC_IMAGES = [
  "/images/banner/1.png",
  "/images/banner/2.png",
  "/images/banner/3.png",
];

// VITE_API_URL: "/api" (Vite proxy) atau "http://localhost:8000/api" (absolute)
const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function Banner() {
  const sliderRef = useRef(null);
  const [index, setIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const autoSlideRef = useRef(null);
  const [apiBanners, setApiBanners] = useState(null); // null = not yet fetched

  // Fetch banners from API
  useEffect(() => {
    fetch(`${API_URL}/banners`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Konversi ke relative path agar lewat Vite proxy (hindari CORS)
          const toRelative = (url) => {
            if (!url) return url;
            if (url.startsWith('http://localhost:8000/storage/')) {
              return url.replace('http://localhost:8000/storage/', '/storage/');
            }
            if (url.startsWith('http://127.0.0.1:8000/storage/')) {
              return url.replace('http://127.0.0.1:8000/storage/', '/storage/');
            }
            return url; // sudah relative
          };
          // Add cache-busting timestamp to force reload after update
          const bustCache = (url) => {
            if (!url) return url;
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}_t=${Date.now()}`;
          };
          const banners = data.map((b) => bustCache(toRelative(b.image_url)));
            setApiBanners(banners);
        } else {
                    setApiBanners([]); // empty → use static
        }
      })
      .catch((err) => {
        console.error('Banner fetch error:', err);
        setApiBanners([]); // error → use static
      });
  }, []);

  const images = useMemo(() => {
    if (apiBanners === null) return []; // still loading
    return apiBanners.length > 0 ? apiBanners : STATIC_IMAGES;
  }, [apiBanners]);

  const slides = useMemo(() => {
    if (images.length === 0) return [];
    if (images.length === 1) return [images[0], images[0], images[0]];
    // For infinite loop: clone last before, all images, clone first two after
    const clones = images.length >= 2
      ? [images[images.length - 1], ...images, images[0], images[1]]
      : [images[images.length - 1], ...images, images[0]];
    return clones;
  }, [images]);

  const activeDotIndex = useMemo(() => {
    if (images.length === 0) return 0;
    if (index <= 0) return images.length - 1;
    if (index > images.length) return 0;
    return index - 1;
  }, [images.length, index]);

  useEffect(() => {
    if (images.length > 0) {
      setIndex(1);
    }
  }, [images.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    let loadedCount = 0;
    const validSlides = slides.filter(Boolean);
    if (validSlides.length === 0) {
      setLoaded(true);
      return;
    }
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= validSlides.length) setLoaded(true);
    };
    validSlides.forEach((src) => {
      const img = new Image();
      img.onload = checkDone;
      img.onerror = checkDone; // ← penting! jika gambar gagal load, tetap lanjut
      img.src = src;
    });
  }, [slides]);

  const getSlideWidth = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return 0;
    const slide = slider.children[0];
    const style = window.getComputedStyle(slider);
    const gap = window.innerWidth >= 768 ? parseInt(style.gap) || 0 : 0;
    return slide.offsetWidth + gap;
  }, []);

  const moveToSlide = useCallback(
    (i, withTransition = true) => {
      const slider = sliderRef.current;
      if (!slider) return;
      slider.style.transition = withTransition
        ? "transform 1s ease-in-out"
        : "none";
      slider.style.transform = `translateX(-${getSlideWidth() * i}px)`;
    },
    [getSlideWidth]
  );

  const nextSlide = useCallback(() => {
    if (transitioning) {
      // Safety: if transitioning stuck for more than 6 seconds, force reset
      return;
    }
    setTransitioning(true);
    setIndex((prev) => {
      const next = prev + 1;
      // Safety timeout: reset transitioning flag after 6 seconds if transitionend doesn't fire
      setTimeout(() => {
        setTransitioning((current) => {
          if (current) {
            console.warn('Banner: transitioning timeout - forcing reset');
            return false;
          }
          return current;
        });
      }, 6000);
      return next;
    });
  }, [transitioning]);

  const prevSlide = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setIndex((prev) => prev - 1);
  }, [transitioning]);

  const startAutoSlide = useCallback(() => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => nextSlide(), 4000);
  }, [nextSlide]);

  const goToSlide = useCallback(
    (i) => {
      setIndex(i);
      startAutoSlide();
    },
    [startAutoSlide]
  );

  useEffect(() => {
    if (!loaded) return;
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, [loaded, startAutoSlide]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleTransitionEnd = () => {
      setTransitioning(false);
      if (index > images.length) {
        slider.style.transition = "none";
        setIndex(1);
        slider.style.transform = `translateX(-${getSlideWidth()}px)`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            slider.style.transition = "transform 1s ease-in-out";
          })
        );
      } else if (index < 1) {
        slider.style.transition = "none";
        setIndex(images.length);
        slider.style.transform = `translateX(-${getSlideWidth() * images.length}px)`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            slider.style.transition = "transform 1s ease-in-out";
          })
        );
      }
    };

    slider.addEventListener("transitionend", handleTransitionEnd);
    
    // Fallback: reset transitioning after 2.5s if transitionend doesn't fire
    const fallbackTimeout = setTimeout(() => {
      if (transitioning) {
        setTransitioning(false);
      }
    }, 2500);
    
    return () => {
      slider.removeEventListener("transitionend", handleTransitionEnd);
      clearTimeout(fallbackTimeout);
    };
  }, [getSlideWidth, images.length, index, transitioning]);

  useEffect(() => {
    moveToSlide(index, true);
  }, [index, moveToSlide]);

  // Swipe
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    let startX = 0;
    let moveX = 0;
    let isSwiping = false;

    const handleStart = (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      clearInterval(autoSlideRef.current);
    };

    const handleMove = (e) => {
      if (!isSwiping) return;
      moveX = e.touches[0].clientX;
    };

    const handleEnd = () => {
      if (!isSwiping) return;
      const diff = moveX - startX;
      if (Math.abs(diff) > 50) diff < 0 ? nextSlide() : prevSlide();
      isSwiping = false;
      startAutoSlide();
    };

    slider.addEventListener("touchstart", handleStart);
    slider.addEventListener("touchmove", handleMove);
    slider.addEventListener("touchend", handleEnd);

    return () => {
      slider.removeEventListener("touchstart", handleStart);
      slider.removeEventListener("touchmove", handleMove);
      slider.removeEventListener("touchend", handleEnd);
    };
  }, [nextSlide, prevSlide, startAutoSlide]);

  // Resize
  useEffect(() => {
    const handleResize = () => moveToSlide(index, false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [index, moveToSlide]);

  return (
    <section className="relative w-full overflow-hidden">
      {!loaded ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-gray-500">Memuat banner...</p>
        </div>
      ) : (
        <>
          <div
            ref={sliderRef}
            id="banner-slider"
            className="flex transition-transform ease-in-out duration-[1000ms] md:gap-6 md:px-6 md:pt-6"
          >
            {slides.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Banner ${i}`}
                loading="eager"
                decoding="async"
                className="banner-slide flex-shrink-0 w-full md:w-[37%] object-cover md:rounded-xl max-h-[260px] md:max-h-[340px]"
              />
            ))}
          </div>

          <div className="relative mt-4 flex justify-center space-x-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                className={`dot size-2 rounded-full ${
                  i === activeDotIndex ? "bg-blue-600" : "bg-blue-300"
                }`}
                onClick={() => goToSlide(i + 1)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
