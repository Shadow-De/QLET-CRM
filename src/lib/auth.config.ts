import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Add providers with Edge compatibility here if needed
} satisfies NextAuthConfig;
