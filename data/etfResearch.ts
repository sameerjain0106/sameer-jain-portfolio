export const etfResearch = {
  slug: "systematic-etf-research",
  title: "Systematic ETF Research Engine",
  subtitle:
    "Point-in-Time Quantitative Research, Walk-Forward ML, and Alpha-vs-Beta Decomposition",
  oneLiner:
    "Point-in-time quantitative ETF research platform combining walk-forward machine learning, historical macro vintages, execution-aware portfolio simulation, statistical robustness testing, and alpha-vs-beta decomposition.",
  researchQuestion:
    "Can market, technical, and historically available macroeconomic information predict medium-horizon cross-sectional ETF performance?",
  githubUrl: "https://github.com/sameerjain0106/systematic-etf-research",
  releaseUrl:
    "https://github.com/sameerjain0106/systematic-etf-research/releases/tag/phase3c-research-v1",
  version: "ETF Research v1 — Phase 3C Complete",
  technologies: [
    "Python",
    "Machine Learning",
    "Quantitative Finance",
    "DuckDB",
    "scikit-learn",
    "FRED / ALFRED",
    "Statistical Inference",
  ],
  headlineStats: [
    { value: "100", label: "ETFs" },
    { value: "291K+", label: "Market observations" },
    { value: "160", label: "Passing tests" },
    { value: "6", label: "Walk-forward OOS folds" },
  ],
  atAGlance: [
    {
      value: "100",
      label: "ETFs",
      detail: "Fixed, versioned research universe",
    },
    {
      value: "291K+",
      label: "Market observations",
      detail: "291,287 validated observations",
    },
    {
      value: "2015–2026",
      label: "Research history",
      detail: "Market and point-in-time macro history",
    },
    {
      value: "45",
      label: "Predictor allow-list",
      detail: "Explicitly controlled model inputs",
    },
    {
      value: "6",
      label: "Expanding OOS folds",
      detail: "Chronological walk-forward evaluation",
    },
    {
      value: "160",
      label: "Passing tests",
      detail: "Frozen publication baseline",
    },
  ],
  architecture: [
    { title: "Yahoo + FRED / ALFRED", detail: "Market history and official macro vintages" },
    { title: "Raw ingestion & validation", detail: "Schema, provenance, and source-quality checks" },
    { title: "DuckDB + Parquet", detail: "Versioned catalog and compressed analytical mirror" },
    { title: "Point-in-time dataset", detail: "Historically eligible rows at each decision date" },
    { title: "Feature engineering", detail: "Market, technical, relationship, and macro predictors" },
    { title: "Walk-forward modeling", detail: "Elastic Net and quantitative baselines" },
    { title: "Robust inference", detail: "Newey–West and moving-block bootstrap" },
    { title: "Portfolio simulation", detail: "Next-session execution and cost sensitivity" },
    { title: "Alpha-vs-beta diagnostics", detail: "Residual targets, realized alpha, and risk controls" },
  ],
  phases: [
    {
      id: "3A",
      title: "Apparent predictability",
      summary:
        "Elastic Net initially produced statistically positive cross-sectional predictability.",
      metrics: [{ label: "Monthly OOS IC", value: "0.1951" }],
    },
    {
      id: "3B",
      title: "Robustness & attribution",
      summary:
        "The apparent signal remained positive after serial-dependence-aware robustness testing, while attribution exposed strong market-risk loading.",
      metrics: [
        { label: "Newey–West 95% CI", value: "[0.0645, 0.3258]" },
        { label: "Block-bootstrap 95% CI", value: "[0.0502, 0.3104]" },
      ],
    },
    {
      id: "3C",
      title: "Alpha-vs-beta test",
      summary:
        "Point-in-time, risk-free-adjusted beta residualization removed almost all apparent predictability.",
      metrics: [
        { label: "Residual monthly IC", value: "0.0055" },
        { label: "Residual HAC 95% CI", value: "[-0.0753, 0.0863]" },
      ],
    },
  ],
  riskCaseStudy: [
    {
      title: "Unconstrained Elastic Net",
      tone: "caution",
      metrics: [
        { label: "Return", value: "−29.83%" },
        { label: "Max drawdown", value: "−34.36%" },
        { label: "Average beta", value: "1.337" },
      ],
    },
    {
      title: "Beta ≤ 1.10",
      tone: "highlight",
      metrics: [
        { label: "Return", value: "−12.64%" },
        { label: "Max drawdown", value: "−21.62%" },
        { label: "Average beta", value: "0.971" },
      ],
    },
    {
      title: "12−1 Momentum",
      tone: "neutral",
      metrics: [
        { label: "Return", value: "−7.37%" },
        { label: "Max drawdown", value: "−17.17%" },
        { label: "Average beta", value: "0.599" },
      ],
    },
  ],
  modeling: [
    "Interpretable Elastic Net regression with L1/L2 regularization",
    "Training-only median imputation and standardization",
    "Alpha selected using validation folds only",
    "Explicit 45-predictor allow-list",
    "No random train/test split or shuffled cross-validation",
    "Long-horizon SPY beta and correlation were the most stable original predictors",
  ],
  deferredModels: [
    "XGBoost was not implemented.",
    "Neural networks were not implemented.",
    "More complex ML was intentionally deferred after robust residual alpha was not established.",
  ],
  safeguards: [
    "No random train/test split",
    "Chronological expanding folds",
    "No shuffled cross-validation",
    "Validation-only hyperparameter selection",
    "Point-in-time ALFRED vintages",
    "Same-day macro releases excluded",
    "No target leakage",
    "Next-session execution",
    "Transaction-cost sensitivity",
    "Newey–West inference",
    "Moving-block bootstrap",
    "Deterministic fingerprints and integrity checks",
  ],
  conclusion:
    "A leakage-safe Elastic Net model initially exhibited statistically robust cross-sectional predictability. Subsequent exposure attribution and point-in-time beta residualization showed that most of the apparent signal was explained by systematic market-risk exposure rather than persistent ETF-selection alpha.",
  conclusionDetail:
    "The project demonstrates the complete research process: form a hypothesis, obtain an apparent result, stress-test it, identify confounding exposures, and reject an overstated alpha conclusion when the evidence does not support it.",
  limitations: [
    "A fixed-current ETF universe creates survivorship and selection bias.",
    "Static taxonomy is not historical point-in-time classification.",
    "Yahoo-based execution and distribution data have known limitations.",
    "The simulation does not model bid/ask spreads or market impact.",
    "The research does not establish future profitability.",
  ],
  futureWork: [
    "Dynamic risk allocation",
    "Factor-neutral ETF research",
    "Historically reconstructed ETF universes",
    "Crypto extension",
    "Futures extension",
    "Cross-asset regime research",
  ],
} as const;

