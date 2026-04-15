'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAgentColor, getAgentLabel } from '@/lib/scoring'
import { truncateAddress } from '@/lib/utils'
import AgentBadge from '@/components/AgentBadge'
import ChainBadge from '@/components/ChainBadge'
import { LeaderboardSkeleton } from '@/components/SkeletonGlitch'

const CHAINS = [
{ value: 'SOL', label: 'SOL', aveChain: 'solana' },
{ value: 'BSC', label: 'BSC', aveChain: 'bsc' },
{ value: 'BASE', label: 'BASE', aveChain: 'base' },
] as const

const AGENT_FILTERS = [
{ value: 'all', label: 'All' },
{ value: 'sniper', label: '⚡ Sniper' },
{ value: 'smart-money', label: '🟢 Smart Money' },
{ value: 'momentum', label: '🟡 Momentum' },
{ value: 'exit-liq', label: '🔴 Exit Liq' },
{ value: 'accumulator', label: '🧬 Accumulator' },
] as const

interface LeaderboardWallet {
wallet_address?: string
address?: string
chain: string
score?: number
total_trades?: number
token_profit_rate?: number
win_rate?: number
total_profit?: number
last_trade_time?: string
scored_at?: string
agent_type?: string
top_tokens?: string[]
tag_items?: { address: string; symbol: string; volume: number }[]
}

function getLastActive(time?: string): string {
if (!time) return '—'
const diff = Date.now() - new Date(time).getTime()
const hours = Math.floor(diff / 3600000)
const days = Math.floor(hours / 24)
if (days > 0) return `${days}d ago`
if (hours > 0) return `${hours}h ago`
return 'just now'
}

export default function LeaderboardPage() {
const [activeChain, setActiveChain] = useState<'SOL' | 'BSC' | 'BASE'>('SOL')
const [activeAgent, setActiveAgent] = useState<string>('all')
const [wallets, setWallets] = useState<LeaderboardWallet[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(false)

useEffect(() => {
setLoading(true)
setError(false)
fetch(`/api/leaderboard?chain=${activeChain}&limit=20&sort=score`)
.then((res) => {
if (!res.ok) throw new Error('Failed')
return res.json()
})
.then((data) => {
setWallets(Array.isArray(data) ? data : [])
setLoading(false)
})
.catch(() => {
setError(true)
setLoading(false)
})
}, [activeChain])

const filteredWallets = activeAgent === 'all'
? wallets
: wallets.filter((w) => (w.agent_type ?? 'momentum') === activeAgent)

return (
<div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

<div>
<h1 className="font-syne font-bold text-3xl text-text-primary">Leaderboard</h1>
<p className="text-text-secondary font-inter text-sm mt-1">
Top performing wallets · Ranked by TS Score · Updated daily
</p>
</div>

<div className="flex gap-1 bg-surface border border-border rounded-card p-1 w-fit">
{CHAINS.map((chain) => (
<button
key={chain.value}
onClick={() => setActiveChain(chain.value)}
className={`px-4 py-1.5 rounded text-sm font-inter font-medium transition-colors ${
activeChain === chain.value
? 'bg-surface-2 text-text-primary'
: 'text-text-secondary hover:text-text-primary'
}`}
>
{chain.label}
{chain.value === 'SOL' && (
<span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-pill bg-[#9945FF20] text-[#9945FF]">
hero
</span>
)}
</button>
))}
</div>

<div className="flex gap-1.5 flex-wrap">
{AGENT_FILTERS.map((f) => (
<button
key={f.value}
onClick={() => setActiveAgent(f.value)}
className={`px-3 py-1.5 rounded-pill text-xs font-inter font-medium transition-colors border ${
activeAgent === f.value
? 'bg-accent text-bg border-accent'
: 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-[#444]'
}`}
>
{f.label}
</button>
))}
</div>

{loading ? (
<LeaderboardSkeleton />
) : error ? (
<div className="text-center py-20 text-text-secondary font-inter text-sm">
Failed to load leaderboard. Try again.
</div>
) : wallets.length === 0 ? (
<div className="text-center py-20 text-text-secondary font-inter text-sm">
No wallets found for this chain.
</div>
) : (
<div className="space-y-2">
{wallets.map((wallet, i) => {
const walletAddr = wallet.address ?? wallet.wallet_address ?? ''
const agentType = wallet.agent_type ?? 'momentum'
const agentColor = getAgentColor(agentType as any)
const score = Number(wallet.score ?? 0)
const winRate = Number(wallet.win_rate ?? wallet.token_profit_rate ?? 0)
const profit = Number(wallet.total_profit ?? 0)
const trades = Number(wallet.total_trades ?? 0)
const lastActive = getLastActive(wallet.scored_at ?? wallet.last_trade_time)
const topTokens = wallet.top_tokens?.slice(0, 3).join(', ')
?? (wallet.tag_items ?? []).slice(0, 3).map((t) => t.symbol).join(', ')
const profitDisplay = Math.abs(profit) >= 9_999_999
? 'N/A'
: `${profit >= 0 ? '+' : ''}$${Math.abs(profit).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

return (
<Link href={`/wallet/${walletAddr}`} key={walletAddr || i}>
<div
className="bg-surface border border-border rounded-card p-4 hover:border-[#444] transition-colors group flex items-center gap-4"
style={{ borderLeft: `3px solid ${agentColor}` }}
>
<span className="text-text-secondary font-mono text-sm w-8 flex-shrink-0">
#{i + 1}
</span>

<div className="flex-1 min-w-0">
<p className="font-mono text-sm text-text-primary group-hover:text-accent transition-colors truncate">
{truncateAddress(walletAddr)}
</p>
<div className="flex items-center gap-1.5 mt-1 flex-wrap">
<ChainBadge chain={activeChain} size="sm" />
<AgentBadge type={agentType as any} size="sm" />
{topTokens && (
<span className="text-xs text-text-secondary font-mono">{topTokens}</span>
)}
</div>
</div>

<div className="hidden md:flex items-center gap-6 text-sm flex-shrink-0">
<div className="text-center">
<p className="text-text-secondary text-xs font-inter">TS Score</p>
<p className="font-syne font-bold text-lg"
style={{ color: score >= 70 ? '#4ADE80' : score >= 45 ? '#FACC15' : '#F87171' }}>
{score}
</p>
</div>
<div className="text-center">
<p className="text-text-secondary text-xs font-inter">Win Rate</p>
<p className="text-text-primary font-inter font-medium">
{(winRate * 100).toFixed(0)}%
</p>
</div>
<div className="text-center">
<p className="text-text-secondary text-xs font-inter">PnL</p>
<p className="font-inter font-medium" style={{ color: profit >= 0 ? '#4ADE80' : '#F87171' }}>
{profitDisplay}
</p>
</div>
<div className="text-center">
<p className="text-text-secondary text-xs font-inter">Trades</p>
<p className="text-text-primary font-inter font-medium">
{trades.toLocaleString()}
</p>
</div>
<div className="text-center">
<p className="text-text-secondary text-xs font-inter">Scored</p>
<p className="text-text-secondary font-inter text-xs">{lastActive}</p>
</div>
</div>

</div>
</Link>
)
})}
</div>
)}

</div>
)
}
