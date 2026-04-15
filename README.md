# TIRESIAS

**On-chain wallet intelligence for Solana & BSC.**

> "See the pattern behind the profit."

---

## What it does

TIRESIAS analyzes on-chain wallet behavior and tells you:
- Is this wallet a human or a machine?
- What's their trading pattern?
- Should you follow, watch, or avoid?

## Features

- **Leaderboard** — Top performing wallets ranked by TS Score
- **Wallet Profile** — Deep behavioral analysis with AI detection
- **Signals** — Live wallet activity feed
- **Explorer** — Browse wallets by agent classification

## Agent Classifications

- ⚡ **Sniper** — High timing edge, fast entries
- 🟢 **Smart Money** — Consistent profits, high behavioral accuracy
- 🟡 **Momentum Follower** — Rides trends, low timing edge
- 🔴 **Exit Liquidity** — Low win rate, likely absorbing sell pressure
- 🧬 **Silent Accumulator** — Gradual entry, long holding pattern

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Supabase · AVE API · Helius · Groq

---

Built by [Tiresias](https://tiresias.vercel.app)

## Scoring Formula

**TS Score = (0.25 × PQ) + (0.20 × TE) + (0.15 × BC) + (0.15 × SI) + (0.15 × NI) − (0.10 × RS)**

| Component | Weight | Description |
|-----------|--------|-------------|
| PQ — Profit Quality | 25% | Win rate + ROI consistency |
| TE — Timing Edge | 20% | Entry timing relative to market moves |
| BC — Behavioral Consistency | 15% | Variance in buy/sell patterns |
| SI — Strategy Identity | 15% | Token concentration & focus |
| NI — Network Influence | 15% | Volume & unique token interaction breadth |
| RS — Risk Score | -10% | Honeypot interactions, scam contracts |

### AI Detection

Composite probability score (0–100%) based on 5 behavioral signals:
1. Execution timing variance
2. 24h activity heatmap uniformity
3. Reaction speed to on-chain events
4. Gas optimization patterns
5. Token interaction breadth

*Scores are probabilistic, not deterministic.*