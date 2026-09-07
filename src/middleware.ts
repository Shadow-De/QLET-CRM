import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login") {
    const session = await auth();
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on dashboard routes and login page only
  matcher: ["/dashboard/:path*", "/login"],
};
