import { Connection, VersionedTransaction, PublicKey } from "@solana/web3.js";

const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export interface SwapQuote {
inputMint: string;
outputMint: string;
inAmount: string;
outAmount: string;
priceImpactPct: string;
routePlan: any[];
}

// Get quote dari Jupiter
export async function getSwapQuote(
outputMint: string,
amountSol: number,
slippageBps: number = 300 // 3% default slippage
): Promise<SwapQuote | null> {
try {
const amountLamports = Math.floor(amountSol * 1_000_000_000);

const res = await fetch(
`${JUPITER_QUOTE_API}/quote?inputMint=${SOL_MINT}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`
);

if (!res.ok) return null;
const quote = await res.json();
return quote;
} catch (err) {
console.error("Jupiter getSwapQuote error:", err);
return null;
}
}

// Execute swap — user approve via Phantom
export async function executeSwap(
quote: SwapQuote,
walletPublicKey: PublicKey,
signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
connection: Connection
): Promise<{ success: boolean; txid?: string; error?: string }> {
try {
// Get swap transaction dari Jupiter
const swapRes = await fetch(`${JUPITER_QUOTE_API}/swap`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
quoteResponse: quote,
userPublicKey: walletPublicKey.toString(),
wrapAndUnwrapSol: true,
dynamicComputeUnitLimit: true,
prioritizationFeeLamports: "auto",
}),
});

if (!swapRes.ok) {
return { success: false, error: "Gagal mendapatkan swap transaction" };
}

const { swapTransaction } = await swapRes.json();

// Deserialize transaction
const transactionBuf = Buffer.from(swapTransaction, "base64");
const transaction = VersionedTransaction.deserialize(transactionBuf);

// User sign via Phantom
const signedTx = await signTransaction(transaction);

// Send transaction
const txid = await connection.sendRawTransaction(signedTx.serialize(), {
skipPreflight: false,
maxRetries: 3,
});

// Confirm
await connection.confirmTransaction(txid, "confirmed");

return { success: true, txid };
} catch (err: any) {
console.error("Jupiter executeSwap error:", err);
return {
success: false,
error: err?.message || "Swap gagal",
};
}
}

// Format lamports ke SOL
export function lamportsToSol(lamports: number): number {
return lamports / 1_000_000_000;
}

// Format SOL ke lamports
export function solToLamports(sol: number): number {
return Math.floor(sol * 1_000_000_000);
}
