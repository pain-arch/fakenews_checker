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
        <div className="news-card__signals">
          <span className={`signal-label signal-label--${sentimentLabel}`}>{sentimentLabel} sentiment</span>
          <span className="signal-label">AI-estimated: {framingLabel}</span>
          {safeConfidence !== undefined && (
            <span className="news-card__confidence">{Math.round(safeConfidence * 100)}% confidence</span>
          )}
        </div>
        <BiasMeter
          left={leftPercentage}
          center={centerPercentage}
          right={rightPercentage}
          label="AI-estimated framing"
        />
        <Link className="news-card__link" href={href}>
          Read the full analysis
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
