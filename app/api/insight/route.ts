import { NextRequest, NextResponse } from "next/server";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

export async function POST(req: NextRequest) {
try {
const { tokenData, scores } = await req.json();

const ageMin = Math.round((Date.now() / 1000 - tokenData.launch_at) / 60);

const systemPrompt = `You are Tiresias — an onchain trading intelligence agent for Solana meme tokens.
Your job is to analyze token data and make a trading decision.

RULES:
- Be ruthlessly data-driven. No speculation.
- If data is weak or missing, say so and lean toward SKIP.
- Your verdict must be one of: BUY / WATCH / SKIP
- BUY = strong signal, worth entering a small position
- WATCH = interesting but not enough conviction yet
- SKIP = not worth the risk right now

OUTPUT FORMAT (strictly follow this JSON):
{
"verdict": "BUY" | "WATCH" | "SKIP",
"confidence": 1-10,
"reason": "2-3 sentences explaining the key signals that drove your decision",
"risk": "one sentence about the main risk"
}`;

const userPrompt = `Analyze this Solana token:

Symbol: ${tokenData.symbol} | Name: ${tokenData.name}
Age: ${ageMin} minutes | Holders: ${tokenData.holders}
Market Cap: $${Number(tokenData.market_cap).toLocaleString()} | TVL: $${Number(tokenData.tvl).toLocaleString()}

--- WALLET INTELLIGENCE ---
Cluster Rate: ${(tokenData.cluster_wallet_rate ?? 0).toFixed(2)}% (coordinated wallets)
Insider Rate: ${(tokenData.insider_wallet_rate ?? 0).toFixed(2)}% (dev/insider wallets)
Phishing Rate: ${(tokenData.phishing_wallet_rate ?? 0).toFixed(2)}% (known scam wallets)
Bundle Rate: ${(tokenData.bundle_wallet_rate ?? 0).toFixed(2)}% (bot bundles)

--- LIQUIDITY & SAFETY ---
Locked: ${((tokenData.locked_percent ?? 0) * 100).toFixed(1)}%
Mint Method: ${tokenData.has_mint_method === 1 ? "YES (danger)" : "No"}
Blacklist Method: ${tokenData.has_black_method === 1 ? "YES (danger)" : "No"}
Owner Renounced: ${tokenData.has_owner_removed_risk === 1 ? "Yes" : "NO (danger)"}
LP Burned: ${tokenData.has_not_burned_lp === 1 ? "NO (danger)" : "Yes"}

--- MOMENTUM ---
Buy Volume 5m: $${(tokenData.token_buy_tx_volume_usd_5m ?? 0).toFixed(0)}
Sell Volume 5m: $${(tokenData.token_sell_tx_volume_usd_5m ?? 0).toFixed(0)}
Volume 1h: $${(tokenData.token_tx_volume_usd_1h ?? 0).toFixed(0)}
Price Change 1h: ${(tokenData.token_price_change_1h ?? 0).toFixed(2)}%

--- SCORES (computed) ---
Wallet Cleanliness: ${Math.round(scores.walletCleanliness)}/100
Liquidity Safety: ${Math.round(scores.liquiditySafety)}/100
Momentum: ${Math.round(scores.momentum)}/100
Age Factor: ${Math.round(scores.ageFactor)}/100
Overall: ${scores.finalScore}/100

Make your decision.`;

const res = await fetch(GROQ_API, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${GROQ_KEY}`,
},
body: JSON.stringify({
model: "llama-3.3-70b-versatile",
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: userPrompt },
],
max_tokens: 300,
temperature: 0.2,
}),
});

if (!res.ok) {
console.error("Groq error:", await res.text());
return NextResponse.json({ insight: null, llmVerdict: null }, { status: 500 });
}

const data = await res.json();
const raw = data.choices?.[0]?.message?.content?.trim() || "";

// Parse JSON dari response LLM
let llmVerdict = null;
try {
const jsonMatch = raw.match(/\{[\s\S]*\}/);
if (jsonMatch) {
llmVerdict = JSON.parse(jsonMatch[0]);
}
} catch {
// kalau parse gagal, return raw sebagai insight saja
}

return NextResponse.json({
insight: llmVerdict?.reason || raw,
risk: llmVerdict?.risk || null,
verdict: llmVerdict?.verdict || null,
confidence: llmVerdict?.confidence || null,
});
} catch (err) {
console.error("Insight API error:", err);
return NextResponse.json({ insight: null, llmVerdict: null }, { status: 500 });
}
}
