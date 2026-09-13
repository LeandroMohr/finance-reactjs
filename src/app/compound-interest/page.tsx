import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { siteConfig, tools } from "@/config/site";

const tool = tools.find((item) => item.slug === "compound-interest")!;
const canonical = `/${tool.slug}/`;

// Client bundle is split out of the page chunk and fetched only when this route is visited.
const CompoundInterestCalculator = dynamicImport(
  () => import("@/components/compoundInterestCalculator/CompoundInterestCalculator"),
);

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

export default function CompoundInterestPage() {
  return <CompoundInterestCalculator />;
}
