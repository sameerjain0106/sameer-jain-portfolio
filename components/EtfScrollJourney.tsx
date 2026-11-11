"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { phase7Summary } from "@/data/etfResearch";
import styles from "./EtfScrollJourney.module.css";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const result = phase7Summary.statistical_result;

/** The chapters remain in document flow; scrolling only adds depth to the artwork. */
export default function EtfScrollJourney({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const root = useRef<HTMLElement>(null);
  const uid = useId();

  useEffect(() => {
    const section = root.current;
    if (!section || !scrollRoot || !active) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-journey-scene]"));
    let frame = 0;
    let disposed = false;
    function paint() {
      frame = 0;
      if (disposed || document.hidden || !scrollRoot!.clientHeight) return;
      const viewport = scrollRoot!.getBoundingClientRect();
      const height = scrollRoot!.clientHeight;
      const bounds = section!.getBoundingClientRect();
      const progress = clamp((viewport.top + height * .5 - bounds.top) / bounds.height);
      section!.style.setProperty("--journey-progress", String(progress));
      section!.dataset.journeyProgress = progress.toFixed(4);
      let nearest = 0;
      let distance = Infinity;
      panels.forEach((panel, index) => {
        const box = panel.getBoundingClientRect();
        const offset = (box.top + box.height * .5 - viewport.top - height * .5) / height;
        if (Math.abs(offset) < distance) { nearest = index; distance = Math.abs(offset); }
        panel.style.setProperty("--scene-travel", `${reduced.matches ? 0 : Math.max(-1, Math.min(1, offset)) * 24}px`);
      });
      section!.dataset.journeyScene = String(nearest);
    }
    function schedule() { if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(paint); }
    function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else schedule(); }
    const observer = new ResizeObserver(schedule);
    observer.observe(scrollRoot);
    observer.observe(section);
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      scrollRoot.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, scrollRoot]);

  return <section ref={root} className={styles.journey} data-etf-journey data-vertical-story aria-label="From development to sealed ETF confirmation">
    <div className={styles.spine} aria-hidden="true"><i /></div>
    <article className={`${styles.scene} ${styles.development}`} data-journey-scene="0" data-room-surface aria-labelledby={`${uid}-develop`}>
      <span className={styles.chapterNumber}>01 / Develop</span>
      <div className={styles.copy}>
        <span className={styles.period}>2019–2023 / Development</span>
        <h2 id={`${uid}-develop`}>Learn from<br />yesterday.</h2>
        <p>Chronological expanding folds. Purged targets. Preprocessing fitted only on training data.</p>
        <p className={styles.detail}>Choose the model here, before opening the confirmation period.</p>
      </div>
      <div className={styles.art}>
        <div className={styles.featureFan} aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <div key={index} style={{ "--leaf": index } as CSSProperties}><span>{String(index * 2 + 1).padStart(2, "0")}</span><i /><i /><i /><span>{String(index * 2 + 2).padStart(2, "0")}</span></div>)}
        </div>
        <div className={styles.featureNote}><strong>18</strong><span>features in the<br />frozen Elastic Net</span></div>
      </div>
    </article>
    <article className={`${styles.scene} ${styles.boundary}`} data-journey-scene="1" data-room-surface aria-labelledby={`${uid}-freeze`}>
      <span className={styles.chapterNumber}>02 / Freeze</span>
      <div className={styles.copy}>
        <span className={styles.period}>The boundary / Start of 2024</span>
        <h2 id={`${uid}-freeze`}>Close the<br />envelope.</h2>
        <p>The 18-feature model and its hyperparameters stay fixed. The confirmation period stays sealed until evaluation.</p>
        <p className={styles.detail}>A new period. The same decision rule.</p>
      </div>
      <div className={styles.art}>
        <div className={styles.seal} aria-hidden="true"><span>Model selected</span><strong>FROZEN</strong><span>Parameters held fixed</span></div>
        <div className={styles.boundaryRule} aria-hidden="true"><span>Development</span><i /><span>Confirmation</span></div>
      </div>
    </article>
    <article className={`${styles.scene} ${styles.confirmation}`} data-journey-scene="2" data-room-surface aria-labelledby={`${uid}-confirm`}>
      <span className={styles.chapterNumber}>03 / Confirm</span>
      <div className={styles.copy}>
        <span className={styles.period}>2024–2026 / Sealed confirmation</span>
        <h2 id={`${uid}-confirm`}>Now find<br />out.</h2>
        <p>Positive rank predictability against zero. An advantage over momentum was not statistically confirmed.</p>
        <p className={styles.detail}>2026 is partial. Independent replication remains to come.</p>
      </div>
      <div className={`${styles.art} ${styles.result}`}>
        <span>Mean weekly Spearman IC</span>
        <strong>{result.confirmation_mean_spearman_ic.toFixed(3)}</strong>
        <p>HAC 95% interval<br /><b>{result.hac_95_ci[0].toFixed(3)} – {result.hac_95_ci[1].toFixed(3)}</b></p>
      </div>
    </article>
  </section>;
}
