// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials, req) => {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // Ensure user.password is a string
        const storedPassword = String(user.password);

        let isValid = false;

        // If you haven't hashed passwords in DB yet
        if (!storedPassword.startsWith("$2")) {
          // Plain text fallback
          isValid = storedPassword === credentials.password;
        } else {
          // Proper bcrypt compare
          isValid = await bcrypt.compare(credentials.password, storedPassword);
        }

        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.name ?? "",
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
