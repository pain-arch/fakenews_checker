import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./auth-shell.module.css";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthShell({ children, eyebrow, title, description }: AuthShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.brandPanel} aria-labelledby="auth-title">
          <Link className={styles.brand} href="/" aria-label="Fake or Real home">
            <BrandLogo />
          </Link>
          <div className={styles.copy}>
            <p>{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <span>{description}</span>
          </div>
          <p className={styles.note}>
            News and AI-estimated analysis remain available to read without an account.
          </p>
        </section>
        <section className={styles.formPanel} aria-label={title}>
          {children}
        </section>
      </div>
    </main>
  );
}
