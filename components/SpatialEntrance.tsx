"use client";

import { useEffect, useRef } from "react";
import KineticSculpture from "./KineticSculpture";
import EntrancePortrait from "./EntrancePortrait";
import styles from "./SpatialEntrance.module.css";

export default function SpatialEntrance({ active, scrollRoot }: {
  active: boolean; scrollRoot: HTMLElement | null;
}) {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = hero.current;
    if (!active || !stage) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let turn = 0;
    let targetTurn = 0;
    let bounds: DOMRect | null = null;
    const render = () => {
      frame = 0;
      if (document.hidden) return;
      turn += (targetTurn - turn) * .095;
      stage.style.setProperty("--look-turn", `${turn.toFixed(2)}deg`);
      if (Math.abs(targetTurn - turn) > .005) schedule();
    };
    const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      if (motion.matches || !fine.matches || event.pointerType !== "mouse" || document.hidden) return;
      bounds ??= stage.getBoundingClientRect();
      if (!bounds.width) return;
      targetTurn = ((event.clientX - bounds.left) / bounds.width - .5) * 4.5;
      schedule();
    };
    const reset = () => { targetTurn = 0; bounds = null; schedule(); };
    const observer = new ResizeObserver(() => { bounds = null; });
    observer.observe(stage);
    stage.addEventListener("pointermove", move, { passive: true });
    stage.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset);
    fine.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      stage.style.removeProperty("--look-turn");
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", reset);
      motion.removeEventListener("change", reset);
      fine.removeEventListener("change", reset);
    };
  }, [active]);

  return <section ref={hero} className={styles.hero} aria-labelledby="entrance-heading" data-room-surface>
    <noscript><style>{`.${styles.explorePrompt}{display:none!important}`}</style></noscript>
    <div className={styles.intro}>
      <h1 id="entrance-heading" data-room-heading tabIndex={-1}>Sameer<br /><span>Jain<span className={styles.period}>.</span></span></h1>
      <div className={styles.byline}>
        <span className={styles.codexMark} role="img" aria-label="Built with Codex" title="Built with Codex" />
        <p>Data science, statistics and ML</p>
      </div>
      <div className={styles.explorePrompt} data-entrance-guide>
        <p className={styles.mouseHint}>Hover on the sides</p>
        <p className={styles.touchHint}>Tap a side</p>
      </div>
    </div>
    <div className={styles.portraitStage}>
      <div className={styles.entranceSculpture} aria-hidden="true"><KineticSculpture kind="ribbon" active={active} scrollRoot={scrollRoot} /></div>
      <EntrancePortrait active={active} scrollRoot={scrollRoot} />
    </div>
  </section>;
}
