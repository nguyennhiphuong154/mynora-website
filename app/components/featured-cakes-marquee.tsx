"use client";

/* eslint-disable @next/next/no-img-element -- The marquee needs native product photography sizing. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CatalogProduct } from "../lib/site-data";

const RAIL_SPEED_PX_PER_SECOND = 150;

function FeaturedCakeGroup({ cakes, duplicate = false }: { cakes: CatalogProduct[]; duplicate?: boolean }) {
  return <div className="featured-cakes-group" aria-hidden={duplicate || undefined}>
    {cakes.map((cake) => duplicate ? (
      <div className="featured-cake" key={cake.id}>
        <div className="featured-cake-image"><img src={cake.media.card.src} alt="" /></div>
        <p>{cake.displayName}</p>
      </div>
    ) : (
      <Link className="featured-cake" href={`/san-pham/${cake.slug}`} key={cake.id}>
        <div className="featured-cake-image"><img src={cake.media.card.src} alt={cake.media.card.alt} /></div>
        <p>{cake.displayName}</p>
      </Link>
    ))}
  </div>;
}

export function FeaturedCakesMarquee({ products }: { products: CatalogProduct[] }) {
  const featuredCakes = products.filter(product => product.isFeatured && product.orderStatus !== "paused");
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let previousTime = 0;
    let offset = 0;

    const move = (time: number) => {
      if (previousTime && !paused && !reduced.matches && !track.matches(":hover, :focus-within")) {
        const elapsed = Math.min((time - previousTime) / 1000, 0.08);
        const loopWidth = track.scrollWidth / 2;
        if (loopWidth > 0) {
          offset -= elapsed * RAIL_SPEED_PX_PER_SECOND;
          if (Math.abs(offset) >= loopWidth) offset += loopWidth;
          track.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
      }
      previousTime = time;
      frame = window.requestAnimationFrame(move);
    };

    frame = window.requestAnimationFrame(move);
    return () => window.cancelAnimationFrame(frame);
  }, [paused]);

  return <section id="banh-noi-bat" className="featured-cakes-section" aria-labelledby="featured-cakes-title">
    <div className="featured-cakes-heading">
      <p className="featured-cakes-label">BÁNH NỔI BẬT</p>
      <h2 id="featured-cakes-title">Những món bánh được yêu thích <em>tại MYNORA.</em></h2>
      <button className="motion-toggle" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Tiếp tục chuyển ảnh" : "Tạm dừng chuyển ảnh"}</button>
    </div>
    <div className="featured-cakes-viewport">
      <div className="featured-cakes-track" ref={trackRef} data-motion={paused ? "paused" : "running"}>
        <FeaturedCakeGroup cakes={featuredCakes} />
        <FeaturedCakeGroup cakes={featuredCakes} duplicate />
      </div>
    </div>
  </section>;
}
