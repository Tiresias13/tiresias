const AVE_BASE_URL = 'https://prod.ave-api.com'

async function aveGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
const url = new URL(`${AVE_BASE_URL}${path}`)
if (params) {
Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
}
const res = await fetch(url.toString(), {
headers: { 'X-API-KEY': process.env.AVE_API_KEY! },
next: { revalidate: 300 },
})
if (!res.ok) throw new Error(`AVE API error: ${res.status} ${path}`)
const json = await res.json()
if (json.status !== 1) throw new Error(`AVE API failed: ${json.msg}`)
return json.data as T
}

// Types
export interface AveSmartWallet {
wallet_address: string
chain: string
total_trades: number
buy_trades: number
sell_trades: number
token_profit_rate: number
total_profit: number
total_profit_rate: number
total_volume: number
last_trade_time: string
tag_items: { address: string; symbol: string; volume: number }[]
}

export interface AveWalletInfo {
wallet_address: string
chain: string
total_profit: number
total_profit_rate: number
token_profit_rate: number
total_trades: number
total_volume: number
total_purchase: number
total_sold: number
}

export interface AveWalletToken {
token_address: string
symbol: string
name: string
profit: number
profit_rate: number
buy_amount: number
sell_amount: number
holding_amount: number
cost: number
last_trade_time: string
}

export interface AveTx {
tx_hash: string
block_time: number
token_address: string
token_symbol: string
type: 'buy' | 'sell'
amount: number
price_usd: number
value_usd: number
gas_price?: number
gas_used?: number
}

export interface AveContractRisk {
token_address: string
chain: string
is_honeypot: boolean
is_mintable: string
has_not_open_source: boolean
risk_score: string
risk_level: number
}

export interface AveTokenDetail {
token: string
chain: string
name: string
symbol: string
current_price_usd: string
price_change_24h: string
tx_volume_u_24h: number
market_cap: number
holders: number
risk_score: string
}

// Endpoints
export async function getSmartWallets(
chain: string = 'solana',
sort: string = 'profit',
limit: number = 20
): Promise<AveSmartWallet[]> {
return aveGet<AveSmartWallet[]>('/v2/address/smart_wallet/list', {
chain,
sort,
sort_dir: 'desc',
limit,
})
}

export async function getWalletInfo(
walletAddress: string,
chain: string = 'solana'
): Promise<AveWalletInfo> {
return aveGet<AveWalletInfo>('/v2/address/walletinfo', {
wallet_address: walletAddress,
chain,
})
}

export async function getWalletTokens(
walletAddress: string,
chain: string = 'solana',
limit: number = 50
): Promise<AveWalletToken[]> {
return aveGet<AveWalletToken[]>('/v2/address/walletinfo/tokens', {
wallet_address: walletAddress,
chain,
sort: 'profit',
sort_dir: 'desc',
limit,
})
}

export async function getWalletTxs(
walletAddress: string,
chain: string = 'solana',
tokenAddress?: string,
limit: number = 100,
startTime?: number // unix timestamp
): Promise<AveTx[]> {
const params: Record<string, string | number> = {
wallet_address: walletAddress,
chain,
page_size: limit,
}
if (tokenAddress) params.token_address = tokenAddress
if (startTime) params.start_time = startTime
return aveGet<AveTx[]>('/v2/address/tx', params)
}

export async function getContractRisk(
tokenAddress: string,
chain: string = 'solana'
): Promise<AveContractRisk> {
return aveGet<AveContractRisk>(`/v2/contracts/${tokenAddress}-${chain}`)
}

export async function getTokenDetail(
tokenAddress: string,
chain: string = 'solana'
): Promise<AveTokenDetail> {
return aveGet<AveTokenDetail>(`/v2/tokens/${tokenAddress}-${chain}`)
}

// Chain name mapping (AVE pakai lowercase full name)
export function toAveChain(chain: string): string {
const map: Record<string, string> = {
SOL: 'solana',
BSC: 'bsc',
BASE: 'base',
}
return map[chain] ?? chain.toLowerCase()
}

// Smartwallet
export interface AveSmartWallet {
wallet_address: string
chain: string
total_profit: string
total_win_ratio: string
total_purchase: string
total_sold: string
}

export async function getSmartWalletList(
chain: string = 'solana',
limit: number = 20
): Promise<AveSmartWallet[]> {
try {
const data = await aveGet<AveSmartWallet[]>('/v2/address/smart_wallet/list', {
chain,
page_size: limit,
})
return Array.isArray(data) ? data : []
} catch {
return []
}
}
