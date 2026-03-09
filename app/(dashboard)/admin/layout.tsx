"use client";

import { useState } from "react";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f8faff] p-4 gap-4"> 
      {/* SIDEBAR BLOCK - Floating and Detached */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-white rounded-[2rem] border shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 gap-4 overflow-hidden">
        {/* NAVBAR BLOCK - Floating and Detached */}
        <Navbar />
        
        {/* CONTENT BLOCK - Floating and Detached */}
        <main className="flex-1 bg-white rounded-[2rem] border shadow-sm p-8 pt-6 overflow-y-auto"> 
          {children}
        </main>
      </div>
    </div>
  );
}