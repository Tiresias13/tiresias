'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ScoreArc from '@/components/ScoreArc'
import AgentBadge from '@/components/AgentBadge'
import ChainBadge from '@/components/ChainBadge'
import ConfidenceBadge from '@/components/ConfidenceBadge'
import AIProbabilityBadge from '@/components/AIProbabilityBadge'
import DeltaBadge from '@/components/DeltaBadge'
import ZScoreBreakdown from '@/components/ZScoreBar'
import EmptyState from '@/components/EmptyState'
import { WalletProfileSkeleton } from '@/components/SkeletonGlitch'
import { getActionColor, getActionLabel, getActionDescription } from '@/lib/scoring'
import { truncateAddress } from '@/lib/utils'
import type { ScoringResult } from '@/lib/scoring-engine'

// A8: Tx type
interface TxItem {
blockTime: number
symbol?: string
side: 'buy' | 'sell'
amount?: number
signature: string
chain: string
}

// A7: accordion state
function AiDetectionAccordion() {
const [open, setOpen] = useState(false)
return (
<div className="mt-3 border border-border rounded-card overflow-hidden">
<button
onClick={() => setOpen(!open)}
className="w-full flex items-center justify-between px-4 py-3 text-sm font-inter text-text-secondary hover:text-text-primary transition-colors"
>
<span>How is this calculated?</span>
<span className="text-xs">{open ? '▲' : '▼'}</span>
</button>
{open && (
<div className="px-4 pb-4 space-y-2 text-xs font-inter text-text-secondary border-t border-border pt-3">
<p className="font-medium text-text-primary mb-2">5 Behavioral Signals:</p>
<div className="space-y-1.5">
<p>⏱ <span className="text-text-primary">Execution Timing Variance</span> — machines execute at inhuman consistency. Low variance = high AI probability.</p>
<p>🕐 <span className="text-text-primary">24h Activity Heatmap</span> — humans sleep. Agents don't. 24/7 uniform activity is a signal.</p>
<p>⚡ <span className="text-text-primary">Reaction Speed to Events</span> — sub-second reaction to on-chain events indicates automated execution.</p>
<p>⛽ <span className="text-text-primary">Gas Behavior</span> — agents optimize gas programmatically, not manually.</p>
<p>🪙 <span className="text-text-primary">Token Interaction Breadth</span> — scanning hundreds of tokens per day is not human-scale behavior.</p>
</div>
<p className="mt-3 text-[11px] text-text-secondary italic border-t border-border pt-2">
Scores are probabilistic, not deterministic. A high AI probability indicates machine-like patterns — not a confirmed AI agent.
</p>
</div>
)}
</div>
)
}

