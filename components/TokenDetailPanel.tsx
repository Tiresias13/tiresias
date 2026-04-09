"use client";

import { useRef, useState } from "react";
import { ScoredToken } from "@/lib/scoring";
import { clsx } from "clsx";
import { X, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
Radar,
RadarChart,
PolarGrid,
PolarAngleAxis,
ResponsiveContainer,
ComposedChart,
Bar,
XAxis,
YAxis,
Tooltip,
Cell,
} from "recharts";

interface TokenDetailPanelProps {
token: ScoredToken | null;
onClose: () => void;
isDemoMode: boolean;
onExecute: (token: ScoredToken, amount: number) => Promise<void>;
}

function formatUsd(val: number): string {
if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
return `$${val.toFixed(2)}`;
}

function generateDemoOHLC(basePrice: number, count = 30) {
const data = [];
let price = basePrice;
const now = Math.floor(Date.now() / 1000);
for (let i = count; i >= 0; i--) {
const open = price;
const change = (Math.random() - 0.48) * 0.06;
const close = open * (1 + change);
const high = Math.max(open, close) * (1 + Math.random() * 0.015);
const low = Math.min(open, close) * (1 - Math.random() * 0.015);
price = close;
data.push({
time: new Date((now - i * 60) * 1000).toLocaleTimeString("id-ID", {
hour: "2-digit",
minute: "2-digit",
}),
open: parseFloat(open.toFixed(10)),
close: parseFloat(close.toFixed(10)),
high: parseFloat(high.toFixed(10)),
low: parseFloat(low.toFixed(10)),
isUp: close >= open,
bodySize: Math.abs(close - open),
bodyStart: Math.min(open, close),
});
}
return data;
}

const CustomCandlestick = (props: any) => {
const { x, y, width, height, isUp, high, low, open, close } = props;
const color = isUp ? "#4ade80" : "#f87171";
const bodyHeight = Math.max(Math.abs(height), 1);

return (
<g>
<line
x1={x + width / 2}
y1={y - 5}
x2={x + width / 2}
y2={y + bodyHeight + 5}
stroke={color}
strokeWidth={1}
/>
<rect
x={x}
y={y}
width={width}
height={bodyHeight}
fill={color}
opacity={0.8}
/>
</g>
);
};

