"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import PaperSignalExplorer from "@/components/PaperSignalExplorer";
import KineticSculpture from "./KineticSculpture";
import EtfScrollJourney from "./EtfScrollJourney";
import { etfResearch, latestSignal, phase7Summary } from "@/data/etfResearch";
import styles from "./SpatialEtfRoom.module.css";

const result = phase7Summary.statistical_result;
const comparison = phase7Summary.momentum_comparison;
const axisMaximum = 0.25;
const percentPosition = (value: number) => `${value / axisMaximum * 100}%`;
const annual = result.annual_confirmation_ic;

/** A room-local scroll narrative. The spatial shell owns navigation and overflow. */
export default function SpatialEtfRoom({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const room = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const titleId = useId();
  const confirmationId = useId();
  const snapshotId = useId();

  useEffect(() => {
    if (!active || !scrollRoot || !room.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let disposed = false;

    function update() {
      frame = null;
      if (disposed || !room.current || !hero.current || !scrollRoot) return;
      const height = scrollRoot.clientHeight;
      if (height <= 0) return;
      room.current.style.setProperty("--etf-view-height", `${height}px`);
      const top = hero.current.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top;
      const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, -top / height));
      room.current.style.setProperty("--etf-travel", `${progress * 32}px`);
    }
    function schedule() { if (!disposed && frame === null) frame = requestAnimationFrame(update); }
    const resize = new ResizeObserver(schedule);
    resize.observe(scrollRoot);
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resize.disconnect();
      scrollRoot.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, [active, scrollRoot]);

  const chartStyle = {
    "--mean-position": percentPosition(result.confirmation_mean_spearman_ic),
    "--momentum-position": percentPosition(comparison.frozen_momentum_confirmation_ic),
    "--interval-start": percentPosition(result.hac_95_ci[0]),
    "--interval-width": percentPosition(result.hac_95_ci[1] - result.hac_95_ci[0]),
  } as CSSProperties;

  return (
    <div className={styles.room} ref={room} data-active={active}>
      <section className={styles.hero} ref={hero} aria-labelledby={titleId} data-room-surface="hero">
        <p className={styles.kicker}>Systematic ETF Research Engine <span>Machine learning / Quantitative research</span></p>
        <div className={styles.heroSpread}>
          <div className={styles.heroCopy}>
            <h1 id={titleId} data-room-heading tabIndex={-1}>FIND THE<br /><span>SIGNAL.</span></h1>
            <p>{etfResearch.researchQuestion}</p>
            <span className={styles.scrollCue}>Scroll through the research <span aria-hidden="true">↓</span></span>
            <div className={styles.heroFinding}>
              <strong>{result.confirmation_mean_spearman_ic.toFixed(3)}</strong>
              <div><span className={styles.findingLabel}>Frozen Elastic Net</span><span className={styles.findingDetail}>Mean weekly Spearman IC<br />Sealed 2024–2026 confirmation</span></div>
            </div>
          </div>
          <div className={styles.fold} aria-hidden="true"><KineticSculpture kind="fold" active={active} scrollRoot={scrollRoot} /></div>
        </div>

        <figure className={styles.signalLandscape} style={chartStyle}>
          <div className={styles.chartTopline}><span>How much signal?</span><span>Mean weekly Spearman IC</span></div>
          <div className={styles.intervalChart} role="img" aria-label={`Sealed confirmation mean Spearman IC ${result.confirmation_mean_spearman_ic.toFixed(3)}. HAC 95 percent confidence interval ${result.hac_95_ci[0].toFixed(3)} to ${result.hac_95_ci[1].toFixed(3)}. Momentum baseline mean IC ${comparison.frozen_momentum_confirmation_ic.toFixed(3)}. The model's advantage over momentum was not statistically confirmed.`}>
            <div className={styles.baseline} aria-hidden="true" />
            <div className={styles.interval} aria-hidden="true"><span>HAC 95% interval</span></div>
            <div className={styles.momentumMarker} aria-hidden="true"><span>Momentum</span></div>
            <div className={styles.meanMarker} aria-hidden="true"><span>Elastic Net</span></div>
          </div>
          <div className={styles.ticks} aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i}>{(i * .05).toFixed(2)}</span>)}</div>
          <figcaption><span>Interval {result.hac_95_ci[0].toFixed(3)}–{result.hac_95_ci[1].toFixed(3)} · one-sided HAC p = {result.hac_one_sided_p.toFixed(3)}</span></figcaption>
        </figure>
      </section>

      <EtfScrollJourney active={active} scrollRoot={scrollRoot} />

      <section className={styles.design} aria-labelledby={confirmationId} data-room-surface="design">
        <div className={styles.sectionLead}>
          <p className={styles.kicker}>The recorded evidence</p>
          <h2 id={confirmationId}>SHOW THE<br /><span>WORK.</span></h2>
          <p>The frozen model, its confirmation period, and the comparison that keeps the result in perspective.</p>
        </div>
        <ol className={styles.researchRoute} aria-label="Research pipeline">{etfResearch.pipeline.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong><span aria-hidden="true">↗</span></li>)}</ol>
        <dl className={styles.methodNotes} data-project-methods="etf">
          <div><dt>Predict a relative rank</dt><dd>One observation is an ETF at a weekly decision date. The target ranks its next {phase7Summary.research_design.target_horizon_spy_sessions} SPY-session adjusted total return against the other ETFs.</dd></div>
          <div><dt>Freeze the fitting recipe</dt><dd>Training-median imputation and a training-only StandardScaler feed the 18-feature Elastic Net. The frozen model uses α = {phase7Summary.model.configuration.alpha} and l1_ratio = {phase7Summary.model.configuration.l1_ratio}.</dd></div>
          <div><dt>Account for overlapping targets</dt><dd>{result.weekly_decisions} weekly decisions produce {result.prediction_rows.toLocaleString("en-US")} ETF/date predictions. The reported inference uses HAC lag {result.hac_lag} and a moving-block bootstrap to account for serial dependence.</dd></div>
        </dl>
        <figure className={styles.wideFigure}>
          <Image src={etfResearch.figures.confirmation} alt="Development mean IC 0.109, sealed confirmation mean IC 0.130 with HAC 95 percent interval, and momentum confirmation IC 0.086" width={1505} height={970} sizes="(min-width: 1100px) 80vw, 95vw" />
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
          <div><p className={styles.kicker}>02 / The recorded paper signal</p><h2 id={snapshotId}>OPEN THE<br /><span>BLACK BOX.</span></h2></div>
          <p>Choose a published ETF below. Follow the features that moved its relative model score.</p>
        </div>
        <div className={styles.snapshotRibbon}><span>Archived snapshot / {latestSignal.as_of_date}</span><span>{latestSignal.eligible_universe_size} eligible ETFs</span><span>{latestSignal.status} as published</span></div>
        <div><PaperSignalExplorer snapshot={latestSignal} /></div>
        <p className={styles.snapshotNote}>This saved snapshot is not updated by the website. Its recorded status remains pending; no realized outcome is supplied here. A model-score percentile is a ranking, not a probability of return. Research-only paper signal.</p>
        <div className={styles.sourceLinks}><a href={etfResearch.signalUrl} target="_blank" rel="noopener noreferrer">Read the signal export ↗</a><a href={etfResearch.summaryUrl} target="_blank" rel="noopener noreferrer">Read the research export ↗</a></div>
      </section>

      <section className={styles.conclusion} aria-labelledby={`${titleId}-limits`} data-room-surface="conclusion">
        <div><p className={styles.kicker}>03 / Keep the claim in focus</p><h2 id={`${titleId}-limits`}>A SIGNAL.<br /><span>WITH LIMITS.</span></h2></div>
        <div className={styles.limitSpread}><p>Finding structure in the data is one result. Understanding the conditions around it is part of the work.</p><ul>{etfResearch.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></div>
        <div className={styles.finalLinks}><Link href={`/projects/${etfResearch.slug}`}>The complete case study <span aria-hidden="true">↗</span></Link><a href={etfResearch.releaseUrl} target="_blank" rel="noopener noreferrer">Explore the frozen research source ↗</a></div>
        <p className={styles.disclaimer}>Historical research; not investment advice.</p>
      </section>
    </div>
  );
}
