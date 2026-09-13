"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navGroups, siteConfig } from "@/config/site";
import { useTheme } from "./useTheme";
import styles from "./Header.module.scss";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

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
