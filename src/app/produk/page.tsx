"use client";

import { useState, useEffect } from "react";
import { products as defaultProducts, Product } from "@/lib/products";
import { fetchBlob } from "@/lib/jsonblob";
import ProductCard from "@/components/ProductCard";

export default function ProdukPage() {
  const [productList, setProductList] = useState<Product[]>(defaultProducts);

  useEffect(() => {
    fetchBlob<Product[]>("products", defaultProducts).then((data) => {
      if (data && data.length > 0) setProductList(data);
    });
  }, []);

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
            Katalog Produk
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Produk <span className="text-gold">TEFA</span> Kami
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Temukan berbagai produk berkualitas yang diproduksi oleh
            siswa-siswi SMKN 1 Cibadak
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <p className="text-gray-500 text-sm">
              Menampilkan{" "}
              <span className="font-semibold text-dark">
                {productList.length} produk
              </span>
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Klik produk untuk detail lengkap
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {productList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-50 rounded-2xl p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: "🏭", title: "Produksi Berkualitas", desc: "Setiap produk diproduksi dengan standar kualitas tinggi di bawah pengawasan guru profesional." },
                { icon: "💰", title: "Harga Terjangkau", desc: "Produk berkualitas dengan harga yang ramah di kantong untuk semua kalangan masyarakat." },
                { icon: "📱", title: "Pemesanan Mudah", desc: "Pesan langsung melalui WhatsApp. Kami siap melayani pemesanan Anda kapan saja." },
              ].map((item, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-dark text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
