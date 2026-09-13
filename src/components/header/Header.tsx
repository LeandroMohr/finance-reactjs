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

        <button type="button" className={styles.themeToggle} aria-label="Alternar tema" onClick={toggleTheme}>
          {theme === "dark" ? "Modo claro" : "Modo escuro"}
        </button>
      </div>
    </header>
  );
}
