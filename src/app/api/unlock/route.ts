import { NextRequest, NextResponse } from "next/server";

const PASSCODE = process.env.APP_PASSCODE;
const COOKIE_NAME = "app_passcode";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const entered = form.get("passcode");
  const from = (form.get("from") as string) || "/";

  if (!PASSCODE || entered !== PASSCODE) {
    const url = req.nextUrl.clone();
    url.pathname = "/locked";
    url.searchParams.set("from", from);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = from.startsWith("/") ? from : "/";
  url.searchParams.delete("from");
  url.searchParams.delete("error");

  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_NAME, PASSCODE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
