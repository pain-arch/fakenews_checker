import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export default function NewsNotFound() {
  return (
    <div className="editorial-shell">
      <SiteHeader activeRoute="none" />
      <main className={styles.notFoundMain}>
        <section className={styles.notFoundPanel}>
          <p className={styles.kicker}>Article not found</p>
          <h1>This story is not available.</h1>
          <p>The link may be incorrect, or the stored article may no longer be available.</p>
          <Link href="/#top-news">Return to Top News</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
