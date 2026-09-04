type BiasMeterProps = {
  left: number;
  center: number;
  right: number;
  className?: string;
  label?: string;
  variant?: "default" | "compact";
};

type NormalizedFraming = {
  left: number;
  center: number;
  right: number;
};

function safeValue(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function normalizeFraming(left: number, center: number, right: number): NormalizedFraming {
  const safe = [safeValue(left), safeValue(center), safeValue(right)];
  const total = safe.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return { left: 0, center: 100, right: 0 };
  }

  const normalizedLeft = (safe[0] / total) * 100;
  const normalizedCenter = (safe[1] / total) * 100;

  return {
    left: normalizedLeft,
    center: normalizedCenter,
    right: Math.max(0, 100 - normalizedLeft - normalizedCenter),
  };
}

function formatPercentage(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function BiasMeter({
  left,
  center,
  right,
  className = "",
  label = "AI-estimated political framing",
  variant = "default",
}: BiasMeterProps) {
  const values = normalizeFraming(left, center, right);
  const ariaLabel = `${label}: left ${formatPercentage(values.left)}, center ${formatPercentage(values.center)}, right ${formatPercentage(values.right)}`;

  return (
    <figure className={`bias-meter bias-meter--${variant} ${className}`.trim()} aria-label={ariaLabel}>
      <figcaption className={variant === "compact" ? "sr-only" : "bias-meter__title"}>{label}</figcaption>
      <div className="bias-meter__track" aria-hidden="true">
        <span className="bias-meter__segment bias-meter__segment--left" style={{ width: `${values.left}%` }}>
          {variant === "compact" && <span>Left {formatPercentage(values.left)}</span>}
        </span>
        <span className="bias-meter__segment bias-meter__segment--center" style={{ width: `${values.center}%` }}>
          {variant === "compact" && <span>Center {formatPercentage(values.center)}</span>}
        </span>
        <span className="bias-meter__segment bias-meter__segment--right" style={{ width: `${values.right}%` }}>
          {variant === "compact" && <span>Right {formatPercentage(values.right)}</span>}
        </span>
      </div>
      {variant === "default" && (
        <div className="bias-meter__legend">
          <span><i className="bias-meter__dot bias-meter__dot--left" />Left <strong>{formatPercentage(values.left)}</strong></span>
          <span><i className="bias-meter__dot bias-meter__dot--center" />Center <strong>{formatPercentage(values.center)}</strong></span>
          <span><i className="bias-meter__dot bias-meter__dot--right" />Right <strong>{formatPercentage(values.right)}</strong></span>
        </div>
      )}
    </figure>
  );
}
