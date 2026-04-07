// ============================================================
// TIRESIAS — On-Chain Judgment Engine
// "We don't predict price — we detect who is behind the price."
// ============================================================

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
token_buy_tx_volume_usd_5m: number;
token_sell_tx_volume_usd_5m: number;
tx_count_24h: number;
risk_score: string;
main_pair: string;
logo_url: string;
topic?: string;
// Wallet intelligence (from /v2/tokens/)
phishing_wallet_rate?: number;
bundle_wallet_rate?: number;
insider_wallet_rate?: number;
cluster_wallet_rate?: number;
// Contract risk (from /v2/contracts/)
has_mint_method?: number;
has_black_method?: number;
has_owner_removed_risk?: number;
}

export interface SubScores {
walletCleanliness: number;
liquiditySafety: number;
momentum: number;
ageFactor: number;
}

export interface ContrarianFlags {
forceSkip: boolean;
forceSkipReason: string | null;
warning: string | null;
}

export interface ScoredToken extends TokenData {
finalScore: number;
subScores: SubScores;
verdict: "STRONG BUY" | "EARLY ENTRY" | "RISKY" | "SKIP";
verdictColor: string;
contrarian: ContrarianFlags;
reasoning: string;
traderInsight: string;
llmInsight?: string;
llmVerdict?: "BUY" | "WATCH" | "SKIP";
llmConfidence?: number;
llmRisk?: string;
detectedAt: number;

}

// ============================================================
// 1. WALLET CLEANLINESS (35%)
// ============================================================
function calcWalletCleanliness(token: TokenData): number {
const cluster = token.cluster_wallet_rate ?? 0;
const insider = token.insider_wallet_rate ?? 0;
const phishing = token.phishing_wallet_rate ?? 0;
const bundle = token.bundle_wallet_rate ?? 0;

const score =
100 - cluster * 2 - insider * 3 - phishing * 4 - bundle * 2;

return Math.max(0, Math.min(100, score));
}

// ============================================================
// 2. LIQUIDITY SAFETY (25%)
// ============================================================
function calcLiquiditySafety(token: TokenData): number {
const lockScore = token.locked_percent * 80; // max 80 poin
const mintPenalty = token.has_mint_method === 1 ? -20 : 20;
const blackPenalty = token.has_black_method === 1 ? -20 : 20;

const score = lockScore + mintPenalty + blackPenalty;
return Math.max(0, Math.min(100, score));
}

// ============================================================
// 3. MOMENTUM (25%)
// ============================================================
function calcMomentum(token: TokenData): number {
const buyVol = token.token_buy_tx_volume_usd_5m ?? 0;
const sellVol = token.token_sell_tx_volume_usd_5m ?? 0;
const totalVol = buyVol + sellVol;

// Buy ratio: 0-1
const buyRatio = totalVol > 0 ? buyVol / totalVol : 0.5;

// Volume acceleration: 5m vs avg 5m dari 1h
const avgVol5mFromHour = token.token_tx_volume_usd_1h / 12;
const acceleration =
avgVol5mFromHour > 0
? token.token_tx_volume_usd_5m / avgVol5mFromHour
: 0;

const score = buyRatio * 60 + Math.min(acceleration * 20, 40);
return Math.max(0, Math.min(100, score));
}

// ============================================================
// 4. AGE FACTOR (15%)
// ============================================================
function calcAgeFactor(token: TokenData): number {
const now = Math.floor(Date.now() / 1000);
const ageMinutes = (now - token.launch_at) / 60;

if (ageMinutes < 2) return 40; // too early
if (ageMinutes <= 10) return 90; // sweet spot
if (ageMinutes <= 30) return 75;
if (ageMinutes <= 60) return 60;
return 40; // too late
}

