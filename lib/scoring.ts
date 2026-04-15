export type AgentType = 'sniper' | 'smart-money' | 'momentum' | 'exit-liq' | 'accumulator'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type ActionRec = 'accumulating' | 'distributing' | 'active'

export function getAgentLabel(type: AgentType): string {
const labels: Record<AgentType, string> = {
'sniper': 'Sniper',
'smart-money': 'Smart Money',
'momentum': 'Momentum Follower',
'exit-liq': 'Exit Liquidity',
'accumulator': 'Silent Accumulator',
}
return labels[type]
}

export function getAgentEmoji(type: AgentType): string {
const emojis: Record<AgentType, string> = {
'sniper': '⚡',
'smart-money': '🟢',
'momentum': '🟡',
'exit-liq': '🔴',
'accumulator': '🧬',
}
return emojis[type]
}

export function getAgentColor(type: AgentType): string {
const colors: Record<AgentType, string> = {
'sniper': '#818CF8',
'smart-money': '#4ADE80',
'momentum': '#FACC15',
'exit-liq': '#F87171',
'accumulator': '#67E8F9',
}
return colors[type]
}

export function getScoreColor(score: number): string {
if (score >= 70) return '#4ADE80'
if (score >= 45) return '#FACC15'
return '#F87171'
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
const labels: Record<ConfidenceLevel, string> = {
low: 'Low Confidence',
medium: 'Medium Confidence',
high: 'High Confidence',
}
return labels[level]
}

export function getConfidenceColor(level: ConfidenceLevel): string {
const colors: Record<ConfidenceLevel, string> = {
low: '#F87171',
medium: '#FACC15',
high: '#4ADE80',
}
return colors[level]
}

export function getConfidenceTooltip(level: ConfidenceLevel, txCount: number): string {
if (level === 'low')
return `Only ${txCount} transactions detected. Score accuracy is limited — treat as indicative only.`
if (level === 'medium')
return `${txCount} transactions analyzed. Reasonable confidence in classification.`
return `${txCount}+ transactions analyzed. High statistical confidence in score and classification.`
}

export function getActionLabel(rec: ActionRec): string {
const labels: Record<ActionRec, string> = {
accumulating: 'Accumulating',
active: 'Active',
distributing: 'Distributing',
}
return labels[rec]
}

export function getActionColor(rec: ActionRec): string {
const colors: Record<ActionRec, string> = {
accumulating: '#4ADE80',
active: '#FACC15',
distributing: '#F87171',
}
return colors[rec]
}

export function getActionDescription(rec: ActionRec): string {
const desc: Record<ActionRec, string> = {
accumulating: 'Early position detected — optimal entry window may still be open.',
active: 'Already in play. Track but do not chase entry at this stage.',
distributing: 'Exit signals detected. This wallet is selling into current price action.',
}
return desc[rec]
}

export function getChainColor(chain: string): string {
const colors: Record<string, string> = {
SOL: '#9945FF',
BSC: '#F0B90B',
BASE: '#0052FF',
}
return colors[chain] || '#888888'
}
export type Chain = 'SOL' | 'BSC' | 'BASE'