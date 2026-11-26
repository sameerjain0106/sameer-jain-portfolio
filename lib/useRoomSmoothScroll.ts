"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const scrollKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " ", "Enter", "Escape"]);
const wheelLerp = .19;

/** Light wheel easing; the actual element scrollTop remains the animation clock. */
export function useRoomSmoothScroll(active: boolean, scroller: HTMLElement | null) {
  useEffect(() => {
    if (!scroller) return;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;
    let frame = 0;
    let disposed = false;
    let lastWheelTime = 0;
    let wheelDirection = 0;
    let recentTravel = 0;

    function setRunning(running: boolean) {
      const next = String(running);
      if (scroller!.dataset.scrollSmoothingRunning !== next) scroller!.dataset.scrollSmoothingRunning = next;
    }

    function stopFrames() {
      cancelAnimationFrame(frame);
      frame = 0;
      setRunning(false);
    }

    function cancelInertia() {
      stopFrames();
      lastWheelTime = wheelDirection = recentTravel = 0;
      // stop/start rebases the target on the browser's current position without
      // writing scrollTop. Keys, scrollbar dragging and anchors then stay native.
      instance?.stop();
      instance?.start();
    }

    function tick(time: number) {
      frame = 0;
      if (disposed || document.hidden || !instance) return;
      // Native navigation can move the room between frames, for example when
      // a link inside an iframe jumps to a section. Rebase on that position.
      if (instance.isScrolling === "smooth" && Math.abs(instance.actualScroll - instance.scroll) > 1) {
        cancelInertia();
        return;
      }
      instance.raf(time);
      const running = instance.isScrolling === "smooth";
      setRunning(running);
      if (running) frame = requestAnimationFrame(tick);
    }

    function wake() {
      if (disposed || document.hidden || !instance || frame) return;
      // Let Lenis take the first animation frame's timestamp. The input event's
      // performance.now() can be later than that frame's shared timestamp.
      instance.time = 0;
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
        lerp: wheelLerp,
        wheelMultiplier: 1.08,
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
        virtualScroll: data => {
          const { event, deltaY } = data;
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
          const direction = Math.sign(deltaY);
          if (wheelDirection && direction !== wheelDirection) cancelInertia();
          wheelDirection = direction;
          const elapsed = event.timeStamp - lastWheelTime;
          lastWheelTime = event.timeStamp;
          current.options.lerp = wheelLerp;
          if (event.target instanceof Element && event.target.closest("#timeline[data-animated]") && event.deltaMode !== WheelEvent.DOM_DELTA_PAGE) {
            // Extra travel comes from several quick wheel inputs. A lone notch
            // and the tiny trailing deltas from a trackpad stay precise.
            recentTravel = elapsed >= 0 && elapsed < 160 ? recentTravel * Math.exp(-elapsed / 150) : 0;
            const pixels = Math.abs(deltaY);
            const burst = Math.min(1, Math.max(0, (recentTravel - 85) / 305)) * Math.min(1, pixels / 45);
            data.deltaY *= 1 + 2.4 * burst;
            current.options.lerp = wheelLerp - .105 * burst;
            recentTravel += Math.min(180, pixels);
          } else recentTravel = 0;
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
    window.addEventListener("popstate", cancelInertia);
    window.addEventListener("hashchange", cancelInertia);
    scroller.addEventListener("keydown", onKey, true);
    scroller.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      disposed = true;
      destroyInstance();
      finePointer.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", configure);
      window.removeEventListener("popstate", cancelInertia);
      window.removeEventListener("hashchange", cancelInertia);
      scroller.removeEventListener("keydown", onKey, true);
      scroller.removeEventListener("pointerdown", onPointer);
    };
  }, [active, scroller]);
}
