import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import styles from "./Accordion.module.scss";

type AccordionProps = {
  summary: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  analyticsId?: string;
};

// Native <details>/<summary> keeps the content in the DOM (and indexable) even while collapsed.
export default function Accordion({ summary, defaultOpen = false, children, analyticsId }: AccordionProps) {
  return (
    <details className={styles.accordion} open={defaultOpen} data-analytics-faq-id={analyticsId}>
      <summary className={styles.summary}>
        <div className={styles.summaryContent}>{summary}</div>
        <Icon name="chevron-down" size={20} className={styles.icon} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
