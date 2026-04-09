import { TokenData } from "./scoring";

const AVE_PROXY = "/api/ave";

async function aveFetch(path: string): Promise<any> {
const res = await fetch(`${AVE_PROXY}?path=${encodeURIComponent(path)}`);
return res.json();
}

// ============================================================
// Fetch token list by topic
// ============================================================
export async function fetchRankTokens(
topic: string = "new",
limit: number = 50
): Promise<TokenData[]> {
try {
const json = await aveFetch(`/ranks?topic=${topic}&limit=${limit}`);
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
// ============================================================
export async function fetchContractData(
tokenAddress: string,
chain: string
): Promise<Partial<TokenData>> {
try {
const json = await aveFetch(`/contracts/${tokenAddress}-${chain}`);
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
// Fetch token + contract data sekaligus
// ============================================================
export async function fetchEnrichedToken(
tokenAddress: string,
chain: string
): Promise<TokenData | null> {
try {const [tokenJson, contractData] = await Promise.all([
aveFetch(`/tokens/${tokenAddress}-${chain}`),
fetchContractData(tokenAddress, chain),
]);

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
phishing_wallet_rate: parseFloat(t.phishing_wallet_rate) || 0,
bundle_wallet_rate: parseFloat(t.bundle_wallet_rate) || 0,
insider_wallet_rate: parseFloat(t.insider_wallet_rate) || 0,
cluster_wallet_rate: parseFloat(t.cluster_wallet_rate) || 0,
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
const json = await aveFetch(`/klines/pair/${pairId}-${chain}?interval=${interval}&limit=${limit}`);
if (json.status !== 1) return [];
return json.data.points || [];
} catch (err) {
console.error("AVE fetchKlines error:", err);
return [];
}
}

// ============================================================
// Fetch token detail
// ============================================================
export async function fetchTokenDetail(
tokenAddress: string,
chain: string
): Promise<any | null> {
try {
const json = await aveFetch(`/tokens/${tokenAddress}-${chain}`);
if (json.status !== 1) return null;
return json.data;
} catch (err) {
console.error("AVE fetchTokenDetail error:", err);
return null;
}
}

// ============================================================
// Smart wallets
// ============================================================
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
const json = await aveFetch(`/address/smart_wallet/list?chain=${chain}&orderby=${orderby}&limit=${limit}`);
if (json.status !== 1) return [];
return json.data || [];
} catch (err) {
console.error("AVE fetchSmartWallets error:", err);
return [];
}
}

// ============================================================
// Wallet tokens
// ============================================================
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
try {const json = await aveFetch(`/address/walletinfo/tokens?wallet_address=${walletAddress}&chain=${chain}&orderby=${orderby}`);
if (json.status !== 1) return [];
return json.data || [];
} catch (err) {
console.error("AVE fetchWalletTokens error:", err);
return [];
}
}
