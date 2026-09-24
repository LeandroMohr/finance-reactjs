import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { siteConfig } from "@/config/site";
import "@/styles/global.scss";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | Calculadoras e Ferramentas Financeiras`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.name,
  category: "Finanças",
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="describedby" href="/llms.txt" />
      </head>
      <body className={inter.variable}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){ try { const saved = localStorage.getItem('theme'); const theme = saved || 'dark'; document.documentElement.setAttribute('data-theme', theme); document.documentElement.style.colorScheme = theme; } catch (e) {} })();`}
        </Script>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
