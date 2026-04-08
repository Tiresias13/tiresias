import { TokenData } from "./scoring";

const AVE_BASE_URL = "https://prod.ave-api.com/v2";
const AVE_API_KEY = process.env.NEXT_PUBLIC_AVE_API_KEY || "";

const headers = {
"X-API-KEY": AVE_API_KEY,
"Content-Type": "application/json",
};

// ============================================================
// Fetch token list by topic
// ============================================================
export async function fetchRankTokens(
topic: string = "new",
limit: number = 50
): Promise<TokenData[]> {
try {
const res = await fetch(
`${AVE_BASE_URL}/ranks?topic=${topic}&limit=${limit}`,
{ headers }
);
const json = await res.json();
if (json.status !== 1) return [];

return json.data.map((t: any) => ({
token: t.token,
name: t.name,
symbol: t.symbol,
chain: t.chain,
market_cap: parseFloat(t.market_cap) || 0,
tvl: parseFloat(t.tvl) || 0,
holders: t.holders || 0,
locked_percent: parseFloat(t.locked_percent) || 0,
launch_at: t.launch_at || t.created_at || 0,
current_price_usd: parseFloat(t.current_price_usd) || 0,
launch_price: parseFloat(t.launch_price) || 0,
token_price_change_5m: parseFloat(t.token_price_change_5m) || 0,
token_price_change_1h: parseFloat(t.token_price_change_1h) || 0,
token_price_change_4h: parseFloat(t.token_price_change_4h) || 0,
token_tx_volume_usd_5m: parseFloat(t.token_tx_volume_usd_5m) || 0,
token_tx_volume_usd_1h: parseFloat(t.token_tx_volume_usd_1h) || 0,
token_tx_volume_usd_24h: parseFloat(t.token_tx_volume_usd_24h) || 0,
token_buy_tx_volume_usd_5m: parseFloat(t.token_buy_tx_volume_usd_5m) || 0,
token_sell_tx_volume_usd_5m: parseFloat(t.token_sell_tx_volume_usd_5m) || 0,
tx_count_24h: t.tx_count_24h || 0,
risk_score: t.risk_score || "0",
main_pair: t.main_pair || "",
logo_url: t.logo_url || "",
topic: topic,
// Wallet intelligence (sudah ada di /v2/ranks response)
phishing_wallet_rate: parseFloat(t.phishing_wallet_rate) || 0,
bundle_wallet_rate: parseFloat(t.bundle_wallet_rate) || 0,
insider_wallet_rate: parseFloat(t.insider_wallet_rate) || 0,
cluster_wallet_rate: parseFloat(t.cluster_wallet_rate) || 0,
}));
} catch (err) {
console.error("AVE fetchRankTokens error:", err);
return [];
}
}

// ============================================================
// Fetch contract data — top holders + risk flags
// Merge ke TokenData yang sudah ada
// ============================================================
export async function fetchContractData(
tokenAddress: string,
chain: string
): Promise<Partial<TokenData>> {
try {
const res = await fetch(
`${AVE_BASE_URL}/contracts/${tokenAddress}-${chain}`,
{ headers }
);
const json = await res.json();
if (json.status !== 1) return {};

const d = json.data;
return {
has_mint_method: d.has_mint_method === 1 || d.has_mint_method === "1" ? 1 : 0,
has_black_method: d.has_black_method === 1 || d.has_black_method === "1" ? 1 : 0,
has_owner_removed_risk: d.has_owner_removed_risk === 1 || d.has_owner_removed_risk === "1" ? 1 : 0,
};
} catch (err) {
console.error("AVE fetchContractData error:", err);
return {};
}
}

