"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import metrics from "@/public/projects/brain-tumor-mri/results/metrics.json";
import styles from "./MriShowcase.module.css";

const imageRoot = "/projects/brain-tumor-mri/images";
const stages = [
  { label: "The images", short: "Images", number: "01" },
  { label: "Features & groups", short: "Groups", number: "02" },
  { label: "The classifier", short: "Classifier", number: "03" },
] as const;
const samples = [
  { file: "cluster_0_samples.png", label: "Menin", cluster: "0" },
  { file: "cluster_1_samples.png", label: "Tumor", cluster: "1" },
  { file: "cluster_2_samples.png", label: "Glioma", cluster: "2" },
];
const randomForest = metrics.supervisedModels.find((model) => model.name.startsWith("Random Forest"))!;

function Arrow({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function MriShowcase() {
  const instanceId = useId();
  const titleId = `${instanceId}-mri-title`;
  const panelId = `${instanceId}-mri-panel`;
  const [stage, setStage] = useState(0);
  const [motion, setMotion] = useState(false);

  function selectStage(index: number, pointerInitiated: boolean) {
    setMotion(pointerInitiated);
    setStage(index);
  }

  return (
    <section className={styles.showcase} aria-labelledby={titleId}>
      <div className={styles.topline}>
        <span className={styles.projectLabel}><span className={styles.projectDot} aria-hidden="true" /><strong>Brain tumor MRI</strong><span>/ Computer vision</span></span>
        <Link href="/projects/brain-tumor-mri-classification" className={styles.caseLink}>Read the case study <Arrow /></Link>
      </div>

      <div className={styles.stageControls} role="group" aria-label="Explore the MRI research">
        {stages.map((item, index) => (
          <button key={item.number} type="button" aria-pressed={stage === index} aria-controls={panelId} onClick={(event) => selectStage(index, event.detail > 0)}>
            <span className={styles.stageNumber}>{item.number}</span>
            <span className={styles.fullLabel}>{item.label}</span>
            <span className={styles.shortLabel}>{item.short}</span>
            <span className={styles.stageMarker} aria-hidden="true">{stage === index ? "−" : "+"}</span>
          </button>
        ))}
      </div>

      <div className={styles.panel} id={panelId} aria-labelledby={titleId}>
        <div className={styles.visual}>
          <div className={styles.visualTopline}>
            <span>Recorded notebook output</span>
            <span aria-hidden="true">{stages[stage].number} / 03</span>
          </div>
          <div key={stage} className={styles.figureStage} data-motion={motion}>
            {stage === 0 ? (
              <div className={styles.contactSheets}>
                {samples.map((sample) => (
                  <a key={sample.file} href={`${imageRoot}/${sample.file}`} target="_blank" rel="noopener noreferrer" className={styles.sampleSheet} aria-label={`Open full-size ${sample.label} sample contact sheet`}>
                    <Image src={`${imageRoot}/${sample.file}`} width={2250} height={480} alt={`Five ${sample.label} MRI examples from cluster ${sample.cluster}, a recorded sample sheet from the project`} sizes="(max-width: 760px) 100vw, 65vw" priority={sample.cluster === "0"} />
                    <span className={styles.openFigure} aria-hidden="true">Open {sample.label} samples ↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <a href={`${imageRoot}/${stage === 1 ? "cluster_vs_true_label_confusion_matrix.png" : "rf_confusion_matrix.png"}`} target="_blank" rel="noopener noreferrer" className={styles.plotLink} aria-label={`Open full-size ${stage === 1 ? "clustering evaluation" : "Random Forest confusion matrix"} figure`}>
                <Image
                  src={`${imageRoot}/${stage === 1 ? "cluster_vs_true_label_confusion_matrix.png" : "rf_confusion_matrix.png"}`}
                  width={stage === 1 ? 960 : 547}
                  height={stage === 1 ? 720 : 432}
                  alt={stage === 1
                    ? "K-Means clusters aligned to true labels. Each of Glioma, Menin and Tumor has 201 correctly aligned grouped scans and zero off-diagonal entries. ARI and purity are both 1.000."
                    : "Recorded Random Forest confusion matrix. True Glioma row 397, 89, 48. True Menin row 66, 279, 128. True Tumor row 23, 56, 417. Columns are predicted Glioma, Menin and Tumor."}
                  sizes="(max-width: 760px) 100vw, 65vw"
                />
                <span className={styles.openFigure} aria-hidden="true">Open recorded figure ↗</span>
              </a>
            )}
          </div>
          <div className={styles.visualFooter}>
            <span>{stage === 0 ? "Select a sample sheet to view full size ↗" : stage === 1 ? "ResNet50 → grouped features → K-Means" : "Pixels → PCA → Random Forest"}</span>
            <span className={styles.sourceTag}>Project artifact</span>
          </div>
        </div>

        <div className={styles.explanation}>
          <div className={styles.stageCopy} key={stage} data-motion={motion}>
            <p className={styles.eyebrow}>Brain tumor MRI classification</p>
            <h2 id={titleId}>{stage === 0 ? <>Brain tumor MRI.<br />Inside the models.</> : stage === 1 ? <>Can features find<br />the groups?</> : <>The supervised<br />baseline.</>}</h2>
            <p className={styles.description}>
              {stage === 0
                ? "Browse the recorded scans and results from my MRI project, then explore its clustering and classification branches."
                : stage === 1
                  ? "ImageNet-pretrained ResNet50 extracts features. Grouping by image ID yields 603 vectors; K-Means forms three clusters."
                  : "PCA-reduced pixels feed a 900-tree Random Forest. The matrix records which source labels it confuses."}
            </p>

            <dl className={styles.metrics}>
              {stage === 0 ? (
                <>
                  <div><dt>Available images</dt><dd>{metrics.dataset.totalImages.toLocaleString("en-US")}</dd></div>
                  <div><dt>Source labels</dt><dd>{metrics.dataset.classes.length}</dd></div>
                  <div><dt>Source resolution</dt><dd className={styles.smallMetric}>512 × 512</dd></div>
                </>
              ) : stage === 1 ? (
                <>
                  <div><dt>Grouped scans</dt><dd>{metrics.kmeans.groupedImageCount}</dd></div>
                  <div><dt>Adjusted Rand Index</dt><dd>{metrics.kmeans.adjustedRandIndex.toFixed(3)}</dd></div>
                  <div><dt>Cluster purity</dt><dd>{metrics.kmeans.clusterPurity.toFixed(3)}</dd></div>
                </>
              ) : (
                <>
                  <div><dt>Exploratory accuracy</dt><dd>{(randomForest.accuracy * 100).toFixed(2)}<span>%</span></dd></div>
                  <div><dt>Weighted F1</dt><dd>{randomForest.f1Weighted.toFixed(4)}</dd></div>
                  <div><dt>Forest size</dt><dd className={styles.smallMetric}>900 trees</dd></div>
                </>
              )}
            </dl>

            <div className={styles.scopeNote}>
              <span>{stage === 0 ? "What you’re viewing" : "Read the scope"}</span>
              <p>{stage === 0
                ? "Saved research artifacts from an exploratory project. These controls browse the outputs; they do not classify a new scan."
                : stage === 1
                  ? "ARI and purity describe this curated, single-source clustering dataset only. Stability across seeds and generalization to new scanners or hospitals have not been tested."
                  : "PCA was fitted before the train/test split, and the notebook tuned model choices on test results. This is an exploratory score with leakage and selection limitations."}</p>
            </div>
          </div>

          <div className={styles.panelActions}>
            {stage < stages.length - 1 ? (
              <button type="button" onClick={(event) => selectStage(stage + 1, event.detail > 0)}>
                {stage === 0 ? "Explore the features" : "Compare the classifier"}<Arrow />
              </button>
            ) : (
              <button type="button" onClick={(event) => selectStage(0, event.detail > 0)}>Back to the images<Arrow /></button>
            )}
            <span className={styles.progressText} role="status" aria-live="polite">View {stage + 1} of 3 · {stages[stage].label}</span>
          </div>
        </div>
      </div>

      <div className={styles.branchNote}><span aria-hidden="true">↳</span> Clustering and supervised classification are separate analyses of the source images.</div>
    </section>
  );
}
