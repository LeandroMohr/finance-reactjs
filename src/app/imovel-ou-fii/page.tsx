import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import { allNavItems, findToolGroup, siteConfig } from "@/config/site";

const tool = allNavItems.find((item) => item.slug === "imovel-ou-fii")!;
const group = findToolGroup(tool.slug)!;
const canonical = `/${tool.slug}/`;
const PropertyVsFii = dynamicImport(() => import("@/components/propertyVsFii/PropertyVsFii"));

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical },
    openGraph: {
      title: `${siteConfig.name} | ${tool.title}`,
      description: tool.description,
      url: new URL(canonical, siteConfig.url).toString(),
      type: "website",
    },
  };
}

export default function PropertyVsFiiPage() {
  return <PropertyVsFii breadcrumb={
    <Breadcrumbs items={[{ label: group.label, href: `/${group.id}/` }, { label: tool.title }]} />
  } />;
}
