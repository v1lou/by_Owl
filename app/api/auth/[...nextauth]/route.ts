// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
server: {
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,           // для порта 587
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
},
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // owner всегда может войти
      const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
      if (ownerEmails.includes(user.email)) return true;
      // остальные — только если есть в AdminUser
      const adminUser = await prisma.adminUser.findUnique({
        where: { email: user.email },
      });
      return !!adminUser;
    },
    async session({ session }) {
      if (!session.user?.email) return session;
      const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
      if (ownerEmails.includes(session.user.email)) {
        (session.user as any).role = 'owner';
        (session.user as any).permissions = ['all'];
        return session;
      }
      const adminUser = await prisma.adminUser.findUnique({
        where: { email: session.user.email },
      });
      if (adminUser) {
        (session.user as any).role = adminUser.role;
        (session.user as any).permissions = JSON.parse(adminUser.permissions);
      }
      return session;
    },
  },
  pages: { signIn: "/admin" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };