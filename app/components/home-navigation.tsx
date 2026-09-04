"use client";
/* eslint-disable @next/next/no-img-element -- The fixed brand mark is a local static asset. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Bộ sưu tập", "/san-pham"],
  ["Câu chuyện", "/cau-chuyen-mynora"],
  ["Cách đặt bánh", "/huong-dan-dat-banh"],
  ["Liên hệ", "/lien-he"],
] as const;

export function HomeNavigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 32);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    return () => { document.body.style.overflow = originalOverflow; };
  }, [open]);

  return <header className={`home-header ${scrolled ? "is-scrolled" : ""}`}>
    <Link className="home-logo" href="/" aria-label="MYNORA Bakery — Trang chủ"><img className="home-logo-on-hero" src="/images/brand/mynora-logo-cream.png" alt="MYNORA Bakery" width="792" height="660" /><img className="home-logo-on-scroll" src="/images/brand/mynora-logo.png" alt="" aria-hidden="true" width="792" height="660" /></Link>
    <nav className="home-desktop-nav" aria-label="Điều hướng chính">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="home-nav-actions"><Link className="home-cart" href="/gio-hang" aria-label="Mở giỏ hàng">Giỏ hàng</Link><Link className="home-order-link" href="/dat-banh">Đặt bánh <span aria-hidden="true">↗</span></Link><button className="menu-toggle" type="button" aria-label="Mở menu" aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen(true)}><span /><span /></button></div>
    {open && <div className="mobile-menu-layer" role="presentation"><button className="mobile-menu-scrim" aria-label="Đóng menu" onClick={() => setOpen(false)} /><nav id="home-mobile-menu" ref={drawerRef} className="mobile-menu" aria-label="Menu di động" tabIndex={-1}><div className="mobile-menu-top"><span>MENU</span><button type="button" aria-label="Đóng menu" onClick={() => setOpen(false)}>×</button></div>{links.map(([label, href], index) => <Link key={href} href={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}<b aria-hidden="true">↗</b></Link>)}<div className="mobile-menu-bottom"><Link href="/gio-hang" onClick={() => setOpen(false)}>Giỏ hàng</Link><Link className="home-order-link" href="/san-pham" onClick={() => setOpen(false)}>Khám phá menu</Link></div></nav></div>}
  </header>;
}
