import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
try {
const body = await req.json();
const res = await fetch("https://public.jupiterapi.com/swap", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
});
const data = await res.json();
if (!res.ok) return NextResponse.json(data, { status: res.status });
return NextResponse.json(data);
} catch (err) {
console.error("Swap route error:", err);
return NextResponse.json({ error: "Jupiter swap failed" }, { status: 500 });
}
}