"use client";

import styles from "./StoryChapters.module.css";

type Chapter = { label: string; selector: string; scene?: number };

export const mriChapters: Chapter[] = [
  { label: "Question", selector: '[data-world-beat="0"]', scene: 0 },
  { label: "Data", selector: '[data-world-beat="1"]', scene: 1 },
  { label: "Clusters", selector: '[data-world-beat="2"]', scene: 2 },
  { label: "Baseline", selector: '[data-world-beat="3"]', scene: 3 },
  { label: "Limits", selector: '[data-world-beat="4"]', scene: 4 },
  { label: "Pipeline", selector: "[data-mri-pipeline]" },
  { label: "Methods", selector: '[data-project-methods="mri"]' },
];

export const etfChapters: Chapter[] = [
  { label: "Inputs", selector: '[data-journey-scene="0"]', scene: 0 },
  { label: "Development", selector: '[data-journey-scene="1"]', scene: 1 },
  { label: "Model", selector: '[data-journey-scene="2"]', scene: 2 },
  { label: "Evidence", selector: '[data-journey-scene="3"]', scene: 3 },
  { label: "Comparison", selector: '[data-journey-scene="4"]', scene: 4 },
  { label: "Methods", selector: '[data-project-methods="etf"]' },
];

export function jumpToChapter(scroller: HTMLElement | null | undefined, selector: string) {
  const target = (scroller ?? document).querySelector<HTMLElement>(selector);
  if (!target) return;
  const top = target.getBoundingClientRect().top + (scroller?.scrollTop ?? window.scrollY) - (scroller?.getBoundingClientRect().top ?? 0);
  if (scroller) {
    scroller.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    // Rebase wheel easing after the native jump so old inertia cannot pull it back.
    scroller.dispatchEvent(new Event("spatial:jump"));
  } else window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  const destination = target.querySelector<HTMLElement>("h1, h2, h3") ?? target;
  destination.setAttribute("tabindex", "-1");
  destination.focus({ preventScroll: true });
}

export default function StoryChapters({ chapters, scroller, current, label }: {
  chapters: Chapter[]; scroller?: HTMLElement | null; current: number;
  label: string;
}) {
  return <nav className={styles.chapters} aria-label={`${label} chapters`} data-story-chapters>
    {chapters.map(chapter => <button key={chapter.label} type="button" aria-current={chapter.scene === current ? "step" : undefined}
      onClick={() => jumpToChapter(scroller, chapter.selector)}>{chapter.label}</button>)}
  </nav>;
}
