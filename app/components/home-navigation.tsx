"use client";
/* eslint-disable @next/next/no-img-element -- The fixed brand mark is a local static asset. */

import Link from "next/link";
import { useEffect, useState } from "react";

import { MobileNavigation, navigationLinks as links } from "./mobile-navigation";

export function HomeNavigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 32);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);


  return <header className={`home-header ${scrolled ? "is-scrolled" : ""}`}>
    <Link className="home-logo" href="/" aria-label="MYNORA Bakery — Trang chủ"><img className="home-logo-on-hero" src="/images/brand/mynora-logo-cream.png" alt="MYNORA Bakery" width="792" height="660" /><img className="home-logo-on-scroll" src="/images/brand/mynora-logo.png" alt="" aria-hidden="true" width="792" height="660" /></Link>
    <nav className="home-desktop-nav" aria-label="Điều hướng chính">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="home-nav-actions"><Link className="home-cart" href="/gio-hang" aria-label="Mở giỏ hàng">Giỏ hàng</Link><Link className="home-order-link" href="/dat-banh">Đặt bánh <span aria-hidden="true">↗</span></Link><button className="menu-toggle" type="button" aria-label="Mở menu" aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen(true)}><span /><span /></button></div>
    {open && <MobileNavigation id="home-mobile-menu" onClose={() => setOpen(false)} />}
  </header>;
}
