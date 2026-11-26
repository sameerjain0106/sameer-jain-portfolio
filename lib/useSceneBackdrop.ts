"use client";

import { useLayoutEffect } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Track stable layout markers. Paint the panel behind every chapter, so a
// chapter boundary never divides the viewport into two background colors.
export function useSceneBackdrop(active: boolean, scroller: HTMLElement | null) {
  useLayoutEffect(() => {
    const panel = scroller?.parentElement;
    if (!active || !scroller || !panel) return;
    const root = scroller;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-scene-color]"));
    if (!chapters.length) return;
    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-scene-reveal]"));
    const departing = Array.from(root.querySelectorAll<HTMLElement>("[data-scene-depart]"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let bands: { start: number; end: number }[] = [], revealTops: number[] = [];
    let height = 1, scrollMax = 0, frame = 0, dirty = true, disposed = false;
    let lastPaint = "";

    function measure() {
      const origin = root.scrollTop - root.getBoundingClientRect().top - root.clientTop;
      height = Math.max(1, root.clientHeight);
      scrollMax = Math.max(0, root.scrollHeight - height);
      let previousEnd = 0;
      bands = chapters.slice(1).map((chapter, index) => {
        const top = origin + chapter.getBoundingClientRect().top;
        const paper = chapter.querySelector<HTMLElement>("[data-scene-paper]");
        const paperEntry = paper ? origin + paper.getBoundingClientRect().top - height : Infinity;
        const end = Math.max(previousEnd, Math.min(scrollMax, top - height * .30, paperEntry));
        const start = index === 0 ? 0 : Math.max(previousEnd, Math.min(end - height * .38, top - height * .82));
        previousEnd = end;
        return {start, end};
      });
      // Only the children move. Measure the stationary layout slot for each reveal.
      revealTops = reveals.map(node => {
        const anchor = node.closest<HTMLElement>("[data-reveal-anchor]");
        return origin + (anchor ?? node.parentElement ?? node).getBoundingClientRect().top;
      });
      dirty = false;
    }
    function render() {
      frame = 0;
      if (disposed || document.hidden) return;
      if (dirty) measure();
      const y = root.scrollTop;
      let from = chapters[0], to = from, amount = 0;
      for (let i = 1; i < chapters.length; i++) {
        const {start, end} = bands[i - 1];
        if (y <= start) break;
        from = chapters[i - 1];
        to = chapters[i];
        amount = smooth(clamp((y - start) / Math.max(1, end - start)));
      }
      const weight = reduced.matches ? Number(amount >= .5) : Math.round(amount * 255) / 255;
      const color = (key: "sceneColor" | "sceneInk") => {
        const a = from.dataset[key], b = to.dataset[key];
        if (!a || !b || !weight) return a;
        if (weight === 1 || a === b) return b;
        return `color-mix(in srgb, ${a} ${(100 * (1 - weight)).toFixed(2)}%, ${b})`;
      };
      const bg = color("sceneColor")!, ink = color("sceneInk");
      if (lastPaint !== bg + ink) {
        panel!.style.setProperty("--scene-bg", bg);
        if (ink) panel!.style.setProperty("--scene-ink", ink);
        lastPaint = bg + ink;
      }
      for (const node of departing) {
        const cue = node.dataset.sceneDepart === "cue";
        const end = height * (cue ? .15 : .61);
        const opacity = reduced.matches ? 1 : 1 - smooth(clamp(y / end));
        const value = String(Number(opacity.toFixed(3)));
        if (node.style.opacity !== value) node.style.opacity = value;
        if (cue && node.inert !== (value === "0")) node.inert = value === "0";
        if (node.hasAttribute("data-kinetic-occluded")) {
          const occluded = String(value === "0");
          if (node.dataset.kineticOccluded !== occluded) node.dataset.kineticOccluded = occluded;
        }
      }
      reveals.forEach((node, i) => {
        const first = node.dataset.sceneReveal === "first";
        const start = first ? 0 : Math.max(0, Math.min(revealTops[i] - height * .90, scrollMax - height * .30));
        const end = first ? height * .34 : Math.min(scrollMax, start + height * .34);
        const t = clamp((y - start) / Math.max(1, end - start));
        const amount = reduced.matches ? 1 : first ? t * (2 - t) : smooth(t);
        const value = String(Number(amount.toFixed(3)));
        if (node.style.opacity === value) return;
        node.style.opacity = value;
        node.style.translate = amount === 1 ? "none" : `0 ${((1 - amount) * 22).toFixed(2)}px`;
      });
    }
    function schedule() {
      if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(render);
    }
    function refresh() { dirty = true; schedule(); }
    const resize = new ResizeObserver(refresh);
    resize.observe(root);
    chapters.forEach(node => resize.observe(node));
    root.addEventListener("scroll", schedule, { passive: true });
    root.addEventListener("spatial:entered", refresh);
    reduced.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    render();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener("scroll", schedule);
      root.removeEventListener("spatial:entered", refresh);
      reduced.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [active, scroller]);
}
