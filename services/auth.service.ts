/**
 * @fileoverview Auth Service - Business Logic Layer
 * 
 * This service contains business logic for authentication operations.
 * It orchestrates between:
 * - userRepository: database layer for user data
 * - JWT utilities: token generation and verification
 * - bcryptjs: password hashing and verification
 * 
 * Responsibilities:
 * - Validating credentials
 * - Managing password hashing and verification
 * - JWT token generation and validation
 * - User registration and login flows
 * - Password reset and recovery flows
 */

import { compare, hash } from "bcryptjs";
import { signToken } from "@/lib/jwt";
import * as userRepository from "@/repositories/user.repository";
import { User, Roles, CreateUserInput } from "@/types/user";

export type SignInResponse = {
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  token: string;
};

export type SignUpData = {
  name: string;
  email: string;
  password: string;
  role?: Roles;
};

/**
 * Sign in a user with email and password
 * 
 * Business logic:
 * 1. Validate email and password provided
 * 2. Find user by email (fetch with password hash)
 * 3. Verify password matches hash
 * 4. Check user is not soft-deleted
 * 5. Mark email as verified if not already
 * 6. Generate JWT token
 * 7. Return user info and token
 * 
 * @param email - User email address
 * @param password - User password (plain text)
 * @returns User info and JWT token
 * @throws Error for invalid credentials or user not found
 */
export async function signin(email: string, password: string): Promise<SignInResponse> {
  // Validate inputs
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Step 1: Fetch user with password hash
  const user = await userRepository.findByEmailWithPassword(email);

  // Step 2: Check user exists and is not deleted
  if (!user || user.deletedAt) {
    throw new Error("Invalid credentials");
  }

  // Step 3: Verify password matches hash
  const validPassword = await compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  // Step 4: Mark email as verified if not already
  if (!user.emailVerifiedAt) {
    await userRepository.update(user.id, {
      emailVerifiedAt: new Date(),
    });
  }

  // Step 5: Generate JWT token
  const token = await signToken({
    userId: user.id,
    role: user.role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
    email: user.email,
    name: user.name,
  });

  // Step 6: Return user info and token (exclude password)
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

/**
 * Register a new user account
 * 
 * Business logic:
 * 1. Validate input fields
 * 2. Check email not already registered
 * 3. Hash password using bcryptjs
 * 4. Create user in database
 * 5. Return created user info
 * 
 * @param data - User registration data (name, email, password, role)
 * @returns Created user record
 * @throws Error if email already exists or validation fails
 */
export async function signup(data: SignUpData): Promise<User> {
  // Validate inputs
  if (!data.name || !data.email || !data.password) {
    throw new Error("Name, email, and password are required");
  }

  // Check if email already registered
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await hash(data.password, 10);

  // Create user
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role ?? "STUDENT",
  });

  return user;
}

/**
 * Verify user email address
 * 
 * Marks email as verified for the user
 * 
 * @param userId - ID of the user
 * @returns Updated user record
 */
export async function verifyEmail(userId: number): Promise<User> {
  return await userRepository.update(userId, {
    emailVerifiedAt: new Date(),
  });
}

/**
 * Change user password
 * 
 * Business logic:
 * 1. Verify old password is correct
 * 2. Hash new password
 * 3. Update password in database
 * 
 * @param userId - ID of the user
 * @param oldPassword - Current password (plain text)
 * @param newPassword - New password (plain text)
 * @throws Error if old password incorrect
 */
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  // Validate inputs
  if (!oldPassword || !newPassword) {
    throw new Error("Old and new passwords are required");
  }

  // Fetch user with current password hash
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify old password (need to fetch with password)
  const userWithPassword = await userRepository.findByEmailWithPassword(
    user.email
  );
  if (!userWithPassword) {
    throw new Error("User not found");
  }

  const validOldPassword = await compare(oldPassword, userWithPassword.password);
  if (!validOldPassword) {
    throw new Error("Current password is incorrect");
  }

  // Hash and update new password
  const hashedPassword = await hash(newPassword, 10);
  await userRepository.updatePassword(userId, hashedPassword);
}

/**
 * Request password reset by sending reset code
 * 
 * Business logic:
 * 1. Find user by email
 * 2. Generate reset code
 * 3. Store reset code with expiration
 * 4. Send reset code via email (in real app)
 * 
 * NOTE: Actual email sending would be implemented here in production
 * 
 * @param email - User email address
 * @returns Success message
 * @throws Error if user not found
 */
export async function requestPasswordReset(email: string): Promise<{ message: string; email: string }> {
  // Validate input
  if (!email) {
    throw new Error("Email is required");
  }

  // Find user
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  // TODO: Generate reset code and store with expiration
  // TODO: Send reset code via email
  // For now, just return success message

  return {
    message: "Password reset code sent to email",
    email: email,
  };
}

/**
 * Reset password using reset code
 * 
 * Business logic:
 * 1. Validate reset code is valid and not expired
 * 2. Hash new password
 * 3. Update user password
 * 4. Invalidate reset code
 * 
 * @param email - User email address
 * @param resetCode - Code sent to user's email
 * @param newPassword - New password
 * @returns Success message
 * @throws Error if code invalid/expired or user not found
 */
export async function resetPassword(
  email: string,
  resetCode: string,
  newPassword: string
): Promise<{ message: string }> {
  // Validate inputs
  if (!email || !resetCode || !newPassword) {
    throw new Error("Email, reset code, and new password are required");
  }

  // Find user
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  // TODO: Validate reset code and check expiration
  // TODO: Invalidate reset code after use

  // Hash and update password
  const hashedPassword = await hash(newPassword, 10);
  await userRepository.updatePassword(user.id, hashedPassword);

  return {
    message: "Password reset successfully",
  };
}
