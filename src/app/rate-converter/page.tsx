import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import { allNavItems, findToolGroup, siteConfig } from "@/config/site";

const tool = allNavItems.find((item) => item.slug === "rate-converter")!;
const group = findToolGroup(tool.slug)!;
const canonical = `/${tool.slug}/`;

// Client bundle is split out of the page chunk and fetched only when this route is visited.
const RateConverter = dynamicImport(() => import("@/components/rateConverter/RateConverter"));

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${tool.title}`,
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

export default function RateConverterPage() {
  return (
    <RateConverter
      breadcrumb={
        <Breadcrumbs items={[{ label: group.label, href: `/${group.id}/` }, { label: tool.title }]} />
      }
    />
  );
}
