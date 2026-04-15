import { getConfidenceLabel, getConfidenceColor, getConfidenceTooltip } from '@/lib/scoring'
import type { ConfidenceLevel } from '@/lib/mock-data'

interface ConfidenceBadgeProps {
level: ConfidenceLevel
txCount: number
}

export default function ConfidenceBadge({ level, txCount }: ConfidenceBadgeProps) {
const label = getConfidenceLabel(level)
const color = getConfidenceColor(level)
const tooltip = getConfidenceTooltip(level, txCount)

const icon = level === 'low' ? '⚠️' : level === 'medium' ? '🟡' : '🟢'

return (
<div className="group relative inline-flex">
<span
className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-inter font-medium cursor-help"
style={{
backgroundColor: `${color}15`,
color: color,
border: `1px solid ${color}30`,
}}
>
<span>{icon}</span>
<span>{label}</span>
</span>

{/* Tooltip */}
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-card text-xs text-text-secondary bg-surface-2 border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
{tooltip}
<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-2" />
</div>
</div>
)
}
