"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import results from "@/public/projects/brain-tumor-mri/results/metrics.json";
import { useAmbientMotion } from "@/lib/useAmbientMotion";
import styles from "./MriScrollJourney.module.css";

const imageRoot = "/projects/brain-tumor-mri/images/";
const chapters = [
  { name: "The image", title: ["Inside", "the scan."], body: "Brain tumor MRI research. A journey from images to learned representations, and the questions a result leaves open.", finding: "6,056 available images. Three source classes.", note: "Scroll to follow one published image through a schematic of the method.", figure: "cluster_2_samples.png" },
  { name: "Extract features", title: ["More than", "pixels."], body: "ResNet50, pretrained on ImageNet, describes each image with 2,048 visual features after average pooling.", finding: "An image becomes a representation.", note: "These unfolding plates illustrate feature extraction. They are not measured feature maps.", figure: "cluster_0_samples.png" },
  { name: "Group images", title: ["Keep the", "identity."], body: "Features are grouped by image ID. The recorded clustering run contains 603 grouped scans, with 201 from each source class.", finding: "603 grouped scans enter the experiment.", note: "Grouping defines the unit of analysis before clustering begins.", figure: "cluster_1_samples.png" },
  { name: "Find clusters", title: ["Let patterns", "gather."], body: "K-Means organizes the representations into three clusters. Source labels are held aside for comparison with the resulting groups.", finding: "Three clusters. Then an evaluation.", note: "The moving objects are a schematic, not measured embeddings or patient-level predictions.", figure: "cluster_vs_true_label_confusion_matrix.png" },
  { name: "Read the result", title: ["A perfect fit.", "An open question."], body: "The saved evaluation aligns all three clusters with the source classes on this curated dataset, after fixing a label-variable collision.", finding: "Adjusted Rand index 1.000 · purity 1.000",
    note: "Stability across seeds and generalization to new scanners remain untested.", figure: "cluster_vs_true_label_confusion_matrix.png" },
] as const;

const featureSlots = Array.from({ length: 12 }, (_, i) => ({ x: (i % 4) * 19, y: Math.floor(i / 4) * 22 }));
const forest = results.supervisedModels.find(model => model.name.startsWith("Random Forest"))!;

function Scan({ className = "" }: { className?: string }) {
  return <div className={`${styles.scanCrop} ${className}`}><Image src={imageRoot + "cluster_2_samples.png"} width={2250} height={480} alt="A crop of a published Glioma MRI example" sizes="(min-width: 900px) 190vw, 320vw" /></div>;
}

