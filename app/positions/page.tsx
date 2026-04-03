"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WalletButton } from "@/components/WalletButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_POSITIONS } from "@/lib/demoData";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { clsx } from "clsx";

function formatAge(openedAt: number): string {
const now = Math.floor(Date.now() / 1000);
const mins = Math.floor((now - openedAt) / 60);
if (mins < 60) return `${mins}m ago`;
return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export default function PositionsPage() {
const [positions, setPositions] = useState(DEMO_POSITIONS);

function handleClose(index: number) {
setPositions((prev) => prev.filter((_, i) => i !== index));
}return (
<div className="flex min-h-screen bg-zinc-950">
<Sidebar />
<main className="ml-56 flex-1 flex flex-col">
{/* Top bar */}
<header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
<span className="text-sm font-semibold text-white">Open Positions</span>
<WalletButton />
</header>

<div className="px-6 py-5">
{/* Summary */}
<div className="grid grid-cols-3 gap-4 mb-6">
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Open Positions</p>
<p className="text-2xl font-bold text-white">{positions.length}</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Total PnL</p>
<p className={clsx(
"text-2xl font-bold",
positions.reduce((a, p) => a + p.pnlUsd, 0) >= 0
? "text-green-400"
: "text-red-400"
)}>
${positions.reduce((a, p) => a + p.pnlUsd, 0).toFixed(2)}
</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Total Value</p>
<p className="text-2xl font-bold text-white">
${positions.reduce((a, p) => a + p.amountUsd, 0).toFixed(2)}
</p>
</Card>
</div>

{/* Positions list */}
{positions.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-600">
<p className="text-sm">No open positions</p>
</div>
) : (
<div className="flex flex-col gap-3">
{positions.map((pos, i) => {
const isWin = pos.pnlPercent >= 0;
const tpProgress = Math.min(
(pos.pnlPercent / pos.tpTarget) * 100,
100
);

return (
<Card key={i} className="bg-zinc-900 border-zinc-800 p-4">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
{pos.symbol.slice(0, 2)}
</div>
<div>
<p className="text-sm font-semibold text-white">{pos.symbol}</p>
<p className="text-xs text-zinc-500">{pos.name}</p>
</div>
</div>

<div className="flex items-center gap-3">
<div className={clsx(
"flex items-center gap-1 text-sm font-bold",
isWin ? "text-green-400" : "text-red-400"
)}>
{isWin ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
{isWin ? "+" : ""}{pos.pnlPercent.toFixed(1)}%
<span className="text-xs">
(${pos.pnlUsd > 0 ? "+" : ""}{pos.pnlUsd.toFixed(2)})
</span>
</div>
<Button
size="sm"
variant="outline"
onClick={() => handleClose(i)}
className="border-red-800 text-red-400 hover:bg-red-400/10 text-xs"
>
Close
</Button>
</div>
</div>

{/* Price info */}
<div className="grid grid-cols-3 gap-3 mb-3 text-center">
<div>
<p className="text-xs text-zinc-500">Entry</p>
<p className="text-xs font-mono text-zinc-300">
${pos.entryPrice.toFixed(8)}
</p>
</div>
<div>
<p className="text-xs text-zinc-500">Current</p>
<p className="text-xs font-mono text-zinc-300">
${pos.currentPrice.toFixed(8)}
</p>
</div>
<div>
<p className="text-xs text-zinc-500">Amount</p>
<p className="text-xs font-mono text-zinc-300">
${pos.amountUsd.toFixed(2)}
</p>
</div>
</div>

{/* TP Progress bar */}
<div className="mb-2">
<div className="flex justify-between text-xs text-zinc-500 mb-1">
<span>TP Progress</span>
<span>{pos.pnlPercent.toFixed(1)}% / {pos.tpTarget}%</span>
</div>
<div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
<div
className={clsx(
"h-full rounded-full transition-all",
isWin ? "bg-green-400" : "bg-red-400"
)}
style={{ width: `${Math.max(tpProgress, 2)}%` }}
/>
</div>
</div>

{/* Footer */}
<div className="flex items-center gap-2 mt-2">
<Clock className="w-3 h-3 text-zinc-600" />
<span className="text-xs text-zinc-600">
Opened {formatAge(pos.openedAt)}
</span>
<Badge variant="outline" className="ml-auto text-xs border-zinc-700 text-zinc-500 py-0">
SL: -{Math.abs(pos.slTarget)}%
</Badge>
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
