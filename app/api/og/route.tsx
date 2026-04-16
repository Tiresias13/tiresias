import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getCachedScore } from '@/lib/supabase'
import { getAgentLabel, getAgentEmoji, getAgentColor, getScoreColor, getChainColor, getActionLabel, getActionColor } from '@/lib/scoring'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
const address = req.nextUrl.searchParams.get('address') ?? ''
const chain = req.nextUrl.searchParams.get('chain') ?? 'SOL'

// Try to get cached score
let score = 0
let agentType = 'momentum'
let actionRec = 'active'
let aiProbability = 0
let winRate = 0
let totalProfit = 0

try {
const base = req.nextUrl.origin
const res = await fetch(`${base}/api/wallet/${address}?chain=${chain}`, { cache: 'no-store' })
if (res.ok) {
const json = await res.json()
score = json.score ?? 0
agentType = json.agentType ?? 'momentum'
actionRec = json.actionRec ?? 'active'
aiProbability = json.aiDetection?.probability ?? 0
winRate = json.winRate ?? 0
totalProfit = json.totalProfit ?? 0
}
} catch {
// Use defaults
}

const truncated = address.length > 12
? `${address.slice(0, 6)}...${address.slice(-6)}`
: address

const scoreColor = getScoreColor(score)
const agentColor = getAgentColor(agentType as any)
const chainColor = getChainColor(chain)
const actionColor = getActionColor(actionRec as any)
const agentLabel = getAgentLabel(agentType as any)
const agentEmoji = getAgentEmoji(agentType as any)
const actionLabel = getActionLabel(actionRec as any)

const isAI = aiProbability >= 66
const aiLabel = isAI ? '🤖 AI Agent' : aiProbability >= 31 ? '🟡 Uncertain' : '🟢 Human'

return new ImageResponse(
(
<div
style={{
width: '1200px',
height: '630px',
background: '#0A0A0A',
display: 'flex',
flexDirection: 'column',
justifyContent: 'space-between',
padding: '48px',
fontFamily: 'sans-serif',
position: 'relative',
overflow: 'hidden',
}}
>
{/* Background accent line */}
<div style={{
position: 'absolute',
left: 0, top: 0, bottom: 0,
width: '4px',
background: agentColor,
}} />

{/* Noise texture overlay */}
<div style={{
position: 'absolute',
inset: 0,
background: 'radial-gradient(ellipse at 80% 20%, #E8FF4708 0%, transparent 60%)',
}} />

{/* Top row */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
{/* Logo */}
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
<div style={{
width: '32px', height: '32px',
border: '2px solid #E8FF47',
borderRadius: '50%',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
}}>
<div style={{ width: '8px', height: '8px', background: '#E8FF47', borderRadius: '50%' }} />
</div>
<span style={{ color: '#E8FF47', fontSize: '20px', fontWeight: 700, letterSpacing: '3px' }}>
TIRESIAS
</span>
</div>

{/* Chain badge */}
<div style={{
padding: '6px 16px',
borderRadius: '999px',
border: `1px solid ${chainColor}40`,
background: `${chainColor}15`,
color: chainColor,
fontSize: '14px',
fontWeight: 600,
}}>
{chain}
</div>
</div>

{/* Middle — main content */}
<div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
{/* Score arc placeholder */}
<div style={{
width: '140px',
height: '140px',
borderRadius: '50%',
border: `8px solid ${scoreColor}`,
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
justifyContent: 'center',
background: `${scoreColor}10`,
flexShrink: 0,
boxShadow: `0 0 40px ${scoreColor}30`,
}}>
<span style={{ color: scoreColor, fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
{score}
</span>
<span style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>TS SCORE</span>
</div>

{/* Info */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
{/* Address */}
<span style={{ color: '#888', fontSize: '16px', fontFamily: 'monospace' }}>
{truncated}
</span>

{/* Agent type */}
<div style={{
display: 'flex',
alignItems: 'center',
gap: '8px',
padding: '8px 20px',
borderRadius: '999px',
border: `1px solid ${agentColor}40`,
background: `${agentColor}15`,
color: agentColor,
fontSize: '18px',
fontWeight: 600,
width: 'fit-content',
}}>
{agentEmoji} {agentLabel}
</div>

{/* AI + Action */}
<div style={{ display: 'flex', gap: '12px' }}>
<div style={{
padding: '6px 16px',
borderRadius: '999px',
border: '1px solid #818CF840',
background: '#818CF815',
color: '#818CF8',
fontSize: '14px',
}}>
{aiLabel} {aiProbability}%
</div>
<div style={{
padding: '6px 16px',
borderRadius: '999px',
border: `1px solid ${actionColor}40`,
background: `${actionColor}15`,
color: actionColor,
fontSize: '14px',
}}>
● {actionLabel}
</div>
</div>

{/* Stats */}
<div style={{ display: 'flex', gap: '24px', color: '#888', fontSize: '14px' }}>
<span>Win rate: <span style={{ color: '#F5F5F5' }}>{(winRate * 100).toFixed(0)}%</span></span>
<span>PnL: <span style={{ color: totalProfit >= 0 ? '#4ADE80' : '#F87171' }}>
{totalProfit >= 0 ? '+' : ''}${Math.abs(totalProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}
</span></span>
</div>
</div>
</div>

{/* Bottom */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<span style={{ color: '#444', fontSize: '13px' }}>
On-chain intelligence · tiresiasave.vercel.app
</span>
<span style={{ color: '#E8FF47', fontSize: '13px', opacity: 0.6 }}>
"See the pattern behind the profit."
</span>
</div>
</div>
),
{
width: 1200,
height: 630,
}
)
}