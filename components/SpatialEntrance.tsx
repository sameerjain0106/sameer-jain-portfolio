"use client";

import { useEffect, useRef } from "react";
import { useAmbientMotionEnabled } from "@/lib/useAmbientMotion";
import KineticSculpture from "./KineticSculpture";
import EntrancePortrait from "./EntrancePortrait";
import styles from "./SpatialEntrance.module.css";

export default function SpatialEntrance({ active, scrollRoot }: {
  active: boolean; scrollRoot: HTMLElement | null;
}) {
  const hero = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLElement>(null);
  const codex = useRef<HTMLSpanElement>(null);
  const ambientEnabled = useAmbientMotionEnabled();

  useEffect(() => {
    const text = intro.current;
    const print = portrait.current;
    const mark = codex.current;
    if (!active || !text || !print || !mark) return;
    const panel = hero.current?.closest<HTMLElement>("[data-panel]");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let previous = 0;
    let x = 0, y = 0;
    let targetX = 0, targetY = 0;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = previous = 0;
      x = y = targetX = targetY = 0;
      text.style.removeProperty("transform");
      print.style.removeProperty("transform");
      mark.style.removeProperty("transform");
    };
    const render = (now: number) => {
      frame = 0;
      const delta = previous ? Math.min(now - previous, 50) : 16;
      previous = now;
      const mix = 1 - Math.exp(-delta / 95);
      x += (targetX - x) * mix;
      y += (targetY - y) * mix;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .002;
      if (settled) {
        if (!targetX && !targetY) { clear(); return; }
        x = targetX;
        y = targetY;
        previous = 0;
      }

      text.style.transform = `translate3d(${(x * 21).toFixed(2)}px, ${(y * 15).toFixed(2)}px, 0)`;
      print.style.transform = `translate3d(${(x * 36).toFixed(2)}px, ${(y * 23).toFixed(2)}px, 0) rotate(${(x * .95).toFixed(2)}deg)`;
      mark.style.transform = `rotate(${(x * 15.75).toFixed(2)}deg)`;
      if (!settled) schedule();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || motion.matches || !fine.matches || document.hidden || panel?.inert) return;
      // Use the fixed viewport as the input, so translated content and gates cannot shift it.
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      const range = Math.min(1, innerWidth / 1120, innerHeight / 690) * (ambientEnabled ? 1 : .38);
      targetX = clamp(event.clientX / innerWidth * 2 - 1) * range;
      targetY = clamp(event.clientY / innerHeight * 2 - 1) * range;
      schedule();
    };
    const reset = () => {
      targetX = targetY = 0;
      if (x || y) schedule();
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", clear);
    window.addEventListener("resize", clear);
    document.addEventListener("visibilitychange", clear);
    motion.addEventListener("change", clear);
    fine.addEventListener("change", clear);
    return () => {
      clear();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", clear);
      window.removeEventListener("resize", clear);
      document.removeEventListener("visibilitychange", clear);
      motion.removeEventListener("change", clear);
      fine.removeEventListener("change", clear);
    };
  }, [active, ambientEnabled]);

  return <section ref={hero} className={styles.hero} aria-labelledby="entrance-heading" data-room-surface>
    <noscript><style>{`.${styles.explorePrompt}{display:none!important}`}</style></noscript>
    <div ref={intro} className={styles.intro} data-entrance-intro>
      <h1 id="entrance-heading" data-room-heading tabIndex={-1}>Sameer<br /><span>Jain<span className={styles.period}>.</span></span></h1>
      <div className={styles.byline}>
        <span ref={codex} className={styles.codexMark} role="img" aria-label="Built with Codex" title="Built with Codex" />
        <p>Data science, statistics and ML</p>
      </div>
      <div className={styles.explorePrompt} data-entrance-guide>
        <p className={styles.mouseHint}>Hover on the sides</p>
        <p className={styles.touchHint}>Tap a side</p>
      </div>
    </div>
    <div className={styles.portraitStage}>
      <div className={styles.entranceSculpture} aria-hidden="true"><KineticSculpture kind="ribbon" active={active} scrollRoot={scrollRoot} /></div>
      <EntrancePortrait active={active} scrollRoot={scrollRoot} portraitRef={portrait} />
    </div>
  </section>;
}
