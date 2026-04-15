const DEXSCREENER_BASE = 'https://api.dexscreener.com'

// Types
export interface DexPair {
chainId: string
dexId: string
pairAddress: string
baseToken: { address: string; name: string; symbol: string }
quoteToken: { address: string; name: string; symbol: string }
priceUsd: string
priceChange: { h1: number; h6: number; h24: number }
volume: { h24: number; h6: number; h1: number }
liquidity: { usd: number }
fdv: number
marketCap: number
txns: { h24: { buys: number; sells: number } }
}

export interface DexTokenData {
address: string
symbol: string
priceUsd: number
priceChange24h: number
volume24h: number
liquidity: number
fdv: number
marketCap: number
buys24h: number
sells24h: number
topPair?: DexPair
}

// Get token data by contract address
export async function getDexTokenData(
tokenAddress: string,
chain: string = 'solana'
): Promise<DexTokenData | null> {
try {
const res = await fetch(
`${DEXSCREENER_BASE}/latest/dex/tokens/${tokenAddress}`,
{ next: { revalidate: 60 } }
)
if (!res.ok) return null
const json = await res.json()
const pairs: DexPair[] = json.pairs ?? []

if (pairs.length === 0) return null

// Filter by chain and sort by liquidity
const chainPairs = pairs
.filter((p) => p.chainId === chain)
.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))

const top = chainPairs[0] ?? pairs[0]

return {
address: tokenAddress,
symbol: top.baseToken.symbol,
priceUsd: parseFloat(top.priceUsd ?? '0'),
priceChange24h: top.priceChange?.h24 ?? 0,
volume24h: top.volume?.h24 ?? 0,
liquidity: top.liquidity?.usd ?? 0,
fdv: top.fdv ?? 0,
marketCap: top.marketCap ?? 0,
buys24h: top.txns?.h24?.buys ?? 0,
sells24h: top.txns?.h24?.sells ?? 0,
topPair: top,
}
} catch {
return null
}
}

// Get trending tokens by chain
export async function getTrendingTokens(
chain: string = 'solana'
): Promise<DexPair[]> {
try {
const res = await fetch(
`${DEXSCREENER_BASE}/token-boosts/top/v1`,
{ next: { revalidate: 300 } }
)
if (!res.ok) return []
const json = await res.json()
return (json ?? [])
.filter((p: any) => p.chainId === chain)
.slice(0, 20)
} catch {
return []
}
}

// Confirm wallet PQ via DexScreener
// Cross-validate: kalau token yang dibeli wallet perform well → PQ boost
export async function confirmTokenPerformance(
tokenAddresses: string[],
chain: string = 'solana'
): Promise<Map<string, DexTokenData>> {
const result = new Map<string, DexTokenData>()
await Promise.allSettled(
tokenAddresses.slice(0, 10).map(async (addr) => {
const data = await getDexTokenData(addr, chain)
if (data) result.set(addr, data)
})
)
return result
}

// Chain name mapping (DexScreener pakai lowercase)
export function toDexChain(chain: string): string {
const map: Record<string, string> = {
SOL: 'solana',
BSC: 'bsc',
BASE: 'base',
}
return map[chain] ?? chain.toLowerCase()
}
