import { getWalletInfo, getWalletTokens, getWalletTxs, getContractRisk, toAveChain } from './ave'
import { getWalletTransactions, analyzeTimingPatterns, analyzeGasBehavior } from './helius'
import { toDexChain, confirmTokenPerformance } from './dexscreener'
import { searchWalletInGitHub } from './github'
import { analyzeWallet } from './groq'
import { getCachedScore, saveWalletScore, getScoreHistory, archiveScoreToHistory, getDynamicBaseline, type WalletScore } from './supabase'

export interface ComponentScores {
pq: number; te: number; bc: number; si: number; ni: number; rs: number
}

export interface ZScores {
pq: number; te: number; bc: number; si: number; ni: number; rs: number
}

export interface AiDetectionResult {
probability: number
signals: {
timingVariance: number
sleepPattern: boolean
reactionSpeed: number
gasOptimized: boolean
tokenBreadth: number
}
githubSignal: {
found: boolean
frameworks: string[]
confidence: number
}
}

export interface TxItem {
blockTime: number
symbol?: string
side: 'buy' | 'sell'
amount?: number
signature: string
chain: string
}

export interface ScoringResult {
address: string
chain: string
score: number
components: ComponentScores
zscores: ZScores
aiDetection: AiDetectionResult
winRate: number
totalTrades: number
totalProfit: number
topTokens: string[]
isScamContract: boolean
honeypotCount: number
agentType: string
actionRec: string
confidence: string
explainability: { label: string; value: number; isWarning?: boolean }[]
insight: string
shortInsight: string
deltaScore: number
prevAgentType?: string
recentTxs: TxItem[]
}

const BASELINE = {
pq: { mean: 50, std: 20 },
te: { mean: 50, std: 20 },
bc: { mean: 50, std: 20 },
si: { mean: 50, std: 20 },
ni: { mean: 30, std: 15 },
rs: { mean: 20, std: 15 },
}

export function calculateZScore(value: number, mean: number, std: number): number {
if (std === 0) return 0
return parseFloat(((value - mean) / std).toFixed(2))
}

export function calculateZScores(components: ComponentScores): ZScores {
return {
pq: calculateZScore(components.pq, BASELINE.pq.mean, BASELINE.pq.std),
te: calculateZScore(components.te, BASELINE.te.mean, BASELINE.te.std),
bc: calculateZScore(components.bc, BASELINE.bc.mean, BASELINE.bc.std),
si: calculateZScore(components.si, BASELINE.si.mean, BASELINE.si.std),
ni: calculateZScore(components.ni, BASELINE.ni.mean, BASELINE.ni.std),
rs: calculateZScore(components.rs, BASELINE.rs.mean, BASELINE.rs.std),
}
}

export function calculateTS(components: ComponentScores): number {
const { pq, te, bc, si, ni, rs } = components
const score = (0.25 * pq) + (0.20 * te) + (0.15 * bc) + (0.15 * si) + (0.15 * ni) - (0.10 * rs)
return Math.max(0, Math.min(100, Math.round(score)))
}

export function applyHoneypotMultiplier(rs: number, honeypotCount: number): number {
if (honeypotCount >= 3) return Math.min(100, rs * 1.5)
return rs
}

export function calculateAiProbability(
timingStdDevMs: number,
hasSleepPattern: boolean,
avgReactionSpeedMs: number,
gasOptimized: boolean,
tokenBreadth: number,
totalTrades: number,
githubConfidence: number,
heatmapUniformity: number = 0 // 0–1, makin tinggi makin uniform (AI-like)
): number {
let score = 0
if (timingStdDevMs < 5000) score += 25
else if (timingStdDevMs < 30000) score += 15
else if (timingStdDevMs < 120000) score += 5
if (!hasSleepPattern) score += 20
// 24h heatmap signal
if (heatmapUniformity > 0.8) score += 15
else if (heatmapUniformity > 0.6) score += 8
if (avgReactionSpeedMs > 0 && avgReactionSpeedMs < 5000) score += 20
else if (avgReactionSpeedMs < 30000) score += 10
if (gasOptimized) score += 15
if (totalTrades > 50 && tokenBreadth < 5) score += 15
else if (totalTrades > 100 && tokenBreadth < 10) score += 8
score += Math.round(githubConfidence * 0.05)
return Math.min(100, score)
}

function inferAgentTypeFromScores(c: ComponentScores, winRate: number): string {
if (winRate > 0.65 && c.te > 60) return 'sniper'
if (winRate > 0.6 && c.bc > 60) return 'smart-money'
if (winRate < 0.35) return 'exit-liq'
if (c.si > 60 && c.bc > 60) return 'accumulator'
return 'momentum'
}

function inferActionRec(c: ComponentScores): string {
if (c.pq > 70 && c.te > 60) return 'accumulating'
if (c.rs > 40) return 'distributing'
return 'active'
}

