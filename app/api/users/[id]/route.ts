// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// export async function GET(
//   _req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const userId = Number(id);
//     if (Number.isNaN(userId)) {
//       return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { id: true, name: true, email: true, role: true, phoneNumber: true, avatarUrl: true },
//       include: { profile: true },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (error: any) {
//     console.error("GET /api/users/[id]:", error);
//     return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
//   }
// }

// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const userId = Number(id);
//     if (Number.isNaN(userId)) {
//       return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
//     }

//     const body = await req.json();
//     const { name, email, phoneNumber, avatarUrl } = body;

//     // Only allow updating name, email, phoneNumber, avatarUrl
//     const data: Record<string, string> = {};
//     if (name) data.name = name;
//     if (email) data.email = email;
//     if (phoneNumber) data.phoneNumber = phoneNumber;
//     if (avatarUrl) data.avatarUrl = avatarUrl;

//     const user = await prisma.user.update({
//       where: { id: userId },
//       data,
//       select: { id: true, name: true, email: true, role: true, phoneNumber: true, avatarUrl: true },
//     });

//     return NextResponse.json(user);
//   } catch (error: any) {
//     console.error("PATCH /api/users/[id]:", error);
//     return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
//   }
// }

//     const user = await prisma.user.update({
//       where: { id: userId },
//       data,
//       select: { id: true, name: true, email: true, role: true },
//     });

//     return NextResponse.json(user);
//   } catch (error: any) {
//     console.error("PATCH /api/users/[id]:", error);
//     return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
//   }
// }

// app/api/users/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { getSession } from "@/lib/auth";
// import { hash, compare } from "bcryptjs";

// /** GET /api/users/[id] */
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getSession();
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const targetId = parseInt(params.id);
//   if (isNaN(targetId)) {
//     return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
//   }

//   // Users can only read their own profile; admins can read any
//   if (session.userId !== targetId && session.role !== "ADMIN") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: targetId },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       phoneNumber: true,
//       avatarUrl: true,
//       createdAt: true,
//       profile: true,
//     },
//   });

//   if (!user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   return NextResponse.json(user);
// }

// /** PATCH /api/users/[id] — update profile fields or change password */
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getSession();
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const targetId = parseInt(params.id);
//   if (isNaN(targetId)) {
//     return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
//   }

//   if (session.userId !== targetId && session.role !== "ADMIN") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const body = await req.json();
//   const {
//     // Core user fields
//     name,
//     phoneNumber,
//     avatarUrl,
//     // Password change
//     oldPassword,
//     newPassword,
//     // Student profile
//     collegeName,
//     skills,
//     interests,
//     // Instructor profile
//     about,
//     organization,
//     experience,
//     linkedin,
//     twitter,
//     facebook,
//   } = body;

//   try {
//     // --- Password change path ---
//     if (newPassword !== undefined) {
//       if (!oldPassword) {
//         return NextResponse.json(
//           { error: "Current password is required to set a new one" },
//           { status: 400 }
//         );
//       }
//       if (newPassword.length < 8) {
//         return NextResponse.json(
//           { error: "New password must be at least 8 characters" },
//           { status: 400 }
//         );
//       }

//       const user = await prisma.user.findUnique({
//         where: { id: targetId },
//         select: { password: true },
//       });
//       if (!user) {
//         return NextResponse.json({ error: "User not found" }, { status: 404 });
//       }

//       const valid = await compare(oldPassword, user.password);
//       if (!valid) {
//         return NextResponse.json(
//           { error: "Current password is incorrect" },
//           { status: 400 }
//         );
//       }

//       const hashed = await hash(newPassword, 12);
//       await prisma.user.update({
//         where: { id: targetId },
//         data: { password: hashed },
//       });

//       return NextResponse.json({ message: "Password updated successfully" });
//     }

//     // --- Core user fields ---
//     const userUpdate: Record<string, unknown> = {};
//     if (name !== undefined) userUpdate.name = name;
//     if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
//     if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;

//     if (Object.keys(userUpdate).length > 0) {
//       await prisma.user.update({ where: { id: targetId }, data: userUpdate });
//     }

//     // --- Profile fields ---
//     const profileData: Record<string, unknown> = {};
//     if (collegeName !== undefined) profileData.collegeName = collegeName;
//     if (skills !== undefined) profileData.skills = skills;
//     if (interests !== undefined) profileData.interests = interests;
//     if (about !== undefined) profileData.about = about;
//     if (organization !== undefined) profileData.organization = organization;
//     if (experience !== undefined) profileData.experience = experience;
//     if (linkedin !== undefined) profileData.linkedin = linkedin;
//     if (twitter !== undefined) profileData.twitter = twitter;
//     if (facebook !== undefined) profileData.facebook = facebook;

//     if (Object.keys(profileData).length > 0) {
//       await prisma.userProfile.upsert({
//         where: { userId: targetId },
//         create: { userId: targetId, ...profileData },
//         update: profileData,
//       });
//     }

//     // Return updated user with profile
//     const updated = await prisma.user.findUnique({
//       where: { id: targetId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         phoneNumber: true,
//         avatarUrl: true,
//         profile: true,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (error) {
//     console.error("Update user error:", error);
//     return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
//   }
// }

// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hash, compare } from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetId = parseInt(id);
  if (isNaN(targetId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  if (session.userId !== targetId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
      avatarUrl: true,
      createdAt: true,
      userProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetId = parseInt(id);
  if (isNaN(targetId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  if (session.userId !== targetId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name, phoneNumber, avatarUrl,
    oldPassword, newPassword,
    collegeName, skills, interests,
    about, organization, experience,
    linkedin, twitter, facebook,
  } = body;

  try {
    // Password change
    if (newPassword !== undefined) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { password: true },
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const valid = await compare(oldPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      const hashed = await hash(newPassword, 12);
      await prisma.user.update({ where: { id: targetId }, data: { password: hashed } });
      return NextResponse.json({ message: "Password updated successfully" });
    }

    // Core user fields
    const userUpdate: Record<string, unknown> = {};
    if (name !== undefined) userUpdate.name = name;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: targetId }, data: userUpdate });
    }

    // Profile fields
    const profileData: Record<string, unknown> = {};
    if (collegeName !== undefined) profileData.collegeName = collegeName;
    if (skills !== undefined) profileData.skills = skills;
    if (interests !== undefined) profileData.interests = interests;
    if (about !== undefined) profileData.about = about;
    if (organization !== undefined) profileData.organization = organization;
    if (experience !== undefined) profileData.experience = experience;
    if (linkedin !== undefined) profileData.linkedin = linkedin;
    if (twitter !== undefined) profileData.twitter = twitter;
    if (facebook !== undefined) profileData.facebook = facebook;
    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: targetId },
        create: { userId: targetId, ...profileData },
        update: profileData,
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true, name: true, email: true, role: true,
        phoneNumber: true, avatarUrl: true, userProfile: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}