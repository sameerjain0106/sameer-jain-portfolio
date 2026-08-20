export default function TechnicalMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-lg border border-signal/40 bg-signal/5 p-4"
          : "rounded-lg border border-base-border bg-base-panel p-4"
      }
    >
      <p className="mono-label text-[10px] text-ink-muted">{label}</p>
      <p
        className={
          highlight
            ? "mt-1 font-mono text-2xl font-medium text-signal"
            : "mt-1 font-mono text-2xl font-medium text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}
