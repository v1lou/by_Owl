import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 465),
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});


const emailStyles = `
  <style>
    .email-container {
      background: #0a0a0a;
      padding: 40px;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      max-width: 480px;
      margin: 0 auto;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .email-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .email-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 8px rgba(224, 214, 192, 0.3));
    }
    .email-title {
      color: #dae0de;
      font-weight: 100;
      letter-spacing: 4px;
      margin: 10px 0 0;
      font-size: 1.6rem;
      text-transform: uppercase;
    }
    .email-text {
      color: #aaa;
      text-align: center;
      margin-bottom: 30px;
      font-size: 0.9rem;
    }
    .email-button-wrapper {
      text-align: center;
    }
    .email-button {
      display: inline-block;
      background: rgba(224, 214, 192, 0.08);
      color: #e0d6c0;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 30px;
      border: 1px solid rgba(224, 214, 192, 0.25);
      letter-spacing: 2px;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    .email-button:hover {
      background: rgba(224, 214, 192, 0.15);
      border-color: rgba(224, 214, 192, 0.4);
    }
    .email-note {
      color: #555;
      text-align: center;
      font-size: 0.7rem;
      margin-top: 30px;
    }
    .email-footer {
      text-align: center;
      margin-top: 20px;
      color: #444;
      font-size: 0.65rem;
      letter-spacing: 2px;
    }
  </style>
`;

const getEmailHtml = (url: string) => `
  <!DOCTYPE html>
  <html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1 class="email-title">Admin Panel</h1>
      </div>
      <p class="email-text">
        Нажми кнопку чтобы войти в панель управления
      </p>
      <div class="email-button-wrapper">
        <a href="${url}" class="email-button">
          Войти →
        </a>
      </div>
      <p class="email-note">
        Ссылка действительна 24 часа. Если вы не запрашивали код, то проигнорируйте письмо.
      </p>
      <div class="email-footer">
        blood bound
      </div>
    </div>
  </body>
  </html>
`;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        await transporter.sendMail({
          from: `"by_owl Admin" <${provider.from}>`,
          to: email,
          subject: "⋆༺⸸ Вход в Админ Панель ⸸༻⋆",
          html: getEmailHtml(url),
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