// ============================================================
// CONTRARIAN FLAGS// ============================================================
function calcContrarianFlags(
token: TokenData,
subScores: SubScores
): ContrarianFlags {
const insider = token.insider_wallet_rate ?? 0;
const phishing = token.phishing_wallet_rate ?? 0;
const lock = token.locked_percent;

// Force skip conditions
if (insider > 10) {
return {
forceSkip: true,
forceSkipReason: `Insider wallets ${insider.toFixed(1)}% — dev/insider dominance detected`,
warning: null,
};
}
if (phishing > 5) {
return {
forceSkip: true,
forceSkipReason: `Phishing wallets ${phishing.toFixed(1)}% — high scam activity`,
warning: null,
};
}

// Warning conditions
let warning: string | null = null;

if (lock < 0.5) {
warning = "Liquidity not fully locked — rug risk elevated";
}

// "Too perfect" contrarian signal
if (subScores.walletCleanliness > 95 && subScores.momentum < 30) {
warning = "Wallet structure clean but no real demand yet — wait for momentum";
}

return { forceSkip: false, forceSkipReason: null, warning };
}

// ============================================================
// REASONING GENERATOR
// ============================================================
function generateReasoning(token: TokenData, subScores: SubScores): {
reasoning: string;
traderInsight: string;
} {
const lines: string[] = [];

// Wallet
const walletStatus =
subScores.walletCleanliness >= 80
? "clean with no clustering or insider dominance"
: subScores.walletCleanliness >= 50
? "somewhat clean but has minor wallet concerns"
: "suspicious — coordinated or insider wallets detected";
lines.push(`Wallet structure is ${walletStatus}.`);

// Liquidity
const liqStatus =
subScores.liquiditySafety >= 75
? "safe and locked"
: subScores.liquiditySafety >= 50
? "partially safe"
: "risky — low lock or mint risk present";
lines.push(`Liquidity is ${liqStatus}.`);

// Momentum
const momStatus =
subScores.momentum >= 70
? "strong with buy pressure dominating"
: subScores.momentum >= 45
? "building but not confirmed"
: "weak — sell pressure or low activity";
lines.push(`Momentum is ${momStatus}.`);

// Age
const now = Math.floor(Date.now() / 1000);
const ageMin = Math.round((now - token.launch_at) / 60);
lines.push(`Token is ${ageMin} minutes old.`);

// Trader insight
let insight = "";
const avg =
(subScores.walletCleanliness +
subScores.liquiditySafety +
subScores.momentum) /
3;

if (avg >= 75) {
insight = "Early organic accumulation detected — composition and momentum both healthy.";
} else if (avg >= 55) {
insight = "Mixed signals — some positive indicators but proceed with caution.";
} else if (subScores.walletCleanliness < 40) {
insight = "Coordinated wallet activity detected — high probability of manipulation.";
} else {
insight = "Weak fundamentals — not enough signal to justify entry.";
}

return {
reasoning: lines.join(" "),
traderInsight: insight,
};
}

// ============================================================
// VERDICT
// ============================================================
function getVerdict(score: number): {
verdict: ScoredToken["verdict"];
verdictColor: string;
} {
if (score >= 85)
return { verdict: "STRONG BUY", verdictColor: "text-green-400" };
if (score >= 70)
return { verdict: "EARLY ENTRY", verdictColor: "text-[#4693ff]" };
if (score >= 50)
return { verdict: "RISKY", verdictColor: "text-yellow-400" };
return { verdict: "SKIP", verdictColor: "text-red-400" };
}

// ============================================================
// MAIN FUNCTION
// ============================================================
export function judgeToken(token: TokenData): ScoredToken {
const subScores: SubScores = {
walletCleanliness: calcWalletCleanliness(token),
liquiditySafety: calcLiquiditySafety(token),
momentum: calcMomentum(token),
ageFactor: calcAgeFactor(token),
};

const finalScore = Math.round(
subScores.walletCleanliness * 0.35 +
subScores.liquiditySafety * 0.25 +
subScores.momentum * 0.25 +
subScores.ageFactor * 0.15
);const contrarian = calcContrarianFlags(token, subScores);
const { reasoning, traderInsight } = generateReasoning(token, subScores);
const { verdict, verdictColor } = getVerdict(
contrarian.forceSkip ? 0 : finalScore
);

return {
...token,
finalScore: contrarian.forceSkip ? 0 : finalScore,
subScores,
verdict,
verdictColor,
contrarian,
reasoning,
traderInsight,
detectedAt: Math.floor(Date.now() / 1000),
};
}

// ============================================================
// LEGACY COMPAT — untuk komponen yang masih pakai calculateOrganicScore
// ============================================================
export function calculateOrganicScore(token: TokenData): ScoredToken {
return judgeToken(token);
}

export type { TokenData as default };
