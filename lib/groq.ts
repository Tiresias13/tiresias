import Groq from 'groq-sdk'

const groq = new Groq({
apiKey: process.env.GROQ_API_KEY!,
})

// Types
export interface WalletAnalysisInput {
address: string
chain: string
totalProfit: number
profitRate: number
totalTrades: number
winRate: number
timingStdDev: number
activityPattern: string
tokenBreadth: number
aiProbability: number
topTokens: string[]
zscore: {
pq: number
te: number
bc: number
si: number
ni: number
rs: number
}
}

export interface GroqWalletAnalysis {
agentType: 'sniper' | 'smart-money' | 'momentum' | 'exit-liq' | 'accumulator'
actionRec: 'accumulating' | 'active' | 'distributing'
confidenceLevel: 'low' | 'medium' | 'high'
explainability: { label: string; value: number; isWarning?: boolean }[]
insight: string
shortInsight: string
}

export async function analyzeWallet(
input: WalletAnalysisInput
): Promise<GroqWalletAnalysis> {
const prompt = buildPrompt(input)

const completion = await groq.chat.completions.create({
model: 'llama-3.3-70b-versatile',
messages: [
{
role: 'system',
content: `You are TIRESIAS — a brutal, data-driven onchain intelligence engine.
Your job: classify wallets, expose patterns, deliver verdicts.

Tone: rebel, punk, grunge. Raw and opinionated. No corporate speak. No disclaimers.
You speak like someone who has seen every rug, every pump, every 100x — and is bored by most of it.
When something is genuinely interesting, you say so. When it's trash, you call it trash.

Always respond in valid JSON. No markdown. No explanation outside the JSON.`,
},
{
role: 'user',
content: prompt,
},
],
temperature: 0.7,
max_tokens: 1024,
response_format: { type: 'json_object' },
})

const raw = completion.choices[0]?.message?.content ?? '{}'

try {
const parsed = JSON.parse(raw)
return {
agentType: parsed.agentType ?? 'momentum',
actionRec: parsed.actionRec ?? 'active',
confidenceLevel: parsed.confidenceLevel ?? 'medium',
explainability: parsed.explainability ?? [],
insight: parsed.insight ?? 'No signal.',
shortInsight: parsed.shortInsight ?? 'Unclassified.',
}
} catch {
return fallbackAnalysis(input)
}
}

function buildPrompt(input: WalletAnalysisInput): string {
return `Analyze this wallet and return a JSON classification.

WALLET DATA:
- Address: ${input.address}
- Chain: ${input.chain}
- Total Profit: ${Number(input.totalProfit ?? 0).toFixed(2)} SOL
- Profit Rate: ${(input.profitRate * 100).toFixed(1)}%
- Total Trades: ${input.totalTrades}
- Win Rate: ${(input.winRate * 100).toFixed(1)}%
- Timing StdDev: ${input.timingStdDev.toFixed(0)}ms (low = AI-like)
- Activity Pattern: ${input.activityPattern}
- Token Breadth: ${input.tokenBreadth} unique tokens
- AI Probability: ${input.aiProbability}%
- Top Tokens: ${input.topTokens.join(', ')}

Z-SCORES (relative to all tracked wallets):
- PQ (Profit Quality): ${input.zscore.pq.toFixed(2)}σ
- TE (Timing Edge): ${input.zscore.te.toFixed(2)}σ
- BC (Behavioral Consistency): ${input.zscore.bc.toFixed(2)}σ
- SI (Strategy Identity): ${input.zscore.si.toFixed(2)}σ
- NI (Network Influence): ${input.zscore.ni.toFixed(2)}σ
- RS (Risk Score): ${input.zscore.rs.toFixed(2)}σ

RETURN THIS JSON:
{
"agentType": "sniper" | "smart-money" | "momentum" | "exit-liq" | "accumulator",
"actionRec": "accumulating" | "active" | "distributing",
"confidenceLevel": "low" | "medium" | "high",
"explainability": [
{ "label": "reason text", "value": 12, "isWarning": false },
{ "label": "risk reason", "value": -8, "isWarning": true }
],
"insight": "2-3 sentence raw intel briefing. Rebel/punk tone. No disclaimers. Make it readable and interesting.",
"shortInsight": "One punchy line. Max 12 words."
}`
}

function fallbackAnalysis(input: WalletAnalysisInput): GroqWalletAnalysis {
const winRate = input.winRate
const aiProb = input.aiProbability

let agentType: GroqWalletAnalysis['agentType'] = 'momentum'
if (winRate > 0.7 && input.zscore.te > 1.5) agentType = 'sniper'
else if (winRate > 0.65) agentType ='smart-money'
else if (winRate < 0.35) agentType = 'exit-liq'
else if (input.tokenBreadth < 5 && input.totalTrades > 100) agentType = 'accumulator'

return {
agentType,
actionRec: winRate > 0.6 ? 'accumulating' : winRate < 0.4 ? 'distributing' : 'active',
confidenceLevel: input.totalTrades > 100 ? 'high' : input.totalTrades > 30 ? 'medium' : 'low',
explainability: [
{ label: `Win rate: ${(winRate * 100).toFixed(0)}%`, value: Math.round(winRate * 20) },
{ label: `${input.totalTrades} total trades analyzed`, value: 5 },
...(aiProb > 65 ? [{ label: `AI agent behavior detected (${aiProb}%)`, value: -5, isWarning: true }] : []),
],
insight: `${input.totalTrades} trades. ${(winRate * 100).toFixed(0)}% win rate. AI probability: ${aiProb}%. Pattern: ${agentType}.`,
shortInsight: `${agentType.replace('-', ' ')} — ${(winRate * 100).toFixed(0)}% win rate.`,
}
}
