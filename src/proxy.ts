import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "midgard_preview_access";

export function proxy(request: NextRequest) {
  const password = process.env.MIDGARD_SITE_PASSWORD;
  const accessToken = process.env.MIDGARD_ACCESS_TOKEN;

  if (!password || !accessToken) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  if (pathname === "/access" || pathname.startsWith("/access/")) {
    return NextResponse.next();
  }

  if (request.cookies.get(ACCESS_COOKIE)?.value === accessToken) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$).*)",
  ],
};
