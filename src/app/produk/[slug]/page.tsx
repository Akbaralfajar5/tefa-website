import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  products,
  getProductBySlug,
  formatWhatsAppLink,
} from "@/lib/products";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };

  return {
    title: product.name,
    description: product.longDescription.slice(0, 160),
    openGraph: {
      title: `${product.name} — TEFA SMKN 1 Cibadak`,
      description: product.description,
      type: "website",
    },
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const otherProducts = products.filter((p) => p.id !== product.id);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href="/produk"
              className="hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-dark font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Product Image */}
            <div>
              <div
                className="rounded-3xl overflow-hidden aspect-square flex items-center justify-center relative"
                style={{ backgroundColor: product.image ? 'transparent' : product.color + "12" }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                <>
                <div
                  className="w-40 h-40 md:w-52 md:h-52 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{ backgroundColor: product.color }}
                >
                  <svg
                    className="w-20 h-20 md:w-24 md:h-24 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                {/* Placeholder text */}
                <span className="absolute bottom-4 right-4 bg-black/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  Foto produk segera hadir
                </span>
                </>
                )}
                {/* Category badge */}
                <span className="absolute top-4 left-4 bg-green text-white text-sm font-medium px-4 py-1.5 rounded-full">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-dark mb-2">
                  {product.name}
                </h1>
                {product.volume && (
                  <p className="text-gray-500 text-base">
                    Volume: {product.volume}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-accent">
                  {product.priceFormatted}
                </span>
              </div>

              <p className="text-gray-600 text-base leading-relaxed mb-8">
                {product.longDescription}
              </p>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="font-bold text-dark text-lg mb-4">
                  Keunggulan Produk
                </h3>
                <div className="space-y-3">
                  {product.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-green"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="font-bold text-dark text-lg mb-4">Komposisi</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Order Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={formatWhatsAppLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-xl text-base"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Pesan via WhatsApp
                </a>
                <Link
                  href="/produk"
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-dark font-semibold px-6 py-4 rounded-xl transition-all duration-200 text-base"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Kembali
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Products */}
      {otherProducts.length > 0 && (
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-8">
              Produk Lainnya
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {otherProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md card-hover border border-gray-100"
                >
                  <Link
                    href={`/produk/${p.slug}`}
                    className="flex items-center gap-4 p-5"
                  >
                    {p.image ? (
                      <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-dark text-base hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-gray-500 text-sm truncate">
                        {p.description}
                      </p>
                      <span className="text-accent font-bold text-base mt-1 inline-block">
                        {p.priceFormatted}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
