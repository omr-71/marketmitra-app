import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface PriceHistoryAreaChartProps {
  data: Array<{ label: string; price: number }>;
  tooltipLabel: string;
  formatPrice: (v: number) => string;
}

export default function PriceHistoryAreaChart({
  data,
  tooltipLabel,
  formatPrice,
}: PriceHistoryAreaChartProps) {
  return (
    <div className="-mx-2 mt-4 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          />
          <YAxis domain={["dataMin - 80", "dataMax + 80"]} hide />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              fontSize: 12,
            }}
            formatter={(v: number) => [formatPrice(v), tooltipLabel]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--color-primary)"
            strokeWidth={3}
            fill="url(#gp)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
