import { TokenData } from "./scoring";

const AVE_BASE_URL = "https://prod.ave-api.com/v2";
const AVE_API_KEY = process.env.NEXT_PUBLIC_AVE_API_KEY || "";

const headers = {
"X-API-KEY": AVE_API_KEY,
"Content-Type": "application/json",
};

// Fetch token list by topic (hot, new, meme, gainer, dll)
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
tx_count_24h: t.tx_count_24h || 0,
risk_score: t.risk_score || "0",
main_pair: t.main_pair || "",
logo_url: t.logo_url || "",
}));
} catch (err) {
console.error("AVE fetchRankTokens error:", err);
return [];
}
}

// Fetch kline data untuk sparkline chart
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

// Fetch token detail (dapat pairs info)
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
