"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { siteConfig } from "@/config/site";
import styles from "./ShareContent.module.scss";

type ShareContentProps = {
  /** Path of the page being shared, e.g. `/compound-interest/`. */
  path: string;
  /** Text used as the shared message on networks that accept one. */
  title: string;
  eyebrow?: string;
  heading?: string;
};

type ShareNetwork = {
  id: string;
  label: string;
  icon: IconName;
  buildHref: (url: string, message: string) => string;
};

const NETWORKS: ShareNetwork[] = [
  {
    id: "whatsapp",
    label: "Compartilhar no WhatsApp",
    icon: "whatsapp",
    buildHref: (url, message) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${message} - ${url}`)}`,
  },
  {
    id: "facebook",
    label: "Compartilhar no Facebook",
    icon: "facebook",
    buildHref: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "Compartilhar no X",
    icon: "x-twitter",
    buildHref: (url, message) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
  },
  {
    id: "linkedin",
    label: "Compartilhar no LinkedIn",
    icon: "linkedin",
    buildHref: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Compartilhar no Telegram",
    icon: "telegram",
    buildHref: (url, message) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
  },
];

export default function ShareContent({
  path,
  title,
  eyebrow = "Ajude mais pessoas",
  heading = "Compartilhe este conteúdo",
}: ShareContentProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const url = new URL(path, siteConfig.url).toString();
  const message = `${siteConfig.name} - ${title}`;

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      resetTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="share-content-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id="share-content-title" className={styles.title}>
          {heading}
        </h2>
      </div>

      <div className={styles.actions}>
        {NETWORKS.map((network) => (
          <a
            key={network.id}
            className={`${styles.button} ${styles[network.id]}`}
            href={network.buildHref(url, message)}
            target="_blank"
            rel="noopener noreferrer"
            title={network.label}
            aria-label={network.label}
          >
            <Icon name={network.icon} size={20} />
          </a>
        ))}

        <button
          type="button"
          className={`${styles.button} ${styles.copy}`}
          onClick={handleCopy}
          title="Copiar link"
          aria-label="Copiar link"
        >
          <Icon name={copied ? "check" : "link"} size={20} />
        </button>

        <p className={styles.feedback} role="status">
          {copied ? "Link copiado!" : ""}
        </p>
      </div>
    </section>
  );
}
