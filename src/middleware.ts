import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "utopia_super_secret_key_change_in_production");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/webhook")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("utopia_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = payload.role as string;

    if ((pathname.startsWith("/settings") || pathname.startsWith("/admin")) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher:["/((?!_next/static|_next/image|favicon.ico).*)"],
};