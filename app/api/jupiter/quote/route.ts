import { NextRequest, NextResponse } from "next/server";

const HELIUS_API_KEY = "3fdbf184-6e0e-4e78-b227-c100fdd87f1a";
const JUPITER_API = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const QUOTE_API = "https://public.jupiterapi.com";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export async function GET(req: NextRequest) {
const { searchParams } = new URL(req.url);
const outputMint = searchParams.get("outputMint");
const amount = searchParams.get("amount");
const slippageBps = searchParams.get("slippageBps") || "300";

if (!outputMint || !amount) {
return NextResponse.json({ error: "Missing params" }, { status: 400 });
}

try {
const res = await fetch(
`${QUOTE_API}/quote?inputMint=${SOL_MINT}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
);
const data = await res.json();
if (!res.ok) return NextResponse.json(data, { status: res.status });
return NextResponse.json(data);
} catch (err) {
return NextResponse.json({ error: "Jupiter fetch failed" }, { status: 500 });
}
}
