import { NextRequest, NextResponse } from "next/server";

const PASSCODE = process.env.APP_PASSCODE;
const COOKIE_NAME = "app_passcode";

export function proxy(req: NextRequest) {
  // No passcode configured — leave the app open. Convenient for local dev,
  // but the standards doc expects APP_PASSCODE set before anyone else sees this.
  if (!PASSCODE) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  if (pathname === "/locked" || pathname === "/api/unlock") {
    return NextResponse.next();
  }

  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  const headerValue = req.headers.get("x-app-passcode");

  if (cookieValue === PASSCODE || headerValue === PASSCODE) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Locked. Provide the passcode." }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/locked";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
