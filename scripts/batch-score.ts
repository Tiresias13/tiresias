import { scoreWallet } from '../lib/scoring-engine'
import { getSmartWalletList } from '../lib/ave'

async function main() {
console.log(`[batch] Starting daily scoring — ${new Date().toISOString()}`)

// Pull top wallets dari AVE smart wallet list
const chains = [
{ aveChain: 'solana', chain: 'SOL' },
{ aveChain: 'bsc', chain: 'BSC' },
{ aveChain: 'base', chain: 'BASE' },
]

let success = 0
let failed = 0

for (const { aveChain, chain } of chains) {
console.log(`[batch] Fetching AVE smart wallets for ${chain}...`)
const wallets = await getSmartWalletList(aveChain, 20)
console.log(`[batch] Found ${wallets.length} wallets for ${chain}`)

for (const wallet of wallets) {
try {
console.log(`[batch] Scoring ${wallet.wallet_address.slice(0, 8)}... (${chain})`)
const result = await scoreWallet(wallet.wallet_address, chain, true, true)
console.log(`[batch] ✓ Score: ${result.score} | Agent: ${result.agentType} | AI: ${result.aiDetection.probability}%`)
success++
// Rate limit
await new Promise((r) => setTimeout(r, 2500))
} catch (err) {
console.error(`[batch] ✗ Failed: ${wallet.wallet_address.slice(0, 8)}...`, err)
failed++
}
}
}

console.log(`[batch] Done — ${success} success, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
}

main()
