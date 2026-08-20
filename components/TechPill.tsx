export default function TechPill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "accent";
}) {
  return (
    <span
      className={
        variant === "accent"
          ? "mono-label inline-flex items-center rounded border border-signal/30 bg-signal/10 px-2 py-1 text-[10px] text-signal"
          : "mono-label inline-flex items-center rounded border border-base-border bg-base-panel px-2 py-1 text-[10px] text-ink-muted"
      }
    >
      {children}
    </span>
  );
}
