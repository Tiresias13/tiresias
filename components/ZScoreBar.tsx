interface ZScoreBarProps {
label: string
zscore: number
value?: number
}

function ZScoreBar({ label, zscore, value }: ZScoreBarProps) {
const isExtreme = Math.abs(zscore) >= 2
const isPositive = zscore >= 0
const color = isExtreme
? isPositive ? '#E8FF47' : '#F87171'
: isPositive ? '#4ADE80' : '#FACC15'

// Bar width: zscore capped at ±3, mapped to 0-100%
const barWidth = Math.min(Math.abs(zscore) / 3, 1) * 100

return (
<div className="space-y-1">
<div className="flex items-center justify-between text-xs">
<span className="text-text-secondary font-inter">{label}</span>
<div className="flex items-center gap-2">
{value !== undefined && (
<span className="text-text-secondary font-mono">{value.toFixed(0)}</span>
)}
<span
className="font-mono font-medium"
style={{ color }}
>
{zscore >= 0 ? '+' : ''}{zscore.toFixed(2)}σ
{isExtreme && ' ⚡'}
</span>
</div>
</div>

{/* Bar */}
<div className="relative h-1 bg-surface-2 rounded-full overflow-hidden">
{/* Center line */}
<div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />

{/* Fill */}
<div
className="absolute top-0 bottom-0 rounded-full transition-all duration-700"
style={{
width: `${barWidth / 2}%`,
left: isPositive ? '50%' : `${50 - barWidth / 2}%`,
backgroundColor: color,
boxShadow: isExtreme ? `0 0 4px ${color}` : 'none',
}}
/>
</div>
</div>
)
}

interface ZScoreBreakdownProps {
zscores: {
pq: number
te: number
bc: number
si: number
ni: number
rs: number
}
components?: {
pq: number
te: number
bc: number
si: number
ni: number
rs: number
}
percentile?: number
totalTracked?: number
}

export default function ZScoreBreakdown({
zscores,
components,
percentile,
totalTracked,
}: ZScoreBreakdownProps) {
return (
<div className="space-y-3">
{percentile !== undefined && totalTracked && (
<p className="text-xs text-text-secondary font-inter">
Top{' '}
<span className="text-accent font-medium">{percentile}%</span>
{' '}of{' '}
<span className="text-text-primary">{totalTracked.toLocaleString()}</span>
{' '}wallets tracked
</p>
)}

<ZScoreBar
label="Profit Quality (PQ)"
zscore={zscores.pq}
value={components?.pq}
/>
<ZScoreBar
label="Timing Edge (TE)"
zscore={zscores.te}
value={components?.te}
/>
<ZScoreBar
label="Behavioral Consistency (BC)"
zscore={zscores.bc}
value={components?.bc}
/>
<ZScoreBar
label="Strategy Identity (SI)"
zscore={zscores.si}
value={components?.si}
/>
<ZScoreBar
label="Network Influence (NI)"
zscore={zscores.ni}
value={components?.ni}
/>
<ZScoreBar
label="Risk Score (RS)"
zscore={zscores.rs}
value={components?.rs}
/>
</div>
)
}
