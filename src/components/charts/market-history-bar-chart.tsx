import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export interface MarketHistoryBarChartProps {
  data: Array<{ label: string; price: number }>;
  tooltipLabel: string;
  formatPrice: (v: number) => string;
}

export default function MarketHistoryBarChart({
  data,
  tooltipLabel,
  formatPrice,
}: MarketHistoryBarChartProps) {
  return (
    <div className="-mx-2 mt-4 h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              fontSize: 12,
            }}
            formatter={(v: number) => [formatPrice(v), tooltipLabel]}
          />
          <Bar dataKey="price" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
