import { advertisingConfig } from "@/config/advertising";

const toolIds = [
  "juros-compostos", "primeiro-milhao", "conversor-de-taxas", "comprar-ou-alugar", "imovel-ou-fii",
] as const;

export type ToolId = typeof toolIds[number];
export type ShareMethod = "whatsapp" | "facebook" | "twitter" | "linkedin" | "telegram" | "copy";

type AnalyticsEvents = {
  simulation_start: { tool_id: ToolId };
  simulation_complete: { tool_id: ToolId };
  simulation_error: { tool_id: ToolId; error_code: "invalid_input" | "non_finite_result" };
  glossary_search: { result_count: number; query_length: number };
  share: { method: ShareMethod; content_type: "page"; item_id: string };
  faq_open: { faq_id: string };
  contact_click: { contact_method: "email" };
  related_tool_click: { target_tool_id: string };
  menu_click: { menu_location: "header" | "footer"; target_path: string };
};

declare global {
  interface Window {
    gtag?: (command: "event", name: keyof AnalyticsEvents, parameters: Record<string, string | number>) => void;
  }
}

export function isToolId(value: string | undefined): value is ToolId {
  return toolIds.some((id) => id === value);
}

export function trackEvent<K extends keyof AnalyticsEvents>(name: K, parameters: AnalyticsEvents[K]): boolean {
  if (typeof window === "undefined" || window.location.origin !== advertisingConfig.productionOrigin) return false;
  try {
    if (localStorage.getItem(advertisingConfig.consentStorageKey) !== "granted") return false;
  } catch (error) {
    console.error("Unable to read consent for Google Analytics.", error);
    return false;
  }
  if (!window.gtag) {
    console.warn("Google Analytics is not ready; event was not sent.", name);
    return false;
  }
  try {
    window.gtag("event", name, { ...parameters, page_path: window.location.pathname });
    return true;
  } catch (error) {
    console.error("Unable to send Google Analytics event.", name, error);
    return false;
  }
}
