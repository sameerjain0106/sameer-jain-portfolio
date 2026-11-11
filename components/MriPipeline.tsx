"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import Link from "next/link";
import results from "@/public/projects/brain-tumor-mri/results/metrics.json";
import styles from "./MriPipeline.module.css";

const steps = [
  { label: "Extract", title: "An image becomes a description.", detail: "ResNet50, pretrained on ImageNet, extracts visual features. Average pooling produces a 2,048-dimensional vector for each image.", note: "A representation of the image, before clustering." },
  { label: "Group", title: "Keep the image IDs together.", detail: "Features are grouped by image ID before the clustering step. The recorded run contains 603 grouped scans, with 201 from each source class.", note: "The grouping step defines what enters the next experiment." },
  { label: "Cluster", title: "Let three groups take shape.", detail: "K-Means organizes those representations into three clusters. Labels are reserved for comparing the resulting groups with the source classes.", note: "The motion here illustrates the method; these dots are not measured embeddings." },
  { label: "Evaluate", title: "Then ask what the groups mean.", detail: "The saved evaluation reports an adjusted Rand index of 1.000 and cluster purity of 1.000 on this curated dataset, after fixing a label-variable collision in the notebook.", note: "Stability across seeds and generalization to new scanners remain untested." },
] as const;

const dots = [
  [-27, -8], [-10, -25], [16, -21], [33, -1], [22, 24], [-4, 28], [-29, 17], [2, 2],
];
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** A schematic assembly driven only by the native room scroll position. */
export default function MriPipeline({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const section = root.current;
    const journey = track.current;
    if (!active || !scrollRoot || !section || !journey) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const chapters = Array.from(journey.querySelectorAll<HTMLElement>("[data-pipeline-step]"));
    const counter = section.querySelector<HTMLElement>("[data-pipeline-counter]");
    let frame = 0;
    let dirty = true;
    let disposed = false;
    let visible = true;
    let stops: number[] = [];
    let previousProgress = Number.NaN;
    let previousCurrent = -1;
    const published = new Map<string, string>();
    function setVisual(name: string, value: string) {
      if (published.get(name) === value) return;
      published.set(name, value);
      section!.style.setProperty(name, value);
    }

    function measure() {
      const viewportTop = scrollRoot!.getBoundingClientRect().top + scrollRoot!.clientTop;
      const anchor = scrollRoot!.clientHeight * .54;
      stops = chapters.map(node => node.getBoundingClientRect().top - viewportTop + scrollRoot!.scrollTop + node.offsetHeight * .4 - anchor);
      dirty = false;
    }

    function render() {
      frame = 0;
      if (disposed || document.hidden || !visible) return;
      if (dirty) measure();
      const scroll = scrollRoot!.scrollTop;
      // Each chapter resolves one assembly step; adjacent chapters interpolate in reverse too.
      let progress = 0;
      const lead = Math.max(120, scrollRoot!.clientHeight * .32);
      const boundaries = [stops[0] - lead, ...stops];
      for (let i = 0; i < steps.length; i++) {
        progress += clamp((scroll - boundaries[i]) / Math.max(1, boundaries[i + 1] - boundaries[i]));
      }
      if (motion.matches) progress = steps.length;
      if (progress === previousProgress) return;
      previousProgress = progress;
      const amounts = steps.map((_, i) => clamp(progress - i));
      const [features, groups, clusters, evaluation] = amounts;
      setVisual("--pipeline-features", String(features));
      setVisual("--pipeline-groups", String(groups));
      setVisual("--pipeline-clusters", String(clusters));
      setVisual("--pipeline-evaluation", String(evaluation));
      setVisual("--pipeline-source-x", `${(1 - features) * 115}px`);
      setVisual("--pipeline-source-y", `${(1 - features) * 90}px`);
      setVisual("--pipeline-source-scale", String(1.75 - features * .75));
      setVisual("--pipeline-source-turn", `${(1 - features) * -7}deg`);
      section!.dataset.pipelineProgress = (progress / steps.length).toFixed(4);
      const current = Math.max(0, Math.min(steps.length - 1, Math.round(progress) - 1));
      if (current !== previousCurrent) {
        previousCurrent = current;
        chapters.forEach((node, index) => { node.dataset.pipelineCurrent = String(index === current); });
        if (counter) counter.textContent = `${String(current + 1).padStart(2, "0")} / 04`;
      }
    }

    function schedule() { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render); }
    function refresh() { dirty = true; schedule(); }
    function changeMotion() { section!.dataset.pipelineEnhanced = String(!motion.matches); refresh(); }
    function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else refresh(); }
    const inView = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) refresh(); else { cancelAnimationFrame(frame); frame = 0; }
    }, { root: scrollRoot, rootMargin: "150px 0px" });
    const resize = new ResizeObserver(refresh);
    resize.observe(scrollRoot);
    resize.observe(journey);
    chapters.forEach(node => resize.observe(node));
    inView.observe(section);
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", changeMotion);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    changeMotion();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      inView.disconnect();
      resize.disconnect();
      scrollRoot.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", changeMotion);
    };
  }, [active, scrollRoot]);

  return <section ref={root} className={styles.chapter} data-mri-pipeline data-room-surface data-surface-positioned aria-labelledby={`${id}-title`}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>Inside one experiment / The clustering branch</p>
      <h2 id={`${id}-title`}>Build the<br /><span>pathway.</span></h2>
      <div className={styles.introAside}><p>Follow an MRI image from pixels to a representation, a group, and a result worth questioning.</p><span>Scroll to assemble the process <span aria-hidden="true">↓</span></span></div>
    </header>

    <div ref={track} className={styles.journey}>
      <figure className={styles.board} aria-label="Schematic assembly of the MRI clustering pipeline">
        <div className={styles.boardTop}><span>Image → representation → structure</span><span data-pipeline-counter>04 / 04</span></div>
        <svg className={styles.machine} viewBox="0 0 620 550" fill="none" aria-hidden="true">
          <defs><clipPath id={`${id}-scan`}><rect x="47" y="48" width="142" height="142" rx="3" /></clipPath></defs>
          <path className={styles.guide} d="M110 138C110 66 390 7 450 138S192 234 154 345S405 529 493 380" />
          <path className={`${styles.wire} ${styles.featureWire}`} pathLength="1" d="M190 128C245 128 244 112 286 112" />
          <path className={`${styles.wire} ${styles.groupWire}`} pathLength="1" d="M419 215C419 272 157 225 157 315" />
          <path className={`${styles.wire} ${styles.clusterWire}`} pathLength="1" d="M238 374C292 374 291 339 337 339" />
          <path className={`${styles.wire} ${styles.evaluateWire}`} pathLength="1" d="M473 412C473 454 372 446 372 478" />

          <g className={styles.source}>
            <rect x="35" y="36" width="166" height="196" rx="5" fill="#ff8066" transform="rotate(-9 118 134)" />
            <rect x="35" y="36" width="166" height="196" rx="5" fill="#f2ef9b" />
            <rect x="47" y="48" width="142" height="142" rx="3" fill="#080d17" />
            <g clipPath={`url(#${id}-scan)`}><image href="/projects/brain-tumor-mri/images/cluster_2_samples.png" x="31.9" y="20.4" width="827.7" height="176.6" /></g>
            <text x="47" y="214" className={styles.cardText} fill="#111b39">Published MRI example</text>
          </g>

          <g className={styles.features}>
            <path d="M292 68L546 44V206L292 230Z" fill="#111b39" opacity=".22" />
            <path d="M280 55L534 31V193L280 217Z" fill="#ff8066" />
            <path d="M268 42L522 18V180L268 204Z" fill="#f2ef9b" />
            <text x="290" y="65" className={styles.machineLabel} fill="#173bd3">ResNet50</text>
            <text x="290" y="88" className={styles.smallText} fill="#111b39">ImageNet → average pooling</text>
            {Array.from({ length: 16 }, (_, index) => <rect key={index} className={styles.featureBar} x={291 + index * 12} y={153 - (index * 17 % 46)} width="7" height={20 + index * 17 % 46} rx="3.5" fill="#173bd3" style={{ opacity: .48 + (index % 4) * .17 }} />)}
            <text x="290" y="184" className={styles.smallText} fill="#111b39">2,048 feature dimensions</text>
          </g>

          <g className={styles.groups}>
            <rect x="59" y="300" width="202" height="130" rx="8" fill="#111b39" opacity=".18" transform="rotate(-6 160 365)" />
            {[0, 1, 2].map(index => <g key={index} transform={`translate(${index * 9} ${index * -12})`}><rect x="48" y="306" width="194" height="116" rx="7" fill={index === 2 ? "#b9dace" : index === 1 ? "#ff8066" : "#f2ef9b"} stroke="#173bd3" strokeWidth="2" /></g>)}
            <text x="85" y="321" className={styles.machineLabel} fill="#173bd3">Group by ID</text>
            <path d="M85 342H216M85 354H180M85 366H199" stroke="#173bd3" strokeWidth="3" strokeLinecap="round" opacity=".45" />
            <text x="85" y="391" className={styles.smallText} fill="#111b39">{results.kmeans.groupedImageCount} grouped scans</text>
          </g>

          <g className={styles.clusters}>
            <text x="351" y="257" className={styles.machineLabel} fill="#f2ef9b">K-Means / k = 3</text>
            {[[365, 325], [486, 315], [435, 406]].map(([x, y], index) => <g key={index}>
              <circle className={styles.clusterRing} cx={x} cy={y} r="53" pathLength="1" stroke={index === 0 ? "#f2ef9b" : index === 1 ? "#ff8066" : "#b9dace"} strokeWidth="1.5" />
              {dots.map(([dx, dy], dotIndex) => <circle key={dotIndex} className={styles.clusterDot} cx={x + dx} cy={y + dy} r={dotIndex === 7 ? 7 : 4.5} fill={index === 0 ? "#f2ef9b" : index === 1 ? "#ff8066" : "#b9dace"} style={{ "--dot-x": `${dx * 2.5}px`, "--dot-y": `${dy * 2.5}px` } as CSSProperties} />)}
              <g className={styles.counts}><rect x={x - 24} y={y + 38} width="48" height="24" rx="12" fill={index === 0 ? "#f2ef9b" : index === 1 ? "#ff8066" : "#b9dace"} /><text x={x} y={y + 55} className={styles.smallText} textAnchor="middle" fill="#111b39">{results.kmeans.clusterSizes[index]}</text></g>
            </g>)}
          </g>

          <g className={styles.evaluation}>
            <rect x="100" y="474" width="425" height="55" rx="27.5" fill="#f2ef9b" />
            <circle cx="129" cy="502" r="14" fill="#173bd3" /><path d="m123 502 4 4 8-9" stroke="#f2ef9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="156" y="498" className={styles.smallText} fill="#111b39">Recorded label alignment</text>
            <text x="156" y="517" className={styles.resultText} fill="#173bd3">ARI {results.kmeans.adjustedRandIndex.toFixed(3)} · Purity {results.kmeans.clusterPurity.toFixed(3)}</text>
          </g>
        </svg>
        <figcaption>Schematic assembly. Feature bars and dot positions are illustrative.</figcaption>
      </figure>

      <ol className={styles.steps}>
        {steps.map((step, index) => <li key={step.label} className={styles.step} data-pipeline-step={index}>
          <div className={styles.stepLabel}><span>{String(index + 1).padStart(2, "0")}</span><span>{step.label}</span></div>
          <h3>{step.title}</h3><p>{step.detail}</p><p className={styles.stepNote}>{step.note}</p>
        </li>)}
      </ol>
    </div>
    <footer className={styles.ending}><p>A strong pattern in one dataset.<br /><strong>Still a question for the next one.</strong></p><Link href="/projects/brain-tumor-mri-classification" prefetch={false}>Read the methods &amp; limitations <span aria-hidden="true">↗</span></Link></footer>
  </section>;
}
