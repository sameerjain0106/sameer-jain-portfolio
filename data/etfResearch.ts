import latestSignal from "@/public/projects/systematic-etf-research/data/latest_signal.json";
import phase7Summary from "@/public/projects/systematic-etf-research/data/phase7_public_summary.json";

const statistics = phase7Summary.statistical_result;
const economics = phase7Summary.economic_evaluation_10bps;

export const etfResearch = {
  slug: "systematic-etf-research",
  title: "Systematic ETF Research Engine",
  subtitle: "Machine Learning for Cross-Sectional Return Prediction",
  oneLiner:
    "Built a leakage-controlled ML research engine over ~100 ETFs and 291K+ market observations; a frozen 18-feature Elastic Net achieved 0.130 mean Spearman IC in a sealed 2024–26 confirmation period (HAC p=0.009).",
  researchQuestion:
    "Can machine learning identify persistent cross-sectional structure in ETF returns?",
  githubUrl: "https://github.com/sameerjain0106/systematic-etf-research",
  releaseUrl:
    "https://github.com/sameerjain0106/systematic-etf-research/tree/phase7-confirmed-v1",
  summaryUrl:
    "/projects/systematic-etf-research/data/phase7_public_summary.json",
  signalUrl: "/projects/systematic-etf-research/data/latest_signal.json",
  version: "Phase 7 confirmed · frozen historical model · forward paper test active",
  technologies: [
    "Python",
    "scikit-learn",
    "Quantitative Research",
    "DuckDB",
    "Parquet",
    "HAC Inference",
    "Walk-Forward ML",
  ],
  headlineStats: [
    { value: statistics.confirmation_mean_spearman_ic.toFixed(3), label: "Confirmed OOS IC" },
    { value: statistics.hac_one_sided_p.toFixed(3), label: "HAC p-value" },
    { value: "2024–26", label: "Sealed confirmation" },
    { value: "3 / 3", label: "Positive subperiods" },
  ],
  heroMetrics: [
    {
      value: statistics.confirmation_mean_spearman_ic.toFixed(3),
      label: "Confirmed OOS IC",
      detail: "Mean weekly cross-sectional Spearman IC",
    },
    {
      value: statistics.hac_one_sided_p.toFixed(3),
      label: "HAC p-value",
      detail: "One-sided, lag 4",
    },
    {
      value: "2024–2026",
      label: "Confirmation period",
      detail: "Sealed before outcome review",
    },
    {
      value: "3 / 3",
      label: "Positive subperiods",
      detail: "2024, 2025, and partial 2026",
    },
    {
      value: "~100",
      label: "ETF universe",
      detail: "Fixed-current research universe",
    },
    {
      value: "291K+",
      label: "Market observations",
      detail: "Versioned analytical history",
    },
  ],
  pipeline: [
    "Market data",
    "PIT feature engineering",
    "Walk-forward research",
    "Signal discovery",
    "Complexity challenge",
    "Sealed confirmation",
    "Forward paper testing",
  ],
  featureGroups: [
    { name: "Momentum", features: ["21d", "63d", "126d", "252d", "12–1"] },
    { name: "Volatility", features: ["21d", "63d", "126d", "252d"] },
    { name: "Drawdown", features: ["Current", "63d max", "252d max", "Distance from high"] },
    { name: "Trend", features: ["Price / SMA 20", "Price / SMA 50", "Price / SMA 200", "SMA geometry"] },
  ],
  complexity: [
    { name: "Elastic Net", ic: phase7Summary.complexity_challenge_development_mean_ic.elastic_net },
    { name: "Elastic + XGBoost ensemble", ic: phase7Summary.complexity_challenge_development_mean_ic.elastic_nonlinear_ensemble },
    { name: "XGBoost pairwise ranker", ic: phase7Summary.complexity_challenge_development_mean_ic.xgboost_pairwise_ranker },
    { name: "XGBoost regression", ic: phase7Summary.complexity_challenge_development_mean_ic.xgboost_regression },
    { name: "Shallow MLP", ic: phase7Summary.complexity_challenge_development_mean_ic.shallow_mlp },
  ],
  economicResults: [
    {
      name: "Frozen ML portfolio",
      cagr: economics.cstar.cagr,
      sharpe: economics.cstar.sharpe_ratio,
      drawdown: economics.cstar.maximum_drawdown,
    },
    {
      name: "12–1 momentum",
      cagr: economics.momentum_12_1.cagr,
      sharpe: economics.momentum_12_1.sharpe_ratio,
      drawdown: economics.momentum_12_1.maximum_drawdown,
    },
    {
      name: "Equal weight",
      cagr: economics.equal_weight_eligible.cagr,
      sharpe: economics.equal_weight_eligible.sharpe_ratio,
      drawdown: economics.equal_weight_eligible.maximum_drawdown,
    },
  ],
  leakageControls: [
    "Chronological expanding folds; no random train/test split",
    "Target-end purging before every fit",
    "Training-only median imputation and standardization",
    "Point-in-time feature and macro-data availability",
    "Model and hyperparameters selected before confirmation",
    "Sealed 2024–2026 confirmation period",
    "No post-confirmation historical model search",
    "Append-only forward predictions with deterministic hashes",
  ],
  limitations: phase7Summary.limitations,
  target: phase7Summary.research_design.target,
  featureNames: phase7Summary.feature_names,
  figures: {
    timeline: "/projects/systematic-etf-research/figures/research-timeline.png",
    confirmation: "/projects/systematic-etf-research/figures/development-vs-confirmation.png",
    weeklyIc: "/projects/systematic-etf-research/figures/weekly-confirmation-ic.png",
    complexity: "/projects/systematic-etf-research/figures/model-complexity.png",
    coefficients: "/projects/systematic-etf-research/figures/coefficient-stability.png",
    economics: "/projects/systematic-etf-research/figures/economic-comparison.png",
  },
} as const;

export { latestSignal, phase7Summary };
