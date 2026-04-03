export interface TokenData {
token: string;
name: string;
symbol: string;
chain: string;
market_cap: number;
tvl: number;
holders: number;
locked_percent: number;
launch_at: number;
current_price_usd: number;
launch_price: number;
token_price_change_5m: number;
token_price_change_1h: number;
token_price_change_4h: number;
token_tx_volume_usd_5m: number;
token_tx_volume_usd_1h: number;
token_tx_volume_usd_24h: number;
tx_count_24h: number;
risk_score: string;
main_pair: string;
logo_url: string;
}

export interface ScoreBreakdown {
feeMcRatio: boolean;
volumeTrend: boolean;
holderCount: boolean;
lockStatus: boolean;
tokenAge: boolean;
}

export interface ScoredToken extends TokenData {
organicScore: number;
scoreBreakdown: ScoreBreakdown;
signalReason: string;
}

export function calculateOrganicScore(token: TokenData): ScoredToken {
const now = Math.floor(Date.now() / 1000);
const ageMinutes = (now - token.launch_at) / 60;

// 1. Fee/MC Ratio (40%) — volume relatif terhadap market cap
// Kalau volume 1h > 10% dari MC = sehat
const volumeMcRatio = token.market_cap > 0
? token.token_tx_volume_usd_1h / token.market_cap
: 0;
const feeMcScore = Math.min(volumeMcRatio * 400, 40); // max 40 poin
const feeMcGood = volumeMcRatio >= 0.1;

// 2. Volume Trend (20%) — apakah volume accelerating?
// Bandingkan volume 5m vs rata-rata per 5m dari 1h
const avgVolume5mFromHour = token.token_tx_volume_usd_1h / 12;
const volumeAcceleration = avgVolume5mFromHour > 0
? token.token_tx_volume_usd_5m / avgVolume5mFromHour
: 0;
const volumeTrendScore = Math.min(volumeAcceleration * 10, 20); // max 20 poin
const volumeTrendGood = volumeAcceleration >= 1.2;

// 3. Holder Count (15%) — holder relatif terhadap umur token
// Token 30 menit harusnya udah punya > 50 holder
const expectedHolders = Math.max(ageMinutes * 2, 20);
const holderRatio = token.holders / expectedHolders;
const holderScore = Math.min(holderRatio * 15, 15); // max 15 poin
const holderGood = token.holders >= 50;

// 4. Lock Status (15%) — liquidity locked?
const lockScore = token.locked_percent >= 0.8
? 15
: token.locked_percent >= 0.5
? 10
: token.locked_percent >= 0.1
? 5
: 0;
const lockGood = token.locked_percent >= 0.5;

// 5. Token Age + Risk Score (10%)
// Sweet spot: 10-60 menit. Terlalu baru = risky, terlalu lama = missed
const riskScore = parseInt(token.risk_score) || 0;
const ageScore = ageMinutes >= 10 && ageMinutes <= 60 ? 5 : 2;
const riskBonus = riskScore >= 70 ? 5 : riskScore >= 50 ? 3 : 0;
const ageRiskScore = ageScore + riskBonus;
const ageGood = ageMinutes >= 10 && ageMinutes <= 90;

const totalScore = Math.round(
feeMcScore + volumeTrendScore + holderScore + lockScore + ageRiskScore
);

// Generate signal reason
const reasons: string[] = [];
if (feeMcGood) reasons.push(`Vol/MC ratio ${(volumeMcRatio * 100).toFixed(0)}%`);
if (volumeTrendGood) reasons.push(`Volume spike +${((volumeAcceleration - 1) * 100).toFixed(0)}%`);
if (lockGood) reasons.push(`Liquidity locked ${(token.locked_percent * 100).toFixed(0)}%`);
if (holderGood) reasons.push(`${token.holders} holders`);
reasons.push(`${Math.round(ageMinutes)} menit old`);

if (!feeMcGood) reasons.push("⚠️ Volume rendah");
if (!lockGood) reasons.push("⚠️ Liquidity tidak terkunci");
if (!holderGood) reasons.push("⚠️ Holder sedikit");

return {
...token,
organicScore: Math.min(totalScore, 100),
scoreBreakdown: {
feeMcRatio: feeMcGood,
volumeTrend: volumeTrendGood,
holderCount: holderGood,
lockStatus: lockGood,
tokenAge: ageGood,
},
signalReason: reasons.join(" · "),
};
}

export function getScoreLabel(score: number): {
label: string;
color: string;
} {
if (score >= 70) return { label: "STRONG", color: "text-green-400" };
if (score >=45) return { label: "WATCH", color: "text-yellow-400" };
return { label: "AVOID", color: "text-red-400" };
}