/** One persistent image and a reversible native-scroll timeline, inside the MRI room. */
export default function MriScrollJourney({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(active);
  const pointerTo = useRef<{ x: ReturnType<typeof gsap.quickTo>; y: ReturnType<typeof gsap.quickTo> } | null>(null);
  activeRef.current = active;
  useAmbientMotion(active, scrollRoot, stage);

  useEffect(() => {
    const section = root.current;
    const journey = track.current;
    const view = stage.current;
    if (!section || !journey || !view || !scrollRoot) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let disposed = false;
    let resizeFrame = 0;
    const motionQuery = "(prefers-reduced-motion: no-preference) and (min-height: 600px)";
    const buildJourney = () => {
      section.dataset.journeyEnhanced = "true";
      const scan = view.querySelector<HTMLElement>("[data-travel-scan]")!;
      const camera = view.querySelector<HTMLElement>("[data-mri-camera]")!;
      const plates = Array.from(view.querySelectorAll<HTMLElement>("[data-feature-plate]"));
      const groups = Array.from(view.querySelectorAll<HTMLElement>("[data-cluster-group]"));
      const result = view.querySelector<HTMLElement>("[data-result-figure]")!;
      const copies = Array.from(view.querySelectorAll<HTMLElement>("[data-mri-chapter]"));
      const arch = view.querySelector<HTMLElement>("[data-mri-architecture]")!;
      const progressLine = view.querySelector<HTMLElement>("[data-mri-progress]")!;
      const counter = view.querySelector<HTMLElement>("[data-mri-current]")!;
      let selected = -1;
      // Visited rooms stay mounted with display:none. Media changes there must
      // not author zero-sized destinations that survive the next room visit.
      const width = () => view.clientWidth || scrollRoot.clientWidth || window.innerWidth;
      const height = () => view.clientHeight || scrollRoot.clientHeight || window.innerHeight;
      const phone = () => width() < 760;
      // All destinations are relative to the same scan: the source never gets replaced.
      const scanStops = () => phone()
        ? [{ x: 0, y: 0, scale: 1, rotation: -8 }, { x: -width() * .17, y: 4, scale: .72, rotation: -17 }, { x: -width() * .24, y: height() * .04, scale: .48, rotation: 10 }, { x: -width() * .24, y: height() * .04, scale: .38, rotation: -10 }, { x: -width() * .29, y: height() * .065, scale: .29, rotation: -12 }]
        : [{ x: 0, y: 0, scale: 1, rotation: -8 }, { x: -width() * .4, y: 0, scale: .8, rotation: -16 }, { x: -width() * .08, y: height() * .28, scale: .4, rotation: 9 }, { x: -width() * .6, y: height() * .31, scale: .32, rotation: -12 }, { x: width() * .16, y: height() * .28, scale: .3, rotation: 8 }];
      const stops = scanStops();
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
      gsap.set(scan, stops[0]);
      gsap.set(plates, { scale: 0, rotation: -35, x: 0, y: 0 });
      gsap.set(groups, { scale: .1, autoAlpha: 0, rotation: -30 });
      gsap.set(result, { scale: .28, rotation: 16, autoAlpha: 0, yPercent: 70 });
      gsap.set(copies, { yPercent: 115, autoAlpha: 0 });
      gsap.set(copies[0], { yPercent: 0, autoAlpha: 1 });
      // Each unit contains a reading interval followed by a substantial composition change.
      for (let i = 1; i < chapters.length; i++) {
        const at = i - .72;
        tl.to(scan, { ...stops[i], duration: .65 }, at);
        tl.to(copies[i - 1], { yPercent: -70, autoAlpha: 0, duration: .28 }, at);
        tl.fromTo(copies[i], { yPercent: 115, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .4 }, at + .27);
      }
      tl.to(arch, { rotation: 100, scale: 1.5, duration: 4, ease: "none" }, 0);
      tl.to(view, { backgroundColor: "#c2dce8", color: "#142756", duration: .52 }, .3);
      tl.to(view, { backgroundColor: "#f2ef9b", color: "#142756", duration: .52 }, 1.3);
      tl.to(view, { backgroundColor: "#ffad8f", color: "#142756", duration: .52 }, 2.3);
      tl.to(view, { backgroundColor: "#bcd8ce", color: "#142756", duration: .52 }, 3.3);
      plates.forEach((plate, i) => {
        tl.to(plate, { scale: 1, x: () => phone() ? 15 + (i % 4) * 20 : 30 + (i % 4) * 42,
          y: () => phone() ? -38 + Math.floor(i / 4) * 28 : -100 + Math.floor(i / 4) * 55,
          rotation: (i % 4 - 1.5) * 8, duration: .48 }, .35 + i * .014);
        tl.to(plate, { x: () => phone() ? 30 + (i % 3) * 55 : 120 + (i % 3) * 95,
          y: () => phone() ? -28 + Math.floor(i / 3) * 25 : -65 + Math.floor(i / 3) * 39,
          scale: () => phone() ? .5 : .8, rotation: 0, duration: .55 }, 1.3 + i * .008);
        tl.to(plate, { scale: 0, duration: .44 }, 2.35 + i * .012);
      });
      groups.forEach((group, i) => {
        tl.to(group, { scale: 1, autoAlpha: 1, rotation: 0, duration: .55 }, 2.36 + i * .08);
        tl.to(group, { scale: .25, xPercent: 160 - i * 100, autoAlpha: 0, duration: .5 }, 3.3 + i * .04);
      });
      tl.to(result, { scale: 1, rotation: -3, autoAlpha: 1, yPercent: 0, duration: .65 }, 3.33);
      tl.to(progressLine, { scaleX: 1, duration: 4, ease: "none" }, 0);
      const paintChapter = () => {
        const time = tl.time();
        const current = Math.min(4, Math.max(0, Math.floor(time + .45)));
        section.dataset.journeyProgress = (time / 4).toFixed(4);
        section.dataset.journeyChapter = String(current);
        if (current !== selected) {
          selected = current;
          copies.forEach(copy => {
            copy.inert = true;
            copy.setAttribute("aria-hidden", "true");
          });
          counter.textContent = `${String(current + 1).padStart(2, "0")} / 05 · ${chapters[current].name}`;
        }
      };
      tl.eventCallback("onUpdate", paintChapter);
      paintChapter();
      const ownedTrigger = ScrollTrigger.create({
        trigger: journey, scroller: scrollRoot, animation: tl, start: "top top",
        end: () => `+=${Math.max(1, journey.offsetHeight - scrollRoot.clientHeight)}`,
        scrub: .28, invalidateOnRefresh: true, onRefresh: paintChapter,
      });
      trigger.current = ownedTrigger;
      tl.progress(ownedTrigger.progress);
      if (!activeRef.current) ownedTrigger.disable(false);
      pointerTo.current = { x: gsap.quickTo(camera, "x", { duration: .65, ease: "power3.out" }), y: gsap.quickTo(camera, "y", { duration: .65, ease: "power3.out" }) };
      return () => {
        pointerTo.current = null;
        trigger.current = null;
        ownedTrigger.kill();
        tl.kill();
        delete section.dataset.journeyEnhanced;
        copies.forEach(copy => { copy.inert = false; copy.removeAttribute("aria-hidden"); });
      };
    };
    media.add(motionQuery, buildJourney, section);
    let lastWidth = scrollRoot.clientWidth;
    let lastHeight = scrollRoot.clientHeight;
    const refresh = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (disposed || !scrollRoot.clientWidth || !scrollRoot.clientHeight) return;
        // Recreate responsive geometry only after a real viewport change, never a room/map toggle.
        if (lastWidth !== scrollRoot.clientWidth || lastHeight !== scrollRoot.clientHeight) {
          lastWidth = scrollRoot.clientWidth;
          lastHeight = scrollRoot.clientHeight;
          media.revert();
          media.add(motionQuery, buildJourney, section);
        }
        trigger.current?.refresh();
      });
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(scrollRoot);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    const visibility = () => {
      if (document.hidden) { trigger.current?.disable(false); pointerTo.current?.x.tween.pause(); pointerTo.current?.y.tween.pause(); }
      else if (activeRef.current) { trigger.current?.enable(false, false); trigger.current?.refresh(); }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      media.revert();
    };
  }, [scrollRoot]);

  useEffect(() => {
    if (active && !document.hidden) { trigger.current?.enable(false, false); trigger.current?.refresh(); }
    else {
      trigger.current?.disable(false);
      pointerTo.current?.x.tween.pause(); pointerTo.current?.y.tween.pause();
    }
  }, [active, scrollRoot]);

  return <section ref={root} className={styles.room} aria-label="Brain tumor MRI research journey" data-mri-journey>
    <div className={styles.transcript}><h1>Brain tumor MRI research: inside the scan</h1><ol>{chapters.map(chapter => <li key={chapter.name}><h2>{chapter.name}</h2><p>{chapter.body} {chapter.finding} {chapter.note}</p></li>)}</ol></div>
    <div ref={track} className={styles.track} data-mri-track>
      <div ref={stage} className={styles.stage} data-mri-stage data-room-surface data-surface-positioned data-room-heading tabIndex={-1} aria-label="Brain tumor MRI research. Scroll through the image, features, groups, and results."
        onPointerMove={event => {
          if (!active || event.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          const box = event.currentTarget.getBoundingClientRect();
          pointerTo.current?.x((event.clientX / box.width - .5) * 12);
          pointerTo.current?.y(((event.clientY - box.top) / box.height - .5) * 9);
        }} onPointerLeave={() => { pointerTo.current?.x(0); pointerTo.current?.y(0); }}>
        <div className={styles.art} aria-hidden="true" data-mri-camera>
          <div className={styles.architecture} data-mri-architecture><i /><i /><i /></div>
          <div className={styles.features}>{featureSlots.map((slot, i) => <div key={i} data-feature-plate className={styles.featurePlate} style={{ "--tile-x": `${slot.x}%`, "--tile-y": `${slot.y}%`, "--tile-i": i } as CSSProperties}><span /><span /><span /><span /></div>)}</div>
          <div className={styles.scan} data-travel-scan><Scan /><div className={styles.scanLabel}><span>Glioma / published example</span><span>01</span></div><span className={styles.scanBeam} /></div>
          <div className={styles.groups}>{["A", "B", "C"].map((label, group) => <div className={styles.cluster} data-cluster-group key={label} style={{ "--group": group } as CSSProperties}><div className={styles.clusterHalo} /><span className={styles.clusterLabel}>Cluster {label}</span>{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ "--chip-x": `${Math.cos(i * 2.4) * (i ? 32 : 0)}%`, "--chip-y": `${Math.sin(i * 2.4) * (i ? 32 : 0)}%`, "--chip-turn": `${i * 13 - 30}deg` } as CSSProperties} />)}</div>)}</div>
          <figure className={styles.result} data-result-figure><Image src={imageRoot + "cluster_vs_true_label_confusion_matrix.png"} width={960} height={720} sizes="(min-width: 760px) 45vw, 70vw" alt="Recorded K-Means cluster-to-label alignment" /><figcaption>The recorded result / 603 grouped scans</figcaption></figure>
        </div>
        <div className={styles.copyMask}>{chapters.map((chapter, i) => <article className={`${styles.chapter} ${styles[`chapter${i}`]}`} data-mri-chapter={i} key={chapter.name}>
          <span className={styles.chapterName}>{chapter.name}</span>
          {i === 0 ? <h1>{chapter.title.map(line => <span key={line}>{line}</span>)}</h1> : <h2>{chapter.title.map(line => <span key={line}>{line}</span>)}</h2>}
          <p className={styles.body}>{chapter.body}</p><p className={styles.finding}>{chapter.finding}</p><p className={styles.note}>{chapter.note}</p>
          {i === 0 && <span className={styles.scrollCue}>Scroll into the research <span aria-hidden="true">↓</span></span>}
          <figure className={styles.fallbackFigure}><Image src={imageRoot + chapter.figure} width={960} height={i < 3 ? 205 : 720} sizes="90vw" alt={i < 3 ? "Published MRI contact sheet" : "Recorded cluster-to-label alignment"} /><figcaption>{i < 3 ? "Published source images" : "The saved evaluation"}</figcaption></figure>
        </article>)}</div>
        <div className={styles.sequenceIndex} aria-hidden="true"><span data-mri-current>01 / 05 · The image</span><span className={styles.progressTrack}><i data-mri-progress /></span><span>Follow the image</span></div>
      </div>
    </div>
    <section className={styles.evidence} data-room-surface aria-labelledby="mri-evidence-title">
      <div className={styles.evidenceIntro}><p>The rest of the experiment</p><h2 id="mri-evidence-title">Keep the<br />questions visible.</h2><p>Clustering is one branch. These separate experiments test different questions, with different limitations.</p></div>
      <article className={styles.experiment}>
        <div><span>Supervised classification</span><h3>{(forest.accuracy * 100).toFixed(2)}%</h3><p>Exploratory test accuracy from a 900-tree Random Forest, following pixel features and PCA.</p><p className={styles.limit}>PCA was fitted before splitting, and model choices were tuned on test results. Leakage and selection limit this score. The loading loop used 6,012 of 6,056 images, omitting 44.</p></div>
        <figure><Image src={imageRoot + "rf_confusion_matrix.png"} width={547} height={432} sizes="(min-width: 760px) 43vw, 80vw" alt="Recorded Random Forest confusion matrix" /><figcaption>Weighted F1 {(forest.f1Weighted).toFixed(4)} <a href={imageRoot + "rf_confusion_matrix.png"} target="_blank" rel="noopener noreferrer">Open original figure</a></figcaption></figure>
      </article>
      <article className={`${styles.experiment} ${styles.anomaly}`}>
        <div><span>Binary anomaly detection</span><h3>50%</h3><p>Accuracy after separating training data from held-out Glioma scans. An autoencoder and Mahalanobis distance met a harder test.</p><p className={styles.limit}>4,452 evaluation images. This binary anomaly task differs from the three-class experiments above. A weaker result is still part of the research.</p></div>
        <figure><Image src={imageRoot + "anomaly_confusion_matrix.png"} width={960} height={720} sizes="(min-width: 760px) 43vw, 80vw" alt="Saved anomaly detection confusion matrix" /><figcaption>Held-out evaluation <a href={imageRoot + "anomaly_confusion_matrix.png"} target="_blank" rel="noopener noreferrer">Open original figure</a></figcaption></figure>
      </article>
      <footer className={styles.ending}><p>The methods, collaborators,<br />code, and unfinished questions.</p><Link href="/projects/brain-tumor-mri-classification">Explore the complete MRI project <span aria-hidden="true">↗</span></Link><span>Saved research artifacts. No live medical inference.</span></footer>
    </section>
  </section>;
}
