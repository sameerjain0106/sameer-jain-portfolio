import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import TechPill from "@/components/TechPill";
import PaperSignalExplorer from "@/components/PaperSignalExplorer";
import { etfResearch, latestSignal, phase7Summary } from "@/data/etfResearch";

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
    <div className="grid gap-4 border-b border-base-border pb-6 md:grid-cols-[96px_1fr] md:gap-8">
      <span className="font-mono text-xs text-ink-faint">{index}</span>
      <div className="max-w-4xl">
        <p className="mono-label text-[10px] text-signal">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function CaseSection({ children }: { children: ReactNode }) {
  return (
    <section className="border-b border-base-border py-12 sm:py-16">
      <div className="site-shell">{children}</div>
    </section>
  );
}

function ResearchFigure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-base-border bg-[#f8fafc] shadow-[0_24px_70px_-46px_rgba(77,216,196,0.45)]">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={900}
        className="h-auto w-full object-contain"
        sizes="(max-width: 1024px) 100vw, 72vw"
      />
      <figcaption className="border-t border-slate-200 bg-white px-4 py-3 font-mono text-[10px] leading-5 text-slate-600">
        {caption}
      </figcaption>
    </figure>
  );
}

function ResearchLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
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
          : "rounded-md border border-base-border bg-base/50 px-4 py-2.5 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-signal"
      }
    >
      {children} ↗
    </a>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatFeature(value: string) {
  return value.replaceAll("_", " ");
}

