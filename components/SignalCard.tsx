"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoredToken } from "@/lib/scoring";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Clock, Users, Droplets } from "lucide-react";

interface SignalCardProps {
token: ScoredToken;
isDemoMode: boolean;
onExecute: (token: ScoredToken, amountSol: number) => Promise<void>;
minScore: number;
onClick: (token: ScoredToken) => void;
}

function formatAge(launchAt: number): string {
const now = Math.floor(Date.now() / 1000);
const mins = Math.floor((now - launchAt) / 60);
if (mins < 60) return `${mins}m`;
return `${Math.floor(mins / 60)}h${mins % 60}m`;
}

function formatUsd(val: number): string {
if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
return `$${val.toFixed(0)}`;
}

export function SignalCard({ token, isDemoMode, onExecute, minScore, onClick }: SignalCardProps) {
const isPositive = token.token_price_change_1h >= 0;

if (token.finalScore < minScore) return null;

return (
<Card
onClick={(e) => { e.stopPropagation(); onClick(token); }}
className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer p-3 group"
role="button"
tabIndex={0}
onKeyDown={(e) => e.key === "Enter" && onClick(token)}
>
{/* Header row */}
<div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-2">
{token.logo_url ? (
<img
src={token.logo_url}
alt={token.symbol}
className="w-7 h-7 rounded-full bg-zinc-800 flex-shrink-0"
/>
) : (
<div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
{token.symbol.slice(0, 2)}
</div>
)}
<div>
<div className="flex items-center gap-1.5">
<span className="font-semibold text-white text-sm">{token.symbol}</span>
<Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 py-0 px-1">
{token.chain}
</Badge>
</div>
<p className="text-xs text-zinc-600 truncate max-w-[120px]">{token.name}</p>
</div>
</div>

{/* Score badge */}
<div className="flex flex-col items-end gap-0.5">
<span className={clsx("text-lg font-bold tabular-nums leading-none", token.verdictColor)}>
{token.finalScore}
</span>
<span className={clsx("text-xs font-bold tracking-wide", token.verdictColor)}>
{token.verdict}
</span>
</div>
</div>

{/* Price row */}
<div className="flex items-center justify-between mb-2">
<span className="text-xs font-mono text-zinc-300">
${token.current_price_usd.toFixed(8)}
</span>
<span className={clsx(
"flex items-center gap-0.5 text-xs font-semibold",
isPositive ? "text-green-400" : "text-red-400"
)}>
{isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
{isPositive ? "+" : ""}{token.token_price_change_1h.toFixed(1)}%
</span>
</div>

{/* Stats row */}
<div className="flex items-center justify-between text-xs text-zinc-500">
<span className="flex items-center gap-1">
<Droplets className="w-3 h-3" />
{formatUsd(token.market_cap)}
</span>
<span className="flex items-center gap-1">
<Users className="w-3 h-3" />
{token.holders.toLocaleString()}
</span>
<span className="flex items-center gap-1">
<Clock className="w-3 h-3" />
{formatAge(token.launch_at)}
</span>
{isDemoMode && (
<Badge className="text-xs bg-[#4693ff]/10 text-[#4693ff] border-0 py-0px-1">
DEMO
</Badge>
)}
</div>

{/* Contrarian warning */}
{token.contrarian?.warning && (
<p className="text-xs text-yellow-500/70 mt-2 border-t border-zinc-800 pt-2">
⚠️ {token.contrarian.warning}
</p>
)}

{/* Hover hint */}
<p className="text-xs text-zinc-700 mt-2 text-center group-hover:text-zinc-500 transition-colors">
Click for details →
</p>
</Card>
);
}
