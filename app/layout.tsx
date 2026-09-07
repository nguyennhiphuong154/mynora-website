import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: { icon: [{ url: "/images/brand/mynora-logo.png", type: "image/png" }] },
  title: "MYNORA Bakery | Bánh làm theo đơn tại Đà Nẵng",
  description: "MYNORA Bakery — bánh tươi được làm theo đơn cho những khoảnh khắc đáng nhớ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
