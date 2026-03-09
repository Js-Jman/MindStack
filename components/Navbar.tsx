"use client";

import { useState } from "react";
import { Brain } from "lucide-react";
import ProfileSheet from "@/components/ProfileSheet";
import Link from "next/link";

interface NavbarProps {
  userId?: number;
}
import { useAuth } from "@/hooks/useAuth";

export default function Navbar({ userId }: NavbarProps) {
  const { user, loading, signout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      <nav className="sticky top-0 z-30 w-full h-16 bg-background border-b flex items-center px-6 gap-4 shadow-sm">
        {/* Logo — left side */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Mind<span className="text-primary">Stack</span>
          </span>
        </Link>

        <div className="flex-1" />

        {!loading && user && (
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border hover:bg-muted transition-colors group"
            aria-label="Open profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm group-hover:bg-primary/20 transition-colors">
              {initials}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
          </button>
        )}

        {!loading && !user && (
          <a
            href="/signin"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </a>
        )}
      </nav>

      {user && (
        <ProfileSheet
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={user.id}
          userRole={user.role}
          onSignout={signout}
        />
      )}
    </>
  );
}