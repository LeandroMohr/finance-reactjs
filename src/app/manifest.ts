import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} - Calculadoras e Ferramentas Financeiras`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1710",
    theme_color: "#0b1710",
    lang: "pt-BR",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48 256x256",
        type: "image/x-icon",
      },
    ],
  };
}