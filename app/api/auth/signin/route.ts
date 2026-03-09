// // // import { NextResponse } from "next/server";

// // // export async function POST(req:any) {
// // //   const { email, password } = await req.json();

  
// // //   if (email === "admin@gmail.com" && password === "123456") {
// // //     return NextResponse.json({ message: "Login successful" }, { status: 200 });
// // //   }

// // //   return NextResponse.json(
// // //     { message: "Invalid credentials" },
// // //     { status: 401 }
// // //   );
// // // }

// // import { NextResponse } from "next/server";
// // import db  from "@/lib/db";
// // import bcrypt from "bcryptjs";

// // export async function POST(req: Request) {
// //   try {
// //     const { email, password } = await req.json();

// //     // Find user
// //     const user = await db.user.findUnique({
// //       where: { email },
// //     });

// //     if (!user) {
// //       return NextResponse.json(
// //         { message: "Invalid credentials" },
// //         { status: 401 }
// //       );
// //     }

// //     // Compare password
// //     const isPasswordValid = await bcrypt.compare(
// //       password,
// //       user.password
// //     );

// //     if (!isPasswordValid) {
// //       return NextResponse.json(
// //         { message: "Invalid credentials" },
// //         { status: 401 }
// //       );
// //     }

// //     return NextResponse.json(
// //       { message: "Login successful" },
// //       { status: 200 }
// //     );
// //   } catch (error) {
// //     return NextResponse.json(
// //       { message: "Something went wrong" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/auth/signin/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { compare } from "bcryptjs";
// import { signToken } from "@/lib/jwt";
// import { COOKIE_NAME } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const { email, password } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         password: true,
//         deletedAt: true,
//       },
//     });

//     if (!user || user.deletedAt) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const valid = await compare(password, user.password);
//     if (!valid) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const token = await signToken({
//       userId: user.id,
//       role: user.role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
//       email: user.email,
//       name: user.name,
//     });

//     const res = NextResponse.json({
//       user: { id: user.id, name: user.name, email: user.email, role: user.role },
//     });

//     // HttpOnly cookie — cannot be read by JavaScript (XSS safe)
//     res.cookies.set(COOKIE_NAME, token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//     });

//     return res;
//   } catch (error) {
//     console.error("Signin error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        deletedAt: true,
        emailVerifiedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set emailVerifiedAt on first successful login if not already set
    if (!user.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    const token = await signToken({
      userId: user.id,
      role: user.role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}