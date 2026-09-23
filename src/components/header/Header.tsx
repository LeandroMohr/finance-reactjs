"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { navGroups, siteConfig } from "@/config/site";
import styles from "./Header.module.scss";

type Theme = "dark" | "light";

// The pre-hydration script in the root layout sets `data-theme`, so the DOM is the source of truth.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  window.localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.5 14.8A8.8 8.8 0 0 1 9.2 3.5a8.5 8.5 0 1 0 11.3 11.3Z" />
    </svg>
  );
}

export default function Header() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => "dark" as Theme);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => {
    if (!openGroup) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openGroup]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            L
          </span>
          <span className={styles.brandName}>{siteConfig.name}</span>
        </Link>

        <nav ref={navRef} className={styles.nav} aria-label="Navegação principal">
          <Link href="/" className={styles.navLink}>
            Home
          </Link>

          {navGroups.map((group) => {
            const isOpen = openGroup === group.id;

            return (
              <div key={group.id} className={styles.group}>
                <button
                  type="button"
                  className={styles.navLink}
                  aria-expanded={isOpen}
                  aria-controls={`menu-${group.id}`}
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                >
                  {group.label}
                  <span className={styles.chevron} data-open={isOpen} aria-hidden="true" />
                </button>

                <ul id={`menu-${group.id}`} className={styles.menu} data-open={isOpen}>
                  {group.items.map((item) =>
                    item.available ? (
                      <li key={item.slug}>
                        <Link
                          href={`/${item.slug}/`}
                          className={styles.menuItem}
                          onClick={() => setOpenGroup(null)}
                        >
                          <span className={styles.menuTitle}>{item.title}</span>
                          <span className={styles.menuDescription}>{item.description}</span>
                        </Link>
                      </li>
                    ) : (
                      <li key={item.slug}>
                        <span className={styles.menuItemDisabled} aria-disabled="true">
                          <span className={styles.menuTitle}>
                            {item.title}
                            <span className={styles.soonBadge}>em breve</span>
                          </span>
                          <span className={styles.menuDescription}>{item.description}</span>
                        </span>
                      </li>
                    ),
                  )}
                  <li className={styles.menuFooter}>{group.emptyMessage}</li>
                </ul>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          className={styles.themeToggle}
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
