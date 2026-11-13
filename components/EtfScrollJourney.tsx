"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { etfResearch, phase7Summary } from "@/data/etfResearch";
import { etfFeatureFamilies, etfStory as story } from "@/data/etfStory";
import { perceptionMotion as scrollMotion } from "@/data/perceptionStory";
import styles from "./EtfScrollJourney.module.css";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const result = phase7Summary.statistical_result;
const comparison = phase7Summary.momentum_comparison;
const fixed = (value: number) => value.toFixed(3).replace("-", "−");
const position = (value: number) => `${(value + .05) / .3 * 100}%`;
const mix = (a: string, b: string, t: number) => `rgb(${[1, 3, 5].map(offset => Math.round(parseInt(a.slice(offset, offset + 2), 16) * (1 - t) + parseInt(b.slice(offset, offset + 2), 16) * t)).join(",")})`;

function IntervalEvidence({ paired }: { paired: boolean }) {
  const mean = paired ? comparison.cstar_minus_momentum_ic : result.confirmation_mean_spearman_ic;
  const interval = paired ? comparison.paired_hac_95_ci : result.hac_95_ci;
  return <div className={styles.resultSheet}>
    <p className={styles.figureEyebrow}>{paired ? "Model − momentum" : "Model versus zero"}</p>
    <div className={styles.resultValue}><strong>{paired ? "+" : ""}{fixed(mean)}</strong><span>{paired ? "Paired IC improvement" : "Mean weekly Spearman IC"}</span></div>
    <div className={styles.intervalPlot} role="img" aria-label={`${paired ? "Paired improvement" : "Mean weekly Spearman IC"} ${fixed(mean)}. HAC 95 percent interval ${fixed(interval[0])} to ${fixed(interval[1])}.`} style={{ "--interval-left": position(interval[0]), "--interval-width": `${(interval[1] - interval[0]) / .3 * 100}%`, "--mean-left": position(mean) } as CSSProperties}>
      <div className={styles.axis} />
      <div className={styles.zero}><span>zero</span></div>
      <div className={styles.intervalReveal} data-etf-interval-reveal><div className={styles.interval} data-etf-interval={paired ? "paired" : "model"} data-lower={interval[0]} data-upper={interval[1]} /><div className={styles.mean} data-etf-mean={mean} /></div>
      <div className={styles.ticks}>{[-.05, 0, .05, .1, .15, .2, .25].map(value => <span key={value}>{value.toFixed(2).replace("-", "−")}</span>)}</div>
    </div>
    <p className={styles.intervalCaption}>HAC 95% interval <strong>{fixed(interval[0])} to {fixed(interval[1])}</strong></p>
    {paired ? <div className={styles.verdict}><span>Crosses zero</span><p>An advantage over momentum<br />was not statistically confirmed.</p></div> : <div className={styles.decisionCount}><strong>{result.weekly_decisions}</strong><span>weekly decisions<br />2024–2026 · 2026 partial</span></div>}
  </div>;
}

function ResearchArt({ index }: { index: number }) {
  if (index === 0) return <div className={styles.featureSheet}>
    <div className={styles.sheetHeading}><strong>18</strong><p>features.<br />One decision rule.</p></div>
    <div className={styles.featureColumns}>{etfFeatureFamilies.map((family, familyIndex) => <div key={family.name} className={styles.featureFamily} style={{ "--family-color": family.color, "--family-shift": `${(familyIndex - 1.5) * 8}px`, "--family-turn": `${(familyIndex - 1.5) * 2}deg` } as CSSProperties}>
      <h3>{family.name}<span>{family.features.length}</span></h3>
      {family.features.map((name, index) => <div className={styles.featureTag} key={name} style={{ "--feature-index": index } as CSSProperties}>{name.replaceAll("_", " ")}</div>)}
    </div>)}</div>
    <div className={styles.target}><span>Known market history</span><span aria-hidden="true">↓</span><strong>Next 21 sessions: relative ranks</strong></div>
  </div>;
  if (index === 1) return <div className={styles.timeSheet}>
    <p className={styles.figureEyebrow}>Past → future. Never shuffled.</p>
    <div className={styles.yearLine}><strong>2019</strong><span>Development</span><strong>2023</strong></div>
    <div className={styles.foldRows} aria-hidden="true">{[.4, .62, .84].map((size, index) => <div className={styles.foldRow} key={size} style={{ "--train-width": `${size * 75}%`, "--fold-index": index } as CSSProperties}><span className={styles.train}>Train</span><span className={styles.purge} /><span className={styles.validate}>Validate</span></div>)}</div>
    <div className={styles.timeLegend}><span><i />Expanding training window</span><span><i />Purged boundary</span></div>
    <div className={styles.future}><span className={styles.lock} aria-hidden="true">↳</span><div><strong>2024–2026</strong><span>Confirmation stays sealed.</span></div></div>
    <p className={styles.smallPrint}>Schematic folds. Every fit uses training-only imputation and scaling.</p>
  </div>;
  if (index === 2) return <div className={styles.freezeSheet}>
    <p className={styles.figureEyebrow}>The model-selection boundary</p>
    <div className={styles.packet}>
      <div className={styles.packetPages}><span>18 features</span><span>Training-only preprocessing</span><strong>Elastic Net</strong></div>
      <div className={styles.packetFront}><span>RESEARCH / FIXED RECIPE</span><strong>Keep the<br />rule fixed.</strong><p>α = {phase7Summary.model.configuration.alpha}<br />l1_ratio = {phase7Summary.model.configuration.l1_ratio}</p></div>
      <div className={styles.packetFlap} data-etf-seal-flap />
      <div className={styles.stamp} data-etf-seal-stamp>FROZEN<span>Before confirmation</span></div>
    </div>
    <p className={styles.freezeNote}>A new period.<br /><strong>The same decision rule.</strong></p>
  </div>;
  return <IntervalEvidence paired={index === 4} />;
}

