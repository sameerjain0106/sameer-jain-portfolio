import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { detailedProjects } from "@/data/projects";
import TechPill from "@/components/TechPill";
import ApproachTabs from "@/components/ApproachTabs";

export function generateStaticParams() {
  return detailedProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = detailedProjects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: `${project.title} | Sameer Jain`,
    description: project.oneLiner,
    openGraph: {
      title: `${project.title} | Sameer Jain`,
      description: project.oneLiner,
      type: "article",
      images: [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Sameer Jain`,
      description: project.oneLiner,
      images: [],
    },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = detailedProjects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <article>
      {/* Header */}
      <header className="border-b border-base-border bg-grid">
        <div
          className="relative"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(10,12,16,0.5) 0%, #0A0C10 78%)",
          }}
        >
          <div className="mx-auto max-w-4xl px-6 pb-12 pt-12 md:px-10 md:pt-16">
            <Link
              href="/#work"
              className="mono-label text-xs text-ink-muted hover:text-signal transition-colors"
            >
              ← Back to work
            </Link>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.category.map((c) => (
                <TechPill key={c}>{c}</TechPill>
              ))}
            </div>

            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {project.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
              {project.oneLiner}
            </p>

            {project.collaborators && project.collaborators.length > 0 && (
              <p className="mt-4 text-xs text-ink-faint">
                With {project.collaborators.join(", ")}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <TechPill key={tech} variant="accent">
                  {tech}
                </TechPill>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-base-border px-4 py-2 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-signal"
                >
                  View on GitHub
                </a>
              ) : (
                <span className="mono-label rounded-md border border-base-border px-4 py-2 text-xs text-ink-faint">
                  GitHub link coming soon
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Problem + Data */}
      <section className="border-b border-base-border py-12">
        <div className="mx-auto grid max-w-4xl gap-10 px-6 sm:grid-cols-2 md:px-10">
          <div>
            <h2 className="mono-label text-xs text-signal">Problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {project.problem}
            </p>
          </div>
          <div>
            <h2 className="mono-label text-xs text-signal">Data</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {project.data.description}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-ink-faint">Classes</dt>
                <dd className="mt-1 font-mono text-ink">
                  {project.data.classes.length}
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint">Images / class</dt>
                <dd className="mt-1 font-mono text-ink">
                  {project.data.imagesPerClass.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint">Total images</dt>
                <dd className="mt-1 font-mono text-ink">
                  {project.data.totalImages.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint">Image size</dt>
                <dd className="mt-1 font-mono text-ink">
                  {project.data.imageSize}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Methodology / Results / Visualizations, per approach */}
      <section className="border-b border-base-border py-12">
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <h2 className="mono-label text-xs text-signal">
            Methodology &amp; Results
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            This project was approached three different ways. Switch between
            them below.
          </p>
          <div className="mt-8">
            <ApproachTabs approaches={project.approaches} />
          </div>
        </div>
      </section>

      {/* Limitations / Future work */}
      {(project.limitations.length > 0 || project.futureWork.length > 0) && (
        <section className="py-12">
          <div className="mx-auto grid max-w-4xl gap-10 px-6 sm:grid-cols-2 md:px-10">
            {project.limitations.length > 0 && (
              <div>
                <h2 className="mono-label text-xs text-signal">Limitations</h2>
                <ul className="mt-3 space-y-2">
                  {project.limitations.map((l, i) => (
                    <li key={i} className="text-sm leading-relaxed text-ink-muted">
                      · {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.futureWork.length > 0 && (
              <div>
                <h2 className="mono-label text-xs text-signal">Future Work</h2>
                <ul className="mt-3 space-y-2">
                  {project.futureWork.map((f, i) => (
                    <li key={i} className="text-sm leading-relaxed text-ink-muted">
                      · {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
