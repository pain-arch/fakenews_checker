import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="about">
      <div className="container site-footer__main">
        <div className="site-footer__brand">
          <BrandLogo compact />
          <p>Your curated news source, powered by people and technology.</p>
        </div>
        <div className="site-footer__note">
          <span>How to read the analysis</span>
          <p>
            Framing and sentiment are AI-estimated signals intended to add context, not objective
            judgments about a story or source.
          </p>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© 2026 Fake or Real. All rights reserved.</span>
        <span>Read broadly. Decide thoughtfully.</span>
      </div>
    </footer>
  );
}
