import { etfResearch, phase7Summary } from "./etfResearch";

const result = phase7Summary.statistical_result;
const comparison = phase7Summary.momentum_comparison;
const fixed = (value: number) => value.toFixed(3).replace("-", "−");

/** The recorded research, told as one vertical paper dossier. */
export const etfStory = [
  {
    id: "inputs", word: "The question", label: "Systematic ETF Research Engine / Machine learning",
    title: ["FIND THE", "SIGNAL."], ground: "#f2ef9b",
    body: etfResearch.researchQuestion,
    finding: "18 features. Four ways to describe the market.",
    note: "Momentum, volatility, drawdown, and trend become inputs to a model of next-21-session relative return ranks.",
    caption: "The frozen model’s actual feature set, grouped by family.",
  },
  {
    id: "develop", word: "Keep time honest", label: "2019–2023 / Development",
    title: ["Tomorrow", "stays outside."], ground: "#d8efe3",
    body: "Train on the past. Validate on what comes next. Expand the window and repeat.",
    finding: "Chronological folds. Purged targets. Training-only preprocessing.",
    note: "The model and its hyperparameters are selected here, before the confirmation period is opened.",
    caption: "Expanding-window schematic; illustrative fold boundaries, not individual recorded folds.",
  },
  {
    id: "freeze", word: "Seal the model", label: "The boundary / Before confirmation",
    title: ["Freeze it.", "Then look."], ground: "#ffb49c",
    body: "Close the model-selection process. Carry exactly the same decision rule into the sealed period.",
    finding: `18-feature Elastic Net · α ${phase7Summary.model.configuration.alpha} · l1_ratio ${phase7Summary.model.configuration.l1_ratio}`,
    note: "No tuning in confirmation. The fitting recipe stays fixed before the outcomes are reviewed.",
    caption: "The feature set and hyperparameters are held fixed; confirmation is not another model search.",
  },
  {
    id: "confirm", word: "Open the evidence", label: "2024–2026 / Sealed confirmation",
    title: ["Now find", "out."], ground: "#cbc8f2",
    body: "The frozen model predicted relative return ranks better than zero in the sealed confirmation period.",
    finding: `Mean weekly Spearman IC ${fixed(result.confirmation_mean_spearman_ic)} · HAC 95% interval ${fixed(result.hac_95_ci[0])}–${fixed(result.hac_95_ci[1])}`,
    note: `${result.weekly_decisions} weekly decisions; ${result.prediction_rows.toLocaleString("en-US")} ETF/date predictions. One-sided HAC p = ${fixed(result.hac_one_sided_p)}. 2026 is partial.`,
    caption: "Model versus zero: mean weekly Spearman IC and its HAC 95% confidence interval.",
  },
  {
    id: "compare", word: "Keep the claim honest", label: "The harder question / Versus momentum",
    title: ["A signal.", "With limits."], ground: "#f2ef9b",
    body: "Did it beat the momentum baseline? The estimated advantage was positive, but its interval crosses zero.",
    finding: `Paired IC improvement ${fixed(comparison.cstar_minus_momentum_ic)} · HAC 95% interval ${fixed(comparison.paired_hac_95_ci[0])}–${fixed(comparison.paired_hac_95_ci[1])}`,
    note: `The advantage was not statistically confirmed (one-sided p = ${fixed(comparison.paired_hac_one_sided_p)}). Independent replication remains to come.`,
    caption: "Model minus momentum: the paired improvement interval includes zero. This is a different test from the previous chapter.",
  },
] as const;

export const etfFeatureFamilies = [
  { name: "Momentum", features: phase7Summary.feature_names.slice(0, 5), color: "#f2ef9b" },
  { name: "Volatility", features: phase7Summary.feature_names.slice(5, 9), color: "#d8efe3" },
  { name: "Drawdown", features: phase7Summary.feature_names.slice(9, 13), color: "#ffb49c" },
  { name: "Trend", features: phase7Summary.feature_names.slice(13), color: "#cbc8f2" },
] as const;
