"use client";

import { LayoutDashboard, Users, UserCheck, ShieldQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const routes = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Instructors", icon: UserCheck, href: "/admin/instructors" },
  { label: "Support", icon: ShieldQuestion, href: "/admin/support" },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full relative p-4">
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-10 bg-white border rounded-full p-1 shadow-sm hover:text-purple-600 z-50 transition-all"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation - No branding header */}
      <nav className="flex-1 space-y-2 mt-4">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center rounded-2xl transition-all font-semibold text-sm group",
                isCollapsed ? "justify-center p-3" : "px-4 py-3.5 gap-x-3",
                isActive 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-100" 
                  : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"
              )}
            >
              <route.icon size={22} />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}