"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mriExplorerUrl } from "@/data/mriStory";
import styles from "./MriExplorerFrame.module.css";

const maxFrameHeight = 16000;

export default function MriExplorerFrame({ scrollRoot }: { scrollRoot: HTMLElement | null }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!scrollRoot) return;

    const timer = window.setTimeout(() => setUnavailable(true), 12000);

    function receive(event: MessageEvent) {
      const embedded = frame.current;
      if (!embedded || !scrollRoot || event.origin !== window.location.origin || event.source !== embedded.contentWindow) return;

      const message = event.data;
      if (message?.type === "mri-explorer:size" && Number.isFinite(message.height) && message.height > 0 && message.height <= maxFrameHeight) {
        window.clearTimeout(timer);
        setHeight(Math.ceil(message.height));
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
  }, [scrollRoot]);

  useLayoutEffect(() => {
    // The story caches chapter offsets. Refresh them after its new lead-in resizes.
    if (height !== null) scrollRoot?.dispatchEvent(new Event("spatial:entered"));
  }, [height, scrollRoot]);

  return (
    <section className={styles.explorer} aria-labelledby="mri-explorer-heading" data-room-surface data-surface-positioned>
      <h2 id="mri-explorer-heading" data-room-heading tabIndex={-1} className={styles.srOnly}>Brain tumor MRI explorer</h2>
      <a className={styles.skipLink} href="#work">Skip to the MRI study</a>
      <div className={styles.frameSlot} data-ready={height !== null}>
        {height === null && (
          <div className={styles.placeholder}>
            <p role="status">{unavailable ? "The explorer is available in a separate tab." : "Loading the MRI explorer…"}</p>
            <a href={mriExplorerUrl} target="_blank" rel="noreferrer">Open the MRI explorer</a>
          </div>
        )}
        <iframe
          ref={frame}
          src={scrollRoot ? "/mri-explorer/index.html" : undefined}
          title="MRI scan upload and reference map"
          className={styles.frame}
          data-native-cursor
          data-no-dwell
          height={height ?? 400}
          onLoad={() => frame.current?.contentWindow?.postMessage({ type: "mri-explorer:measure" }, window.location.origin)}
        />
      </div>
    </section>
  );
}
