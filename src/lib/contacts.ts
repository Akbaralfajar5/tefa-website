import { fetchBlob, updateBlob } from "./jsonblob";

export interface ContactSettings {
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappName: string;
  instagram: string;
  address: string;
  mapsUrl: string;
  mapsEmbed: string;
}

export const defaultContacts: ContactSettings = {
  whatsappNumber: "6287833586843",
  whatsappDisplay: "087833586843",
  whatsappName: "Akbar",
  instagram: "smkn1cibadak",
  address: "Jl. Al-Muwahhiddin, Karangtengah, Kec. Cibadak, Kab. Sukabumi, Jawa Barat 43351",
  mapsUrl: "https://maps.app.goo.gl/vcMCcacCQ8jM4Cw46",
  mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5!2d106.85!3d-6.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68352!2sSMKN+1+Cibadak!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid",
};

// Sync version for initial render (reads localStorage)
export function getContacts(): ContactSettings {
  if (typeof window === "undefined") return defaultContacts;
  const stored = localStorage.getItem("tefa_contacts");
  if (stored) {
    try { return { ...defaultContacts, ...JSON.parse(stored) }; } catch { /* */ }
  }
  return defaultContacts;
}

// Async version that fetches from cloud
export async function fetchContacts(): Promise<ContactSettings> {
  const data = await fetchBlob<ContactSettings>("contacts", defaultContacts);
  // Sync to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("tefa_contacts", JSON.stringify(data));
  }
  return { ...defaultContacts, ...data };
}

export async function saveContacts(contacts: ContactSettings): Promise<boolean> {
  // Save to localStorage immediately
  if (typeof window !== "undefined") {
    localStorage.setItem("tefa_contacts", JSON.stringify(contacts));
  }
  return updateBlob("contacts", contacts);
}

export function formatWhatsAppLink(productName: string, contacts?: ContactSettings): string {
  const c = contacts || getContacts();
  const message = encodeURIComponent(`Halo, saya ingin memesan ${productName}. Mohon informasi lebih lanjut.`);
  return `https://wa.me/${c.whatsappNumber}?text=${message}`;
}

export function formatWhatsAppLinkGeneral(contacts?: ContactSettings): string {
  const c = contacts || getContacts();
  const message = encodeURIComponent("Halo, saya ingin bertanya tentang produk TEFA SMKN 1 Cibadak. Mohon informasi lebih lanjut.");
  return `https://wa.me/${c.whatsappNumber}?text=${message}`;
}