import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "TENANT_STAFF" | "TRAINER" | "CLIENT_HR" | "TRAINEE";

const roleAccess: Record<string, Role[]> = {
  "/admin": ["SUPER_ADMIN", "TENANT_ADMIN", "TENANT_STAFF"],
  "/trainer": ["SUPER_ADMIN", "TRAINER"],
  "/trainee": ["SUPER_ADMIN", "TRAINEE"],
  "/client": ["SUPER_ADMIN", "CLIENT_HR"],
};

function getSection(pathname: string): keyof typeof roleAccess | null {
  if (pathname.startsWith("/admin")) return "/admin";
  if (pathname.startsWith("/trainer")) return "/trainer";
  if (pathname.startsWith("/trainee")) return "/trainee";
  if (pathname.startsWith("/client")) return "/client";
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const section = getSection(pathname);
  if (!section) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  const role = (token as any).role as Role | undefined;
  const allowed = role ? roleAccess[section].includes(role) : false;

  if (!allowed) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/trainer/:path*", "/trainee/:path*", "/client/:path*"],
};

