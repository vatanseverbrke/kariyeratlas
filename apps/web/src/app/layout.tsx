import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kariyeratlas.com"),
  title: {
    default: "KariyerAtlas | Kariyerini keşfet, fırsatları yakala",
    template: "%s | KariyerAtlas",
  },
  description:
    "KariyerAtlas; iş ilanları, kamu alımları, belediye duyuruları, özel sektör fırsatları, eğitimler, yarışmalar ve mesleki gelişim kaynaklarını tek merkezde toplayan akıllı kariyer platformudur.",
  keywords: [
    "KariyerAtlas",
    "iş ilanları",
    "kamu alımları",
    "belediye ilanları",
    "şehir plancısı ilanları",
    "peyzaj mimarı ilanları",
    "mimar ilanları",
    "CBS ilanları",
    "GIS ilanları",
    "staj ilanları",
    "meslek odası duyuruları",
    "kariyer fırsatları",
  ],
  authors: [{ name: "KariyerAtlas" }],
  creator: "KariyerAtlas",
  publisher: "KariyerAtlas",
  openGraph: {
    title: "KariyerAtlas | Kariyerini keşfet, fırsatları yakala",
    description:
      "İş ilanları, kamu alımları, özel sektör fırsatları, eğitimler, yarışmalar ve mesleki gelişim kaynakları tek platformda.",
    url: "https://kariyeratlas.com",
    siteName: "KariyerAtlas",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KariyerAtlas | Kariyerini keşfet, fırsatları yakala",
    description:
      "Kamu, özel sektör ve mesleki gelişim fırsatlarını tek merkezde keşfet.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}