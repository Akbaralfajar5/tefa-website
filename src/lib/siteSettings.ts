import { fetchBlob, updateBlob } from "./jsonblob";

export interface HeroSettings {
  badge: string;
  heading1: string;
  heading2: string;
  heading3: string;
  description: string;
}

export interface StatItem {
  number: string;
  label: string;
  icon: string;
}

export interface AboutSettings {
  badge: string;
  heading: string;
  description: string;
  paragraphs: string[];
  bullets: string[];
  cardTitle: string;
  cardDescription: string;
}

export interface SchoolProfile {
  name: string;
  level: string;
  status: string;
  district: string;
  province: string;
  address: string;
}

export interface VisionMission {
  vision: string;
  missions: string[];
}

export interface SiteSettings {
  brandName: string;
  brandSubtitle: string;
  brandDescription: string;
  hero: HeroSettings;
  stats: StatItem[];
  featuredBadge: string;
  featuredHeading: string;
  featuredDescription: string;
  about: AboutSettings;
  aboutPage: {
    tefaHeading: string;
    tefaParagraphs: string[];
    features: { title: string; description: string }[];
  };
  school: SchoolProfile;
  visionMission: VisionMission;
  ctaHeading: string;
  ctaDescription: string;
}

export const defaultSettings: SiteSettings = {
  brandName: "TEFA",
  brandSubtitle: "SMKN 1 Cibadak",
  brandDescription: "Teaching Factory SMKN 1 Cibadak memproduksi produk berkualitas sebagai sarana pembelajaran kewirausahaan siswa.",
  hero: {
    badge: "Teaching Factory SMKN 1 Cibadak",
    heading1: "Produk Berkualitas",
    heading2: "Karya Siswa",
    heading3: "SMK",
    description: "Kami memproduksi hand sanitizer, sabun batang, dan sabun cuci piring berkualitas tinggi melalui program Teaching Factory SMKN 1 Cibadak.",
  },
  stats: [
    { number: "3+", label: "Produk", icon: "📦" },
    { number: "100%", label: "Buatan Siswa", icon: "🎓" },
    { number: "70%", label: "Alkohol (Sanitizer)", icon: "🧴" },
    { number: "24/7", label: "Pemesanan Online", icon: "📱" },
  ],
  featuredBadge: "Produk Unggulan",
  featuredHeading: "Produk TEFA Kami",
  featuredDescription: "Produk berkualitas yang diproduksi oleh siswa-siswi SMKN 1 Cibadak melalui program Teaching Factory",
  about: {
    badge: "Tentang Kami",
    heading: "Belajar Sambil Berproduksi",
    description: "",
    paragraphs: [
      "TEFA (Teaching Factory) SMKN 1 Cibadak adalah program pembelajaran berbasis produksi yang mengintegrasikan proses belajar mengajar dengan kegiatan produksi nyata. Melalui program ini, siswa-siswi kami memproduksi berbagai produk berkualitas yang siap dipasarkan.",
      "Setiap produk yang kami hasilkan melalui proses quality control yang ketat untuk memastikan kualitas terbaik sampai ke tangan konsumen.",
    ],
    bullets: [
      "Produk berkualitas dengan standar industri",
      "Diproduksi oleh siswa terampil di bawah bimbingan guru",
      "Harga terjangkau untuk semua kalangan",
      "Mendukung pendidikan vokasi Indonesia",
    ],
    cardTitle: "Teaching Factory",
    cardDescription: "Program pembelajaran berbasis produksi yang mengintegrasikan proses belajar mengajar dengan kegiatan produksi nyata di lingkungan sekolah.",
  },
  aboutPage: {
    tefaHeading: "Teaching Factory — Belajar Sambil Berproduksi",
    tefaParagraphs: [
      "Teaching Factory (TEFA) adalah model pembelajaran di Sekolah Menengah Kejuruan (SMK) yang mengintegrasikan proses belajar mengajar dengan kegiatan produksi barang atau jasa yang bernilai ekonomis.",
      "Di SMKN 1 Cibadak, program TEFA diimplementasikan melalui produksi berbagai produk kebersihan dan perawatan tubuh.",
      "Melalui program TEFA, siswa tidak hanya belajar teori di kelas, tetapi juga mempraktikkan langsung proses produksi, quality control, pengemasan, hingga pemasaran produk.",
    ],
    features: [
      { title: "Pendidikan", description: "Integrasi kurikulum dengan praktik produksi nyata" },
      { title: "Produksi", description: "Menghasilkan produk berkualitas standar industri" },
      { title: "Inovasi", description: "Pengembangan produk baru sesuai kebutuhan pasar" },
      { title: "Kolaborasi", description: "Kerjasama antara siswa, guru, dan industri" },
    ],
  },
  school: {
    name: "SMKN 1 Cibadak",
    level: "Sekolah Menengah Kejuruan (SMK)",
    status: "Negeri",
    district: "Sukabumi",
    province: "Jawa Barat",
    address: "Jl. Al-Muwahhiddin, Karangtengah, Kec. Cibadak, Kab. Sukabumi, Jawa Barat 43351",
  },
  visionMission: {
    vision: "Menjadi pusat Teaching Factory unggulan yang menghasilkan produk berkualitas dan lulusan SMK yang kompeten, berkarakter, serta siap bersaing di dunia industri dan kewirausahaan.",
    missions: [
      "Mengembangkan produk TEFA yang berkualitas dan berdaya saing tinggi",
      "Meningkatkan kompetensi siswa melalui pembelajaran berbasis produksi",
      "Membangun kemitraan dengan industri dan masyarakat",
      "Menerapkan standar mutu industri dalam setiap proses produksi",
      "Mengembangkan jiwa kewirausahaan siswa melalui pengalaman bisnis nyata",
    ],
  },
  ctaHeading: "Tertarik dengan Produk Kami?",
  ctaDescription: "Hubungi kami melalui WhatsApp untuk pemesanan atau informasi lebih lanjut tentang produk TEFA SMKN 1 Cibadak.",
};

