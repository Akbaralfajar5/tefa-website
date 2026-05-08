import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: {
    default: "TEFA SMKN 1 Cibadak — Produk Berkualitas Teaching Factory",
    template: "%s | TEFA SMKN 1 Cibadak",
  },
  description:
    "Teaching Factory SMKN 1 Cibadak memproduksi hand sanitizer, sabun batang, dan sabun cuci piring berkualitas. Produk hasil karya siswa SMK dengan standar industri.",
  keywords: [
    "TEFA",
    "Teaching Factory",
    "SMKN 1 Cibadak",
    "hand sanitizer",
    "sabun batang",
    "sabun cuci piring",
    "produk SMK",
    "Sukabumi",
    "TEFA Cibadak",
    "produk TEFA",
    "teaching factory SMK",
    "produk siswa SMK",
    "SMKN 1 Cibadak Sukabumi",
  ],
  authors: [{ name: "TEFA SMKN 1 Cibadak" }],
  metadataBase: new URL("https://tefa-website.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TEFA SMKN 1 Cibadak — Produk Berkualitas Teaching Factory",
    description:
      "Produk berkualitas hasil Teaching Factory SMKN 1 Cibadak. Hand sanitizer, sabun batang, dan sabun cuci piring buatan siswa SMK dengan standar industri.",
    type: "website",
    locale: "id_ID",
    url: "https://tefa-website.vercel.app",
    siteName: "TEFA SMKN 1 Cibadak",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEFA SMKN 1 Cibadak — Produk Berkualitas Teaching Factory",
    description:
      "Produk berkualitas hasil Teaching Factory SMKN 1 Cibadak. Hand sanitizer, sabun batang, dan sabun cuci piring.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "PbUW68tQSNYM0IZtQZYlYiq4dtTVDEjnHxGU83h9-Ag",
  },
};

// Structured Data (JSON-LD) untuk Google Rich Results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TEFA SMKN 1 Cibadak",
  description:
    "Teaching Factory SMKN 1 Cibadak memproduksi hand sanitizer, sabun batang, dan sabun cuci piring berkualitas.",
  url: "https://tefa-website.vercel.app",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cibadak",
    addressRegion: "Sukabumi",
    addressCountry: "ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
