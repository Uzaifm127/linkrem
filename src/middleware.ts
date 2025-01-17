import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { authenticationErrorMessage } from "@/constants";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const pathname = req.nextUrl.pathname;

    // Allow unauthenticated access to login, signup, and home routes
    if (
      pathname === "/auth/login" ||
      pathname === "/auth/signup" ||
      pathname === "/"
    ) {
      if (token) {
        return NextResponse.redirect(new URL("/links", req.url));
      }
      return NextResponse.next();
    }

    // Handle API routes
    if (pathname.startsWith("/api")) {
      const headers = {
        // change it later to specific
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      const response = NextResponse.next({ headers });

      if (req.method === "OPTIONS") {
        return NextResponse.json(null, { headers });
      }

      // Allow next-auth API routes without token
      if (pathname.startsWith("/api/auth")) {
        return response;
      }

      // Other API routes require authentication
      if (token) {
        return response;
      } else {
        return NextResponse.json(
          { message: authenticationErrorMessage },
          { status: 401, headers }
        );
      }
    }

    if (token) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
