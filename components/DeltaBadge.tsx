interface DeltaBadgeProps {
delta: number
prevAgentType?: string
currentAgentType?: string
}

export default function DeltaBadge({ delta, prevAgentType, currentAgentType }: DeltaBadgeProps) {
if (delta === 0 && prevAgentType === currentAgentType) return null

const isPositive = delta > 0
const isNegative = delta < 0
const hasClassChange = prevAgentType && currentAgentType && prevAgentType !== currentAgentType

return (
<div className="flex items-center gap-2 flex-wrap">
{/* Score delta */}
{delta !== 0 && (
<span
className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-pill text-xs font-inter font-medium"
style={{
backgroundColor: isPositive ? '#4ADE8015' : '#F8717115',
color: isPositive ? '#4ADE80' : '#F87171',
border: `1px solid ${isPositive ? '#4ADE8030' : '#F8717130'}`,
}}
>
{isPositive ? '▲' : '▼'} {Math.abs(delta)} pts
</span>
)}

{/* Classification change */}
{hasClassChange && (
<span className="text-xs text-text-secondary font-inter">
<span className="text-avoid">{prevAgentType}</span>
{' → '}
<span className="text-follow">{currentAgentType}</span>
</span>
)}
</div>
)
}
