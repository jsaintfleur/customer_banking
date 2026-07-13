"use client";

/** Multi-scenario balance-over-time line chart for the Compare tool. */

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComparisonRow } from "@/lib/chart-data";
import { formatCurrency, formatCurrencyCompact, formatTerm, type Currency } from "@/lib/format";

const SERIES_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

export function ComparisonChart({
  rows,
  labels,
  currency,
  summary,
}: {
  rows: ComparisonRow[];
  labels: string[];
  currency: Currency;
  summary: string;
}) {
  return (
    <figure aria-label="Scenario comparison over time">
      <div className="h-72 w-full" role="img" aria-label={summary}>
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tickFormatter={(month: number) => formatTerm(month)}
              stroke="hsl(var(--text-muted))"
              fontSize={12}
            />
            <YAxis
              domain={[0, "auto"]}
              tickFormatter={(value: number) => formatCurrencyCompact(value, currency)}
              stroke="hsl(var(--text-muted))"
              fontSize={12}
              width={70}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
              labelFormatter={(month) => `Month ${month} (${formatTerm(Number(month))})`}
              contentStyle={{
                backgroundColor: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--text))",
              }}
            />
            <Legend />
            {labels.map((label, index) => (
              <Line
                key={label}
                dataKey={label}
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
