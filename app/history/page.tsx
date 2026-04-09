"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import clsx from "clsx";
import { Sidebar } from "@/components/Sidebar";
import { WalletButton } from "@/components/WalletButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface TradeRecord {
id: string;
token_symbol: string;
token_address: string;
entry_price: number;
exit_price: number;
amount_sol: number;
pnl_percent: number;
pnl_sol: number;
opened_at: number;
closed_at: number;
}

function formatDate(ts: number): string {
return new Date(ts * 1000).toLocaleString("id-ID", {
day: "numeric",
month: "short",
hour: "2-digit",
minute: "2-digit",
});
}

export default function HistoryPage() {
const { publicKey } = useWallet();
const [history, setHistory] = useState<TradeRecord[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
if (!publicKey) return;
const wallet = publicKey.toString();

const loadHistory = async () => {
setLoading(true);
const { data } = await supabase
.from("trade_history")
.select("*")
.eq("wallet_address", wallet)
.order("closed_at", { ascending: false })
.limit(100);

if (data) setHistory(data);
setLoading(false);
};

loadHistory();
}, [publicKey]);

const wins = history.filter((h) => h.pnl_percent >= 0).length;
const losses = history.filter((h) => h.pnl_percent < 0).length;
const winRate = history.length > 0 ? (wins / history.length) * 100 : 0;
const totalPnlSol = history.reduce((a, h) => a + h.pnl_sol, 0);
const avgPnlSol = history.length > 0 ? totalPnlSol / history.length : 0;return (
<div className="flex min-h-screen bg-zinc-950">
<Sidebar />
<main className="ml-56 flex-1 flex flex-col">
<header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
<span className="text-sm font-semibold text-white">Trade History</span>
<WalletButton />
</header>

<div className="px-6 py-5">
{/* Summary cards */}
<div className="grid grid-cols-4 gap-4 mb-6">
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Win Rate</p>
<p className={clsx("text-2xl font-bold", winRate >= 50 ? "text-green-400" : "text-red-400")}>
{winRate.toFixed(0)}%
</p>
<p className="text-xs text-zinc-600 mt-0.5">{wins}W / {losses}L</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Total PnL</p>
<p className={clsx("text-2xl font-bold", totalPnlSol >= 0 ? "text-green-400" : "text-red-400")}>
{totalPnlSol >= 0 ? "+" : ""}{totalPnlSol.toFixed(4)} SOL
</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Avg PnL</p>
<p className={clsx("text-2xl font-bold", avgPnlSol >= 0 ? "text-green-400" : "text-red-400")}>
{avgPnlSol >= 0 ? "+" : ""}{avgPnlSol.toFixed(4)} SOL
</p>
</Card>
<Card className="bg-zinc-900 border-zinc-800 p-4">
<p className="text-xs text-zinc-500 mb-1">Total Trades</p>
<p className="text-2xl font-bold text-white">{history.length}</p>
</Card>
</div>

{/* History list */}
{!publicKey ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-600">
<p className="text-sm">Connect wallet to see history</p>
</div>
) : loading ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-600">
<p className="text-sm">Loading...</p>
</div>
) : history.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-600">
<p className="text-sm">No trade history yet</p>
</div>
) : (
<div className="flex flex-col gap-3">
{history.map((trade) => {
const isWin = trade.pnl_percent >= 0;
return (
<Card key={trade.id} className="bg-zinc-900 border-zinc-800 p-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className={clsx(
"w-8 h-8 rounded-full flex items-center justify-center",
isWin ? "bg-green-400/10" : "bg-red-400/10"
)}>
{isWin
? <TrendingUp className="w-4 h-4 text-green-400" />
: <TrendingDown className="w-4 h-4 text-red-400" />}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-sm font-semibold text-white">{trade.token_symbol}</span>
<Badge className={clsx(
"text-xs border-0 py-0",
isWin ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
)}>
{isWin ? "WIN" : "LOSS"}
</Badge>
</div>
<p className="text-xs text-zinc-500 font-mono">{trade.token_address.slice(0, 8)}...</p>
</div>
</div>

<div className="flex items-center gap-6 text-right">
<div>
<p className="text-xs text-zinc-500">Entry → Exit</p>
<p className="text-xs font-mono text-zinc-400">
${trade.entry_price.toFixed(8)} → ${trade.exit_price.toFixed(8)}
</p>
</div>
<div>
<p className="text-xs text-zinc-500">PnL</p>
<p className={clsx("text-sm font-bold", isWin ? "text-green-400" : "text-red-400")}>
{isWin ? "+" : ""}{trade.pnl_percent.toFixed(1)}%
<span className="text-xs ml-1">
({trade.pnl_sol > 0 ? "+" : ""}{trade.pnl_sol.toFixed(4)} SOL)
</span>
</p></div>
<div className="flex items-center gap-1 text-xs text-zinc-600">
<Clock className="w-3 h-3" />
{formatDate(trade.closed_at)}
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
