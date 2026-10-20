import type { Metadata } from "next";
import "./globals.css";
import { SHAPES } from "@/lib/shapes";
import { SITE_URL } from "./site";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const TITLE = "BarStripeLab — Shape Barcode Generator";
const DESCRIPTION = `Turn EAN-13, EAN-8, UPC-A and Code 128 barcodes into ${SHAPES.length} shapes that still scan. Free, runs in your browser, exports SVG and PNG. Optional AI styling with your own Anthropic key.`;
const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "BarStripeLab: barcodes shaped as a coffee cup, a cat, a palm tree and a heart",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
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
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BarStripeLab",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  keywords: [
    "barcode",
    "barcode generator",
    "barcode art",
    "shape barcode",
    "EAN-13",
    "EAN-8",
    "UPC-A",
    "Code 128",
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
        <meta name="theme-color" content="#f5f5f7" />
        <meta name="color-scheme" content="light" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
