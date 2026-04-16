'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
{
href: '/',
label: 'Home',
icon: (
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
<polyline points="9 22 9 12 15 12 15 22" />
</svg>
),
},
{
href: '/leaderboard',
label: 'Board',
icon: (
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<line x1="18" y1="20" x2="18" y2="10" />
<line x1="12" y1="20" x2="12" y2="4" />
<line x1="6" y1="20" x2="6" y2="14" />
</svg>
),
},
{
href: '/signals',
label: 'Signals',
icon: (
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
</svg>
),
},
{
href: '/explorer',
label: 'Explorer',
icon: (
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<circle cx="11" cy="11" r="8" />
<line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>
),
},
{
href: '/about',
label: 'About',
icon: (
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<circle cx="12" cy="12" r="10" />
<line x1="12" y1="8" x2="12" y2="12" />
<line x1="12" y1="16" x2="12.01" y2="16" />
</svg>
),
},
]

export default function MobileNav() {
const pathname = usePathname()

return (
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t border-border">
<div className="flex items-center justify-around h-14">
{NAV_ITEMS.map((item) => {
const isActive = pathname === item.href
return (
<Link
key={item.href}
href={item.href}
className={cn(
'flex flex-col items-center gap-0.5 px-2 py-2 transition-colors min-w-0',
isActive ? 'text-accent' : 'text-text-secondary'
)}
>
{item.icon}
<span className="text-[9px] font-inter truncate">{item.label}</span>
</Link>
)
})}
</div>
</nav>
)
}
