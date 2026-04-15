import Link from 'next/link'
import { truncateAddress, formatRoi, getActionColor, getActionLabel, getAgentColor } from '@/lib/scoring'
import AgentBadge from './AgentBadge'
import ChainBadge from './ChainBadge'
import AIProbabilityBadge from './AIProbabilityBadge'
import DeltaBadge from './DeltaBadge'
import type { AgentType, Chain, ActionRec } from '@/lib/mock-data'

interface WalletCardProps {
address: string
chain: Chain
score: number
agentType: AgentType
actionRec: ActionRec
aiProbability: number
winRate: number
totalProfit: number
deltaScore?: number
prevAgentType?: string
topTokens?: string[]
rank?: number
}

export default function WalletCard({
address,
chain,
score,
agentType,
actionRec,
aiProbability,
winRate,
totalProfit,
deltaScore = 0,
prevAgentType,
topTokens = [],
rank,
}: WalletCardProps) {
const agentColor = getAgentColor(agentType)
const actionColor = getActionColor(actionRec)
const actionLabel = getActionLabel(actionRec)

return (
<Link href={`/wallet/${address}`}>
<div
className="relative bg-surface border border-border rounded-card p-4 hover:border-[#444] transition-colors cursor-pointer group"
style={{ borderLeft: `3px solid ${agentColor}` }}
>
{/* Rank */}
{rank && (
<span className="absolute top-3 right-3 text-xs font-mono text-text-secondary">
#{rank}
</span>
)}

{/* Top row */}
<div className="flex items-start justify-between mb-3">
<div className="space-y-1">
<p className="font-mono text-sm text-text-primary group-hover:text-accent transition-colors">
{truncateAddress(address)}
</p>
<div className="flex items-center gap-1.5 flex-wrap">
<ChainBadge chain={chain} size="sm" />
<AgentBadge type={agentType} size="sm" />
</div>
</div>

{/* Score */}
<div className="text-right">
<p
className="font-syne font-bold text-2xl leading-none"
style={{ color: score >= 70 ? '#4ADE80' : score >= 45 ? '#FACC15' : '#F87171' }}
>
{score}
</p>
<p className="text-xs text-text-secondary font-inter mt-0.5">TS Score</p>
</div>
</div>

{/* Middle row */}
<div className="flex items-center gap-2 flex-wrap mb-3">
<AIProbabilityBadge probability={aiProbability} />

{/* Action rec dot */}
<span
className="inline-flex items-center gap-1 text-xs font-inter"
style={{ color: actionColor }}
>
<span
className="w-1.5 h-1.5 rounded-full"
style={{ backgroundColor: actionColor }}
/>
{actionLabel}
</span>
</div>

{/* Bottom row */}
<div className="flex items-center justify-between">
<div className="flex items-center gap-3 text-xs text-text-secondary font-inter">
<span>
Win rate:{' '}
<span className="text-text-primary">{(winRate * 100).toFixed(0)}%</span>
</span>
<span>
PnL:{' '}
<span style={{ color: totalProfit >= 0 ? '#4ADE80' : '#F87171' }}>
{totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(1)} SOL
</span>
</span>
</div>

<DeltaBadge
delta={deltaScore}
prevAgentType={prevAgentType}
currentAgentType={agentType}
/>
</div>

{/* Top tokens */}
{topTokens.length > 0 && (
<div className="flex items-center gap-1 mt-2 flex-wrap">
{topTokens.slice(0, 4).map((token) => (
<span
key={token}
className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-border"
>
{token}
</span>
))}
</div>
)}
</div>
</Link>
)
}
