import Image from "next/image";
import Link from "next/link";
import { BiasMeter } from "@/components/ui/bias-meter";

export type NewsCardProps = {
  title: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  sourceName: string;
  publishedDateTime: string;
  publishedLabel: string;
  sentimentLabel: "positive" | "neutral" | "negative";
  framingLabel: "left" | "center" | "right" | "mixed" | "unclear";
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  confidence?: number;
};

export function NewsCard({
  title,
  href,
  imageUrl,
  imageAlt,
  sourceName,
  publishedDateTime,
  publishedLabel,
  sentimentLabel,
  framingLabel,
  leftPercentage,
  centerPercentage,
  rightPercentage,
  confidence,
}: NewsCardProps) {
  const safeConfidence = confidence === undefined ? undefined : Math.min(1, Math.max(0, confidence));

  return (
    <article className="news-card">
      <div className="news-card__media">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 400px"
          className="news-card__image"
        />
        <Link className="news-card__info" href={href} aria-label={`Open analysis for ${title}`}>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7.75" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 9v5M10 6.25h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">
          <span>{sourceName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={publishedDateTime}>{publishedLabel}</time>
        </div>
        <h3 className="news-card__title">
          <Link href={href}>{title}</Link>
        </h3>
        <div className="news-card__signals" aria-label="Article analysis summary">
          <span className={`signal-label signal-label--${sentimentLabel}`}>{sentimentLabel} sentiment</span>
          <span className="signal-label">AI-estimated framing: {framingLabel}</span>
          {safeConfidence !== undefined && (
            <span className="news-card__confidence">{Math.round(safeConfidence * 100)}% confidence</span>
          )}
        </div>
        <BiasMeter
          left={leftPercentage}
          center={centerPercentage}
          right={rightPercentage}
          label="AI-estimated framing"
          variant="compact"
        />
      </div>
    </article>
  );
}
