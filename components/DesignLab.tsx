"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import MriShowcase from "@/components/MriShowcase";
import MriResearchStory from "@/components/MriResearchStory";
import metrics from "@/public/projects/brain-tumor-mri/results/metrics.json";
import styles from "./DesignLab.module.css";

type Direction = "lab" | "atlas" | "story";
const directions = [
  { id: "lab" as const, letter: "A", name: "Data Lab", format: "A data science workspace", summary: "A quiet introduction, one working research explorer, and quick access to the engineering detail.", try: "Switch from images to feature groups to the classifier. Every view uses a recorded project artifact.", fit: "Best for a data science and ML portfolio. Clear, technical, and easy to inspect." },
  { id: "atlas" as const, letter: "B", name: "Visual Atlas", format: "An image-led gallery", summary: "A minimal dark gallery that lets the MRI imagery carry the first impression.", try: "Choose a cluster, browse its five published examples, then reveal the actual evaluation figure.", fit: "Best for visual impact. The sample explorer can also be used inside direction A." },
  { id: "story" as const, letter: "C", name: "Research in Motion", format: "A guided visual story", summary: "A restrained case study with an evidence panel that follows the research as you scroll.", try: "Scroll through the three chapters or select one directly. The corresponding figure stays beside the story.", fit: "Best for explaining how you think. Strong for a recruiter who wants the narrative quickly." },
];
const groups = [
  { index: 0, label: "Menin", file: "cluster_0_samples.png" },
  { index: 1, label: "Tumor", file: "cluster_1_samples.png" },
  { index: 2, label: "Glioma", file: "cluster_2_samples.png" },
];
const imageRoot = "/projects/brain-tumor-mri/images/";
// Left edges of the five real image panels in each 2250px published contact sheet.
const sampleOffsets = [41, 486, 932, 1377, 1823];
const caseStudy = "/projects/brain-tumor-mri-classification";


function PrototypeNav({ dark = false }: { dark?: boolean }) {
  return <div className={`${styles.prototypeNav} ${dark ? styles.darkNav : ""}`}><strong>Sameer Jain<span>Data science &amp; machine learning</span></strong><div><a href={caseStudy}>Featured work ↗</a><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé ↗</a></div></div>;
}

function WorkspacePreview() {
  return <div className={styles.workspace}>
    <PrototypeNav />
    <div className={styles.workspaceIntro}><h2>Asking questions<br />with data.</h2><p>Georgia Tech Industrial Engineering.<br />Data science, statistics, and machine learning.</p></div>
    <MriShowcase />
    <div className={styles.supportingWork}><span>Also exploring</span><Link href="/projects/systematic-etf-research">Systematic ETF research <span aria-hidden="true">↗</span></Link><span>Supporting project</span></div>
  </div>;
}

function AtlasPreview() {
  const [group, setGroup] = useState(0);
  const [sample, setSample] = useState(0);
  const [evaluation, setEvaluation] = useState(false);
  const [animate, setAnimate] = useState(false);
  const selected = groups[group];
  return <div className={styles.atlas}>
    <PrototypeNav dark />
    <div className={styles.atlasHeading}><div><span className={styles.context}>Brain tumor MRI / Selected research</span><h2>Look closer.</h2></div><p>One collection. Three learned groups.<br />Explore the images behind the result.</p></div>
    <div className={styles.atlasBody}>
      <div className={styles.atlasViewer}>
        <div className={styles.viewerLabel}><span>{evaluation ? "Clustering evaluation" : `Published examples / ${selected.label}`}</span><span>{evaluation ? "Recorded result" : `${sample + 1} / 5`}</span></div>
        {evaluation ? <div className={styles.matrixCanvas}><Image src={`${imageRoot}cluster_vs_true_label_confusion_matrix.png`} alt="Recorded cluster-to-label alignment with 201 grouped scans per source class, ARI and purity of 1.000" width={960} height={720} sizes="(min-width: 900px) 55vw, 90vw" /></div> :
          <div className={styles.sampleCrop} data-animate={animate}><Image src={imageRoot + selected.file} alt={`Visual crop of published ${selected.label} example ${sample + 1} from cluster ${selected.index}`} width={2250} height={480} style={{ transform: `translateX(-${sampleOffsets[sample] / 2250 * 100}%)` }} sizes="(min-width: 900px) 300vw, 500vw" /></div>}
        {!evaluation && <div className={styles.sampleButtons} role="group" aria-label="Choose a published example">{[0, 1, 2, 3, 4].map((index) => <button type="button" key={index} aria-pressed={sample === index} onClick={(event) => { setAnimate(event.detail > 0); setSample(index); }}>Example {index + 1}</button>)}</div>}
        <div className={styles.atlasCaption}><span>{evaluation ? "All 603 grouped scans, evaluated against source labels." : "A visual crop of a saved contact sheet. These are separate examples."}</span><a href={imageRoot + (evaluation ? "cluster_vs_true_label_confusion_matrix.png" : selected.file)} target="_blank" rel="noopener noreferrer">Open original ↗</a></div>
      </div>
      <div className={styles.atlasInspector}>
        <h3>Browse a learned group.</h3><div className={styles.groupButtons} role="group" aria-label="Choose MRI cluster">{groups.map((item, index) => <button type="button" key={item.index} aria-pressed={group === index} onClick={() => { setGroup(index); setSample(0); setAnimate(false); }}><span>Cluster {item.index}<strong>{item.label}</strong></span><span>{metrics.kmeans.clusterSizes[index]} scans</span></button>)}</div>
        <p>ResNet50 features → grouped vectors → K-Means. The label names show the alignment measured after clustering.</p>
        <button className={styles.evaluationButton} type="button" aria-pressed={evaluation} onClick={() => setEvaluation(!evaluation)}>{evaluation ? "Return to the images" : "Show the evaluation"}<span aria-hidden="true">↗</span></button>
        <p className={styles.atlasScope}>Published research examples. Selecting an image browses a saved figure. No new scan is classified.</p>
        <Link className={styles.atlasCaseLink} href={caseStudy}>Read the full research ↗</Link>
      </div>
    </div>
  </div>;
}

