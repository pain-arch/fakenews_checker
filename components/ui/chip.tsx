import type { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  selected?: boolean;
  suffix?: "plus" | "none";
};

export function Chip({
  children,
  className = "",
  href,
  selected = false,
  suffix = "plus",
}: ChipProps) {
  const classes = `chip ${selected ? "chip--selected" : ""} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {suffix === "plus" && (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      )}
    </>
  );

  return href ? (
    <a className={classes} href={href}>
      {content}
    </a>
  ) : (
    <span className={classes}>{content}</span>
  );
}
