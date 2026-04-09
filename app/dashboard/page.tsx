"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { judgeToken, ScoredToken } from "@/lib/scoring";
import { getSwapQuote, executeSwap } from "@/lib/jupiter";
import { DEMO_TOKENS } from "@/lib/demoData";
import { Switch } from "@/components/ui/switch";
import { clsx } from "clsx";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { fetchRankTokens, fetchSmartWallets, fetchWalletTokens, fetchEnrichedToken, WalletToken } from "@/lib/ave";
const DashboardWithProvider = dynamic(
() => Promise.resolve(function Dashboard() {
return <DashboardInner />;
}),
{ ssr: false }
);

export default function AgentPage() {
return <DashboardWithProvider />;
}

import {
Eye, Radio, RefreshCw, SkipForward, CheckCircle2,
AlertTriangle, Zap, Shield, TrendingUp, Clock,
Users, Settings2, Waves,
} from "lucide-react";
import {
WindowManagerProvider,
FloatingWindow,
Taskbar,
useWindowManager,
} from "@/components/WindowManager";
import { Sidebar } from "@/components/Sidebar";

type AgentStatus = "idle" | "scanning" | "judging" | "acting";
type AgentMode = "signal" | "auto";

interface LogEntry {
id: string;
timestamp: number;
token: ScoredToken;
action: "signal" | "skip" | "executed" | "force_skip";
txid?: string;
}

interface Position {
token: ScoredToken;
entryPrice: number;
amountSol: number;
openedAt: number;
pnlPercent: number;
pnlSol: number;
entryVolume: number;
}

interface SmartWallet {
wallet_address: string;
tag?: string;
total_profit: number;
win_rate?: number;
trade_count?: number;
}

interface TradeHistory {
id: string;
token: ScoredToken;
entryPrice: number;
exitPrice: number;
amountSol: number;
openedAt: number;
closedAt: number;
pnlPercent: number;
pnlSol: number;
closeReason?: "TP" | "SL" | "VOL" | "PARTIAL_TP" | "MANUAL";
}

function formatAge(launchAt: number): string {
const now = Math.floor(Date.now() / 1000);
const mins = Math.floor((now - launchAt) / 60);
if (mins < 60) return `${mins}m`;
return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatUsd(val: number | undefined | null): string {
if (val === undefined || val === null || isNaN(val)) return "-";
if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
return `$${val.toFixed(0)}`;
}

function formatTime(ts: number): string {
return new Date(ts * 1000).toLocaleTimeString([], {
hour: "2-digit", minute: "2-digit", second: "2-digit",
});
}

const DEMO_JUDGED = DEMO_TOKENS.map((t) => judgeToken(t as any));
const TOPICS = ["new", "hot", "meme", "gainer"];

async function fetchLLMInsight(token: ScoredToken) {
try {
const res = await fetch("/api/insight", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ tokenData: token, scores: {
walletCleanliness: token.subScores.walletCleanliness,
liquiditySafety: token.subScores.liquiditySafety,
momentum: token.subScores.momentum,
ageFactor: token.subScores.ageFactor,
finalScore: token.finalScore,
verdict: token.verdict,
}}),
});
const data = await res.json();
return {
insight: data.insight || null,
verdict: data.verdict || null,
confidence: data.confidence || null,
risk: data.risk || null,
};
} catch {
return { insight: null, verdict: null, confidence: null, risk: null };
}
}
function scoreColor(score: number) {
  if (score >= 70) return "text-black";
  if (score >= 45) return "text-zinc-500";
  return "text-zinc-300";
}

function topicLabel(topic: string) {
  const map: Record<string, string> = { new: "NEW", hot: "HOT", meme: "MEME", gainer: "GAIN" };
  return map[topic] || topic.toUpperCase();
}

function actionIcon(action: LogEntry["action"]) {
  switch (action) {
    case "signal": return <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />;
    case "executed": return <Zap className="w-3.5 h-3.5 text-black flex-shrink-0" />;
    case "force_skip": return <AlertTriangle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />;
    case "skip": return <SkipForward className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />;
  }
}

function actionLabel(action: LogEntry["action"]) {
  switch (action) {
    case "signal": return <span className="text-black font-bold text-xs border border-black px-1.5 py-0.5">SIGNAL</span>;
    case "executed": return <span className="text-black font-bold text-xs border border-black px-1.5 py-0.5">EXECUTED</span>;
    case "force_skip": return <span className="text-zinc-400 font-bold text-xs">FORCE SKIP</span>;
    case "skip": return <span className="text-zinc-400 font-bold text-xs">SKIP</span>;
  }
}