export function TokenDetailPanel({
token,
onClose,
isDemoMode,
onExecute,
}: TokenDetailPanelProps) {
const [amount, setAmount] = useState("0.1");
const [loading, setLoading] = useState(false);

const radarData = token
? [
{ subject: "Fee/MC", value: token.scoreBreakdown?.feeMcRatio ? 100 : 15 },
{ subject: "Volume", value: token.scoreBreakdown?.volumeTrend ? 100 : 15 },
{ subject: "Holders", value: token.scoreBreakdown?.holderCount ? 100 : 15 },
{ subject: "Lock", value: token.scoreBreakdown?.lockStatus ? 100 : 15 },
{ subject: "Age", value: token.scoreBreakdown?.tokenAge ? 100 : 15 },
]
: [];

const candleData = token ? generateDemoOHLC(token.current_price_usd) : [];

async function handleExecute() {
if (!token) return;
setLoading(true);
await onExecute(token, parseFloat(amount) || 0.1);
setLoading(false);
}

if (!token) return null;

const isPositive = token.token_price_change_1h >= 0;
return(
<>

<div className={`fixed right-0 top-0 h-screen w-[420px] bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto flex flex-col transition-transform duration-300 ease-out ${token ? "translate-x-0" : "translate-x-full"}`}>

{/* Header */}
<div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
<div className="flex items-center gap-3">
{token.logo_url ? (
<img src={token.logo_url} alt={token.symbol} className="w-9 h-9 rounded-full bg-zinc-800" />
) : (
<div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
{token.symbol.slice(0, 2)}
</div>
)}
<div>
<div className="flex items-center gap-2">
<span className="font-bold text-white">{token.symbol}</span>
<span className="text-xs text-zinc-500">{token.name}</span>
</div>
<div className="flex items-center gap-1 mt-0.5">
<span className="text-xs text-zinc-600 font-mono">
{token.token.slice(0, 6)}...{token.token.slice(-4)}
</span>
<ExternalLink className="w-3 h-3 text-zinc-600" />
</div>
</div>
</div>
<button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
<X className="w-5 h-5" />
</button>
</div>

<div className="flex-1 px-5 py-4 space-y-5">
{/* Price */}
<div className="flex items-end justify-between">
<div>
<p className="text-xs text-zinc-500 mb-1">Price</p>
<p className="text-2xl font-bold text-white font-mono">
${token.current_price_usd.toFixed(8)}
</p>
</div>
<div className={clsx(
"flex items-center gap-1 text-base font-bold",
isPositive ? "text-green-400" : "text-red-400"
)}>
{isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
{isPositive ? "+" : ""}{token.token_price_change_1h.toFixed(2)}% 1h
</div>
</div>

{/* Stats */}
<div className="grid grid-cols-3 gap-2">
{[
{ label: "Market Cap", value: formatUsd(token.market_cap) },
{ label: "TVL", value: formatUsd(token.tvl) },
{ label: "Holders", value: token.holders.toLocaleString() },
{ label: "Vol 1h", value: formatUsd(token.token_tx_volume_usd_1h) },
{ label: "Vol 24h", value: formatUsd(token.token_tx_volume_usd_24h) },
{ label: "Locked", value: `${(token.locked_percent * 100).toFixed(0)}%` },
].map((s) => (
<div key={s.label} className="bg-zinc-900 rounded-lg p-2.5">
<p className="text-xs text-zinc-500 mb-1">{s.label}</p>
<p className="text-sm font-semibold text-white">{s.value}</p>
</div>
))}
</div>

{/* Price chart - OHLC bars */}
<div>
<p className="text-xs text-zinc-500 mb-2">Price Chart (1m candles)</p>
<div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
<ResponsiveContainer width="100%" height={160}>
<ComposedChart data={candleData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
<XAxis
dataKey="time"
tick={{ fill: "#52525b", fontSize: 9 }}
tickLine={false}
axisLine={false}
interval={9}
/>
<YAxis
tick={{ fill: "#52525b", fontSize: 9 }}
tickLine={false}
axisLine={false}
tickFormatter={(v) => `$${v.toFixed(8)}`}
width={70}
/>
<Tooltip
content={({ active, payload }) => {
if (active && payload && payload.length) {
const d = payload[0]?.payload;
return (
<div className="bg-zinc-800 border border-zinc-700 p-2 rounded text-xs">
<p className="text-zinc-400">{d.time}</p>
<p className="text-green-400">H: ${d.high?.toFixed(8)}</p>
<p className="text-zinc-200">O: ${d.open?.toFixed(8)}</p>
<p className="text-zinc-200">C: ${d.close?.toFixed(8)}</p>
<p className="text-red-400">L: ${d.low?.toFixed(8)}</p>
</div>
);
}
return null;
}}
/>
<Bar dataKey="bodySize" stackId="a" fill="transparent" />
<Bar dataKey="bodySize" stackId="b" minPointSize={1} shape={<CustomCandlestick />}>
{candleData.map((entry, index) => (
<Cell key={index} fill={entry.isUp ? "#4ade80" : "#f87171"} />
))}
</Bar>
</ComposedChart>
</ResponsiveContainer>
</div>
</div>

{/* Radar chart */}
<div>
<p className="text-xs text-zinc-500 mb-2">Organic Score Breakdown</p>
<div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
<div className="flex items-center gap-4">
<div className="w-36 h-36">
<ResponsiveContainer width="100%" height="100%">
<RadarChart data={radarData}>
<PolarGrid stroke="#3f3f46" />
<PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10 }} />
<Radar
dataKey="value"
stroke="#f59e0b"
fill="#f59e0b"
fillOpacity={0.2}
strokeWidth={1.5}
/>
</RadarChart>
</ResponsiveContainer>
</div>
<div className="flex-1 space-y-2">
{radarData.map((d) => (
<div key={d.subject} className="flex items-center justify-between">
<span className="text-xs text-zinc-400">{d.subject}</span>
<span className={clsx(
"text-xs font-semibold",
d.value >= 80 ? "text-green-400" : "text-red-400"
)}>
{d.value >= 80 ? "✓ Pass" : "✗ Fail"}
</span>
</div>
))}
<div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
<span className="text-xs text-zinc-500">Score</span>
<span className={clsx(
"text-lg font-bold",
(token.organicScore ?? 0) >= 70 ? "text-green-400" :
(token.organicScore ?? 0) >= 45 ? "text-yellow-400" : "text-red-400"
)}>
{token.organicScore}/100
</span>
</div>
</div>
</div>
</div>
</div>

{/* Signal reason */}
<div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
<p className="text-xs text-zinc-500 mb-1">Signal Reason</p>
<p className="text-xs text-zinc-300 leading-relaxed">{token.signalReason}</p>
</div>
</div>

{/* Execute sticky bottom */}
<div className="sticky bottom-0 px-5 py-4 border-t border-zinc-800 bg-zinc-950">
<div className="flex items-center gap-2">
<div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-2 flex-1">
<span className="text-xs text-zinc-500">SOL</span>
<input
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
className="bg-transparent text-sm text-white w-full outline-none font-mono"
step="0.05"
min="0.01"
/>
</div>
<Button
onClick={handleExecute}
disabled={loading}
className={clsx(
"flex-1 font-semibold",
(token.organicScore ?? 0) >= 70
? "bg-green-500 hover:bg-green-600 text-black"
: (token.organicScore ?? 0) >= 45
? "bg-yellow-500 hover:bg-yellow-600 text-black"
: "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
)}
>
{loading ? "Executing..." : isDemoMode ? "Demo Buy" : "Execute Buy"}
</Button>
</div>
</div>
</div>
</>
);
}
