// import { prisma } from "@/lib/db";
// import { CreateUserInput } from "@/types/user";

// export async function findById(id: number) {
//   return await prisma.user.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       emailVerifiedAt: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true,
//     },
//   });
// }

// export async function findByEmail(email: string) {
//   return await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       emailVerifiedAt: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true,
//     },
//   });
// }

// export async function findAll(role?: string) {
//   return await prisma.user.findMany({
//     where: role ? { role } : undefined,
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       emailVerifiedAt: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true,
//     },
//   });
// }

// export async function create(data: CreateUserInput) {
//   return await prisma.user.create({
//     data,
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       emailVerifiedAt: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true,
//     },
//   });
// }

// export async function update(id: number, data: Partial<CreateUserInput>) {
//   return await prisma.user.update({
//     where: { id },
//     data,
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       emailVerifiedAt: true,
//       createdAt: true,
//       updatedAt: true,
//       deletedAt: true,
//     },
//   });
// }

// export async function softDelete(id: number) {
//   return await prisma.user.update({
//     where: { id },
//     data: { deletedAt: new Date() },
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       deletedAt: true,
//     },
//   });
// }

// export async function remove(id: number) {
//   return await prisma.user.delete({
//     where: { id },
//   });
// }

// repositories/user.repository.ts
import { prisma} from "@/lib/db";
import {Role} from "@prisma/client";
import { CreateUserInput, UpdateUserInput, UpdateProfileInput } from "@/types/user";

const BASE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phoneNumber: true,
  avatarUrl: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export async function findById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: { ...BASE_SELECT, userProfile: true },
  });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: BASE_SELECT,
  });
}

/** Only used internally for auth — exposes password hash */
export async function findByEmailWithPassword(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { ...BASE_SELECT, password: true },
  });
}

export async function findAll(role?: Role) {
  return prisma.user.findMany({
    where: role
      ? { role: role as Role }
      : { role: { in: [Role.STUDENT, Role.INSTRUCTOR] } },
    select: BASE_SELECT,
  });
}

export async function create(data: CreateUserInput) {
  return await prisma.user.create({
    data: {
      ...data,
      role: data.role ?? "STUDENT",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });
}

export async function update(id: number, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
    select: { ...BASE_SELECT, userProfile: true },
  });
}

export async function upsertProfile(userId: number, data: UpdateProfileInput) {
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function updatePassword(id: number, hashedPassword: string) {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: { id: true },
  });
}

export async function softDelete(id: number) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, email: true, name: true, role: true, deletedAt: true },
  });
}

export async function remove(id: number) {
  return prisma.user.delete({ where: { id } });
}