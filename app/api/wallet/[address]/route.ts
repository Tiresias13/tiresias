import { NextRequest, NextResponse } from 'next/server'
import { scoreWallet } from '@/lib/scoring-engine'

export async function GET(
req: NextRequest,
{ params }: { params: { address: string } }
) {
const { address } = params
const chain = req.nextUrl.searchParams.get('chain') ?? 'SOL'
const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true'

if (!address || address.length < 10) {
return NextResponse.json(
{ error: 'Invalid wallet address' },
{ status: 400 }
)
}

try {
const result = await scoreWallet(address, chain, forceRefresh)
return NextResponse.json(result, {
headers: {
'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
},
})
} catch (error) {
console.error('Scoring error:', error)
return NextResponse.json(
{ error: 'Failed to score wallet. Try again.' },
{ status: 500 }
)
}
}
