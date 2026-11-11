"use client";

import { useState } from "react";
import type { ProjectCategory, ProjectSummary } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import styles from "./ProjectExplorer.module.css";

const ALL = "All" as const;
type Filter = typeof ALL | ProjectCategory;

export default function ProjectExplorer({ projects }: { projects: ProjectSummary[] }) {
  const [active, setActive] = useState<Filter>(ALL);
  const categories: Filter[] = [ALL, ...new Set(projects.flatMap((project) => project.category))];
  const entries = projects.map((project, index) => ({ project, number: index + 1 }));
  const filtered = entries.filter(({ project }) => active === ALL || project.category.includes(active));
  const count = filtered.length;
  const hasFilters = projects.length > 1 && categories.length > 1;

  return (
    <div className={`${styles.archive} ${projects.length === 1 ? styles.single : ""}`}>
      <div className={`${styles.controls} ${hasFilters ? "" : styles.compactControls}`}>
        {hasFilters && (
          <div className={styles.filters} role="group" aria-label="Filter projects by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={active === category}
                onClick={() => setActive(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        <p className={styles.count} role="status">
          {active === ALL ? count : `${count} of ${entries.length}`}{" "}
          {count === 1 && active === ALL ? "case study" : "case studies"}
        </p>
      </div>

      {count > 0 ? (
        <ol className={styles.entries} role="list">
          {filtered.map(({ project, number }) => (
            <li key={project.slug}>
              <ProjectCard project={project} number={number} />
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No case studies in this category.</p>
      )}
    </div>
  );
}
