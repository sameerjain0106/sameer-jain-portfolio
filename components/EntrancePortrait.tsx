"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAmbientMotionEnabled } from "@/lib/useAmbientMotion";
import styles from "./SpatialEntrance.module.css";

const VIDEO = "/images/entrance-animation-v2.mp4";

export default function EntrancePortrait({ active, scrollRoot }: {
  active: boolean; scrollRoot: HTMLElement | null;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const ambientEnabled = useAmbientMotionEnabled();
  const paused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player || !active || !scrollRoot || failed) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    const update = () => {
      player.playbackRate = reduced.matches || !ambientEnabled ? .55 : 1;
      if (!visible || document.hidden || paused.current) {
        player.pause();
        return;
      }
      if (!player.hasAttribute("src")) {
        player.src = VIDEO;
        player.muted = true;
      }
      // Some embedded browsers reject autoplay. The poster and play button stay usable.
      void player.play().catch(() => { if (!disposed) setPlaying(false); });
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      update();
    }, { root: scrollRoot, threshold: 0 });
    observer.observe(player);
    const resumeLoop = () => {
      // Some media engines pause while seeking back to the first loop frame.
      if (player.loop && player.paused && player.currentTime < .1 && !paused.current) update();
    };
    player.addEventListener("seeked", resumeLoop);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      disposed = true;
      observer.disconnect();
      player.removeEventListener("seeked", resumeLoop);
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      player.pause();
    };
  }, [active, scrollRoot, ambientEnabled, failed]);

  const toggle = () => {
    const player = video.current;
    if (!player) return;
    if (playing) {
      paused.current = true;
      player.pause();
    } else {
      paused.current = false;
      // Keep this call in the gesture for browsers that require explicit playback.
      player.muted = true;
      if (!player.hasAttribute("src")) player.src = VIDEO;
      void player.play().catch(() => setPlaying(false));
    }
  };

  return <figure className={styles.portrait} data-entrance-portrait>
    <noscript><style>{`.${styles.portraitToggle}{display:none!important}`}</style></noscript>
    <div className={styles.portraitFrame}>
      {failed ? <Image src="/images/entrance-animation-v2.jpg" alt="Sameer in an edited portrait collage."
        width={624} height={856} sizes="(max-width: 650px) 90vw, (max-width: 800px) 360px, 420px" /> : <video ref={video} width={624} height={856} muted loop playsInline preload="none"
        poster="/images/entrance-animation-v2.jpg"
        aria-label="Animated portrait collage of Sameer, with moving wrists, swaying hair, and blinking eyes."
        onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onError={() => { setFailed(true); setPlaying(false); }} />}
      {!failed && <button type="button" className={styles.portraitToggle} onClick={toggle}
        aria-label={playing ? "Pause portrait animation" : "Play portrait animation"}>
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause" : "Play"}
      </button>}
    </div>
  </figure>;
}
