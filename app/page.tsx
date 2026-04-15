'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAgentColor, getAgentLabel, getAgentEmoji } from '@/lib/scoring'
import { truncateAddress } from '@/lib/utils'
import { SEED_WALLETS } from '@/lib/seed-wallets'

const AGENT_TYPES = [
{ type: 'smart-money', desc: 'High PQ, BC, TE. The ones worth watching.' },
{ type: 'sniper', desc: 'Extreme timing edge. In and out before you blink.' },
{ type: 'accumulator', desc: 'Patient. Building positions while you sleep.' },
{ type: 'momentum', desc: 'Trend followers. Right sometimes. Late often.' },
{ type: 'exit-liq', desc: 'Selling into your buy. Avoid.' },
] as const

function TopAgents() {
const [wallets, setWallets] = useState<any[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
fetch('/api/leaderboard?chain=SOL&limit=20')
.then((r) => r.json())
.then((data) => {
const arr = Array.isArray(data) ? data : []
// Prioritaskan AI agent, fallback ke top score
const aiWallets = arr.filter((w: any) => Number(w.ai_probability ?? 0) >= 66)
const topWallets = aiWallets.length >= 4
? aiWallets.slice(0, 4)
: arr.slice(0, 4)
setWallets(topWallets)
setLoading(false)
})
.catch(() => setLoading(false))
}, [])

if (loading) return (
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{[...Array(4)].map((_, i) => (
<div key={i} className="bg-surface border border-border rounded-card p-4 h-20 animate-pulse" />
))}
</div>
)

return (
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{wallets.map((wallet, i) => {
const addr = wallet.address ?? wallet.wallet_address ?? ''
const aiProb = Number(wallet.ai_probability ?? 0)
const score = Number(wallet.score ?? 0)
const agentType = wallet.agent_type ?? 'momentum'
return (
<Link href={`/wallet/${addr}`} key={addr || i}>
<div className="bg-surface border border-border rounded-card p-4 hover:border-[#444] transition-colors group">
<div className="flex items-center justify-between mb-2">
<span className="font-mono text-sm text-text-primary group-hover:text-accent transition-colors">
{truncateAddress(addr)}
</span>
<div className="flex items-center gap-2">
<span className="font-syne font-bold text-sm"
style={{ color: score >= 70 ? '#4ADE80' : score >= 45 ? '#FACC15' : '#F87171' }}>
{score}
</span>
<span className="text-xs text-text-secondary font-inter">#{i + 1}</span>
</div>
</div>
<div className="flex items-center gap-2 flex-wrap">
{aiProb >= 66 && (
<span className="text-xs px-2 py-0.5 rounded-pill bg-[#818CF815] text-[#818CF8] border border-[#818CF840] font-inter">
🤖 AI Agent
</span>
)}
{aiProb >= 31 && aiProb < 66 && (
<span className="text-xs px-2 py-0.5 rounded-pill bg-[#FACC1515] text-[#FACC15] border border-[#FACC1540] font-inter">
🟡 Uncertain
</span>
)}
<span className="text-xs text-text-secondary font-inter capitalize">{agentType.replace('-', ' ')}</span>
</div>
</div>
</Link>
)
})}
</div>
)
}

