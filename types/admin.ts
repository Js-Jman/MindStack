export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export interface UserTableRow {
  id: number;
  name: string | null;
  email: string | null;
  status: UserStatus;
  isFlagged?: boolean;
  courseCount: number;
  createdAt?: Date | string | null;
}

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isFlagged: boolean;
  createdAt: string;
  courses: Array<{
    id: number;
    title: string;
    isPublished: boolean;
    createdAt: string;
    _count: { enrollments: number };
  }>;
  enrollments: Array<{
    id: number;
    status: string;
    enrolledAt: string;
    course: { id: number; title: string; isPublished: boolean };
  }>;
}

export type ActivityType = "user" | "course" | "enrollment";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  text: string;
  time: string;
  timestamp: Date;
}