function buildExplainability(
c: ComponentScores,
z: ZScores,
aiProb: number
): { label: string; value: number; isWarning?: boolean }[] {
const items = []
if (z.pq > 1) items.push({ label: 'High profit rate', value: parseFloat((c.pq).toFixed(1)) })
if (z.pq < -1) items.push({ label: 'Low profit rate', value: parseFloat((c.pq).toFixed(1)), isWarning: true })
if (z.te > 1) items.push({ label: 'Strong timing edge', value: parseFloat((z.te).toFixed(2)) })
if (z.ni < -1) items.push({ label: 'Low network influence', value: parseFloat((z.ni).toFixed(2)), isWarning: true })
if (aiProb > 65) items.push({ label: 'High AI probability', value: aiProb })
return items.slice(0, 4)
}

export async function scoreWallet(
address: string,
chain: string = 'SOL',
forceRefresh: boolean = false,
skipGroq: boolean = false
): Promise<ScoringResult> {
if (!forceRefresh) {
const cached = await getCachedScore(address)
if (cached) return mapCachedToResult(cached)
}

const aveChain = toAveChain(chain)
toDexChain(chain)
const [walletInfo, walletTokens, walletTxs, history, githubSignal] = await Promise.allSettled([
getWalletInfo(address, aveChain),
getWalletTokens(address, aveChain, 50),
getWalletTxs(address, aveChain, undefined, 100, 1738368000),
getScoreHistory(address, 2),
searchWalletInGitHub(address),
])

const info = walletInfo.status === 'fulfilled' ? walletInfo.value : null
const tokens = walletTokens.status === 'fulfilled' ? walletTokens.value : []
const txs = walletTxs.status === 'fulfilled' ? walletTxs.value : []
const scoreHistory = history.status === 'fulfilled' ? history.value : []
const github = githubSignal.status === 'fulfilled'
? githubSignal.value
: { found: false, mentionCount: 0, frameworks: [], confidence: 0 }

let timingAnalysis = null
let gasAnalysis = null
if (chain === 'SOL') {
try {
const heliusTxs = await getWalletTransactions(address, 100)
timingAnalysis = analyzeTimingPatterns(heliusTxs)
gasAnalysis = analyzeGasBehavior(heliusTxs)
} catch { /* Helius unavailable */ }
}

const rawInfo = info as Record<string, unknown> | null
const buyTrades = Number(rawInfo?.total_purchase ?? 0)
const sellTrades = Number(rawInfo?.total_sold ?? 0)
const totalTrades = buyTrades + sellTrades || txs.length
const winRate = Number(rawInfo?.total_win_ratio ?? 0) / 100
const rawProfit = parseFloat(String(rawInfo?.total_profit ?? '0'))
// Sanity check: cap at $10M (anything above is likely unit mismatch from AVE)
const totalProfit = isNaN(rawProfit) ? 0 : Math.min(rawProfit, 10_000_000)
const topTokens = Array.isArray(tokens)
? tokens.slice(0, 4).map((t) => String(t.symbol ?? '')).filter(Boolean)
: []

const txsArray = Array.isArray(txs) ? txs : Array.isArray((txs as any)?.result) ? (txs as any).result : Array.isArray((txs as any)?.list) ? (txs as any).list : []
const recentTxs: TxItem[] = txsArray.slice(0, 20).map((tx: any) => ({
blockTime: tx.time ? Math.floor(new Date(tx.time).getTime() / 1000) : Number(tx.block_time ?? tx.blockTime ?? 0),
side: (() => {
const fromIsBase = ['SOL', 'USDC', 'USDT', 'WSOL', 'ETH', 'BNB', 'WBNB'].includes(tx.from_symbol ?? '')
const toIsBase = ['SOL', 'USDC', 'USDT', 'WSOL', 'ETH', 'BNB', 'WBNB'].includes(tx.to_symbol ?? '')
if (fromIsBase && !toIsBase) return 'buy'
if (toIsBase && !fromIsBase) return 'sell'
return (tx.side ?? tx.type ?? '').toLowerCase().includes('buy') ? 'buy' : 'sell'
})(),
symbol: (() => {
const fromIsBase = ['SOL', 'USDC', 'USDT', 'WSOL', 'ETH', 'BNB', 'WBNB'].includes(tx.from_symbol ?? '')
if (fromIsBase) return String(tx.to_symbol ?? tx.token_symbol ?? '')
return String(tx.from_symbol ?? tx.token_symbol ?? '')
})(),
amount: tx.value_usd != null
? Number(tx.value_usd)
: (tx.from_amount != null && tx.from_price_usd != null)
? Number(tx.from_amount) * Number(tx.from_price_usd)
: undefined,
signature: String(tx.transaction ?? tx.tx_hash ?? tx.signature ?? ''),
chain,
}))

const tradeRatio = totalTrades > 0 ? buyTrades / totalTrades : 0.5

const pq = Math.min(100, Math.round((winRate * 60) + (Math.min(totalProfit, 1000) / 1000 * 40)))
const timingStdDev = timingAnalysis?.stdDevIntervalMs ?? 60000
const te = Math.min(100, Math.round(Math.max(0, 100 - (timingStdDev / 864000))))
const bc = Math.min(100, Math.round(50 + (Math.abs(tradeRatio - 0.5) * 100)))
const tokenBreadth = tokens.length || 1
const si = Math.min(100, Math.round(Math.max(0, 100 - (tokenBreadth * 3) + (totalTrades > 50 ? 20 : 0))))
const totalVolume = Number(rawInfo?.total_volume ?? rawInfo?.volume ?? 0)
const txOverlapScore = (() => {
const txList = Array.isArray(txs) ? txs : Array.isArray((txs as any)?.result) ? (txs as any).result : Array.isArray((txs as any)?.list) ? (txs as any).list : []
if (txList.length < 5) return 0

// Unique tokens yang di-trade
const uniqueTokens = new Set(txList.map((tx: any) => tx.to_address ?? tx.token_address ?? tx.token ?? '').filter(Boolean))
const uniqueCount = uniqueTokens.size

// Makin banyak unique token + volume tinggi = influence lebih tinggi
const txVolume = txList.reduce((sum: number, tx: any) => sum + (Number(tx.from_amount ?? 0) * Number(tx.from_price_usd ?? 0)), 0)
const volumeScore = Math.min(50, Math.round(Math.min(txVolume || totalVolume, 50000) / 1000))
const breadthScore = Math.min(40, uniqueCount * 2)
const consistencyScore = txList.length > 50 ? 10 : txList.length > 20 ? 5 : 0
return Math.min(100, volumeScore + breadthScore + consistencyScore)
})()
const ni = Math.min(100, txOverlapScore)

let honeypotCount = 0
let isScamContract = false
const tokenAddresses = Array.isArray(tokens)
? tokens.slice(0, 5).map((t) => String(t.token_address ?? ''))
: []

await Promise.allSettled(
tokenAddresses.filter(Boolean).map(async (addr) => {
try {
const risk = await getContractRisk(addr, aveChain)
if (risk.is_honeypot) honeypotCount++
if (risk.risk_level >= 3) isScamContract = true
} catch { /* skip */ }
})
)

const rsRaw = Math.min(100, (honeypotCount * 15) + (isScamContract ? 40 : 0))
const rs = applyHoneypotMultiplier(rsRaw, honeypotCount)

const dynamicBaseline = await getDynamicBaseline()
const tokenAddressesForDex = Array.isArray(tokens)
? tokens.slice(0, 8).map((t: any) => String(t.token_address ?? '')).filter(Boolean)
: []
const dexChain = toDexChain(chain)
const dexData = tokenAddressesForDex.length > 0
? await confirmTokenPerformance(tokenAddressesForDex, dexChain)
: new Map()

let pqDexBoost = 0
if (dexData.size > 0) {
const changes = Array.from(dexData.values()).map((d) => d.priceChange24h)
const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length
if (avgChange > 10) pqDexBoost = 5
else if (avgChange > 5) pqDexBoost = 2
else if (avgChange < -20) pqDexBoost = -5
}
const pqFinal = Math.min(100, Math.max(0, pq + pqDexBoost))
const components: ComponentScores = { pq: pqFinal, te, bc, si, ni, rs }

const zscores = dynamicBaseline
? {
pq: calculateZScore(pq, dynamicBaseline.pq.mean, dynamicBaseline.pq.std),
te: calculateZScore(te, dynamicBaseline.te.mean, dynamicBaseline.te.std),
bc: calculateZScore(bc, dynamicBaseline.bc.mean, dynamicBaseline.bc.std),
si: calculateZScore(si, dynamicBaseline.si.mean, dynamicBaseline.si.std),
ni: calculateZScore(ni, dynamicBaseline.ni.mean, dynamicBaseline.ni.std),
rs: calculateZScore(rs, dynamicBaseline.rs.mean, dynamicBaseline.rs.std),
}
: calculateZScores(components)

let score = calculateTS(components)
if (isScamContract) score = Math.min(score, 40)

const hasSleepPattern = timingAnalysis?.hasSleepPattern ?? true

const heatmapUniformity = (() => {
const txList = Array.isArray(txs) ? txs : Array.isArray((txs as any)?.result) ? (txs as any).result : Array.isArray((txs as any)?.list) ? (txs as any).list : []
if (txList.length < 10) return 0
const hours = new Array(24).fill(0)
for (const tx of txList) {
const t = (tx as any).block_time ?? (tx as any).blockTime
if (t) hours[new Date(t * 1000).getUTCHours()]++
}
const active = hours.filter((h) => h > 0).length
return active / 24 // makin tinggi = makin spread (uniform = AI-like)
})()
const aiProbability = calculateAiProbability(
timingStdDev,
hasSleepPattern,
timingAnalysis?.minIntervalMs ?? 60000,
gasAnalysis?.isOptimized ?? false,
tokenBreadth,
totalTrades,
github.confidence,
heatmapUniformity
)

const groqResult = skipGroq
? {
agentType: inferAgentTypeFromScores(components, winRate),
actionRec: inferActionRec(components),
explainability: buildExplainability(components, zscores, aiProbability),
insight: '',
shortInsight: '',
}
: await analyzeWallet({
address,
chain,
totalProfit,
profitRate: winRate,
totalTrades,
winRate,
timingStdDev,
activityPattern: hasSleepPattern ? 'human-like' : 'no sleep pattern',
tokenBreadth,
aiProbability,
topTokens,
zscore: zscores,
})

const prevScore = scoreHistory[0]
const deltaScore = prevScore ? score - prevScore.score : 0
const prevAgentType = prevScore?.agent_type
const confidence = totalTrades > 100 ? 'high' : totalTrades > 30 ? 'medium' : 'low'

const result: ScoringResult = {
address,
chain,
score,
components,
zscores,
aiDetection: {
probability: aiProbability,
signals: {
timingVariance: timingStdDev,
sleepPattern: hasSleepPattern,
reactionSpeed: timingAnalysis?.minIntervalMs ?? 0,
gasOptimized: gasAnalysis?.isOptimized ?? false,
tokenBreadth,
},
githubSignal: {
found: github.found,
frameworks: github.frameworks ?? [],confidence: github.confidence,
},
},
winRate,
totalTrades,
totalProfit,
topTokens,
isScamContract,
honeypotCount,
agentType: groqResult.agentType,
actionRec: groqResult.actionRec,
confidence,
explainability: groqResult.explainability,
insight: groqResult.insight,
shortInsight: groqResult.shortInsight,
deltaScore,
prevAgentType,
recentTxs,
}

const walletScore = mapResultToScore(result)
await saveWalletScore(walletScore)
if (prevScore) await archiveScoreToHistory(walletScore)

return result
}

