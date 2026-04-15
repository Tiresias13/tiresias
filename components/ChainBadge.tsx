import { getChainColor } from '@/lib/scoring'

interface ChainBadgeProps {
chain: string
size?: 'sm' | 'md'
}

export default function ChainBadge({ chain, size = 'md' }: ChainBadgeProps) {
const color = getChainColor(chain)
const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

return (
<span
className={`inline-flex items-center rounded-pill font-mono font-medium ${padding}`}
style={{
backgroundColor: `${color}18`,
color: color,
border: `1px solid ${color}40`,
}}
>
{chain}
</span>
)
}
