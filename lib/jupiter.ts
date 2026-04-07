import { Connection, VersionedTransaction, PublicKey } from "@solana/web3.js";

const JUPITER_QUOTE_API = "https://public.jupiterapi.com";
const JUPITER_SWAP_API = "/api/jupiter/swap";
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
slippageBps: number = 300
): Promise<SwapQuote | null> {
console.log("getSwapQuote called:", outputMint, amountSol);
try {
const amountLamports = Math.floor(amountSol * 1_000_000_000);
const cleanOutputMint = outputMint.includes("-")
? outputMint.split("-")[0]
: outputMint;

const res = await fetch(
`${JUPITER_QUOTE_API}/quote?inputMint=${SOL_MINT}&outputMint=${cleanOutputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`
);

console.log("Jupiter quote status:", res.status);
const data = await res.json();
console.log("Jupiter quote response:", data);

if (!res.ok) return null;
return data;
} catch (err) {
console.error("Jupiter getSwapQuote CATCH error:", err);
return null;
}
}

export async function executeSwap(
quote: SwapQuote,
walletPublicKey: PublicKey,
signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
connection: Connection
): Promise<{ success: boolean; txid?: string; error?: string }> {
try {
const swapRes = await fetch(JUPITER_SWAP_API, {
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
const err = await swapRes.json();
return { success: false, error: JSON.stringify(err) };
}

const { swapTransaction } = await swapRes.json();

const transactionBuf = Buffer.from(swapTransaction, "base64");
const transaction = VersionedTransaction.deserialize(transactionBuf);

const signedTx = await signTransaction(transaction);

const heliusConnection = new Connection(
process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com",
"confirmed"
);

const txid = await heliusConnection.sendRawTransaction(signedTx.serialize(), {
skipPreflight: false,
maxRetries: 3,
});

await heliusConnection.confirmTransaction(txid, "confirmed");

return { success: true, txid };
} catch (err: any) {
console.error("Jupiter executeSwap error:", err);
return { success: false, error: err?.message || "Swap failed" };
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
