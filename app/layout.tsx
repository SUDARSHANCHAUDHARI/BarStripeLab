import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarStripeLab - Turn Barcodes Into Brand Assets",
  description: "Create artistic, scannable barcodes with custom styles and colors.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarStripeLab",
  },
  openGraph: {
    title: "BarStripeLab - Barcode Art Generator",
    description: "Transform boring barcodes into beautiful brand assets",
    type: "website",
    locale: "en_US",
    url: "https://sudarshanchaudhari.github.io/BarStripeLab",
    siteName: "BarStripeLab",
    images: [
      {
        url: "https://sudarshanchaudhari.github.io/BarStripeLab/og-image.png",
        width: 1200,
        height: 630,
        alt: "BarStripeLab - Turn barcodes into brand assets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BarStripeLab",
    description: "Turn barcodes into brand assets",
    images: ["https://sudarshanchaudhari.github.io/BarStripeLab/og-image.png"],
  },
  keywords: [
    "barcode",
    "barcode generator",
    "barcode art",
    "branding",
    "design tool",
    "EAN-13",
  ],
  authors: [{ name: "Sudarshan Chaudhari", url: "https://github.com/SUDARSHANCHAUDHARI" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
