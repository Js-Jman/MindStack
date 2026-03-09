"use client";

"use client";

import * as React from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { CheckCircle, XCircle } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <RadixToast.Provider swipeDirection="right" duration={3000}>
        <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
          {toasts.map((t) => (
            <RadixToast.Root
              key={t.id}
              open
              onOpenChange={(open) => !open && removeToast(t.id)}
              className="bg-white rounded-lg shadow-lg p-4 w-64 border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t.type === "error" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="font-semibold capitalize">
                    {t.type === "error" ? "Error" : "Success"}
                  </span>
                </div>
                <RadixToast.Action asChild altText="Close">
                  <button className="text-xs">✕</button>
                </RadixToast.Action>
              </div>
              <RadixToast.Description className="mt-2 text-sm">
                {t.message}
              </RadixToast.Description>
            </RadixToast.Root>
          ))}
        </div>
        <RadixToast.Viewport />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
