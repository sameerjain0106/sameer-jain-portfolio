"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { perceptionStory as story, perceptionMotion as config } from "@/data/perceptionStory";
import { useAmbientMotion } from "@/lib/useAmbientMotion";
import styles from "./PerceptionShowcase.module.css";

const imageRoot = "/projects/brain-tumor-mri/images/";
const samples = [
  { file: "cluster_0_samples.png", label: "Menin" },
  { file: "cluster_1_samples.png", label: "Tumor" },
  { file: "cluster_2_samples.png", label: "Glioma" },
];
const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const mix = (a: string, b: string, amount: number) => {
  const channels = [1, 3, 5].map((offset) => Math.round(parseInt(a.slice(offset, offset + 2), 16) * (1 - amount) + parseInt(b.slice(offset, offset + 2), 16) * amount));
  return `rgb(${channels.join(",")})`;
};
const luminance = (color: string) => {
  const rgb = color.startsWith("#")
    ? [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16))
    : (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  return rgb.reduce((sum, channel, index) => {
    const value = channel / 255;
    return sum + (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][index];
  }, 0);
};
const contrast = (a: string, b: string) => {
  const light = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light[0] + .05) / (light[1] + .05);
};
function readableInk(ground: string, preferred: string) {
  if (contrast(ground, preferred) >= 4.5) return preferred;
  const paletteInk = contrast(ground, "#111b39") > contrast(ground, "#f2ef9b") ? "#111b39" : "#f2ef9b";
  if (contrast(ground, paletteInk) >= 4.5) return paletteInk;
  return contrast(ground, "#000000") > contrast(ground, "#ffffff") ? "#000000" : "#ffffff";
}

function ScanCrop({ file, label, priority = false }: { file: string; label: string; priority?: boolean }) {
  return <div className={styles.scanCrop}><Image src={imageRoot + file} width={2250} height={480} alt={`Visual crop of one published ${label} MRI example`} sizes="(min-width: 1100px) 190vw, (min-width: 900px) 240vw, 500vw" priority={priority} /></div>;
}

function SceneArt({ index, mobile = false }: { index: number; mobile?: boolean }) {
  const beat = story[index];
  if (index === 0 || index === story.length - 1) return <div className={styles.constellation}>
    <FrameArchitecture />
    <div className={`${styles.scanPlate} ${styles.sideOne}`}><ScanCrop file={samples[0].file} label={samples[0].label} /><span>Menin / Published example</span></div>
    <div className={`${styles.scanPlate} ${styles.mainPlate}`}><ScanCrop file={samples[2].file} label={samples[2].label} priority={index === 0} /><span>Brain tumor MRI <span aria-hidden="true">↗</span></span></div>
    <div className={`${styles.scanPlate} ${styles.sideTwo}`}><ScanCrop file={samples[1].file} label={samples[1].label} /><span>Tumor / Published example</span></div>
  </div>;
  if (index === 1) return <figure className={styles.sampleSpread}>
    {samples.map((sample) => <div key={sample.file} className={styles.sheet}><Image src={imageRoot + sample.file} width={2250} height={480} alt={`Original five-example ${sample.label} MRI contact sheet`} sizes="(min-width: 900px) 60vw, 95vw" /></div>)}
    <figcaption>Original sample sheets / Three source groups</figcaption>
  </figure>;
  return <figure className={`${styles.plotPlate} ${mobile ? styles.mobilePlot : ""}`}>
    <Image src={imageRoot + beat.figure} width={index === 3 ? 547 : 960} height={index === 3 ? 432 : 720} alt={beat.caption} sizes="(min-width: 1100px) 54vw, (min-width: 900px) 60vw, 95vw" loading={mobile ? "lazy" : "eager"} />
    <figcaption>{index === 2 ? "Features → groups → evaluation" : index === 3 ? "Pixels → PCA → Random Forest" : "Train → hold out → evaluate"}</figcaption>
  </figure>;
}

function FrameArchitecture() {
  return <div className={styles.frameSculpture} aria-hidden="true">
    <div className={`${styles.frameFloat} ${styles.frameOne}`}><span className={styles.framePlane} /></div>
    <div className={`${styles.frameFloat} ${styles.frameTwo}`}><span className={styles.framePlane} /></div>
    <div className={`${styles.frameFloat} ${styles.frameThree}`}><span className={styles.framePlane} /></div>
  </div>;
}

