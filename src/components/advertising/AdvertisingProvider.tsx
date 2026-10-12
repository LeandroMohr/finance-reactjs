"use client";

import Link from "next/link";
import Script from "next/script";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { advertisingConfig } from "@/config/advertising";
import styles from "./AdvertisingProvider.module.scss";

type ConsentChoice = "granted" | "denied";
type ScriptStatus = "idle" | "ready" | "error";
type ConsentSnapshot = ConsentChoice | "pending" | "unknown" | "invalid" | "unavailable";

const consentChangedEvent = "lemo:advertising-consent-change";

function subscribeToConsent(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === advertisingConfig.consentStorageKey || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(consentChangedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(consentChangedEvent, onChange);
  };
}

function readConsent(): ConsentSnapshot {
  try {
    const stored = localStorage.getItem(advertisingConfig.consentStorageKey);
    if (stored === "granted" || stored === "denied") return stored;
    return stored === null ? "unknown" : "invalid";
  } catch (error) {
    console.error("Unable to read advertising consent.", error);
    return "unavailable";
  }
}

function readProductionOrigin() {
  return window.location.origin === advertisingConfig.productionOrigin;
}

type AdvertisingContextValue = {
  canRequestAds: boolean;
  scriptStatus: ScriptStatus;
  openPreferences: () => void;
};

const AdvertisingContext = createContext<AdvertisingContextValue | null>(null);

export function useAdvertising() {
  const context = useContext(AdvertisingContext);
  if (!context) {
    throw new Error("Advertising components must be inside AdvertisingProvider.");
  }
  return context;
}

export function AdvertisingPreferencesButton({ className }: { className?: string }) {
  const { openPreferences } = useAdvertising();
  return (
    <button type="button" className={className} onClick={openPreferences}>
      Preferências de privacidade
    </button>
  );
}

export default function AdvertisingProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeToConsent, readConsent, (): ConsentSnapshot => "pending");
  const isProduction = useSyncExternalStore(subscribeToConsent, readProductionOrigin, () => false);
  const consent = snapshot === "granted" || snapshot === "denied" ? snapshot : null;
  const initialized = snapshot !== "pending";
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>("idle");
  const [storageError, setStorageError] = useState("");
  const scriptRequested = useRef(false);
  const preferencesRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (snapshot === "invalid") {
      console.warn("Invalid advertising consent preference; requesting a new choice.");
    }
  }, [snapshot]);

  useEffect(() => {
    if (preferencesOpen) preferencesRef.current?.focus();
  }, [preferencesOpen]);

  const closePreferences = () => {
    setPreferencesOpen(false);
    triggerRef.current?.focus();
  };

  const saveConsent = (choice: ConsentChoice) => {
    try {
      localStorage.setItem(advertisingConfig.consentStorageKey, choice);
    } catch (error) {
      console.error("Unable to save advertising consent.", error);
      setStorageError(
        "Não foi possível salvar sua escolha. Verifique o armazenamento do navegador e tente novamente.",
      );
      return;
    }
    setStorageError("");
    window.dispatchEvent(new Event(consentChangedEvent));
    closePreferences();
  };

  const canRequestAds = initialized && isProduction && consent === "granted";
  const showPreferences = initialized && (preferencesOpen || (isProduction && consent === null));
  const refusalRequiresReload = canRequestAds || scriptStatus !== "idle";
  const preferenceError = storageError || (snapshot === "unavailable"
    ? "Não foi possível ler suas preferências. A publicidade e a análise de uso estão bloqueadas."
    : "");

  useEffect(() => {
    if (canRequestAds) {
      scriptRequested.current = true;
    } else if (scriptRequested.current) {
      // Unmounting a script does not stop code that has already executed.
      scriptRequested.current = false;
      window.location.reload();
    }
  }, [canRequestAds]);

  return (
    <AdvertisingContext.Provider value={{
      canRequestAds,
      scriptStatus,
      openPreferences: () => {
        triggerRef.current = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
        setPreferencesOpen(true);
      },
    }}>
      {children}
      {canRequestAds && (
        <>
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
              gtag('js', new Date());
              gtag('config', '${advertisingConfig.analyticsMeasurementId}', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
          <Script
            id="google-analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${advertisingConfig.analyticsMeasurementId}`}
            strategy="afterInteractive"
            onError={(error) => {
              console.error("Unable to load Google Analytics.", error);
            }}
          />
        </>
      )}
      {canRequestAds && (
        <Script
          id="google-adsense"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${advertisingConfig.clientId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
          onLoad={() => { scriptRequested.current = true; }}
          onReady={() => {
            scriptRequested.current = true;
            setScriptStatus("ready");
          }}
          onError={(error) => {
            console.error("Unable to load Google AdSense.", error);
            setScriptStatus("error");
          }}
        />
      )}
      {showPreferences && (
        <section
          ref={preferencesRef}
          className={styles.preferences}
          aria-labelledby="advertising-preferences-title"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape" && consent !== null) closePreferences();
          }}
        >
          <div className={styles.content}>
            <h2 id="advertising-preferences-title">Publicidade, análise e sua privacidade</h2>
            <p>
              Com sua autorização, carregamos o Google Analytics para medir visitas e navegação
              e o Google AdSense para exibir, personalizar e medir publicidade. Esses serviços
              podem usar cookies e dados do dispositivo. Uma única escolha vale para ambos.
              Não enviamos os valores das simulações. Recusar não limita o uso das calculadoras.
            </p>
            <p>
              Você pode mudar sua escolha no rodapé.{" "}
              <Link href="/politica-de-privacidade/">Leia a política de privacidade.</Link>
            </p>
            {refusalRequiresReload && (
              <p>
                Ao recusar, esta página será recarregada para interromper os scripts de
                publicidade e análise de uso. Os valores preenchidos serão reiniciados.
              </p>
            )}
            {preferenceError && <p role="alert">{preferenceError}</p>}
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => saveConsent("denied")}>
              {refusalRequiresReload ? "Recusar e recarregar" : "Recusar publicidade e análise"}
            </button>
            <button type="button" onClick={() => saveConsent("granted")}>
              Aceitar publicidade e análise
            </button>
            {consent !== null && (
              <button type="button" onClick={closePreferences}>Fechar preferências</button>
            )}
          </div>
        </section>
      )}
    </AdvertisingContext.Provider>
  );
}
