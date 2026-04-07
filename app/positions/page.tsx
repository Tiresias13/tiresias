"use client";

import { useState } from "react";
import { Eye, TrendingUp, TrendingDown, Clock } from "lucide-react";
import clsx from "clsx";
import { Sidebar } from "@/components/Sidebar";
import { WalletButton } from "@/components/WalletButton";

const DEMO_POSITIONS = [
{
symbol: "SOL",
name: "Solana",
entryPrice: 142.5,
currentPrice: 158.3,
amountUsd: 1000,
pnlUsd: 110.88,
pnlPercent: 11.09,
tpTarget: 20,
slTarget: 10,
openedAt: Math.floor(Date.now() / 1000) - 3600,
},
{
symbol: "WIF",
name: "dogwifhat",
entryPrice: 0.00000312,
currentPrice: 0.00000289,
amountUsd: 500,
pnlUsd: -36.86,
pnlPercent: -7.37,
tpTarget: 50,
slTarget: 15,
openedAt: Math.floor(Date.now() / 1000) - 7200,
},
];

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
}

const totalPnl = positions.reduce((a, p) => a + p.pnlUsd, 0);
const totalValue = positions.reduce((a, p) => a + p.amountUsd, 0);
return (
<div className="flex h-screen bg-white overflow-hidden font-mono text-black">
<Sidebar />

<div className="flex flex-col flex-1 ml-14 overflow-hidden">
<header className="flex-shrink-0 border-b border-zinc-200 bg-white px-4 py-2.5 flex items-center gap-3">
<Eye className="w-4 h-4 text-black" />
<span className="font-bold text-black text-sm tracking-widest">TIRESIAS</span>
<span className="text-zinc-300 text-xs">/ Positions</span>
<div className="ml-auto">
<WalletButton />
</div>
</header>

<div className="flex-1 overflow-y-auto px-6 py-5">
{/* Summary */}
<div className="grid grid-cols-3 gap-4 mb-6">
{[
{ label: "Open Positions", value: positions.length.toString() },
{
label: "Total PnL",
value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
color: totalPnl >= 0 ? "text-black" : "text-zinc-400",
},
{ label: "Total Value", value: `$${totalValue.toFixed(2)}` },
].map(({ label, value, color }) => (
<div key={label} className="border border-zinc-200 p-4">
<p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
<p className={clsx("text-2xl font-bold tabular-nums", color || "text-black")}>{value}</p>
</div>
))}
</div>

{/* Positions list */}
{positions.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-300">
<Eye className="w-8 h-8 mb-3" />
<p className="text-xs uppercase tracking-widest">No open positions</p>
</div>
) : (
<div className="flex flex-col gap-2">
{positions.map((pos, i) => {
const isWin = pos.pnlPercent >= 0;
const tpProgress = Math.min((pos.pnlPercent / pos.tpTarget) * 100, 100);

return (
<div key={i} className="border border-zinc-200 p-4">
<div className="flex items-center justify-between mb-3">
<div>
<span className="text-sm font-bold text-black">{pos.symbol}</span>
<span className="text-xs text-zinc-400 ml-2">{pos.name}</span>
</div>
<div className="flex items-center gap-3">
<span
className={clsx(
"flex items-center gap-1 text-sm font-bold font-mono",
isWin ? "text-black" : "text-zinc-400"
)}
>
{isWin ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
{isWin ? "+" : ""}{pos.pnlPercent.toFixed(1)}%
<span className="text-xs font-normal ml-1">
(${pos.pnlUsd > 0 ? "+" : ""}{pos.pnlUsd.toFixed(2)})
</span>
</span>
<button
onClick={() => handleClose(i)}
className="px-3 py-1 text-xs font-bold border border-zinc-300 text-zinc-500 hover:border-black hover:text-black transition-colors uppercase"
>
Close
</button>
</div>
</div>

<div className="grid grid-cols-3 gap-3 mb-3 text-center">
{[
{ label: "Entry", value: `$${pos.entryPrice.toFixed(8)}` },
{ label: "Current", value: `$${pos.currentPrice.toFixed(8)}` },
{ label: "Amount", value: `$${pos.amountUsd.toFixed(2)}` },
].map(({ label, value }) => (
<div key={label}>
<p className="text-xs text-zinc-400 mb-0.5">{label}</p>
<p className="text-xs font-mono text-black">{value}</p>
</div>
))}
</div>

<div className="mb-2">
<div className="flex justify-between text-xs text-zinc-400 mb-1">
<span>TP Progress</span>
<span>{pos.pnlPercent.toFixed(1)}% / {pos.tpTarget}%</span>
</div>
<div className="w-full h-px bg-zinc-100">
<div
className="h-px bg-black transition-all"
style={{ width: `${Math.max(tpProgress, 1)}%` }}
/>
</div>
</div>

<div className="flex items-center gap-2 mt-2">
<Clock className="w-3 h-3 text-zinc-300" />
<span className="text-xs text-zinc-400">Opened {formatAge(pos.openedAt)}</span>
<span className="ml-auto text-xs text-zinc-400 font-mono">
SL: -{Math.abs(pos.slTarget)}%
</span>
</div>
</div>
);
})}
</div>
)}
</div>
</div>
</div>
);
}
