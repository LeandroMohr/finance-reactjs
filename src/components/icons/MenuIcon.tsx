import type { SVGProps } from "react";

type MenuIconProps = SVGProps<SVGSVGElement> & { open: boolean };

export default function MenuIcon({ open, ...props }: MenuIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}
