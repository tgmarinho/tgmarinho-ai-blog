import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Browsers and tools still request `/favicon.ico` explicitly; `app/icon.tsx`
  // is served at `/icon` (PNG). Rewriting avoids 404 while reusing the same asset.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
};

export default withNextIntl(nextConfig);
