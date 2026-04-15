const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL ?? ''
const HELIUS_API_KEY = HELIUS_RPC_URL.match(/api-key=([^&]+)/)?.[1] ?? ''
const HELIUS_REST_URL = 'https://api.helius.xyz'

// Types
export interface HeliusTx {
signature: string
timestamp: number
slot: number
type: string
source: string
fee: number
feePayer: string
instructions: HeliusInstruction[]
events: {
swap?: HeliusSwapEvent
}
}

export interface HeliusInstruction {
programId: string
accounts: string[]
data: string
}

export interface HeliusSwapEvent {
nativeInput?: { account: string; amount: string }
nativeOutput?: { account: string; amount: string }
tokenInputs: { mint: string; tokenAmount: number; userAccount: string }[]
tokenOutputs: { mint: string; tokenAmount: number; userAccount: string }[]
}

export interface HeliusTokenBalance {
mint: string
owner: string
amount: number
decimals: number
}

// Get parsed transaction history for a wallet
export async function getWalletTransactions(
address: string,
limit: number = 100,
before?: string
): Promise<HeliusTx[]> {
const params: Record<string, string | number> = {
limit,
'api-key': HELIUS_API_KEY,
}
if (before) params.before = before

const url = new URL(`${HELIUS_REST_URL}/v0/addresses/${address}/transactions`)
Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

const res = await fetch(url.toString(), {
cache: 'no-store',
})
if (!res.ok) throw new Error(`Helius error: ${res.status}`)
return res.json()
}

// Get token balances for a wallet via RPC
export async function getTokenBalances(address: string): Promise<HeliusTokenBalance[]> {
const res = await fetch(HELIUS_RPC_URL, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
jsonrpc: '2.0',
id: 1,
method: 'getTokenAccountsByOwner',
params: [
address,
{ programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
{ encoding: 'jsonParsed' },
],
}),
next: { revalidate: 300 },
})
const json = await res.json()
const accounts = json.result?.value ?? []
return accounts.map((a: any) => ({
mint: a.account.data.parsed.info.mint,
owner: a.account.data.parsed.info.owner,
amount: a.account.data.parsed.info.tokenAmount.uiAmount,
decimals: a.account.data.parsed.info.tokenAmount.decimals,
}))
}

// Analyze timing signals from transactions
export interface TimingAnalysis {
avgIntervalMs: number
stdDevIntervalMs: number
minIntervalMs: number
maxIntervalMs: number
activityByHour: number[] // 24 slots
hasSleepPattern: boolean
avgReactionSpeedMs?: number
}

export function analyzeTimingPatterns(txs: HeliusTx[]): TimingAnalysis {
if (txs.length < 2) {
return {
avgIntervalMs: 0,
stdDevIntervalMs: 0,
minIntervalMs: 0,
maxIntervalMs: 0,
activityByHour: new Array(24).fill(0),
hasSleepPattern: true,
}
}

// Sort by timestamp ascending
const sorted = [...txs].sort((a, b) => a.timestamp - b.timestamp)

// Calculate intervals between consecutive txs (in ms)
const intervals: number[] = []
for (let i = 1; i < sorted.length; i++) {
intervals.push((sorted[i].timestamp - sorted[i - 1].timestamp) * 1000)
}

const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length
const stdDev = Math.sqrt(variance)

// Activity by hour of day
const activityByHour = new Array(24).fill(0)
sorted.forEach((tx) => {
const hour = new Date(tx.timestamp * 1000).getUTCHours()
activityByHour[hour]++
})

// Check if there's a sleep pattern (6+ consecutive low-activity hours)
let maxQuietStreak = 0
let currentStreak = 0
const maxActivity = Math.max(...activityByHour)
const quietThreshold = maxActivity * 0.1

for (let i = 0; i < 48; i++) {
const hour = i % 24
if (activityByHour[hour] <= quietThreshold) {
currentStreak++
maxQuietStreak = Math.max(maxQuietStreak, currentStreak)
} else {
currentStreak = 0
}
}

return {
avgIntervalMs: avgInterval,
stdDevIntervalMs: stdDev,
minIntervalMs: Math.min(...intervals),
maxIntervalMs: Math.max(...intervals),
activityByHour,
hasSleepPattern: maxQuietStreak >= 6,
}
}// Analyze gas behavior
export interface GasAnalysis {
avgGasPrice: number
stdDevGasPrice: number
isOptimized: boolean
}

export function analyzeGasBehavior(txs: HeliusTx[]): GasAnalysis {
const fees = txs.map((tx) => tx.fee).filter((f) => f > 0)
if (fees.length === 0) return { avgGasPrice: 0, stdDevGasPrice: 0, isOptimized: false }

const avg = fees.reduce((a, b) => a + b, 0) / fees.length
const variance = fees.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / fees.length
const stdDev = Math.sqrt(variance)
const coefficientOfVariation = stdDev / avg

return {
avgGasPrice: avg,
stdDevGasPrice: stdDev,
isOptimized: coefficientOfVariation < 0.3,
}
}
