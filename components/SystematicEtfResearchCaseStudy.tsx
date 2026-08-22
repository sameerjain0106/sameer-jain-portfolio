import Link from "next/link";
import TechPill from "@/components/TechPill";
import { etfResearch } from "@/data/etfResearch";

function SectionHeader({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="grid gap-4 border-b border-base-border pb-6 md:grid-cols-[120px_1fr] md:gap-8">
      <div className="flex items-center gap-3 md:block">
        <span className="font-mono text-xs text-ink-faint">{index}</span>
        <span className="hidden h-px w-10 bg-base-border md:mt-3 md:block" />
      </div>
      <div className="max-w-3xl">
        <p className="mono-label text-[10px] text-signal">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ResearchLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "rounded-md bg-signal px-4 py-2.5 text-sm font-medium text-base transition-colors hover:bg-signal-glow"
          : "rounded-md border border-base-border bg-base/40 px-4 py-2.5 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-signal"
      }
    >
      {children} ↗
    </a>
  );
}

const riskToneClasses = {
  caution: "border-amber/30 bg-amber/5",
  highlight: "border-signal/40 bg-signal/5 shadow-[0_18px_50px_-36px_rgba(77,216,196,0.6)]",
  neutral: "border-base-border bg-base-panel/85",
} as const;

