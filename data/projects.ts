import { Project, ProjectSummary } from "@/lib/types";
import { etfResearch } from "@/data/etfResearch";
import mriResults from "@/public/projects/brain-tumor-mri/results/metrics.json";

// ============================================================
// PROJECT DATA
// ============================================================
// This is the single source of truth for all project content.
// To add a new project, add another object to this array and
// give it a unique `slug` — the site will pick it up automatically
// on the homepage and at /projects/[slug].
//
// MRI results are recorded project outputs. Supervised scores are
// exploratory; clustering reports ARI/purity, and anomaly detection
// reports its separate binary evaluation after the split was corrected.
// ============================================================

export const detailedProjects: Project[] = [
  {
    slug: "brain-tumor-mri-classification",
    title: "Brain Tumor MRI Classification",
    oneLiner:
      "An exploratory team project comparing supervised classification, ResNet50 clustering, and anomaly detection on a three-label MRI dataset.",
    category: ["Data Science", "Machine Learning"],
    technologies: [
      "PCA",
      "Random Forest",
      "K-Nearest Neighbors",
      "Logistic Regression",
      "ResNet50",
      "K-Means Clustering",
      "Convolutional Autoencoder",
      "Mahalanobis Distance",
    ],
    featured: true,
    githubUrl: "https://github.com/sameerjain0106/brain-cancer-ml",
    // Inferred from local file paths in the uploaded notebooks (Windows path
    // referenced "Student", notebook filename referenced "sami", and AD.py's
    // path referenced "diyamannacherry"). Confirm/correct spelling and add
    // links if you'd like to credit collaborators on the page.
    collaborators: ["Samantha Matthew (smathew67@gatech.edu)", "Diya Mannacherry (dmannacherry3@gatech.edu)"], // TODO: confirm names/spelling and add links

    problem:
      "Compare three machine learning approaches on MRI images labeled brain_glioma, brain_menin, and brain_tumor, keeping the three-class prediction, cluster alignment, and binary anomaly tasks distinct.",

    data: {
      description:
        "Grayscale/RGB brain MRI images across three classes (brain_glioma, brain_menin, brain_tumor) — glioma and menin have 2,004 images each, tumor has 2,048.",
      classes: ["brain_glioma", "brain_menin", "brain_tumor"],
      imagesPerClass: mriResults.dataset.imagesPerClass,
      totalImages: 6056,
      imageSize: "512×512",
    },

    approaches: [
      // ------------------------------------------------------
      // 1. SUPERVISED CLASSIFICATION — full results available
      // ------------------------------------------------------
      {
        id: "supervised",
        label: "Supervised Classification",
        status: "complete",
        summary:
          "An exploratory comparison of Logistic Regression, KNN, and Random Forest on PCA-reduced pixels. PCA fitting and model selection used test-set information, which limits the reported scores.",
        methodology: [
          "Images converted to grayscale and flattened to raw pixel vectors (512×512 = 262,144 features per image).",
          "PCA fitted on the full 6,012-image dataset before the train/test split; 1,000 components retained, capturing ~90.3% of total variance.",
          "Data split into train/test sets (75/25, random_state=42).",
          "Logistic Regression trained as a linear baseline (max_iter=10,000).",
          "KNN swept across k=1–499 on the test set to select the best-performing neighborhood size (k=3).",
          "Random Forest swept across n_estimators=100–1,000 in steps of 100 using test results; the selected configuration used 900 trees.",
        ],
        models: [
          { name: "Logistic Regression", accuracy: 0.5955, f1: 0.5962 },
          { name: "KNN (k=3)", accuracy: 0.6913, f1: 0.661 },
          { name: "Random Forest (900 trees)", accuracy: 0.7272, f1: 0.7294 },
        ],
        images: [
          {
            src: "/projects/brain-tumor-mri/images/logreg_confusion_matrix.png",
            alt: "Logistic Regression confusion matrix",
            caption: "Logistic Regression — confusion matrix (test set)",
          },
          {
            src: "/projects/brain-tumor-mri/images/knn_accuracy_vs_k_zoom.png",
            alt: "KNN test accuracy vs k, zoomed to k=1-50",
            caption: "KNN accuracy vs. k (zoomed to k=1–50)",
          },
          {
            src: "/projects/brain-tumor-mri/images/knn_confusion_matrix.png",
            alt: "KNN confusion matrix",
            caption: "KNN (k=3) — confusion matrix (test set)",
          },
          {
            src: "/projects/brain-tumor-mri/images/rf_accuracy_vs_trees.png",
            alt: "Random Forest accuracy vs number of trees",
            caption: "Random Forest accuracy vs. n_estimators",
          },
          {
            src: "/projects/brain-tumor-mri/images/rf_confusion_matrix.png",
            alt: "Random Forest confusion matrix",
            caption: "Random Forest (900 trees) — exploratory test confusion matrix (72.72% accuracy)",
          },
        ],
        notes: [
          "These are exploratory test-set scores. Fitting PCA before splitting exposes the representation to test-set information, and selecting KNN and Random Forest configurations from test results adds selection bias. There is no untouched final evaluation in this recorded comparison.",
          "The supervised branch used 6,012 of the 6,056 available images. Its loading loop omitted 44 brain_tumor images; correcting that gap and the evaluation procedure requires a new run.",
        ],
      },

      // ------------------------------------------------------
      // 2. UNSUPERVISED CLUSTERING — recorded ARI/purity
      // ------------------------------------------------------
      {
        id: "clustering",
        label: "Unsupervised Clustering",
        status: "complete",
        summary:
          "Deep features from a pretrained ResNet50 clustered with K-Means to see whether tumor types separate without using labels during training — and formally evaluated against ground truth.",
        methodology: [
          "Each image passed through ResNet50 (ImageNet weights, top layers removed, global average pooling) at its native 512×512 resolution to extract 2,048-dimensional feature vectors, processed in batches to bound memory usage.",
          "Per-image feature vectors grouped and averaged by unique image ID (6,056 raw crops → 603 grouped feature vectors).",
          "K-Means run for k=1–14; within-cluster sum of squares (WCSS) plotted to find the elbow — it pointed to k=3, matching the three known tumor classes.",
          "K-Means fit with k=3 (fixed seed for reproducibility).",
          "Cluster assignments evaluated against true labels using Adjusted Rand Index and cluster purity (best 1-to-1 cluster-to-class alignment via the Hungarian algorithm) — the quantitative check that was missing from the initial pass, when only a manual, image-by-image inspection of all 603 scans had been done.",
        ],
        models: [
          { name: "K-Means (k=3) vs. true labels", kind: "clustering", adjustedRandIndex: 1.0, purity: 1.0 },
        ],
        images: [
          {
            src: "/projects/brain-tumor-mri/images/elbow_plot.png",
            alt: "Elbow plot for K-Means cluster count selection",
            caption: "WCSS vs. number of clusters — elbow at k=3",
          },
          {
            src: "/projects/brain-tumor-mri/images/cluster_vs_true_label_confusion_matrix.png",
            alt: "Confusion matrix comparing K-Means clusters to true tumor labels",
            caption: "Clusters vs. true labels — ARI = 1.0, purity = 1.0 (603/603)",
          },
          {
            src: "/projects/brain-tumor-mri/images/cluster_0_samples.png",
            alt: "Sample images from K-Means cluster 0",
            caption: "Cluster 0 — sample scans (201 total, aligned to Menin)",
          },
          {
            src: "/projects/brain-tumor-mri/images/cluster_1_samples.png",
            alt: "Sample images from K-Means cluster 1",
            caption: "Cluster 1 — sample scans (201 total, aligned to Tumor)",
          },
          {
            src: "/projects/brain-tumor-mri/images/cluster_2_samples.png",
            alt: "Sample images from K-Means cluster 2",
            caption: "Cluster 2 — sample scans (201 total, aligned to Glioma)",
          },
        ],
        notes: [
          "ARI = 1.0 and purity = 1.0 (603/603) record perfect cluster-to-source-label agreement for this run. These values measure clustering alignment.",
          "K-Means was fitted and evaluated on the same 603 grouped feature vectors from one curated, single-source, class-balanced dataset. Stability across random seeds and generalization to new scanners or hospitals remain untested.",
        ],
      },

      // ------------------------------------------------------
      // 3. ANOMALY DETECTION — real results, honestly reported
      // ------------------------------------------------------
      {
        id: "anomaly",
        label: "Anomaly Detection",
        status: "complete",
        summary:
          "A convolutional autoencoder trained only on glioma scans, using reconstruction-latent distance to flag scans that don't look like the training distribution — evaluated with a proper held-out split.",
        methodology: [
          "Glioma images split 80/20 (1,604 train / 400 held-out test) before any training, to prevent the model from being evaluated on images it had already seen.",
          "Autoencoder trained only on the glioma-train split: 128×128 grayscale images, 3-layer convolutional encoder/decoder, MSE loss, 10 epochs (Adam, lr=1e-3).",
          "Latent representations extracted from the trained encoder, flattened, and reduced via PCA to 100 components (94.6% variance explained).",
          "Mean vector and covariance matrix estimated from the training (glioma) latent space.",
          "Mahalanobis distance computed for the held-out glioma scans plus all menin/tumor scans (4,452 total evaluation images).",
          "Threshold set at the 90th percentile of training-set distances; scans beyond it are flagged as anomalies relative to glioma.",
        ],
        pipeline: [
          { id: "input", title: "MRI Images", description: "Grayscale brain MRI scans; glioma split 80/20 into train/held-out test before any model sees the data." },
          { id: "preprocess", title: "128×128 Grayscale", description: "Images resized and converted to single-channel grayscale tensors." },
          { id: "encode", title: "Convolutional Autoencoder", description: "3-layer convolutional encoder/decoder trained on the glioma-train split only (MSE loss, 10 epochs, final loss 0.0014)." },
          { id: "latent", title: "Latent Representation", description: "Bottleneck feature map from the trained encoder, flattened per image." },
          { id: "pca", title: "PCA", description: "Latent vectors reduced to 100 principal components (94.6% variance explained)." },
          { id: "mahalanobis", title: "Mahalanobis Distance", description: "Distance from each evaluation sample to the glioma-train latent-space distribution (mean + covariance)." },
          { id: "threshold", title: "Threshold", description: "90th percentile of training-set distances used as the anomaly cutoff (value: 12.10)." },
          { id: "classify", title: "Anomaly Classification", description: "Held-out glioma + all menin/tumor scans scored; samples beyond the threshold are flagged as anomalies." },
        ],
        models: [
          { name: "Autoencoder + Mahalanobis Distance", accuracy: 0.50, f1: 0.59 },
        ],
        images: [
          {
            src: "/projects/brain-tumor-mri/images/training_loss.png",
            alt: "Autoencoder training loss curve",
            caption: "Training loss over 10 epochs (glioma-train only)",
          },
          {
            src: "/projects/brain-tumor-mri/images/distance_distribution.png",
            alt: "Mahalanobis distance distribution for train vs evaluation sets",
            caption: "Mahalanobis distance distribution — train vs. held-out evaluation",
          },
          {
            src: "/projects/brain-tumor-mri/images/anomaly_confusion_matrix.png",
            alt: "Anomaly detection confusion matrix on held-out evaluation set",
            caption: "Confusion matrix on the held-out evaluation set (50% accuracy)",
          },
        ],
        notes: [
          "The original script evaluated on its training images. After separating training data from held-out evaluation, recorded accuracy is 50%, with the model biased toward calling scans \"glioma-like\" (0.14 precision / 0.89 recall on that class; 0.98 precision / 0.46 recall on anomaly).",
          "A single Gaussian over the autoencoder's 100-dimensional PCA latent space did not produce strong separation in this run. This is a binary glioma-like/anomaly task; its accuracy and F1 answer a different question from the three-class supervised scores and clustering alignment metrics.",
        ],
      },
    ],

    limitations: [
      "The supervised scores are exploratory: PCA was fitted before the train/test split, and KNN/Random Forest configurations were chosen using test results. A new evaluation with training-only preprocessing and validation-based model selection is needed to estimate generalization.",
      "Supervised models were trained directly on raw/PCA-reduced pixel intensities rather than learned convolutional features, which likely caps achievable accuracy compared to a CNN-based approach — the clustering approach's ResNet50 features separate classes far more cleanly on the same data.",
      "The supervised classification notebook loads 2,004 of the 2,048 available brain_tumor images (a pre-existing gap in the original loading loop, not yet corrected since fixing it requires re-running the full pipeline).",
      "The clustering result (ARI = 1.0) hasn't been tested for stability across random seeds, and comes from one curated, single-source dataset — it demonstrates strong feature separability here, not generalization to new hospitals or scanners.",
      "The anomaly branch records 50% accuracy on a separate binary task. Its score cannot be ranked directly against three-class accuracy or clustering ARI/purity, and this run does not establish which anomaly detector would generalize best.",
    ],
    futureWork: [
      "Fit PCA on training images only, select hyperparameters on validation data, and reserve an untouched test set for final evaluation.",
      "Train a CNN classifier directly on the images to compare against the PCA + classical ML pipeline.",
      "Fix the 2,004-vs-2,048 image count gap in the supervised notebook and re-run the full pipeline.",
      "Check clustering stability across multiple random seeds/initializations.",
      "Try a more expressive anomaly detector (e.g. a mixture model or a one-class classifier like Deep SVDD) and/or an ROC-based threshold instead of a fixed percentile.",
    ],

    cardImage: {
      src: "/projects/brain-tumor-mri/images/rf_confusion_matrix.png",
      alt: "Random Forest confusion matrix for brain tumor MRI classification",
      caption: "Random Forest confusion matrix — exploratory test accuracy of 72.7%",
    },
  },
];

const etfResearchProject: ProjectSummary = {
  slug: etfResearch.slug,
  title: etfResearch.title,
  oneLiner: etfResearch.oneLiner,
  category: ["Quantitative Research", "Machine Learning"],
  technologies: [...etfResearch.technologies],
  featured: true,
  githubUrl: etfResearch.githubUrl,
  cardImage: {
    src: etfResearch.figures.confirmation,
    alt: "Development and sealed confirmation information coefficients for the frozen ETF model",
    caption:
      "Development and sealed 2024–2026 confirmation mean information coefficient",
  },
  headlineStats: [...etfResearch.headlineStats],
};

export const projects: ProjectSummary[] = [
  ...detailedProjects,
  etfResearchProject,
];

export const featuredProjects = projects.filter((p) => p.featured);
