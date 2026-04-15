import type { Chain } from './scoring'

export interface SeedWallet {
address: string
chain: Chain
label: string
isAiAgent: boolean
}

export const SEED_WALLETS: SeedWallet[] = [
// AI Agent wallets (confirmed)
{
address: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
chain: 'SOL',
label: 'AI Agent #1',
isAiAgent: true,
},
{
address: 'DuMbhu7mvQvqQHGcnikDgb4XegXJRyhUBfdU22uELiZA',
chain: 'SOL',
label: 'AI Agent #2',
isAiAgent: true,
},
{
address: 'Gu3LDkn7Vx3bmCzLafYNKcDxv2mH7YN44NJZFXnypump',
chain: 'SOL',
label: 'AI Agent #3',
isAiAgent: true,
},
{
address: 'q9MhHpeydqTdtPaNpzDoWvP1qY5s3sFHTF1uYcXjdsc',
chain: 'SOL',
label: 'AI Agent #4',
isAiAgent: true,
},
{
address: '6CBcxFR6dSMJJ7Y4dQZTshJT2KxuwnSXioXEABxNVZPW',
chain: 'SOL',
label: 'AI Agent #5',
isAiAgent: true,
},
// High performers from AVE smart_wallet_list
{
address: 'J6TDXvarvpBdPXTaTU8eJbtso1PUCYKGkVtMKUUY8iEa',
chain: 'SOL',
label: 'AVE Top Wallet #1',
isAiAgent: false,
},
{
address: 'BcViN2kDd4jJevwE6RC9ZDWmtYgf77do2Pcs5Kf9RexN',
chain: 'SOL',
label: 'AVE Top Wallet #2',
isAiAgent: false,
},
{
address: 'HhUXfpvkhvqdqAmov3YC4UgEp3sitt4SbYqAcTuZPYLw',
chain: 'SOL',
label: 'AVE Top Wallet #3',
isAiAgent: false,
},
{
address: 'DU8W6ritu6LuDm6DFkVtrtVyW8KEruMhHagvjxg4DRys',
chain: 'SOL',
label: 'AVE Top Wallet #4',
isAiAgent: false,
},
{
address: 'GkRZz7NASCsiMbmzwq4BsHZwsMw9Bz2xhgvndR1kybzz',
chain: 'SOL',
label: 'AVE Top Wallet #5',
isAiAgent: false,
},
]

export const SEED_ADDRESSES = SEED_WALLETS.map((w) => w.address)
export const AI_AGENT_ADDRESSES = SEED_WALLETS
.filter((w) => w.isAiAgent)
.map((w) => w.address)
