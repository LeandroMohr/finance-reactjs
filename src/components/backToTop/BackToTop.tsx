"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import styles from "./BackToTop.module.scss";

const VISIBILITY_THRESHOLD = 480;

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const update = () => setIsVisible(window.scrollY > VISIBILITY_THRESHOLD);

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function handleClick() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${isVisible ? styles.visible : ""}`}
      onClick={handleClick}
      title="Voltar ao topo"
      aria-label="Voltar ao topo"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <Icon name="arrow-up" size={20} />
    </button>
  );
}
