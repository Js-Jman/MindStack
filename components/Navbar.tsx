"use client";

import { useState } from "react";
import { Brain } from "lucide-react";
import ProfileSheet from "@/components/ProfileSheet";

interface NavbarProps {
  userId?: number;
}

export default function Navbar({ userId = 1 }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-30 w-full h-16 bg-background border-b flex items-center px-6 gap-4 shadow-sm">
        {/* Logo — left side */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Mind<span className="text-primary">Stack</span>
          </span>
        </a>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Profile button — right side */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border hover:bg-muted transition-colors group"
          aria-label="Open profile"
        >
          {/* Avatar circle */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm group-hover:bg-primary/20 transition-colors">
            U
          </div>
          <span className="text-sm font-medium hidden sm:inline">Profile</span>
        </button>
      </nav>

      <ProfileSheet
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        userId={userId}
      />
    </>
  );
}
