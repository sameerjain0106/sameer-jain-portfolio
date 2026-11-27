"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { mriExplorerUrl } from "@/data/mriStory";
import { useAmbientMotion } from "@/lib/useAmbientMotion";
import { FrameArchitecture } from "./PerceptionShowcase";
import styles from "./MriExplorerFrame.module.css";

const maxFrameHeight = 16000;
const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export default function MriExplorerFrame({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const frameSlot = useRef<HTMLDivElement>(null);
  const floatingFrames = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const measuredHeight = useRef<number | null>(null);
  const readingStudyOffset = useRef<number | null>(null);
  const studyAnchorOffset = useRef<number | null>(null);
  useAmbientMotion(active, scrollRoot, floatingFrames);

  useEffect(() => {
    const panel = scrollRoot?.closest<HTMLElement>("[data-panel]");
    if (!scrollRoot || !panel) return;
    if (panel.dataset.active === "true" && window.location.hash === "#work") {
      const study = scrollRoot.querySelector<HTMLElement>("#work");
      if (study) studyAnchorOffset.current = parseFloat(getComputedStyle(study).scrollMarginTop) || 0;
    }
    function startWhenEntered() {
      if (panel!.dataset.active === "true") setStarted(true);
    }
    // The first slide can paint its shell without starting an iframe document.
    // Direct visits start immediately. Later visits keep the loaded explorer.
    scrollRoot.addEventListener("spatial:entered", startWhenEntered);
    startWhenEntered();
    return () => scrollRoot.removeEventListener("spatial:entered", startWhenEntered);
  }, [scrollRoot]);

  useEffect(() => {
    if (!started || !scrollRoot) return;
    const art = floatingFrames.current;

    const timer = window.setTimeout(() => setUnavailable(true), 12000);

    function receive(event: MessageEvent) {
      const embedded = frame.current;
      if (!embedded || !scrollRoot || event.origin !== window.location.origin || event.source !== embedded.contentWindow) return;

      const message = event.data;
      if (message?.type === "mri-explorer:size" && Number.isFinite(message.height) && message.height > 0 && message.height <= maxFrameHeight) {
        window.clearTimeout(timer);
        const nextHeight = Math.ceil(message.height);
        if (nextHeight !== measuredHeight.current) {
          measuredHeight.current = nextHeight;
          const study = scrollRoot.querySelector<HTMLElement>("#work");
          if (studyAnchorOffset.current === null && study && scrollRoot.parentElement?.dataset.active === "true") {
            const offset = study.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top;
            if (offset <= 2) readingStudyOffset.current ??= offset;
          }
          setHeight(nextHeight);
        }
      }
      if (message?.type === "mri-explorer:scroll" && Number.isFinite(message.top) && message.top >= 0 && message.top < embedded.clientHeight) {
        const offset = embedded.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollRoot.scrollTo({ top: scrollRoot.scrollTop + offset + message.top - 84, behavior: reducedMotion ? "instant" : "smooth" });
      }
      if (message?.type === "mri-explorer:aim" && Number.isFinite(message.x) && Number.isFinite(message.y)) {
        const bounds = embedded.getBoundingClientRect();
        if (message.x < 0 || message.y < 0 || message.x >= bounds.width || message.y >= bounds.height) return;
        const point = { bubbles: true, clientX: bounds.left + message.x, clientY: bounds.top + message.y };
        // Pointer and click events inside the explorer do not bubble into the room.
        embedded.dispatchEvent(new PointerEvent("pointermove", { ...point, pointerType: "mouse" }));
        if (message.blink === true) embedded.dispatchEvent(new MouseEvent("click", point));
        if (art && Number.isFinite(message.stageX) && Math.abs(message.stageX) <= 1 &&
            Number.isFinite(message.stageY) && Math.abs(message.stageY) <= 1) {
          art.style.setProperty("--frames-x", `${-message.stageX * 12}px`);
          art.style.setProperty("--frames-y", `${-message.stageY * 9}px`);
        }
      }
      if (message?.type === "mri-explorer:stage-leave") {
        art?.style.removeProperty("--frames-x");
        art?.style.removeProperty("--frames-y");
      }
      if (message?.type === "mri-explorer:map" && document.activeElement === embedded) {
        embedded.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "M", shiftKey: true }));
      }
    }

    window.addEventListener("message", receive);
    frame.current?.contentWindow?.postMessage({ type: "mri-explorer:measure" }, window.location.origin);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("message", receive);
    };
  }, [started, scrollRoot]);

  useEffect(() => {
    const slot = frameSlot.current;
    if (!slot || !scrollRoot) return;
    const resize = new ResizeObserver(() => {
      if (slot.dataset.ready !== "true" || !scrollRoot.clientHeight) return;
      const offset = studyAnchorOffset.current ?? readingStudyOffset.current;
      readingStudyOffset.current = null;
      if (offset !== null) {
        const study = scrollRoot.querySelector<HTMLElement>("#work");
        if (study) {
          const top = scrollRoot.scrollTop + study.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top - offset;
          scrollRoot.scrollTo({ top, behavior: "instant" });
        }
      }
      // Wait for the actual layout before adjusting the position and chapter offsets.
      scrollRoot.dispatchEvent(new Event("spatial:entered"));
    });
    resize.observe(slot);
    return () => resize.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!active || !scrollRoot) return;
    // The frame can report several heights as its chart and fonts settle.
    // Hold the chosen chapter through those resizes until the visitor moves.
    const cancelJump = () => { studyAnchorOffset.current = null; };
    const cancelKeyJump = (event: KeyboardEvent) => { if (scrollKeys.has(event.key)) cancelJump(); };
    scrollRoot.addEventListener("wheel", cancelJump, { passive: true });
    scrollRoot.addEventListener("pointerdown", cancelJump, { passive: true });
    scrollRoot.addEventListener("keydown", cancelKeyJump);
    window.addEventListener("popstate", cancelJump);
    return () => {
      scrollRoot.removeEventListener("wheel", cancelJump);
      scrollRoot.removeEventListener("pointerdown", cancelJump);
      scrollRoot.removeEventListener("keydown", cancelKeyJump);
      window.removeEventListener("popstate", cancelJump);
      cancelJump();
      readingStudyOffset.current = null;
    };
  }, [active, scrollRoot]);

  function goToStudy(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const study = scrollRoot?.querySelector<HTMLElement>("#work");
    if (!scrollRoot || !study) return;
    event.preventDefault();
    const top = scrollRoot.scrollTop + study.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    studyAnchorOffset.current = 0;
    study.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    scrollRoot.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <section className={styles.explorer} aria-labelledby="mri-explorer-heading" data-room-surface data-surface-positioned>
      <div ref={floatingFrames} className={styles.floatingFrames} data-mri-explorer-frames aria-hidden="true">
        <FrameArchitecture />
      </div>
      <h2 id="mri-explorer-heading" data-room-heading tabIndex={-1} className={styles.srOnly}>Brain tumor MRI explorer</h2>
      <a className={styles.skipLink} href="#work" onClick={goToStudy}>Skip to Study results</a>
      <div ref={frameSlot} className={styles.frameSlot} data-ready={height !== null} style={{ height: height ?? undefined }}>
        {height === null && (
          <div className={styles.placeholder}>
            <p role="status">{unavailable ? "The explorer is available in a separate tab." : "Loading the MRI explorer…"}</p>
            <a href={mriExplorerUrl} target="_blank" rel="noreferrer">Open the MRI explorer</a>
          </div>
        )}
        <iframe
          ref={frame}
          src={started ? "/mri-explorer/index.html" : undefined}
          title="MRI scan upload and reference map"
          className={styles.frame}
          data-native-cursor
          data-no-dwell
          style={{ height: height === null ? 400 : "100%" }}
          onLoad={() => frame.current?.contentWindow?.postMessage({ type: "mri-explorer:measure" }, window.location.origin)}
        />
      </div>
      <div className={styles.studyTransition}>
        <div className={styles.studyRail} data-scroll-reveal="group">
          <a href="#work" onClick={goToStudy}>View study results <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}
