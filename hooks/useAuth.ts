"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");

      if (res.ok) {
        setUser(await res.json());
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const signin = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Sign in failed");
    }

    const data = await res.json();
    setUser(data.user);

    // Redirect based on role
    if (data.user.role === "INSTRUCTOR") {
      router.push("/instructor");
    } else {
      router.push("/student");
    }

    return data.user as AuthUser;
  }, [router]);

  const signout = useCallback(async () => {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include", // Include cookies
    });
    
    setUser(null);
    router.push("/signin");
  }, [router]);

  return { user, loading, signin, signout, refetch: fetchMe };
}