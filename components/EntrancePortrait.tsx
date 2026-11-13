"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAmbientMotionEnabled } from "@/lib/useAmbientMotion";
import styles from "./SpatialEntrance.module.css";

const VIDEO = "/images/entrance-animation-v5.mp4";

export default function EntrancePortrait({ active, scrollRoot }: {
  active: boolean; scrollRoot: HTMLElement | null;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const ambientEnabled = useAmbientMotionEnabled();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player || !active || !scrollRoot || failed) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    let retryAttached = false;
    const retryEvents = ["pointerdown", "keydown", "touchend", "wheel"] as const;
    const clearRetry = () => {
      retryEvents.forEach(event => window.removeEventListener(event, update));
      retryAttached = false;
    };
    const retryOnGesture = () => {
      if (retryAttached || disposed || !visible || document.hidden) return;
      retryEvents.forEach(event => window.addEventListener(event, update, { passive: true }));
      retryAttached = true;
    };
    const update = () => {
      if (disposed) return;
      player.playbackRate = reduced.matches || !ambientEnabled ? .55 : 1;
      if (!visible || document.hidden) {
        clearRetry();
        player.pause();
        return;
      }
      if (!player.hasAttribute("src")) {
        player.src = VIDEO;
      }
      player.muted = true;
      // Recover from restrictive autoplay policies on the next normal interaction.
      void player.play().then(clearRetry).catch(retryOnGesture);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      update();
    }, { root: scrollRoot, threshold: 0 });
    observer.observe(player);
    const resumeLoop = () => {
      // Some media engines pause while seeking back to the first loop frame.
      if (player.loop && player.paused && player.currentTime < .1) update();
    };
    player.addEventListener("seeked", resumeLoop);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      disposed = true;
      clearRetry();
      observer.disconnect();
      player.removeEventListener("seeked", resumeLoop);
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      player.pause();
    };
  }, [active, scrollRoot, ambientEnabled, failed]);

  return <figure className={styles.portrait} data-entrance-portrait data-scroll-reveal="portrait">
    <div className={styles.portraitFrame}>
      {failed ? <Image src="/images/entrance-animation-v5.jpg" alt="Codex-faced figure beside Sameer in an edited portrait collage."
        width={624} height={856} sizes="(max-width: 650px) 90vw, (max-width: 800px) 360px, 420px" /> : <video ref={video} width={624} height={856} autoPlay muted loop playsInline preload="none"
        poster="/images/entrance-animation-v5.jpg"
        aria-label="Looping portrait of a Codex-faced figure and Sameer, with moving arms, swaying hair, and blinking eyes."
        onError={() => setFailed(true)} />}
    </div>
  </figure>;
}
