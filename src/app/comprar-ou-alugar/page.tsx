import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import { allNavItems, findToolGroup, siteConfig } from "@/config/site";

const tool = allNavItems.find((item) => item.slug === "comprar-ou-alugar")!;
const group = findToolGroup(tool.slug)!;
const canonical = `/${tool.slug}/`;
const BuyOrRent = dynamicImport(() => import("@/components/propertyBuyOrRent/BuyOrRent"));

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

export default function BuyOrRentPage() {
  return <BuyOrRent breadcrumb={
    <Breadcrumbs items={[{ label: group.label, href: `/${group.id}/` }, { label: tool.title }]} />
  } />;
}
