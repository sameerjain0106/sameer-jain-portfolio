"use client";

import { useEffect, useState } from "react";

const demoFrames = [
  { label: "GLIOMA", confidence: "0.982", latency: "18.4 ms", vector: ["+0.84", "-0.21", "+1.42", "+0.04"] },
  { label: "MENINGIOMA", confidence: "0.964", latency: "17.9 ms", vector: ["-0.31", "+1.08", "+0.55", "-0.72"] },
  { label: "TUMOR", confidence: "0.991", latency: "18.1 ms", vector: ["+1.17", "+0.33", "-0.44", "+0.91"] },
];

const layers = [
  { x: 84, ys: [82, 146, 210, 274] },
  { x: 228, ys: [64, 118, 172, 226, 280] },
  { x: 382, ys: [92, 156, 220, 284] },
  { x: 528, ys: [138, 202, 266] },
];

const connectionPairs: Array<[number, number, number, number]> = [];
for (let layer = 0; layer < layers.length - 1; layer += 1) {
  layers[layer].ys.forEach((y1, i) => {
    layers[layer + 1].ys.forEach((y2, j) => {
      if ((i + j + layer) % 2 === 0 || Math.abs(y1 - y2) < 38) {
        connectionPairs.push([layers[layer].x, y1, layers[layer + 1].x, y2]);
      }
    });
  });
}

export default function MLVisualization() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % demoFrames.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  const current = demoFrames[frame];

  return (
    <div className="ml-panel relative isolate w-full max-w-[650px] overflow-hidden rounded-xl border border-base-border bg-[#0D1016]/90 shadow-[0_28px_80px_-40px_rgba(77,216,196,0.22)]">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="ml-scan pointer-events-none absolute inset-y-0 left-0 w-28" />

      <div className="relative flex items-center justify-between border-b border-base-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_12px_rgba(77,216,196,0.8)]" />
          <span className="mono-label text-[10px] text-ink-muted">ML // feature flow</span>
        </div>
        <span className="mono-label text-[9px] text-ink-faint">visual demo</span>
      </div>

      <div className="relative px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <div className="mb-2 flex items-center justify-between text-[9px] text-ink-faint">
          <span className="mono-label">Input vector</span>
          <span className="mono-label">Representation</span>
          <span className="mono-label">Output</span>
        </div>

        <div className="relative h-[330px] overflow-hidden rounded-lg border border-base-border/80 bg-base/60">
          <svg
            viewBox="0 0 620 350"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Animated illustrative machine learning feature flow from input nodes through hidden representations to a classification output"
          >
            <defs>
              <linearGradient id="signalLine" x1="0" x2="1">
                <stop offset="0" stopColor="#4DD8C4" stopOpacity="0.05" />
                <stop offset="0.5" stopColor="#4DD8C4" stopOpacity="0.75" />
                <stop offset="1" stopColor="#4DD8C4" stopOpacity="0.08" />
              </linearGradient>
              <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connectionPairs.map(([x1, y1, x2, y2], index) => (
              <line
                key={`${x1}-${y1}-${x2}-${y2}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="ml-edge"
                style={{ animationDelay: `${(index % 12) * 90}ms` }}
              />
            ))}

            <path d="M84 316 H528" className="ml-flow-path" />

            {layers.map((layer, layerIndex) =>
              layer.ys.map((y, nodeIndex) => (
                <g key={`${layerIndex}-${nodeIndex}`}>
                  <circle
                    cx={layer.x}
                    cy={y}
                    r="15"
                    className="ml-node-ring"
                    style={{ animationDelay: `${layerIndex * 430 + nodeIndex * 90}ms` }}
                  />
                  <circle
                    cx={layer.x}
                    cy={y}
                    r="4"
                    className="ml-node-core"
                    filter="url(#nodeGlow)"
                    style={{ animationDelay: `${layerIndex * 430 + nodeIndex * 90}ms` }}
                  />
                </g>
              )),
            )}

            <g className="ml-packet">
              <circle cx="0" cy="0" r="5" fill="#7FEADC" filter="url(#nodeGlow)" />
              <circle cx="0" cy="0" r="12" fill="#4DD8C4" opacity="0.12" />
            </g>
          </svg>

          <div className="absolute left-3 top-4 space-y-2 sm:left-4">
            {current.vector.map((value, index) => (
              <div key={`${frame}-${index}`} className="flex w-[72px] items-center justify-between gap-2 font-mono text-[9px]">
                <span className="text-ink-faint">x{index + 1}</span>
                <span className="text-ink-muted">{value}</span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 right-3 w-[148px] rounded-md border border-signal/25 bg-base/90 p-3 backdrop-blur sm:right-4 sm:w-[166px]">
            <p className="mono-label text-[8px] text-ink-faint">synthetic forward pass</p>
            <p key={`label-${frame}`} className="mt-2 animate-fade-in font-display text-sm font-semibold tracking-wide text-signal">
              {current.label}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[8px]">
              <div>
                <p className="text-ink-faint">CONF</p>
                <p key={`conf-${frame}`} className="mt-0.5 text-ink-muted">{current.confidence}</p>
              </div>
              <div>
                <p className="text-ink-faint">LATENCY</p>
                <p key={`lat-${frame}`} className="mt-0.5 text-ink-muted">{current.latency}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-base-border rounded-md border border-base-border bg-base/55">
          <div className="px-3 py-2.5">
            <p className="mono-label text-[8px] text-ink-faint">Backbone</p>
            <p className="mt-1 font-mono text-[10px] text-ink-muted">ResNet50</p>
          </div>
          <div className="px-3 py-2.5">
            <p className="mono-label text-[8px] text-ink-faint">Embedding</p>
            <p className="mt-1 font-mono text-[10px] text-ink-muted">2048-D</p>
          </div>
          <div className="px-3 py-2.5">
            <p className="mono-label text-[8px] text-ink-faint">Clustering</p>
            <p className="mt-1 font-mono text-[10px] text-ink-muted">K-Means · k=3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
