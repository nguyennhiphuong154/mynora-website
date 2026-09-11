"use client";

import Link from "next/link";
import { useState } from "react";

import { MobileNavigation, navigationLinks as links } from "./mobile-navigation";

export function StoreNavigation() {
  const [open, setOpen] = useState(false);
  return <header className="store-header"><Link className="store-wordmark" href="/" aria-label="MYNORA Bakery — Trang chủ">MYNORA <small>BAKERY</small></Link><nav className="store-desktop-nav" aria-label="Điều hướng chính">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav><div className="store-actions"><Link href="/gio-hang" aria-label="Mở giỏ hàng">Giỏ hàng</Link><Link className="store-order-link" href="/dat-banh">Đặt bánh <span aria-hidden="true">↗</span></Link><button className="store-menu-button" type="button" aria-label="Mở menu" aria-expanded={open} aria-controls="store-mobile-menu" onClick={() => setOpen(true)}><span /><span /></button></div>{open && <MobileNavigation id="store-mobile-menu" onClose={() => setOpen(false)} />}</header>;
}
