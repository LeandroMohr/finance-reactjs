import { siteConfig } from "./site";

export const advertisingConfig = {
  clientId: "ca-pub-6525518606220983",
  calculatorSlotId: "9529373130",
  analyticsMeasurementId: "G-NJ1DY9YD2D",
  productionOrigin: new URL(siteConfig.url).origin,
  consentStorageKey: "lemo-finance:advertising-analytics-consent:v2",
} as const;
