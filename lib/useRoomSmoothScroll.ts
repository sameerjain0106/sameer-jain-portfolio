"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const scrollKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " ", "Enter", "Escape"]);

/** Light wheel easing; the actual element scrollTop remains the animation clock. */
export function useRoomSmoothScroll(active: boolean, scroller: HTMLElement | null) {
  useEffect(() => {
    if (!scroller) return;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;
    let frame = 0;
    let disposed = false;

    function stopFrames() {
      cancelAnimationFrame(frame);
      frame = 0;
      scroller!.dataset.scrollSmoothingRunning = "false";
    }

    function cancelInertia() {
      stopFrames();
      // stop/start rebases the target on the browser's current position without
      // writing scrollTop. Keys, scrollbar dragging and anchors then stay native.
      instance?.stop();
      instance?.start();
    }

    function tick(time: number) {
      frame = 0;
      if (disposed || document.hidden || !instance) return;
      instance.raf(time);
      if (instance.isScrolling === "smooth") {
        scroller!.dataset.scrollSmoothingRunning = "true";
        frame = requestAnimationFrame(tick);
      } else scroller!.dataset.scrollSmoothingRunning = "false";
    }

    function wake() {
      if (disposed || document.hidden || !instance || frame) return;
      // An on-demand loop must not integrate the idle interval as one large dt.
      instance.time = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function destroyInstance() {
      stopFrames();
      instance?.stop();
      instance?.destroy();
      instance = null;
      scroller!.dataset.scrollSmoothing = "native";
    }

    function configure() {
      destroyInstance();
      const content = scroller!.firstElementChild;
      if (!active || document.hidden || reduced.matches || !finePointer.matches || !(content instanceof HTMLElement)) return;

      instance = new Lenis({
        wrapper: scroller!,
        content,
        eventsTarget: scroller!,
        smoothWheel: true,
        syncTouch: false,
        lerp: .18,
        wheelMultiplier: 1,
        autoRaf: false,
        autoResize: true,
        anchors: false,
        allowNestedScroll: true,
        respectReducedMotion: true,
        prevent: node => {
          const native = node.matches("input, textarea, select, [contenteditable='true'], [data-native-scroll]");
          if (native) cancelInertia();
          return native;
        },
        virtualScroll: ({ event, deltaY }) => {
          if (!(event instanceof WheelEvent) || event.ctrlKey || event.metaKey || event.shiftKey || !event.cancelable) {
            cancelInertia();
            return false;
          }
          const current = instance;
          if (!current || !deltaY) return false;
          // Leave a wheel gesture at either end to native overscroll containment.
          if ((deltaY < 0 && current.actualScroll <= 0) || (deltaY > 0 && current.actualScroll >= current.limit - 1)) {
            cancelInertia();
            return false;
          }
          wake();
          return true;
        },
      });
      scroller!.dataset.scrollSmoothing = "wheel";
    }

    function onKey(event: KeyboardEvent) { if (scrollKeys.has(event.key)) cancelInertia(); }
    function onPointer() { cancelInertia(); }

    configure();
    finePointer.addEventListener("change", configure);
    reduced.addEventListener("change", configure);
    document.addEventListener("visibilitychange", configure);
    scroller.addEventListener("keydown", onKey, true);
    scroller.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      disposed = true;
      destroyInstance();
      finePointer.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", configure);
      scroller.removeEventListener("keydown", onKey, true);
      scroller.removeEventListener("pointerdown", onPointer);
    };
  }, [active, scroller]);
}
