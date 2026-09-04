import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 8h11M8 2.25c1.45 1.55 2.2 3.47 2.2 5.75S9.45 12.2 8 13.75C6.55 12.2 5.8 10.28 5.8 8S6.55 3.8 8 2.25Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

type SiteHeaderProps = {
  activeRoute?: "home" | "none";
};

export function SiteHeader({ activeRoute = "home" }: SiteHeaderProps) {
  return (
    <>
      <div className="utility-bar">
        <div className="container utility-bar__inner">
          <span>Independent news analysis</span>
          <span className="utility-bar__edition">
            <GlobeIcon />
            International edition
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="site-header__brand" href="/" aria-label="Fake or Real home">
            <BrandLogo />
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            <Link
              className={`site-nav__link${activeRoute === "home" ? " site-nav__link--active" : ""}`}
              href="/"
              aria-current={activeRoute === "home" ? "page" : undefined}
            >
              Home
            </Link>
          </nav>
          <div className="site-header__actions">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <Button variant="secondary" size="small">Log in</Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button size="small">Sign up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <span className="site-header__user">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: { height: "40px", width: "40px" },
                      userButtonTrigger: { borderRadius: "8px" },
                    },
                  }}
                />
              </span>
            </Show>
          </div>
        </div>
      </header>
    </>
  );
}
