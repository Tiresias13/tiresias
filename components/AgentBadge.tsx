import { getAgentLabel, getAgentEmoji, getAgentColor } from '@/lib/scoring'
import type { AgentType } from '@/lib/mock-data'

interface AgentBadgeProps {
type: AgentType
size?: 'sm' | 'md'
}

export default function AgentBadge({ type, size = 'md' }: AgentBadgeProps) {
const label = getAgentLabel(type)
const emoji = getAgentEmoji(type)
const color = getAgentColor(type)

const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

return (
<span
className={`inline-flex items-center gap-1 rounded-pill font-inter font-medium ${padding}`}
style={{
backgroundColor: `${color}18`,
color: color,
border: `1px solid ${color}40`,
}}
>
<span>{emoji}</span>
<span>{label}</span>
</span>
)
}