// ============================================================
// Feed Window Content
// ============================================================
function FeedWindowContent({
  logs, activeFilter, setActiveFilter, selectedLog, setSelectedLog,
  alertEntry, alertCountdown, amountSol, onBuy, onSkip,
}: {
  logs: LogEntry[];
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  selectedLog: LogEntry | null;
  setSelectedLog: (e: LogEntry) => void;
  alertEntry: LogEntry | null;
  alertCountdown: number;
  amountSol: number;
  onBuy: () => void;
  onSkip: () => void;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const filtered = logs.filter((e) => {
    if (activeFilter === "signal") return e.action === "signal" || e.action === "executed";
    if (activeFilter === "skip") return e.action === "skip" || e.action === "force_skip";
    return true;
  });return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-3 py-2 border-b border-zinc-100 flex items-center gap-2">
        <Radio className="w-3 h-3 text-zinc-400" />
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Feed</span>
        <div className="ml-auto flex gap-3">
          {["all", "signal", "skip"].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={clsx("text-xs uppercase transition-colors",
                activeFilter === f ? "text-black font-bold" : "text-zinc-400 hover:text-zinc-600"
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-px">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-300 py-12">
            <Eye className="w-8 h-8 mb-3" />
            <p className="text-xs uppercase tracking-widest">Waiting for signal</p>
          </div>
        ) : (
          filtered.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedLog(entry)}
              className={clsx(
                "flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-all border-l-2",
                selectedLog?.id === entry.id
                  ? "border-l-black bg-zinc-50"
                  : "border-l-transparent hover:border-l-zinc-300 hover:bg-zinc-50",
                entry.action === "skip" || entry.action === "force_skip" ? "opacity-30 hover:opacity-60" : ""
              )}
            >
              {actionIcon(entry.action)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-black font-bold text-xs tracking-wide">{entry.token.symbol}</span>
                  {entry.token.topic && (
                    <span className="text-xs text-zinc-300 uppercase">{topicLabel(entry.token.topic)}</span>
                  )}
                  {actionLabel(entry.action)}
                  <span className={clsx("text-xs font-mono ml-auto", scoreColor(entry.token.finalScore))}>
                    {entry.token.finalScore}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed truncate">
                  {entry.action === "force_skip"
                    ? entry.token.contrarian.forceSkipReason
                    : entry.token.llmInsight || entry.token.traderInsight}
                </p>
              </div>
              <span className="text-xs text-zinc-300 font-mono flex-shrink-0">{formatTime(entry.timestamp)}</span>
            </div>
          ))
        )}
      </div>

      {alertEntry && (
        <div className="flex-shrink-0 border-t border-black p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-black font-bold text-xs uppercase tracking-widest">
              ⬤ Signal — {alertEntry.token.symbol}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              auto-skip <span className="text-black font-bold">{alertCountdown}s</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={onBuy}
              className="flex-1 py-2 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
              BUY {amountSol} SOL
            </button>
            <button onClick={onSkip}
              className="flex-1 py-2 border border-zinc-300 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:border-black hover:text-black transition-colors">
              SKIP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function IntelWindowContent({ selectedLog }: { selectedLog: LogEntry | null }) {
  if (!selectedLog) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-300">
        <Shield className="w-6 h-6 mb-2" />
        <p className="text-xs uppercase tracking-widest">Select a signal from Feed</p>
      </div>
    );
  }
  return(
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      <div className="border border-zinc-100 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400 uppercase tracking-widest">Score</span>
          <span className={clsx("text-3xl font-bold tabular-nums", scoreColor(selectedLog.token.finalScore))}>
            {selectedLog.token.finalScore}
          </span>
        </div>
        <div className="text-xs text-zinc-400 text-right mb-4 uppercase tracking-widest">
          {selectedLog.token.verdict}
        </div>
        {[
          { label: "Wallet Cleanliness", value: selectedLog.token.subScores.walletCleanliness },
          { label: "Liquidity Safety", value: selectedLog.token.subScores.liquiditySafety },
          { label: "Momentum", value: selectedLog.token.subScores.momentum },
          { label: "Age Factor", value: selectedLog.token.subScores.ageFactor },
        ].map(({ label, value }) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">{label}</span>
              <span className="text-zinc-500 font-mono">{Math.round(value)}</span>
            </div>
            <div className="h-px bg-zinc-100 w-full">
              <div className="h-px bg-black transition-all" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="border border-zinc-100 p-4">
        <p className="text-xs text-black font-bold uppercase tracking-widest mb-3">AI Analysis</p>
        <p className="text-xs text-zinc-500 leading-relaxed mb-3">{selectedLog.token.reasoning}</p>
        {selectedLog.token.llmVerdict && (
          <div className="flex items-center gap-3 mb-2">
            <span className={clsx("text-xs font-bold px-2 py-1 border",
              selectedLog.token.llmVerdict === "BUY" ? "border-black text-black" :
              selectedLog.token.llmVerdict === "WATCH" ? "border-zinc-400 text-zinc-500" :
              "border-zinc-200 text-zinc-400"
            )}>
              {selectedLog.token.llmVerdict}
            </span>
            {selectedLog.token.llmConfidence && (
              <span className="text-xs text-zinc-400 font-mono">{selectedLog.token.llmConfidence}/10</span>
            )}
          </div>
        )}
        {(selectedLog.token.llmInsight || selectedLog.token.traderInsight) && (
          <p className="text-xs text-zinc-500 leading-relaxed">
            {selectedLog.token.llmInsight || selectedLog.token.traderInsight}
          </p>
        )}
        {selectedLog.token.llmRisk && (
          <p className="text-xs text-zinc-400 mt-2">Risk: {selectedLog.token.llmRisk}</p>
        )}
      </div>

      {(selectedLog.token.contrarian.warning || selectedLog.token.contrarian.forceSkip) && (
        <div className="border border-zinc-200 p-3 space-y-1">
          {selectedLog.token.contrarian.warning && (
            <p className="text-xs text-zinc-500">⚠ {selectedLog.token.contrarian.warning}</p>
          )}
          {selectedLog.token.contrarian.forceSkip && (
            <p className="text-xs text-zinc-500">✕ {selectedLog.token.contrarian.forceSkipReason}</p>
          )}
        </div>
      )}

      <div className="border border-zinc-100 p-4 space-y-2">
        <p className="text-xs text-black font-bold uppercase tracking-widest mb-3">Stats</p>
        {[
          { icon: <TrendingUp className="w-3 h-3" />, label: "Price", value: `$${selectedLog.token.current_price_usd.toFixed(8)}` },
          { icon: <Users className="w-3 h-3" />, label: "Holders", value: selectedLog.token.holders.toLocaleString() },
          { icon: <Clock className="w-3 h-3" />, label: "Age", value: formatAge(selectedLog.token.launch_at) },
          { icon: <Shield className="w-3 h-3" />, label: "Mkt Cap", value: formatUsd(selectedLog.token.market_cap) },
        ].map(({ icon, label, value }) => (<div key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-zinc-400">{icon}{label}</span>
            <span className="text-black font-mono">{value}</span>
          </div>
        ))}
      </div>

      <div className="border border-zinc-100 p-4 space-y-2">
        <p className="text-xs text-black font-bold uppercase tracking-widest mb-3">Wallet Intel</p>
        {[
          { label: "Cluster", value: selectedLog.token.cluster_wallet_rate ?? 0 },
          { label: "Insider", value: selectedLog.token.insider_wallet_rate ?? 0 },
          { label: "Phishing", value: selectedLog.token.phishing_wallet_rate ?? 0 },
          { label: "Bundle", value: selectedLog.token.bundle_wallet_rate ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">{label}</span>
            <span className={clsx("font-mono",
              value > 10 ? "text-black font-bold" : value > 5 ? "text-zinc-500" : "text-zinc-300"
            )}>
              {value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function TrappedWhaleWindowContent() {
const [wallets, setWallets] = useState<SmartWallet[]>([]);
const [loading, setLoading] = useState(false);
const [chain, setChain] = useState("solana");
const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
const [loadingTokens, setLoadingTokens] = useState(false);

useEffect(() => {
setLoading(true);
fetchSmartWallets(chain, "total_profit", 20)
.then(setWallets)
.finally(() => setLoading(false));
}, [chain]);

const handleWalletClick = async (address: string) => {
if (selectedWallet === address) {
setSelectedWallet(null);
setWalletTokens([]);
return;
}
setSelectedWallet(address);
setLoadingTokens(true);
const tokens = await fetchWalletTokens(address, chain, "profit");
console.log("wallet tokens raw:", JSON.stringify(tokens[0]));
setWalletTokens(tokens);
setLoadingTokens(false);
};return (
<div className="flex flex-col h-full">
<div className="flex-shrink-0 px-3 py-2 border-b border-zinc-100 flex items-center gap-2">
<Waves className="w-3 h-3 text-zinc-400" />
<span className="text-xs font-bold text-black uppercase tracking-widest">Smart Wallets</span>
<div className="ml-auto flex gap-1">
{["solana", "eth", "bsc"].map((c) => (
<button key={c} onClick={() => { setChain(c); setSelectedWallet(null); setWalletTokens([]); }}
className={clsx("px-2 py-0.5 text-xs uppercase transition-colors",
chain === c ? "text-black font-bold border-b border-black" : "text-zinc-400 hover:text-zinc-600"
)}>
{c}
</button>
))}
</div>
</div>

<div className="flex-1 overflow-y-auto px-3 py-2">
{loading ? (
<div className="flex items-center justify-center h-full text-zinc-300 py-12">
<RefreshCw className="w-4 h-4 animate-spin mr-2" />
<span className="text-xs">Loading...</span>
</div>
) : wallets.length === 0 ? (
<div className="flex flex-col items-center justify-center h-full text-zinc-300 py-12">
<Waves className="w-6 h-6 mb-2" />
<p className="text-xs uppercase tracking-widest">No data</p>
</div>
) : (
<div className="space-y-px">
{wallets.map((w, i) => (
<div key={w.wallet_address}>
<div
onClick={() => handleWalletClick(w.wallet_address)}
className={clsx(
"flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-l-2",
selectedWallet === w.wallet_address
? "border-l-black bg-zinc-50"
: "border-l-transparent hover:border-l-zinc-300 hover:bg-zinc-50"
)}
>
<span className="text-xs text-zinc-300 font-mono w-4">{i + 1}</span>
<div className="flex-1 min-w-0">
<p className="text-xs font-mono text-black truncate">
{w.wallet_address.slice(0, 6)}...{w.wallet_address.slice(-4)}
</p>
{w.tag && (
<p className="text-xs text-zinc-400 truncate">{w.tag.slice(0, 40)}</p>
)}
</div>
<div className="text-right flex-shrink-0">
<p className={clsx("text-xs font-mono font-bold",
w.total_profit > 0 ? "text-black" : "text-zinc-400"
)}>
{w.total_profit > 0 ? "+" : ""}{formatUsd(w.total_profit)}
</p>
{w.win_rate !== undefined && (
<p className="text-xs text-zinc-400 font-mono">
{(w.win_rate * 100).toFixed(0)}% WR
</p>
)}
</div>
</div>

{selectedWallet === w.wallet_address && (
<div className="bg-zinc-50 border-l-2 border-l-black px-3 py-2 space-y-1">
{loadingTokens ? (
<div className="flex items-center gap-2 py-2">
<RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
<span className="text-xs text-zinc-400">Loading tokens...</span>
</div>
) : walletTokens.length === 0 ? (
<p className="text-xs text-zinc-400 py-2">No token data</p>
) : (
<>
<div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-200">
<span>Token</span>
<div className="flex gap-4">
<span className="w-20 text-right">Value</span>
<span className="w-20 text-right">Profit</span>
<span className="w-14 text-right">ROI</span>
</div>
</div>
{walletTokens.slice(0, 10).map((t) => (
<div key={t.token} className="flex items-center justify-between text-xs py-1">
<div className="flex-1 min-w-0">
<span className="font-bold text-black">{t.symbol}</span>
</div>
<div className="flex gap-4 text-right flex-shrink-0">
<span className="font-mono text-zinc-500 w-20 text-right">
{t.balance_usd ? formatUsd(parseFloat(t.balance_usd)) : "-"}
</span>
<span className={clsx("font-mono w-20 text-right",
t.total_profit && parseFloat(t.total_profit) > 0 ? "text-black font-bold" : "text-zinc-400"
)}>
{t.total_profit ? (parseFloat(t.total_profit) > 0 ? "+" : "") + formatUsd(parseFloat(t.total_profit)) : "-"}
</span>
<span className={clsx("font-mono w-14 text-right",
t.total_profit_ratio && parseFloat(t.total_profit_ratio) > 0 ? "text-black" : "text-zinc-400"
)}>
{t.total_profit_ratio ? (parseFloat(t.total_profit_ratio) * 100).toFixed(1) + "%" : "-"}
</span>
</div>
</div>
))}
</>
)}
</div>
)}
</div>
))}
</div>
)}
</div>
</div>
);
}
// ============================================================
// Positions Window Content
// ============================================================
function PositionsWindowContent({ positions, onClose }: {
  positions: Position[];
  onClose: (index: number) => void;
}) {
  const totalPnl = positions.reduce((a, p) => a + p.pnlPercent, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-3 py-2 border-b border-zinc-100 flex items-center gap-2">
        <span className="text-xs font-bold text-black uppercase tracking-widest">Positions</span>
        <span className="ml-auto text-xs font-mono text-zinc-400">{positions.length} open</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-300 py-12">
            <p className="text-xs uppercase tracking-widest">No open positions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((pos, i) => {
              const isWin = pos.pnlPercent >= 0;
              return (
                <div key={i} className="border border-zinc-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-black">{pos.token.symbol}</span>
                    <div className="flex items-center gap-2">
                    <div className="text-right">
                    <span className={clsx("text-xs font-mono font-bold block",
                    isWin ? "text-black" : "text-zinc-400"
                    )}>
                        {isWin ? "+" : ""}{pos.pnlPercent.toFixed(1)}%
                        </span>
                        <span className={clsx("text-xs font-mono",
                        isWin ? "text-black" : "text-zinc-400"
                    )}>
                    {isWin ? "+" : ""}{(pos.pnlSol ?? 0).toFixed(4)} SOL
                    </span>
                      </div>
                        <button
                        onClick={() => onClose(i)}
                        className="text-xs px-2 py-0.5 border border-zinc-300 text-zinc-500 hover:border-black hover:text-black transition-colors uppercase"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Entry", value: `$${pos.entryPrice.toFixed(8)}` },
                      { label: "Current", value: `$${pos.token.current_price_usd.toFixed(8)}` },
                      { label: "Amount", value: `${pos.amountSol} SOL` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
                        <p className="text-xs font-mono text-black">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// History Window Content
// ============================================================
function HistoryWindowContent({ logs, tradeHistory }: {
logs: LogEntry[];
tradeHistory: TradeHistory[];
}) {
const totalPnl = tradeHistory.reduce((a, t) => a + t.pnlPercent, 0);
const wins = tradeHistory.filter((t) => t.pnlPercent >= 0).length;

return (
<div className="flex flex-col h-full">
<div className="flex-shrink-0 px-3 py-2 border-b border-zinc-100 flex items-center gap-2">
<span className="text-xs font-bold text-black uppercase tracking-widest">Trade History</span>
<div className="ml-auto flex gap-3 text-xs font-mono">
<span className="text-zinc-400">TRADES <span className="text-black">{tradeHistory.length}</span></span>
<span className="text-zinc-400">WIN <span className="text-black">{wins}</span></span>
<span className={clsx("font-bold", totalPnl >= 0 ? "text-black" : "text-zinc-400")}>
{totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(1)}%
</span>
</div>
</div>

<div className="flex-1 overflow-y-auto px-3 py-2 space-y-px">
{tradeHistory.length === 0 ? (
<div className="flex flex-col items-center justify-center h-full text-zinc-300 py-12">
<p className="text-xs uppercase tracking-widest">No closed trades yet</p>
</div>
) : (
[...tradeHistory].reverse().map((trade) => (
<div key={trade.id} className={clsx(
"border-l-2 px-3 py-2.5",
trade.pnlPercent >= 0 ? "border-l-black" : "border-l-zinc-300"
)}>
<div className="flex items-center justify-between mb-1">
<span className="text-xs font-bold text-black">{trade.token.symbol}</span>
<span className={clsx("text-xs font-mono font-bold",
trade.pnlPercent >= 0 ? "text-black" : "text-zinc-400"
)}>
{trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
</span>
</div>
<div className="flex items-center justify-between text-xs text-zinc-400">
<span>Entry <span className="font-mono text-black">${trade.entryPrice.toFixed(8)}</span></span>
<span>Exit <span className="font-mono text-black">${trade.exitPrice.toFixed(8)}</span></span>
<span className="font-mono">{trade.amountSol} SOL</span>
</div>
<div className="flex items-center justify-between text-xs text-zinc-300 mt-0.5">
<span>{formatTime(trade.openedAt)} → {formatTime(trade.closedAt)}</span>
</div>
</div>
))
)}
</div>
</div>
);
}

// ============================================================
// Settings Window Content
// ============================================================
function SettingsWindowContent({
  minScore, setMinScore,
  amountSol, setAmountSol,
  tpPercent, setTpPercent,
  slPercent, setSlPercent,
}: {
  minScore: number; setMinScore: (v: number) => void;
  amountSol: number; setAmountSol: (v: number) => void;
  tpPercent: number; setTpPercent: (v: number) => void;
  slPercent: number; setSlPercent: (v: number) => void;
}) {return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-3 py-2 border-b border-zinc-100">
        <span className="text-xs font-bold text-black uppercase tracking-widest">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {[
          { label: "Min Score", values: [50, 65, 75, 85], current: minScore, set: setMinScore },
          { label: "Amount SOL", values: [0.05, 0.1, 0.25, 0.5], current: amountSol, set: setAmountSol },
          { label: "Take Profit %", values: [25, 50, 100, 200], current: tpPercent, set: setTpPercent },
          { label: "Stop Loss %", values: [10, 20, 30, 50], current: slPercent, set: setSlPercent },
        ].map(({ label, values, current, set }) => (
          <div key={label}>
            <p className="text-xs font-bold text-black uppercase tracking-widest mb-3">{label}</p>
            <div className="flex gap-2">
              {values.map((v) => (
                <button key={v} onClick={() => set(v)}
                  className={clsx("px-3 py-1.5 text-xs font-mono border transition-colors",
                    current === v ? "border-black text-black bg-black text-white" : "border-zinc-200 text-zinc-400 hover:border-black hover:text-black"
                  )}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t border-zinc-100 pt-4">
          <p className="text-xs font-bold text-black uppercase tracking-widest mb-3">Data</p>
          <button
            onClick={() => {
              localStorage.removeItem("tiresias_logs");
              localStorage.removeItem("tiresias_windows");
              window.location.reload();
            }}
            className="px-3 py-1.5 text-xs font-mono border border-zinc-300 text-zinc-500 hover:border-black hover:text-black transition-colors uppercase"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
function DashboardInner() {
const { publicKey, signTransaction, connected } = useWallet();
const { connection } = useConnection();
  const { openWindow, windows } = useWindowManager();
  const [isRunning, setIsRunning] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode>("signal");
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [activeFilter, setActiveFilter] = useState("all");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [signalCount, setSignalCount] = useState(0);
  const [consecutiveLoss, setConsecutiveLoss] = useState(0);
  const [maxPositions, setMaxPositions] = useState(3);
  const [partialTpEnabled, setPartialTpEnabled] = useState(true);
  const [partialTpPercent, setPartialTpPercent] = useState(100);
  const [autoPaused, setAutoPaused] = useState(false);
  const autoPausedRef = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const [alertEntry, setAlertEntry] = useState<LogEntry | null>(null);
  const [alertCountdown, setAlertCountdown] = useState(0);
  const [minScore, setMinScore] = useState(65);
  const [amountSol, setAmountSol] = useState(0.1);
  const [tpPercent, setTpPercent] = useState(1);
  const [slPercent, setSlPercent] = useState(1);
  
  // Load trade history from Supabase when wallet connect
        useEffect(() => {
        if (!publicKey) return;
        const wallet = publicKey.toString();

        const loadHistory = async () => {
        const { data } = await supabase
        .from("trade_history")
        .select("*")
        .eq("wallet_address", wallet)
        .order("closed_at", { ascending: false })
        .limit(100);

        if (data && data.length > 0) {
        setTradeHistory(data.map((t) => ({
        id: t.id,
        token: { symbol: t.token_symbol, token: t.token_address } as any,
        entryPrice: t.entry_price,
        exitPrice: t.exit_price,
        amountSol: t.amount_sol,
        openedAt: t.opened_at,
        closedAt: t.closed_at,
        pnlPercent: t.pnl_percent,
        pnlSol: t.pnl_sol,
        })));
        }
        };

        loadHistory();
        }, [publicKey]);

// Save settings to Supabase when changing
useEffect(() => {
if (!publicKey) return;
const wallet = publicKey.toString();

const saveSettings = async () => {
await supabase.from("user_settings").upsert({
wallet_address: wallet,
min_score: minScore,
amount_sol: amountSol,
tp_percent: tpPercent,
sl_percent: slPercent,
updated_at: new Date().toISOString(),
});
};

saveSettings();
}, [publicKey, minScore, amountSol, tpPercent, slPercent]);

  const seenTokens = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
if (positions.length === 0) return;

const pollPrices = async () => {
const toClose: { index: number; reason: "TP" | "SL" | "VOL" | "PARTIAL_TP" }[] = [];

const updated = positions.map((pos, i) => {
let newPrice = pos.token.current_price_usd;

if (isDemoMode) {
const change = (Math.random() - 0.48) * 0.06;
newPrice = pos.token.current_price_usd * (1 + change);
} else {
// Live mode — from AVE (async, handle separated)
return pos;
}

const pnlPercent = pos.entryPrice > 0
? ((newPrice - pos.entryPrice) / pos.entryPrice) * 100
: 0;
const pnlSol = pos.amountSol * (pnlPercent / 100);

// Check TP/SL
if (pnlPercent >= tpPercent) {
toClose.push({ index: i, reason: "TP" });
} else if (partialTpEnabled && pnlPercent >= partialTpPercent) {
toClose.push({ index: i, reason: "PARTIAL_TP" });
}
else if (pnlPercent <= -slPercent) {
toClose.push({ index: i, reason: "SL" });
}

// Volume drop check ← TAMBAH DI SINI
const currentVol = pos.token.token_tx_volume_usd_5m || 0;
const entryVol = pos.entryVolume || 0;
const volDropped = entryVol > 0 && currentVol < entryVol * 0.5;

if (volDropped && pnlPercent > -slPercent) {
toClose.push({ index: i, reason: "VOL" });
}

return {
...pos,
token: { ...pos.token, current_price_usd: newPrice },
pnlPercent,
pnlSol,
};
});

setPositions(updated);

// Auto-close positions TP/SL
if (toClose.length > 0) {
toClose.reverse().forEach(({ index, reason }) => {
const pos = updated[index];
const trade = {
id: `${pos.token.token}-${Date.now()}`,
token_address: pos.token.token,
token_symbol: pos.token.symbol,
entry_price: pos.entryPrice,
exit_price: pos.token.current_price_usd,
amount_sol: pos.amountSol,
pnl_percent: pos.pnlPercent,
pnl_sol: pos.pnlSol,
opened_at: pos.openedAt,
closed_at: Math.floor(Date.now() / 1000),
close_reason: reason,
};

setTradeHistory((prev) => [...prev, {
id: trade.id,
token: pos.token,
entryPrice: trade.entry_price,
exitPrice: trade.exit_price,
amountSol: trade.amount_sol,
openedAt: trade.opened_at,
closedAt: trade.closed_at,
pnlPercent: trade.pnl_percent,
pnlSol: trade.pnl_sol,
closeReason: reason,
}]);

if (publicKey && !isDemoMode) {
supabase.from("trade_history").insert({
...trade,
wallet_address: publicKey.toString(),
});
}

// Partial TP — close 50%, re-enter sisanya dengan entry price baru
if (reason === "PARTIAL_TP") {
const halfAmount = pos.amountSol / 2;

// Catat partial close ke history
setTradeHistory((prev) => [...prev, {
id: `${pos.token.token}-partial-${Date.now()}`,
token: pos.token,
entryPrice: pos.entryPrice,
exitPrice: pos.token.current_price_usd,
amountSol: halfAmount,
openedAt: pos.openedAt,
closedAt: Math.floor(Date.now() / 1000),
pnlPercent: pos.pnlPercent,
pnlSol: halfAmount * (pos.pnlPercent / 100),
closeReason: "PARTIAL_TP",
}]);

// Update position — kurangi amount, reset entry ke harga sekarang
setPositions((prev) => prev.map((p, idx) =>
idx === index ? {
...p,
amountSol: halfAmount,
entryPrice: pos.token.current_price_usd,
pnlPercent: 0,
pnlSol: 0,
} : p
));

console.log(`Partial TP: ${pos.token.symbol} — closed 50% at ${pos.pnlPercent.toFixed(1)}%`);
return; // jangan hapus position, jangan filter
}

          if (reason === "SL") {
          setConsecutiveLoss((prev) => {
          const next = prev + 1;
          if (next >= 3) {
          autoPausedRef.current = true;
          setAutoPaused(true);
          console.log("3x consecutive loss — auto-buy paused");
          }
          return next;
          });
          } else if (reason === "TP") {
          setConsecutiveLoss(0); // reset if profit
          }

setPositions((prev) => prev.filter((_, idx) => idx !== index));

console.log(`Auto-close ${pos.token.symbol}: ${reason} hit at ${pos.pnlPercent.toFixed(1)}%`);
});
}
};

pollPrices();
const priceInterval = setInterval(pollPrices, 5_000);
return () => clearInterval(priceInterval);
}, [positions.length, isDemoMode, tpPercent, slPercent]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tiresias_logs");
      if (saved) {
        const parsed: LogEntry[] = JSON.parse(saved);
        setLogs(parsed);
        seenTokens.current = new Set(parsed.map((e) => e.token.token));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (logs.length === 0) return;
    try {
      localStorage.setItem("tiresias_logs", JSON.stringify(logs.slice(-100)));
    } catch {}
  }, [logs]);

  useEffect(() => {
    if (alertEntry && alertCountdown > 0) {
      alertTimerRef.current = setTimeout(() => setAlertCountdown((c) => c - 1), 1000);
    } else if (alertEntry && alertCountdown === 0) {
      setAlertEntry(null);
    }
    return () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current); };
  }, [alertEntry, alertCountdown]);const runScanCycle = useCallback(async () => {
    setAgentStatus("scanning");
    setScanCount((c) => c + 1);

    let tokens: ScoredToken[] = [];
    if (isDemoMode) {
      tokens = DEMO_JUDGED;
    } else {
      const results = await Promise.all(TOPICS.map((topic) => fetchRankTokens(topic, 50)));
      const seen = new Set<string>();
      const merged = results.flat().filter((t) => {
        if (seen.has(t.token)) return false;
        seen.add(t.token);
        return true;
      });
      const newTokens = merged.filter((t) => !seenTokens.current.has(t.token));
      merged.forEach((t) => seenTokens.current.add(t.token));
      tokens = newTokens.map(judgeToken);
    }

    setAgentStatus("judging");
    if (tokens.length === 0) { setAgentStatus("idle"); return; }

    for (const token of tokens.slice(0, 3)) {
      seenTokens.current.add(token.token);
      await new Promise((r) => setTimeout(r, 600));

      const entry: LogEntry = {
        id: `${token.token}-${Date.now()}`,
        timestamp: Math.floor(Date.now() / 1000),
        token,
        action: token.contrarian.forceSkip ? "force_skip"
          : token.finalScore >= minScore ? "signal" : "skip",
      };

      if (entry.action === "signal") {
      setSignalCount((c) => c + 1);
      if (agentMode === "auto" && !autoPausedRef.current && (isDemoMode || (connected && publicKey && signTransaction))) {
        if (positions.length >= maxPositions) {
        console.log(`Max positions reached: ${positions.length}/${maxPositions}`);
        continue;
        }
        setAgentStatus("acting");

                    if (isDemoMode) {
                    // Demo mode
                    entry.action = "executed";
                    setPositions((prev) => [...prev, {
                    token, entryPrice: token.current_price_usd,
                    amountSol, openedAt: Math.floor(Date.now() / 1000),
                    pnlPercent: 0, pnlSol: 0,
                    entryVolume: token.token_tx_volume_usd_5m || 0,
                    }]);
                   } else {
                    // Live mode — balance check first
                    const balance = await connection.getBalance(publicKey!);
                    const balanceSol = balance / 1e9;

                    if (balanceSol < amountSol + 0.01) {
                    console.log(`Insufficient balance: ${balanceSol.toFixed(3)} SOL, need ${(amountSol + 0.01).toFixed(3)} SOL`);
                    setAgentStatus("judging");
                    continue;
                    }

                    // Execute swap
                    const quote = await getSwapQuote(token.token, amountSol);

                    if (quote) {
                    const result = await executeSwap(quote, publicKey!, signTransaction!, connection);
                    if (result.success) {
                    entry.action = "executed";
                    entry.txid = result.txid || undefined;
                    setPositions((prev) => [...prev, {
                    token, entryPrice: token.current_price_usd,
                    amountSol, openedAt: Math.floor(Date.now() / 1000),
                    pnlPercent: 0, pnlSol: 0,
                    entryVolume: token.token_tx_volume_usd_5m || 0,

                    }]);
                    }
                    }
                    }
                    setAgentStatus("judging");
                    }
              }

      if (entry.action === "signal" || entry.action === "executed") {
        fetchLLMInsight(token).then((result) => {
          if (result.insight || result.verdict) {
            setLogs((prev) => prev.map((e) =>
              e.id === entry.id ? {
                ...e, token: {
                  ...e.token,
                  llmInsight: result.insight || undefined,
                  llmVerdict: result.verdict || undefined,
                  llmConfidence: result.confidence || undefined,
                  llmRisk: result.risk || undefined,
                },
              } : e
            ));
          }
        });
      }

      setLogs((prev) => [...prev.slice(-99), entry]);

      if (entry.action === "signal") {
        setAlertEntry(entry);
        setAlertCountdown(60);
        setSelectedLog(entry);
        openWindow("feed");
        openWindow("intel");
      }
    }
    setAgentStatus("idle");
  }, [isDemoMode, minScore, agentMode, amountSol, connected, publicKey, signTransaction, connection, openWindow]);

  useEffect(() => {
    if (isRunning) {
      runScanCycle();
      intervalRef.current = setInterval(runScanCycle, 10_000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAgentStatus("idle");
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, runScanCycle]);

  useEffect(() => {
autoPausedRef.current = autoPaused;
}, [autoPaused]);

const handleAlertBuy = async () => {
if (!alertEntry) return;
setAlertEntry(null);
if (alertTimerRef.current) clearTimeout(alertTimerRef.current);

if (isDemoMode) {
setLogs((prev) => prev.map((e) =>
e.id === alertEntry.id ? { ...e, action: "executed" as const } : e
));
setPositions((prev) => [...prev, {
token: alertEntry.token, entryPrice: alertEntry.token.current_price_usd,
amountSol, openedAt: Math.floor(Date.now() / 1000), pnlPercent: 0, pnlSol: 0,
entryVolume: alertEntry.token.token_tx_volume_usd_5m || 0,
}]);
return;
}

// LIVE MODE
if (!publicKey || !signTransaction || !connection) {
console.error("Wallet not connected", { publicKey, signTransaction: !!signTransaction, connection: !!connection });
return;
}

try {
const mintAddress = alertEntry.token.token.includes("-")
? alertEntry.token.token.split("-")[0]
: alertEntry.token.token;

console.log("Mint address:", mintAddress);
console.log("Amount SOL:", amountSol);

const quote = await getSwapQuote(mintAddress, amountSol, 300);
if (!quote) {
console.error("Failed to get quote from Jupiter");
return;
}

const result = await executeSwap(quote, publicKey, signTransaction, connection);

if (result.success) {
setLogs((prev) => prev.map((e) =>
e.id === alertEntry.id ? { ...e, action: "executed" as const } : e
));
setPositions((prev) => [...prev, {
token: alertEntry.token, entryPrice: alertEntry.token.current_price_usd,
amountSol, openedAt: Math.floor(Date.now() / 1000), pnlPercent: 0, pnlSol: 0,
entryVolume: alertEntry.token.token_tx_volume_usd_5m || 0,
}]);
console.log("Swap success:", result.txid);
} else {
console.error("Swap failed:", result.error);
}
} catch (err) {
console.error("handleAlertBuy live error:", err);
}
};

  const handleAlertSkip = () => {
    if (!alertEntry) return;setLogs((prev) => prev.map((e) =>
      e.id === alertEntry.id ? { ...e, action: "skip" as const } : e
    ));
    setAlertEntry(null);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
  };

  const statusLabel = () => {
    if (!isRunning) return { text: "STOPPED", color: "text-zinc-400" };
    switch (agentStatus) {
      case "scanning": return { text: "SCANNING...", color: "text-black" };
      case "judging": return { text: "JUDGING...", color: "text-zinc-600" };
      case "acting": return { text: "EXECUTING...", color: "text-black" };
      default: return { text: "ACTIVE", color: "text-black" };
    }
  };
  const sl = statusLabel();

  const allClosed = Object.values(windows).every((w) => !w.isOpen);
return(
    <div className="flex h-screen bg-white overflow-hidden font-mono text-black">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-14 overflow-hidden">
        <header className="flex-shrink-0 border-b border-zinc-200 bg-white px-4 py-2.5 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <Eye className="w-4 h-4 text-black" />
            <span className="font-bold text-black text-sm tracking-widest">TIRESIAS</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={isRunning} onCheckedChange={setIsRunning}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-zinc-300 border border-black [&>span]:border [&>span]:border-zinc-400 [&>span]:shadow-sm" />
            <span className={clsx("text-xs font-mono font-bold", sl.color)}>{sl.text}</span>
            {agentStatus !== "idle" && isRunning && (
              <RefreshCw className="w-3 h-3 text-zinc-400 animate-spin" />
            )}
            {autoPaused && (
                <span className="text-xs font-bold text-zinc-400 border border-zinc-300 px-2 py-0.5">
                PAUSED — 3x LOSS
                </span>
                )}
                {autoPaused && (
                <button
                onClick={() => { setAutoPaused(false); setConsecutiveLoss(0); }}
                className="text-xs text-zinc-400 hover:text-black underline"
                >
                Resume
                </button>
                )}
          </div>

          <div className="w-px h-4 bg-zinc-200" />

          <div className="flex items-center gap-1">
            {(["signal", "auto"] as AgentMode[]).map((m) => (
            <button key={m} onClick={() => setAgentMode(m)}
            className={clsx("px-3 py-1 text-xs font-bold uppercase transition-colors rounded-full",
                        agentMode === m ? "bg-black text-white" : "text-zinc-400 hover:text-black border border-zinc-300"
                )}>
                {m}
            </button>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-auto text-xs font-mono">
            <span className="text-zinc-400">SCAN <span className="text-black">{scanCount * 3}</span></span>
            <span className="text-zinc-400">SIG <span className="text-black">{signalCount}</span></span>
            <span className="text-zinc-400">POS <span className="text-black">{positions.length}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <span className={clsx("text-xs font-bold px-3 py-0.5 border rounded-full",
              isDemoMode ? "border-zinc-300 text-zinc-400" : "border-black text-black"
            )}>
              {isDemoMode ? "DEMO" : "LIVE"}
            </span>
            <Switch checked={isDemoMode} onCheckedChange={setIsDemoMode}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-zinc-300 border border-black [&>span]:border [&>span]:border-zinc-400 [&>span]:shadow-sm" />
          </div>

          <button onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-zinc-400 hover:text-black transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
          <WalletButton />
        </header>

       {showSettings && (
<div className="flex-shrink-0 border-b border-zinc-200 bg-zinc-50 px-6 py-3 flex items-center gap-8 flex-wrap">
{[
{ label: "MIN SCORE", values: [50, 65, 75, 85], current: minScore, set: setMinScore },
{ label: "AMOUNT SOL", values: [0.05, 0.1, 0.25, 0.5], current: amountSol, set: setAmountSol },
{ label: "TP%", values: [25, 50, 100, 200], current: tpPercent, set: setTpPercent },
{ label: "SL%", values: [10, 20, 30, 50], current: slPercent, set: setSlPercent },
{ label: "MAX POS", values: [1, 2, 3, 5], current: maxPositions, set: setMaxPositions },
].map(({ label, values, current, set }) => (
<div key={label} className="flex items-center gap-2">
<span className="text-xs text-zinc-400">{label}</span>
{values.map((v) => (
<button key={v} onClick={() => set(v as any)}
className={clsx("px-2 py-1 text-xs font-mono border transition-colors",
current === v ? "border-black text-black" : "border-zinc-200 text-zinc-400 hover:text-black"
)}>
{v}
</button>
))}
</div>
))}

<div className="flex items-center gap-2">
<span className="text-xs text-zinc-400">PARTIAL TP</span>
<Switch checked={partialTpEnabled} onCheckedChange={setPartialTpEnabled}
className="data-[state=checked]:bg-black data-[state=unchecked]:bg-zinc-300 border border-black" />
</div>
</div>
)}
        <div className="flex-1 relative overflow-hidden">
          {allClosed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
              <Eye className="w-16 h-16 text-zinc-100 mb-4" />
              <span className="text-5xl font-bold text-zinc-100 tracking-widest">TIRESIAS</span>
              <span className="text-xs text-zinc-300 mt-3 tracking-widest uppercase">See before others do</span>
            </div>
          )}

          <FloatingWindow id="feed">
            <FeedWindowContent
              logs={logs}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              selectedLog={selectedLog}
              setSelectedLog={(entry) => {
                setSelectedLog(entry);
                openWindow("intel");
              }}
              alertEntry={alertEntry}
              alertCountdown={alertCountdown}
              amountSol={amountSol}
              onBuy={handleAlertBuy}
              onSkip={handleAlertSkip}
            />
          </FloatingWindow>

          <FloatingWindow id="intel">
            <IntelWindowContent selectedLog={selectedLog} />
          </FloatingWindow>

          <FloatingWindow id="whale">
            <TrappedWhaleWindowContent />
          </FloatingWindow>
          <FloatingWindow id="positions">
            <PositionsWindowContent
                positions={positions}
                onClose={(i) => {
                      const pos = positions[i];
                      const trade = {
                      id: `${pos.token.token}-${Date.now()}`,
                      token_address: pos.token.token,
                      token_symbol: pos.token.symbol,
                      entry_price: pos.entryPrice,
                      exit_price: pos.token.current_price_usd,
                      amount_sol: pos.amountSol,
                      pnl_percent: pos.pnlPercent,
                      pnl_sol: pos.pnlSol ?? 0,
                      opened_at: pos.openedAt,
                      closed_at: Math.floor(Date.now() / 1000),
                      };

                      setTradeHistory((prev) => [...prev, {
                      id: trade.id,
                      token: pos.token,
                      entryPrice: trade.entry_price,
                      exitPrice: trade.exit_price,
                      amountSol: trade.amount_sol,
                      openedAt: trade.opened_at,
                      closedAt: trade.closed_at,
                      pnlPercent: trade.pnl_percent,
                      pnlSol: trade.pnl_sol,
                      }]);

                      if (publicKey) {
                      supabase.from("trade_history").insert({
                      ...trade,
                      wallet_address: publicKey.toString(),
                      });
                      }

                      setPositions((prev) => prev.filter((_, idx) => idx !== i));
                      }}

                      />
                      </FloatingWindow>

                      <FloatingWindow id="history">
                      <HistoryWindowContent logs={logs} tradeHistory={tradeHistory} />
                      </FloatingWindow>


                      <FloatingWindow id="settings">
                      <SettingsWindowContent
                      minScore={minScore} setMinScore={setMinScore}
                      amountSol={amountSol} setAmountSol={setAmountSol}
                      tpPercent={tpPercent} setTpPercent={setTpPercent}
                      slPercent={slPercent} setSlPercent={setSlPercent}
                      />
                      </FloatingWindow>
                              </div>
        <Taskbar />
        {positions.length > 0 && (
          <div className="flex-shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 py-2 flex items-center gap-4 overflow-x-auto">
            <span className="text-xs text-zinc-400 uppercase tracking-widest flex-shrink-0">Positions</span>
            {positions.map((pos, i) => (
              <div key={i} className="flex items-center gap-3 border border-zinc-200 px-3 py-1.5 flex-shrink-0">
                <span className="text-xs font-bold text-black">{pos.token.symbol}</span>
                <span className="text-xs text-zinc-400">{pos.amountSol} SOL</span>
                <span className={clsx("text-xs font-mono",
                  pos.pnlPercent >= 0 ? "text-black" : "text-zinc-400"
                )}>
                  {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