export default function HomePage() {
const router = useRouter()
const [query, setQuery] = useState('')

function handleSearch(e: React.FormEvent) {
e.preventDefault()
const trimmed = query.trim()
if (trimmed.length > 10) {
router.push(`/wallet/${trimmed}`)
}
}
return(
<div className="max-w-7xl mx-auto px-4 py-12 space-y-20">

{/* Hero */}
<section className="text-center space-y-6 pt-8">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-border text-xs text-text-secondary font-inter">
<span className="w-1.5 h-1.5 rounded-full bg-follow animate-pulse" />
Live — Solana · BSC · Base
</div>

<h1 className="font-syne font-bold text-4xl md:text-6xl text-text-primary leading-tight">
See the pattern<br />
<span className="text-accent">behind the profit.</span>
</h1>

<p className="text-text-secondary font-inter text-lg max-w-xl mx-auto">
The market shows you data. Tiresias shows you what it means.
Wallet intelligence — human or machine.
</p>

{/* Search */}
<form onSubmit={handleSearch} className="max-w-lg mx-auto">
<div className="flex gap-2">
<input
type="text"
value={query}
onChange={(e) => setQuery(e.target.value)}
placeholder="Enter wallet address..."
className="flex-1 bg-surface border border-border rounded-card px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
/>
<button
type="submit"
className="px-6 py-3 bg-accent text-bg font-inter font-semibold text-sm rounded-card hover:bg-accent/90 transition-colors"
>
Analyze
</button>
</div>
</form>
</section>

{/* Agent Classifications */}
<section className="space-y-6">
<div className="flex items-center justify-between">
<h2 className="font-syne font-semibold text-xl text-text-primary">
Agent Classifications
</h2>
<Link href="/explorer" className="text-sm text-text-secondary hover:text-text-primary font-inter transition-colors">
Browse all →
</Link>
</div>

<div className="grid grid-cols-1 md:grid-cols-5 gap-3">
{AGENT_TYPES.map(({ type, desc }) => {
const color = getAgentColor(type)
const label = getAgentLabel(type)
const emoji = getAgentEmoji(type)
return (
<Link href={`/explorer?type=${type}`} key={type}>
<div
className="bg-surface border border-border rounded-card p-4 hover:border-[#444] transition-colors h-full"
style={{ borderTop: `2px solid ${color}` }}
>
<div className="text-2xl mb-2">{emoji}</div>
<p className="font-syne font-semibold text-sm text-text-primary mb-1">{label}</p>
<p className="text-xs text-text-secondary font-inter leading-relaxed">{desc}</p>
</div>
</Link>
)
})}
</div>
</section>

{/* Top Agents */}
<section className="space-y-6">
<div className="flex items-center justify-between">
<h2 className="font-syne font-semibold text-xl text-text-primary">
Top Agents
<span className="ml-2 text-sm font-inter font-normal text-text-secondary">SOL</span>
</h2>
<Link href="/leaderboard" className="text-sm text-text-secondary hover:text-text-primary font-inter transition-colors">
Full leaderboard →
</Link>
</div>

<TopAgents />
</section>

{/* Recent Signals */}
<section className="space-y-6">
<div className="flex items-center justify-between">
<h2 className="font-syne font-semibold text-xl text-text-primary">Recent Signals</h2>
<Link href="/signals" className="text-sm text-text-secondary hover:text-text-primary font-inter transition-colors">
Live feed →
</Link>
</div>

<div className="bg-surface border border-border rounded-card divide-y divide-border">
{[
{ action: 'BUY', token: 'JUP', amount: '148,200', usd: '$94,320', wallet: 'YzAbCd...KlMn', type: 'smart-money', time: '5m ago' },
{ action: 'BUY', token: 'WIF', amount: '82,400', usd: '$38,700', wallet: 'GpMZbS...cPt8', type: 'smart-money', time: '12m ago' },
{ action: 'SELL', token: 'MEW', amount: '4,820,000', usd: '$17,820', wallet: 'MnOpQr...YzAb', type: 'sniper', time: '31m ago' },
{ action: 'BUY', token: 'BRETT', amount: '1,240,000', usd: '$61,480', wallet: '0x5dE8...C4', type: 'smart-money', time: '18m ago' },
].map((signal, i) => (
<div key={i} className="flex items-center justify-between px-4 py-3">
<div className="flex items-center gap-3">
<span
className="text-xs font-mono font-semibold w-10"
style={{ color: signal.action === 'BUY' ? '#4ADE80' : '#F87171' }}
>
{signal.action}
</span>
<div>
<p className="text-sm font-inter text-text-primary">
<span className="font-semibold">{signal.token}</span>
<span className="text-text-secondary ml-2">{signal.amount}</span>
<span className="text-text-secondary ml-1 text-xs">{signal.usd}</span>
</p>
<p className="text-xs text-text-secondary font-mono">{signal.wallet}</p>
</div>
</div>
<div className="text-right">
<p className="text-xs text-text-secondary font-inter">{signal.time}</p>
<p
className="text-xs font-inter"
style={{ color: getAgentColor(signal.type as any) }}
>
{getAgentLabel(signal.type as any)}
</p>
</div>
</div>
))}
</div>
</section>

{/* Teaser line */}
<section className="text-center py-8 border-t border-border">
<p className="text-xs text-text-secondary font-inter">
Smart Alerts, Influence Graph — coming.
</p>
</section>

</div>
)
}
