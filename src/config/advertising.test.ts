import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { advertisingConfig } from "./advertising";
import { siteConfig } from "./site";

describe("advertisingConfig", () => {
  it("uses the provided account, slot and canonical production origin", () => {
    expect(advertisingConfig.clientId).toBe("ca-pub-6525518606220983");
    expect(advertisingConfig.calculatorSlotId).toBe("9529373130");
    expect(advertisingConfig.analyticsMeasurementId).toBe("G-NJ1DY9YD2D");
    expect(advertisingConfig.productionOrigin).toBe(new URL(siteConfig.url).origin);
    expect(advertisingConfig.consentStorageKey).toBe("lemo-finance:advertising-analytics-consent:v2");
  });

  it("publishes the authorized seller at the root with the matching publisher ID", () => {
    const adsTxt = readFileSync(path.resolve("public/ads.txt"), "utf8");
    const publisher = advertisingConfig.clientId.replace(/^ca-/, "");
    expect(adsTxt).toBe(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`);
  });
});
