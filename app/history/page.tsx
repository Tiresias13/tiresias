"use client";

import { Sidebar } from "@/components/Sidebar";
import { WalletButton } from "@/components/WalletButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_HISTORY } from "@/lib/demoData";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { clsx } from "clsx";

function formatDate(ts: number): string {
return new Date(ts * 1000).toLocaleString("id-ID", {
day: "numeric",
month: "short",
hour: "2-digit",
minute: "2-digit",
});
}

export default function HistoryPage() {
const history = DEMO_HISTORY;

const wins = history.filter((h) => h.result === "win").length;
const losses = history.filter((h) => h.result === "loss").length;
const winRate = history.length > 0 ? (wins / history.length) * 100 : 0;
const totalPnl = history.reduce((a, h) => a + h.pnlUsd, 0);
const avgPnl = history.length > 0 ? totalPnl / history.length : 0;return (
<div className="flex min-h-screen bg-zinc-950">
<Sidebar />
<main className="ml-56 flex-1 flex flex-col">
{/* Top bar */}
<header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
<span className="text-sm font-semibold text-white">Trade History</span>
<WalletButton />
</header>

<div className="px-6 py-5">
{/* Summary cards */}
<div className="grid grid-cols-4 gap-4 mb-6">
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Win Rate</p>
<p className={clsx(
"text-2xl font-bold",
winRate >= 50 ? "text-green-400" : "text-red-400"
)}>
{winRate.toFixed(0)}%
</p>
<p className="text-xs text-zinc-600 mt-0.5">
{wins}W / {losses}L
</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Total PnL</p>
<p className={clsx(
"text-2xl font-bold",
totalPnl >= 0 ? "text-green-400" : "text-red-400"
)}>
{totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Avg PnL</p>
<p className={clsx(
"text-2xl font-bold",
avgPnl >= 0 ? "text-green-400" : "text-red-400"
)}>
{avgPnl >= 0 ? "+" : ""}${avgPnl.toFixed(2)}
</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Total Trades</p>
<p className="text-2xl font-bold text-white">{history.length}</p>
</Card>
</div>

{/* History list */}
{history.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-600">
<p className="text-sm">No trade history yet</p>
</div>
) : (
<div className="flex flex-col gap-3">
{history.map((trade, i) => {
const isWin = trade.result === "win";
return (
<Card key={i} className="bg-zinc-900 border-zinc-800 p-4">
<div className="flex items-center justify-between">
{/* Left */}
<div className="flex items-center gap-3">
<div className={clsx(
"w-8 h-8 rounded-full flex items-center justify-center",
isWin ? "bg-green-400/10" : "bg-red-400/10"
)}>
{isWin
? <TrendingUp className="w-4 h-4 text-green-400" />
: <TrendingDown className="w-4 h-4 text-red-400" />
}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-sm font-semibold text-white">
{trade.symbol}
</span>
<Badge
className={clsx(
"text-xs border-0 py-0",
isWin
? "bg-green-400/10 text-green-400"
: "bg-red-400/10 text-red-400"
)}
>
{isWin ? "WIN" : "LOSS"}
</Badge>
</div>
<p className="text-xs text-zinc-500">{trade.name}</p>
</div>
</div>

{/* Right */}
<div className="flex items-center gap-6 text-right">
<div>
<p className="text-xs text-zinc-500">Entry → Exit</p>
<p className="text-xs font-mono text-zinc-400">
${trade.entryPrice.toFixed(8)} →{" "}
${trade.exitPrice.toFixed(8)}
</p>
</div>
<div>
<p className="text-xs text-zinc-500">PnL</p>
<p className={clsx(
"text-sm font-bold",
isWin ? "text-green-400" : "text-red-400"
)}>
{isWin ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
<span className="text-xs ml-1">
(${trade.pnlUsd > 0 ? "+" : ""}{trade.pnlUsd.toFixed(2)})
</span>
</p>
</div>
<div className="flex items-center gap-1 text-xs text-zinc-600">
<Clock className="w-3 h-3" />
{formatDate(trade.closedAt)}
</div>
</div>
</div>
</Card>
);
})}
</div>
)}
</div>
</main>
</div>
);
}
