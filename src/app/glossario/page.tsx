import type { Metadata } from "next";
import Glossary from "@/components/glossary/Glossary";
import { siteConfig } from "@/config/site";

const canonical = "/glossario/";
const description = "Glossário financeiro de A a Z: entenda Tesouro, fundos, índices, crédito e criptoativos, com busca, definições simples, fórmulas e exemplos.";

export const metadata: Metadata = {
  title: "Glossário financeiro",
  description,
  alternates: { canonical },
  openGraph: {
    title: `${siteConfig.name} | Glossário financeiro`,
    description,
    url: new URL(canonical, siteConfig.url).toString(),
    type: "website",
  },
};

export default function GlossaryPage() {
  return <Glossary />;
}
