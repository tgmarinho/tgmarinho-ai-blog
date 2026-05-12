import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|pt-BR)/:path*",
    "/((?!api|_next|_vercel|static|icon|apple-icon|opengraph-image|twitter-image|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
