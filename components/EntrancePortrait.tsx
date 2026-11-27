"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Image from "next/image";
import { useAmbientMotionEnabled } from "@/lib/useAmbientMotion";
import styles from "./SpatialEntrance.module.css";

const VIDEO = "/images/entrance-alpine-ripples.mp4";
const POSTER = "/images/entrance-alpine-armor.webp";

export default function EntrancePortrait({ active, scrollRoot, portraitRef }: {
  active: boolean; scrollRoot: HTMLElement | null; portraitRef: Ref<HTMLElement>;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const ambientEnabled = useAmbientMotionEnabled();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player || !active || failed) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const syncRate = () => {
      const rate = reduced.matches || !ambientEnabled ? .55 : 1;
      if (player.defaultPlaybackRate !== rate) player.defaultPlaybackRate = rate;
      if (player.playbackRate !== rate) player.playbackRate = rate;
    };
    syncRate();
    reduced.addEventListener("change", syncRate);
    return () => reduced.removeEventListener("change", syncRate);
  }, [active, ambientEnabled, failed]);

  useEffect(() => {
    const player = video.current;
    if (!player || !active || !scrollRoot || failed) return;
    const visibilityGate = player.closest<HTMLElement>("[data-kinetic-occluded]");
    let visible = false;
    let disposed = false;
    let retryAttached = false;
    const retryEvents = ["pointerdown", "keydown", "touchend", "wheel"] as const;
    const canPlay = () => visible && !document.hidden && visibilityGate?.dataset.kineticOccluded !== "true";
    const clearRetry = () => {
      if (!retryAttached) return;
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
        if (!player.paused) player.pause();
        return;
      }
      if (!player.hasAttribute("src")) {
        player.src = VIDEO;
      }
      if (!player.muted) player.muted = true;
      // Recover from restrictive autoplay policies on the next normal interaction.
      if (player.paused) void player.play().then(clearRetry).catch(retryOnGesture);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
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
    return () => {
      disposed = true;
      clearRetry();
      observer.disconnect();
      occlusion.disconnect();
      player.removeEventListener("seeked", resumeLoop);
      document.removeEventListener("visibilitychange", update);
      if (!player.paused) player.pause();
    };
  }, [active, scrollRoot, failed]);

  return <figure ref={portraitRef} className={styles.portrait} data-entrance-portrait>
    <div className={styles.portraitFrame}>
      {failed ? <Image unoptimized src={POSTER} alt="Sameer as Napoleon, pointing over the Alps from a rearing horse wearing gold Codex face armor."
        width={624} height={856} /> : <video ref={video} width={624} height={856} autoPlay muted loop playsInline preload="none"
        poster={POSTER}
        data-portrait-playing="false"
        aria-label="Sameer as Napoleon on a rearing horse with glowing gold Codex armor. Wind ripples his cape from shoulder to hem and lifts individual locks of mane and tail."
        onPlaying={event => {
          const player = event.currentTarget;
          if (player.dataset.portraitPlaying !== "true") player.dataset.portraitPlaying = "true";
        }}
        onError={() => setFailed(true)} />}
    </div>
  </figure>;
}
