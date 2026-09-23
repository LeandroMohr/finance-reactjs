import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";
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
        <ChevronDownIcon className={styles.icon} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
