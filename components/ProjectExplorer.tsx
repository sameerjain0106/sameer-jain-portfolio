"use client";

import { useMemo, useState } from "react";
import { ProjectCategory, ProjectSummary } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";

const ALL = "All" as const;

export default function ProjectExplorer({ projects }: { projects: ProjectSummary[] }) {
  const categories = useMemo(() => {
    const set = new Set<ProjectCategory>();
    projects.forEach((p) => p.category.forEach((c) => set.add(c)));
    return [ALL, ...Array.from(set)];
  }, [projects]);

  const [active, setActive] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (active === ALL) return projects;
    return projects.filter((p) => p.category.includes(active as ProjectCategory));
  }, [projects, active]);

  const prominent = filtered.filter((project) => project.prominent);
  const standard = filtered.filter((project) => !project.prominent);

  return (
    <div>
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                active === c
                  ? "mono-label rounded-full border border-signal bg-signal/10 px-3 py-1.5 text-[11px] text-signal transition-colors"
                  : "mono-label rounded-full border border-base-border px-3 py-1.5 text-[11px] text-ink-muted transition-colors hover:border-signal/40 hover:text-signal"
              }
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No projects in this category yet.
        </p>
      ) : (
        <div className="space-y-6">
          {prominent.map((project) => (
            <ProjectCard key={project.slug} project={project} wide />
          ))}

          {standard.length > 0 && (
            <div
              className={
                standard.length === 1
                  ? "grid grid-cols-1 gap-6"
                  : "grid grid-cols-1 gap-6 md:grid-cols-2"
              }
            >
              {standard.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  wide={standard.length === 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
