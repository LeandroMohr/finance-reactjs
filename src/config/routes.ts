import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const APP_DIR = join(process.cwd(), "src", "app");
const PAGE_FILES = ["page.tsx", "page.ts", "page.jsx", "page.js"];

export type DiscoveredRoute = {
  path: string;
  lastModified: Date;
};

/** Segments Next.js uses for non-indexable routes (groups, private folders, dynamic params). */
function isIndexableSegment(segment: string): boolean {
  return !/^[(_@[]/.test(segment);
}

function findPageFile(dir: string): string | null {
  for (const file of PAGE_FILES) {
    const candidate = join(dir, file);
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

function walk(dir: string, segments: string[], routes: DiscoveredRoute[]): void {
  const pageFile = findPageFile(dir);

  if (pageFile) {
    routes.push({
      path: segments.length ? `/${segments.join("/")}/` : "/",
      lastModified: statSync(pageFile).mtime,
    });
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !isIndexableSegment(entry.name)) continue;
    walk(join(dir, entry.name), [...segments, entry.name], routes);
  }
}

/** Discovers every static App Router page at build time, so new routes enter the sitemap automatically. */
export function getStaticRoutes(): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = [];
  walk(APP_DIR, [], routes);
  return routes.sort((a, b) => a.path.localeCompare(b.path));
}