// ============================================================
// Fetch token + contract data sekaligus, siap untuk judgeToken()
// ============================================================
export async function fetchEnrichedToken(
tokenAddress: string,
chain: string
): Promise<TokenData | null> {
try {
const [tokenRes, contractData] = await Promise.all([
fetch(`${AVE_BASE_URL}/tokens/${tokenAddress}-${chain}`, { headers }),
fetchContractData(tokenAddress, chain),
]);

const tokenJson = await tokenRes.json();
if (tokenJson.status !== 1) return null;

const t = tokenJson.data?.token || tokenJson.data;
if (!t) return null;

return {
token: t.token,
name: t.name,
symbol: t.symbol,
chain: t.chain,
market_cap: parseFloat(t.market_cap) || 0,
tvl: parseFloat(t.tvl) || 0,
holders: t.holders || 0,
locked_percent: parseFloat(t.locked_percent) || 0,
launch_at: t.launch_at || t.created_at || 0,
current_price_usd: parseFloat(t.current_price_usd) || 0,launch_price: parseFloat(t.launch_price) || 0,
token_price_change_5m: parseFloat(t.token_price_change_5m) || 0,
token_price_change_1h: parseFloat(t.token_price_change_1h) || 0,
token_price_change_4h: parseFloat(t.token_price_change_4h) || 0,
token_tx_volume_usd_5m: parseFloat(t.token_tx_volume_usd_5m) || 0,
token_tx_volume_usd_1h: parseFloat(t.token_tx_volume_usd_1h) || 0,
token_tx_volume_usd_24h: parseFloat(t.token_tx_volume_usd_24h) || 0,
token_buy_tx_volume_usd_5m: parseFloat(t.token_buy_tx_volume_usd_5m) || 0,
token_sell_tx_volume_usd_5m: parseFloat(t.token_sell_tx_volume_usd_5m) || 0,
tx_count_24h: t.tx_count_24h || 0,
risk_score: t.risk_score || "0",
main_pair: t.main_pair || "",
logo_url: t.logo_url || "",
phishing_wallet_rate: parseFloat(t.phishing_wallet_rate) || 0,
bundle_wallet_rate: parseFloat(t.bundle_wallet_rate) || 0,
insider_wallet_rate: parseFloat(t.insider_wallet_rate) || 0,
cluster_wallet_rate: parseFloat(t.cluster_wallet_rate) || 0,
// Merge contract data
...contractData,
};
} catch (err) {
console.error("AVE fetchEnrichedToken error:", err);
return null;
}
}

// ============================================================
// Fetch klines (candlestick data)
// ============================================================
export async function fetchKlines(
pairId: string,
chain: string,
interval: number = 5,
limit: number = 12
): Promise<{ time: number; close: string; volume: string }[]> {
try {
const res = await fetch(
`${AVE_BASE_URL}/klines/pair/${pairId}-${chain}?interval=${interval}&limit=${limit}`,
{ headers }
);
const json = await res.json();
if (json.status !== 1) return [];
return json.data.points || [];
} catch (err) {
console.error("AVE fetchKlines error:", err);
return [];
}
}

// ============================================================
// Fetch token detail (pairs info untuk detail panel)
// ============================================================
export async function fetchTokenDetail(
tokenAddress: string,
chain: string
): Promise<any | null> {
try {
const res = await fetch(
`${AVE_BASE_URL}/tokens/${tokenAddress}-${chain}`,
{ headers }
);
const json = await res.json();
if (json.status !== 1) return null;
return json.data;
} catch (err) {
console.error("AVE fetchTokenDetail error:", err);
return null;
}
}

export interface SmartWallet {
wallet_address: string;
tag?: string;
total_profit: number;
win_rate?: number;
trade_count?: number;
}

export async function fetchSmartWallets(
chain: string,
orderby: "total_profit" | "win_rate" | "trade_count" = "total_profit",
limit: number = 20
): Promise<SmartWallet[]> {
try {
const res = await fetch(
`${AVE_BASE_URL}/address/smart_wallet/list?chain=${chain}&orderby=${orderby}&limit=${limit}`,
{ headers }
);
const json = await res.json();
if (json.status !== 1) return [];
return json.data || [];
} catch (err) {
console.error("AVE fetchSmartWallets error:", err);
return [];
}
}
export interface WalletToken {
token: string;
symbol: string;
chain: string;
logo_url?: string;
balance_amount?: string;
balance_usd?: string;
total_profit?: string;
total_profit_ratio?: string;
realized_profit?: string;
unrealized_profit?: string;
current_price_usd?: string;
}

export async function fetchWalletTokens(
walletAddress: string,
chain: string,
orderby: "profit" | "balance" | "roi" = "profit"
): Promise<WalletToken[]> {
try {
const res = await fetch(
`${AVE_BASE_URL}/address/walletinfo/tokens?wallet_address=${walletAddress}&chain=${chain}&orderby=${orderby}`,
{ headers }
);
const json = await res.json();
if (json.status !== 1) return [];
return json.data || [];
} catch (err) {
console.error("AVE fetchWalletTokens error:", err);
return [];
}
}