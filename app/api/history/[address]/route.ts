import { NextRequest, NextResponse } from 'next/server'
import { getScoreHistory } from '@/lib/supabase'

export async function GET(
req: NextRequest,
{ params }: { params: { address: string } }
) {
const { address } = params
if (!address || address.length < 10) {
return NextResponse.json([], { status: 400 })
}
const history = await getScoreHistory(address, 7)
return NextResponse.json(history)
}