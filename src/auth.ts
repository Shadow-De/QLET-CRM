import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        // Parse and validate input
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const ip =
          request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          '0.0.0.0'

        const agent = await prisma.agent.findUnique({ where: { email } })

        // Account lockout check
        if (agent?.lockedUntil && agent.lockedUntil > new Date()) {
          await writeAudit('LOGIN_FAILED', ip, `account-locked:${email.slice(0, 5)}***`)
          return null
        }

        if (!agent) {
          // Constant-time delay to prevent user enumeration
          await bcrypt.hash(password, 14)
          await writeAudit('LOGIN_FAILED', ip, 'unknown-email')
          return null
        }

        const valid = await bcrypt.compare(password, agent.passwordHash)

        if (!valid) {
          const newAttempts = agent.failedLoginAttempts + 1
          const lockoutThreshold = 5
          const lockedUntil =
            newAttempts >= lockoutThreshold
              ? new Date(Date.now() + 15 * 60 * 1000) // 15 min
              : null

          await prisma.agent.update({
            where: { id: agent.id },
            data: {
              failedLoginAttempts: newAttempts,
              ...(lockedUntil ? { lockedUntil } : {}),
            },
          })

          if (lockedUntil) {
            await writeAudit('ACCOUNT_LOCKED', ip, `attempts:${newAttempts}`)
          } else {
            await writeAudit('LOGIN_FAILED', ip, `attempts:${newAttempts}`)
          }
          return null
        }

        // Successful login — reset failed attempts
        await prisma.agent.update({
          where: { id: agent.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        })
        await writeAudit('LOGIN_SUCCESS', ip)

        return {
          id: agent.id,
          email: agent.email,
          role: agent.role,
          hasSeenTour: agent.hasSeenTour,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours idle
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 day absolute max
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as unknown as { role: string }).role
        token.hasSeenTour = (user as unknown as { hasSeenTour: boolean }).hasSeenTour
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as unknown as { role: string }).role = token.role as string
        ;(session.user as unknown as { hasSeenTour: boolean }).hasSeenTour =
          token.hasSeenTour as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
