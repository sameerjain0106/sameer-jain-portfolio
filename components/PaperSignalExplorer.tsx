"use client";

import { useId, useState } from "react";
import styles from "./PaperSignalExplorer.module.css";

type Contribution = { feature: string; contribution: number };
type SignalRow = {
  ticker: string;
  model_score_percentile: number;
  major_positive_contributors: Contribution[];
  major_negative_contributors: Contribution[];
};
type Snapshot = {
  as_of_date: string;
  status: string;
  top_model_ranked: SignalRow[];
  bottom_model_ranked: SignalRow[];
};

const featureNames: Record<string, string> = {
  vol_252d: "252-day volatility",
  vol_126d: "126-day volatility",
  vol_63d: "63-day volatility",
  vol_21d: "21-day volatility",
  mom_252d: "252-day momentum",
  mom_126d: "126-day momentum",
  mom_63d: "63-day momentum",
  mom_21d: "21-day momentum",
  mom_252_21d: "12–1 momentum",
  max_drawdown_63d: "63-day max drawdown",
  max_drawdown_252d: "252-day max drawdown",
  current_drawdown: "Current drawdown",
  distance_from_252d_high: "Distance from 252-day high",
  price_sma20_ratio: "Price / 20-day average",
  price_sma50_ratio: "Price / 50-day average",
  price_sma200_ratio: "Price / 200-day average",
  sma50_sma200_ratio: "50 / 200-day averages",
};

function signed(value: number) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(4)}`;
}

export default function PaperSignalExplorer({ snapshot }: { snapshot: Snapshot }) {
  const [group, setGroup] = useState<"top" | "bottom">("top");
  const [ticker, setTicker] = useState(snapshot.top_model_ranked[0]?.ticker ?? "");
  const headingId = useId();
  const rows = group === "top" ? snapshot.top_model_ranked : snapshot.bottom_model_ranked;
  const selected = rows.find((row) => row.ticker === ticker) ?? rows[0];
  const allRows = [...snapshot.top_model_ranked, ...snapshot.bottom_model_ranked];
  const scale = Math.max(0.0001, ...allRows.flatMap((row) =>
    [...row.major_positive_contributors, ...row.major_negative_contributors].map((item) => Math.abs(item.contribution))
  ));

  function selectGroup(next: "top" | "bottom") {
    setGroup(next);
    setTicker((next === "top" ? snapshot.top_model_ranked : snapshot.bottom_model_ranked)[0]?.ticker ?? "");
  }

  if (!selected) return <p className={styles.empty}>No ranked ETFs are included in this snapshot.</p>;

  const contributions = [...selected.major_positive_contributors, ...selected.major_negative_contributors]
    .sort((a, b) => b.contribution - a.contribution);
  const percentile = selected.model_score_percentile * 100;

  return (
    <div className={styles.explorer} aria-labelledby={headingId}>
      <div className={styles.browser}>
        <p className={styles.label} id={headingId}>Inspect the published signal</p>
        <div className={styles.group} role="group" aria-label="Choose model ranking group">
          <button type="button" aria-pressed={group === "top"} onClick={() => selectGroup("top")}>Top ranked</button>
          <button type="button" aria-pressed={group === "bottom"} onClick={() => selectGroup("bottom")}>Bottom ranked</button>
        </div>
        <p className={styles.help}>Select an ETF to see what moved its model score.</p>
        <div className={styles.tickers} role="group" aria-label={`${group === "top" ? "Top" : "Bottom"} ranked ETFs`}>
          {rows.map((row) => (
            <button type="button" key={row.ticker} aria-pressed={selected.ticker === row.ticker} onClick={() => setTicker(row.ticker)}>
              <span>{row.ticker}</span>
              <span>{(row.model_score_percentile * 100).toFixed(1)}</span>
            </button>
          ))}
        </div>
        <p className={styles.footnote}>Ticker · model-score percentile<br />Snapshot {snapshot.as_of_date} · {snapshot.status.toLowerCase()} as published</p>
      </div>

      <div className={styles.detail}>
        <div className={styles.summary} aria-live="polite" aria-atomic="true">
          <div><p className={styles.label}>Selected ETF</p><h3>{selected.ticker}</h3></div>
          <div className={styles.score}><p className={styles.label}>Model-score percentile</p><p>{percentile.toFixed(1)}<span> / 100</span></p></div>
        </div>
        <meter className={styles.meter} min={0} max={100} value={percentile} aria-label={`${selected.ticker} model-score percentile`}>{percentile.toFixed(1)} out of 100</meter>
        <div className={styles.chartHeading}>
          <h4>Largest feature contributions</h4>
          <p>Lower score <span aria-hidden="true">← 0 →</span> Higher score</p>
        </div>
        <ul className={styles.contributions} aria-label={`Published feature contributions for ${selected.ticker}`}>
          {contributions.map((item) => (
            <li key={item.feature}>
              <span className={styles.feature} title={item.feature}>{featureNames[item.feature] ?? item.feature.replaceAll("_", " ")}</span>
              <span className={styles.track} aria-hidden="true">
                <span className={item.contribution >= 0 ? styles.positive : styles.negative} style={{ width: `${Math.abs(item.contribution) / scale * 50}%` }} />
              </span>
              <span className={styles.value}>{signed(item.contribution)}</span>
            </li>
          ))}
        </ul>
        <p className={styles.footnote}>Signed contributions use model-score units. These are the published largest contributors, not the full score decomposition. Percentile describes relative ranking, not return probability. Research-only paper signal.</p>
      </div>
    </div>
  );
}
