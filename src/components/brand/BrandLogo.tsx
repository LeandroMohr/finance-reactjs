import { siteConfig } from "@/config/site";
import styles from "./BrandLogo.module.scss";

type BrandLogoProps = {
  variant: "horizontal" | "vertical";
  className?: string;
};

const SIZES = {
  horizontal: { width: 680, height: 228 },
  vertical: { width: 623, height: 630 },
} as const;

// Both theme variants are rendered and CSS shows the one matching `data-theme`, so there is no flash on first paint.
export default function BrandLogo({ variant, className }: BrandLogoProps) {
  const { width, height } = SIZES[variant];
  const classes = (extra: string) => [styles.logo, extra, className].filter(Boolean).join(" ");

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, SVG needs no optimization */}
      <img
        src={`/brand/logo-${variant}-dark.svg`}
        alt={siteConfig.name}
        width={width}
        height={height}
        className={classes(styles.dark)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, SVG needs no optimization */}
      <img
        src={`/brand/logo-${variant}-light.svg`}
        alt={siteConfig.name}
        width={width}
        height={height}
        className={classes(styles.light)}
      />
    </>
  );
}
