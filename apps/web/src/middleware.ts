import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(request: NextRequest) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return new NextResponse("Admin paneli yapılandırılmadı.", {
      status: 503,
    });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [username, ...passwordParts] = decoded.split(":");
      const password = passwordParts.join(":");

      if (username === adminUsername && password === adminPassword) {
        const pathname = request.nextUrl.pathname;

        if (
          pathname === "/admin/fırsatlar" ||
          pathname === "/admin/f%C4%B1rsatlar"
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin/firsatlar";
          return NextResponse.redirect(url);
        }

        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Giriş gerekli.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="KariyerAtlas Admin"',
    },
  });
}