function mapResultToScore(result: ScoringResult): WalletScore {
return {
address: result.address,
chain: result.chain,
score: result.score,
agent_type: result.agentType,
action_rec: result.actionRec,
confidence: result.confidence,
ai_probability: result.aiDetection.probability,
pq: result.components.pq,
te: result.components.te,
bc: result.components.bc,
si: result.components.si,
ni: result.components.ni,
rs: result.components.rs,
pq_zscore: result.zscores.pq,
te_zscore: result.zscores.te,
bc_zscore: result.zscores.bc,
si_zscore: result.zscores.si,
ni_zscore: result.zscores.ni,
rs_zscore: result.zscores.rs,
win_rate: result.winRate,
total_trades: result.totalTrades,
total_profit: result.totalProfit,
top_tokens: result.topTokens,
explainability: result.explainability,
insight: result.insight,
short_insight: result.shortInsight,
is_scam_contract: result.isScamContract,
honeypot_count: result.honeypotCount,
delta_score: result.deltaScore,
prev_agent_type: result.prevAgentType,
scored_at: new Date().toISOString(),
}
}

function mapCachedToResult(cached: WalletScore): ScoringResult {
return {
address: cached.address,
chain: cached.chain,
score: cached.score,
components: {
pq: cached.pq, te: cached.te, bc: cached.bc,
si: cached.si, ni: cached.ni, rs: cached.rs,
},
zscores: {
pq: cached.pq_zscore, te: cached.te_zscore, bc: cached.bc_zscore,
si: cached.si_zscore, ni: cached.ni_zscore, rs: cached.rs_zscore,
},
aiDetection: {
probability: cached.ai_probability,
signals: {
timingVariance: 0,
sleepPattern: true,
reactionSpeed: 0,
gasOptimized: false,
tokenBreadth: 0,
},
githubSignal: { found: false, frameworks: [], confidence: 0 },
},
winRate: cached.win_rate,
totalTrades: cached.total_trades,
totalProfit: Number(cached.total_profit ?? 0),
topTokens: cached.top_tokens ?? [],
isScamContract: cached.is_scam_contract,
honeypotCount: cached.honeypot_count,
agentType: cached.agent_type,
actionRec: cached.action_rec,
confidence: cached.confidence,
explainability: cached.explainability ?? [],
insight: cached.insight ?? '',
shortInsight: cached.short_insight ?? '',
deltaScore: cached.delta_score ?? 0,
prevAgentType: cached.prev_agent_type,
recentTxs: [],
}
}
