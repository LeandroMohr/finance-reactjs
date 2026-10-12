import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import { allNavItems, findToolGroup, siteConfig } from "@/config/site";

const tool = allNavItems.find((item) => item.slug === "first-million")!;
const group = findToolGroup(tool.slug)!;
const canonical = `/${tool.slug}/`;
const FirstMillionCalculator = dynamicImport(
  () => import("@/components/firstMillionCalculator/FirstMillionCalculator"),
);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Calculadora do Primeiro Milhão",
    description: tool.description,
    alternates: { canonical },
    openGraph: {
      title: `${siteConfig.name} | Calculadora do Primeiro Milhão`,
      description: tool.description,
      url: new URL(canonical, siteConfig.url).toString(),
      type: "website",
    },
  };
}

export default function FirstMillionPage() {
  return (
    <FirstMillionCalculator breadcrumb={
      <Breadcrumbs items={[{ label: group.label, href: `/${group.id}/` }, { label: tool.title }]} />
    } />
  );
}
