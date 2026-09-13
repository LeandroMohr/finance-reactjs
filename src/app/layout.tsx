import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";
import "@/styles/global.scss";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Calculadoras e Ferramentas Financeiras`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){ try { const saved = localStorage.getItem('theme'); const theme = saved || 'dark'; document.documentElement.setAttribute('data-theme', theme); document.documentElement.style.colorScheme = theme; } catch (e) {} })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
