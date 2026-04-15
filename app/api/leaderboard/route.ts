import { NextRequest, NextResponse } from 'next/server'
import { getSmartWalletList } from '@/lib/ave'
import { getLeaderboard } from '@/lib/supabase'

export async function GET(req: NextRequest) {
const chain = req.nextUrl.searchParams.get('chain') ?? 'solana'
const chainMap: Record<string, string> = {
solana: 'SOL', bsc: 'BSC', base: 'BASE',
SOL: 'SOL', BSC: 'BSC', BASE: 'BASE',
}
const chainKey = chainMap[chain] ?? 'SOL'
const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20')

try {
// Try Supabase cache first
const cached = await getLeaderboard(chainKey, limit)
if (cached && cached.length > 0) {
return NextResponse.json(cached, {
headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
})
}

// Fallback ke AVE smart wallet list
const aveChainMap: Record<string, string> = { SOL: 'solana', BSC: 'bsc', BASE: 'base' }
const wallets = await getSmartWalletList(aveChainMap[chainKey] ?? 'solana', limit)
return NextResponse.json(wallets, {
headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
})
} catch {
return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
}
}
