"use client";

import { useState } from "react";
import type { ModelResult } from "@/lib/types";
import styles from "./ResultsChart.module.css";

const ticks = [100, 75, 50, 25, 0];

export default function ResultsChart({ models }: { models: ModelResult[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <figure className={styles.chart} aria-label="Model accuracy and F1 score">
      <div className={styles.grid} aria-hidden="true">
        {ticks.map((tick) => <div className={styles.tick} key={tick} style={{ top: `${100 - tick}%` }}><span>{tick}%</span></div>)}
      </div>
      <ul className={styles.groups}>
        {models.map((model) => {
          const accuracy = `${(model.accuracy * 100).toFixed(1)}%`;
          const f1 = `${(model.f1 * 100).toFixed(1)}%`;
          const isSelected = selected === model.name;
          return (
            <li className={styles.group} key={model.name}>
              <button
                type="button"
                className={styles.model}
                aria-label={`${model.name}, accuracy ${accuracy}, F1 score ${f1}`}
                aria-pressed={isSelected}
                onClick={() => setSelected(isSelected ? null : model.name)}
              >
                <span className={styles.bars} aria-hidden="true">
                  <span className={styles.accuracy} style={{ height: accuracy }} />
                  <span className={styles.f1} style={{ height: f1 }} />
                </span>
                <span className={styles.label}>{model.name}</span>
              </button>
              <div className={styles.values} data-selected={isSelected} aria-hidden="true">
                <span className={styles.accuracy}>Accuracy {accuracy}</span>
                <span className={styles.f1}>F1 Score {f1}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <figcaption className={styles.legend}>
        <span className={styles.accuracy}>Accuracy</span>
        <span className={styles.f1}>F1 Score</span>
      </figcaption>
    </figure>
  );
}
