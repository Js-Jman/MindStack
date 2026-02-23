"use client";

import React, { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search courses...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <div
      className={`relative w-full transition-all duration-200 ${
        isFocused ? "transform scale-105" : ""
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 bg-white ${
          isFocused
            ? "border-purple-500 shadow-lg shadow-purple-200"
            : "border-gray-200 hover:border-purple-300"
        }`}
      >
        <Search
          className={`w-5 h-5 transition-colors ${
            isFocused ? "text-purple-500" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
