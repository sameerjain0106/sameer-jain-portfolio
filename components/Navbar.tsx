import Link from "next/link";
import { site } from "@/data/site";
import styles from "./JournalShell.module.css";

const navLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#profile", label: "Profile" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <nav className={`site-shell ${styles.nav}`} aria-label="Main navigation">
        <Link href="/" className={styles.identity} aria-label="Sameer Jain, home">
          <span className={styles.identityName}>Sameer Jain<span>Data Science / Statistics / ML</span></span>
        </Link>
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <a href={site.links.resume} target="_blank" rel="noopener noreferrer" className={styles.resume}>
          Résumé <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
