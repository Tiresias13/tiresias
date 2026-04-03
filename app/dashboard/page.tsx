 "use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Sidebar } from "@/components/Sidebar";
import { WalletButton } from "@/components/WalletButton";
import { SignalCard } from "@/components/SignalCard";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { fetchRankTokens } from "@/lib/ave";
import { calculateOrganicScore, ScoredToken } from "@/lib/scoring";
import { getSwapQuote, executeSwap } from "@/lib/jupiter";
import { DEMO_TOKENS } from "@/lib/demoData";
import { RefreshCw, Radio } from "lucide-react";

const TOPICS = ["new", "hot", "meme", "gainer"];
const MIN_SCORE_DEFAULT = 50;

export default function DashboardPage() {
const { connected, publicKey, signTransaction } = useWallet();
const { connection } = useConnection();

const [isDemoMode, setIsDemoMode] = useState(true);
const [tokens, setTokens] = useState<ScoredToken[]>([]);
const [loading, setLoading] = useState(false);
const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
const [activeTopic, setActiveTopic] = useState("new");
const [minScore, setMinScore] = useState(MIN_SCORE_DEFAULT);
const [notification, setNotification] = useState<string | null>(null);

// Load tokens
const loadTokens = useCallback(async () => {
setLoading(true);
try {
if (isDemoMode) {
const scored = DEMO_TOKENS.map((t) => t as ScoredToken);
setTokens(scored);
} else {
const raw = await fetchRankTokens(activeTopic, 50);
const scored = raw
.map(calculateOrganicScore)
.sort((a, b) => b.organicScore - a.organicScore);
setTokens(scored);
}
setLastUpdated(new Date());
} finally {
setLoading(false);
}
}, [isDemoMode, activeTopic]);

// Initial load + auto refresh 30s
useEffect(() => {
loadTokens();
const interval = setInterval(loadTokens, 30_000);
return () => clearInterval(interval);
}, [loadTokens]);

async function handleExecute(token: ScoredToken, amountSol: number) {
if (isDemoMode) {
setNotification(`[DEMO] Buy ${amountSol} SOL of ${token.symbol} executed!`);
setTimeout(() => setNotification(null), 3000);
return;
}

if (!connected || !publicKey || !signTransaction) {
setNotification("Connect wallet dulu!");
setTimeout(() => setNotification(null), 3000);
return;
}

try {
setNotification(`Getting quote for ${token.symbol}...`);
const quote = await getSwapQuote(token.token, amountSol);
if (!quote) {
setNotification("Gagal mendapatkan quote. Coba lagi.");
setTimeout(() => setNotification(null), 3000);
return;
}

setNotification(`Menunggu approval Phantom...`);
const result = await executeSwap(quote, publicKey, signTransaction, connection);

if (result.success) {
setNotification(`✅ Buy ${token.symbol} berhasil! TX: ${result.txid?.slice(0, 8)}...`);
} else {
setNotification(`❌ Gagal: ${result.error}`);
}
setTimeout(() => setNotification(null), 5000);
} catch (err) {
setNotification("Error saat eksekusi swap.");
setTimeout(() => setNotification(null), 3000);
}
}

const visibleTokens = tokens.filter((t) => t.organicScore >= minScore);return (
<div className="flex min-h-screen bg-zinc-950">
<Sidebar />

<main className="ml-56 flex-1 flex flex-col">
{/* Top bar */}
<header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="flex items-center gap-2">
<Radio className="w-4 h-4 text-amber-400" />
<span className="text-sm font-semibold text-white">Signal Feed</span>
</div>
{lastUpdated && (
<span className="text-xs text-zinc-500">
Updated {lastUpdated.toLocaleTimeString()}
</span>
)}
{loading && (
<RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />
)}
</div>

<div className="flex items-center gap-4">
{/* Demo mode toggle */}
<div className="flex items-center gap-2">
<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
isDemoMode
? "bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/40"
: "bg-green-400/15 text-green-400 ring-1 ring-green-400/40"
}`}>
<span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
isDemoMode ? "bg-amber-400" : "bg-green-400"
}`} />
{isDemoMode ? "DEMO" : "LIVE"}
</div>
<Switch
checked={isDemoMode}
onCheckedChange={setIsDemoMode}
className="data-[state=checked]:bg-amber-400"
/>
</div>
<WalletButton />
</div>
</header>

<div className="flex-1 px-6 py-5">
{/* Notification */}
{notification && (
<div className="mb-4 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200">
{notification}
</div>
)}

{/* Filters */}
<div className="flex items-center gap-3 mb-5 flex-wrap">
{/* Topic filter */}
<div className="flex gap-1.5">
{TOPICS.map((topic) => (
<button
key={topic}
onClick={() => setActiveTopic(topic)}
className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
activeTopic === topic
? "bg-amber-400 text-black"
: "bg-zinc-800 text-zinc-400 hover:text-white"
}`}
>
{topic}
</button>
))}
</div>

{/* Min score filter */}
<div className="flex items-center gap-2 ml-auto">
<span className="text-xs text-zinc-500">Min Score:</span>
{[0, 30, 50, 70].map((s) => (
<button
key={s}
onClick={() => setMinScore(s)}
className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
minScore === s
? "bg-zinc-600 text-white"
: "bg-zinc-800 text-zinc-500 hover:text-white"
}`}
>
{s}+
</button>
))}
</div>

<Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
{visibleTokens.length} signals
</Badge>
</div>

{/* Token grid */}
{visibleTokens.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 text-zinc-600">
<Radio className="w-8 h-8 mb-3" />
<p className="text-sm">Scanning for signals...</p>
</div>
) : (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
{visibleTokens.map((token) => (
<SignalCard
key={token.token}
token={token}
isDemoMode={isDemoMode}
onExecute={handleExecute}
minScore={minScore}
/>
))}
</div>
)}
</div>
</main>
</div>
);
}

