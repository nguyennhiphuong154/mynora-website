"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [["Bộ sưu tập", "/san-pham"], ["Câu chuyện", "/cau-chuyen-mynora"], ["Cách đặt bánh", "/huong-dan-dat-banh"], ["Liên hệ", "/lien-he"]] as const;

export function StoreNavigation() {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  return <header className="store-header"><Link className="store-wordmark" href="/" aria-label="MYNORA Bakery — Trang chủ">MYNORA <small>BAKERY</small></Link><nav className="store-desktop-nav" aria-label="Điều hướng chính">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav><div className="store-actions"><Link href="/gio-hang" aria-label="Mở giỏ hàng">Giỏ hàng</Link><Link className="store-order-link" href="/dat-banh">Đặt bánh <span aria-hidden="true">↗</span></Link><button className="store-menu-button" type="button" aria-label="Mở menu" aria-expanded={open} aria-controls="store-mobile-menu" onClick={() => setOpen(true)}><span /><span /></button></div>{open && <div className="store-mobile-layer"><button className="store-mobile-scrim" aria-label="Đóng menu" onClick={() => setOpen(false)} /><nav id="store-mobile-menu" className="store-mobile-menu" aria-label="Menu di động"><div><span>MENU</span><button type="button" ref={closeButton} aria-label="Đóng menu" onClick={() => setOpen(false)}>×</button></div>{links.map(([label, href], index) => <Link href={href} key={href} onClick={() => setOpen(false)}><small>0{index + 1}</small>{label}<b aria-hidden="true">↗</b></Link>)}<Link className="store-mobile-cart" href="/gio-hang" onClick={() => setOpen(false)}>Giỏ hàng</Link></nav></div>}</header>;
}
