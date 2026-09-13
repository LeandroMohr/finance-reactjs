import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calc.lemohr.com.br"),
  title: {
    default: "Lemo | Calculadora de juros compostos",
    template: "%s | Lemo",
  },
  description:
    "Calculadora de juros compostos com simulação de aporte inicial, aporte mensal e projeção de crescimento financeiro.",
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
