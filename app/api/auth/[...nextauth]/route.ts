// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
// EmailProvider полностью удалён
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [], // Пустой массив — никаких провайдеров
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
      if (ownerEmails.includes(user.email)) return true;
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