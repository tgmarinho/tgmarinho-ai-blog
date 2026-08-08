import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Terminal HTTP clients get the plain-text resume instead of the React app.
// Rewrites to the /api/resume route handler (Node runtime) so it can read the CV file.
const TERMINAL_UA = /\b(curl|wget|httpie|libcurl|lwp-request)\b/i;

export default function proxy(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname === "/") {
    const ua = request.headers.get("user-agent") ?? "";
    if (TERMINAL_UA.test(ua)) {
      return NextResponse.rewrite(new URL("/api/resume", request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next|_vercel|static|icon|apple-icon|opengraph-image|twitter-image|.+/opengraph-image|.+/twitter-image|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
