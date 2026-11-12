"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { roomHref, type RoomId } from "@/data/spatialRooms";
import { phase7Summary } from "@/data/etfResearch";
import KineticSculpture from "./KineticSculpture";
import styles from "./SpatialEntrance.module.css";

export default function SpatialEntrance({ active, scrollRoot, navigate }: {
  active: boolean; scrollRoot: HTMLElement | null; navigate: (id: RoomId) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = root.current;
    const stage = hero.current;
    if (!active || !element || !stage || !scrollRoot) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0, disposed = false;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let pointerX = 0, pointerY = 0, pendingPointer = false;
    let bounds: DOMRect | null = null, boundsDirty = true, heightDirty = true, viewportHeight = 1;
    const painted = new Map<string, string>();
    const write = (name: string, value: string) => {
      if (painted.get(name) === value) return;
      // These variables only affect the hero; do not invalidate the lower room.
      stage.style.setProperty(name, value);
      painted.set(name, value);
    };
    const render = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      // Read geometry once per frame, before any writes, and only when dirty.
      if (heightDirty) { viewportHeight = Math.max(1, scrollRoot.clientHeight); heightDirty = false; }
      if (pendingPointer) {
        if (boundsDirty || !bounds) { bounds = stage.getBoundingClientRect(); boundsDirty = false; }
        targetX = (pointerX - bounds.left - bounds.width / 2) / bounds.width * 30;
        targetY = (pointerY - bounds.top - bounds.height / 2) / bounds.height * 24;
        pendingPointer = false;
      }
      const progress = Math.min(1, scrollRoot.scrollTop / viewportHeight);
      x += (targetX - x) * .095; y += (targetY - y) * .095;
      write("--look-x", `${x.toFixed(2)}px`);
      write("--look-y", `${y.toFixed(2)}px`);
      write("--look-turn", `${(x * .15).toFixed(2)}deg`);
      write("--drift", `${motion.matches ? 0 : progress * 65}px`);
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .03) frame = requestAnimationFrame(render);
    };
    const schedule = () => { if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      if (motion.matches || !fine.matches || event.pointerType !== "mouse" || document.hidden) return;
      pointerX = event.clientX; pointerY = event.clientY; pendingPointer = true;
      schedule();
    };
    const reset = () => { pendingPointer = false; targetX = 0; targetY = 0; schedule(); };
    const scroll = () => { boundsDirty = true; schedule(); };
    const resize = () => { boundsDirty = true; heightDirty = true; schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(stage); observer.observe(scrollRoot);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else reset(); };
    stage.addEventListener("pointermove", move, { passive: true });
    stage.addEventListener("pointerleave", reset);
    scrollRoot.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", reset);
    void document.fonts.ready.then(() => { if (!disposed) resize(); });
    schedule();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", reset);
      scrollRoot.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", reset);
    };
  }, [active, scrollRoot]);

  const enter = (event: MouseEvent<HTMLAnchorElement>, id: RoomId) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); navigate(id);
  };
  const result = phase7Summary.statistical_result;
  const intervalStart = result.hac_95_ci[0] / .25 * 240 + 20;
  const intervalEnd = result.hac_95_ci[1] / .25 * 240 + 20;
  const mean = result.confirmation_mean_spearman_ic / .25 * 240 + 20;

  return <div ref={root} className={styles.entrance}>
    <section ref={hero} className={styles.hero} aria-labelledby="entrance-heading" data-room-surface>
      <div className={styles.intro} data-scroll-reveal="copy">
        <h1 id="entrance-heading" data-room-heading tabIndex={-1}>Sameer<br /><span>Jain<span className={styles.period}>.</span></span></h1>
        <p className={styles.byline}>Machine learning &amp; computer vision.<br />A little healthy curiosity.</p>
        <span className={styles.scrollCue}>Scroll to explore the work <span aria-hidden="true">↓</span></span>
      </div>
      <div className={styles.previewWorld} data-scroll-reveal="figure">
        <div className={styles.entranceSculpture}><KineticSculpture kind="ribbon" active={active} scrollRoot={scrollRoot} /></div>
        <a href={roomHref("mri")} onClick={event => enter(event, "mri")} className={styles.mriPreview} aria-label="Explore the featured brain tumor MRI project">
          <div className={styles.scanWindow}><Image src="/projects/brain-tumor-mri/images/cluster_2_samples.png" alt="Crop of a published Glioma MRI example from the project" width={2250} height={480} priority sizes="(max-width: 650px) 1800px, 2200px" /></div>
          <span className={styles.scanCaption}>Featured work / Brain tumor MRI <span aria-hidden="true">↗</span></span>
        </a>
      </div>
    </section>
    <section className={styles.questions} aria-labelledby="questions-heading" data-room-surface>
      <p className={styles.chapterIntro} data-scroll-reveal="copy">Georgia Tech / Industrial Engineering</p>
      <h2 id="questions-heading" data-scroll-reveal="copy">Good questions<br />lead <span>somewhere.</span></h2>
      <p className={styles.questionsLede} data-scroll-reveal="copy">Welcome to my corner of the internet. I build experiments to find patterns, test their limits, and understand what the results actually mean.</p>
      <div className={styles.projectPaths}>
        <a href={roomHref("mri")} onClick={event => enter(event, "mri")} className={styles.mriPath} data-scroll-reveal="figure"><span>Go left / Featured work</span><strong>Can a model<br />learn to see?</strong><p>Brain MRI, learned representations, and an honest look at what worked.</p><span className={styles.pathArrow} aria-hidden="true">←</span></a>
        <a href={roomHref("etf")} onClick={event => enter(event, "etf")} className={styles.etfPath} data-scroll-reveal="figure"><span>ETF research / Elsewhere in the data</span><strong>Finding<br />a signal.</strong><p>Is there signal in the noise? Frozen models, market data, and a hypothesis put to the test.</p><svg viewBox="0 0 280 70" aria-hidden="true"><path d="M20 42H260" stroke="currentColor" opacity=".4" /><path d={`M${intervalStart} 42H${intervalEnd}`} stroke="#2449dc" strokeWidth="15" strokeLinecap="round" /><circle cx={mean} cy="42" r="12" fill="#ff8066" stroke="#172456" strokeWidth="2" /></svg><span className={styles.pathArrow} aria-hidden="true">→</span></a>
      </div>
      <div className={styles.otherPaths} data-scroll-reveal="group"><a href={roomHref("profile")} onClick={event => enter(event, "profile")}>↑ The person behind the work</a><a href={roomHref("contact")} onClick={event => enter(event, "contact")}>↓ Start a conversation</a></div>
    </section>
  </div>;
}
