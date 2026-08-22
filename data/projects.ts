import { Project, ProjectSummary } from "@/lib/types";
import { etfResearch } from "@/data/etfResearch";

// ============================================================
// PROJECT DATA
// ============================================================
// This is the single source of truth for all project content.
// To add a new project, add another object to this array and
// give it a unique `slug` — the site will pick it up automatically
// on the homepage and at /projects/[slug].
//
// All numbers in this file for "brain-tumor-mri-classification"
// were extracted directly from the executed notebook outputs
// (project_code_sami.ipynb, KMeans.ipynb) — none are invented.
// Where a script had no captured output (AD.py), results are
// marked as pending rather than filled in.
// ============================================================

export const detailedProjects: Project[] = [
  {
    slug: "brain-tumor-mri-classification",
    title: "Brain Tumor MRI Classification",
    oneLiner:
      "Classifying brain MRI scans across three tumor types using three different paradigms: supervised classification, unsupervised clustering, and anomaly detection.",
    category: ["Machine Learning", "Computer Vision"],
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
    githubUrl: "https://github.com/sameerjain0106/brain-cancer-ml", // TODO: add the GitHub repo URL for this project
    // Inferred from local file paths in the uploaded notebooks (Windows path
    // referenced "Student", notebook filename referenced "sami", and AD.py's
    // path referenced "diyamannacherry"). Confirm/correct spelling and add
    // links if you'd like to credit collaborators on the page.
    collaborators: ["Samantha Matthew (smathew67@gatech.edu)", "Diya Mannacherry (dmannacherry3@gatech.edu)"], // TODO: confirm names/spelling and add links

    problem:
      "Differentiate between three brain tumor types — glioma, meningioma, and a third tumor class — from MRI scans, and compare how well different ML paradigms (supervised, unsupervised, anomaly-detection) handle the same classification problem.",

    data: {
      description:
        "Grayscale/RGB brain MRI images across three classes (brain_glioma, brain_menin, brain_tumor) — glioma and menin have 2,004 images each, tumor has 2,048.",
      classes: ["brain_glioma", "brain_menin", "brain_tumor"],
      imagesPerClass: 2004,
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
          "Raw pixel intensities reduced via PCA, then classified with three progressively stronger models — Logistic Regression, KNN, and Random Forest.",
        methodology: [
          "Images converted to grayscale and flattened to raw pixel vectors (512×512 = 262,144 features per image).",
          "PCA applied to the full 6,012-image dataset; 1,000 components retained, capturing ~90.3% of total variance.",
          "Data split into train/test sets (75/25, random_state=42).",
          "Logistic Regression trained as a linear baseline (max_iter=10,000).",
          "KNN swept across k=1–499 on the test set to select the best-performing neighborhood size (k=3).",
          "Random Forest swept across n_estimators=100–1,000 in steps of 100; best configuration used 900 trees.",
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
            caption: "Random Forest (900 trees) — confusion matrix (test set), best-performing model",
          },
        ],
      },

      // ------------------------------------------------------
      // 2. UNSUPERVISED CLUSTERING — real quantitative results
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
          { name: "K-Means (k=3) vs. true labels", accuracy: 1.0, f1: 1.0 },
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
          "ARI = 1.0 and purity = 1.0 (603/603) confirm, with a formal metric, what a full manual check of every image in every cluster had already suggested: on this dataset, ResNet50 features plus K-Means separate the three tumor types with zero overlap.",
          "This should be read with the right scope: it shows generic ImageNet-pretrained features are highly discriminative on this specific, curated, single-source, class-balanced dataset — not that the pipeline is a validated diagnostic tool. Stability across random seeds and generalization to new scanners/hospitals haven't been tested.",
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
          "The original version of this script evaluated on the same images it trained on, which would have overstated performance. With that leak fixed, real accuracy on the held-out set is 50% — close to chance — with the model strongly biased toward calling scans \"glioma-like\" (0.14 precision / 0.89 recall on that class; 0.98 precision / 0.46 recall on anomaly).",
          "This is reported as a genuine, weaker finding rather than smoothed over: a single Gaussian fit over a 100-dim PCA of a small autoencoder's latent space isn't a strong enough anomaly detector to separate glioma from other tumor types on this dataset. It's a useful, honest contrast against the much stronger supervised and clustering results on the same underlying data.",
        ],
      },
    ],

    limitations: [
      "Supervised models were trained directly on raw/PCA-reduced pixel intensities rather than learned convolutional features, which likely caps achievable accuracy compared to a CNN-based approach — the clustering approach's ResNet50 features separate classes far more cleanly on the same data.",
      "The supervised classification notebook loads 2,004 of the 2,048 available brain_tumor images (a pre-existing gap in the original loading loop, not yet corrected since fixing it requires re-running the full pipeline).",
      "The clustering result (ARI = 1.0) hasn't been tested for stability across random seeds, and comes from one curated, single-source dataset — it demonstrates strong feature separability here, not generalization to new hospitals or scanners.",
      "The anomaly detection approach substantially underperforms the other two methods (50% accuracy) — a single Gaussian over PCA-reduced latent space isn't expressive enough for this task on this data.",
    ],
    futureWork: [
      "Train a CNN classifier directly on the images to compare against the PCA + classical ML pipeline.",
      "Fix the 2,004-vs-2,048 image count gap in the supervised notebook and re-run the full pipeline.",
      "Check clustering stability across multiple random seeds/initializations.",
      "Try a more expressive anomaly detector (e.g. a mixture model or a one-class classifier like Deep SVDD) and/or an ROC-based threshold instead of a fixed percentile.",
    ],

    cardImage: {
      src: "/projects/brain-tumor-mri/images/rf_confusion_matrix.png",
      alt: "Random Forest confusion matrix for brain tumor MRI classification",
      caption: "Random Forest confusion matrix — best-performing model (72.7% accuracy)",
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
  cardVariant: "etf-research",
  headlineStats: [...etfResearch.headlineStats],
  prominent: true,
};

export const projects: ProjectSummary[] = [
  etfResearchProject,
  ...detailedProjects,
];

export const featuredProjects = projects.filter((p) => p.featured);
