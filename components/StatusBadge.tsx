import { ApproachStatus } from "@/lib/types";

const CONFIG: Record<ApproachStatus, { label: string; className: string }> = {
  complete: {
    label: "Results available",
    className: "border-signal/40 bg-signal/10 text-signal",
  },
  "methodology-only": {
    label: "Methodology · qualitative results only",
    className: "border-amber/40 bg-amber/10 text-amber",
  },
  "in-progress": {
    label: "Methodology · results pending",
    className: "border-ink-faint/40 bg-base-raised text-ink-muted",
  },
};

export default function StatusBadge({ status }: { status: ApproachStatus }) {
  const cfg = CONFIG[status];
  return (
    <span
      className={`mono-label inline-flex items-center rounded-full border px-3 py-1 text-[10px] ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
