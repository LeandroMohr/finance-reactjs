import type { MetadataRoute } from "next";
import { getStaticRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return getStaticRoutes().map(({ path, lastModified }) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
