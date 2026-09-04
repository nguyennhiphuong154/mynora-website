"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { homeHeroSlides } from "../lib/site-data";

const SLIDE_DURATION = 2000;
const TRANSITION_DURATION = 700;
const SWIPE_THRESHOLD = 48;

type Direction = "forward" | "backward";

export function HomeHeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction>("forward");
  const [isHidden, setIsHidden] = useState(false);
  const activeIndexRef = useRef(0);
  const transitionTimerRef = useRef<number | undefined>(undefined);
  const pointerStartRef = useRef<number | null>(null);

  const goTo = useCallback((requestedIndex: number, nextDirection: Direction) => {
    const nextIndex = (requestedIndex + homeHeroSlides.length) % homeHeroSlides.length;
    const currentIndex = activeIndexRef.current;
    if (nextIndex === currentIndex) return;

    window.clearTimeout(transitionTimerRef.current);
    setDirection(nextDirection);
    setOutgoingIndex(currentIndex);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    transitionTimerRef.current = window.setTimeout(() => setOutgoingIndex(null), TRANSITION_DURATION);

  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsHidden(document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    const upcoming = homeHeroSlides[(activeIndex + 1) % homeHeroSlides.length];
    const image = new Image();
    image.src = upcoming.desktopImage;
  }, [activeIndex]);

  useEffect(() => {
    if (isHidden) return;
    const timer = window.setTimeout(() => goTo(activeIndex + 1, "forward"), SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [activeIndex, goTo, isHidden]);

  useEffect(() => () => {
    window.clearTimeout(transitionTimerRef.current);
  }, []);

  const activeSlide = homeHeroSlides[activeIndex];
  const outgoingSlide = outgoingIndex === null ? null : homeHeroSlides[outgoingIndex];

  return <section
    className="home-hero home-hero-slider"
    aria-labelledby="home-title"
    data-direction={direction}
    onPointerDown={(event) => { pointerStartRef.current = event.clientX; }}
    onPointerCancel={() => { pointerStartRef.current = null; }}
    onPointerUp={(event) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (start === null) return;
      const distance = event.clientX - start;
      if (Math.abs(distance) < SWIPE_THRESHOLD) return;
      goTo(activeIndex + (distance < 0 ? 1 : -1), distance < 0 ? "forward" : "backward");
    }}
  >
    <div className="hero-slider-media" aria-label={`Ảnh ${activeIndex + 1} trên ${homeHeroSlides.length}: ${activeSlide.name}`}>
      {outgoingSlide && <HeroSlide slide={outgoingSlide} state="outgoing" />}
      <HeroSlide slide={activeSlide} state="active" priority />
      <div className="hero-slider-copy-wash" aria-hidden="true" />
    </div>

    <div className="hero-copy-next hero-slider-copy">
      <p className="hero-kicker">BÁNH LÀM MỚI THEO ĐƠN</p>
      <h1 id="home-title"><span>Một chút ngọt ngào,</span><span className="hero-title-accent">được làm riêng</span><span>cho bạn.</span></h1>
      <p className="hero-description">MYNORA chuẩn bị từng phần bánh theo lịch đặt trước để giữ được sự tươi mới và chỉn chu.</p>
      <div className="hero-actions-next"><Link className="hero-primary" href="/san-pham">Khám phá menu <span aria-hidden="true">↗</span></Link><Link className="hero-secondary" href="/dat-banh">Đặt bánh <span aria-hidden="true">↓</span></Link></div>
      <p className="hero-slide-name" aria-live="polite">{activeSlide.name}</p>
    </div>

    <div className="hero-slider-controls" aria-label="Điều khiển bộ sưu tập bánh">
      <button type="button" className="hero-slider-arrow" aria-label="Xem bánh trước" onClick={() => goTo(activeIndex - 1, "backward")}><span aria-hidden="true">←</span></button>
      <div className="hero-slider-progress" role="tablist" aria-label="Chọn ảnh bánh">
        {homeHeroSlides.map((slide, index) => <button type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Xem ${slide.name}`} className={index === activeIndex ? "is-active" : undefined} key={slide.id} onClick={() => goTo(index, index > activeIndex ? "forward" : "backward")} />)}
      </div>
      <button type="button" className="hero-slider-arrow" aria-label="Xem bánh tiếp theo" onClick={() => goTo(activeIndex + 1, "forward")}><span aria-hidden="true">→</span></button>
    </div>
    <a className="hero-scroll" href="#menu"><span aria-hidden="true">↓</span> CUỘN ĐỂ KHÁM PHÁ</a>
  </section>;
}

function HeroSlide({ slide, state, priority = false }: { slide: typeof homeHeroSlides[number]; state: "active" | "outgoing"; priority?: boolean }) {
  return <Link className={`hero-slider-slide hero-slider-slide--${state}`} href={slide.href} aria-label={`Xem ${slide.name}`}>
    <picture>
      <source media="(max-width: 700px)" srcSet={slide.mobileImage} />
      <img src={slide.desktopImage} alt={slide.alt} sizes="100vw" fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} />
    </picture>
  </Link>;
}
