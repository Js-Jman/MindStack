/**
 * @fileoverview User Repository - Database Layer
 * 
 * This repository handles all database operations related to users.
 * It encapsulates Prisma queries for:
 * - Fetching users by ID or email
 * - Creating new user accounts
 * - Updating user information and passwords
 * - Managing user profiles
 * - Soft deleting and removing users
 * 
 * Key responsibility: Single source of database access for user-related data
 */

import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  User,
  UserWithProfile,
} from "@/types/user";

/**
 * Standard fields selected for user queries
 * Used consistently across all user repository methods
 */
const BASE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phoneNumber: true,
  avatarUrl: true,
  isFlagged: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

/**
 * Find a user by ID with full profile
 * 
 * @param id - User ID
 * @returns User record with profile data or null if not found
 */
export async function findById(id: number): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { ...BASE_SELECT, userProfile: true },
  });
}

/**
 * Find a user by email (without password)
 * 
 * Used for general user lookups where password is not needed
 * 
 * @param email - User email address
 * @returns User record or null if not found
 */
export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
    select: BASE_SELECT,
  });
}

/**
 * Find a user by email WITH password hash
 * 
 * Used specifically for authentication flows where password comparison is needed
 * 
 * @param email - User email address
 * @returns User record with password hash included or null if not found
 */
export async function findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { ...BASE_SELECT, password: true },
  });
}

/**
 * Find all users, optionally filtered by role
 * 
 * By default returns STUDENT and INSTRUCTOR users (excludes ADMIN)
 * Can filter to specific role if provided
 * 
 * @param role - Optional role filter (STUDENT, INSTRUCTOR, ADMIN)
 * @returns Array of user records
 */
export async function findAll(role?: Role): Promise<User[]> {
  return prisma.user.findMany({
    where: role
      ? { role: role as Role }
      : { role: { in: [Role.STUDENT, Role.INSTRUCTOR] } },
    select: BASE_SELECT,
  });
}

/**
 * Create a new user account
 * 
 * Creates user with default role of STUDENT if not specified.
 * Password should be hashed before passed to this function.
 * 
 * @param data - User creation input (name, email, password, role)
 * @returns Created user record
 */
export async function create(data: CreateUserInput): Promise<User> {
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

/**
 * Update user information
 * 
 * Can update name, email, role, phone number, avatar, etc.
 * Does not update password (use updatePassword instead)
 * 
 * @param id - User ID
 * @param data - Partial user data to update
 * @returns Updated user record with profile
 */
export async function update(id: number, data: UpdateUserInput): Promise<UserWithProfile> {
  return prisma.user.update({
    where: { id },
    data,
    select: { ...BASE_SELECT, userProfile: true },
  });
}

/**
 * Create or update user profile information
 * 
 * Handles bio, education details, social links, etc.
 * Uses upsert to create if doesn't exist, update if does
 * 
 * @param userId - ID of the user
 * @param data - Profile data (bio, education, address, etc.)
 * @returns Created or updated profile record
 */
export async function upsertProfile(userId: number, data: UpdateProfileInput) {
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

/**
 * Update user password (password must be hashed before calling)
 * 
 * Used for password changes and resets
 * Only updates password field, not other user data
 * 
 * @param id - User ID
 * @param hashedPassword - Bcryptjs hashed password string
 * @returns Updated user ID confirmation
 */
export async function updatePassword(id: number, hashedPassword: string): Promise<{ id: number }> {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: { id: true },
  });
}

/**
 * Soft delete a user (set deletedAt timestamp)
 * 
 * Soft deletes preserve data for auditing while hiding from normal queries
 * User becomes inaccessible for login and course access
 * 
 * @param id - User ID
 * @returns Deleted user record
 */
export async function softDelete(id: number): Promise<{ id: number; email: string; name: string; role: string; deletedAt: Date | null }> {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, email: true, name: true, role: true, deletedAt: true },
  });
}

/**
 * Permanently delete a user from database
 * 
 * CAUTION: This permanently removes all user data, enrollments, progress, etc.
 * Consider soft delete (softDelete) instead for audit trail
 * 
 * @param id - User ID
 * @returns Deletion confirmation
 */
export async function remove(id: number): Promise<User> {
  return prisma.user.delete({ where: { id } });
}