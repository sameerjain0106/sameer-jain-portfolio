"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { rooms } from "@/data/spatialRooms";
import results from "@/public/projects/brain-tumor-mri/results/metrics.json";
import MriExplorerFrame from "./MriExplorerFrame";
import PerceptionShowcase, { mix, readableInk } from "./PerceptionShowcase";
import MriPipeline from "./MriPipeline";
import styles from "./MriScrollJourney.module.css";

const entryInk = "#102f3b";

/** The original vertical research story, followed by its scroll-built method. */
export default function MriScrollJourney({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const journey = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const room = journey.current;
    if (!room || !scrollRoot) return;
    const explorer = room.querySelector("iframe");
    const heading = room.querySelector<HTMLElement>("#work h1");
    if (!explorer || !heading) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let dirty = true;
    let headingTop = 0;
    let viewportHeight = 0;
    let previousBlend = -1;
    let previousGround = "";
    let previousInk = "";
    let previousDocument: HTMLElement | null = null;

    function render() {
      frame = 0;
      if (dirty) {
        viewportHeight = scrollRoot!.clientHeight;
        headingTop = 0;
        for (let node: HTMLElement | null = heading; node && node !== scrollRoot; node = node.offsetParent as HTMLElement | null) {
          headingTop += node.offsetTop;
        }
        dirty = false;
      }
      if (!viewportHeight || document.hidden) return;

      const raw = (scrollRoot!.scrollTop + viewportHeight * .66 - headingTop) / (viewportHeight * .27);
      const progress = Math.min(1, Math.max(0, raw));
      const blend = reduced.matches ? Number(progress >= .5) : progress * progress * (3 - 2 * progress);
      const documentRoot = explorer!.contentDocument?.documentElement ?? null;
      if (blend === previousBlend && documentRoot === previousDocument) return;
      const ground = mix(rooms.mri.color, "#f2ef9b", blend);
      const ink = readableInk(ground, blend < .45 ? entryInk : "#173bd3");
      if (ground !== previousGround) room!.style.setProperty("--mri-entry-ground", ground);
      if (ink !== previousInk) room!.style.setProperty("--mri-entry-ink", ink);

      if (documentRoot && (ink !== previousInk || documentRoot !== previousDocument)) {
        documentRoot.style.setProperty("--mri-explorer-ink", ink);
        documentRoot.style.setProperty("--mri-explorer-muted", ink);
      }
      previousBlend = blend;
      previousGround = ground;
      previousInk = ink;
      previousDocument = documentRoot;
    }

    function schedule() { if (!frame) frame = requestAnimationFrame(render); }
    function refresh() { dirty = true; schedule(); }

    const resize = new ResizeObserver(refresh);
    resize.observe(room);
    resize.observe(scrollRoot);
    resize.observe(heading);
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    scrollRoot.addEventListener("spatial:entered", refresh);
    explorer.addEventListener("load", refresh);
    reduced.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", refresh);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      scrollRoot.removeEventListener("scroll", schedule);
      scrollRoot.removeEventListener("spatial:entered", refresh);
      explorer.removeEventListener("load", refresh);
      reduced.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [scrollRoot]);

  return <div ref={journey} className={styles.room} data-mri-journey data-story-axis="vertical"
    style={{ "--mri-entry-ground": rooms.mri.color, "--mri-entry-ink": entryInk } as CSSProperties}>
    <MriExplorerFrame active={active} scrollRoot={scrollRoot} />
    <PerceptionShowcase scrollRoot={scrollRoot} isActive={active} embedded />
    <MriPipeline active={active} scrollRoot={scrollRoot} />
    <section className={styles.methodNotes} data-project-methods="mri" data-room-surface aria-labelledby="mri-method-notes-title">
      <h2 id="mri-method-notes-title">Under the methods</h2>
      <dl>
        <div><dt>Pixel baseline</dt><dd>Each 512 × 512 grayscale image becomes 262,144 pixel features. PCA retains {results.pca.components.toLocaleString("en-US")} components and {(results.pca.explainedVarianceRatio * 100).toFixed(2)}% of variance. It was fitted before splitting, so the baseline remains exploratory.</dd></div>
        <div><dt>Transfer features</dt><dd>ImageNet-pretrained ResNet50 runs without its classification head. Global average pooling produces {results.kmeans.featureDim.toLocaleString("en-US")} features per image; batched extraction keeps memory use bounded.</dd></div>
        <div><dt>Anomaly rule</dt><dd>Glioma scans split into 1,604 training and 400 held-out images. Encoder features reduce to 100 PCA components; Mahalanobis distance is compared with the training-set 90th percentile, a recorded cutoff of {results.anomalyDetection.thresholdValue.toFixed(2)}.</dd></div>
      </dl>
    </section>
  </div>;
}
