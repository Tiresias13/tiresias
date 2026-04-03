"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrganicScore } from "@/components/OrganicScore";
import { SparklineChart, generateDemoSparkline } from "@/components/SparklineChart";
import { ScoredToken } from "@/lib/scoring";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Clock, Users, Droplets, Zap } from "lucide-react";

interface SignalCardProps {
token: ScoredToken;
isDemoMode: boolean;
onExecute: (token: ScoredToken, amountSol: number) => Promise<void>;
minScore: number;
}

function formatAge(launchAt: number): string {
const now = Math.floor(Date.now() / 1000);
const mins = Math.floor((now - launchAt) / 60);
if (mins < 60) return `${mins}m`;
const hours = Math.floor(mins / 60);
return `${hours}h ${mins % 60}m`;
}

function formatUsd(val: number): string {
if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
return `$${val.toFixed(0)}`;
}

export function SignalCard({ token, isDemoMode, onExecute, minScore }: SignalCardProps) {
const [loading, setLoading] = useState(false);
const [amount, setAmount] = useState("0.1");

const isPositive = token.token_price_change_1h >= 0;
const sparklineData = generateDemoSparkline(
token.current_price_usd,
isPositive ? "up" : "down"
);

const isFiltered = token.organicScore < minScore;

if (isFiltered) return null;

async function handleExecute() {
setLoading(true);
await onExecute(token, parseFloat(amount) || 0.1);
setLoading(false);
}return (
<Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors p-4">
{/* Header */}
<div className="flex items-start justify-between mb-3">
<div className="flex items-center gap-2">
{token.logo_url ? (
<img
src={token.logo_url}
alt={token.symbol}
className="w-8 h-8 rounded-full bg-zinc-800"
/>
) : (
<div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
{token.symbol.slice(0, 2)}
</div>
)}
<div>
<div className="flex items-center gap-1.5">
<span className="font-semibold text-white text-sm">{token.symbol}</span>
<Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400 py-0">
{token.chain}
</Badge>
{isDemoMode && (
<Badge className="text-xs bg-amber-400/10 text-amber-400 border-0 py-0">
DEMO
</Badge>
)}
</div>
<p className="text-xs text-zinc-500">{token.name}</p>
</div>
</div>

{/* Price change */}
<div className={clsx(
"flex items-center gap-1 text-sm font-semibold",
isPositive ? "text-green-400" : "text-red-400"
)}>
{isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
{isPositive ? "+" : ""}{token.token_price_change_1h.toFixed(1)}%
</div>
</div>

{/* Sparkline */}
<div className="mb-3">
<SparklineChart data={sparklineData} positive={isPositive} />
</div>

{/* Organic Score */}
<div className="mb-3">
<OrganicScore score={token.organicScore} breakdown={token.scoreBreakdown} />
</div>

{/* Signal reason */}
<p className="text-xs text-zinc-500 mb-3 leading-relaxed">
{token.signalReason}
</p>

{/* Stats row */}
<div className="grid grid-cols-4 gap-2 mb-4">
<div className="flex flex-col items-center gap-0.5">
<span className="text-xs text-zinc-500 flex items-center gap-0.5">
<Droplets className="w-3 h-3" /> MC
</span>
<span className="text-xs font-medium text-zinc-300">
{formatUsd(token.market_cap)}
</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="text-xs text-zinc-500 flex items-center gap-0.5">
<Zap className="w-3 h-3" /> Vol 1h
</span>
<span className="text-xs font-medium text-zinc-300">
{formatUsd(token.token_tx_volume_usd_1h)}
</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="text-xs text-zinc-500 flex items-center gap-0.5">
<Users className="w-3 h-3" /> Holders
</span>
<span className="text-xs font-medium text-zinc-300">
{token.holders.toLocaleString()}
</span>
</div>
<div className="flex flex-col items-center gap-0.5">
<span className="text-xs text-zinc-500 flex items-center gap-0.5">
<Clock className="w-3 h-3" /> Age
</span>
<span className="text-xs font-medium text-zinc-300">
{formatAge(token.launch_at)}
</span>
</div>
</div>

{/* Execute */}
<div className="flex items-center gap-2">
<div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-1.5 flex-1">
<span className="text-xs text-zinc-500">SOL</span>
<input
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
className="bg-transparent text-sm text-white w-full outline-none font-mono"
step="0.05"
min="0.01"
max="10"
/>
</div>
<Button
onClick={handleExecute}
disabled={loading}
className={clsx(
"flex-1 font-semibold text-sm",
token.organicScore >= 70
? "bg-green-500 hover:bg-green-600 text-black"
: token.organicScore >= 45
? "bg-yellow-500 hover:bg-yellow-600 text-black"
: "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
)}
>
{loading ? "Executing..." : isDemoMode ? "Demo Buy" : "Execute Buy"}
</Button>
</div>
</Card>
);
}
