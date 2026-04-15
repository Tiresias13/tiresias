interface EmptyStateProps {
type?: 'wallet' | 'leaderboard' | 'signals' | 'explorer'
message?: string
}

export default function EmptyState({
type = 'wallet',
message,
}: EmptyStateProps) {
const copy = message ? { title: message, sub: '' } : getCopy(type)

return (
<div className="flex flex-col items-center justify-center py-20 px-4 text-center">
{/* SVG — Tiresias the blind prophet seeing into darkness */}
<svg
width="120"
height="120"
viewBox="0 0 120 120"
fill="none"
xmlns="http://www.w3.org/2000/svg"
className="mb-6 opacity-60"
>
{/* Outer eye outline */}
<ellipse
cx="60"
cy="60"
rx="48"
ry="28"
stroke="#2A2A2A"
strokeWidth="1.5"
/>

{/* Iris */}
<circle
cx="60"
cy="60"
r="16"
stroke="#2A2A2A"
strokeWidth="1.5"
/>

{/* Pupil — filled with accent */}
<circle cx="60" cy="60" r="6" fill="#E8FF47" opacity="0.3" />

{/* Darkness lines through eye — "seeing into darkness" */}
<line x1="20" y1="60" x2="100" y2="60" stroke="#1A1A1A" strokeWidth="8" />

{/* Eyelashes top */}
<line x1="40" y1="36" x2="38" y2="28" stroke="#2A2A2A" strokeWidth="1" strokeLinecap="round" />
<line x1="60" y1="32" x2="60" y2="24" stroke="#2A2A2A" strokeWidth="1" strokeLinecap="round" />
<line x1="80" y1="36" x2="82" y2="28" stroke="#2A2A2A" strokeWidth="1" strokeLinecap="round" />

{/* Eyelashes bottom */}
<line x1="40" y1="84" x2="38" y2="92" stroke="#2A2A2A" strokeWidth="1" strokeLinecap="round" />
<line x1="60" y1="88" x2="60" y2="96" stroke="#2A2A2A" strokeWidth="1" strokeLinecap="round" />
<line x1="80" y1="84" x2="82" y2="92" stroke="#2A2A2A" strokeWidth="1" strokeLinecap="round" />

{/* Accent glow dot */}
<circle cx="60" cy="60" r="3" fill="#E8FF47" opacity="0.6" />
</svg>

<p className="text-text-primary font-syne font-semibold text-lg mb-2">
{copy.title}
</p>
<p className="text-text-secondary font-inter text-sm max-w-xs">
{copy.sub}
</p>
</div>
)
}

function getCopy(type: string) {
const copies: Record<string, { title: string; sub: string }> = {
wallet: {
title: 'No signal detected.',
sub: 'Tiresias sees nothing here — yet. This wallet may not exist or has no on-chain history.',
},
leaderboard: {
title: 'No wallets tracked.',
sub: 'The leaderboard is empty. Scoring is running — check back shortly.',
},
signals: {
title: 'No signals right now.',
sub: 'The feed is quiet. Smart money may be waiting.',
},
explorer: {
title: 'Nothing in this cluster.',
sub: 'No wallets match this classification yet.',
},
}
return copies[type] ?? copies.wallet
}
