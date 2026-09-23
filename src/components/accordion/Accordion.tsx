import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import styles from "./Accordion.module.scss";

type AccordionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

// Native <details>/<summary> keeps the content in the DOM (and indexable) even while collapsed.
export default function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  return (
    <details className={styles.accordion} open={defaultOpen}>
      <summary className={styles.summary}>
        <span>{title}</span>
        <Icon name="chevron-down" size={16} className={styles.icon} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
