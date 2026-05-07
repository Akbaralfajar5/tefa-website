"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSiteSettings, fetchSiteSettings, SiteSettings, defaultSettings } from "@/lib/siteSettings";
import { getContacts, fetchContacts, ContactSettings, defaultContacts } from "@/lib/contacts";

export default function TentangPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);

  useEffect(() => {
    setSettings(getSiteSettings());
    setContacts(getContacts());
    fetchSiteSettings().then(setSettings);
    fetchContacts().then(setContacts);
  }, []);

  const featureIcons = ["📚", "🏭", "💡", "🤝"];

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary to-primary-700 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Tentang Kami
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            {settings.brandName} <span className="text-gold">{settings.brandSubtitle}</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Mengenal lebih dekat program Teaching Factory dan {settings.brandSubtitle}
          </p>
        </div>
      </section>

      {/* About TEFA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Apa itu TEFA?
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark mb-8 leading-tight">
              {settings.aboutPage.tefaHeading}
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-base">
              {settings.aboutPage.tefaParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {settings.aboutPage.features.map((feature, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary-50 transition-colors">
                <div className="text-3xl mb-3">{featureIcons[i] || "⭐"}</div>
                <h3 className="font-bold text-dark text-base mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Profile */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Profil Sekolah
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-dark mb-6">
                {settings.school.name}
              </h2>
              <p className="text-gray-500 mb-8">
                {settings.school.level}, {settings.school.district}, {settings.school.province}
              </p>
              <div className="space-y-4">
                {[
                  { label: "Nama Sekolah", value: settings.school.name },
                  { label: "Jenjang", value: settings.school.level },
                  { label: "Status", value: settings.school.status },
                  { label: "Kabupaten", value: settings.school.district },
                  { label: "Provinsi", value: settings.school.province },
                  { label: "Alamat", value: settings.school.address },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 py-3 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-sm font-medium w-32 flex-shrink-0">{item.label}</span>
                    <span className="text-dark text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Lokasi Kami
                  </h3>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={contacts.mapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Lokasi ${settings.school.name}`}
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-gray-500 text-sm">
                    {settings.school.name}, {settings.school.district}, {settings.school.province}
                  </p>
                  <a
                    href={contacts.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-700 text-sm font-medium transition-colors"
                  >
                    Buka di Google Maps
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="bg-gradient-to-br from-primary to-primary-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <span className="inline-block bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                  Visi
                </span>
                <p className="text-white/90 text-lg leading-relaxed">
                  &ldquo;{settings.visionMission.vision}&rdquo;
                </p>
              </div>
            </div>

            <div>
              <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                Misi
              </span>
              <div className="space-y-4">
                {settings.visionMission.missions.map((mission, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{i + 1}</span>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed pt-1">{mission}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-4">
            Ingin Tahu Lebih Lanjut?
          </h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Kunjungi halaman produk kami atau hubungi kami langsung untuk informasi lebih lanjut tentang program TEFA {settings.brandSubtitle}.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/produk" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
              Lihat Produk
            </Link>
            <Link href="/kontak" className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-dark font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-all">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}