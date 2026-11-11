"use client";

import Image from "next/image";
import Link from "next/link";
import type { PointerEvent } from "react";
import type { ProjectSummary } from "@/lib/types";
import styles from "./ProjectExplorer.module.css";

function moveEvidence(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const plate = event.currentTarget;
  const bounds = plate.getBoundingClientRect();
  const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
  const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
  plate.style.setProperty("--plate-x", `${x * 8}px`);
  plate.style.setProperty("--plate-y", `${y * 6}px`);
  plate.style.setProperty("--plate-tilt", `${x * 1.4}deg`);
}

function resetEvidence(event: PointerEvent<HTMLAnchorElement>) {
  event.currentTarget.style.removeProperty("--plate-x");
  event.currentTarget.style.removeProperty("--plate-y");
  event.currentTarget.style.removeProperty("--plate-tilt");
}

export default function ProjectCard({ project, number = 1 }: { project: ProjectSummary; number?: number }) {
  const isEtf = project.slug === "systematic-etf-research";
  const isMri = project.slug === "brain-tumor-mri-classification";
  const stats = project.headlineStats?.slice(0, 3) ?? (isMri ? [
    { value: "3", label: "Research approaches" },
    { value: "6,056", label: "Available MRI images" },
    { value: "603", label: "Grouped clustering scans" },
  ] : []);
  const image = isMri ? {
    src: "/projects/brain-tumor-mri/images/cluster_0_samples.png",
    alt: "Sample MRI scans from cluster 0, aligned to the meningioma class",
    caption: "ResNet50 features → K-Means → 603 grouped scans",
  } : project.cardImage;
  const titleId = `case-${project.slug}`;
  const href = `/projects/${project.slug}`;
  const titleLines = isEtf ? ["Systematic ETF", "Research Engine"] : isMri ? ["Brain Tumor MRI", "Classification"] : [project.title];

  return (
    <article className={`${styles.entry} ${isMri ? styles.mri : ""}`} aria-labelledby={titleId}>
      <div className={styles.entryTop} data-reveal>
        <span className={styles.caseNumber}>Research file {String(number).padStart(2, "0")}</span>
        <span>{project.category.join(" / ")}</span>
      </div>
      <h3 id={titleId} className={styles.title} data-reveal>
        <Link href={href}>
          <span>{titleLines.map((line, index) => <span className={styles.titleLine} key={line}>{index > 0 ? " " : ""}{line}</span>)}</span>
          <span className={styles.titleArrow} aria-hidden="true">↗</span>
        </Link>
      </h3>

      <div className={styles.entryBody}>
        <div className={styles.copy} data-reveal>
          <p className={styles.question}>{isEtf ? "Does the signal survive?" : isMri ? "What does a model see?" : "Inside the research"}</p>
          <p className={styles.description}>{project.oneLiner}</p>
          <div className={styles.actions}>
            <Link className={styles.openCase} href={href} aria-label={`Open ${project.title} case study`}>
              Follow the research <span aria-hidden="true">↗</span>
            </Link>
            {project.githubUrl && <a className={styles.sourceLink} href={project.githubUrl} target="_blank" rel="noopener noreferrer">Source code ↗</a>}
          </div>
        </div>

        {image && (
          <figure className={styles.evidence} data-reveal>
            <Link
              href={href}
              className={`${styles.imageLink} ${isMri ? styles.scanSheet : ""}`}
              aria-label={`Read ${project.title}`}
              onPointerMove={moveEvidence}
              onPointerLeave={resetEvidence}
            >
              <span className={styles.plateLabel}><span>Selected evidence</span><span>{String(number).padStart(2, "0")} ↗</span></span>
              <div className={styles.imageFrame}>
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1100px) 53vw, (min-width: 800px) 55vw, 90vw" />
              </div>
              <span className={styles.imageHint} aria-hidden="true">Take a closer look ↗</span>
            </Link>
            <figcaption>{image.caption}</figcaption>
          </figure>
        )}

        <div className={styles.resultNote} data-reveal>
          <dl className={styles.stats}>
            {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
          </dl>
          <p className={styles.caveat}>
            {isEtf ? "Confirmed against zero. Advantage over the momentum baseline remains unconfirmed."
              : isMri ? "Three methods, different tasks. Results include the weaker anomaly detector and evaluation limitations."
              : project.technologies.join(" · ")}
          </p>
        </div>
      </div>

      {(isEtf || isMri) && (
        <details className={styles.evidenceDrawer}>
          <summary>
            <span>{isEtf ? "Unfold the annual evidence" : "Unfold the classification result"}</span>
            <span className={styles.drawerSymbol} aria-hidden="true">+</span>
          </summary>
          <div className={styles.drawerContent}>
            <p>{isEtf
              ? "The year-by-year view separates model development from sealed confirmation. 2026 is partial, and a positive IC is not a profitability guarantee."
              : "The supervised Random Forest reached 72.72% test accuracy. The notebook fit PCA before splitting and selected model settings using test results, so this is an exploratory result with evaluation limitations."}</p>
            <div className={styles.drawerFigure}>
              <Image
                src={isEtf ? "/projects/systematic-etf-research/figures/research-timeline.png" : "/projects/brain-tumor-mri/images/rf_confusion_matrix.png"}
                alt={isEtf ? "Annual mean information coefficient, with 2019–2023 development and 2024–2026 sealed confirmation shown separately" : "Random Forest confusion matrix with glioma, meningioma, and tumor class labels"}
                width={isEtf ? 1648 : 547}
                height={isEtf ? 970 : 432}
                sizes="(min-width: 800px) 55vw, 90vw"
              />
            </div>
          </div>
        </details>
      )}
    </article>
  );
}
