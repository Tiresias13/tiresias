'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
{ href: '/', label: 'Home' },
{ href: '/leaderboard', label: 'Leaderboard' },
{ href: '/signals', label: 'Signals' },
{ href: '/explorer', label: 'Explorer' },
{ href: '/about', label: 'About' },
]

export default function Navbar() {
const pathname = usePathname()
const router = useRouter()
const showBack = pathname !== '/'

function handleConnectWallet() {
toast('Your wallet is not analyzed yet. Unlock your on-chain identity.', {
duration: 4000,
})
}

return (
<>
{/* Top navbar */}
<nav className="sticky top-0 z-40 w-full border-b border-border bg-bg/90 backdrop-blur-sm">
<div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

{/* Left — Logo + Back */}
<div className="flex items-center gap-4">
<Link href="/" className="flex items-center gap-2 group">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<ellipse cx="12" cy="12" rx="10" ry="6" stroke="#E8FF47" strokeWidth="1.5" />
<circle cx="12" cy="12" r="3" stroke="#E8FF47" strokeWidth="1.5" />
<circle cx="12" cy="12" r="1" fill="#E8FF47" />
</svg>
<span className="font-syne font-bold text-base tracking-wider text-text-primary group-hover:text-accent transition-colors">
TIRESIAS
</span>
</Link>

{showBack && (
<button
onClick={() => router.back()}
className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary font-inter transition-colors border border-border rounded-btn px-2.5 py-1 hover:border-[#444]"
>
← Back
</button>
)}
</div>

{/* Nav links — desktop only */}
<div className="hidden md:flex items-center gap-6">
{NAV_LINKS.map((link) => (
<Link
key={link.href}
href={link.href}
className={cn(
'text-sm font-inter transition-colors',
pathname === link.href
? 'text-text-primary'
: 'text-text-secondary hover:text-text-primary'
)}
>
{link.label}
</Link>
))}
</div>

{/* Connect Wallet */}
<div className="group relative">
<button
onClick={handleConnectWallet}
className="px-4 py-1.5 rounded-btn text-sm font-inter font-medium border border-border text-text-secondary opacity-60 cursor-not-allowed select-none"
disabled
>
Connect Wallet
</button>
<div className="absolute right-0 top-full mt-2 w-64 px-3 py-2 rounded-card text-xs text-text-secondary bg-surface-2 border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden md:block">
Your wallet is not analyzed yet. Unlock your on-chain identity.
<div className="absolute bottom-full right-4 border-4 border-transparent border-b-surface-2" />
</div>
</div>

</div>
</nav>

{/* Mobile bottom nav */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-sm border-t border-border">
<div className="flex items-center justify-around h-14 px-2">
{NAV_LINKS.map((link) => (
<Link
key={link.href}
href={link.href}
className={cn(
'flex flex-col items-center justify-center flex-1 h-full text-[10px] font-inter transition-colors gap-0.5',
pathname === link.href
? 'text-accent'
: 'text-text-secondary'
)}
>
<span className="text-base leading-none">
{link.href === '/' ? '⌂' : link.href === '/leaderboard' ? '⬆' : link.href === '/signals' ? '◎' : link.href === '/explorer' ? '⊞' : '○'}
</span>
<span>{link.label}
    </span>
</Link>
))}
</div>
</nav>
</>
)
}
