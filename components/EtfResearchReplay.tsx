"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { etfResearch, latestSignal, phase7Summary } from "@/data/etfResearch";
import PaperSignalExplorer, { type SignalRow } from "./PaperSignalExplorer";
import styles from "./EtfResearchReplay.module.css";

const result = phase7Summary.statistical_result;
const paired = phase7Summary.momentum_comparison;
const design = phase7Summary.research_design;
const options = phase7Summary.model.configuration;
const years = Object.entries(result.annual_confirmation_ic);
const fixed = (value: number) => value.toFixed(3).replace("-", "−");
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const chapters = ["Model score and ranks", "Two confirmation tests", "One archived paper signal", "Where the evidence ends"];
type DrawScene = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => void;

export default function EtfResearchReplay({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const indicator = useRef<HTMLDivElement>(null);
  const selected = useRef(latestSignal.top_model_ranked[0] as SignalRow);
  const refreshSelection = useRef<() => void>(() => {});

  const selectSignal = useCallback((row: SignalRow) => {
    selected.current = row;
    refreshSelection.current();
  }, []);

  useEffect(() => {
    const shell = track.current;
    const plot = canvas.current;
    if (!active || !scrollRoot || !shell || !plot) return;
    const root = scrollRoot;
    const media = matchMedia("(min-height: 500px) and (prefers-reduced-motion: no-preference)");
    if (!("IntersectionObserver" in window) || !("ResizeObserver" in window)) return;
    const context = plot.getContext("2d");
    if (!context) return;
    const articles = Array.from(shell.querySelectorAll<HTMLElement>("[data-replay-step]"));
    const currentLabel = label.current!;
    const progressBar = indicator.current!;
    let painters: DrawScene[] | undefined;
    let loading = false;
    let disposed = false;
    let visible = false;
    let dirty = true;
    let frame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let finishedAt = 0;
    let stops: number[] = [];
    let previousProgress = -1;
    let previousChapter = -1;
    let previousDrawing = -1;
    let previousHandoff = -1;
    let previousSignal: SignalRow | undefined;

    function measure() {
      const roomBox = root.getBoundingClientRect();
      const trackBox = shell!.getBoundingClientRect();
      const viewport = root.clientHeight;
      const bounds = plot!.getBoundingClientRect();
      const anchor = roomBox.top + root.clientTop + viewport * (window.innerWidth <= 900 ? .78 : .58);
      const base = root.scrollTop - anchor;
      stops = articles.map(article => article.getBoundingClientRect().top + base);
      finishedAt = Math.min(root.scrollHeight - viewport, trackBox.bottom + base + viewport * .20);
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      const pixelWidth = Math.round(width * pixelRatio);
      const pixelHeight = Math.round(height * pixelRatio);
      if (plot!.width !== pixelWidth || plot!.height !== pixelHeight) {
        plot!.width = pixelWidth;
        plot!.height = pixelHeight;
      }
      previousDrawing = -1;
      dirty = false;
    }

    function paint() {
      frame = 0;
      if (disposed || !visible || !painters || !media.matches || document.hidden) return;
      if (dirty) measure();
      if (!width || !height) return;
      const top = root.scrollTop;
      let chapter = 0;
      while (chapter < stops.length - 1 && top >= stops[chapter + 1]) chapter++;
      const end = stops[chapter + 1] ?? finishedAt;
      const progress = clamp((top - stops[chapter]) / Math.max(1, end - stops[chapter]));
      const signal = selected.current;
      const nextChapter = chapter + 1;
      const drawing = clamp(progress / (chapter === 2 ? .42 : .82));
      const handoff = painters[nextChapter] ? clamp((progress - .89) / .11) : 0;
      const selectionChanged = signal !== previousSignal && (chapter === 2 || (handoff > 0 && nextChapter === 2));
      if (chapter !== previousChapter || drawing !== previousDrawing || handoff !== previousHandoff || selectionChanged) {
        context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context!.clearRect(0, 0, width, height);
        context!.save();
        context!.globalAlpha = 1 - handoff;
        painters[chapter](context!, width, height, drawing);
        context!.restore();
        if (handoff) {
          context!.save();
          context!.globalAlpha = handoff;
          painters[nextChapter](context!, width, height, 0);
          context!.restore();
        }
      }
      if (chapter !== previousChapter) {
        currentLabel.textContent = chapters[chapter];
        shell!.dataset.replayChapter = String(chapter);
      }
      if (chapter !== previousChapter || progress !== previousProgress) {
        progressBar.style.transform = `scaleX(${(chapter + progress) / chapters.length})`;
      }
      previousDrawing = drawing;
      previousHandoff = handoff;
      previousProgress = progress;
      previousChapter = chapter;
      previousSignal = signal;
    }

    function schedule() {
      if (visible && painters && media.matches && !frame && !document.hidden && !disposed) frame = requestAnimationFrame(paint);
    }

    function refresh() {
      dirty = true;
      schedule();
    }

    function configure() {
      shell!.toggleAttribute("data-motion", media.matches);
      if (media.matches) load();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      refresh();
    }

    let nearby = false;
    function load() {
      if (!nearby || loading || painters || !media.matches) return;
      loading = true;
      void Promise.all([import("@/lib/etfFeatureStream"), import("@/lib/etfEvidenceScope"), import("@/lib/etfSignalTrace")])
        .then(([features, evidence, trace]) => {
          if (disposed) return;
          painters = [
            features.drawFeatureStream,
            evidence.drawEvidenceScope,
            (ctx, w, h, progress) => trace.drawSignalTrace(ctx, w, h, progress, selected.current),
            trace.drawEvidenceBoundary,
          ];
          refresh();
        })
        .catch(() => {
          if (!disposed) shell!.removeAttribute("data-motion");
        })
        .finally(() => { loading = false; });
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) refresh();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { root });
    const preload = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      if (nearby) load();
    }, { root, rootMargin: "350px 0px" });
    const resize = new ResizeObserver(refresh);
    visibility.observe(plot);
    preload.observe(shell);
    resize.observe(root);
    resize.observe(shell);
    resize.observe(plot);
    articles.forEach(article => resize.observe(article));
    refreshSelection.current = schedule;
    root.addEventListener("scroll", schedule, { passive: true });
    root.addEventListener("spatial:entered", refresh);
    media.addEventListener("change", configure);
    document.addEventListener("visibilitychange", refresh);
    configure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      visibility.disconnect();
      preload.disconnect();
      resize.disconnect();
      refreshSelection.current = () => {};
      root.removeEventListener("scroll", schedule);
      root.removeEventListener("spatial:entered", refresh);
      media.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [active, scrollRoot]);

  return (
    <section className={styles.replay} id="etf-evidence" aria-labelledby="etf-evidence-title" data-room-surface>
      <header className={styles.intro}>
        <h2 id="etf-evidence-title">Follow one ETF score</h2>
        <p>Trace a weekly ranking through the frozen model, the confirmation period, and a published paper signal.</p>
      </header>
      <div className={styles.track} ref={track} data-etf-replay>
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.stageHeader}><span>Research replay</span><span ref={label}>{chapters[0]}</span></div>
          <div className={styles.plot}><canvas ref={canvas} /></div>
          <div className={styles.progress}><div ref={indicator} /></div>
        </div>
        <div className={styles.chapters}>
          <article className={styles.beat} data-replay-step="model">
            <h3>From 18 inputs to a weekly rank</h3>
            <p>Momentum, volatility, drawdown, and trend describe each ETF. After training-median imputation and training-only standardization, the frozen Elastic Net puts the ETFs in score order each week.</p>
            <p>The target is each ETF’s rank by adjusted total return over the next {design.target_horizon_spy_sessions} SPY sessions.</p>
            <dl className={styles.metrics}>
              <div><dt>Elastic Net α</dt><dd>{options.alpha}</dd></div>
              <div><dt>L1 ratio</dt><dd>{options.l1_ratio}</dd></div>
            </dl>
          </article>
          <article className={styles.beat} data-replay-step="confirmation">
            <h3>How the model compared with momentum</h3>
            <dl className={styles.tests}>
              <div><dt>Frozen model vs. zero</dt><dd><b>{fixed(result.confirmation_mean_spearman_ic)}</b> mean weekly Spearman IC. The 95% HAC interval stays above zero ({result.hac_95_ci.map(fixed).join(" to ")}).</dd></div>
              <div><dt>Frozen model minus momentum</dt><dd><b>{fixed(paired.cstar_minus_momentum_ic)}</b> paired IC difference. The 95% HAC interval crosses zero ({paired.paired_hac_95_ci.map(fixed).join(" to ")}).</dd></div>
            </dl>
            <p>Across {result.weekly_decisions} weekly decisions and {result.prediction_rows.toLocaleString("en-US")} predictions, the analysis used HAC lag {result.hac_lag} and a moving-block bootstrap to account for overlapping targets.</p>
            <dl className={styles.metrics}>{years.map(([year, mean]) => <div key={year}><dt>{year === "partial_2026" ? "2026 partial" : year}</dt><dd>{fixed(mean)}</dd></div>)}</dl>
            <a href={etfResearch.figures.confirmation} target="_blank" rel="noopener noreferrer">Open the original confirmation figure</a>
          </article>
          <article className={`${styles.beat} ${styles.signal}`} data-replay-step="signal">
            <h3>Pick an ETF from the archive</h3>
            <p>The saved run on {latestSignal.as_of_date} ranked {latestSignal.eligible_universe_size} eligible ETFs. Choose a ticker to see its published contributions and percentile on the trace.</p>
            <PaperSignalExplorer snapshot={latestSignal} replay onSelectionChange={selectSignal} />
            <a href={etfResearch.signalUrl} target="_blank" rel="noopener noreferrer">Read the signal export</a>
          </article>
          <article className={styles.beat} data-replay-step="limits">
            <h3>Where the evidence ends</h3>
            <p>The confirmation period spans {design.confirmation_period}. The archived snapshot records the forward test outcome as pending.</p>
            <ul className={styles.limits}>{etfResearch.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
            <p>A stronger follow-up would rerun the frozen recipe on a new ETF universe and time period in an independent test.</p>
            <div className={styles.links}>
              <Link href={`/projects/${etfResearch.slug}`} prefetch={false}>Read the complete case study</Link>
              <a href={etfResearch.summaryUrl} target="_blank" rel="noopener noreferrer">Read the research export</a>
              <a href={etfResearch.releaseUrl} target="_blank" rel="noopener noreferrer">Open the frozen research source</a>
            </div>
            <p className={styles.note}>Historical research for informational purposes.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