// Sync version for initial render
export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSettings;
  const stored = localStorage.getItem("tefa_site_settings");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return {
        ...defaultSettings,
        ...data,
        hero: { ...defaultSettings.hero, ...(data.hero || {}) },
        stats: data.stats || defaultSettings.stats,
        about: { ...defaultSettings.about, ...(data.about || {}) },
        aboutPage: {
          ...defaultSettings.aboutPage,
          ...(data.aboutPage || {}),
          features: data.aboutPage?.features || defaultSettings.aboutPage.features,
          tefaParagraphs: data.aboutPage?.tefaParagraphs || defaultSettings.aboutPage.tefaParagraphs,
        },
        school: { ...defaultSettings.school, ...(data.school || {}) },
        visionMission: {
          ...defaultSettings.visionMission,
          ...(data.visionMission || {}),
          missions: data.visionMission?.missions || defaultSettings.visionMission.missions,
        },
      };
    } catch { /* */ }
  }
  return defaultSettings;
}

// Async version that fetches from cloud
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const data = await fetchBlob<Partial<SiteSettings>>("siteSettings", {});
  if (typeof window !== "undefined" && Object.keys(data).length > 0) {
    localStorage.setItem("tefa_site_settings", JSON.stringify(data));
  }
  // Deep merge: spread top-level and nested objects
  return {
    ...defaultSettings,
    ...data,
    hero: { ...defaultSettings.hero, ...(data.hero || {}) },
    stats: data.stats || defaultSettings.stats,
    about: { ...defaultSettings.about, ...(data.about || {}) },
    aboutPage: {
      ...defaultSettings.aboutPage,
      ...(data.aboutPage || {}),
      features: data.aboutPage?.features || defaultSettings.aboutPage.features,
      tefaParagraphs: data.aboutPage?.tefaParagraphs || defaultSettings.aboutPage.tefaParagraphs,
    },
    school: { ...defaultSettings.school, ...(data.school || {}) },
    visionMission: {
      ...defaultSettings.visionMission,
      ...(data.visionMission || {}),
      missions: data.visionMission?.missions || defaultSettings.visionMission.missions,
    },
  };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  if (typeof window !== "undefined") {
    localStorage.setItem("tefa_site_settings", JSON.stringify(settings));
  }
  return updateBlob("siteSettings", settings);
}

// Admin password
export function getAdminPassword(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tefa_admin_password") || "";
}

export async function fetchAdminPassword(): Promise<string> {
  const data = await fetchBlob<{ password: string }>("password", { password: "" });
  if (typeof window !== "undefined" && data.password) {
    localStorage.setItem("tefa_admin_password", data.password);
  }
  return data.password || "";
}

export async function saveAdminPassword(password: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    localStorage.setItem("tefa_admin_password", password);
  }
  return updateBlob("password", { password });
}