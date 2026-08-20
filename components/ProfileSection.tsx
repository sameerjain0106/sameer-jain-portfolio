import { site } from "@/data/site";

export default function ProfileSection() {
  return (
    <section id="profile" className="border-t border-base-border py-10 lg:py-12">
      <div className="site-shell">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mono-label text-xs text-signal">Profile</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Technical depth, academic foundation.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted md:text-right">
            A compact view of the tools I use, the coursework behind them, and the areas I am building toward.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-xl border border-base-border bg-base-panel/70 lg:grid-cols-2 lg:divide-x lg:divide-base-border">
          <article id="about" className="p-6 sm:p-7 lg:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-base-border pb-4">
              <div>
                <p className="mono-label text-[10px] text-signal">Technical profile</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">Stack &amp; focus areas</h3>
              </div>
              <span className="font-mono text-[10px] text-ink-faint">01 / 02</span>
            </div>

            <div className="mt-2 divide-y divide-base-border">
              {site.skillGroups.map((group) => (
                <div key={group.label} className="grid gap-2 py-4 sm:grid-cols-[145px_1fr] sm:gap-5">
                  <p className="mono-label text-[9px] text-ink-faint">{group.label}</p>
                  <p className="text-sm leading-6 text-ink-muted">{group.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </article>

          <article id="education" className="border-t border-base-border p-6 sm:p-7 lg:border-t-0 lg:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-base-border pb-4">
              <div>
                <p className="mono-label text-[10px] text-signal">Academic background</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">Georgia Tech</h3>
              </div>
              <span className="font-mono text-[10px] text-ink-faint">02 / 02</span>
            </div>

            <div className="mt-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{site.education[0].degree}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{site.education[0].concentration}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-mono text-sm text-signal">GPA {site.education[0].gpa}</p>
                  <p className="mono-label mt-1 text-[9px] text-ink-faint">Expected {site.education[0].period}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-y border-base-border py-4">
                <div>
                  <p className="mono-label text-[8px] text-ink-faint">Recognition</p>
                  <p className="mt-1.5 text-sm text-ink-muted">{site.education[0].honors}</p>
                </div>
                <div>
                  <p className="mono-label text-[8px] text-ink-faint">Program</p>
                  <p className="mt-1.5 text-sm text-ink-muted">Industrial Engineering</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mono-label text-[9px] text-ink-faint">Relevant coursework</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {site.education[0].coursework.map((course) => (
                    <span key={course} className="rounded-full border border-base-border bg-base/65 px-3 py-1.5 text-[11px] text-ink-muted">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-ink-faint">
                Current study includes Decision &amp; Data Analytics and Constraint Programming.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
