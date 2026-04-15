export default function AboutPage() {
    return(
<div className="max-w-2xl mx-auto px-4 py-10 space-y-12">

{/* Header */}
<div>
<h1 className="font-syne font-bold text-3xl text-text-primary mb-2">About</h1>
<p className="text-text-secondary font-inter text-sm">
What Tiresias is. How it works. What it can't do.
</p>
</div>

{/* What */}
<section className="space-y-3">
<h2 className="font-syne font-semibold text-lg text-text-primary">What is Tiresias?</h2>
<p className="font-inter text-sm text-text-secondary leading-relaxed">
Tiresias is an on-chain wallet intelligence platform. It takes raw transaction data and turns it into behavioral signals — who is smart money, who is exit liquidity, and increasingly: who is human and who is a machine.
</p>
<p className="font-inter text-sm text-text-secondary leading-relaxed">
Named after the blind prophet of Greek mythology who could see the future without seeing the present. The market shows you data. Tiresias shows you what it means.
</p>
</section>

{/* Scoring */}
<section className="space-y-4">
<h2 className="font-syne font-semibold text-lg text-text-primary">Scoring Methodology</h2>
<p className="font-inter text-sm text-text-secondary leading-relaxed">
Every wallet receives a TS Score (0–100) calculated from six components:
</p>

<div className="bg-surface border border-border rounded-card p-4 font-mono text-sm text-accent">
TS = (0.25 × PQ) + (0.20 × TE) + (0.15 × BC) + (0.15 × SI) + (0.15 × NI) − (0.10 × RS)
</div>

<div className="space-y-3">
{[
{ label: 'PQ — Profit Quality', desc: 'Win rate and ROI consistency across all tracked trades. Source: AVE API walletinfo.' },
{ label: 'TE — Timing Edge', desc: 'How early this wallet enters relative to on-chain events. Source: AVE + Helius millisecond data.' },
{ label: 'BC — Behavioral Consistency', desc: 'Variance in trade patterns. Lower variance = more consistent strategy.' },
{ label: 'SI — Strategy Identity', desc: 'Dominance of a single trading pattern. High SI = clear, repeatable strategy.' },
{ label: 'NI — Network Influence', desc: 'How many other wallets follow-entry after this one moves.' },
{ label: 'RS — Risk Score', desc: 'Exposure to honeypot contracts and scam interactions. Source: AVE contract risk API.' },
].map((item) => (
<div key={item.label} className="border-l-2 border-border pl-4">
<p className="font-inter text-sm font-medium text-text-primary">{item.label}</p>
<p className="font-inter text-xs text-text-secondary mt-0.5">{item.desc}</p>
</div>
))}
</div>

<p className="font-inter text-xs text-text-secondary leading-relaxed border border-border rounded-card p-3 bg-surface">
<span className="text-watch">⚠️ RS Multiplier:</span> If a wallet has ≥3 honeypot interactions, RS is multiplied by 1.5×. If a verified scam contract interaction is detected, the score is hard-capped at 40 and a High Risk badge is shown permanently.
</p>
</section>

{/* Z-Score */}
<section className="space-y-3">
<h2 className="font-syne font-semibold text-lg text-text-primary">Z-Score Normalization</h2>
<p className="font-inter text-sm text-text-secondary leading-relaxed">
Raw scores are normalized daily using z-scores relative to all tracked wallets. This makes scores comparable across time and chains — a score of 94 today means the same as a score of 94 last week.
</p>
<p className="font-inter text-sm text-text-secondary leading-relaxed">
Each component shows its sigma value (σ). A z-score of +2.0σ or higher triggers an extreme signal flag — statistically anomalous behavior worth paying attention to.
</p>
</section>

{/* AI Detection */}
<section className="space-y-4">
<h2 className="font-syne font-semibold text-lg text-text-primary">AI Agent Detection</h2>
<p className="font-inter text-sm text-text-secondary leading-relaxed">
Tiresias analyzes five behavioral signals to determine whether a wallet is operated by a human or an AI agent:
</p>

<div className="space-y-3">
{[
{ label: 'Execution Timing Variance', desc: 'AI agents have abnormally low variance between transactions. Humans areirregular.' },
{ label: '24h Activity Heatmap', desc: 'Humans sleep. AI agents don\'t. No quiet hours = high AI probability.' },
{ label: 'Reaction Speed', desc: 'AI agents react to on-chain events in under 5 seconds. Humans need minutes.' },
{ label: 'Gas Behavior', desc: 'AI agents always pay optimal gas. Humans overpay when panicking, underpay when lazy.' },
{ label: 'Token Interaction Breadth', desc: 'AI agents are focused. High trade count concentrated in few tokens = machine-like.' },
].map((item) => (
<div key={item.label} className="border-l-2 border-[#818CF840] pl-4">
<p className="font-inter text-sm font-medium text-text-primary">{item.label}</p>
<p className="font-inter text-xs text-text-secondary mt-0.5">{item.desc}</p>
</div>
))}
</div>

<p className="font-inter text-xs text-text-secondary p-3 rounded-card bg-surface border border-border">
AI Probability is shown as 0–100%. Under 31% = Human. 31–65% = Uncertain. 66%+ = AI Agent. All signals and their individual readings are shown transparently in each wallet profile.
</p>
</section>

{/* Limitations */}
<section className="space-y-3">
<h2 className="font-syne font-semibold text-lg text-text-primary">Limitations</h2>
<div className="space-y-2">
{[
'Scores are based on historical data. Past behavior does not guarantee future performance.',
'Confidence level is low for wallets with fewer than 30 transactions. Treat those scores as directional, not definitive.',
'AI detection is probabilistic. A high AI score does not confirm an agent — it flags anomalous behavior worth investigating.',
'BSC and Base data quality is lower than Solana. Helius millisecond timing is Solana-only.',
'Z-score baseline improves as more wallets are tracked. Early scores are less normalized.',
].map((item, i) => (
<div key={i} className="flex gap-3 text-sm font-inter text-text-secondary">
<span className="text-border mt-0.5">—</span>
<span>{item}</span>
</div>
))}
</div>
</section>

{/* Data sources */}
<section className="space-y-3">
<h2 className="font-syne font-semibold text-lg text-text-primary">Data Sources</h2>
<div className="grid grid-cols-2 gap-3">
{[
{ name: 'AVE API', role: 'Wallet PnL, tx history, contract risk' },
{ name: 'Helius', role: 'Solana RPC, millisecond timing, gas data' },
{ name: 'DexScreener', role: 'Token performance confirmation' },
{ name: 'GitHub API', role: 'AI agent repo detection (leading layer)' },
{ name: 'Groq', role: 'Classification + narrative generation' },
{ name: 'Supabase', role: 'Score caching + history tracking' },
].map((source) => (
<div key={source.name} className="bg-surface border border-border rounded-card p-3">
<p className="font-mono text-xs text-accent">{source.name}</p>
<p className="font-inter text-xs text-text-secondary mt-1">{source.role}</p>
</div>
))}
</div>
</section>

{/* Footer note */}
<div className="border-t border-border pt-6 text-xs text-text-secondary font-inter">
Tiresias v0.1.0 · Not financial advice · Data is provided as-is
</div>

</div>
)
}
