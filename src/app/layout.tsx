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
  ],
  authors: [{ name: "TEFA SMKN 1 Cibadak" }],
  openGraph: {
    title: "TEFA SMKN 1 Cibadak — Produk Berkualitas Teaching Factory",
    description:
      "Produk berkualitas hasil Teaching Factory SMKN 1 Cibadak. Hand sanitizer, sabun batang, dan sabun cuci piring.",
    type: "website",
    locale: "id_ID",
    siteName: "TEFA SMKN 1 Cibadak",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
