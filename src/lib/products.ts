export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  priceFormatted: string;
  description: string;
  longDescription: string;
  category: string;
  volume?: string;
  ingredients: string[];
  benefits: string[];
  color: string; // placeholder color
  image?: string; // URL gambar produk
}

export const products: Product[] = [
  {
    id: "1",
    slug: "hand-sanitizer-100ml",
    name: "Hand Sanitizer 100ml",
    price: 15000,
    priceFormatted: "Rp 15.000",
    description: "Pembersih tangan berbasis alkohol 70%",
    longDescription:
      "Hand Sanitizer produksi TEFA SMKN 1 Cibadak dengan kandungan alkohol 70% yang efektif membunuh kuman dan bakteri. Dilengkapi dengan pelembab alami agar tangan tetap lembut setelah penggunaan. Ukuran 100ml yang praktis dan mudah dibawa ke mana saja. Produk ini diproduksi oleh siswa-siswi SMKN 1 Cibadak di bawah bimbingan guru profesional dengan standar kualitas yang terjaga.",
    category: "Kesehatan",
    volume: "100ml",
    ingredients: [
      "Alkohol 70%",
      "Gliserin",
      "Aloe Vera Extract",
      "Aqua",
      "Parfum",
    ],
    benefits: [
      "Membunuh 99.9% kuman dan bakteri",
      "Cepat kering dan tidak lengket",
      "Melembabkan tangan",
      "Ukuran praktis mudah dibawa",
      "Aroma segar dan menyenangkan",
    ],
    color: "#2B4EA2",
  },
  {
    id: "2",
    slug: "sabun-batang",
    name: "Sabun Batang",
    price: 10000,
    priceFormatted: "Rp 10.000",
    description: "Sabun mandi padat berkualitas",
    longDescription:
      "Sabun batang berkualitas tinggi produksi TEFA SMKN 1 Cibadak. Diformulasikan dengan bahan-bahan pilihan yang lembut di kulit namun efektif membersihkan. Mengandung pelembab alami yang menjaga kelembutan kulit setelah mandi. Cocok untuk seluruh anggota keluarga. Diproduksi dengan proses yang higienis oleh siswa-siswi terampil SMKN 1 Cibadak.",
    category: "Perawatan Tubuh",
    ingredients: [
      "Sodium Palmate",
      "Sodium Palm Kernelate",
      "Aqua",
      "Glycerin",
      "Coconut Oil",
      "Parfum",
    ],
    benefits: [
      "Membersihkan kulit secara menyeluruh",
      "Melembabkan dan melembutkan kulit",
      "Aroma wangi tahan lama",
      "Cocok untuk semua jenis kulit",
      "Busa melimpah dan lembut",
    ],
    color: "#2E8B3A",
  },
  {
    id: "3",
    slug: "sabun-cuci-piring-500ml",
    name: "Sabun Cuci Piring 500ml",
    price: 12000,
    priceFormatted: "Rp 12.000",
    description: "Cairan pencuci piring efektif",
    longDescription:
      "Sabun cuci piring cair produksi TEFA SMKN 1 Cibadak dengan formula khusus yang efektif mengangkat lemak dan sisa makanan membandel. Menghasilkan busa melimpah yang mampu membersihkan peralatan dapur hingga bersih kesat. Lembut di tangan namun kuat melawan noda. Tersedia dalam kemasan 500ml yang ekonomis. Produk unggulan Teaching Factory SMKN 1 Cibadak.",
    category: "Kebersihan Rumah",
    volume: "500ml",
    ingredients: [
      "Surfaktan",
      "Sodium Laureth Sulfate",
      "Aqua",
      "Pengawet",
      "Pewarna makanan",
      "Parfum",
    ],
    benefits: [
      "Efektif mengangkat lemak membandel",
      "Busa melimpah dan tahan lama",
      "Lembut di tangan",
      "Aroma segar dan bersih",
      "Kemasan ekonomis 500ml",
    ],
    color: "#E91E7B",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllProducts(): Product[] {
  return products;
}

export {
  formatWhatsAppLink,
  formatWhatsAppLinkGeneral,
} from "./contacts";
