"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminPassword } from "@/lib/siteSettings";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 menit

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cloudPassword, setCloudPassword] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Load rate limit state from localStorage
  useEffect(() => {
    const storedAttempts = parseInt(localStorage.getItem("tefa_login_attempts") || "0");
    const storedLocked = parseInt(localStorage.getItem("tefa_login_locked_until") || "0");
    setAttempts(storedAttempts);
    if (storedLocked > Date.now()) {
      setLockedUntil(storedLocked);
    } else if (storedLocked && storedLocked <= Date.now()) {
      localStorage.removeItem("tefa_login_attempts");
      localStorage.removeItem("tefa_login_locked_until");
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
        localStorage.removeItem("tefa_login_attempts");
        localStorage.removeItem("tefa_login_locked_until");
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  // Fetch password from cloud on page load
  useEffect(() => {
    fetchAdminPassword().then((pw) => {
      setCloudPassword(pw);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockedUntil && lockedUntil > Date.now()) return;

    setLoading(true);
    setError("");

    let savedPassword = cloudPassword;
    if (!savedPassword) {
      try {
        savedPassword = await fetchAdminPassword();
      } catch {
        savedPassword = typeof window !== "undefined"
          ? localStorage.getItem("tefa_admin_password") || ""
          : "";
      }
    }

    setTimeout(() => {
      if (username === "admin" && password === savedPassword) {
        localStorage.removeItem("tefa_login_attempts");
        localStorage.removeItem("tefa_login_locked_until");
        localStorage.setItem("tefa_admin_auth", "true");
        localStorage.setItem("tefa_admin_login_time", Date.now().toString());
        router.push("/admin/dashboard");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem("tefa_login_attempts", newAttempts.toString());

        if (newAttempts >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_DURATION;
          setLockedUntil(lockUntil);
          localStorage.setItem("tefa_login_locked_until", lockUntil.toString());
          setError("Terlalu banyak percobaan. Coba lagi dalam 5 menit.");
        } else {
          setError(`Username atau password salah! (${newAttempts}/${MAX_ATTEMPTS} percobaan)`);
        }
        setLoading(false);
      }
    }, 500);
  };

  const isLocked = lockedUntil !== null && lockedUntil > Date.now();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-dark">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">TEFA SMKN 1 Cibadak</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {isLocked && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Akun terkunci. Coba lagi dalam {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Masukkan username"
                required
                disabled={isLocked}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Masukkan password"
                required
                disabled={isLocked}
              />
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-primary hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : isLocked ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Terkunci
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Halaman ini hanya untuk administrator TEFA SMKN 1 Cibadak
        </p>
      </div>
    </div>
  );
}
