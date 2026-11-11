"use client";

import { useEffect } from "react";

type Beat = { node: HTMLElement; top: number; height: number; kind: string; side: number; progress: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Native scroll is the timeline: entry fades retrace the same states in reverse. */
export function useScrollChoreography(active: boolean, scroller: HTMLElement | null) {
  useEffect(() => {
    if (!active || !scroller) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const nodes = Array.from(scroller.querySelectorAll<HTMLElement>("[data-scroll-reveal]"));
    const surfaces = Array.from(scroller.querySelectorAll<HTMLElement>("[data-room-surface]"));
    let beats: Beat[] = [];
    let frame = 0;
    let dirty = true;
    let disposed = false;
    let fieldScroll = "";

    // Positioning is added only where needed; the MRI stage keeps its sticky position.
    surfaces.forEach(node => { if (!node.hasAttribute("data-surface-positioned") && getComputedStyle(node).position === "static") node.style.position = "relative"; });
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => { (entry.target as HTMLElement).dataset.surfaceVisible = String(entry.isIntersecting); });
    }, { root: scroller, threshold: 0 });
    surfaces.forEach(node => visibility.observe(node));

    function measure() {
      // Neutralize only our geometry, then read all layout positions in one batch.
      // Cached document positions avoid transform feedback during forward/reverse scroll.
      nodes.forEach(node => {
        node.style.setProperty("--scroll-lift", "0px");
        node.style.setProperty("--scroll-scale", "1");
        node.style.setProperty("--scroll-turn", "0deg");
      });
      const rootTop = scroller!.getBoundingClientRect().top + scroller!.clientTop;
      const scrollTop = scroller!.scrollTop;
      beats = nodes.map((node, index) => {
        const box = node.getBoundingClientRect();
        return { node, top: box.top - rootTop + scrollTop, height: box.height, kind: node.dataset.scrollReveal ?? "copy", side: index % 2 ? 1 : -1, progress: Number.NaN };
      });
      dirty = false;
    }

    function render() {
      frame = 0;
      if (disposed || document.hidden || !scroller) return;
      if (dirty) measure();
      const height = scroller.clientHeight;
      const scrollTop = scroller.scrollTop;
      const maxScroll = scroller.scrollHeight - height;
      const reduced = motion.matches;
      const nextFieldScroll = `${reduced ? 0 : -Math.sin(scrollTop * .00065) * 32}px`;
      if (nextFieldScroll !== fieldScroll) {
        fieldScroll = nextFieldScroll;
        // A non-inheriting property keeps the field's movement from invalidating
        // every text and SVG descendant. Only each surface's ::before inherits it.
        surfaces.forEach(surface => surface.style.setProperty("--field-scroll", fieldScroll));
      }
      beats.forEach(beat => {
        const travel = Math.min(height * .44, Math.max(height * .22, beat.height * .55 + height * .15));
        const start = beat.top - height * .96;
        const end = Math.min(start + travel, maxScroll);
        const progress = reduced || !beat.height ? 1 : end <= start ? Number(scrollTop >= end) : clamp((scrollTop - start) / (end - start));
        // Most reveals are fully before or after their short entrance window.
        // Their styles stay valid until progress changes or geometry is rebuilt.
        if (progress === beat.progress) return;
        beat.progress = progress;
        const eased = progress * progress * (3 - 2 * progress);
        const remaining = 1 - eased;
        const figure = beat.kind === "figure";
        beat.node.style.setProperty("--scroll-opacity", eased.toFixed(4));
        beat.node.style.setProperty("--scroll-lift", `${(remaining * (figure ? 58 : beat.kind === "group" ? 28 : 38)).toFixed(3)}px`);
        beat.node.style.setProperty("--scroll-scale", String(figure ? 1 - remaining * .045 : 1));
        beat.node.style.setProperty("--scroll-turn", `${figure ? (remaining * beat.side * 1.4).toFixed(3) : 0}deg`);
        beat.node.dataset.scrollProgress = progress.toFixed(4);
      });
    }
    function schedule() { if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(render); }
    function refresh() { dirty = true; schedule(); }
    function tabVisibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else refresh(); }
    const resize = new ResizeObserver(refresh);
    resize.observe(scroller);
    if (scroller.firstElementChild) resize.observe(scroller.firstElementChild);
    nodes.forEach(node => resize.observe(node));
    scroller.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", tabVisibility);
    motion.addEventListener("change", refresh);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    schedule();
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); visibility.disconnect();
      scroller.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", tabVisibility);
      motion.removeEventListener("change", refresh);
    };
  }, [active, scroller]);
}
