import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";
import { authLimiter, getClientIp } from "@/lib/ratelimit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = req ? getClientIp(req as Request) : "unknown";
        const { success } = await authLimiter.limit(`login_${ip}`);
        if (!success) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const agent = await prisma.agent.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, position: true, avatarUrl: true, passwordHash: true },
        });

        if (!agent) {
          // Constant-time comparison even when user not found to prevent timing attacks
          await bcrypt.hash("dummy-prevent-timing-attack", 12);
          await writeAuditLog("auth.failed_login", undefined, undefined, { email });
          return null;
        }

        const valid = await bcrypt.compare(password, agent.passwordHash);
        if (!valid) {
          await writeAuditLog("auth.failed_login", agent.id, agent.id, {});
          return null;
        }

        return {
          id: agent.id,
          email: agent.email,
          name: agent.name,
          role: agent.role,
          position: agent.position,
          image: agent.avatarUrl ? `/api/agent/avatar?id=${agent.id}` : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.agentId = user.id;
        token.role = (user as { role?: string }).role;
        token.position = (user as { position?: string | null }).position;
        token.picture = user.image;
      }
      if (trigger === "update" && session) {
        // In Auth.js, data from update(data) is passed as the session argument.
        // We'll check if it's wrapped in a user object just in case.
        const data = session.user || session;
        if (data.name !== undefined) token.name = data.name;
        if (data.email !== undefined) token.email = data.email;
        if (data.position !== undefined) token.position = data.position;
        if (data.image !== undefined) token.picture = data.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.agentId as string;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        (session as any).user.role = token.role as string;
        (session as any).user.position = token.position as string | null | undefined;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
});