export default function SystematicEtfResearchCaseStudy() {
  const confirmation = phase7Summary.statistical_result;
  const maturity = latestSignal.target_maturity_date ?? "Pending — 21st future SPY session";

  return (
    <article>
      <header className="relative overflow-hidden border-b border-base-border bg-grid">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 75% at 72% 20%, rgba(77,216,196,0.11), transparent 60%), linear-gradient(to bottom, rgba(10,12,16,0.16), #0A0C10 96%)",
          }}
        />
        <div className="site-shell relative py-12 sm:py-16 lg:py-20">
          <Link
            href="/#work"
            className="mono-label text-[10px] text-ink-muted transition-colors hover:text-signal"
          >
            ← Back to selected work
          </Link>

          <div className="mt-8 grid items-end gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(470px,0.95fr)] xl:gap-14">
            <div className="animate-fade-up opacity-0">
              <div className="flex flex-wrap items-center gap-2">
                <TechPill>Quantitative Research</TechPill>
                <TechPill>Machine Learning</TechPill>
                <span className="mono-label rounded border border-signal/30 bg-signal/10 px-2 py-1 text-[9px] text-signal">
                  Phase 7 · confirmed
                </span>
              </div>
              <p className="mono-label mt-8 text-[10px] text-signal">01 · Research result</p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl xl:text-7xl">
                {etfResearch.title}
              </h1>
              <p className="mt-5 max-w-3xl font-display text-lg leading-7 text-ink-muted sm:text-xl">
                {etfResearch.subtitle}
              </p>
              <p className="mt-6 max-w-3xl border-l border-signal/50 pl-5 text-base leading-7 text-ink">
                Statistically confirmed cross-sectional return predictability: a frozen Elastic Net reached a mean confirmation Spearman IC of {confirmation.confirmation_mean_spearman_ic.toFixed(3)}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ResearchLink href={etfResearch.githubUrl} primary>Research repository</ResearchLink>
                <ResearchLink href={etfResearch.summaryUrl}>Public result export</ResearchLink>
              </div>
            </div>

            <div className="animate-fade-up rounded-xl border border-base-border bg-base-panel/95 p-5 opacity-0 shadow-[0_30px_90px_-48px_rgba(77,216,196,0.38)] [animation-delay:140ms] sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-base-border pb-4">
                <span className="mono-label text-[9px] text-signal">Sealed out-of-sample finding</span>
                <span className="font-mono text-[9px] text-ink-faint">2024–2026</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-base-border bg-base-border">
                {etfResearch.heroMetrics.map((metric) => (
                  <div key={metric.label} className="bg-base px-4 py-4">
                    <dt className="mono-label text-[8px] leading-4 text-ink-faint">{metric.label}</dt>
                    <dd className="mt-1 font-mono text-xl text-ink sm:text-2xl">{metric.value}</dd>
                    <p className="mt-2 text-[10px] leading-4 text-ink-muted">{metric.detail}</p>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-xs leading-5 text-ink-muted">
                Statistical prediction is the primary result. Historical portfolio behavior is secondary and is not proof of alpha or future profitability.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-base-border pt-6">
            {etfResearch.technologies.map((technology) => (
              <TechPill key={technology} variant="accent">{technology}</TechPill>
            ))}
          </div>
        </div>
      </header>

      <CaseSection>
        <SectionHeader
          index="02"
          eyebrow="The question"
          title={etfResearch.researchQuestion}
          description="The target is each ETF’s next-21-SPY-session adjusted-total-return cross-sectional rank. Weekly decisions make the prediction problem explicit while keeping the research cadence operationally realistic."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            ["Prediction unit", "ETF × weekly decision date"],
            ["Frozen target", "Next-21-SPY-session ETF adjusted-total-return cross-sectional rank"],
            ["Primary score", "Cross-sectional Spearman information coefficient"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-base-border bg-base-panel/85 p-5">
              <p className="mono-label text-[8px] text-signal">{label}</p>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{value}</p>
            </div>
          ))}
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="03"
          eyebrow="Research pipeline"
          title="From point-in-time inputs to genuine forward evidence"
          description="Every stage has an explicit information boundary and a versioned output, so the confirmation result can be audited without rerunning model search."
        />
        <ol className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {etfResearch.pipeline.map((stage, index) => (
            <li key={stage} className="relative rounded-lg border border-base-border bg-base-panel/85 p-4 xl:min-h-[142px]">
              <span className="font-mono text-[10px] text-signal">{String(index + 1).padStart(2, "0")}</span>
              <p className="mt-6 text-sm leading-5 text-ink">{stage}</p>
              {index < etfResearch.pipeline.length - 1 && (
                <span className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 font-mono text-xs text-ink-faint xl:block">→</span>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-7">
          <ResearchFigure
            src={etfResearch.figures.timeline}
            alt="Research timeline showing development, sealed confirmation, and forward testing"
            caption="The model was selected in pre-2024 development, evaluated once on the sealed confirmation period, then frozen for prospective paper predictions."
          />
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="04"
          eyebrow="Model discovery"
          title="Eighteen technical predictors, grouped by market behavior"
          description="The final input contract combines momentum, volatility, drawdown, and moving-average geometry. Preprocessing is fit on training data only."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {etfResearch.featureGroups.map((group) => (
            <div key={group.name} className="rounded-xl border border-base-border bg-base-panel/85 p-6">
              <p className="mono-label text-[9px] text-signal">{group.name}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.features.map((feature) => (
                  <span key={feature} className="rounded-full border border-base-border bg-base/60 px-3 py-1.5 font-mono text-[10px] text-ink-muted">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-6 text-ink-faint">
          Frozen configuration: Elastic Net α=0.0001, l1_ratio=0.5, cyclic selection, training-median imputation, and training-only StandardScaler.
        </p>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="05"
          eyebrow="Model complexity challenge"
          title="Complexity was tested—not assumed to be better"
          description="Elastic Net, XGBoost regression, pairwise learning-to-rank, a shallow MLP, and an ensemble were compared only in pre-confirmation development. The regularized linear model generalized best there."
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-xl border border-base-border bg-base-panel/85 p-6">
            <p className="mono-label text-[9px] text-signal">Development mean IC</p>
            <dl className="mt-4 divide-y divide-base-border">
              {etfResearch.complexity.map((model) => (
                <div key={model.name} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs leading-5 text-ink-muted">{model.name}</dt>
                  <dd className="font-mono text-sm text-ink">{model.ic.toFixed(3)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-base-border pt-4 text-xs leading-5 text-ink-faint">
              This does not imply nonlinear ML never works in markets; it reports the outcome of this frozen development comparison.
            </p>
          </div>
          <ResearchFigure
            src={etfResearch.figures.complexity}
            alt="Pre-confirmation comparison of Elastic Net, XGBoost, pairwise ranking, MLP, and ensemble models"
            caption="None of the nonlinear candidates passed the predeclared complexity-advancement gate."
          />
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="06"
          eyebrow="Sealed confirmation"
          title="The centerpiece: one frozen model, one untouched period"
          description="The candidate and inference plan were fixed before the 2024–2026 outcomes were read. The model then produced positive mean IC in every confirmation subperiod."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Development IC", confirmation.development_mean_spearman_ic.toFixed(3)],
            ["Confirmation IC", confirmation.confirmation_mean_spearman_ic.toFixed(3)],
            ["HAC one-sided p", confirmation.hac_one_sided_p.toFixed(3)],
            ["Positive weeks", formatPercent(confirmation.positive_week_fraction)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-base-border bg-base-panel/85 p-5">
              <p className="mono-label text-[8px] text-ink-faint">{label}</p>
              <p className="mt-2 font-mono text-2xl text-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ResearchFigure
            src={etfResearch.figures.confirmation}
            alt="Development and sealed confirmation mean information coefficients"
            caption={`Development mean IC ${confirmation.development_mean_spearman_ic.toFixed(3)}; sealed confirmation mean IC ${confirmation.confirmation_mean_spearman_ic.toFixed(3)}.`}
          />
          <ResearchFigure
            src={etfResearch.figures.weeklyIc}
            alt="Weekly information coefficient during the sealed confirmation period"
            caption="133 weekly confirmation decisions and 13,254 ETF/date predictions; dependence-aware inference is reported alongside the series."
          />
        </div>
        <div className="mt-6 rounded-lg border border-amber/30 bg-amber/5 p-5 text-sm leading-7 text-ink-muted">
          The multivariate model significantly predicted future ETF return ranks. Its IC advantage over the frozen momentum baseline was positive (+{phase7Summary.momentum_comparison.cstar_minus_momentum_ic.toFixed(3)}) but not statistically established (paired one-sided p={phase7Summary.momentum_comparison.paired_hac_one_sided_p.toFixed(3)}).
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="07"
          eyebrow="Interpretability"
          title="Stable predictive associations, not causal stories"
          description="Coefficient-stability analysis showed recurring contributions from moving-average geometry, long-horizon volatility, momentum, and drawdown. Signs and magnitudes describe the fitted score, not economic causality."
        />
        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <ResearchFigure
            src={etfResearch.figures.coefficients}
            alt="Coefficient stability for the frozen 18-feature Elastic Net"
            caption="Fold-level standardized coefficients reveal which associations persisted across chronological training windows."
          />
          <div className="rounded-xl border border-base-border bg-base-panel/85 p-6">
            <p className="mono-label text-[9px] text-signal">Current score anatomy</p>
            <p className="mt-3 text-xs leading-5 text-ink-muted">
              For the latest top-ranked ETF ({latestSignal.top_model_ranked[0].ticker}), the largest positive standardized contribution was {formatFeature(latestSignal.top_model_ranked[0].major_positive_contributors[0].feature)}; the largest negative contribution was {formatFeature(latestSignal.top_model_ranked[0].major_negative_contributors[0].feature)}.
            </p>
            <p className="mt-5 border-t border-base-border pt-5 text-xs leading-5 text-ink-faint">
              These are mechanical score contributions from an immutable paper run. They are not feature importance in a causal sense and are not trading recommendations.
            </p>
          </div>
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="08"
          eyebrow="Economic evaluation · secondary"
          title="Positive historical behavior, with benchmark trade-offs"
          description="The portfolio simulation uses weekly decisions and 10 bps transaction costs. This section is deliberately secondary to the statistical finding."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {etfResearch.economicResults.map((result) => (
            <div key={result.name} className="rounded-xl border border-base-border bg-base-panel/85 p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{result.name}</h3>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-base-border pt-5">
                <div><dt className="mono-label text-[7px] text-ink-faint">CAGR</dt><dd className="mt-2 font-mono text-sm text-ink">{formatPercent(result.cagr)}</dd></div>
                <div><dt className="mono-label text-[7px] text-ink-faint">Sharpe</dt><dd className="mt-2 font-mono text-sm text-ink">{result.sharpe.toFixed(3)}</dd></div>
                <div><dt className="mono-label text-[7px] text-ink-faint">Max DD</dt><dd className="mt-2 font-mono text-sm text-ink">{formatPercent(result.drawdown)}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <ResearchFigure
            src={etfResearch.figures.economics}
            alt="Historical economic comparison of the frozen ML portfolio, momentum, and equal weight"
            caption="The ML portfolio did not dominate momentum on CAGR or equal weight on Sharpe. Historical returns are not proof of alpha."
          />
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="09"
          eyebrow="Forward paper test snapshot"
          title="A prediction recorded before its outcome exists"
          description="The first genuine prospective run was created at the latest mechanically valid date and then rerun to verify the same immutable record rather than create a duplicate."
        />
        <div className="mt-8 overflow-hidden rounded-xl border border-signal/35 bg-signal/5">
          <div className="flex flex-col gap-3 border-b border-signal/20 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mono-label text-[10px] text-signal">Archived paper snapshot</p>
              <p className="mono-label mt-2 text-[9px] text-ink-muted">Status recorded at publication</p>
            </div>
            <span className="mono-label w-fit rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 text-[9px] text-amber">
              {latestSignal.status}
            </span>
          </div>
          <dl className="grid gap-px bg-base-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["As-of date", latestSignal.as_of_date],
              ["Target maturity", maturity],
              ["Universe", `${latestSignal.eligible_universe_size} ETFs`],
              ["Horizon", `${latestSignal.target_horizon_spy_sessions} SPY sessions`],
            ].map(([label, value]) => (
              <div key={label} className="bg-base-panel px-5 py-4">
                <dt className="mono-label text-[8px] text-ink-faint">{label}</dt>
                <dd className="mt-2 font-mono text-xs leading-5 text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <PaperSignalExplorer snapshot={latestSignal} />
          <div className="border-t border-base-border bg-base-panel p-5 text-xs leading-5 text-ink-faint">
            Run {latestSignal.run_id}. Paper model signal for research only; not investment advice. No immature outcome has been evaluated.
          </div>
        </div>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="10"
          eyebrow="Methodology & leakage controls"
          title="Information boundaries are part of the model"
          description="The research contract governs what can enter each fit, when labels become available, and when a result can be called confirmation rather than development."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {etfResearch.leakageControls.map((control) => (
            <li key={control} className="flex min-h-[96px] gap-3 rounded-lg border border-base-border bg-base-panel/85 p-4">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/10 font-mono text-[10px] text-signal">✓</span>
              <span className="text-xs leading-5 text-ink-muted">{control}</span>
            </li>
          ))}
        </ul>
      </CaseSection>

      <CaseSection>
        <SectionHeader
          index="11"
          eyebrow="Limitations"
          title="What this result does—and does not—establish"
          description="The finding is statistically confirmed within the frozen design. It is not independent replication, guaranteed profitability, or proof that the model beats momentum."
        />
        <ul className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {etfResearch.limitations.map((limitation) => (
            <li key={limitation} className="rounded-lg border border-amber/25 bg-amber/5 p-5 text-sm leading-6 text-ink-muted">
              <span className="mr-2 text-amber">—</span>{limitation}
            </li>
          ))}
          <li className="rounded-lg border border-amber/25 bg-amber/5 p-5 text-sm leading-6 text-ink-muted"><span className="mr-2 text-amber">—</span>Weekly 21-session targets overlap, so inference must account for serial dependence.</li>
          <li className="rounded-lg border border-amber/25 bg-amber/5 p-5 text-sm leading-6 text-ink-muted"><span className="mr-2 text-amber">—</span>Genuine forward evidence has only begun accumulating; the first outcome remains pending.</li>
        </ul>
      </CaseSection>

      <section className="py-12 sm:py-16">
        <div className="site-shell">
          <SectionHeader
            index="12"
            eyebrow="Links & reproducibility"
            title="Inspect the code, frozen evidence, and current paper record"
            description="The public repository contains source, protocols, tests, compact result exports, and publication figures. Local market stores and append-only forward artifacts are intentionally excluded."
          />
          <div className="mt-8 flex flex-wrap gap-3 rounded-xl border border-base-border bg-base-panel/85 p-6 sm:p-8">
            <ResearchLink href={etfResearch.githubUrl} primary>GitHub research repository</ResearchLink>
            <ResearchLink href={etfResearch.releaseUrl}>Phase 7 scientific tag</ResearchLink>
            <ResearchLink href={etfResearch.summaryUrl}>Research summary JSON</ResearchLink>
            <ResearchLink href={etfResearch.signalUrl}>Current paper-signal JSON</ResearchLink>
            <ResearchLink href="/resume.pdf">Resume</ResearchLink>
          </div>
          <p className="mono-label mt-5 text-[9px] text-ink-faint">{etfResearch.version}</p>
        </div>
      </section>
    </article>
  );
}
