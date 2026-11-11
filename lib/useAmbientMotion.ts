"use client";

import { createContext, useContext, useEffect, type RefObject } from "react";

const AmbientMotionContext = createContext(true);
export const AmbientMotionProvider = AmbientMotionContext.Provider;

/** CSS owns the animation clock. This hook only starts/stops visible room artwork. */
export function useAmbientMotion(
  active: boolean,
  scrollRoot: HTMLElement | null | undefined,
  target: RefObject<HTMLElement | null>,
) {
  const enabled = useContext(AmbientMotionContext);
  useEffect(() => {
    const node = target.current;
    if (!node) return;
    node.dataset.ambientRunning = "false";
    if (!active || !enabled) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => { node.dataset.ambientRunning = String(visible && !document.hidden && !reduced.matches); };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
      update();
    }, { root: scrollRoot ?? null, threshold: 0 });
    observer.observe(node);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      node.dataset.ambientRunning = "false";
    };
  }, [active, enabled, scrollRoot, target]);
}
