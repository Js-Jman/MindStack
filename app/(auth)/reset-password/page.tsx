"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Step = "verify" | "reset" | "done";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailFromQuery = searchParams.get("email") ?? "";

  const [step, setStep] = useState<Step>("verify");
  const [email] = useState<string>(emailFromQuery);

  // for verifying reset code
  const [codeInputs, setCodeInputs] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>("");

  // for new password
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>("");

  const code = codeInputs.join("").trim();

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...codeInputs];
    updated[index] = value;
    setCodeInputs(updated);
    if (value && index < 5) {
      const next = document.getElementById(`digit-${index + 1}`);
      (next as HTMLInputElement)?.focus();
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      const prev = document.getElementById(`digit-${index - 1}`);
      (prev as HTMLInputElement)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setCodeInputs(updated);
    document.getElementById(`digit-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifyError("");

    const finalCode = codeInputs.join("").trim();

    if (finalCode.length !== 6) {
      setVerifyError("Please enter all 6 digits.");
      return;
    }

    setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: finalCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("reset");
      } else {
        setVerifyError(data.message || "Invalid or expired code.");
      }
    } catch {
      setVerifyError("Something went wrong. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError("");

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: codeInputs.join("").trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("done");
      } else {
        setResetError(data.message || "Something went wrong.");
      }
    } catch {
      setResetError("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl">

        {step === "verify" && (
          <form
            onSubmit={handleVerifyCode}
            className="bg-white p-8 rounded-2xl w-96"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Enter Reset Code
            </h2>

            <p className="text-center text-gray-500 text-sm mb-6">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-gray-700">{email}</span>.
            </p>

            <div className="flex gap-2 justify-center mb-6">
              {codeInputs.map((digit, i) => (
                <input
                  key={i}
                  id={`digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDigitChange(i, e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleDigitKeyDown(i, e)
                  }
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-11 h-12 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              ))}
            </div>

            {verifyError && (
              <p className="text-red-500 text-sm mb-4 text-center">{verifyError}</p>
            )}

            <button
              type="submit"
              disabled={verifyLoading || code.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
            >
              {verifyLoading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="w-full mt-3 p-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {step === "reset" && (
          <form
            onSubmit={handleResetPassword}
            className="bg-white p-8 rounded-2xl w-96"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              New Password
            </h2>

            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

            {resetError && (
              <p className="text-red-500 text-sm mb-4">{resetError}</p>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
            >
              {resetLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="bg-white p-8 rounded-2xl w-96">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Password Updated!
            </h2>

            <p className="text-center text-gray-500 mb-6">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>

            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}