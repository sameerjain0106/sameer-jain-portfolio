import Image from "next/image";
import Link from "next/link";
import { ProjectSummary } from "@/lib/types";
import TechPill from "@/components/TechPill";
import EtfResearchCardVisual from "@/components/EtfResearchCardVisual";

export default function ProjectCard({
  project,
  wide = false,
}: {
  project: ProjectSummary;
  wide?: boolean;
}) {
  if (project.cardVariant === "etf-research") {
    return (
      <article
        className={`group overflow-hidden rounded-xl border border-base-border bg-base-panel transition-all hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(77,216,196,0.15),0_24px_60px_-34px_rgba(77,216,196,0.32)] ${
          project.prominent ? "md:col-span-2" : ""
        } ${wide ? "lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]" : "flex flex-col"}`}
      >
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`View ${project.title} case study`}
          className={`block overflow-hidden border-base-border ${
            wide ? "border-b lg:border-b-0 lg:border-r" : "border-b"
          }`}
        >
          <EtfResearchCardVisual />
        </Link>

        <div className="flex flex-col p-6 sm:p-7 lg:p-8">
          <div className="flex flex-wrap gap-2">
            {project.category.map((category) => (
              <TechPill key={category}>{category}</TechPill>
            ))}
          </div>

          <div className="mt-5">
            <p className="mono-label text-[9px] text-signal">Flagship research project</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-signal sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
              {project.oneLiner}
            </p>
          </div>

          {project.headlineStats && (
            <dl className="mt-6 grid grid-cols-2 border-y border-base-border sm:grid-cols-4">
              {project.headlineStats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-base-border px-3 py-3 first:pl-0 sm:border-r sm:last:border-r-0"
                >
                  <dt className="mono-label text-[8px] leading-4 text-ink-faint">{stat.label}</dt>
                  <dd className="mt-1 font-mono text-lg text-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <TechPill key={tech} variant="accent">
                {tech}
              </TechPill>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            <Link
              href={`/projects/${project.slug}`}
              className="rounded-md bg-signal px-4 py-2.5 text-sm font-medium text-base transition-colors hover:bg-signal-glow"
            >
              View Research / Case Study
            </Link>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-base-border px-4 py-2.5 text-sm text-ink-muted transition-colors hover:border-signal/50 hover:text-signal"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (!project.cardImage) return null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative overflow-hidden rounded-lg border border-base-border bg-base-panel transition-all hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(77,216,196,0.15),0_20px_40px_-24px_rgba(77,216,196,0.25)] ${wide ? "lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : "flex flex-col"}`}
    >
      <div className={`relative w-full overflow-hidden bg-base ${wide ? "aspect-[16/10] border-b border-base-border lg:aspect-auto lg:min-h-[390px] lg:border-b-0 lg:border-r" : "aspect-[16/10] border-b border-base-border"}`}>
        <Image
          src={project.cardImage.src}
          alt={project.cardImage.alt}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-panel via-transparent to-transparent opacity-60" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-2">
          {project.category.map((c) => (
            <TechPill key={c}>{c}</TechPill>
          ))}
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold text-ink group-hover:text-signal transition-colors">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {project.oneLiner}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <TechPill key={tech} variant="accent">
              {tech}
            </TechPill>
          ))}
          {project.technologies.length > 4 && (
            <TechPill>+{project.technologies.length - 4} more</TechPill>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-signal">
          Explore Project
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
