// import { NextResponse } from "next/server";

// export async function POST(req:any) {
//   const { email, password } = await req.json();

  
//   if (email === "admin@gmail.com" && password === "123456") {
//     return NextResponse.json({ message: "Login successful" }, { status: 200 });
//   }

//   return NextResponse.json(
//     { message: "Invalid credentials" },
//     { status: 401 }
//   );
// }

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
