// Cloud data helper — uses local API proxy to avoid CORS issues
// Browser → /api/data/[key] → JSONBlob.com

export type BlobKey = "products" | "contacts" | "siteSettings" | "password";

function getApiUrl(key: BlobKey): string {
  return `/api/data/${key}`;
}

// In-memory cache
const cache: Record<string, { data: unknown; ts: number }> = {};
const CACHE_TTL = 30_000; // 30 seconds

export async function fetchBlob<T>(key: BlobKey, fallback: T): Promise<T> {
  const now = Date.now();
  const cached = cache[key];
  if (cached && now - cached.ts < CACHE_TTL) {
    return cached.data as T;
  }

  try {
    const res = await fetch(getApiUrl(key), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache[key] = { data, ts: now };
    return data as T;
  } catch {
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const localKey =
        key === "products" ? "tefa_products"
        : key === "contacts" ? "tefa_contacts"
        : key === "siteSettings" ? "tefa_site_settings"
        : "tefa_admin_password";
      const stored = localStorage.getItem(localKey);
      if (stored) {
        try { return JSON.parse(stored) as T; } catch { /* */ }
      }
    }
    return fallback;
  }
}

export async function updateBlob<T>(key: BlobKey, data: T): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(key), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      cache[key] = { data, ts: Date.now() };
      // Backup to localStorage
      if (typeof window !== "undefined") {
        const localKey =
          key === "products" ? "tefa_products"
          : key === "contacts" ? "tefa_contacts"
          : key === "siteSettings" ? "tefa_site_settings"
          : "tefa_admin_password";
        localStorage.setItem(localKey, JSON.stringify(data));
      }
    }
    return res.ok;
  } catch {
    return false;
  }
}
