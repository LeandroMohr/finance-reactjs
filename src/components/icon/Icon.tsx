import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./Icon.module.scss";

const ICONS = {
  "chevron-down": "/img/icons/chevron-down.svg",
  sun: "/img/icons/sun.svg",
  moon: "/img/icons/moon.svg",
  menu: "/img/icons/menu.svg",
  close: "/img/icons/close.svg",
  whatsapp: "/img/icons/whatsapp.svg",
  facebook: "/img/icons/facebook.svg",
  "x-twitter": "/img/icons/x-twitter.svg",
  linkedin: "/img/icons/linkedin.svg",
  telegram: "/img/icons/telegram.svg",
  link: "/img/icons/link.svg",
  check: "/img/icons/check.svg",
  "arrow-up": "/img/icons/arrow-up.svg",
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  name: IconName;
  size?: number;
};

// Renders the svg as a CSS mask so it inherits `currentColor` and can be transformed like any element.
export default function Icon({ name, size = 20, className, style, ...props }: IconProps) {
  const maskStyle = {
    ...style,
    width: size,
    height: size,
    maskImage: `url(${ICONS[name]})`,
    WebkitMaskImage: `url(${ICONS[name]})`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={`${styles.icon} ${className ?? ""}`}
      style={maskStyle}
      {...props}
    />
  );
}
