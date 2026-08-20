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
  const data = models.map((m) => ({
    name: m.name,
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    "F1 Score": Number((m.f1 * 100).toFixed(1)),
  }));

  return (
    <div className="h-80 w-full rounded-lg border border-base-border bg-base-panel p-4">
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
            unit="%"
            domain={[0, 100]}
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
          />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-plex-mono)" }} />
          <Bar dataKey="Accuracy" fill="#4DD8C4" radius={[3, 3, 0, 0]} />
          <Bar dataKey="F1 Score" fill="#D9A45B" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
