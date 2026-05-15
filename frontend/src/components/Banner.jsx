import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import api from "../lib/axios";
import { resolvePublicStorageUrl } from "../lib/storageUrl";

const TRANSITION_MS = 1000;
const TRANSITION_SAFETY_MS = TRANSITION_MS + 350;

function normalizeBannersPayload(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.banners)) return data.banners;
  return [];
}

function toBannerSrc(item) {
  if (!item || typeof item !== "object") return null;
  const raw = item.image_url ?? item.imageUrl;
  if (!raw || typeof raw !== "string") return null;
  const resolved = resolvePublicStorageUrl(raw.trim());
  if (!resolved) return null;
  const sep = resolved.includes("?") ? "&" : "?";
  return `${resolved}${sep}_t=${Date.now()}`;
}

export default function Banner() {
  const sliderRef = useRef(null);
  const [index, setIndex] = useState(1);
  const [fetchState, setFetchState] = useState("loading"); // loading | ready | empty
  const [apiBanners, setApiBanners] = useState([]);
  const autoSlideRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const transitioningRef = useRef(false);
  const layoutOnceRef = useRef(false);
  const indexRef = useRef(1);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/banners")
      .then((res) => {
        if (cancelled) return;
        const list = normalizeBannersPayload(res?.data);
        const urls = list
          .map(toBannerSrc)
          .filter((u) => typeof u === "string" && u.length > 0);
        setApiBanners(urls);
        setFetchState(urls.length > 0 ? "ready" : "empty");
      })
      .catch((err) => {
        console.error("Banner fetch error:", err);
        if (!cancelled) {
          setApiBanners([]);
          setFetchState("empty");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const images = apiBanners;

  const slides = useMemo(() => {
    if (images.length === 0) return [];
    if (images.length === 1) return [images[0], images[0], images[0]];
    const clones =
      images.length >= 2
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
    if (images.length === 0) return;
    setIndex(1);
    layoutOnceRef.current = false;
  }, [images.join("|")]);

  const getSlideWidth = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return 0;
    const slide = slider.children[0];
    if (!slide) return 0;
    const style = window.getComputedStyle(slider);
    const gap = window.innerWidth >= 768 ? parseInt(style.gap, 10) || 0 : 0;
    return slide.offsetWidth + gap;
  }, []);

  const moveToSlide = useCallback(
    (i, withTransition = true) => {
      const slider = sliderRef.current;
      if (!slider) return;
      slider.style.transition = withTransition
        ? `transform ${TRANSITION_MS}ms ease-in-out`
        : "none";
      const w = getSlideWidth();
      slider.style.transform = `translateX(-${w * i}px)`;
    },
    [getSlideWidth]
  );

  const beginSlideTransition = useCallback(() => {
    if (transitioningRef.current) return false;
    transitioningRef.current = true;
    clearSafetyTimer();
    safetyTimerRef.current = setTimeout(() => {
      if (transitioningRef.current) {
        transitioningRef.current = false;
      }
    }, TRANSITION_SAFETY_MS);
    return true;
  }, [clearSafetyTimer]);

  const endSlideTransition = useCallback(() => {
    clearSafetyTimer();
    transitioningRef.current = false;
  }, [clearSafetyTimer]);

  const nextSlide = useCallback(() => {
    if (!beginSlideTransition()) return;
    setIndex((prev) => prev + 1);
  }, [beginSlideTransition]);

  const prevSlide = useCallback(() => {
    if (!beginSlideTransition()) return;
    setIndex((prev) => prev - 1);
  }, [beginSlideTransition]);

  const startAutoSlide = useCallback(() => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => nextSlide(), 4000);
  }, [nextSlide]);

  const goToSlide = useCallback(
    (i) => {
      clearSafetyTimer();
      transitioningRef.current = false;
      setIndex(i);
      startAutoSlide();
    },
    [clearSafetyTimer, startAutoSlide]
  );

  useEffect(() => {
    if (fetchState !== "ready") return;
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, [fetchState, startAutoSlide]);

  const handleTransitionEnd = useCallback(
    (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "transform") return;

      endSlideTransition();

      const slider = sliderRef.current;
      if (!slider || images.length === 0) return;

      setIndex((current) => {
        if (current > images.length) {
          slider.style.transition = "none";
          const w = getSlideWidth();
          slider.style.transform = `translateX(-${w}px)`;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              slider.style.transition = `transform ${TRANSITION_MS}ms ease-in-out`;
            })
          );
          return 1;
        }
        if (current < 1) {
          slider.style.transition = "none";
          const w = getSlideWidth();
          slider.style.transform = `translateX(-${w * images.length}px)`;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              slider.style.transition = `transform ${TRANSITION_MS}ms ease-in-out`;
            })
          );
          return images.length;
        }
        return current;
      });
    },
    [endSlideTransition, getSlideWidth, images.length]
  );

  useEffect(() => {
    if (fetchState !== "ready") return;
    moveToSlide(index, true);
  }, [index, moveToSlide, fetchState]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || fetchState !== "ready") return;
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
  }, [nextSlide, prevSlide, startAutoSlide, fetchState]);

  useEffect(() => {
    const handleResize = () => moveToSlide(index, false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [index, moveToSlide]);

  useEffect(() => () => clearSafetyTimer(), [clearSafetyTimer]);

  if (fetchState === "loading") {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-gray-500">Memuat banner…</p>
        </div>
      </section>
    );
  }

  if (fetchState === "empty") {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="flex flex-col justify-center items-center h-[220px] md:h-[280px] px-6 text-center bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
          <p className="text-slate-700 font-medium">Belum ada banner aktif</p>
          <p className="text-slate-500 text-sm mt-2 max-w-md">
            Halaman ini hanya menampilkan banner berstatus <strong>Aktif</strong>. Di admin, setelah upload gambar, tekan{" "}
            <strong>Aktifkan</strong> pada slot tersebut.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div
        ref={sliderRef}
        id="banner-slider"
        onTransitionEnd={handleTransitionEnd}
        className="flex md:gap-6 md:px-6 md:pt-6"
        style={{ willChange: "transform" }}
      >
        {slides.map((src, i) => (
          <img
            key={`${i}-${src}`}
            src={src}
            alt={`Banner ${i + 1}`}
            loading="eager"
            decoding="async"
            onLoad={() => {
              if (layoutOnceRef.current) return;
              layoutOnceRef.current = true;
              requestAnimationFrame(() => moveToSlide(indexRef.current, false));
            }}
            className="banner-slide flex-shrink-0 w-full md:w-[37%] object-cover md:rounded-xl max-h-[260px] md:max-h-[340px]"
          />
        ))}
      </div>

      <div className="relative mt-4 flex justify-center space-x-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`dot size-2 rounded-full ${
              i === activeDotIndex ? "bg-blue-600" : "bg-blue-300"
            }`}
            onClick={() => goToSlide(i + 1)}
          />
        ))}
      </div>
    </section>
  );
}
