import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SHAPES } from "@/lib/shapes";
import { SITE_URL } from "./site";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

// Self-hosted (OFL, licences next to the files) so the CSP can keep font-src 'self'.
const display = localFont({
  src: "../public/fonts/BricolageGrotesque-Bold.woff2",
  weight: "700",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: "../public/fonts/AtkinsonHyperlegibleNext-wght.woff2",
  weight: "200 800",
  variable: "--font-body",
  display: "swap",
});
const mono = localFont({
  src: [
    { path: "../public/fonts/IBMPlexMono-Regular-Latin1.woff2", weight: "400" },
    { path: "../public/fonts/IBMPlexMono-Medium-Latin1.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const TITLE = "BarStripeLab — Shape Barcode Generator";
const DESCRIPTION = `Turn EAN-13, EAN-8, UPC-A and Code 128 barcodes into ${SHAPES.length} shapes, each with a protected scan band. Free, runs in your browser, exports SVG, PDF and PNG. Optional AI styling with your own Anthropic key.`;
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
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <meta name="theme-color" content="#EDF0EA" />
        <meta name="color-scheme" content="light" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-5 py-3 font-bold text-card focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to the barcode maker
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
