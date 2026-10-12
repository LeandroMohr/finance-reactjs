import { siteConfig } from "./site";

export const advertisingConfig = {
  clientId: "ca-pub-6525518606220983",
  calculatorSlotId: "9529373130",
  productionOrigin: new URL(siteConfig.url).origin,
  consentStorageKey: "lemo-finance:advertising-consent:v1",
} as const;
