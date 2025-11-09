import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export default function Banner() {
  const sliderRef = useRef(null);
  const [index, setIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const autoSlideRef = useRef(null);

  const images = useMemo(
    () => [
      "/images/banner/1.png",
      "/images/banner/2.png",
      "/images/banner/3.png",
    ],
    []
  );

  // Tambahkan buffer di depan dan belakang
  const slides = useMemo(
    () => [images[images.length - 1], ...images, images[0], images[1]],
    [images]
  );

  // Preload 3 gambar ke depan dan belakang
  useEffect(() => {
    let loadedCount = 0;
    slides.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === slides.length) setLoaded(true);
      };
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
    if (transitioning) return;
    setTransitioning(true);
    setIndex((prev) => prev + 1);
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
      if (index >= slides.length - 2) {
        slider.style.transition = "none";
        setIndex(1);
        slider.style.transform = `translateX(-${getSlideWidth()}px)`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            slider.style.transition = "transform 1s ease-in-out";
          })
        );
      }
      if (index <= 0) {
        slider.style.transition = "none";
        setIndex(slides.length - 3);
        slider.style.transform = `translateX(-${
          getSlideWidth() * (slides.length - 3)
        }px)`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            slider.style.transition = "transform 1s ease-in-out";
          })
        );
      }
    };

    slider.addEventListener("transitionend", handleTransitionEnd);
    return () =>
      slider.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, slides.length, getSlideWidth]);

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
                  i + 1 === index ? "bg-blue-600" : "bg-blue-300"
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
