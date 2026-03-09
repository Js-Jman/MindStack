// // // // hooks/useAuth.ts
// // // "use client";

// // // import { useState, useEffect, useCallback } from "react";
// // // import { useRouter } from "next/navigation";

// // // export interface AuthUser {
// // //   id: number;
// // //   name: string;
// // //   email: string;
// // //   role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
// // // }

// // // export function useAuth() {
// // //   const [user, setUser] = useState<AuthUser | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const router = useRouter();

// // //   const fetchMe = useCallback(async () => {
// // //     try {
// // //       const res = await fetch("/api/auth/me");
// // //       if (res.ok) {
// // //         const data = await res.json();
// // //         setUser(data);
// // //       } else {
// // //         setUser(null);
// // //       }
// // //     } catch {
// // //       setUser(null);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   useEffect(() => {
// // //     fetchMe();
// // //   }, [fetchMe]);

// // //   const signin = useCallback(
// // //     async (email: string, password: string) => {
// // //       const res = await fetch("/api/auth/signin", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ email, password }),
// // //       });

// // //       if (!res.ok) {
// // //         const data = await res.json();
// // //         throw new Error(data.error ?? "Sign in failed");
// // //       }

// // //       const data = await res.json();
// // //       setUser(data.user);

// // //       // Role-based redirect
// // //       if (data.user.role === "INSTRUCTOR") {
// // //         router.push("/dashboard/instructor");
// // //       } else {
// // //         router.push("/dashboard/student");
// // //       }

// // //       return data.user;
// // //     },
// // //     [router]
// // //   );

// // //   const signout = useCallback(async () => {
// // //     await fetch("/api/auth/signout", { method: "POST" });
// // //     setUser(null);
// // //     router.push("/signin");
// // //   }, [router]);

// // //   return { user, loading, signin, signout, refetch: fetchMe };
// // // }

// // // hooks/useAuth.ts
// // "use client";

// // import { useState, useEffect, useCallback } from "react";
// // import { useRouter } from "next/navigation";

// // export interface AuthUser {
// //   id: number;
// //   name: string;
// //   email: string;
// //   role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
// // }

// // export function useAuth() {
// //   const [user, setUser] = useState<AuthUser | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const router = useRouter();

// //   const fetchMe = useCallback(async () => {
// //     try {
// //       const res = await fetch("/api/auth/me");
// //       if (res.ok) {
// //         setUser(await res.json());
// //       } else {
// //         setUser(null);
// //       }
// //     } catch {
// //       setUser(null);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchMe();
// //   }, [fetchMe]);

// //   const signin = useCallback(
// //     async (email: string, password: string) => {
// //       const res = await fetch("/api/auth/signin", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ email, password }),
// //       });
// //       if (!res.ok) {
// //         const data = await res.json();
// //         throw new Error(data.error ?? "Sign in failed");
// //       }
// //       const data = await res.json();
// //       setUser(data.user);

// //       // Role-based redirect after login
// //       if (data.user.role === "INSTRUCTOR") {
// //         router.push("/dashboard/instructor");
// //       } else {
// //         router.push("/dashboard/student");
// //       }
// //       return data.user as AuthUser;
// //     },
// //     [router]
// //   );

// //   const signout = useCallback(async () => {
// //     await fetch("/api/auth/signout", { method: "POST" });
// //     setUser(null);
// //     router.push("/signin");
// //   }, [router]);

// //   return { user, loading, signin, signout, refetch: fetchMe };
// // }

// // hooks/useAuth.ts
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";

// export interface AuthUser {
//   id: number;
//   name: string;
//   email: string;
//   role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
// }

// export function useAuth() {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const fetchMe = useCallback(async () => {
//     try {
//       const res = await fetch("/api/auth/me");
//       if (res.ok) {
//         setUser(await res.json());
//       } else {
//         setUser(null);
//       }
//     } catch {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchMe();
//   }, [fetchMe]);

//   const signin = useCallback(
//     async (email: string, password: string) => {
//       const res = await fetch("/api/auth/signin", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.error ?? "Sign in failed");
//       }
//       const data = await res.json();
//       setUser(data.user);

//       // refresh() forces Next.js to re-read the new cookie on the server
//       // before we navigate — without this the dashboard sees no session
//       router.refresh();

//       if (data.user.role === "INSTRUCTOR") {
//         router.push("/dashboard/instructor");
//       } else {
//         router.push("/dashboard/student");
//       }

//       return data.user as AuthUser;
//     },
//     [router]
//   );

//   const signout = useCallback(async () => {
//     await fetch("/api/auth/signout", { method: "POST" });
//     setUser(null);
//     router.refresh();
//     router.push("/signin");
//   }, [router]);

//   return { user, loading, signin, signout, refetch: fetchMe };
// }

// hooks/useAuth.ts
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
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Sign in failed");
    }
    const data = await res.json();
    setUser(data.user);

    // Use full page navigation — guarantees the browser sends the new
    // HttpOnly cookie on the very next request, no race condition
    if (data.user.role === "INSTRUCTOR") {
      window.location.href = "/dashboard/instructor";
    } else {
      window.location.href = "/dashboard/student";
    }

    return data.user as AuthUser;
  }, []);

  const signout = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    window.location.href = "/signin";
  }, []);

  return { user, loading, signin, signout, refetch: fetchMe };
}