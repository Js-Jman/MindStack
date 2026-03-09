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
      profile: true,
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

    const userUpdate: Record<string, unknown> = {};
    if (name !== undefined) userUpdate.name = name;
    if (phoneNumber !== undefined) userUpdate.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: targetId }, data: userUpdate });
    }

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
        phoneNumber: true, avatarUrl: true, profile: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}