//Tx timeline component
function TxTimeline({ txs, chain }: { txs: TxItem[]; chain: string }) {
if (!txs || txs.length === 0) return null

function explorerUrl(sig: string, chain: string) {
if (chain === 'SOL') return `https://solscan.io/tx/${sig}`
if (chain === 'BSC') return `https://bscscan.com/tx/${sig}`
return `https://basescan.org/tx/${sig}`
}
return (
<div className="bg-surface border border-border rounded-card p-6 space-y-4">
<h2 className="font-syne font-semibold text-text-primary">Recent Transactions</h2>
<div className="space-y-2 max-h-72 overflow-y-auto pr-1">
{txs.slice(0, 20).map((tx, i) => (
<div key={i} className="flex items-center justify-between text-xs font-inter py-2 border-b border-border/50 last:border-0">
<div className="flex items-center gap-2">
<span
className="px-1.5 py-0.5 rounded-pill font-medium"
style={{
backgroundColor: tx.side === 'buy' ? '#4ADE8020' : '#F8717120',
color: tx.side === 'buy' ? '#4ADE80' : '#F87171',
}}
>
{tx.side === 'buy' ? 'BUY' : 'SELL'}
</span>
<span className="text-text-primary font-mono">{tx.symbol ?? '—'}</span>
</div>
<div className="flex items-center gap-3">
<span className="text-text-secondary">
{tx.amount != null ? `$${tx.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
</span>
<span className="text-text-secondary">
{tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
</span>
<a
href={explorerUrl(tx.signature, chain)}
target="_blank"
rel="noopener noreferrer"
className="text-accent hover:underline font-mono"
>
↗
</a>
</div>
</div>
))}
</div>
</div>
)
}

export default function WalletProfilePage() {
const { address } = useParams<{ address: string }>()
const searchParams = useSearchParams()
const chain = searchParams.get('chain') ?? 'SOL'
const [data, setData] = useState<ScoringResult | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(false)
const [copied, setCopied] = useState(false)
const [history, setHistory] = useState<{ agent_type: string; ai_probability: number; scored_at: string; score: number }[]>([])

useEffect(() => {
if (!address) return
setLoading(true)
setError(false)

fetch(`/api/history/${address}`)
.then((r) => r.ok ? r.json() : [])
.then((h) => setHistory(Array.isArray(h) ? h : []))
.catch(() => {})

fetch(`/api/wallet/${address}?chain=${chain}`)
.then((res) => {
if (!res.ok) throw new Error('Not found')
return res.json()
})
.then((json) => {
// Auto re-fetch if insight is missing
if (!json.insight) {
return fetch(`/api/wallet/${address}?chain=SOL`)
.then((res) => res.json())
}
return json
})
.then((json) => {
setData(json)
setLoading(false)
})
.catch(() => {
setError(true)
setLoading(false)
})
}, [address])

function handleShare() {
const url = `${window.location.origin}/wallet/${address}`
navigator.clipboard.writeText(url)
setCopied(true)
toast('Link copied. Share it — let them see the signal.', { duration: 3000 })
setTimeout(() => setCopied(false), 2000)
}

if (loading) return (
<div className="max-w-3xl mx-auto px-4 py-10">
<WalletProfileSkeleton />
</div>
)

if (error || !data) return (
<div className="max-w-3xl mx-auto px-4 py-10">
<EmptyState type="wallet" />
</div>
)

const actionColor = getActionColor(data.actionRec as any)
const actionLabel = getActionLabel(data.actionRec as any)
const actionDesc = getActionDescription(data.actionRec as any)
const txCount = data.totalTrades ?? 0
const confidenceLevel = (data.confidence ?? 'low') as 'low' | 'medium' | 'high'
const winRate = Number(data.winRate ?? 0)
const totalProfit = Number(data.totalProfit ?? 0)
const totalTrades = Number(data.totalTrades ?? 0)
const topTokens = Array.isArray(data.topTokens) ? data.topTokens : []
const explainability = Array.isArray(data.explainability) ? data.explainability : []
const recentTxs: TxItem[] = Array.isArray((data as any).recentTxs) ? (data as any).recentTxs : []
const isExtreme = Object.values(data.zscores ?? {}).some((z) => Math.abs(Number(z)) >= 2.0)
return (
<div className="max-w-6xl mx-auto px-4 py-10 space-y-6">

{/* Back */}
<button
onClick={() => window.history.back()}
className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary font-inter transition-colors"
>
← Back
</button>

{/* Banners */}
{confidenceLevel === 'low' && (
<div className="bg-[#FACC1510] border border-[#FACC1530] rounded-card px-4 py-3 text-sm font-inter text-watch">
⚠️ Limited data — only {txCount} transactions detected. Score accuracy is low. Treat as indicative only.
</div>
)}
{isExtreme && (
<div className="bg-[#E8FF4710] border border-[#E8FF4730] rounded-card px-4 py-3 text-sm font-inter text-accent">
⚡ Extreme behavior detected — this wallet is a significant statistical outlier.
</div>
)}

{/* ROW 1 — Header | Score | Action */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

{/* Col 1: Identity */}
<div className="bg-surface border border-border rounded-card p-5 space-y-3">
<div className="flex items-center gap-2 flex-wrap">
<ChainBadge chain={data.chain} />
<AgentBadge type={data.agentType as any} />
{data.isScamContract && (
<span className="px-2 py-0.5 rounded-pill text-xs font-inter bg-[#F8717120] text-avoid border border-[#F8717140]">
⚠️ High Risk
</span>
)}
</div>
<div>
<p className="font-mono text-sm text-text-primary break-all leading-relaxed">{address}</p>
<button
onClick={() => { navigator.clipboard.writeText(address as string); toast('Address copied.', { duration: 2000 }) }}
className="text-xs text-text-secondary hover:text-accent font-inter mt-1 transition-colors"
>
Copy address
</button>
</div>
<div className="pt-2 border-t border-border">
<ConfidenceBadge level={confidenceLevel} txCount={txCount} />
<DeltaBadge
delta={data.deltaScore}
prevAgentType={data.prevAgentType}
currentAgentType={data.agentType}
/>
</div>
<div className="flex gap-2">
<button
onClick={handleShare}
className="flex-1 px-4 py-2 rounded-card border border-border text-sm font-inter text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
>
{copied ? '✓ Copied' : '↗ Share'}
</button>
<a
href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔍 Wallet Intel by Tiresias\n\nScore: ${data.score} | ${data.agentType ? data.agentType.replace('-', ' ') : ''} | AI Prob: ${data.aiDetection?.probability ?? 0}%\nWin Rate: ${(Number(data.winRate) * 100).toFixed(0)}% | PnL: +$${Number(data.totalProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}\n\nSee the pattern behind the profit 👇`)}&url=${encodeURIComponent(`https://tiresiasave.vercel.app/wallet/${address}`)}`}
target="_blank"
rel="noopener noreferrer"
className="flex-1 px-4 py-2 rounded-card border border-border text-sm font-inter text-center text-text-secondary hover:text-text-primary hover:border-[#1DA1F2] transition-colors"
>
𝕏 Post
</a>
</div>
</div>

{/* Col 2: Score */}
<div className="bg-surface border border-border rounded-card p-5 flex flex-col items-center justify-center space-y-4">
<ScoreArc score={data.score} size={130} />
<div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-inter w-full">
<div>
<p className="text-text-secondary text-xs">Win Rate</p>
<p className="text-text-primary font-medium">{(winRate * 100).toFixed(0)}%</p>
</div>
<div>
<p className="text-text-secondary text-xs">Total PnL</p>
<p className="font-medium" style={{ color: totalProfit >= 0 ? '#4ADE80' : '#F87171' }}>
{totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
</p>
</div>
<div>
<p className="text-text-secondary text-xs">Trades</p>
<p className="text-text-primary font-medium">{totalTrades.toLocaleString()}</p>
</div>
<div>
<p className="text-text-secondary text-xs">Percentile</p>
<p className="text-text-primary font-medium">Top {Math.round((1 - data.score / 100) * 100)}%</p>
</div>
<div className="col-span-2">
<p className="text-text-secondary text-xs">Top Tokens</p>
<p className="text-text-primary font-medium font-mono text-xs">{topTokens.slice(0, 3).join(', ') || '—'}</p>
</div>
</div>
</div>

{/* Col 3: Action + AI */}
<div className="space-y-4">
<div
className="rounded-card p-4 border"
style={{ backgroundColor: `${actionColor}10`, borderColor: `${actionColor}30` }}
>
<div className="flex items-center gap-2 mb-1">
<span className="w-2 h-2 rounded-full" style={{ backgroundColor: actionColor }} />
<span className="font-syne font-semibold text-sm" style={{ color: actionColor }}>{actionLabel}</span>
</div>
<p className="text-sm font-inter text-text-secondary">{actionDesc}</p>
</div>
<div className="bg-surface border border-border rounded-card p-4 space-y-2">
<AIProbabilityBadge
probability={data.aiDetection?.probability ?? 0}
signals={data.aiDetection?.signals}
frameworks={data.aiDetection?.githubSignal?.frameworks}
/>
<AiDetectionAccordion />
</div>
</div>
</div>

{/* ROW 2 — Score Breakdown | Explainability | History */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

{/* Score Breakdown */}
<div className="bg-surface border border-border rounded-card p-5 space-y-4">
<h2 className="font-syne font-semibold text-text-primary">Score Breakdown</h2>
<ZScoreBreakdown
zscores={data.zscores}
components={data.components}
percentile={Math.round((1 - data.score / 100) * 100)}
totalTracked={(data as any).totalTracked ?? 300}
/>
</div>

{/* Explainability */}
<div className="bg-surface border border-border rounded-card p-5 space-y-3">
<h2 className="font-syne font-semibold text-text-primary">Explainability</h2>
<div className="space-y-2">
{explainability.length > 0 ? explainability.map((item, i) => (
<div key={i} className="flex items-center justify-between text-sm font-inter">
<span className={item.isWarning ? 'text-watch' : 'text-text-secondary'}>
{item.isWarning ? '⚠️ ' : ''}{item.label}
</span>
<span className="font-mono font-medium" style={{ color: item.value >= 0 ? '#4ADE80' : '#F87171' }}>
{item.value >= 0 ? '+' : ''}{item.value}
</span>
</div>
)) : (
<p className="text-xs text-text-secondary font-inter">No significant signals detected.</p>
)}
</div>
</div>

{/* Classification History */}
<div className="bg-surface border border-border rounded-card p-5 space-y-3">
<h2 className="font-syne font-semibold text-text-primary">Classification History</h2>
{history.length > 1 ? (
<div className="space-y-2">
{history.slice(0, 7).map((h, i) => (
<div key={i} className="flex items-center justify-between text-xs font-inter">
<span className="text-text-secondary">
{new Date(h.scored_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
</span>
<span className="text-text-primary font-medium capitalize">{h.agent_type?.replace('-', ' ')}</span>
<span className="font-mono" style={{ color: h.score >= 70 ? '#4ADE80' : h.score >= 45 ? '#FACC15' : '#F87171' }}>
{h.score}
</span>
<span className="text-text-secondary">
AI {h.ai_probability}%
{i < history.length - 1 && (
<span style={{ color: h.ai_probability > history[i + 1].ai_probability ? '#4ADE80' : h.ai_probability < history[i + 1].ai_probability ? '#F87171' : '#888' }}>
{' '}{h.ai_probability > history[i + 1].ai_probability ? '↑' : h.ai_probability < history[i + 1].ai_probability ? '↓' : '→'}
</span>
)}
</span>
</div>
))}
</div>
) : (
<p className="text-xs text-text-secondary font-inter">No history yet — check back after next scoring cycle.</p>
)}
</div>
</div>

{/* ROW 3 — Recent Transactions */}
<TxTimeline txs={recentTxs} chain={data.chain ?? 'SOL'} />

{/* ROW 4 — Intel */}
<div className="bg-surface border border-border rounded-card p-6 space-y-3">
<div className="flex items-center gap-2">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
<ellipse cx="12" cy="12" rx="10" ry="6" stroke="#E8FF47" strokeWidth="1.5" />
<circle cx="12" cy="12" r="3" stroke="#E8FF47" strokeWidth="1.5" />
<circle cx="12" cy="12" r="1" fill="#E8FF47" />
</svg>
<h2 className="font-syne font-semibold text-text-primary">Intel</h2>
<span className="text-xs text-text-secondary font-mono">TIRESIAS</span>
</div>
<p className="font-inter text-sm text-text-secondary italic leading-relaxed border-l-2 border-accent pl-4">
&ldquo;{data.insight ?? 'No insight available.'}&rdquo;
</p>
</div>

{/* ROW 5 — Coming Soon */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
{[
{ label: '🔔 Smart Alerts', desc: 'Get notified when this wallet  moves.' },
{ label: '⭐ Follow Wallet', desc: 'Track this wallet across sessions.' },
{ label: '🔗 Influence Graph', desc: 'See who copies this wallet.' },].map((f) => (
<div key={f.label} className="bg-surface border border-border rounded-card p-4 opacity-50 cursor-not-allowed">
<div className="flex items-center justify-between mb-1">
<p className="text-sm font-inter font-medium text-text-primary">{f.label}</p>
<span className="text-xs px-1.5 py-0.5 rounded-pill bg-surface-2 text-text-secondary border border-border">Soon</span>
</div>
<p className="text-xs text-text-secondary font-inter">{f.desc}</p>
</div>
))}
</div>

</div>
)
}