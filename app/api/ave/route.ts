import { NextRequest, NextResponse } from "next/server";

const AVE_BASE_URL = "https://prod.ave-api.com/v2";
const AVE_API_KEY = process.env.AVE_API_KEY || "";

const aveHeaders = {
"X-API-KEY": AVE_API_KEY,
"Content-Type": "application/json",
};

export async function GET(req: NextRequest) {
const { searchParams } = new URL(req.url);
const path = searchParams.get("path");

if (!path) {
return NextResponse.json({ error: "missing path" }, { status: 400 });
}

try {
const res = await fetch(`${AVE_BASE_URL}${path}`, { headers: aveHeaders });
const json = await res.json();
return NextResponse.json(json);
} catch (err) {
console.error("AVE proxy error:", err);
return NextResponse.json({ error: "AVE fetch failed" }, { status: 500 });
}
}
