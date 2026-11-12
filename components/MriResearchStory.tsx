"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { mriChapters } from "@/data/mriStory";
import styles from "./MriResearchStory.module.css";

const imageRoot = "/projects/brain-tumor-mri/images/";

export default function MriResearchStory({ motion = true, preview = false, showHeading = true }: { motion?: boolean; preview?: boolean; showHeading?: boolean }) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const evidenceRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const pointerFrame = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 700px)");
    let frame: number | null = null;
    let disposed = false;
    function update() {
      frame = null;
      const nodes = chapterRefs.current.filter((node): node is HTMLElement => node !== null);
      if (nodes.length !== mriChapters.length) return;
      const centers = nodes.map((node) => { const box = node.getBoundingClientRect(); return box.top + box.height / 2; });
      const target = window.innerHeight * .5;
      let progress = 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (target >= centers[i + 1]) progress = i + 1;
        else if (target > centers[i]) { progress = i + (target - centers[i]) / Math.max(1, centers[i + 1] - centers[i]); break; }
      }
      const next = Math.round(progress);
      if (activeRef.current !== next) { activeRef.current = next; setActive(next); }
      const smooth = motion && !reduced.matches && !phone.matches;
      const base = Math.floor(progress);
      const transition = Math.max(0, Math.min(1, (progress - base - .36) / .28));
      const visibleProgress = smooth ? base + transition : next;
      const stage = evidenceRef.current;
      if (stage) {
        stage.style.setProperty("--story-progress", `${progress / (mriChapters.length - 1)}`);
        mriChapters.forEach((_, i) => {
          stage.style.setProperty(`--chapter-${i}-opacity`, `${Math.max(0, 1 - Math.abs(i - visibleProgress))}`);
          stage.style.setProperty(`--chapter-${i}-travel`, `${smooth ? (i - visibleProgress) * 14 : 0}px`);
        });
      }
    }
    function schedule() { if (!disposed && frame === null) frame = requestAnimationFrame(update); }
    schedule();
    void document.fonts.ready.then(schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    phone.addEventListener("change", schedule);
    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      phone.removeEventListener("change", schedule);
    };
  }, [motion]);

  useEffect(() => () => { if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current); }, []);

  function selectChapter(index: number, pointerInitiated: boolean) {
    const animated = pointerInitiated && motion && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chapterRefs.current[index]?.scrollIntoView({ block: "center", behavior: animated ? "smooth" : "instant" });
  }
  function resetPointer() {
    if (pointerFrame.current !== null) { cancelAnimationFrame(pointerFrame.current); pointerFrame.current = null; }
    surfaceRef.current?.style.setProperty("--pointer-x", "0px");
    surfaceRef.current?.style.setProperty("--pointer-y", "0px");
  }
  const selected = mriChapters[active];

  return <section className={styles.walkthrough} data-preview={preview} data-motion={motion ? "on" : "off"} aria-label="Brain tumor MRI research walkthrough">
    {showHeading && <div className={styles.heading}><span>Data science / An MRI case study</span><h2>Three questions.<br />One MRI collection.</h2><p>Follow the images, the learned groups, and the result that needed a second look. Scroll to explore.</p></div>}
    <div className={styles.storyGrid}>
      <div className={styles.chapters}>{mriChapters.map((chapter, index) => <article key={chapter.short} data-chapter={index} data-active={index === active} ref={(element) => { chapterRefs.current[index] = element; }}>
        <span className={styles.chapterNumber}>{String(index + 1).padStart(2, "0")} / {chapter.short}</span><h3>{chapter.title}</h3><p>{chapter.body}</p><strong>{chapter.finding}</strong><p className={styles.chapterNote}>{chapter.note}</p>
        <figure className={styles.mobileEvidence}><div className={`${styles.mobileFigure} ${index === 0 ? styles.scanFigure : ""}`}><div className={index === 0 ? styles.scanWindow : styles.imageWindow}><Image src={imageRoot + chapter.figure} alt={chapter.caption} width={index === 0 ? 2250 : 960} height={index === 0 ? 480 : 720} sizes={index === 0 ? "500vw" : "90vw"} /></div></div><figcaption>{chapter.caption}</figcaption><a href={imageRoot + chapter.figure} target="_blank" rel="noopener noreferrer">Open original figure ↗</a></figure>
      </article>)}</div>
      <div className={styles.evidence} ref={evidenceRef} data-active={active}>
        <div className={styles.evidenceHeader}><span>Recorded project evidence</span><span>{String(active + 1).padStart(2, "0")} / 03</span></div>
        <div className={styles.progressTrack} aria-hidden="true"><span /></div>
        <div className={styles.chapterControls} role="group" aria-label="Choose story chapter">{mriChapters.map((chapter, index) => <button key={chapter.short} type="button" aria-pressed={active === index} onClick={(event) => selectChapter(index, event.detail > 0)}>{chapter.short}</button>)}</div>
        <div className={styles.surface} ref={surfaceRef} onPointerLeave={resetPointer} onPointerMove={(event) => {
          if (!motion || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - .5;
          const y = (event.clientY - bounds.top) / bounds.height - .5;
          if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
          pointerFrame.current = requestAnimationFrame(() => {
            pointerFrame.current = null;
            surfaceRef.current?.style.setProperty("--pointer-x", `${x * 10}px`);
            surfaceRef.current?.style.setProperty("--pointer-y", `${y * 8}px`);
          });
        }}>
          {mriChapters.map((chapter, index) => <div key={chapter.figure} className={`${styles.evidenceLayer} ${index === 0 ? styles.scanFigure : ""}`} aria-hidden={index !== active} style={{ opacity: `var(--chapter-${index}-opacity, ${index === 0 ? 1 : 0})`, transform: `translateY(var(--chapter-${index}-travel, 0px))` }}><div className={index === 0 ? styles.scanWindow : styles.imageWindow}><Image src={imageRoot + chapter.figure} alt={chapter.caption} width={index === 0 ? 2250 : 960} height={index === 0 ? 480 : 720} sizes={index === 0 ? "(min-width: 900px) 300vw, 500vw" : "(min-width: 900px) 50vw, 90vw"} loading="eager" /></div></div>)}
        </div>
        <p className={styles.caption} aria-live="polite">{selected.caption}</p>
        <a className={styles.source} href={imageRoot + selected.figure} target="_blank" rel="noopener noreferrer">Open the recorded figure ↗</a>
        <p className={styles.scrollHint}>Keep scrolling. The evidence follows the story.</p>
      </div>
    </div>
    <div className={styles.storyEnd}><span>Explore the complete methods, code, and evaluation limits.</span><Link href="/projects/brain-tumor-mri-classification">Read the complete case study ↗</Link></div>
  </section>;
}
