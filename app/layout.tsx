import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  verification: { google: "deAf_gJ7gWipvISxGpxEKMBEZoEKWfMkyc_IRpRvidM" },
  icons: { icon: [{ url: "/images/brand/mynora-logo.png", type: "image/png" }] },
  title: "MYNORA Bakery | Bánh làm theo đơn tại Đà Nẵng",
  description: "MYNORA Bakery — bánh tươi được làm theo đơn cho những khoảnh khắc đáng nhớ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}
    <Script src="https://www.googletagmanager.com/gtag/js?id=G-5GBZK9DQYX" strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-5GBZK9DQYX');
    `}</Script>
  </body></html>;
}
