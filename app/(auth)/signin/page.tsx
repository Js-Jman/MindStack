// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function SignIn() {
//   const router = useRouter();
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");

//   // Forgot password modal state
//   const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
//   const [forgotEmail, setForgotEmail] = useState<string>("");
//   const [forgotStep, setForgotStep] = useState<"email" | "sent">("email");
//   const [forgotLoading, setForgotLoading] = useState<boolean>(false);
//   const [forgotError, setForgotError] = useState<string>("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const res = await fetch("/api/auth/signin", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();

//     if (res.ok) {
//       const { user } = data;
//       if (user.role === "INSTRUCTOR") {
//         router.push("/instructor");
//       } else {
//         router.push("/student");
//       }
//     } else {
//       alert(data.error || "Login failed");
//     }
//   };

//   const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setForgotError("");
//     setForgotLoading(true);

//     try {
//       const res = await fetch("/api/auth/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: forgotEmail }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setForgotStep("sent");
//       } else {
//         setForgotError(data.message || "Something went wrong");
//       }
//     } catch {
//       setForgotError("Something went wrong. Please try again.");
//     } finally {
//       setForgotLoading(false);
//     }
//   };

//   const handleGoToResetPage = () => {
//     setShowForgotModal(false);
//     router.push(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
//   };

//   const closeModal = () => {
//     setShowForgotModal(false);
//     setForgotEmail("");
//     setForgotStep("email");
//     setForgotError("");
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

//       <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl">

//         <form
//           onSubmit={handleSubmit}
//           className="bg-white p-8 rounded-2xl w-96"
//         >
//           <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//             Sign In
//           </h2>

//           <input
//             type="email"
//             placeholder="Email"
//             autoComplete="email"
//             className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
//             value={email}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setEmail(e.target.value)
//             }
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             autoComplete="current-password"
//             className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             value={password}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setPassword(e.target.value)
//             }
//             required
//           />

//           <div className="flex justify-end mb-4">
//             <button
//               type="button"
//               onClick={() => setShowForgotModal(true)}
//               className="text-sm text-purple-600 hover:underline"
//             >
//               Forgot password?
//             </button>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
//           >
//             Sign In
//           </button>
//         </form>
//       </div>

//       {showForgotModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

//           <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl">

//             {forgotStep === "email" ? (
//               <form
//                 onSubmit={handleForgotPassword}
//                 className="bg-white p-8 rounded-2xl w-96"
//               >
//                 <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//                   Reset Password
//                 </h2>

//                 <input
//                   type="email"
//                   placeholder="Email"
//                   className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
//                   value={forgotEmail}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                     setForgotEmail(e.target.value)
//                   }
//                   required
//                 />

//                 {forgotError && (
//                   <p className="text-red-500 text-sm mb-4">{forgotError}</p>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={forgotLoading}
//                   className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
//                 >
//                   {forgotLoading ? "Sending..." : "Send Reset Code"}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="w-full mt-3 p-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-300"
//                 >
//                   Cancel
//                 </button>
//               </form>
//             ) : (
//               <div className="bg-white p-8 rounded-2xl w-96">
//                 <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//                   Code Sent!
//                 </h2>

//                 <p className="text-center text-gray-500 mb-6">
//                   A 6-digit reset code has been sent to{" "}
//                   <span className="font-semibold text-gray-700">{forgotEmail}</span>.
//                   Check your inbox and enter it on the next page.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={handleGoToResetPage}
//                   className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
//                 >
//                   Enter Reset Code
//                 </button>

//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="w-full mt-3 p-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-300"
//                 >
//                   Back to Sign In
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// app/(auth)/signin/page.tsx
"use client";

import { useState } from "react";
import { Brain, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SigninPage() {
  const { signin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await signin(form.email, form.password);
      // signin() handles redirect based on role
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to MindStack</p>
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
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full px-3 py-2 pr-10 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end pt-0.5">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}