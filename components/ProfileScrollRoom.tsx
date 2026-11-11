"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { useAmbientMotion } from "@/lib/useAmbientMotion";
import KineticSculpture from "./KineticSculpture";
import styles from "./ProfileScrollRoom.module.css";

type Props = { active: boolean; scrollRoot: HTMLElement | null };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const leafNames = ["The person", "The foundation", "The instruments"];

function EducationContent({ compact = false }: { compact?: boolean }) {
  const education = site.education[0];
  return <>
    <div className={styles.degree}>
      <p>{education.school}</p>
      <h3>{education.degree}</h3>
      <p className={styles.concentration}>{education.concentration}</p>
      <dl><div><dt>GPA</dt><dd>{education.gpa}</dd></div><div><dt>Expected graduation</dt><dd>{education.period}</dd></div></dl>
      <p className={styles.honors}>{education.honors}</p>
    </div>
    <div className={styles.coursework}>
      <h3>Inside the coursework</h3>
      <ul>{education.coursework.map(course => <li key={course}>{course}</li>)}</ul>
      <p>Current study includes Decision &amp; Data Analytics and Constraint Programming.</p>
      {!compact && <span className={styles.pencilLine} aria-hidden="true" />}
    </div>
  </>;
}

/** A three-leaf field notebook. Scroll folds the paper itself, with reading pauses. */
export default function ProfileScrollRoom({ active, scrollRoot }: Props) {
  const titleId = useId();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [firstName, ...lastName] = site.name.split(" ");
  useAmbientMotion(active, scrollRoot, stage);

  useEffect(() => {
    const section = root.current;
    const book = section?.querySelector<HTMLElement>("[data-profile-book]");
    if (!section || !book || !scrollRoot || !active) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const counter = section.querySelector<HTMLElement>("[data-profile-counter]");
    const leaves = Array.from(section.querySelectorAll<HTMLElement>("[data-profile-leaf]"));
    let owned: ScrollTrigger | undefined;
    let disposed = false;
    let frame = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    function paint(progress: number) {
      if (document.hidden) return;
      const cover = smooth((progress - .12) / .28);
      const education = smooth((progress - .56) / .28);
      const leaf = progress < .4 ? 0 : progress < .84 ? 1 : 2;
      section!.style.setProperty("--cover-fold", `${cover * -112}deg`);
      section!.style.setProperty("--education-fold", `${education * -112}deg`);
      section!.style.setProperty("--tool-spread", String(.94 + education * .06));
      section!.style.setProperty("--book-progress", String(progress));
      section!.style.setProperty("--fold-shadow", String(Math.sin(cover * Math.PI) * .24));
      section!.dataset.profileProgress = progress.toFixed(4);
      section!.dataset.profileLeaf = String(leaf);
      if (counter) counter.textContent = `${String(leaf + 1).padStart(2, "0")} / 03 · ${leafNames[leaf]}`;
    }

    function configure() {
      frame = 0;
      if (disposed || !scrollRoot!.clientWidth || !scrollRoot!.clientHeight) return;
      owned?.kill();
      owned = undefined;
      lastWidth = scrollRoot!.clientWidth;
      lastHeight = scrollRoot!.clientHeight;
      const enhanced = !reduced.matches && lastHeight >= 620;
      section!.dataset.profileEnhanced = String(enhanced);
      section!.style.setProperty("--profile-height", `${lastHeight}px`);
      leaves.forEach(leaf => {
        leaf.inert = enhanced;
        if (enhanced) leaf.setAttribute("aria-hidden", "true");
        else leaf.removeAttribute("aria-hidden");
      });
      if (!enhanced) return;
      owned = ScrollTrigger.create({
        trigger: book, scroller: scrollRoot!, start: "top top", end: "bottom bottom",
        onUpdate: self => paint(self.progress), onRefresh: self => paint(self.progress),
      });
      paint(owned.progress);
    }
    function schedule() { if (!disposed && !frame) frame = requestAnimationFrame(configure); }
    const resize = new ResizeObserver(() => {
      if (scrollRoot!.clientWidth !== lastWidth || scrollRoot!.clientHeight !== lastHeight) schedule();
    });
    function visibility() { if (!document.hidden) { owned?.refresh(); if (owned) paint(owned.progress); } }
    resize.observe(scrollRoot);
    reduced.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(() => { if (!disposed) { owned?.refresh(); if (owned) paint(owned.progress); } });
    configure();
    return () => {
      disposed = true; cancelAnimationFrame(frame); owned?.kill(); resize.disconnect();
      reduced.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", visibility);
      // Keep the composed leaves and track height intact while Map is open.
    };
  }, [active, scrollRoot]);

  return <div ref={root} id="about" className={styles.room} data-profile-journey data-active={active}>
    <div className={styles.transcript}>
      <h1>{site.name}: the person behind the work</h1><p>{site.tagline}</p>
      <dl>{site.heroStats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
      <h2>Academic foundation</h2><EducationContent compact />
      <h2>Working toolkit</h2>{site.skillGroups.map(group => <section key={group.label}><h3>{group.label}</h3><p>{group.items.join(", ")}</p></section>)}
    </div>
    <div className={styles.book} data-profile-book>
      <div ref={stage} className={styles.stage} data-profile-stage data-room-surface data-surface-positioned data-room-heading tabIndex={-1} aria-label="Sameer Jain's background. Scroll to unfold education and working tools.">
        <article className={`${styles.leaf} ${styles.cover}`} data-profile-leaf="0" aria-labelledby={`${titleId}-name`}>
          <div className={styles.coverCopy}><span className={styles.pageLabel}>The person behind the work</span><h1 id={`${titleId}-name`}>{firstName}<br />{lastName.join(" ")}.</h1><p className={styles.lede}>{site.tagline}</p><span className={styles.scrollCue}>Scroll to unfold my background <span aria-hidden="true">↓</span></span></div>
          <div className={styles.orbit} aria-hidden="true" data-ambient-art="profile"><KineticSculpture kind="orbit" active={active} scrollRoot={scrollRoot} /><div className={styles.orbitNote}><span>Georgia Tech</span><strong>Engineering<br />&amp; curiosity.</strong><span>{site.location}</span></div></div>
          <dl className={styles.coverFacts}>{site.heroStats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
          <span className={styles.corner} aria-hidden="true" />
        </article>
        <article id="education" className={`${styles.leaf} ${styles.education}`} data-profile-leaf="1" aria-labelledby={`${titleId}-education`}>
          <header className={styles.educationHead}><span className={styles.pageLabel}>Academic foundation</span><h2 id={`${titleId}-education`}>Thinking in<br />systems.</h2><span className={styles.year} aria-hidden="true">2028</span></header>
          <div className={styles.educationGrid}><EducationContent /></div>
          <span className={styles.corner} aria-hidden="true" />
        </article>
        <article className={`${styles.leaf} ${styles.toolkit}`} data-profile-leaf="2" aria-labelledby={`${titleId}-tools`}>
          <header className={styles.toolkitHead}><span className={styles.pageLabel}>Working toolkit</span><h2 id={`${titleId}-tools`}>Ideas need<br />instruments.</h2><p>From image features to data pipelines, these are the tools and methods I work with.</p></header>
          <div className={styles.toolGroups}>{site.skillGroups.map((group, i) => <section key={group.label} className={styles.toolGroup} data-profile-tools={i}><span className={styles.toolTab} aria-hidden="true" /><h3>{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
        </article>
        <div className={styles.bookEdge} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className={styles.bookIndex} aria-hidden="true"><span data-profile-counter>01 / 03 · The person</span><span className={styles.progress}><i /></span><span>A few pages about me</span></div>
      </div>
    </div>
    <footer className={styles.footer} data-room-surface><p>A closer look at the<br />experience behind the work.</p><a href={site.links.resume} target="_blank" rel="noopener noreferrer">Read the complete résumé <span aria-hidden="true">↗</span></a><span>{site.name} / {site.location}</span></footer>
  </div>;
}
