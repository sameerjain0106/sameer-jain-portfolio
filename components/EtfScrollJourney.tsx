"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { phase7Summary } from "@/data/etfResearch";
import styles from "./EtfScrollJourney.module.css";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const labels = ["Develop", "Freeze", "Confirm"];
const result = phase7Summary.statistical_result;

/** A short native-scroll journey: the pauses are positions, not wheel interception. */
export default function EtfScrollJourney({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const root = useRef<HTMLElement>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const section = root.current;
    if (!section || !scrollRoot || !active) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-journey-scene]"));
    const markers = Array.from(section.querySelectorAll<HTMLElement>("[data-journey-marker]"));
    const counter = section.querySelector<HTMLElement>("[data-journey-counter]");
    let trigger: ScrollTrigger | undefined;
    let frame = 0;
    let disposed = false;
    let enhanced = false;
    let lastHeight = 0;
    let lastWidth = 0;

    function paint(progress: number) {
      if (document.hidden) return;
      // Two sweeping moves, separated by stable compositions for reading.
      const camera = smooth((progress - .12) / .27) + smooth((progress - .55) / .27);
      const scene = Math.min(2, Math.round(camera));
      section!.style.setProperty("--rail-x", `${-camera * 100 / 3}%`);
      section!.style.setProperty("--journey-progress", String(progress));
      section!.style.setProperty("--seal-turn", `${-18 + smooth((progress - .35) / .2) * 18}deg`);
      section!.style.setProperty("--seal-scale", String(.78 + smooth((progress - .35) / .2) * .22));
      section!.dataset.journeyProgress = progress.toFixed(4);
      section!.dataset.journeyScene = String(scene);
      panels.forEach(panel => {
        // The ordered transcript keeps every chapter available to assistive technology.
        // Visual panels have no controls; their moving copies can remain decorative.
        panel.setAttribute("aria-hidden", String(enhanced));
        panel.inert = enhanced;
      });
      markers.forEach((marker, index) => { marker.dataset.current = String(index === scene); });
      if (counter) counter.textContent = `${String(scene + 1).padStart(2, "0")} / 03`;
    }

    function configure() {
      frame = 0;
      if (disposed) return;
      trigger?.kill();
      trigger = undefined;
      enhanced = !reduced.matches && scrollRoot!.clientHeight >= 610;
      lastHeight = scrollRoot!.clientHeight;
      lastWidth = scrollRoot!.clientWidth;
      section!.style.setProperty("--journey-height", `${lastHeight}px`);
      section!.dataset.enhanced = String(enhanced);
      if (!enhanced) {
        panels.forEach(panel => { panel.removeAttribute("aria-hidden"); panel.inert = false; });
        return;
      }
      trigger = ScrollTrigger.create({
        trigger: section,
        scroller: scrollRoot!,
        start: "top top",
        end: "bottom bottom",
        onUpdate: self => paint(self.progress),
        onRefresh: self => paint(self.progress),
      });
      paint(trigger.progress);
    }

    function schedule() { if (!disposed && !frame) frame = requestAnimationFrame(configure); }
    function visibility() { if (!document.hidden) { trigger?.refresh(); if (trigger) paint(trigger.progress); } }
    const observer = new ResizeObserver(() => {
      if (scrollRoot!.clientHeight !== lastHeight || scrollRoot!.clientWidth !== lastWidth) schedule();
    });
    observer.observe(scrollRoot);
    reduced.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(() => { if (!disposed) trigger?.refresh(); });
    configure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      trigger?.kill();
      observer.disconnect();
      reduced.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, scrollRoot]);

  return <section ref={root} className={styles.journey} data-etf-journey aria-label="From development to sealed ETF confirmation">
    <div className={styles.transcript}>
      <h2>From development to sealed confirmation</h2>
      <ol>
        <li>Develop on 2019–2023 data with chronological expanding folds, purged targets, and training-only preprocessing.</li>
        <li>Freeze the 18-feature Elastic Net and its hyperparameters before opening the 2024–2026 confirmation period.</li>
        <li>Confirmation mean weekly Spearman IC: {result.confirmation_mean_spearman_ic.toFixed(3)}, with a HAC 95% confidence interval of {result.hac_95_ci[0].toFixed(3)} to {result.hac_95_ci[1].toFixed(3)}. Positive rank predictability against zero was confirmed; an advantage over momentum was not statistically confirmed. 2026 is partial, and independent replication remains to come.</li>
      </ol>
    </div>
    <div className={styles.stage}>
      <div className={styles.topline} aria-hidden="true"><span>Follow the information boundary</span><span data-journey-counter>01 / 03</span></div>
      <div className={styles.rail} data-etf-rail>
        <article className={`${styles.scene} ${styles.development}`} data-journey-scene="0">
          <div className={styles.copy}>
            <span className={styles.period}>2019–2023 / Development</span>
            <h2>Learn from<br />yesterday.</h2>
            <p>Chronological expanding folds. Purged targets. Preprocessing fitted only on training data.</p>
            <p className={styles.detail}>Choose the model here, before opening the confirmation period.</p>
          </div>
          <div className={styles.featureFan} aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <div key={index} style={{ "--leaf": index } as CSSProperties}><span>{String(index * 2 + 1).padStart(2, "0")}</span><i /><i /><i /><span>{String(index * 2 + 2).padStart(2, "0")}</span></div>)}
          </div>
          <div className={styles.featureNote}><strong>18</strong><span>features in the<br />frozen Elastic Net</span></div>
        </article>
        <article className={`${styles.scene} ${styles.boundary}`} data-journey-scene="1">
          <div className={styles.seal} aria-hidden="true"><span>Model selected</span><strong>FROZEN</strong><span>Parameters held fixed</span></div>
          <div className={styles.copy}>
            <span className={styles.period}>The boundary / Start of 2024</span>
            <h2>Close the<br />envelope.</h2>
            <p>The 18-feature model and its hyperparameters stay fixed. The confirmation period stays sealed until evaluation.</p>
            <p className={styles.detail}>A new period. The same decision rule.</p>
          </div>
          <div className={styles.boundaryRule} aria-hidden="true"><span>Development</span><i /><span>Confirmation</span></div>
        </article>
        <article className={`${styles.scene} ${styles.confirmation}`} data-journey-scene="2">
          <div className={styles.copy}>
            <span className={styles.period}>2024–2026 / Sealed confirmation</span>
            <h2>Now find<br />out.</h2>
            <p>Positive rank predictability against zero. An advantage over momentum was not statistically confirmed.</p>
            <p className={styles.detail}>2026 is partial. Independent replication remains to come.</p>
          </div>
          <div className={styles.result}>
            <span>Mean weekly Spearman IC</span>
            <strong>{result.confirmation_mean_spearman_ic.toFixed(3)}</strong>
            <p>HAC 95% interval<br /><b>{result.hac_95_ci[0].toFixed(3)} – {result.hac_95_ci[1].toFixed(3)}</b></p>
          </div>
        </article>
        <svg className={styles.ribbon} viewBox="0 0 3000 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d7ed89" /><stop offset=".48" stopColor="#fff0c8" /><stop offset="1" stopColor="#ff8066" /></linearGradient></defs>
          <path d="M-80 890 C300 860 270 530 620 630 S830 980 1080 820 S1190 200 1510 370 S1620 1000 1990 835 S2110 540 2350 710 S2730 940 3090 730" fill="none" stroke="#111b391a" strokeWidth="118" transform="translate(0 16)" />
          <path d="M-80 890 C300 860 270 530 620 630 S830 980 1080 820 S1190 200 1510 370 S1620 1000 1990 835 S2110 540 2350 710 S2730 940 3090 730" fill="none" stroke={`url(#${uid}-ribbon)`} strokeWidth="102" />
          <path d="M-80 874 C300 844 270 514 620 614 S830 964 1080 804 S1190 184 1510 354 S1620 984 1990 819 S2110 524 2350 694 S2730 924 3090 714" fill="none" stroke="#fff9db" strokeWidth="2" />
        </svg>
      </div>
      <div className={styles.route} aria-hidden="true"><div>{labels.map((label, index) => <span key={label} data-journey-marker data-current={index === 0}><i>{index + 1}</i>{label}</span>)}</div><p>Scroll down to travel across <span>↓</span></p><div className={styles.progress}><i /></div></div>
    </div>
  </section>;
}
