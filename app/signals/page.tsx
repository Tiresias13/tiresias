'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChainBadge from '@/components/ChainBadge'
import AgentBadge from '@/components/AgentBadge'
import { LeaderboardSkeleton } from '@/components/SkeletonGlitch'

interface SignalItem {
address: string
chain: string
agent_type: string
score: number
scored_at: string
top_tokens: string[]
win_rate: number
total_profit: number
}

function getRelativeTime(iso: string): string {
const diff = Date.now() - new Date(iso).getTime()
const mins = Math.floor(diff / 60000)
const hours = Math.floor(mins / 60)
if (hours > 0) return `${hours}h ago`
if (mins > 0) return `${mins}m ago`
return 'just now'
}

export default function SignalsPage() {
const [signals, setSignals] = useState<SignalItem[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
fetch('/api/leaderboard?limit=20&sort=recent')
.then((r) => r.ok ? r.json() : [])
.then((data) => {
setSignals(Array.isArray(data) ? data : [])
setLoading(false)
})
.catch(() => setLoading(false))
}, [])

return (
<div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

{/* Header */}
<div className="flex items-center justify-between">
<div>
<h1 className="font-syne font-bold text-3xl text-text-primary">Signals</h1>
<p className="text-text-secondary font-inter text-sm mt-1">
Recently scored wallets. Smart money moves first.
</p>
</div>
<div className="flex items-center gap-2 text-xs font-inter text-text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-follow animate-pulse" />
Live
</div>
</div>

{loading ? (
<LeaderboardSkeleton />
) : signals.length === 0 ? (
<div className="text-center py-20 text-text-secondary font-inter text-sm">
No signals yet. Run batch scoring to populate.
</div>
) : (
<div className="bg-surface border border-border rounded-card divide-y divide-border">
{signals.map((s, i) => {
const tokens = Array.isArray(s.top_tokens) ? s.top_tokens.slice(0, 3) : []
const profit = Number(s.total_profit ?? 0)
const profitDisplay = Math.abs(profit) >= 9_999_999
? 'N/A'
: `${profit >= 0 ? '+' : ''}$${Math.abs(profit).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

return (
<div key={s.address ?? i} className="flex items-center gap-4 px-4 py-4 hover:bg-surface-2 transition-colors">

{/* Rank */}
<div className="flex-shrink-0 w-8 text-center">
<span className="text-xs font-mono text-text-secondary">#{i + 1}</span>
</div>

{/* Wallet + tokens */}
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1 flex-wrap">
{tokens.length > 0 && (
<span className="font-inter font-semibold text-sm text-text-primary">
{tokens.join(', ')}
</span>
)}
<span className="font-inter text-xs text-text-secondary">{profitDisplay}</span>
</div>
<div className="flex items-center gap-2 flex-wrap">
<Link
href={`/wallet/${s.address}`}
className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
>
{s.address.slice(0, 8)}...{s.address.slice(-6)}
</Link>
<ChainBadge chain={s.chain} size="sm" />
<AgentBadge type={(s.agent_type ?? 'momentum') as any} size="sm" />
</div>
</div>

{/* Score + time */}
<div className="flex-shrink-0 text-right">
<p
className="font-syne font-bold text-lg"
style={{ color: s.score >= 70 ? '#4ADE80' : s.score >= 45 ? '#FACC15' : '#F87171' }}
>
{s.score}
</p>
<p className="text-xs text-text-secondary font-inter">
{getRelativeTime(s.scored_at)}
</p>
</div>

</div>
)
})}
</div>
)}

</div>
)
}
