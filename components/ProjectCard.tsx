import Image from "next/image";
import Link from "next/link";
import { ProjectSummary } from "@/lib/types";
import TechPill from "@/components/TechPill";

export default function ProjectCard({ project }: { project: ProjectSummary }) {
  if (!project.cardImage) return null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`Explore ${project.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-base-border bg-base-panel transition-all hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(77,216,196,0.15),0_20px_40px_-24px_rgba(77,216,196,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-base"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-base-border bg-base">
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

        {project.headlineStats && (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-base-border bg-base-border">
            {project.headlineStats.map((stat) => (
              <div key={stat.label} className="bg-base px-3 py-2.5">
                <dt className="mono-label text-[8px] leading-4 text-ink-faint">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

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
