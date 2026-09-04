import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopNewsGrid } from "@/components/top-news-grid";
import { Chip } from "@/components/ui/chip";

const topics = [
  "World",
  "Politics",
  "Business & Markets",
  "Health & Medicine",
  "Technology",
  "Science",
  "Climate",
  "Sports",
] as const;

export default function Home() {
  return (
    <div className="editorial-shell">
      <SiteHeader />

      <section className="topic-rail" aria-label="News topics">
        <div className="container topic-rail__track">
          {topics.map((topic) => (
            <Chip key={topic}>{topic}</Chip>
          ))}
        </div>
      </section>

      <main className="home-main">
        <section className="container top-news-section" id="top-news" aria-labelledby="top-news-title">
          <div className="top-news-section__heading">
            <div>
              <p>Curated and analyzed reporting</p>
              <h1 id="top-news-title">Top News</h1>
            </div>
            <span>AI-assisted context for a more informed read</span>
          </div>
          <TopNewsGrid articles={[]} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
