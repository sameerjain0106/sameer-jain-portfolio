"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Image from "next/image";
import { useAmbientMotionEnabled } from "@/lib/useAmbientMotion";
import styles from "./SpatialEntrance.module.css";

const VIDEO = "/images/entrance-animation-v6.mp4";
const POSTER = "/images/entrance-animation-v6.webp";

export default function EntrancePortrait({ active, scrollRoot, portraitRef }: {
  active: boolean; scrollRoot: HTMLElement | null; portraitRef: Ref<HTMLElement>;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const ambientEnabled = useAmbientMotionEnabled();
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player || !active || !scrollRoot || failed) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const visibilityGate = player.closest<HTMLElement>("[data-kinetic-occluded]");
    let visible = false;
    let disposed = false;
    let retryAttached = false;
    const retryEvents = ["pointerdown", "keydown", "touchend", "wheel"] as const;
    const canPlay = () => visible && !document.hidden && visibilityGate?.dataset.kineticOccluded !== "true";
    const clearRetry = () => {
      retryEvents.forEach(event => window.removeEventListener(event, update));
      retryAttached = false;
    };
    const retryOnGesture = () => {
      if (retryAttached || disposed || !canPlay()) return;
      retryEvents.forEach(event => window.addEventListener(event, update, { passive: true }));
      retryAttached = true;
    };
    const update = () => {
      if (disposed) return;
      if (!canPlay()) {
        clearRetry();
        player.pause();
        return;
      }
      const rate = reduced.matches || !ambientEnabled ? .55 : 1;
      player.defaultPlaybackRate = rate;
      if (!player.hasAttribute("src")) {
        player.src = VIDEO;
      }
      player.playbackRate = rate;
      player.muted = true;
      // Recover from restrictive autoplay policies on the next normal interaction.
      if (player.paused) void player.play().then(clearRetry).catch(retryOnGesture);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      update();
    }, { root: scrollRoot, threshold: 0 });
    observer.observe(player);
    const occlusion = new MutationObserver(update);
    if (visibilityGate) occlusion.observe(visibilityGate, { attributes: true, attributeFilter: ["data-kinetic-occluded"] });
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
      occlusion.disconnect();
      player.removeEventListener("seeked", resumeLoop);
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      player.pause();
    };
  }, [active, scrollRoot, ambientEnabled, failed]);

  return <figure ref={portraitRef} className={styles.portrait} data-entrance-portrait>
    <div className={styles.portraitFrame}>
      {failed ? <Image src={POSTER} alt="Codex-faced figure beside Sameer in an edited portrait collage."
        width={624} height={856} sizes="(max-width: 650px) calc(100vw - 88px), 540px" /> : <video ref={video} width={624} height={856} autoPlay muted loop playsInline preload="none"
        poster={POSTER}
        data-portrait-playing={playing}
        aria-label="Looping portrait of a Codex-faced figure and Sameer, with moving arms, swaying hair, and blinking eyes."
        onPlaying={() => setPlaying(true)}
        onError={() => setFailed(true)} />}
    </div>
  </figure>;
}
