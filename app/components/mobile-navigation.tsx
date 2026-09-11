"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./mobile-navigation.module.css";

export const navigationLinks = [["Bộ sưu tập", "/san-pham"], ["Câu chuyện", "/cau-chuyen-mynora"], ["Cách đặt bánh", "/huong-dan-dat-banh"], ["Liên hệ", "/lien-he"]] as const;

export function MobileNavigation({ id, onClose }: { id: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return <dialog ref={dialogRef} id={id} className={styles.drawer} aria-label="Menu di động" onCancel={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
  }}>
    <div className={styles.top}><span>MENU</span><button type="button" aria-label="Đóng menu" onClick={onClose}>×</button></div>
    <nav className={styles.links} aria-label="Điều hướng di động">{navigationLinks.map(([label, href], index) => <Link key={href} href={href} onClick={onClose}><small>0{index + 1}</small><span>{label}</span><span aria-hidden="true">↗</span></Link>)}</nav>
    <div className={styles.bottom}><Link href="/dat-banh" onClick={onClose}>Gửi yêu cầu đặt bánh <span aria-hidden="true">↗</span></Link><p>MYNORA sẽ liên hệ để xác nhận yêu cầu của bạn.</p></div>
  </dialog>;
}
