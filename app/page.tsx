import { BrandLogo } from "@/components/brand-logo";
import { BiasMeter } from "@/components/ui/bias-meter";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SentimentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 14.5c1.7 1.8 5.3 1.8 7 0M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FramingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 19v-6M12 19V5M19 19v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m4 9 5-4 4 3 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyNewsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="7" width="31" height="34" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M15 15h17M15 22h17M15 29h10M15 35h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="34" r="8" fill="var(--color-surface)" stroke="currentColor" strokeWidth="2.5" />
      <path d="m39.5 39.5 4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const categories = ["Politics", "World", "Business & Markets", "Technology"];

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <a className="site-header__brand" href="#top" aria-label="Fake or Real home">
            <BrandLogo />
          </a>
          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#latest">Latest analysis</a>
            <a href="#about">How it works</a>
          </nav>
          <Button href="#latest" size="small" className="site-header__action">
            Explore stories
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero__grid">
            <div className="hero__content">
              <p className="eyebrow">
                <span aria-hidden="true" />
                Clarity for every headline
              </p>
              <h1 id="hero-title">Understand the story behind the story.</h1>
              <p className="hero__lede">
                Your curated news source, powered by people and technology. See concise summaries,
                sentiment, and AI-estimated political framing in one clear view.
              </p>
              <div className="hero__actions">
                <Button href="#latest">
                  Browse latest analysis
                  <ArrowIcon />
                </Button>
                <Button href="#about" variant="secondary">
                  How analysis works
                </Button>
              </div>
              <p className="hero__note">
                Analysis is designed to inform your reading—not decide what you should think.
              </p>
            </div>

            <aside className="insight-card" aria-labelledby="insight-card-title">
              <div className="insight-card__header">
                <span>Analysis preview</span>
                <span className="status-badge"><i />AI-assisted</span>
              </div>
              <h2 id="insight-card-title">A clearer read, in three signals</h2>
              <ul className="signal-list">
                <li>
                  <span className="signal-list__icon"><SummaryIcon /></span>
                  <span><strong>Neutral summary</strong><small>The essential context, without the noise.</small></span>
                </li>
                <li>
                  <span className="signal-list__icon"><SentimentIcon /></span>
                  <span><strong>Sentiment</strong><small>The emotional tone carried by the reporting.</small></span>
                </li>
                <li>
                  <span className="signal-list__icon"><FramingIcon /></span>
                  <span><strong>Political framing</strong><small>An AI estimate based on the article text.</small></span>
                </li>
              </ul>
              <BiasMeter left={25} center={50} right={25} />
              <p className="insight-card__disclaimer">Example visualization—not an assessment of a real article.</p>
            </aside>
          </div>
        </section>

        <section className="category-bar" aria-label="News categories">
          <div className="container category-bar__inner">
            <span className="category-bar__label">Explore by topic</span>
            <div className="chip-row">
              <Chip selected suffix="none">All stories</Chip>
              {categories.map((category) => (
                <Chip key={category}>{category}</Chip>
              ))}
            </div>
          </div>
        </section>

        <section className="latest-section" id="latest" aria-labelledby="latest-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Fresh perspectives</p>
                <h2 id="latest-title">Latest analysis</h2>
              </div>
              <p>Stored, analyzed articles will appear here as soon as the news pipeline is connected.</p>
            </div>

            <div className="empty-state">
              <span className="empty-state__icon"><EmptyNewsIcon /></span>
              <div className="empty-state__content">
                <p className="empty-state__eyebrow">Ready for the first edition</p>
                <h3>Analysis is on its way</h3>
                <p>
                  There are no analyzed articles to show yet. Once sources are connected, every card
                  will include its source, publication date, sentiment, framing estimate, and confidence.
                </p>
              </div>
              <Button href="#about" variant="outline">
                See what to expect
                <ArrowIcon />
              </Button>
            </div>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="container about-section__grid">
            <div className="about-section__intro">
              <p className="section-kicker">People first. Technology in support.</p>
              <h2 id="about-title">More context, fewer assumptions.</h2>
              <p>
                Fake or Real organizes analysis into a few useful signals, while keeping the original
                reporting at the center of your reading.
              </p>
            </div>
            <ol className="process-list">
              <li>
                <span>01</span>
                <div><h3>Collect</h3><p>Articles come from configured, active news sources.</p></div>
              </li>
              <li>
                <span>02</span>
                <div><h3>Analyze</h3><p>AI produces validated summaries and framing signals.</p></div>
              </li>
              <li>
                <span>03</span>
                <div><h3>Read critically</h3><p>You get concise context and a direct path to the full story.</p></div>
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <BrandLogo compact />
          <p>Your curated news source, powered by people and technology.</p>
          <p>AI estimates are context, not objective truth.</p>
        </div>
      </footer>
    </div>
  );
}
