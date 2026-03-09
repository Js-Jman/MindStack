"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main
        className={
          isAdminRoute
            ? "w-full"
            : "max-w mx-auto px-4 sm:px-6 py-8"
        }
      >
        {children}
      </main>
    </div>
  );
}