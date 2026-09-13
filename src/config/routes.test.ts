import { describe, expect, it } from "vitest";
import { getStaticRoutes } from "./routes";
import { allNavItems } from "./site";

describe("getStaticRoutes", () => {
  const routes = getStaticRoutes();

  it("discovers the home route", () => {
    expect(routes.map((route) => route.path)).toContain("/");
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
});
