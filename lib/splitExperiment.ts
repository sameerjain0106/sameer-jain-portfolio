/** A deterministic teaching example. These are constructed returns, never project results. */
export const EXPERIMENT_SPLIT = 108;
export const EXPERIMENT_LENGTH = 180;
export const LOOKBACKS = [3, 12, 30] as const;
export type Lookback = (typeof LOOKBACKS)[number];

export function syntheticReturns(): number[] {
  let seed = 71;
  let previous = 0;
  return Array.from({ length: EXPERIMENT_LENGTH }, (_, i) => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    const innovation = (seed / 4294967296 - 0.5) * 0.018;
    previous = (i < EXPERIMENT_SPLIT ? 0.84 : -0.68) * previous + innovation;
    return Math.max(-0.035, Math.min(0.035, previous));
  });
}

export function runExperiment(lookback: Lookback, returns = syntheticReturns()): number[] {
  const index = [100];
  for (let i = 0; i < returns.length; i++) {
    // Exposure uses only earlier observations, including during the holdout.
    const history = returns.slice(Math.max(0, i - lookback), i);
    const exposure = history.length < lookback ? 0 : Math.sign(history.reduce((a, b) => a + b, 0));
    index.push(index[i] * (1 + exposure * returns[i]));
  }
  return index;
}

// A common, fixed domain keeps the visual comparison honest when a control changes.
export const EXPERIMENT_DOMAIN = [80, 180] as const;
