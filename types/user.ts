export type User = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  emailVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};
