"use client";

/**
 * Stacked area chart: principal, contributions, and interest over time, with
 * an optional inflation-adjusted balance line. The y-axis always starts at 0
 * (no truncated axes), and a text summary is provided for screen readers.
 */

import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GrowthRow } from "@/lib/chart-data";
import { formatCurrency, formatCurrencyCompact, formatTerm, type Currency } from "@/lib/format";

export function GrowthChart({
  rows,
  currency,
  summary,
  showReal = false,
}: {
  rows: GrowthRow[];
  currency: Currency;
  /** Plain-text equivalent of the chart for screen-reader users. */
  summary: string;
  showReal?: boolean;
}) {
  return (
    <figure aria-label="Projected balance over time">
      <div className="h-72 w-full" role="img" aria-label={summary}>
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ left: 8, right: 8, top: 8 }}>
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
            <Area
              stackId="balance"
              dataKey="principal"
              name="Starting balance"
              fill="hsl(var(--chart-1))"
              stroke="hsl(var(--chart-1))"
              fillOpacity={0.75}
              isAnimationActive={false}
            />
            <Area
              stackId="balance"
              dataKey="contributions"
              name="Contributions"
              fill="hsl(var(--chart-6))"
              stroke="hsl(var(--chart-6))"
              fillOpacity={0.7}
              isAnimationActive={false}
            />
            <Area
              stackId="balance"
              dataKey="interest"
              name="Interest"
              fill="hsl(var(--chart-3))"
              stroke="hsl(var(--chart-3))"
              fillOpacity={0.7}
              isAnimationActive={false}
            />
            {showReal && (
              <Line
                dataKey="realBalance"
                name="In today's dollars"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
