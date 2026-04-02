"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wond-teal.svg"
            alt="Wonderist Agency"
            className="h-8 w-auto"
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e5e0db] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-lg font-bold text-[#1a1a1a] text-center">
              Team Grid Manager
            </h1>
            <p className="text-sm text-[#1a1a1a]/40 text-center mt-1">
              Enter password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-4 py-2.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all placeholder:text-[#1a1a1a]/30"
              />

              {error && (
                <p className="text-sm text-red-500 text-center font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!password || loading}
                className="w-full py-2.5 bg-[#226666] hover:bg-[#1a5252] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-xs text-[#1a1a1a]/25 text-center mt-6">
          Wonderist Agency &middot; Internal Tool
        </p>
      </div>
    </div>
  );
}
