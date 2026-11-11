import results from "@/public/projects/brain-tumor-mri/results/metrics.json";

const forest = results.supervisedModels.find((model) => model.name.startsWith("Random Forest"))!;

// One HTML/image world. Native vertical scroll is the sole source of scene progress.
// The photographs and figures below are original project artifacts, never live inference.
export const perceptionStory = [
  { id: "hello", word: "See", ground: "#173bd3", ink: "#f2ef9b", title: ["LEARNING", "TO SEE."], label: "Sameer Jain / Machine learning & computer vision", body: "Georgia Tech student. I build machine-learning experiments and the data systems around them.", finding: "Featured / Brain tumor MRI research", note: "Scroll into the images, methods, and mistakes behind the project.", figure: "cluster_2_samples.png", caption: "Published MRI examples from the project. Separate scans, shown as visual crops." },
  { id: "images", word: "Look", ground: "#f2ef9b", ink: "#173bd3", title: ["PIXELS", "FIRST."], label: "Begin with the material", body: "6,056 available MRI images. Three source labels. More than one way to ask what is in the picture.", finding: `${results.dataset.totalImages.toLocaleString("en-US")} available images`, note: "The supervised loading loop used 6,012 images, omitting 44 available images. The case study documents that gap.", figure: "cluster_0_samples.png", caption: "The project's original sample sheets: Menin, Tumor, and Glioma. Five published examples per group." },
  { id: "groups", word: "Group", ground: "#ff8066", ink: "#111b39", title: ["PATTERNS", "EMERGE."], label: "ResNet50 → features → K-Means", body: "A pretrained visual backbone turns the images into features. Group by image ID, then let K-Means find three clusters.", finding: `${results.kmeans.groupedImageCount} grouped scans · ARI 1.000 · purity 1.000`, note: "This alignment belongs to one curated dataset. Stability across seeds and generalization to new scanners remain untested.", figure: "cluster_vs_true_label_confusion_matrix.png", caption: "Recorded cluster-to-label alignment. 201 grouped scans per source class; ARI and purity are both 1.000." },
  { id: "classifier", word: "Test", ground: "#173bd3", ink: "#f2ef9b", title: ["MEET THE", "BASELINE."], label: "A separate supervised branch", body: "Pixels → PCA → a 900-tree Random Forest. Inspect the places where the three source labels get mixed up.", finding: `${(forest.accuracy * 100).toFixed(2)}% exploratory test accuracy`, note: "PCA was fitted before splitting, and model choices were tuned on test results. This score has leakage and selection limitations.", figure: "rf_confusion_matrix.png", caption: "The saved Random Forest confusion matrix, with exploratory accuracy of 72.72% and weighted F1 of 0.7294." },
  { id: "limits", word: "Question", ground: "#111b39", ink: "#ffb5a2", title: ["A USEFUL", "FAILURE."], label: "After fixing evaluation leakage", body: "An autoencoder learns the Glioma training distribution. Mahalanobis distance flags outliers. The corrected result pushes back.", finding: "50% accuracy · binary anomaly task", note: "4,452 evaluation images. A different task from three-class classification and clustering, with a weaker recorded result.", figure: "anomaly_confusion_matrix.png", caption: "The recorded anomaly confusion matrix after separating training data from the held-out Glioma scans." },
  { id: "closer", word: "Explore", ground: "#f2ef9b", ink: "#173bd3", title: ["LOOK", "DEEPER."], label: "The interesting part is underneath", body: "The notebooks, tradeoffs, and evaluation limits are all part of the work. Take a closer look.", finding: "Three approaches. One honest account.", note: "Research artifacts and recorded results. Browsing this site does not run a diagnosis or classify a new scan.", figure: "cluster_2_samples.png", caption: "Explore the complete MRI case study for methods, collaborators, code, and limitations." },
] as const;

export const perceptionMotion = {
  viewportAnchor: .5,
  transitionStart: .32,
  transitionEnd: .68,
  artWindow: .26,
  pointerRange: 30,
  pointerEase: .14,
  settleThreshold: .025,
};