export default function SystematicEtfResearchCaseStudy() {
  return (
    <article>
      <header className="relative overflow-hidden border-b border-base-border bg-grid">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 75% 30%, rgba(77,216,196,0.10), transparent 58%), linear-gradient(to bottom, rgba(10,12,16,0.12), #0A0C10 94%)",
          }}
        />

        <div className="site-shell relative py-12 sm:py-16 lg:py-20">
          <Link
            href="/#work"
            className="mono-label text-[10px] text-ink-muted transition-colors hover:text-signal"
          >
            ← Back to selected work
          </Link>

          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(430px,0.72fr)] lg:gap-16">
            <div className="animate-fade-up opacity-0">
              <div className="flex flex-wrap items-center gap-2">
                <TechPill>Quantitative Research</TechPill>
                <TechPill>Machine Learning</TechPill>
                <span className="mono-label rounded border border-signal/30 bg-signal/10 px-2 py-1 text-[10px] text-signal">
                  Phase 3C complete
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl xl:text-7xl">
                {etfResearch.title}
              </h1>
              <p className="mt-5 max-w-3xl font-display text-lg leading-7 text-ink-muted sm:text-xl">
                {etfResearch.subtitle}
              </p>

              <div className="mt-7 max-w-3xl border-l border-signal/50 pl-5">
                <p className="mono-label text-[9px] text-signal">Research question</p>
                <p className="mt-2 text-base leading-7 text-ink sm:text-lg">
                  {etfResearch.researchQuestion}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ResearchLink href={etfResearch.githubUrl} primary>
                  GitHub
                </ResearchLink>
                <ResearchLink href={etfResearch.releaseUrl}>Frozen Research v1</ResearchLink>
              </div>
            </div>

            <div className="animate-fade-up rounded-xl border border-base-border bg-base-panel/90 p-5 opacity-0 shadow-[0_30px_80px_-44px_rgba(77,216,196,0.3)] [animation-delay:140ms] sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-base-border pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_12px_rgba(77,216,196,0.8)]" />
                  <span className="mono-label text-[9px] text-ink-muted">Primary finding</span>
                </div>
                <span className="font-mono text-[9px] text-ink-faint">OOS / MONTHLY</span>
              </div>

              <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div>
                  <p className="font-mono text-4xl font-medium text-ink sm:text-5xl">0.195</p>
                  <p className="mono-label mt-2 text-[8px] leading-4 text-ink-faint">Original IC</p>
                </div>
                <span aria-hidden="true" className="font-mono text-2xl text-signal">
                  →
                </span>
                <div className="text-right">
                  <p className="font-mono text-4xl font-medium text-amber sm:text-5xl">0.006</p>
                  <p className="mono-label mt-2 text-[8px] leading-4 text-ink-faint">Residual IC</p>
                </div>
              </div>

              <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-base-border">
                <div className="h-full w-[2.8%] min-w-[6px] bg-amber" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[9px] text-ink-faint">
                <span>Beta residualization</span>
                <span>2.8% IC retained</span>
              </div>

              <p className="mt-6 border-t border-base-border pt-5 text-sm leading-6 text-ink-muted">
                The project challenged its own apparent alpha and found that most predictive power reflected systematic market-risk exposure.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-base-border pt-6">
            {etfResearch.technologies.map((technology) => (
              <TechPill key={technology} variant="accent">
                {technology}
              </TechPill>
            ))}
          </div>
        </div>
      </header>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="01"
            eyebrow="Research at a glance"
            title="A reproducible, point-in-time research system"
            description="The project connects raw data contracts, leakage-controlled modeling, robust inference, and portfolio diagnostics in one versioned workflow."
          />

          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {etfResearch.atAGlance.map((metric, index) => (
              <div
                key={metric.label}
                className="animate-fade-up rounded-lg border border-base-border bg-base-panel/85 p-5 opacity-0"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <dt className="mono-label text-[9px] text-ink-faint">{metric.label}</dt>
                <dd className="mt-2 font-mono text-2xl font-medium text-ink sm:text-3xl">
                  {metric.value}
                </dd>
                <p className="mt-3 text-xs leading-5 text-ink-muted">{metric.detail}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="02"
            eyebrow="System architecture"
            title="From raw history to falsifiable evidence"
            description="Each layer preserves a clear information boundary so later diagnostics can challenge earlier results without rewriting them."
          />

          <ol className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-9">
            {etfResearch.architecture.map((stage, index) => (
              <li
                key={stage.title}
                className="relative rounded-lg border border-base-border bg-base-panel/85 p-4 lg:min-h-[190px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < etfResearch.architecture.length - 1 && (
                    <span aria-hidden="true" className="font-mono text-xs text-ink-faint lg:absolute lg:-right-2.5 lg:top-1/2 lg:z-10 lg:-translate-y-1/2">
                      →
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-sm font-semibold leading-5 text-ink">
                  {stage.title}
                </h3>
                <p className="mt-3 text-[11px] leading-5 text-ink-muted">{stage.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="03"
            eyebrow="Research progression"
            title="The result became more useful when it got smaller"
            description="The scientific story is not a favorable backtest. It is a sequence of increasingly strict tests that separated apparent predictability from persistent selection alpha."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {etfResearch.phases.map((phase, index) => (
              <article
                key={phase.id}
                className={
                  index === 2
                    ? "rounded-xl border border-signal/40 bg-signal/5 p-6"
                    : "rounded-xl border border-base-border bg-base-panel/85 p-6"
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="mono-label text-[10px] text-signal">Phase {phase.id}</span>
                  <span className="font-mono text-[10px] text-ink-faint">0{index + 1} / 03</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{phase.title}</h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-ink-muted">{phase.summary}</p>

                <dl className="mt-6 space-y-4 border-t border-base-border pt-5">
                  {phase.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="mono-label text-[8px] text-ink-faint">{metric.label}</dt>
                      <dd className={index === 2 ? "mt-1 font-mono text-xl text-signal" : "mt-1 font-mono text-xl text-ink"}>
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="mt-6 grid items-center gap-8 rounded-xl border border-base-border bg-base-panel/90 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)]">
            <div>
              <p className="mono-label text-[9px] text-signal">Central finding</p>
              <div className="mt-4 flex items-center gap-4 sm:gap-6">
                <span className="font-mono text-4xl text-ink sm:text-6xl">0.195</span>
                <span aria-hidden="true" className="font-mono text-2xl text-signal sm:text-3xl">→</span>
                <span className="font-mono text-4xl text-amber sm:text-6xl">0.006</span>
              </div>
              <p className="mono-label mt-3 text-[8px] text-ink-faint">Monthly OOS information coefficient</p>
            </div>
            <div className="border-t border-base-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-base leading-7 text-ink">
                Point-in-time beta residualization removed almost all of the original ranking signal.
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                This was the intended stress test: identify whether the model selected ETFs for idiosyncratic return or mainly favored systematic market exposure. The evidence supported the latter, so the research rejected an overstated alpha claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="04"
            eyebrow="2022 risk-control case study"
            title="Exposure attribution translated into a concrete control"
            description="The untouched 2022 test exposed concentrated high-beta and growth risk. A simple, predeclared beta ceiling materially reduced downside; it was not optimized using 2022."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {etfResearch.riskCaseStudy.map((strategy) => (
              <article
                key={strategy.title}
                className={`rounded-xl border p-6 ${riskToneClasses[strategy.tone]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-ink">{strategy.title}</h3>
                  {strategy.tone === "highlight" && (
                    <span className="mono-label rounded-full border border-signal/30 bg-signal/10 px-2 py-1 text-[8px] text-signal">
                      risk control
                    </span>
                  )}
                </div>
                <dl className="mt-6 grid grid-cols-3 divide-x divide-base-border border-y border-base-border py-4">
                  {strategy.metrics.map((metric) => (
                    <div key={metric.label} className="px-3 first:pl-0 last:pr-0">
                      <dt className="mono-label text-[7px] leading-4 text-ink-faint">{metric.label}</dt>
                      <dd className="mt-2 font-mono text-base text-ink sm:text-lg">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-signal/25 bg-signal/5 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="mono-label text-[9px] text-signal">Observed downside reduction</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                The beta ≤ 1.10 control reduced 2022 max drawdown by 12.74 percentage points, or 37.1%.
              </p>
            </div>
            <p className="mt-4 shrink-0 font-mono text-2xl text-signal sm:mt-0">−34.36% → −21.62%</p>
          </div>
        </div>
      </section>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="05"
            eyebrow="ML & modeling"
            title="Complexity was earned, not assumed"
            description="Elastic Net was selected as an interpretable regularized baseline. The design prioritized temporal validity, fold-local preprocessing, and auditable feature selection over model novelty."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <div className="rounded-xl border border-base-border bg-base-panel/85 p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-border pb-5">
                <div>
                  <p className="mono-label text-[9px] text-signal">Primary model</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-ink">Elastic Net regression</h3>
                </div>
                <span className="font-mono text-sm text-ink-faint">L1 + L2</span>
              </div>
              <ul className="mt-3 divide-y divide-base-border">
                {etfResearch.modeling.map((item, index) => (
                  <li key={item} className="flex gap-4 py-4 text-sm leading-6 text-ink-muted">
                    <span className="font-mono text-[10px] text-signal">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-xl border border-amber/30 bg-amber/5 p-6 sm:p-7">
              <p className="mono-label text-[9px] text-amber">Intentionally deferred</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">No complexity without residual signal</h3>
              <div className="mt-6 space-y-4">
                {etfResearch.deferredModels.map((item) => (
                  <p key={item} className="border-l border-amber/40 pl-4 text-sm leading-6 text-ink-muted">
                    {item}
                  </p>
                ))}
              </div>
              <p className="mt-7 border-t border-amber/20 pt-5 text-xs leading-5 text-amber">
                Deferral was a methodological decision: nonlinear ML would add flexibility before the study had established a robust beta-neutral target worth fitting.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="06"
            eyebrow="Methodology safeguards"
            title="The result had to survive the research process"
            description="Safeguards were built around the information actually available at each decision date and the dependence structure of overlapping forward returns."
          />

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {etfResearch.safeguards.map((safeguard) => (
              <li
                key={safeguard}
                className="flex min-h-[84px] items-start gap-3 rounded-lg border border-base-border bg-base-panel/80 p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/10 font-mono text-[10px] text-signal">
                  ✓
                </span>
                <span className="text-sm leading-6 text-ink-muted">{safeguard}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-base-border py-12 sm:py-16">
        <div className="site-shell">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="rounded-xl border border-signal/35 bg-signal/5 p-7 sm:p-9">
              <p className="mono-label text-[10px] text-signal">Research conclusion</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Evidence over narrative.
              </h2>
              <p className="mt-5 text-base leading-8 text-ink">{etfResearch.conclusion}</p>
              <p className="mt-5 border-t border-signal/20 pt-5 text-sm leading-7 text-ink-muted">
                {etfResearch.conclusionDetail}
              </p>
              <p className="mono-label mt-6 text-[9px] text-ink-faint">
                No market-beating or expected-profitability claim is made.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border border-base-border bg-base-panel/85 p-6">
                <p className="mono-label text-[9px] text-amber">Limitations</p>
                <ul className="mt-4 space-y-3">
                  {etfResearch.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-3 text-xs leading-5 text-ink-muted">
                      <span aria-hidden="true" className="text-amber">—</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-base-border bg-base-panel/85 p-6">
                <p className="mono-label text-[9px] text-signal">Future work · not yet implemented</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {etfResearch.futureWork.map((item) => (
                    <span key={item} className="rounded-full border border-base-border bg-base/60 px-3 py-1.5 text-[11px] text-ink-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="site-shell">
          <div className="flex flex-col justify-between gap-6 rounded-xl border border-base-border bg-base-panel/85 p-7 sm:p-9 md:flex-row md:items-center">
            <div>
              <p className="mono-label text-[9px] text-signal">Inspect the frozen work</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Code, methodology, and versioned results are public.
              </h2>
              <p className="mt-2 text-sm text-ink-muted">{etfResearch.version}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ResearchLink href={etfResearch.githubUrl} primary>
                GitHub
              </ResearchLink>
              <ResearchLink href={etfResearch.releaseUrl}>Frozen Research v1</ResearchLink>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

