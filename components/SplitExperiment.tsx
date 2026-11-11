"use client";

import { useId, useState } from "react";
import { EXPERIMENT_DOMAIN, EXPERIMENT_LENGTH, EXPERIMENT_SPLIT, LOOKBACKS, runExperiment, type Lookback } from "@/lib/splitExperiment";
import styles from "./SplitExperiment.module.css";

const LEFT = 44;
const RIGHT = 672;
const TOP = 28;
const BOTTOM = 278;
const x = (i: number) => LEFT + i / EXPERIMENT_LENGTH * (RIGHT - LEFT);
const y = (value: number) => BOTTOM - (value - EXPERIMENT_DOMAIN[0]) / (EXPERIMENT_DOMAIN[1] - EXPERIMENT_DOMAIN[0]) * (BOTTOM - TOP);
const curves = Object.fromEntries(LOOKBACKS.map((lookback) => [lookback, runExperiment(lookback)])) as Record<Lookback, number[]>;
const pathFor = (values: number[], from: number, to: number) => values.slice(from, to + 1).map((value, i) => `${i ? "L" : "M"}${x(i + from).toFixed(2)},${y(value).toFixed(2)}`).join(" ");

export default function SplitExperiment() {
  const [lookback, setLookback] = useState<Lookback>(3);
  const [revealed, setRevealed] = useState(false);
  const [observation, setObservation] = useState(EXPERIMENT_SPLIT);
  const id = useId().replace(/:/g, "");
  const values = curves[lookback];
  const current = Math.min(observation, revealed ? EXPERIMENT_LENGTH : EXPERIMENT_SPLIT);
  const trainingGrowth = (values[EXPERIMENT_SPLIT] / 100 - 1) * 100;
  const holdoutGrowth = (values[EXPERIMENT_LENGTH] / values[EXPERIMENT_SPLIT] - 1) * 100;

  function toggleReveal() {
    setRevealed(!revealed);
    setObservation(revealed ? EXPERIMENT_SPLIT : EXPERIMENT_LENGTH);
  }

  return (
    <div className={styles.experiment} data-revealed={revealed}>
      <div className={styles.titleBlock}>
        <span className={styles.annotation}>Go on. Question the curve.</span>
        <h2>Trust this curve?</h2>
        <p>Pick a strategy’s memory. It looks great on the past. What happens on unseen data?</p>
        <a className={styles.mobileJump} href={`#${id}-controls`}>Try the experiment <span aria-hidden="true">↓</span></a>
      </div>
      <div className={styles.plotSide}>
        <div className={styles.plotHeader}>
          <span className={styles.labLabel}>An experiment in healthy skepticism</span>
          <span className={styles.synthetic}>Synthetic data</span>
        </div>
        <div className={styles.chart} onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const localX = (event.clientX - bounds.left) / bounds.width * 710;
          const step = Math.round((localX - LEFT) / (RIGHT - LEFT) * EXPERIMENT_LENGTH);
          setObservation(Math.max(0, Math.min(step, revealed ? EXPERIMENT_LENGTH : EXPERIMENT_SPLIT)));
        }}>
          <svg viewBox="0 0 710 318" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
            <title id={`${id}-title`}>Momentum strategy on a constructed series, index starts at 100</title>
            <desc id={`${id}-desc`}>
              {lookback}-observation lookback. Training growth {trainingGrowth.toFixed(1)} percent.
              {revealed ? ` Holdout growth ${holdoutGrowth.toFixed(1)} percent. The same strategy loses value after the constructed regime changes.` : " Holdout is hidden until you choose Reveal the unseen."}
            </desc>
            <defs>
              <pattern id={`${id}-hatch`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" x2="0" y1="0" y2="12" stroke="currentColor" strokeWidth="1" /></pattern>
            </defs>
            {[80, 100, 140, 180].map((tick) => (
              <g key={tick} className={styles.axis}>
                <line x1={LEFT} x2={RIGHT} y1={y(tick)} y2={y(tick)} strokeDasharray={tick === 100 ? undefined : "2 6"} />
                <text x="28" y={y(tick) + 4} textAnchor="end">{tick}</text>
              </g>
            ))}
            <line x1={x(EXPERIMENT_SPLIT)} x2={x(EXPERIMENT_SPLIT)} y1={TOP} y2={BOTTOM} className={styles.splitLine} />
            <path d={pathFor(values, 0, EXPERIMENT_SPLIT)} className={styles.trainingPath} />
            <g className={styles.holdoutPath} aria-hidden={!revealed}>
              <path d={pathFor(values, EXPERIMENT_SPLIT, EXPERIMENT_LENGTH)} />
            </g>
            <g className={styles.cover} aria-hidden="true">
              <rect x={x(EXPERIMENT_SPLIT) + 1} y={TOP - 8} width={RIGHT - x(EXPERIMENT_SPLIT)} height={BOTTOM - TOP + 16} className={styles.coverFill} />
              <rect x={x(EXPERIMENT_SPLIT) + 1} y={TOP - 8} width={RIGHT - x(EXPERIMENT_SPLIT)} height={BOTTOM - TOP + 16} fill={`url(#${id}-hatch)`} opacity="0.13" />
              <text x={(x(EXPERIMENT_SPLIT) + RIGHT) / 2} y="142" textAnchor="middle" className={styles.question}>?</text>
              <text x={(x(EXPERIMENT_SPLIT) + RIGHT) / 2} y="181" textAnchor="middle" className={styles.coverText}>The unseen part.</text>
            </g>
            <g className={styles.marker}>
              <line x1={x(current)} x2={x(current)} y1={TOP} y2={BOTTOM} />
              <circle cx={x(current)} cy={y(values[current])} r="5" />
            </g>
            <g className={styles.axis}>
              <text x={LEFT} y="306">0</text>
              <text x={x(EXPERIMENT_SPLIT) - 10} y="306" textAnchor="end">108 · train</text>
              <text x={RIGHT} y="306" textAnchor="end">180 · holdout</text>
            </g>
          </svg>
        </div>
        <div className={styles.scrubber}>
          <label htmlFor={`${id}-scrub`}>Inspect a step</label>
          <input id={`${id}-scrub`} type="range" min="0" max={revealed ? EXPERIMENT_LENGTH : EXPERIMENT_SPLIT} value={current} onChange={(event) => setObservation(Number(event.target.value))} aria-valuetext={`Step ${current}, toy index ${values[current].toFixed(1)}`} />
          <output htmlFor={`${id}-scrub`}>{String(current).padStart(3, "0")} <span>/ {values[current].toFixed(1)}</span></output>
        </div>
      </div>

      <div id={`${id}-controls`} className={styles.controls}>
        <fieldset className={styles.lookbacks}>
          <legend>Strategy memory <span>observations</span></legend>
          <div>{LOOKBACKS.map((window) => <button key={window} type="button" aria-pressed={lookback === window} onClick={() => setLookback(window)}>{window}<span>{window === 3 ? "Short" : window === 12 ? "Medium" : "Long"}</span></button>)}</div>
        </fieldset>
        <button className={styles.revealButton} type="button" onClick={toggleReveal} aria-expanded={revealed} aria-controls={`${id}-outcome`}>
          {revealed ? "Reset experiment" : "Reveal the unseen"}<span aria-hidden="true">{revealed ? "↺" : "↗"}</span>
        </button>
        <div id={`${id}-outcome`} className={styles.outcome} aria-live="polite">
          {revealed ? <p><strong>{holdoutGrowth.toFixed(1)}% in the holdout.</strong> The rules stayed the same. The data changed. That’s why evaluation matters.</p> : <p>108 steps to explore. 72 kept out of sight.<br />The model never gets to peek ahead.</p>}
        </div>
      </div>
      <details className={styles.method}>
        <summary>What’s actually happening here? <span aria-hidden="true">+</span></summary>
        <p>This is a deliberately constructed teaching example, separate from my research results. A deterministic series (seed 71) changes from momentum to mean reversion after step 108. Exposure is the sign of the preceding 3, 12, or 30 returns, with zero exposure during warm-up. The toy index starts at 100, compounds each step, and excludes costs. All choices use identical data and chart scales.</p>
        <p>Trying settings after seeing the holdout is exploration, so that holdout is no longer an independent test. <a href="/projects/systematic-etf-research">Read the actual ETF research ↗</a></p>
      </details>
      <noscript><p className={styles.noScript}>This is a static teaching view. Enable JavaScript to change the strategy and reveal the holdout, or follow the link to the full research.</p></noscript>
    </div>
  );
}
