// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // ❌ Удалите эту строку — её нет в типе EmailUserConfig
      // id: "email",
      
      // ✅ Используйте sendVerificationRequest для отправки через Resend API
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Вход в админ-панель by_Owl",
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #333;">Вход в админ-панель</h2>
                <p>Нажмите на кнопку ниже, чтобы войти в свою учётную запись:</p>
                <a href="${url}" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  Войти
                </a>
                <p style="font-size: 12px; color: #666;">
                  Ссылка действительна в течение 24 часов.<br>
                  Если вы не запрашивали вход, просто проигнорируйте это письмо.
                </p>
              </div>
            `,
          });
          
          if (error) {
            console.error("Resend API error:", error);
            throw new Error(`Не удалось отправить письмо: ${error.message}`);
          }
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Ошибка отправки письма. Попробуйте позже.");
        }
      },
    }),
  ],
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