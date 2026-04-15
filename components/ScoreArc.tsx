import { getScoreColor } from '@/lib/scoring'

interface ScoreArcProps {
score: number
size?: number
}

export default function ScoreArc({ score, size = 120 }: ScoreArcProps) {
const color = getScoreColor(score)

const strokeWidth = 8
const radius = (size - strokeWidth * 2) / 2
const circumference = Math.PI * radius // semicircle
const fillLength = (score / 100) * circumference
const strokeDashoffset = circumference - fillLength

// Center of the full circle — arc drawn as bottom semicircle
const cx = size / 2
const cy = size / 2

// Height: just the bottom half + a bit of padding
const svgHeight = size / 2 + strokeWidth + 4

return (
<div
className="relative inline-flex items-center justify-center"
style={{ width: size, height: svgHeight }}
>
<svg
width={size}
height={svgHeight}
viewBox={`0 0 ${size} ${svgHeight}`}
overflow="visible"
>
{/* Background arc — left to right semicircle (bottom half) */}
<path
d={`M ${strokeWidth} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${cy}`}
fill="none"
stroke="#2A2A2A"
strokeWidth={strokeWidth}
strokeLinecap="round"
/>

{/* Score arc */}
<path
d={`M ${strokeWidth} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${cy}`}
fill="none"
stroke={color}
strokeWidth={strokeWidth}
strokeLinecap="round"
strokeDasharray={circumference}
strokeDashoffset={strokeDashoffset}
style={{
transition: 'stroke-dashoffset 1s ease-in-out',
filter: `drop-shadow(0 0 6px ${color}80)`,
}}
/>
</svg>

{/* Score number — centered above the arc midpoint */}
<div
className="absolute flex flex-col items-center justify-center"
style={{ bottom: strokeWidth + 2, left: 0, right: 0 }}
>
<span
className="font-syne font-bold leading-none"
style={{ fontSize: size * 0.28, color }}
>
{score}
</span>
<span
className="text-text-secondary font-inter tracking-widest uppercase"
style={{ fontSize: size * 0.085, marginTop: 2 }}
>
TS Score
</span>
</div>
</div>
)
}
