import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} · ${siteConfig.role}`,
    short_name: siteConfig.name,
    description: siteConfig.shareDescription,
    id: "/",
    start_url: "/",
    display: "standalone",
    lang: "pt-BR",
    background_color: "#05060a",
    theme_color: "#05060a",
    categories: ["technology", "education", "productivity"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
