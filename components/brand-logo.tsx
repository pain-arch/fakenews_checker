type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = "", compact = false }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${className}`.trim()}>
      <svg
        aria-hidden="true"
        className="brand-logo__mark"
        viewBox="0 0 48 48"
        fill="none"
      >
        <rect x="7" y="8" width="29" height="32" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M13 15h17M13 21h10M13 27h8M13 33h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="31.5" cy="30.5" r="7.5" stroke="currentColor" strokeWidth="2.5" />
        <path d="m37 36 5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 14v25a4 4 0 0 0 4 4h25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="brand-logo__name">Fake or Real</span>
      {!compact && <span className="brand-logo__ai">AI</span>}
    </span>
  );
}
