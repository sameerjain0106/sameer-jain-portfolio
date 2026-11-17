"use client";

import { useState } from "react";
import { ProjectApproach } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import ResultsChart from "@/components/ResultsChart";
import ImageGallery from "@/components/ImageGallery";
import MethodologyPipeline from "@/components/MethodologyPipeline";
import TechnicalMetric from "@/components/TechnicalMetric";

export default function ApproachTabs({ approaches }: { approaches: ProjectApproach[] }) {
  const [activeId, setActiveId] = useState(approaches[0]?.id);
  const active = approaches.find((a) => a.id === activeId) ?? approaches[0];

  if (!active) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-base-border pb-4">
        {approaches.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveId(a.id)}
            className={
              a.id === active.id
                ? "rounded-md bg-signal/10 border border-signal/40 px-4 py-2 text-sm font-medium text-signal transition-colors"
                : "rounded-md border border-transparent px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
            }
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={active.status} />
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
          {active.summary}
        </p>

        {/* Methodology steps */}
        <div>
          <h3 className="mono-label mb-4 text-xs text-ink-muted">Methodology</h3>
          <ol className="space-y-3">
            {active.methodology.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-muted">
                <span className="mono-label mt-0.5 shrink-0 text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Interactive pipeline (anomaly detection) */}
        {active.pipeline && (
          <div>
            <h3 className="mono-label mb-6 text-xs text-ink-muted">
              Pipeline — click a stage to expand
            </h3>
            <MethodologyPipeline stages={active.pipeline} />
          </div>
        )}

        {/* Quantitative results (supervised) */}
        {active.models && (
          <div>
            <h3 className="mono-label mb-4 text-xs text-ink-muted">Results</h3>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {active.models.map((m) => (
                <TechnicalMetric
                  key={m.name}
                  label={m.name}
                  value={`${(m.accuracy * 100).toFixed(1)}%`}
                  highlight={m === active.models![active.models!.length - 1]}
                />
              ))}
            </div>
            <ResultsChart models={active.models} />
          </div>
        )}

        {/* Visualizations */}
        {active.images && active.images.length > 0 && (
          <div>
            <h3 className="mono-label mb-4 text-xs text-ink-muted">Visualizations</h3>
            <ImageGallery images={active.images} />
          </div>
        )}

        {/* Notes / caveats */}
        {active.notes && active.notes.length > 0 && (
          <div className="space-y-3 rounded-lg border border-amber/30 bg-amber/5 p-5">
            {active.notes.map((note, i) => (
              <p key={i} className="text-xs leading-relaxed text-amber">
                {note}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
