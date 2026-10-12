import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import { getStaticRoutes } from "./routes";
import { allNavItems } from "./site";

describe("getStaticRoutes", () => {
  const routes = getStaticRoutes();

  it("discovers the home route", () => {
    expect(routes.map((route) => route.path)).toContain("/");
  });

  it("uses Portuguese paths without keeping the old public routes", () => {
    const paths = routes.map((route) => route.path);
    for (const path of ["/juros-compostos/", "/primeiro-milhao/", "/conversor-de-taxas/", "/perguntas-frequentes/"]) {
      expect(paths).toContain(path);
    }
    for (const path of ["/compound-interest/", "/first-million/", "/rate-converter/", "/faq/"]) {
      expect(paths).not.toContain(path);
      expect(sitemap().some((entry) => new URL(entry.url).pathname === path)).toBe(false);
    }
  });

  it("discovers a route for every available tool", () => {
    const paths = routes.map((route) => route.path);

    for (const item of allNavItems.filter((entry) => entry.available)) {
      expect(paths).toContain(`/${item.slug}/`);
    }
  });

  it("does not expose routes for tools that are not implemented yet", () => {
    const paths = routes.map((route) => route.path);

    for (const item of allNavItems.filter((entry) => !entry.available)) {
      expect(paths).not.toContain(`/${item.slug}/`);
    }
  });

  it("exposes a modification date for each route", () => {
    for (const route of routes) {
      expect(route.lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN(route.lastModified.getTime())).toBe(false);
    }
  });

  it("uses the production domain for every sitemap URL", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(routes.length);

    for (const entry of entries) {
      expect(new URL(entry.url).origin).toBe("https://lemohr.com.br");
    }
  });
});
