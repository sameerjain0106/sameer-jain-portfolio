"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ModelResult } from "@/lib/types";

export default function ResultsChart({ models }: { models: ModelResult[] }) {
  const clustering = models.length > 0 && models.every((model) => model.kind === "clustering");
  const data = models.map((model) => model.kind === "clustering"
    ? { name: model.name, "Adjusted Rand Index": model.adjustedRandIndex, "Cluster purity": model.purity }
    : { name: model.name, Accuracy: model.accuracy, "F1 Score": model.f1 });
  const description = models.map((model) => model.kind === "clustering"
    ? `${model.name}: adjusted Rand index ${model.adjustedRandIndex.toFixed(3)}, cluster purity ${model.purity.toFixed(3)}.`
    : `${model.name}: accuracy ${(model.accuracy * 100).toFixed(2)}%, F1 score ${model.f1.toFixed(4)}.`).join(" ");

  return (
    <div className="h-80 w-full rounded-lg border border-base-border bg-base-panel p-4" role="img" aria-label={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F242E" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#8B93A1", fontSize: 11, fontFamily: "var(--font-plex-mono)" }}
            axisLine={{ stroke: "#1F242E" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8B93A1", fontSize: 11, fontFamily: "var(--font-plex-mono)" }}
            axisLine={{ stroke: "#1F242E" }}
            tickLine={false}
            domain={clustering ? [-1, 1] : [0, 1]}
          />
          <Tooltip
            contentStyle={{
              background: "#12151C",
              border: "1px solid #1F242E",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-plex-mono)",
            }}
            labelStyle={{ color: "#E6E9EF" }}
            cursor={{ fill: "rgba(77, 216, 196, 0.05)" }}
            formatter={(value, name) => [
              name === "Accuracy" ? `${(Number(value) * 100).toFixed(2)}%` : Number(value).toFixed(clustering ? 3 : 4),
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-plex-mono)" }} />
          <Bar dataKey={clustering ? "Adjusted Rand Index" : "Accuracy"} fill="#4DD8C4" radius={[3, 3, 0, 0]} />
          <Bar dataKey={clustering ? "Cluster purity" : "F1 Score"} fill="#D9A45B" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
