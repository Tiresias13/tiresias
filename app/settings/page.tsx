"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WalletButton } from "@/components/WalletButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle } from "lucide-react";

export default function SettingsPage() {
const [saved, setSaved] = useState(false);

const [settings, setSettings] = useState({
maxBuyPerTrade: "0.1",
minOrganicScore: "50",
takeProfitPercent: "50",
stopLossPercent: "30",
autoSell: false,
slippageBps: "300",
chain: "solana",
});

function handleChange(key: string, value: string | boolean) {
setSettings((prev) => ({ ...prev, [key]: value }));
}

function handleSave() {
localStorage.setItem("tiresias_settings", JSON.stringify(settings));
setSaved(true);
setTimeout(() => setSaved(false), 2000);
}
return(
<div className="flex min-h-screen bg-zinc-950">
<Sidebar />
<main className="ml-56 flex-1 flex flex-col">
{/* Top bar */}
<header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
<span className="text-sm font-semibold text-white">Settings</span>
<WalletButton />
</header>

<div className="px-6 py-5 max-w-xl">
{/* Trading Parameters */}
<Card className="bg-zinc-900 border-zinc-800 p-5 mb-4">
<h2 className="text-sm font-semibold text-white mb-4">
Trading Parameters
</h2>

<div className="space-y-4">
<div>
<label className="text-xs text-zinc-400 block mb-1.5">
Max Buy Per Trade (SOL)
</label>
<input
type="number"
value={settings.maxBuyPerTrade}
onChange={(e) => handleChange("maxBuyPerTrade", e.target.value)}
className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-400 transition-colors"
step="0.05"
min="0.01"
max="10"
/>
<p className="text-xs text-zinc-600 mt-1">
Maximum SOL spent per signal execution
</p>
</div>

<div>
<label className="text-xs text-zinc-400 block mb-1.5">
Minimum Organic Score
</label>
<input
type="number"
value={settings.minOrganicScore}
onChange={(e) => handleChange("minOrganicScore", e.target.value)}
className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-400 transition-colors"
step="5"
min="0"
max="100"
/>
<p className="text-xs text-zinc-600 mt-1">
Only show tokens with score above this threshold
</p>
</div>

<div>
<label className="text-xs text-zinc-400 block mb-1.5">
Slippage Tolerance (bps)
</label>
<div className="flex gap-2">
{["100", "300", "500", "1000"].map((bps) => (
<button
key={bps}
onClick={() => handleChange("slippageBps", bps)}
className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
settings.slippageBps === bps
? "bg-amber-400 text-black"
: "bg-zinc-800 text-zinc-400 hover:text-white"
}`}
>
{parseInt(bps) / 100}%
</button>
))}
</div>
</div>
</div>
</Card>

{/* Auto-sell */}
<Card className="bg-zinc-900 border-zinc-800 p-5 mb-4">
<div className="flex items-center justify-between mb-4">
<div>
<h2 className="text-sm font-semibold text-white">Auto-Sell</h2>
<p className="text-xs text-zinc-500 mt-0.5">
Automatically sell when TP or SL is hit
</p>
</div>
<Switch
checked={settings.autoSell}
onCheckedChange={(v) => handleChange("autoSell", v)}
className="data-[state=checked]:bg-amber-400"
/>
</div>

{settings.autoSell && (
<div className="space-y-4">
<div>
<label className="text-xs text-zinc-400 block mb-1.5">
Take Profit (%)
</label>
<input
type="number"
value={settings.takeProfitPercent}
onChange={(e) => handleChange("takeProfitPercent", e.target.value)}
className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-400 transition-colors"
step="10"
min="10"
max="1000"
/>
</div>
<div>
<label className="text-xs text-zinc-400 block mb-1.5">
Stop Loss (%)
</label>
<input
type="number"
value={settings.stopLossPercent}
onChange={(e) => handleChange("stopLossPercent", e.target.value)}
className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-400 transition-colors"
step="5"
min="5"
max="100"
/>
</div>
</div>
)}
</Card>

{/* Chain */}
<Card className="bg-zinc-900 border-zinc-800 p-5 mb-6">
<h2 className="text-sm font-semibold text-white mb-4">Network</h2>
<div className="flex gap-2">
{["solana", "bsc", "eth"].map((chain) => (
<button
key={chain}
onClick={() => handleChange("chain", chain)}
className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase transition-colors ${
settings.chain === chain
? "bg-amber-400 text-black"
: chain !== "solana"
? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
: "bg-zinc-800 text-zinc-400 hover:text-white"
}`}
disabled={chain !== "solana"}
>
{chain}
{chain !== "solana" && (
<span className="ml-1 text-zinc-700">soon</span>
)}
</button>
))}
</div>
</Card>

{/* Save button */}
<Button
onClick={handleSave}
className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold"
>
{saved ? (
<span className="flex items-center gap-2">
<CheckCircle className="w-4 h-4" />
Saved!
</span>
) : (
"Save Settings"
)}
</Button>
</div>
</main>
</div>
);
}
