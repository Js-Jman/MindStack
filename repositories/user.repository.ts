import { prisma } from "@/lib/db";
import { CreateUserInput } from "@/types/user";

export async function findById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
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

export async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
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

export async function findAll(role?: string) {
  return await prisma.user.findMany({
    where: role ? { role } : undefined,
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

export async function create(data: CreateUserInput) {
  return await prisma.user.create({
    data,
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

export async function update(id: number, data: Partial<CreateUserInput>) {
  return await prisma.user.update({
    where: { id },
    data,
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

export async function softDelete(id: number) {
  return await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      deletedAt: true,
    },
  });
}

export async function remove(id: number) {
  return await prisma.user.delete({
    where: { id },
  });
}
