"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSiteSettings, fetchSiteSettings } from "@/lib/siteSettings";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [brandName, setBrandName] = useState("TEFA");
  const [brandSubtitle, setBrandSubtitle] = useState("SMKN 1 Cibadak");

  useEffect(() => {
    const s = getSiteSettings();
    setBrandName(s.brandName);
    setBrandSubtitle(s.brandSubtitle);
    fetchSiteSettings().then((s) => {
      setBrandName(s.brandName);
      setBrandSubtitle(s.brandSubtitle);
    });
  }, []);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/produk", label: "Produk" },
    { href: "/tentang", label: "Tentang" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <nav className="bg-primary sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-primary font-extrabold text-sm md:text-base">
                {brandName.substring(0, 2)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base md:text-lg leading-tight">
                {brandName}
              </span>
              <span className="text-primary-200 text-xs md:text-sm leading-tight">
                {brandSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="ml-2 text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border border-white/20"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary-600 border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-sm font-medium transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-xs font-medium transition-all border border-white/20 text-center mt-2"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
