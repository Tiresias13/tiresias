interface AIProbabilityBadgeProps {
probability: number
signals?: {
timingVariance: number
sleepPattern: boolean
reactionSpeed: number
gasOptimized: boolean
tokenBreadth: number
}
frameworks?: string[]
}

export default function AIProbabilityBadge({
probability,
signals,
frameworks = [],
}: AIProbabilityBadgeProps) {
const isAI = probability >= 66
const isUncertain = probability >= 31 && probability < 66
const isHuman = probability < 31

const label = isAI ? '🤖 AI Agent' : isUncertain ? '🟡 Uncertain' : '🟢 Human'
const color = isAI ? '#818CF8' : isUncertain ? '#FACC15' : '#4ADE80'

return (
<div className="group relative inline-flex">
<span
className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-sm font-inter font-medium cursor-help"
style={{
backgroundColor: `${color}15`,
color: color,
border: `1px solid ${color}35`,
}}
>
<span>{label}</span>
<span className="font-mono text-xs opacity-70">{probability}%</span>
</span>

{/* Tooltip with proof */}
{signals && (
<div className="absolute bottom-full left-0 mb-2 w-72 p-3 rounded-card text-xs bg-surface-2 border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 space-y-1.5">
<p className="text-text-primary font-medium mb-2">AI Detection Signals</p>

<div className="flex justify-between">
<span className="text-text-secondary">Timing variance</span>
<span style={{ color: signals.timingVariance < 30000 ? '#F87171' : '#4ADE80' }}>
{signals.timingVariance < 5000 ? 'Abnormally low ⚠️' :
signals.timingVariance < 30000 ? 'Low' : 'Normal'}
</span>
</div>

<div className="flex justify-between">
<span className="text-text-secondary">Sleep pattern</span>
<span style={{ color: signals.sleepPattern ? '#4ADE80' : '#F87171' }}>
{signals.sleepPattern ? 'Detected ✓' : 'Not detected ⚠️'}
</span>
</div>

<div className="flex justify-between">
<span className="text-text-secondary">Reaction speed</span>
<span style={{ color: signals.reactionSpeed < 5000 ? '#F87171' : '#4ADE80' }}>
{signals.reactionSpeed > 0
? `${(signals.reactionSpeed / 1000).toFixed(1)}s avg`
: 'N/A'}
</span>
</div>

<div className="flex justify-between">
<span className="text-text-secondary">Gas optimization</span>
<span style={{ color: signals.gasOptimized ? '#F87171' : '#4ADE80' }}>
{signals.gasOptimized ? 'Always optimal ⚠️' : 'Normal variance'}
</span>
</div>

<div className="flex justify-between">
<span className="text-text-secondary">Token focus</span>
<span style={{ color: signals.tokenBreadth < 5 ? '#F87171' : '#4ADE80' }}>
{signals.tokenBreadth} unique tokens
</span>
</div>

{frameworks.length > 0 && (
<div className="pt-1.5 border-t border-border">
<span className="text-text-secondary">Frameworks: </span>
<span className="text-accent">{frameworks.join(', ')}</span>
</div>
)}

<div className="absolute top-full left-4 border-4 border-transparent border-t-surface-2" />
</div>
)}
</div>
)
}
