const steps = [
  { phase: "3A", label: "Apparent IC", value: "0.1951", width: "100%" },
  { phase: "3B", label: "Robustness", value: "confirmed", width: "100%" },
  { phase: "3C", label: "Residual IC", value: "0.0055", width: "3%" },
];

export default function EtfResearchCardVisual() {
  return (
    <div className="relative flex h-full min-h-[310px] flex-col overflow-hidden bg-[#0b0e13] p-5 sm:p-7">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 76% 22%, rgba(77,216,196,0.12), transparent 34%), radial-gradient(circle at 20% 88%, rgba(217,164,91,0.06), transparent 30%)",
        }}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_12px_rgba(77,216,196,0.8)]" />
          <span className="mono-label text-[9px] text-ink-muted">Research progression</span>
        </div>
        <span className="mono-label rounded-full border border-signal/25 bg-signal/5 px-2.5 py-1 text-[8px] text-signal">
          v1 frozen
        </span>
      </div>

      <div className="relative mt-8 grid flex-1 gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.phase}
            className="relative flex min-h-[132px] flex-col rounded-lg border border-base-border bg-base/75 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="mono-label text-[9px] text-signal">Phase {step.phase}</span>
              <span className="font-mono text-[9px] text-ink-faint">0{index + 1}</span>
            </div>
            <p className="mt-5 font-display text-lg font-semibold text-ink">{step.value}</p>
            <p className="mono-label mt-1 text-[8px] text-ink-faint">{step.label}</p>
            <div className="mt-auto h-1 overflow-hidden rounded-full bg-base-border">
              <div
                className={index === 2 ? "h-full min-w-[5px] bg-amber" : "h-full bg-signal"}
                style={{ width: step.width }}
              />
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -right-[12px] top-1/2 z-10 hidden -translate-y-1/2 font-mono text-xs text-ink-faint sm:block"
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-4 border-t border-base-border pt-4">
        <span className="mono-label text-[8px] text-ink-faint">Apparent signal</span>
        <span className="h-px flex-1 bg-gradient-to-r from-signal/60 to-amber/60" />
        <span className="mono-label text-right text-[8px] text-amber">Risk exposure identified</span>
      </div>
    </div>
  );
}

