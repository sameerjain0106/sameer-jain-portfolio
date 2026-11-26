"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import PaperSignalExplorer from "@/components/PaperSignalExplorer";
import EtfScrollJourney from "./EtfScrollJourney";
import { etfResearch, latestSignal, phase7Summary } from "@/data/etfResearch";
import styles from "./SpatialEtfRoom.module.css";

const result = phase7Summary.statistical_result;
const annual = result.annual_confirmation_ic;
const proofRanges = {
  pipeline: { entry: .90, exit: .52, followHeight: true },
  confirmation: { entry: .96, exit: .32, followHeight: false },
  signal: { entry: .90, exit: .46, followHeight: false },
  limits: { entry: .92, exit: .57, followHeight: true },
} as const;
type ProofBeat = keyof typeof proofRanges;

/** A room-local scroll narrative. The spatial shell owns navigation and overflow. */
export default function SpatialEtfRoom({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const titleId = useId();
  const confirmationId = useId();
  const snapshotId = useId();
  const room = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !scrollRoot || !room.current) return;
    const root = scrollRoot;
    const content = room.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const beats = Array.from(content.querySelectorAll<HTMLElement>("[data-etf-proof]"), node => ({
      node, range: proofRanges[node.dataset.etfProof as ProofBeat], start: 0, end: 1, last: "",
    }));
    let dirty = true, frame = 0;

    function measure() {
      const height = root.clientHeight;
      const offset = root.scrollTop - root.getBoundingClientRect().top - root.clientTop;
      const max = root.scrollHeight - height;
      for (const beat of beats) {
        const box = beat.node.getBoundingClientRect();
        beat.start = box.top + offset - height * beat.range.entry;
        beat.end = Math.max(beat.start + 1, Math.min(max, box.top + offset + (beat.range.followHeight ? box.height : 0) - height * beat.range.exit));
      }
      dirty = false;
    }

    function draw() {
      frame = 0;
      if (document.hidden || reduced.matches) return;
      if (dirty) measure();
      const top = root.scrollTop;
      for (const beat of beats) {
        const value = Math.max(0, Math.min(1, (top - beat.start) / (beat.end - beat.start))).toFixed(4);
        if (beat.last === value) continue;
        beat.node.style.setProperty("--proof-progress", value);
        beat.last = value;
      }
    }
    function schedule() {
      if (!frame && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    }
    function refresh() { dirty = true; schedule(); }
    const resize = new ResizeObserver(refresh);
    resize.observe(root);
    resize.observe(content);
    // Individual size changes can also move later beats without resizing the window.
    beats.forEach(({ node }) => resize.observe(node));
    root.addEventListener("scroll", schedule, { passive: true });
    root.addEventListener("spatial:entered", refresh);
    document.addEventListener("visibilitychange", refresh);
    reduced.addEventListener("change", refresh);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener("scroll", schedule);
      root.removeEventListener("spatial:entered", refresh);
      document.removeEventListener("visibilitychange", refresh);
      reduced.removeEventListener("change", refresh);
    };
  }, [active, scrollRoot]);

  return (
    <div className={styles.room} data-active={active} ref={room}>
      <EtfScrollJourney active={active} scrollRoot={scrollRoot} />

      <section className={styles.design} aria-labelledby={confirmationId} data-room-surface="design">
        <div className={styles.sectionLead}>
          <h2 id={confirmationId}>From data to<br /><span>confirmation.</span></h2>
          <p>The frozen model, its confirmation period, and the comparison that keeps the result in perspective.</p>
        </div>
        <ol className={styles.researchRoute} aria-label="Research pipeline" data-etf-proof="pipeline" style={{ "--stage-count": etfResearch.pipeline.length } as CSSProperties}>{etfResearch.pipeline.map((stage, index) => (
          <li key={stage} style={{ "--stage-index": index } as CSSProperties}>
            <span className={styles.routePoint} aria-hidden="true"><span>{index + 1}</span></span>
            <strong>{stage}</strong>
          </li>
        ))}</ol>
        <dl className={styles.methodNotes} data-project-methods="etf">
          <div><dt>Predict a relative rank</dt><dd>One observation is an ETF at a weekly decision date. The target ranks its next {phase7Summary.research_design.target_horizon_spy_sessions} SPY-session adjusted total return against the other ETFs.</dd></div>
          <div><dt>Freeze the fitting recipe</dt><dd>Training-median imputation and a training-only StandardScaler feed the 18-feature Elastic Net. The frozen model uses α = {phase7Summary.model.configuration.alpha} and l1_ratio = {phase7Summary.model.configuration.l1_ratio}.</dd></div>
          <div><dt>Account for overlapping targets</dt><dd>{result.weekly_decisions} weekly decisions produce {result.prediction_rows.toLocaleString("en-US")} ETF/date predictions. The reported inference uses HAC lag {result.hac_lag} and a moving-block bootstrap to account for serial dependence.</dd></div>
        </dl>
        <figure className={styles.wideFigure} data-etf-proof="confirmation">
          <div className={styles.figureWindow}>
            <Image src={etfResearch.figures.confirmation} alt="Development mean IC 0.109, sealed confirmation mean IC 0.130 with HAC 95 percent interval, and momentum confirmation IC 0.086" width={1505} height={970} sizes="(min-width: 1100px) 80vw, 95vw" />
            <div className={styles.seal} aria-hidden="true"><span>Sealed<br />confirmation</span></div>
          </div>
          <figcaption><span>Frozen model / Sealed confirmation</span><a href={etfResearch.figures.confirmation} target="_blank" rel="noopener noreferrer">Open original figure ↗</a></figcaption>
        </figure>
        <div className={styles.annualStrip}>
          <p>Three positive<br />confirmation subperiods</p>
          {[{ year: "2024", value: annual["2024"] }, { year: "2025", value: annual["2025"] }, { year: "2026 · partial", value: annual.partial_2026 }].map(({ year, value }) => <div key={year}><span>{year}</span><strong>{value.toFixed(3)}</strong><span>Mean Spearman IC</span></div>)}
        </div>
        <p className={styles.evidenceNote}>Confirmation observations run from {phase7Summary.research_design.confirmation_period}. Overlapping 21-session targets require dependence-aware inference. This is a sealed study, with independent replication still to come.</p>
      </section>

      <section className={styles.snapshot} aria-labelledby={snapshotId} data-room-surface="snapshot">
        <div className={styles.snapshotLead}>
          <h2 id={snapshotId}>Inspect a<br /><span>paper signal.</span></h2>
          <p>Choose a published ETF below. Follow the features that moved its relative model score.</p>
        </div>
        <div className={styles.snapshotRibbon} data-etf-proof="signal"><span>Archived snapshot / {latestSignal.as_of_date}</span><span>{latestSignal.eligible_universe_size} eligible ETFs</span><span>{latestSignal.status} as published</span></div>
        <PaperSignalExplorer snapshot={latestSignal} />
        <p className={styles.snapshotNote}>This saved snapshot is not updated by the website. Its recorded status remains pending; no realized outcome is supplied here. A model-score percentile is a ranking, not a probability of return. Research-only paper signal.</p>
        <div className={styles.sourceLinks}><a href={etfResearch.signalUrl} target="_blank" rel="noopener noreferrer">Read the signal export ↗</a><a href={etfResearch.summaryUrl} target="_blank" rel="noopener noreferrer">Read the research export ↗</a></div>
      </section>

      <section className={styles.conclusion} aria-labelledby={`${titleId}-limits`} data-room-surface="conclusion">
        <h2 id={`${titleId}-limits`}>What the result<br /><span>can tell us.</span></h2>
        <div className={styles.limitSpread} data-etf-proof="limits">
          <p>The model found a ranking signal. These limits matter when reading that result.</p>
          <ul>{etfResearch.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
        </div>
        <div className={styles.finalLinks}><Link href={`/projects/${etfResearch.slug}`}>The complete case study <span aria-hidden="true">↗</span></Link><a href={etfResearch.releaseUrl} target="_blank" rel="noopener noreferrer">Explore the frozen research source ↗</a></div>
        <p className={styles.disclaimer}>Historical research; not investment advice.</p>
      </section>
    </div>
  );
}