function StoryPreview({ motion }: { motion: boolean }) {
  return <div className={styles.story}><PrototypeNav /><MriResearchStory motion={motion} preview /></div>;
}

export default function DesignLab({ initialDirection = "story" }: { initialDirection?: Direction }) {
  const [active, setActive] = useState<Direction>(initialDirection);
  const [motion, setMotion] = useState(true);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = directions.find((direction) => direction.id === active)!;
  function chooseDirection(direction: Direction) {
    setActive(direction);
    const url = new URL(window.location.href);
    url.searchParams.set("view", direction);
    window.history.replaceState(null, "", url);
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % directions.length : event.key === "ArrowLeft" ? (index + directions.length - 1) % directions.length : event.key === "Home" ? 0 : event.key === "End" ? directions.length - 1 : null;
    if (next !== null) { event.preventDefault(); chooseDirection(directions[next].id); tabs.current[next]?.focus(); }
  }
  return <div className={styles.page} data-design-lab data-motion={motion ? "on" : "off"}>
    <header className={styles.labHeader}><Link href="/">← Current portfolio</Link><span>Sameer Jain / Design previews</span><button type="button" aria-pressed={motion} onClick={() => setMotion(!motion)}>Motion {motion ? "on" : "off"}</button></header>
    <div className={styles.labIntro}><h1>Portfolio directions.</h1><p>C is now your main portfolio direction. The other working previews remain here if you want to compare individual interactions.</p></div>
    <div className={styles.directionTabs} role="tablist" aria-label="Portfolio design direction">{directions.map((direction, index) => <button key={direction.id} ref={(element) => { tabs.current[index] = element; }} id={`direction-${direction.id}`} type="button" role="tab" aria-selected={active === direction.id} aria-controls="direction-preview" tabIndex={active === direction.id ? 0 : -1} onKeyDown={(event) => tabKey(event, index)} onClick={() => chooseDirection(direction.id)}><span className={styles.letter}>{direction.letter}</span><span><strong>{direction.name}</strong><span>{direction.format}</span></span>{direction.id === "story" && <span className={styles.recommended}>Applied</span>}</button>)}</div>
    <div className={styles.previewBrief}><div><p>{selected.summary}</p><strong>Try it</strong><span>{selected.try}</span></div><div><p>{selected.fit}</p><a className={styles.previewLaunch} href="#direction-preview">Jump into the preview ↓</a></div></div>
    <section id="direction-preview" className={styles.preview} role="tabpanel" aria-labelledby={`direction-${active}`} tabIndex={0}>
      {active === "lab" ? <WorkspacePreview /> : active === "atlas" ? <AtlasPreview /> : <StoryPreview motion={motion} />}
    </section>
    <div className={styles.researchNotes}><div><h2>What informed these directions</h2><p>The useful pattern is clear engineering identity, a dominant project, and inspectable evidence. The examples below informed these prototypes. LinkedIn observations use public search excerpts; portfolio observations come from the linked public sites.</p></div>
      <ul>
        <li><a href="https://mustafaakilli.dev/" target="_blank" rel="noopener noreferrer">Mustafa Akilli ↗</a><span>Visual project walkthroughs, personal contributions, and direct source links.</span><a href="https://www.linkedin.com/posts/mustafaakilli_softwareengineering-computerscience-artificialintelligence-activity-7503814584378707968-i1IC" target="_blank" rel="noopener noreferrer">Public LinkedIn announcement ↗</a></li>
        <li><a href="https://juliezhu212.github.io/" target="_blank" rel="noopener noreferrer">Julie Zhu ↗</a><span>Direct ML engineering positioning, evaluation, and error analysis.</span><a href="https://www.linkedin.com/posts/julie-ai_julie-zhu-uc-berkeley-mids-genai-portfolio-activity-7452043166515351552-BfjA" target="_blank" rel="noopener noreferrer">Public LinkedIn announcement ↗</a></li>
        <li><a href="https://www.sh-reya.com/blog/ai-qual-analysis/" target="_blank" rel="noopener noreferrer">Shreya Shankar ↗</a><span>Experiment selectors and access to the evidence behind an explanation.</span></li>
        <li><a href="https://poloclub.github.io/cnn-explainer/" target="_blank" rel="noopener noreferrer">CNN Explainer ↗</a><span>Progressive inspection of a vision system, from overview to selected stages.</span></li>
        <li><a href="https://research.google/" target="_blank" rel="noopener noreferrer">Google Research ↗</a><span>One dominant visual research story and restrained supporting navigation.</span></li>
        <li><a href="https://colah.github.io/" target="_blank" rel="noopener noreferrer">Chris Olah ↗</a><span>An image-led research index organized by subject and depth.</span></li>
      </ul>
    </div>
    <footer className={styles.labFooter}><span>A / Workspace · B / Atlas · C / Guided story</span><p>Research in Motion is applied to your main portfolio. These previews keep the other directions available for comparison.</p><Link href="/">Back to your portfolio ↗</Link></footer>
  </div>;
}
