// // import { NextResponse } from "next/server";

// // export async function POST(req: Request) {
// //   const { name, email, password } = await req.json();

// //   if (!name || !email || !password) {
// //     return NextResponse.json(
// //       { message: "All fields are required" },
// //       { status: 400 }
// //     );
// //   }

  
// //   console.log("User Registered:", { name, email });

// //   return NextResponse.json(
// //     { message: "User registered successfully" },
// //     { status: 201 }
// //   );
// // }

// import { NextResponse } from "next/server";
// import  db  from "@/lib/db";
// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   try {
//     const { name, email, password } = await req.json();

//     // Check if user already exists
//     const existingUser = await db.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { message: "User already exists" },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user
//     await db.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: "STUDENT",
//       },
//     });

//     return NextResponse.json(
//       { message: "Account created successfully" },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log(error)
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = await signToken({
      userId: user.id,
      role: user.role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}