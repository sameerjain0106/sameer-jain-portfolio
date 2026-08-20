"use client";

import { useState } from "react";
import { PipelineStage } from "@/lib/types";

export default function MethodologyPipeline({ stages }: { stages: PipelineStage[] }) {
  const [openId, setOpenId] = useState<string | null>(stages[0]?.id ?? null);

  return (
    <div className="flex flex-col">
      {stages.map((stage, i) => {
        const isOpen = openId === stage.id;
        const isLast = i === stages.length - 1;
        return (
          <div key={stage.id} className="relative flex gap-4">
            {/* connector line + number */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setOpenId(isOpen ? null : stage.id)}
                aria-expanded={isOpen}
                className={
                  isOpen
                    ? "mono-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-signal bg-signal/15 text-xs text-signal transition-colors"
                    : "mono-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-base-border bg-base-panel text-xs text-ink-muted transition-colors hover:border-signal/40 hover:text-signal"
                }
              >
                {String(i + 1).padStart(2, "0")}
              </button>
              {!isLast && <div className="w-px flex-1 bg-base-border" />}
            </div>

            <button
              onClick={() => setOpenId(isOpen ? null : stage.id)}
              className="flex-1 pb-8 text-left"
              aria-expanded={isOpen}
            >
              <h4
                className={
                  isOpen
                    ? "font-display text-base font-semibold text-signal"
                    : "font-display text-base font-semibold text-ink"
                }
              >
                {stage.title}
              </h4>
              <div
                className={
                  isOpen
                    ? "mt-2 max-h-40 opacity-100 transition-all duration-300"
                    : "mt-0 max-h-0 overflow-hidden opacity-0 transition-all duration-300"
                }
              >
                <p className="text-sm leading-relaxed text-ink-muted">
                  {stage.description}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
