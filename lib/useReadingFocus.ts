"use client";

import { useEffect } from "react";

/** Soften the resident only while substantive copy crosses the reading area. */
export function useReadingFocus(active: boolean, scroller: HTMLElement | null) {
  useEffect(() => {
    if (!active || !scroller) return;
    const reading = new Set<Element>();
    const observed = new Set<Element>();
    let observer: IntersectionObserver;
    let height = 0;
    const publish = () => { scroller.dataset.readingFocus = String(reading.size > 0); };
    const observeZones = () => {
      for (const zone of observed) {
        if (scroller.contains(zone)) continue;
        observer.unobserve(zone); observed.delete(zone); reading.delete(zone);
      }
      scroller.querySelectorAll("[data-reading-zone]").forEach(zone => {
        if (observed.has(zone)) return;
        observed.add(zone); observer.observe(zone);
      });
      publish();
    };
    const configure = () => {
      const nextHeight = scroller.clientHeight;
      if (observer && nextHeight === height) return;
      height = nextHeight;
      observer?.disconnect(); observed.clear(); reading.clear();
      // IntersectionObserver percentages use width, even for vertical margins.
      const inset = Math.round(height * .3);
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) reading.add(entry.target);
          else reading.delete(entry.target);
        }
        publish();
      }, { root: scroller, rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0 });
      observeZones();
    };
    configure();
    const resize = new ResizeObserver(configure);
    resize.observe(scroller);
    // Initial deep links can hydrate their SSR room after the shell's effects.
    const content = new MutationObserver(observeZones);
    content.observe(scroller, { childList: true, subtree: true });
    return () => { observer.disconnect(); resize.disconnect(); content.disconnect(); delete scroller.dataset.readingFocus; };
  }, [active, scroller]);
}
