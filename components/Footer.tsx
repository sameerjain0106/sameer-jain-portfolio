import { site } from "@/data/site";
import styles from "./JournalShell.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className={styles.footer}>
      <div className="site-shell">
        <div className={styles.footerHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Contact</p>
            <h2>LET’S MAKE<br />IT WORK.</h2>
          </div>
          <a href={`mailto:${site.links.email}`} className={styles.contactAction}>
            Get in touch <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className={styles.contactRow}>
          <a className={styles.email} href={`mailto:${site.links.email}`}>{site.links.email}</a>
          <div className={styles.socials} aria-label="Elsewhere">
            <a href={site.links.github} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
            <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a href={site.links.resume} target="_blank" rel="noopener noreferrer">Résumé <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className={styles.colophon}>
          <span>{site.name} · {site.location}</span>
          <span>© {year}</span>
          <a href="#top">Back to the top <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
