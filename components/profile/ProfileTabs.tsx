// components/profile/ProfileTabs.tsx
"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: Tab[];
  children: React.ReactNode[];
}

export function ProfileTabs({ tabs, children }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
      {/* Vertical tab list */}
      <div className="flex md:flex-col gap-1 md:w-52 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left
              ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <span className="w-5 h-5 shrink-0">{tab.icon}</span>
            <span className="hidden sm:inline md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="flex-1 bg-card border rounded-2xl shadow-sm p-6 min-h-[400px]">
        {children[activeIndex] ?? null}
      </div>
    </div>
  );
}