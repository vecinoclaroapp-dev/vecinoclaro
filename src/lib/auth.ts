// =====================================================================
// Configuración NextAuth.js — VecinoClaro
// =====================================================================

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const hasGoogle = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credenciales",
    credentials: {
      email: { label: "Correo", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await db.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });
      if (!user || !user.password || !user.active) return null;
      const ok = await bcrypt.compare(credentials.password, user.password);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? undefined,
      };
    },
  }),
];

if (hasGoogle) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      // OAuth (Google): crear usuario si no existe
      if (account?.provider === "google" && user.email) {
        const existing = await db.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (!existing) {
          await db.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name ?? "Usuario",
              image: user.image,
              provider: "google",
              password: null,
              role: "USER",
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
          token.role = dbUser.role;
          token.onboardingDone = dbUser.onboardingDone;
          token.onboardingStep = dbUser.onboardingStep;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { onboardingDone?: boolean }).onboardingDone = token.onboardingDone as boolean;
        (session.user as { onboardingStep?: number }).onboardingStep = token.onboardingStep as number;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
