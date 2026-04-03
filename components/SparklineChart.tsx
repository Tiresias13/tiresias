"use client";

import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

interface SparklineChartProps {
data: { time: number; close: string; volume: string }[];
positive?: boolean;
}

export function SparklineChart({ data, positive = true }: SparklineChartProps) {
if (!data || data.length === 0) {
return (
<div className="w-full h-12 flex items-center justify-center">
<span className="text-xs text-zinc-600">No chart data</span>
</div>
);
}

const chartData = data.map((d) => ({
time: d.time,
price: parseFloat(d.close),
}));

const color = positive ? "#4ade80" : "#f87171";

return (
<div className="w-full h-12">
<ResponsiveContainer width="100%" height="100%">
<AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
<defs>
<linearGradient id={`gradient-${positive}`} x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor={color} stopOpacity={0.3} />
<stop offset="95%" stopColor={color} stopOpacity={0} />
</linearGradient>
</defs>
<Area
type="monotone"
dataKey="price"
stroke={color}
strokeWidth={1.5}
fill={`url(#gradient-${positive})`}
dot={false}
isAnimationActive={false}
/>
<Tooltip
content={({ active, payload }) => {
if (active && payload && payload.length) {
return (
<div className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-xs text-zinc-200">
${parseFloat(payload[0].value as string).toFixed(8)}
</div>
);
}
return null;
}}
/>
</AreaChart>
</ResponsiveContainer>
</div>
);
}

// Demo sparkline data generator
export function generateDemoSparkline(
basePrice: number,
trend: "up" | "down" | "flat" = "up",
points: number = 12
) {
const data = [];
let price = basePrice;
const now = Math.floor(Date.now() / 1000);

for (let i = points; i >= 0; i--) {
const trendFactor =
trend === "up" ? 1.02 : trend === "down" ? 0.98 : 1;
const random = 0.97 + Math.random() * 0.06;
price = price * trendFactor * random;
data.push({
time: now - i * 300,
close: price.toString(),
volume: (Math.random() * 1000).toString(),
});
}

return data;
}
