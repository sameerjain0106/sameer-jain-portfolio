"use client";

import results from "@/public/projects/brain-tumor-mri/results/metrics.json";
import PerceptionShowcase from "./PerceptionShowcase";
import MriPipeline from "./MriPipeline";
import styles from "./MriScrollJourney.module.css";

/** The original vertical research story, followed by its scroll-built method. */
export default function MriScrollJourney({ active, scrollRoot }: { active: boolean; scrollRoot: HTMLElement | null }) {
  return <div className={styles.room} data-mri-journey data-story-axis="vertical">
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
