"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mail, Shield, LogOut, User, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userRole: string;
  onSignout: () => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ProfileSheet({
  isOpen,
  onClose,
  userId,
  userRole,
  onSignout,
}: ProfileSheetProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then(setUserData)
      .catch(console.error);
  }, [isOpen, userId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const initials = userData?.name
    ? userData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const roleColor =
    userRole === "INSTRUCTOR"
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";

  const handleViewProfile = () => {
    onClose();
    router.push("/profile");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        ref={sheetRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold select-none">
              {initials}
            </div>
            <p className="text-base font-semibold">
              {userData?.name ?? "Loading…"}
            </p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColor}`}>
              {userData?.role ?? userRole}
            </span>
          </div>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 shrink-0 text-purple-500" />
              <span className="truncate">{userData?.email ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-4 h-4 shrink-0 text-purple-500" />
              <span>{userData?.role ?? userRole}</span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <User className="w-4 h-4" />
              View Full Profile
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>

            <button
              onClick={onSignout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border text-sm font-medium rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}