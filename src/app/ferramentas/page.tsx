import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs/Breadcrumbs";
import ToolGrid from "@/components/toolGrid/ToolGrid";
import { navGroups, siteConfig } from "@/config/site";
import styles from "./page.module.scss";

const group = navGroups.find((item) => item.id === "ferramentas")!;
const canonical = `/${group.id}/`;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: group.label,
    description: group.description,
    alternates: { canonical },
    openGraph: {
      title: `${siteConfig.name} | ${group.label}`,
      description: group.description,
      url: new URL(canonical, siteConfig.url).toString(),
      type: "website",
    },
  };
}

export default function FerramentasPage() {
  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: group.label }]} />

      <section className={styles.hero}>
        <h1 className={styles.title}>{group.label}</h1>
        <p className={styles.subtitle}>{group.description}</p>
      </section>

      <ToolGrid items={group.items} />
    </main>
  );
}
