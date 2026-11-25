"use client";

import { useEffect, useRef } from "react";
import { useAmbientMotionEnabled } from "@/lib/useAmbientMotion";
import KineticSculpture from "./KineticSculpture";
import EntrancePortrait from "./EntrancePortrait";
import EntranceTimeline from "./EntranceTimeline";
import { site } from "@/data/site";
import styles from "./SpatialEntrance.module.css";

export default function SpatialEntrance({ active, scrollRoot }: {
  active: boolean; scrollRoot: HTMLElement | null;
}) {
  const hero = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLElement>(null);
  const codex = useRef<HTMLSpanElement>(null);
  const ambientEnabled = useAmbientMotionEnabled();

  useEffect(() => {
    const text = intro.current;
    const print = portrait.current;
    const mark = codex.current;
    const section = hero.current;
    if (!active || !section || !text || !print || !mark) return;
    const panel = section.closest<HTMLElement>("[data-panel]");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let previous = 0;
    let x = 0, y = 0;
    let targetX = 0, targetY = 0;
    let visible = true;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = previous = 0;
      x = y = targetX = targetY = 0;
      text.style.removeProperty("transform");
      print.style.removeProperty("transform");
      mark.style.removeProperty("transform");
    };
    const render = (now: number) => {
      frame = 0;
      const delta = previous ? Math.min(now - previous, 50) : 16;
      previous = now;
      const mix = 1 - Math.exp(-delta / 95);
      x += (targetX - x) * mix;
      y += (targetY - y) * mix;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .002;
      if (settled) {
        if (!targetX && !targetY) { clear(); return; }
        x = targetX;
        y = targetY;
        previous = 0;
      }

      text.style.transform = `translate3d(${(x * 21).toFixed(2)}px, ${(y * 15).toFixed(2)}px, 0)`;
      print.style.transform = `translate3d(${(x * 36).toFixed(2)}px, ${(y * 23).toFixed(2)}px, 0) rotate(${(x * .95).toFixed(2)}deg)`;
      mark.style.transform = `rotate(${(x * 15.75).toFixed(2)}deg)`;
      if (!settled) schedule();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      if (!visible || event.pointerType !== "mouse" || motion.matches || !fine.matches || document.hidden || panel?.inert) return;
      // Use the fixed viewport as the input, so translated content and gates cannot shift it.
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      const range = Math.min(1, innerWidth / 1120, innerHeight / 690) * (ambientEnabled ? 1 : .38);
      targetX = clamp(event.clientX / innerWidth * 2 - 1) * range;
      targetY = clamp(event.clientY / innerHeight * 2 - 1) * range;
      schedule();
    };
    const reset = () => {
      targetX = targetY = 0;
      if (x || y) schedule();
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) clear();
    }, { root: scrollRoot });
    observer.observe(section);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", clear);
    window.addEventListener("resize", clear);
    document.addEventListener("visibilitychange", clear);
    motion.addEventListener("change", clear);
    fine.addEventListener("change", clear);
    return () => {
      observer.disconnect();
      clear();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", clear);
      window.removeEventListener("resize", clear);
      document.removeEventListener("visibilitychange", clear);
      motion.removeEventListener("change", clear);
      fine.removeEventListener("change", clear);
    };
  }, [active, ambientEnabled, scrollRoot]);

  return <div className={styles.entrance}>
    <section ref={hero} className={styles.hero} aria-labelledby="entrance-heading" data-room-surface data-scene-color="#cbc8f2">
    <noscript><style>{`.${styles.explorePrompt}{display:none!important}`}</style></noscript>
    <div ref={intro} className={styles.intro} data-entrance-intro data-scene-depart>
      <h1 id="entrance-heading" data-room-heading tabIndex={-1}>Sameer<br /><span>Jain<span className={styles.period}>.</span></span></h1>
      <div className={styles.byline}>
        <span ref={codex} className={styles.codexMark} role="img" aria-label="Built with Codex" title="Built with Codex" />
        <p>Data science, statistics and ML</p>
      </div>
      <div className={styles.explorePrompt} data-entrance-guide>
        <p className={styles.mouseHint}>Hover on the sides</p>
        <p className={styles.touchHint}>Tap a side</p>
      </div>
    </div>
    <div className={styles.portraitStage} data-scene-depart>
      <div className={styles.entranceSculpture} aria-hidden="true"><KineticSculpture kind="ribbon" active={active} scrollRoot={scrollRoot} /></div>
      <EntrancePortrait active={active} scrollRoot={scrollRoot} portraitRef={portrait} />
    </div>
      <a className={styles.scrollCue} href="#about" data-scene-depart="cue">About me <span aria-hidden="true">↓</span></a>
    </section>

    <section className={styles.about} aria-labelledby="about" data-scene-color="#fff3db" data-reveal-anchor>
      <h2 id="about" tabIndex={-1} data-scene-reveal="first">About me</h2>
      <div className={styles.aboutCopy} data-scene-reveal="first">
        <p>I study industrial engineering at <em>Georgia Tech</em>, with a focus on statistics and machine learning.</p>
        <p>I took CS 2316 in spring 2025 and came back that summer as a teaching assistant. Since then I’ve helped students learn Python and SQL, worked with brain MRI scans, and built forecasting tools at AT&amp;T.</p>
      </div>
    </section>

    <EntranceTimeline active={active} scrollRoot={scrollRoot} />

    <footer className={styles.contact} aria-labelledby="contact" data-scene-color="#bdebd7" data-reveal-anchor>
      <div className={styles.contactInner} data-scene-reveal="contact">
        <div className={styles.postmark} aria-hidden="true"><span>Atlanta</span><b>sj.</b><span>Georgia</span></div>
        <h2 id="contact" tabIndex={-1}>Contact</h2>
        <a className={styles.email} href={`mailto:${site.links.email}`}>{site.links.email.split("@")[0]}<wbr />@{site.links.email.split("@")[1]}<span aria-hidden="true"> ↗</span></a>
        <nav className={styles.contactLinks} aria-label="Sameer’s profiles and résumé">
          <a href={site.links.github}>GitHub ↗</a>
          <a href={site.links.linkedin}>LinkedIn ↗</a>
          <a href={site.links.resume}>Résumé <small>PDF</small></a>
        </nav>
      </div>
    </footer>
  </div>;
}
