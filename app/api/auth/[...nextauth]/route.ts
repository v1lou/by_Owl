// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 465),
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true для 465, false для 587
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        await transporter.sendMail({
          from: `"by_owl Admin" <${provider.from}>`,
          to: email,
          subject: "🦇 Вход в Admin Sanctum",
          html: `
            <div style="background:#0a0a0a;padding:40px;font-family:sans-serif;max-width:480px;margin:0 auto;border-radius:16px;border:1px solid #222;">
              <div style="text-align:center;margin-bottom:30px;">
                <div style="font-size:2.5rem;">🦇</div>
                <h1 style="color:#e0d6c0;font-weight:300;letter-spacing:4px;margin:10px 0 0;">Admin Sanctum</h1>
              </div>
              <p style="color:#aaa;text-align:center;margin-bottom:30px;">
                Нажми кнопку чтобы войти в панель управления
              </p>
              <div style="text-align:center;">
                <a href="${url}" style="display:inline-block;background:rgba(224,214,192,0.15);color:#e0d6c0;text-decoration:none;padding:14px 32px;border-radius:30px;border:1px solid rgba(224,214,192,0.3);letter-spacing:1px;font-size:0.9rem;">
                  Войти →
                </a>
              </div>
              <p style="color:#444;text-align:center;font-size:0.75rem;margin-top:30px;">
                Ссылка действительна 24 часа. Если ты не запрашивала вход — проигнорируй письмо.
              </p>
              <div style="text-align:center;margin-top:20px;color:#333;font-size:0.7rem;letter-spacing:2px;">
                blood bound
              </div>
            </div>
          `,
          text: `Войти в Admin Sanctum: ${url}`,
        });
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
