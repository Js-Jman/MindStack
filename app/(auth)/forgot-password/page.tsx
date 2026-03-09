// // app/(auth)/forgot-password/page.tsx
// "use client";

// import { useState } from "react";
// import { Brain } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [genericSent, setGenericSent] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();

//       if (res.ok && data.sessionToken) {
//         // Store opaque session token — NEVER in URL
//         sessionStorage.setItem("pwr_session", data.sessionToken);
//         router.push("/reset-code");
//       } else {
//         // Show generic success message (prevent email enumeration)
//         setGenericSent(true);
//       }
//     } catch {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (genericSent) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
//           <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-2xl">
//             📬
//           </div>
//           <h2 className="text-xl font-bold">Check your inbox</h2>
//           <p className="text-sm text-muted-foreground">
//             If that email is registered, a 6-digit reset code has been sent.
//           </p>
//           <Link href="/signin" className="block text-primary text-sm hover:underline pt-2">
//             Back to sign in
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
//         <div className="flex flex-col items-center gap-2">
//           <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow">
//             <Brain className="w-7 h-7 text-primary-foreground" />
//           </div>
//           <h1 className="text-2xl font-bold">Forgot Password</h1>
//           <p className="text-sm text-muted-foreground text-center">
//             Enter your email and we&apos;ll send a 6-character reset code.
//           </p>
//         </div>

//         {error && (
//           <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-1">
//             <label className="text-xs font-medium text-muted-foreground">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               autoComplete="email"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
//           >
//             {loading ? "Sending…" : "Send Reset Code"}
//           </button>
//         </form>

//         <p className="text-center text-sm">
//           <Link href="/signin" className="text-primary hover:underline">
//             Back to sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Brain } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }

      if (data.sessionToken) {
        sessionStorage.setItem("pwr_session", data.sessionToken);
        router.push("/reset-code");
      } else {
        // User not found — show generic message (anti-enumeration)
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-xl font-bold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            If that email is registered, a 6-digit reset code has been sent.
          </p>
          <Link href="/signin" className="block text-primary text-sm hover:underline pt-2">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email and we&apos;ll send a 6-digit reset code.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending…" : "Send Reset Code"}
          </button>
        </form>

        <p className="text-center text-sm">
          <Link href="/signin" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}