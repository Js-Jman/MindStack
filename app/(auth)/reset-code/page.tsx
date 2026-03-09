// app/(auth)/reset-code/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import Link from "next/link";

export default function ResetCodePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem("pwr_session")) {
      router.replace("/forgot-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const sessionToken = sessionStorage.getItem("pwr_session");
    if (!sessionToken) {
      router.replace("/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");

      sessionStorage.removeItem("pwr_session");
      sessionStorage.setItem("pwr_reset", data.resetToken);
      router.push("/reset-password");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Enter Reset Code</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code sent to your email. It expires in 15 minutes.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">6-Digit Code</label>
            <input
              className="w-full px-3 py-3 border rounded-lg text-center tracking-[0.5em] font-mono text-2xl focus:outline-none focus:ring-2 focus:ring-ring"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying…" : "Verify Code"}
          </button>
        </form>

        <p className="text-center text-sm">
          Didn&apos;t get a code?{" "}
          <Link href="/forgot-password" className="text-primary hover:underline">
            Resend
          </Link>
        </p>
      </div>
    </div>
  );
}