"use client";

import { useEffect, useRef, useState } from "react";
import { advertisingConfig } from "@/config/advertising";
import { useAdvertising } from "./AdvertisingProvider";
import styles from "./AdSlot.module.scss";

declare global {
  interface Window {
    adsbygoogle?: { push: (parameters: Record<string, never>) => unknown };
  }
}

export default function AdSlot() {
  const { canRequestAds, scriptStatus } = useAdvertising();
  const elementRef = useRef<HTMLModElement>(null);
  const initializedElement = useRef<HTMLModElement | null>(null);
  const [initializationFailed, setInitializationFailed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!canRequestAds || scriptStatus !== "ready" || !element) return;

    const initialize = () => {
      if (initializedElement.current === element || element.getBoundingClientRect().width <= 0) {
        return;
      }
      initializedElement.current = element;
      try {
        const pendingAds: Record<string, never>[] = [];
        (window.adsbygoogle ??= pendingAds).push({});
      } catch (error) {
        console.error("Unable to initialize the calculator ad slot.", error);
        setInitializationFailed(true);
      }
    };

    initialize();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(initialize);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", initialize);
    return () => window.removeEventListener("resize", initialize);
  }, [canRequestAds, scriptStatus]);

  if (!canRequestAds) return null;

  return (
    <section className={styles.slot} aria-label="Publicidade">
      <p className={styles.label}>Publicidade</p>
      <div className={styles.space}>
        <ins
          ref={elementRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={advertisingConfig.clientId}
          data-ad-slot={advertisingConfig.calculatorSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        {(scriptStatus === "error" || initializationFailed) && (
          <p className={styles.error} role="status">
            Não foi possível carregar a publicidade. A calculadora continua disponível.
          </p>
        )}
      </div>
    </section>
  );
}
