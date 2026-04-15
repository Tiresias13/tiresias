'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAgentColor, getAgentLabel, getAgentEmoji } from '@/lib/scoring'
import { truncateAddress } from '@/lib/utils'
import AgentBadge from '@/components/AgentBadge'
import ChainBadge from '@/components/ChainBadge'
import AIProbabilityBadge from '@/components/AIProbabilityBadge'
import EmptyState from '@/components/EmptyState'
import { LeaderboardSkeleton } from '@/components/SkeletonGlitch'

const AGENT_TYPES = [
'smart-money',
'sniper',
'accumulator',
'momentum',
'exit-liq',
] as const

interface ExplorerWallet {
address: string
chain: string
score: number
agent_type: string
ai_probability: number
win_rate: number
}

export default function ExplorerPage() {
const [activeType, setActiveType] = useState<string>('smart-money')
const [wallets, setWallets] = useState<ExplorerWallet[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
setLoading(true)
fetch('/api/leaderboard?limit=100')
.then((r) => r.ok ? r.json() : [])
.then((data) => {
setWallets(Array.isArray(data) ? data : [])
setLoading(false)
})
.catch(() => setLoading(false))
}, [])

const filtered = wallets.filter((w) => (w.agent_type ?? 'momentum') === activeType)
return (
<div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

{/* Header */}
<div>
<h1 className="font-syne font-bold text-3xl text-text-primary">Explorer</h1>
<p className="text-text-secondary font-inter text-sm mt-1">
Browse wallets by agent classification.
</p>
</div>

{/* Agent type tabs */}
<div className="flex gap-2 flex-wrap">
{AGENT_TYPES.map((type) => {
const color = getAgentColor(type)
const isActive = activeType === type
return (
<button
key={type}
onClick={() => setActiveType(type)}
className="px-4 py-2 rounded-card text-sm font-inter font-medium transition-colors border"
style={{
backgroundColor: isActive ? `${color}20` : 'transparent',
borderColor: isActive ? `${color}60` : '#2A2A2A',
color: isActive ? color : '#888888',
}}
>
{getAgentEmoji(type)} {getAgentLabel(type)}
</button>
)
})}
</div>

{/* Description */}
<div
className="rounded-card p-4 border text-sm font-inter text-text-secondary"
style={{
backgroundColor: `${getAgentColor(activeType as any)}08`,
borderColor: `${getAgentColor(activeType as any)}20`,
}}
>
{getAgentDescription(activeType)}
</div>

{/* Grid */}
{loading ? (
<LeaderboardSkeleton />
) : filtered.length === 0 ? (
<EmptyState type="explorer" />
) : (
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{filtered.map((wallet) => (
<Link href={`/wallet/${wallet.address}?chain=${wallet.chain}`} key={wallet.address}>
<div
className="bg-surface border border-border rounded-card p-4 hover:border-[#444] transition-colors group h-full"
style={{ borderLeft: `3px solid ${getAgentColor(wallet.agent_type as any)}` }}
>
<div className="flex items-start justify-between mb-3">
<div className="space-y-1.5">
<p className="font-mono text-sm text-text-primary group-hover:text-accent transition-colors">
{truncateAddress(wallet.address)}
</p>
<div className="flex items-center gap-1.5 flex-wrap">
<ChainBadge chain={wallet.chain} size="sm" />
<AgentBadge type={wallet.agent_type as any} size="sm" />
</div>
</div>
<div className="text-right">
<p
className="font-syne font-bold text-xl"
style={{ color: wallet.score >= 70 ? '#4ADE80' : wallet.score >= 45 ? '#FACC15' : '#F87171' }}
>
{wallet.score}
</p>
<p className="text-xs text-text-secondary font-inter">TS Score</p>
</div>
</div>
<div className="flex items-center justify-between">
<AIProbabilityBadge probability={wallet.ai_probability ?? 0} />
<span className="text-xs text-text-secondary font-inter">
Win rate: <span className="text-text-primary">{((wallet.win_rate ?? 0) * 100).toFixed(0)}%</span>
</span>
</div>
</div>
</Link>
))}
</div>
)}

{/* Agent Clustering — coming soon */}
<div className="bg-surface border border-border rounded-card p-6 opacity-50">
<div className="flex items-center justify-between mb-3">
<div>
<h2 className="font-syne font-semibold text-text-primary">🧬 Agent Clustering</h2>
<p className="text-xs text-text-secondary font-inter mt-1">
Discover wallets that move together. Coordinated entries, shared patterns.
</p>
</div>
<span className="text-xs px-2 py-1 rounded-pill bg-surface-2 text-text-secondary border border-border font-inter">
Soon
</span>
</div>
<div className="h-24 rounded-card bg-surface-2 border border-border flex items-center justify-center">
<p className="text-xs text-text-secondary font-inter">Cluster visualization — coming in v0.2</p>
</div>
</div>

</div>
)
}

function getAgentDescription(type: string): string {
const desc: Record<string, string> = {
'smart-money': 'These are the ones. High PQ, clean exits, early entries. They were in before you knew the token existed. Watch every move.',
'sniper': 'First in. Always. Sub-5-minute entries after launch, high win rate, out before the crowd even notices. Half of them are probably machines.',
'accumulator': 'They don\'t rush. Weeks, months — slow position building while everyone else is chasing pumps. Underestimate them at your own expense.','momentum': 'They ride waves. Not the ones creating them. Profitable when the trend is strong, wrecked when it turns. Useful signal, not gospel.',
'exit-liq': 'You are the exit. Every time you buy what they\'re selling, they win. Low PQ, late entries, no edge. Do not follow. Do not copy. Just don\'t.',
}
return desc[type] ?? ''
}
