import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/config/site";

describe("discovery files", () => {
  it("allows crawling and advertises the sitemap", () => {
    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${siteConfig.url}/sitemap.xml`,
      host: siteConfig.url,
    });
  });

  it("lists every public page as an absolute URL", () => {
    const entries = sitemap();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries).toContainEqual(expect.objectContaining({ url: `${siteConfig.url}/` }));
    expect(entries.every(({ url }) => url.startsWith(`${siteConfig.url}/`))).toBe(true);
  });

  it("provides an installable web manifest", () => {
    expect(manifest()).toMatchObject({
      name: expect.stringContaining(siteConfig.name),
      start_url: "/",
      display: "standalone",
      lang: "pt-BR",
    });
  });

  it("provides a curated llms.txt with published tools", () => {
    const content = readFileSync(join(process.cwd(), "public", "llms.txt"), "utf8");

    expect(content).toMatch(/^# Lemo Finance/m);
    expect(content).toContain(`${siteConfig.url}/compound-interest/`);
    expect(content).toContain(`${siteConfig.url}/rate-converter/`);
    expect(content).toContain(`${siteConfig.url}/sitemap.xml`);
  });
});