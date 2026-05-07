"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { products as defaultProducts, Product } from "@/lib/products";
import {
  getContacts,
  fetchContacts,
  saveContacts,
  ContactSettings,
  defaultContacts,
} from "@/lib/contacts";
import {
  getSiteSettings,
  fetchSiteSettings,
  saveSiteSettings,
  SiteSettings,
  defaultSettings,
  getAdminPassword,
  fetchAdminPassword,
  saveAdminPassword,
} from "@/lib/siteSettings";
import { fetchBlob, updateBlob } from "@/lib/jsonblob";

interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  priceFormatted: string;
  description: string;
  longDescription: string;
  category: string;
  volume: string;
  color: string;
  image: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [productList, setProductList] = useState<AdminProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"produk" | "kontak" | "konten" | "password">("produk");

  // Contact settings state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);
  const [contactForm, setContactForm] = useState<ContactSettings>(defaultContacts);

  // Site settings state
  const [siteForm, setSiteForm] = useState<SiteSettings>(defaultSettings);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLongDescription, setFormLongDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formVolume, setFormVolume] = useState("");
  const [formColor, setFormColor] = useState("#2B4EA2");
  const [formImage, setFormImage] = useState("");

  const loadProducts = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tefa_products");
      if (stored) {
        setProductList(JSON.parse(stored));
      } else {
        const initial: AdminProduct[] = defaultProducts.map((p: Product) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          priceFormatted: p.priceFormatted,
          description: p.description,
          longDescription: p.longDescription,
          category: p.category,
          volume: p.volume || "",
          color: p.color,
          image: p.image || "",
        }));
        setProductList(initial);
        localStorage.setItem("tefa_products", JSON.stringify(initial));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("tefa_admin_auth");
      if (auth !== "true") {
        router.push("/admin");
        return;
      }
      setIsAuth(true);
      loadProducts();
      // Also fetch products from cloud
      fetchBlob<AdminProduct[]>("products", []).then((data) => {
        if (data && data.length > 0) {
          setProductList(data);
          localStorage.setItem("tefa_products", JSON.stringify(data));
        }
      });
      const loadedContacts = getContacts();
      setContacts(loadedContacts);
      setContactForm(loadedContacts);
      setSiteForm(getSiteSettings());
      // Fetch from cloud
      fetchContacts().then((c) => { setContacts(c); setContactForm(c); });
      fetchSiteSettings().then(setSiteForm);
      fetchAdminPassword(); // sync to localStorage
    }
  }, [router, loadProducts]);

  const saveProducts = (updated: AdminProduct[]) => {
    setProductList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("tefa_products", JSON.stringify(updated));
    }
    // Save to cloud
    updateBlob("products", updated);
  };

  const resetForm = () => {
    setFormName("");
    setFormPrice("");
    setFormDescription("");
    setFormLongDescription("");
    setFormCategory("");
    setFormVolume("");
    setFormColor("#2B4EA2");
    setFormImage("");
    setEditingId(null);
    setShowForm(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormDescription(product.description);
    setFormLongDescription(product.longDescription);
    setFormCategory(product.category);
    setFormVolume(product.volume);
    setFormColor(product.color);
    setFormImage(product.image || "");
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = productList.filter((p) => p.id !== id);
    saveProducts(updated);
    setDeleteConfirm(null);
    showSuccess("Produk berhasil dihapus!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(formPrice) || 0;
    const product: AdminProduct = {
      id: editingId || Date.now().toString(),
      slug: generateSlug(formName),
      name: formName,
      price,
      priceFormatted: formatPrice(price),
      description: formDescription,
      longDescription: formLongDescription,
      category: formCategory,
      volume: formVolume,
      color: formColor,
      image: formImage,
    };

    let updated: AdminProduct[];
    if (editingId) {
      updated = productList.map((p) => (p.id === editingId ? product : p));
      showSuccess("Produk berhasil diperbarui!");
    } else {
      updated = [...productList, product];
      showSuccess("Produk berhasil ditambahkan!");
    }

    saveProducts(updated);
    resetForm();
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tefa_admin_auth");
      localStorage.removeItem("tefa_admin_login_time");
    }
    router.push("/admin");
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveContacts(contactForm);
    setContacts(contactForm);
    showSuccess(ok ? "✅ Kontak berhasil disimpan ke cloud!" : "⚠️ Tersimpan lokal, gagal sync ke cloud.");
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveSiteSettings(siteForm);
    showSuccess(ok ? "✅ Konten berhasil disimpan ke cloud!" : "⚠️ Tersimpan lokal, gagal sync ke cloud.");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = getAdminPassword();
    if (currentPassword !== current) {
      showSuccess("❌ Password lama salah!");
      return;
    }
    if (newPassword.length < 4) {
      showSuccess("❌ Password baru minimal 4 karakter!");
      return;
    }
    if (newPassword !== confirmPassword) {
      showSuccess("❌ Konfirmasi password tidak cocok!");
      return;
    }
    const ok = await saveAdminPassword(newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showSuccess(ok ? "✅ Password berhasil diubah!" : "⚠️ Password diubah lokal, gagal sync ke cloud.");
  };

  if (!isAuth) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-dark">
                Dashboard Admin
              </h1>
              <p className="text-gray-500 text-sm">
                Kelola produk TEFA SMKN 1 Cibadak
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-xl transition-all"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-dark">
                  {productList.length}
                </p>
                <p className="text-gray-500 text-sm">Total Produk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-dark">
                  {Array.from(new Set(productList.map((p) => p.category))).length}
                </p>
                <p className="text-gray-500 text-sm">Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-dark">
                  {formatPrice(
                    Math.round(
                      productList.reduce((sum, p) => sum + p.price, 0) /
                        (productList.length || 1)
                    )
                  )}
                </p>
                <p className="text-gray-500 text-sm">Rata-rata Harga</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("produk")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "produk"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-dark hover:bg-gray-50"
            }`}
          >
            📦 Kelola Produk
          </button>
          <button
            onClick={() => setActiveTab("kontak")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "kontak"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-dark hover:bg-gray-50"
            }`}
          >
            📞 Kontak
          </button>
          <button
            onClick={() => setActiveTab("konten")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "konten"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-dark hover:bg-gray-50"
            }`}
          >
            ✏️ Konten
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "password"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-dark hover:bg-gray-50"
            }`}
          >
            🔒 Password
          </button>
        </div>

        {/* ===== KONTAK TAB ===== */}
        {activeTab === "kontak" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">Pengaturan Kontak</h2>
              <p className="text-gray-500 text-sm mt-1">
                Ubah nomor WhatsApp, Instagram, dan alamat yang tampil di website
              </p>
            </div>
            <form onSubmit={handleSaveContacts} className="p-6 space-y-5">
              {/* WhatsApp Section */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h3 className="font-semibold text-dark text-sm mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">
                      Nomor (format internasional)
                    </label>
                    <input
                      type="text"
                      value={contactForm.whatsappNumber}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                      placeholder="6287833586843"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">
                      Nomor (tampilan)
                    </label>
                    <input
                      type="text"
                      value={contactForm.whatsappDisplay}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, whatsappDisplay: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                      placeholder="087833586843"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">
                      Nama Kontak
                    </label>
                    <input
                      type="text"
                      value={contactForm.whatsappName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, whatsappName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                      placeholder="Akbar"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Section */}
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <h3 className="font-semibold text-dark text-sm mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </h3>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">
                    Username (tanpa @)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">@</span>
                    <input
                      type="text"
                      value={contactForm.instagram}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, instagram: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                      placeholder="smkn1cibadak"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-semibold text-dark text-sm mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Alamat
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      value={contactForm.address}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, address: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                      placeholder="Jl. Al-Muwahhiddin, Karangtengah..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">
                      Link Google Maps
                    </label>
                    <input
                      type="url"
                      value={contactForm.mapsUrl}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, mapsUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== PRODUK TAB ===== */}
        {activeTab === "produk" && (
        <>
        {/* Product List Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-dark">Daftar Produk</h2>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all hover:shadow-lg"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Produk
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark">
                    {editingId ? "Edit Produk" : "Tambah Produk Baru"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="Contoh: Hand Sanitizer 100ml"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      placeholder="15000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">
                      Volume
                    </label>
                    <input
                      type="text"
                      value={formVolume}
                      onChange={(e) => setFormVolume(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      placeholder="100ml"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="Contoh: Kesehatan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Deskripsi Singkat *
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="Deskripsi singkat produk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Deskripsi Lengkap *
                  </label>
                  <textarea
                    value={formLongDescription}
                    onChange={(e) => setFormLongDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                    placeholder="Deskripsi lengkap produk..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Gambar Produk (URL)
                  </label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="https://example.com/gambar-produk.jpg"
                  />
                  {formImage && (
                    <div className="mt-2 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Upload gambar ke Google Drive / ImgBB / Imgur, lalu paste URL-nya di sini
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Warna Placeholder
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <span className="text-gray-500 text-sm">{formColor}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-medium py-2.5 rounded-xl transition-all text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl transition-all text-sm hover:shadow-lg"
                  >
                    {editingId ? "Simpan Perubahan" : "Tambah Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">
                Hapus Produk?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Produk &ldquo;
                {productList.find((p) => p.id === deleteConfirm)?.name}
                &rdquo; akan dihapus. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-medium py-2.5 rounded-xl transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-all text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {productList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-dark text-lg mb-1">
                Belum Ada Produk
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Mulai tambahkan produk pertama Anda
              </p>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Produk
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                        Produk
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                        Kategori
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                        Harga
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productList.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: product.color }}
                            >
                              <svg
                                className="w-5 h-5 text-white"
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
                            <div>
                              <p className="font-semibold text-dark text-sm">
                                {product.name}
                              </p>
                              <p className="text-gray-400 text-xs truncate max-w-xs">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-accent text-sm">
                            {product.priceFormatted}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                              title="Edit"
                            >
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Hapus"
                            >
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {productList.map((product) => (
                  <div key={product.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {product.image ? (
                        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: product.color }}
                      >
                        <svg
                          className="w-6 h-6 text-white"
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
                        <p className="font-semibold text-dark text-sm">
                          {product.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                          <span className="font-semibold text-accent text-sm">
                            {product.priceFormatted}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500"
                        >
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        </>
        )}

        {/* ===== KONTEN TAB ===== */}
        {activeTab === "konten" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">Konten Website</h2>
              <p className="text-gray-500 text-sm mt-1">
                Edit semua teks yang tampil di website
              </p>
            </div>
            <form onSubmit={handleSaveSiteSettings} className="p-6 space-y-5">
              {/* Brand */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-dark text-sm mb-3">🏷️ Brand</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Nama Brand</label>
                    <input type="text" value={siteForm.brandName} onChange={(e) => setSiteForm({...siteForm, brandName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Subtitle</label>
                    <input type="text" value={siteForm.brandSubtitle} onChange={(e) => setSiteForm({...siteForm, brandSubtitle: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-dark mb-1">Deskripsi Brand</label>
                  <textarea value={siteForm.brandDescription} onChange={(e) => setSiteForm({...siteForm, brandDescription: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none" />
                </div>
              </div>

              {/* Hero */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-semibold text-dark text-sm mb-3">🎯 Hero (Halaman Utama)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Badge</label>
                    <input type="text" value={siteForm.hero.badge} onChange={(e) => setSiteForm({...siteForm, hero: {...siteForm.hero, badge: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Heading 1</label>
                      <input type="text" value={siteForm.hero.heading1} onChange={(e) => setSiteForm({...siteForm, hero: {...siteForm.hero, heading1: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Heading 2 (gold)</label>
                      <input type="text" value={siteForm.hero.heading2} onChange={(e) => setSiteForm({...siteForm, hero: {...siteForm.hero, heading2: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Heading 3 (pink)</label>
                      <input type="text" value={siteForm.hero.heading3} onChange={(e) => setSiteForm({...siteForm, hero: {...siteForm.hero, heading3: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Deskripsi Hero</label>
                    <textarea value={siteForm.hero.description} onChange={(e) => setSiteForm({...siteForm, hero: {...siteForm.hero, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none" />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <h3 className="font-semibold text-dark text-sm mb-3">📊 Statistik</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {siteForm.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={stat.icon} onChange={(e) => { const s = [...siteForm.stats]; s[i] = {...s[i], icon: e.target.value}; setSiteForm({...siteForm, stats: s}); }} className="w-12 px-2 py-2 border border-gray-200 rounded-lg text-center text-sm" />
                      <input type="text" value={stat.number} onChange={(e) => { const s = [...siteForm.stats]; s[i] = {...s[i], number: e.target.value}; setSiteForm({...siteForm, stats: s}); }} className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm" placeholder="3+" />
                      <input type="text" value={stat.label} onChange={(e) => { const s = [...siteForm.stats]; s[i] = {...s[i], label: e.target.value}; setSiteForm({...siteForm, stats: s}); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Label" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Visi & Misi */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h3 className="font-semibold text-dark text-sm mb-3">🎯 Visi & Misi</h3>
                <div>
                  <label className="block text-xs font-medium text-dark mb-1">Visi</label>
                  <textarea value={siteForm.visionMission.vision} onChange={(e) => setSiteForm({...siteForm, visionMission: {...siteForm.visionMission, vision: e.target.value}})} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none" />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-dark mb-1">Misi (satu per baris)</label>
                  <textarea value={siteForm.visionMission.missions.join("\n")} onChange={(e) => setSiteForm({...siteForm, visionMission: {...siteForm.visionMission, missions: e.target.value.split("\n").filter(m => m.trim())}})} rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none" />
                </div>
              </div>

              {/* Profil Sekolah */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <h3 className="font-semibold text-dark text-sm mb-3">🏫 Profil Sekolah</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Nama Sekolah</label>
                    <input type="text" value={siteForm.school.name} onChange={(e) => setSiteForm({...siteForm, school: {...siteForm.school, name: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Jenjang</label>
                    <input type="text" value={siteForm.school.level} onChange={(e) => setSiteForm({...siteForm, school: {...siteForm.school, level: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Status</label>
                    <input type="text" value={siteForm.school.status} onChange={(e) => setSiteForm({...siteForm, school: {...siteForm.school, status: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Kabupaten</label>
                    <input type="text" value={siteForm.school.district} onChange={(e) => setSiteForm({...siteForm, school: {...siteForm.school, district: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Provinsi</label>
                    <input type="text" value={siteForm.school.province} onChange={(e) => setSiteForm({...siteForm, school: {...siteForm.school, province: e.target.value}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <h3 className="font-semibold text-dark text-sm mb-3">📢 CTA (Call to Action)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Heading CTA</label>
                    <input type="text" value={siteForm.ctaHeading} onChange={(e) => setSiteForm({...siteForm, ctaHeading: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Deskripsi CTA</label>
                    <textarea value={siteForm.ctaDescription} onChange={(e) => setSiteForm({...siteForm, ctaDescription: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm hover:shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Konten
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== PASSWORD TAB ===== */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">Ganti Password</h2>
              <p className="text-gray-500 text-sm mt-1">
                Ubah password login admin panel
              </p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Password Lama</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="Masukkan password lama" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Password Baru</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="Masukkan password baru" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Konfirmasi Password Baru</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="Ulangi password baru" required />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl transition-all text-sm hover:shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Note */}
        <div className="mt-6 bg-gold/10 border border-gold/30 rounded-xl p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-dark text-sm font-medium">Catatan</p>
            <p className="text-dark/70 text-xs mt-0.5">
              Data produk dan pengaturan kontak disimpan di localStorage browser.
              Perubahan hanya berlaku di browser ini dan akan hilang jika cache
              browser dihapus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
