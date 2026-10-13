"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./FieldLabel.module.scss";

type FieldLabelProps = {
  label: string;
  tooltipText: string;
} & ({ htmlFor: string; id?: never } | { id: string; htmlFor?: never });

export default function FieldLabel({ htmlFor, id, label, tooltipText }: FieldLabelProps) {
  const [open, setOpen] = useState(false);
  const helpRef = useRef<HTMLSpanElement>(null);
  const rowRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const helpId = `${htmlFor ?? id}-tooltip`;

  useLayoutEffect(() => {
    if (!open || !rowRef.current || !triggerRef.current || !tooltipRef.current) return;
    const row = rowRef.current.getBoundingClientRect();
    const trigger = triggerRef.current.getBoundingClientRect();
    const { width, height } = tooltipRef.current.getBoundingClientRect();
    setPosition({
      left: Math.max(16, Math.min(row.left, window.innerWidth - width - 16)),
      top: Math.max(16, trigger.top - height),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !helpRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    const dismissOnScroll = () => setOpen(false);
    window.addEventListener("scroll", dismissOnScroll, true);
    window.addEventListener("resize", dismissOnScroll);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("scroll", dismissOnScroll, true);
      window.removeEventListener("resize", dismissOnScroll);
    };
  }, [open]);

  return (
    <span ref={rowRef} className={styles.labelRow}>
      {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
      <span ref={helpRef} className={styles.help}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}>
        <button ref={triggerRef} type="button" className={styles.trigger}
          aria-label={`Ajuda: ${label}`} aria-describedby={helpId}
          onFocus={() => setOpen(true)} onClick={() => setOpen(true)}>
          <span aria-hidden="true">?</span>
        </button>
        <span ref={tooltipRef} id={helpId} role="tooltip" className={styles.tooltip}
          style={position} hidden={!open}>
          {tooltipText}
        </span>
      </span>
    </span>
  );
}
