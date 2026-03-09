// export type User = {
//   id: number;
//   name: string;
//   email: string;
//   role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
//   emailVerifiedAt?: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt?: Date | null;
// };

// export type CreateUserInput = {
//   name: string;
//   email: string;
//   password: string;
//   role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
// };

// types/user.ts
export type Roles = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Roles;
  profile?: UserProfile | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isFlagged?: boolean;
  emailVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type UserProfile = {
  id: number;
  userId: number;
  collegeName?: string | null;
  skills?: string | null;
  interests?: string | null;
  about?: string | null;
  organization?: string | null;
  experience?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  facebook?: string | null;
};

export type UserWithProfile = User & { profile?: UserProfile | null };

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: Roles;
};

export type UpdateUserInput = {
  name?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  emailVerifiedAt?: Date | null;
};

export type UpdateProfileInput = {
  collegeName?: string;
  skills?: string;
  interests?: string;
  about?: string;
  organization?: string;
  experience?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
};