"use client";

/* eslint-disable @next/next/no-img-element -- The marquee needs native product photography sizing. */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { featuredCakes } from "../lib/site-data";

const RAIL_SPEED_PX_PER_SECOND = 150;

function FeaturedCakeGroup({ duplicate = false }: { duplicate?: boolean }) {
  return <div className="featured-cakes-group" aria-hidden={duplicate || undefined}>
    {featuredCakes.map((cake) => duplicate ? (
      <div className="featured-cake" key={cake.id}>
        <div className="featured-cake-image"><img src={cake.image} alt="" /></div>
        <p>{cake.name}</p>
      </div>
    ) : (
      <Link className="featured-cake" href={cake.href} key={cake.id}>
        <div className="featured-cake-image"><img src={cake.image} alt={cake.alt} /></div>
        <p>{cake.name}</p>
      </Link>
    ))}
  </div>;
}

export function FeaturedCakesMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let previousTime = 0;
    let offset = 0;

    const move = (time: number) => {
      if (previousTime) {
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
  }, []);

  return <section id="banh-noi-bat" className="featured-cakes-section" aria-labelledby="featured-cakes-title">
    <div className="featured-cakes-heading">
      <p className="featured-cakes-label">BÁNH NỔI BẬT</p>
      <h2 id="featured-cakes-title">Những món bánh được yêu thích <em>tại MYNORA.</em></h2>
    </div>
    <div className="featured-cakes-viewport">
      <div className="featured-cakes-track" ref={trackRef} data-motion="running">
        <FeaturedCakeGroup />
        <FeaturedCakeGroup duplicate />
      </div>
    </div>
  </section>;
}