export type PerceptionShowcaseProps = {
  scrollRoot?: HTMLElement | null;
  isActive?: boolean;
  embedded?: boolean;
};

export default function PerceptionShowcase({ scrollRoot, isActive = true, embedded = false }: PerceptionShowcaseProps = {}) {
  const root = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const firstArt = useRef<HTMLElement | null>(null);
  const beats = useRef<Array<HTMLElement | null>>([]);
  const kick = useRef<(() => void) | null>(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const pointerMedia = useRef<MediaQueryList | null>(null);
  const viewport = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useAmbientMotion(isActive, scrollRoot, stage);
  useAmbientMotion(isActive, scrollRoot, firstArt);

  useEffect(() => {
    const scene = stage.current;
    function centerPointer() {
      pointer.current = { x: 0, y: 0, targetX: 0, targetY: 0 };
      scene?.style.setProperty("--cursor-x", "0px");
      scene?.style.setProperty("--cursor-y", "0px");
      scene?.style.setProperty("--cursor-turn", "0deg");
    }
    centerPointer();
    // A room may mount before its scrolling element ref is available.
    // Wait for that element rather than briefly listening to document scroll.
    if (!isActive || (embedded && !scrollRoot)) {
      kick.current = null;
      return;
    }
    const enabled = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const orbit = scene?.querySelector<HTMLElement>('[data-mri-orbit="primary"]');
    const orbitSmall = scene?.querySelector<HTMLElement>('[data-mri-orbit="secondary"]');
    const progressBar = scene?.querySelector<HTMLElement>("[data-mri-progress-bar]");
    const scrollTarget = scrollRoot ?? window;
    let frame: number | null = null;
    let disposed = false;
    let measurementsDirty = true;
    let geometryDirty = true;
    let positions: number[] = [];
    let sectionTop = 0;
    let sectionBottom = 0;
    let previousTime: number | null = null;
    let previousProgress = Number.NaN;
    let publishedPointer = "";
    const published = new Map<string, string>();

    function setStyle(node: HTMLElement, name: string, value: string) {
      if (published.get(name) === value) return;
      published.set(name, value);
      node.style.setProperty(name, value);
    }
    function setTransform(key: string, node: HTMLElement | null | undefined, value: string) {
      if (!node || published.get(key) === value) return;
      published.set(key, value);
      node.style.transform = value;
    }

    function measureViewport() {
      const box = scrollRoot?.getBoundingClientRect();
      const next = scrollRoot && box
        ? { left: box.left + scrollRoot.clientLeft, top: box.top + scrollRoot.clientTop, width: scrollRoot.clientWidth, height: scrollRoot.clientHeight }
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      viewport.current = next;
      if (next.height > 0 && root.current?.style.getPropertyValue("--room-height") !== `${next.height}px`) {
        root.current?.style.setProperty("--room-height", `${next.height}px`);
      }
      return next;
    }

    function measureGeometry() {
      const view = measureViewport();
      const scroll = scrollRoot?.scrollTop ?? window.scrollY;
      const offset = scroll - view.top;
      const bounds = root.current!.getBoundingClientRect();
      sectionTop = bounds.top + offset;
      sectionBottom = bounds.bottom + offset;
      positions = beats.current.filter((node): node is HTMLElement => node !== null).map(node => {
        const box = node.getBoundingClientRect();
        return box.top + box.height * .5 + offset;
      });
      geometryDirty = false;
      return view;
    }

    function render(time: number) {
      frame = null;
      if (disposed || document.hidden || !enabled.matches || !root.current || root.current.dataset.active !== "true" || !stage.current) return;
      const scene = stage.current;
      if (measurementsDirty) {
        // Embedded chapters keep stable content coordinates during scrolling.
        // Standalone pages still remeasure because preceding page content can move.
        const view = geometryDirty || !embedded ? measureGeometry() : viewport.current;
        const scroll = scrollRoot?.scrollTop ?? window.scrollY;
        if (!view.width || !view.height || sectionBottom <= scroll || sectionTop >= scroll + view.height) { previousTime = null; return; }
        const anchor = scroll + view.height * config.viewportAnchor;
        let progress = 0;
        for (let i = 0; i < positions.length - 1; i++) {
          if (anchor >= positions[i + 1]) progress = i + 1;
          else if (anchor > positions[i]) { progress = i + (anchor - positions[i]) / Math.max(1, positions[i + 1] - positions[i]); break; }
        }
        measurementsDirty = false;
        if (progress !== previousProgress) {
          previousProgress = progress;
          const base = Math.floor(progress);
          const fraction = progress - base;
          const blend = clamp((fraction - config.transitionStart) / (config.transitionEnd - config.transitionStart));
          const next = Math.round(progress);
          if (activeRef.current !== next) { activeRef.current = next; setActive(next); }
          const ground = mix(story[base].ground, story[Math.min(base + 1, story.length - 1)].ground, blend);
          const ink = readableInk(ground, story[next].ink);
          setStyle(scene, "--world-ground", ground);
          setStyle(root.current, "--world-ink", ink);
          setStyle(root.current, "--world-accent", contrast(ground, "#ff8066") >= 3 ? "#ff8066" : ink);
          // These three transforms do not need to invalidate the evidence below them.
          const orbitAngle = `${progress * 21}deg`;
          setTransform("orbit", orbit, `rotate(${orbitAngle}) scaleY(.75)`);
          setTransform("orbit-small", orbitSmall, `rotate(calc(${orbitAngle} * -1))`);
          setTransform("progress", progressBar, `scaleX(${progress / (story.length - 1)})`);
          root.current.dataset.storyProgress = (progress / (story.length - 1)).toFixed(4);
          story.forEach((_, i) => {
            const distance = clamp((i - progress) / config.artWindow, -1, 1);
            // The room's evidence travels vertically as a solid strip. Text stays
            // in native document flow instead of fading between compositions.
            setStyle(scene, `--scene-${i}-y`, embedded ? `${(i - base - blend) * 100}%` : `${distance * 85}px`);
            if (!embedded) {
              setStyle(scene, `--scene-${i}-opacity`, `${1 - Math.abs(distance)}`);
              setStyle(scene, `--scene-${i}-rotate`, `${distance * (i === 2 || i === 3 || i === 4 ? 2.5 : 7)}deg`);
              setStyle(scene, `--scene-${i}-scale`, `${1 - Math.abs(distance) * .07}`);
            }
          });
        }
      }
      const p = pointer.current;
      const dt = previousTime === null ? 1 / 60 : Math.min((time - previousTime) / 1000, 1 / 30);
      previousTime = time;
      const alpha = 1 - Math.pow(1 - config.pointerEase, dt * 60);
      p.x += (p.targetX - p.x) * alpha;
      p.y += (p.targetY - p.y) * alpha;
      const moving = Math.abs(p.targetX - p.x) > config.settleThreshold || Math.abs(p.targetY - p.y) > config.settleThreshold;
      if (!moving) { p.x = p.targetX; p.y = p.targetY; previousTime = null; }
      const nextPointer = `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
      if (publishedPointer !== nextPointer) {
        publishedPointer = nextPointer;
        scene.style.setProperty("--cursor-x", `${p.x.toFixed(3)}px`);
        scene.style.setProperty("--cursor-y", `${p.y.toFixed(3)}px`);
        scene.style.setProperty("--cursor-turn", `${(p.x * .1).toFixed(3)}deg`);
      }
      if (moving) schedule();
    }
    function schedule() { if (!disposed && frame === null && !document.hidden && enabled.matches && root.current?.dataset.active === "true") frame = requestAnimationFrame(render); }
    function updateProgress() { if (disposed) return; measurementsDirty = true; schedule(); }
    function refresh() { if (disposed) return; geometryDirty = true; updateProgress(); }
    function resize() { if (disposed) return; measureViewport(); refresh(); }
    function pause() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
      publishedPointer = "";
      centerPointer();
    }
    function visibility() { if (document.hidden) pause(); else refresh(); }
    function motionMode() { if (!enabled.matches) pause(); else refresh(); }
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (scrollRoot) observer?.observe(scrollRoot);
    if (root.current) observer?.observe(root.current);
    beats.current.forEach(beat => { if (beat) observer?.observe(beat); });
    kick.current = schedule;
    resize();
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    scrollTarget.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    enabled.addEventListener("change", motionMode);
    return () => {
      disposed = true;
      kick.current = null;
      pause();
      observer?.disconnect();
      scrollTarget.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      enabled.removeEventListener("change", motionMode);
    };
  }, [embedded, isActive, scrollRoot]);

  function resetPointer() { pointer.current.targetX = 0; pointer.current.targetY = 0; kick.current?.(); }

  return <section id="work" className={`${styles.world} ${embedded ? styles.embedded : ""}`} data-embedded={embedded} data-active={isActive} ref={root} aria-label="Sameer Jain's featured MRI research" onPointerLeave={resetPointer} onPointerMove={(event) => {
    if (!isActive || event.pointerType !== "mouse") return;
    pointerMedia.current ??= window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!pointerMedia.current.matches) return;
    const view = viewport.current;
    if (!view.width || !view.height) return;
    pointer.current.targetX = (clamp((event.clientX - view.left) / view.width) - .5) * config.pointerRange;
    pointer.current.targetY = (clamp((event.clientY - view.top) / view.height) - .5) * config.pointerRange;
    kick.current?.();
  }}>
    <noscript><style>{`.${styles.stage}{display:none!important}.${styles.beat}{background:var(--beat-ground)!important;color:var(--beat-ink)!important;display:block!important;min-height:0!important;padding-block:${embedded ? "92px 60px" : "50px"}!important}.${styles.copy}{width:auto!important;margin-left:0!important;max-width:760px}.${styles.inlineArt}{display:block!important;max-width:800px}.${styles.copy},.${styles.inlineArt}{opacity:1!important;translate:none!important;scale:none!important;rotate:none!important}.${styles.track}{grid-area:auto!important}`}</style></noscript>
    <div className={styles.stage} ref={stage} data-room-surface data-surface-positioned role="group" aria-label="Recorded MRI research figures">
      <div className={styles.orbit} data-mri-orbit="primary" aria-hidden="true" /><div className={styles.orbitSmall} data-mri-orbit="secondary" aria-hidden="true" />
      {story.map((beat, index) => <div key={beat.id} data-mri-evidence={index} className={`${styles.scene} ${styles[`scene${index}`]}`} aria-hidden={index !== active} style={embedded ? { transform: `translateY(var(--scene-${index}-y, ${index * 100}%))` } : { opacity: `var(--scene-${index}-opacity, ${index === 0 ? 1 : 0})`, transform: `translateY(var(--scene-${index}-y, 0px)) rotate(var(--scene-${index}-rotate, 0deg)) scale(var(--scene-${index}-scale, 1))` }}><SceneArt index={index} /></div>)}
      <div className={styles.worldMark} aria-hidden="true"><span>{story[active].word}</span><span className={styles.worldProgress}><span data-mri-progress-bar /></span><span>{String(active + 1).padStart(2, "0")} / 06</span></div>
    </div>
    <div className={styles.track}>{story.map((beat, index) => <article key={beat.id} data-world-beat={index} data-scene={beat.id} data-room-surface data-surface-flow ref={(element) => { beats.current[index] = element; }} className={`${styles.beat} ${styles[`beat${index}`]}`} style={{ "--beat-ground": beat.ground, "--beat-ink": beat.ink } as CSSProperties}>
      <div className={styles.copy} data-mri-copy data-scroll-reveal={embedded ? undefined : "copy"}>
        <p className={styles.label}>{beat.label}</p>
        {index === 0 ? <h1 data-room-heading tabIndex={-1}><span>{beat.title[0]}</span><span>{beat.title[1]}</span></h1> : <h2><span>{beat.title[0]}</span><span>{beat.title[1]}</span></h2>}
        <p className={styles.body}>{beat.body}</p>
        <p className={styles.finding}>{beat.finding}</p>
        <p className={styles.note}>{beat.note}</p>
        {index === 0 ? <div className={styles.heroActions}><Link href="/projects/brain-tumor-mri-classification">Explore the project <span aria-hidden="true">↗</span></Link><span>Scroll to look closer ↓</span></div> : index === story.length - 1 ? <Link className={styles.finalAction} href="/projects/brain-tumor-mri-classification">Inside the MRI project <span aria-hidden="true">↗</span></Link> : <a className={styles.source} href={imageRoot + beat.figure} target="_blank" rel="noopener noreferrer">Open original figure ↗</a>}
      </div>
      <figure className={styles.inlineArt} data-scroll-reveal={embedded ? undefined : "figure"} ref={index === 0 ? firstArt : undefined}><SceneArt index={index} mobile /><figcaption>{beat.caption}</figcaption></figure>
    </article>)}</div>
    <p className={styles.integrity}>A visual journey through saved research artifacts. No live medical inference.</p>
  </section>;
}
