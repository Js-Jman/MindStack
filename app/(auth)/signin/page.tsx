"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotStep, setForgotStep] = useState<"email" | "sent">("email");
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful");
    } else {
      alert(data.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setForgotStep("sent");
      } else {
        setForgotError(data.message || "Something went wrong");
      }
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoToResetPage = () => {
    setShowForgotModal(false);
    router.push(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
  };

  const closeModal = () => {
    setShowForgotModal(false);
    setForgotEmail("");
    setForgotStep("email");
    setForgotError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl">

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Sign In
          </h2>

          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
          />

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-purple-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
          >
            Sign In
          </button>
        </form>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl">

            {forgotStep === "email" ? (
              <form
                onSubmit={handleForgotPassword}
                className="bg-white p-8 rounded-2xl w-96"
              >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Reset Password
                </h2>

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  value={forgotEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForgotEmail(e.target.value)
                  }
                  required
                />

                {forgotError && (
                  <p className="text-red-500 text-sm mb-4">{forgotError}</p>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Code"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full mt-3 p-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="bg-white p-8 rounded-2xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Code Sent!
                </h2>

                <p className="text-center text-gray-500 mb-6">
                  A 6-digit reset code has been sent to{" "}
                  <span className="font-semibold text-gray-700">{forgotEmail}</span>.
                  Check your inbox and enter it on the next page.
                </p>

                <button
                  type="button"
                  onClick={handleGoToResetPage}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
                >
                  Enter Reset Code
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full mt-3 p-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}