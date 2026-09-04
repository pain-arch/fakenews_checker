import { NewsCard, type NewsCardProps } from "@/components/news-card";

type TopNewsGridProps = {
  articles: readonly NewsCardProps[];
};

function EmptyFeedIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="7" width="32" height="34" rx="4" stroke="currentColor" strokeWidth="2.25" />
      <path d="M13 15h18M13 22h18M13 29h11M13 35h8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="35" cy="34" r="8" fill="var(--color-surface)" stroke="currentColor" strokeWidth="2.25" />
      <path d="m40.5 39.5 3 3" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}

export function TopNewsGrid({ articles }: TopNewsGridProps) {
  if (articles.length === 0) {
    return (
      <div className="feed-empty-state">
        <span className="feed-empty-state__icon"><EmptyFeedIcon /></span>
        <div>
          <p className="feed-empty-state__label">No analyzed stories yet</p>
          <h2>The first edition is being prepared.</h2>
          <p>
            Stored articles will appear here after the news pipeline and analysis feed are connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-grid">
      {articles.map((article) => (
        <NewsCard key={article.href} {...article} />
      ))}
    </div>
  );
}
