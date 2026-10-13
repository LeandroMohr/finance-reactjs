"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isToolId, trackEvent, type ShareMethod } from "@/utils/analytics";

export default function AnalyticsEvents({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    const started = new Set<string>();
    const startSimulation = (target: Element) => {
      const toolId = target.closest<HTMLElement>("[data-analytics-tool]")?.dataset.analyticsTool;
      if (isToolId(toolId) && !started.has(toolId) && trackEvent("simulation_start", { tool_id: toolId })) {
        started.add(toolId);
      }
    };
    const onInput = (event: Event) => {
      if ((event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) &&
        event.target.closest("[data-analytics-input]")) {
        startSimulation(event.target);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("[data-analytics-simulation-interaction]")) startSimulation(event.target);
      const link = event.target.closest<HTMLAnchorElement>("a");
      if (!link) return;
      const menuLocation = link.closest<HTMLElement>("[data-analytics-menu]")?.dataset.analyticsMenu;
      if ((menuLocation === "header" || menuLocation === "footer") && link.origin === window.location.origin) {
        trackEvent("menu_click", { menu_location: menuLocation, target_path: link.pathname });
      }
      const method = link.dataset.analyticsShare;
      if (method) {
        const methods: ShareMethod[] = ["whatsapp", "facebook", "twitter", "linkedin", "telegram"];
        const shareMethod = methods.find((value) => value === method);
        if (shareMethod) trackEvent("share", { method: shareMethod, content_type: "page", item_id: link.dataset.analyticsItem ?? pathname });
      }
      if (link.dataset.analyticsRelatedTool) {
        trackEvent("related_tool_click", { target_tool_id: link.dataset.analyticsRelatedTool });
      }
      if (link.getAttribute("href")?.startsWith("mailto:")) {
        trackEvent("contact_click", { contact_method: "email" });
      }
    };
    const onToggle = (event: Event) => {
      if (event.target instanceof HTMLDetailsElement && event.target.open && event.target.dataset.analyticsFaqId) {
        trackEvent("faq_open", { faq_id: event.target.dataset.analyticsFaqId });
      }
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, [enabled, pathname]);

  return null;
}