/** MRI-style full-viewport evidence, advanced only by the room's native scroll. */
export default function EtfScrollJourney({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const beats = useRef<Array<HTMLElement | null>>([]);
  const currentRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const uid = useId();

  useEffect(() => {
    const section = root.current, visual = stage.current;
    if (!section || !visual || !scrollRoot || !active) return;
    const enabled = matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const artwork = Array.from(visual.querySelectorAll<HTMLElement>("[data-etf-art]"));
    const sheets = Array.from(visual.querySelectorAll<HTMLElement>("[data-etf-evidence]"));
    const progressBar = visual.querySelector<HTMLElement>("[data-etf-progress-bar]");
    let frame = 0, disposed = false, previous = Number.NaN, geometryDirty = true;
    let height = 0, sectionTop = 0, sectionBottom = 0;
    let centers: number[] = [];
    const published = new Map<string, string>();
    function setPaint(key: string, node: HTMLElement | null | undefined, property: string, value: string) {
      if (!node || published.get(key) === value) return;
      published.set(key, value);
      node.style.setProperty(property, value);
    }
    function measure() {
      height = scrollRoot!.clientHeight;
      const nextHeight = `${height}px`;
      if (section!.style.getPropertyValue("--story-height") !== nextHeight) section!.style.setProperty("--story-height", nextHeight);
      // Cache untransformed chapter locations in scroll-content coordinates.
      // Scroll only changes the anchor; resizing, fonts and room resume rebuild
      // the cache before any new frame is painted.
      const viewportTop = scrollRoot!.getBoundingClientRect().top + scrollRoot!.clientTop;
      const offset = scrollRoot!.scrollTop - viewportTop;
      const bounds = section!.getBoundingClientRect();
      sectionTop = bounds.top + offset; sectionBottom = bounds.bottom + offset;
      centers = beats.current.map(beat => { const box = beat!.getBoundingClientRect(); return box.top + box.height * .5 + offset; });
      const available = Math.max(160, height - 155);
      const fits = artwork.map(art => Math.min(1, available / Math.max(1, art.offsetHeight)));
      artwork.forEach((art, index) => {
        const nextFit = String(fits[index]);
        if (art.style.getPropertyValue("--art-fit") !== nextFit) art.style.setProperty("--art-fit", nextFit);
      });
      geometryDirty = false;
    }
    function paint() {
      frame = 0;
      if (disposed || document.hidden) return;
      const enhanced = String(enabled.matches);
      if (section!.dataset.storyEnhanced !== enhanced) section!.dataset.storyEnhanced = enhanced;
      if (!enabled.matches || !scrollRoot!.clientHeight) return;
      if (geometryDirty) measure();
      const scroll = scrollRoot!.scrollTop;
      if (sectionBottom <= scroll || sectionTop >= scroll + height) return;
      const anchor = scroll + height * scrollMotion.viewportAnchor;
      let progress = 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (anchor >= centers[i + 1]) progress = i + 1;
        else if (anchor > centers[i]) { progress = i + (anchor - centers[i]) / Math.max(1, centers[i + 1] - centers[i]); break; }
      }
      if (progress === previous) return;
      previous = progress;
      const base = Math.floor(progress), next = Math.min(base + 1, story.length - 1);
      const blend = clamp((progress - base - scrollMotion.transitionStart) / (scrollMotion.transitionEnd - scrollMotion.transitionStart));
      const chapter = Math.round(progress);
      if (chapter !== currentRef.current) { currentRef.current = chapter; setCurrent(chapter); }
      section!.dataset.journeyProgress = (progress / (story.length - 1)).toFixed(4);
      if (section!.dataset.journeyScene !== String(chapter)) section!.dataset.journeyScene = String(chapter);
      // Keep changes on the painted elements instead of inheriting each frame's
      // progress through every illustrated chapter in the sticky stage.
      setPaint("ground", visual, "background-color", mix(story[base].ground, story[next].ground, blend));
      setPaint("progress", progressBar, "transform", `scaleX(${progress / (story.length - 1)})`);
      sheets.forEach((sheet, index) => setPaint(`sheet-${index}`, sheet, "transform", `translateY(${(index - base - blend) * 100}%)`));
      // Each phase only animates the illustration in its own sheet.
      setPaint("--gather", sheets[0], "--gather", String(clamp(progress / .65)));
      setPaint("--window", sheets[1], "--window", String(.3 + .7 * clamp((progress - .5) / .5)));
      setPaint("--seal", sheets[2], "--seal", String(clamp((progress - 1.5) / .5)));
      setPaint("--evidence-open", sheets[3], "--evidence-open", String(clamp((progress - 2.5) / .5)));
      setPaint("--comparison-open", sheets[4], "--comparison-open", String(clamp((progress - 3.5) / .5)));
    }
    function schedule() { if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(paint); }
    function refresh() { if (disposed) return; previous = Number.NaN; geometryDirty = true; schedule(); }
    function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else refresh(); }
    const observer = new ResizeObserver(refresh);
    observer.observe(section); observer.observe(scrollRoot);
    beats.current.forEach(beat => { if (beat) observer.observe(beat); });
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    scrollRoot.addEventListener("spatial:entered", refresh);
    enabled.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(refresh);
    refresh();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      scrollRoot.removeEventListener("scroll", schedule); enabled.removeEventListener("change", refresh);
      scrollRoot.removeEventListener("spatial:entered", refresh);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, scrollRoot]);

  return <section ref={root} className={styles.journey} data-etf-journey data-vertical-story aria-label="From market features to sealed ETF evidence">
    <noscript><style>{`.${styles.journey}{display:block!important}.${styles.stage}{display:none!important}.${styles.track}{grid-area:auto!important}.${styles.beat}{display:block!important;min-height:0!important;background:var(--beat-ground)!important}.${styles.copy}{width:auto!important;margin-left:0!important;max-width:760px}.${styles.inlineArt}{display:block!important;max-width:800px}`}</style></noscript>
    <div ref={stage} className={styles.stage} data-etf-story-stage data-room-surface data-surface-positioned aria-hidden="true">
      {story.map((beat, index) => <div key={beat.id} className={`${styles.sheet} ${styles[`sheet${index}`]}`} data-etf-evidence={index} style={{ transform: `translateY(${index * 100}%)` }}><div className={styles.art} data-etf-art><ResearchArt index={index} /></div></div>)}
      <div className={styles.progress}><span>{story[current].word}</span><i><b data-etf-progress-bar /></i><span>{String(current + 1).padStart(2, "0")} / 05</span></div>
    </div>
    <div className={styles.track}>{story.map((beat, index) => <article key={beat.id} ref={el => { beats.current[index] = el; }} className={styles.beat} data-journey-scene={index} data-room-surface data-surface-flow aria-labelledby={`${uid}-${beat.id}`} style={{ "--beat-ground": beat.ground } as CSSProperties}>
      <div className={styles.copy} data-etf-copy>
        <p className={styles.label}>{beat.label}</p>
        {index === 0 ? <h1 id={`${uid}-${beat.id}`} data-room-heading tabIndex={-1}>{beat.title.map(line => <span key={line}>{line}</span>)}</h1> : <h2 id={`${uid}-${beat.id}`}>{beat.title.map(line => <span key={line}>{line}</span>)}</h2>}
        <p className={styles.body}>{beat.body}</p>
        <p className={styles.finding}>{beat.finding}</p>
        <p className={styles.note}>{beat.note}</p>
        {index === 0 && <span className={styles.scrollCue}>Scroll to follow the experiment <span aria-hidden="true">↓</span></span>}
        {index === story.length - 1 && <a className={styles.source} href={etfResearch.summaryUrl} target="_blank" rel="noopener noreferrer">Read the recorded results ↗</a>}
      </div>
      <figure className={styles.inlineArt}><ResearchArt index={index} /><figcaption>{beat.caption}</figcaption></figure>
    </article>)}</div>
  </section>;
}
