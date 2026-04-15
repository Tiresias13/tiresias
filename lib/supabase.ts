import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with full access (for write operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Types
export interface WalletScore {
id?: number
address: string
chain: string
score: number
agent_type: string
action_rec: string
confidence: string
ai_probability: number
pq: number
te: number
bc: number
si: number
ni: number
rs: number
pq_zscore: number
te_zscore: number
bc_zscore: number
si_zscore: number
ni_zscore: number
rs_zscore: number
win_rate: number
total_trades: number
total_profit: number
top_tokens: string[]
explainability: { label: string; value: number; isWarning?: boolean }[]
insight: string
short_insight: string
is_scam_contract: boolean
honeypot_count: number
scored_at: string
delta_score?: number
prev_agent_type?: string
}

export interface WalletScoreHistory {
address: string
score: number
agent_type: string
ai_probability: number
scored_at: string
}

// Get cached wallet score (TTL: 30 menit)
export async function getCachedScore(address: string): Promise<WalletScore | null> {
const thirtyMinutesAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 jam

const { data, error } = await supabase
.from('wallet_scores')
.select('*')
.ilike('address', address)
.gte('scored_at', thirtyMinutesAgo)
.order('scored_at', { ascending: false })
.limit(1)
.single()

if (error || !data) return null
return data as WalletScore
}

// Save wallet score
export async function saveWalletScore(score: WalletScore): Promise<void> {
const { error } = await supabaseAdmin
.from('wallet_scores')
.upsert(
{ ...score, address: score.address, scored_at: new Date().toISOString() },
{ onConflict: 'address' }
)
if (error) console.error('Supabase save error:', error)
}

// Get score history for delta tracking
export async function getScoreHistory(
address: string,
limit: number = 7
): Promise<WalletScoreHistory[]> {
const { data, error } = await supabase
.from('wallet_scores_history')
.select('address, score, agent_type, ai_probability, scored_at')
.eq('address', address.toLowerCase())
.order('scored_at', { ascending: false })
.limit(limit)

if (error || !data) return []
return data as WalletScoreHistory[]
}

// Get leaderboard (cached, revalidate 5 menit)
export async function getLeaderboard(
chain?: string,
limit: number = 20
): Promise<WalletScore[]> {
let query = supabase
.from('wallet_scores')
.select('*')
.gt('total_trades', 0)
.order('score', { ascending: false })
.limit(limit)

if (chain) query = query.eq('chain', chain)

const { data, error } = await query
if (error || !data) return []
return data as WalletScore[]
}

// Save to history table (called by cron)
export async function archiveScoreToHistory(score: WalletScore): Promise<void> {
const { error } = await supabaseAdmin
.from('wallet_scores_history')
.insert({
address: score.address.toLowerCase(),
score: score.score,
agent_type: score.agent_type,
ai_probability: score.ai_probability,
scored_at: new Date().toISOString(),
})
if (error) console.error('Supabase archive error:', error)
}

export async function getDynamicBaseline(): Promise<{
pq: { mean: number; std: number }
te: { mean: number; std: number }
bc: { mean: number; std: number }
si: { mean: number; std: number }
ni: { mean: number; std: number }
rs: { mean: number; std: number }
} | null> {
const { data, error } = await supabase
.from('wallet_scores')
.select('pq, te, bc, si, ni, rs')
.limit(500)

if (error || !data || data.length < 10) return null

function stats(arr: number[]) {
const mean = arr.reduce((a, b) => a + b, 0) / arr.length
const std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length)
return { mean: parseFloat(mean.toFixed(2)), std: parseFloat(Math.max(std, 1).toFixed(2)) }
}

return {
pq: stats(data.map((d) => d.pq)),
te: stats(data.map((d) => d.te)),
bc: stats(data.map((d) => d.bc)),
si: stats(data.map((d) => d.si)),
ni: stats(data.map((d) => d.ni)),
rs: stats(data.map((d) => d.rs)),
}
}