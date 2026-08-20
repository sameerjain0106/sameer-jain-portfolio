import { site } from "@/data/site";
import MLVisualization from "@/components/MLVisualization";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-base-border bg-grid">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 78% 34%, rgba(77,216,196,0.075) 0%, rgba(10,12,16,0.16) 42%, #0A0C10 82%)",
        }}
      />

      <div className="site-shell relative grid items-center gap-10 py-12 lg:min-h-[565px] lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,0.82fr)] lg:gap-14 lg:py-14 xl:gap-20">
        <div className="max-w-[720px]">
          <p className="mono-label animate-fade-up text-xs text-signal opacity-0 [animation-delay:0ms]">
            Machine Learning Engineer · Data Science
          </p>

          <h1 className="mt-5 animate-fade-up font-display text-5xl font-semibold tracking-[-0.04em] text-ink opacity-0 [animation-delay:80ms] sm:text-6xl lg:text-7xl xl:text-[5.25rem] xl:leading-[0.96]">
            {site.name}
          </h1>

          <p className="mt-5 animate-fade-up font-display text-lg text-ink-muted opacity-0 [animation-delay:160ms] sm:text-xl">
            {site.role}
          </p>

          <p className="mt-6 max-w-2xl animate-fade-up text-balance text-[15px] leading-7 text-ink-muted opacity-0 [animation-delay:240ms] sm:text-base">
            {site.tagline}
          </p>

          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 opacity-0 [animation-delay:320ms]">
            <a
              href="#work"
              className="rounded-md bg-signal px-5 py-2.5 text-sm font-medium text-base transition-colors hover:bg-signal-glow"
            >
              View Selected Work
            </a>
            <a
              href={site.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-base-border bg-base/35 px-4 py-2.5 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-signal"
            >
              GitHub
            </a>
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-base-border bg-base/35 px-4 py-2.5 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-signal"
            >
              LinkedIn
            </a>
          </div>

          <div className="mt-9 grid max-w-[610px] animate-fade-up grid-cols-3 divide-x divide-base-border border-y border-base-border opacity-0 [animation-delay:400ms]">
            {site.heroStats.map((stat) => (
              <div key={stat.label} className="px-4 py-3 first:pl-0 last:pr-0">
                <p className="font-display text-lg font-semibold text-ink sm:text-xl">{stat.value}</p>
                <p className="mono-label mt-1 text-[8px] leading-4 text-ink-faint sm:text-[9px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full animate-fade-up opacity-0 [animation-delay:220ms] lg:justify-self-end">
          <MLVisualization />
        </div>
      </div>
    </section>
  );
}
