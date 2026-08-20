import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import TechPill from "@/components/TechPill";

export default function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
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
