import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BiasMeter } from "@/components/ui/bias-meter";
import { getArticleDetails } from "@/lib/supabase/queries/articles";
import styles from "./page.module.css";

type NewsDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatPublishedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function safeHttpUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function articleParagraphs(rawText: string): string[] {
  return rawText
    .split(/\r?\n(?:\s*\r?\n)+|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatScore(value: number): string {
  const clamped = Math.min(1, Math.max(-1, value));
  return `${clamped > 0 ? "+" : ""}${clamped.toFixed(2)}`;
}

export default async function NewsDetailsPage({ params }: NewsDetailsPageProps) {
  const { id } = await params;
  const details = await getArticleDetails(id);

  if (!details) {
    notFound();
  }

  const { article, source, analysis } = details;
  const publishedLabel = formatPublishedDate(article.published_at);
  const originalUrl = safeHttpUrl(article.canonical_url) ?? safeHttpUrl(article.original_url);
  const imageUrl = safeHttpUrl(article.image_url);
  const paragraphs = articleParagraphs(article.raw_text);

  return (
    <div className="editorial-shell">
      <SiteHeader activeRoute="none" />

      <main className={styles.main}>
        <div className={`container ${styles.layout}`}>
          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <p className={styles.eyebrow}>
                <span>{source.name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.published_at}>{publishedLabel}</time>
              </p>
              <h1>{article.title}</h1>
              {originalUrl && (
                <a
                  className={styles.originalLink}
                  href={originalUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Read original
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                    <path d="M8 5h7v7M15 5l-8.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 11.5V15H5V7h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </header>

            <figure className={styles.hero}>
              {imageUrl ? (
                // The source host is database-configured and cannot be represented by a safe static Next image allowlist.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={article.title} loading="eager" decoding="async" />
              ) : (
                <div className={styles.imageFallback} role="img" aria-label="Article image unavailable">
                  Article image unavailable
                </div>
              )}
            </figure>

            {analysis && (
              <section className={`${styles.panel} ${styles.glance}`} aria-labelledby="analysis-glance-title">
                <div className={styles.sectionHeading}>
                  <div>
                    <p className={styles.kicker}>AI-estimated analysis</p>
                    <h2 id="analysis-glance-title">Analysis at a glance</h2>
                  </div>
                  <span className={styles.confidenceBadge}>
                    {Math.round(Math.min(1, Math.max(0, analysis.confidence)) * 100)}% confidence
                  </span>
                </div>
                <BiasMeter
                  left={analysis.left_percentage}
                  center={analysis.center_percentage}
                  right={analysis.right_percentage}
                />
              </section>
            )}

            <section className={styles.articleBody} aria-labelledby="article-body-title">
              <h2 className="sr-only" id="article-body-title">Article</h2>
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 32)}`}>{paragraph}</p>
              ))}
            </section>
          </article>

          <aside className={styles.sidebar} aria-label="Article analysis">
            {analysis ? (
              <>
                <section className={styles.panel} aria-labelledby="framing-title">
                  <p className={styles.kicker}>AI-estimated analysis</p>
                  <h2 id="framing-title">Political framing</h2>
                  <p className={styles.overallLabel}>Overall framing</p>
                  <p className={styles.overallValue}>{analysis.bias_label}</p>
                  <BiasMeter
                    left={analysis.left_percentage}
                    center={analysis.center_percentage}
                    right={analysis.right_percentage}
                  />
                  <p className={styles.analysisNote}>
                    This signal estimates framing in the article text. It is context, not an objective rating of the story or source.
                  </p>
                </section>

                <section className={styles.panel} aria-labelledby="summary-title">
                  <p className={styles.kicker}>Generated summary</p>
                  <h2 id="summary-title">AI summary</h2>
                  <p className={styles.summary}>{analysis.summary}</p>
                </section>

                <section className={styles.panel} aria-labelledby="signals-title">
                  <p className={styles.kicker}>Stored signals</p>
                  <h2 id="signals-title">Analysis details</h2>
                  <dl className={styles.signalList}>
                    <div>
                      <dt>Sentiment</dt>
                      <dd className={styles.capitalize}>{analysis.sentiment_label}</dd>
                    </div>
                    <div>
                      <dt>Sentiment score</dt>
                      <dd>{formatScore(analysis.sentiment_score)}</dd>
                    </div>
                    <div>
                      <dt>Bias score</dt>
                      <dd>{formatScore(analysis.bias_score)}</dd>
                    </div>
                    <div>
                      <dt>Confidence</dt>
                      <dd>{Math.round(Math.min(1, Math.max(0, analysis.confidence)) * 100)}%</dd>
                    </div>
                  </dl>
                  <h3>Framing notes</h3>
                  <p className={styles.bodySmall}>{analysis.framing_notes}</p>
                  <h3>Loaded terms</h3>
                  {analysis.loaded_terms.length > 0 ? (
                    <ul className={styles.termList}>
                      {analysis.loaded_terms.map((term, index) => (
                        <li key={`${term}-${index}`}>{term}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyValue}>No loaded terms were identified.</p>
                  )}
                </section>

                <section className={`${styles.panel} ${styles.disclaimer}`} aria-labelledby="method-title">
                  <h2 id="method-title">About this analysis</h2>
                  <p>{analysis.disclaimer}</p>
                  <p className={styles.model}>Model: {analysis.model}</p>
                </section>
              </>
            ) : (
              <section className={`${styles.panel} ${styles.pending}`}>
                <span className={styles.pendingIcon} aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none">
                    <rect x="5" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M10 10h10M10 15h10M10 20h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="23.5" cy="23.5" r="5.5" fill="var(--color-background)" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p className={styles.kicker}>Analysis pending</p>
                <h2>Context is being prepared</h2>
                <p>
                  This article is stored and ready to read. Its AI analysis is not available yet.
                </p>
              </section>
            )}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
