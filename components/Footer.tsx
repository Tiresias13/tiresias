import Link from 'next/link'

export default function Footer() {
return (
<footer className="border-t border-border mt-auto">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
<div className="flex flex-col sm:flex-row items-center justify-between gap-4">

{/* Left — Logo + tagline */}
<div className="flex items-center gap-3">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
<ellipse cx="12" cy="12" rx="10" ry="6" stroke="currentColor" strokeWidth="1.5"/>
<circle cx="12" cy="12" r="3" fill="currentColor"/>
<line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
</svg>
<div>
<span className="font-syne font-bold text-sm text-text-primary tracking-widest uppercase">
TIRESIAS
</span>
<p className="font-inter text-xs text-text-secondary leading-none mt-0.5">
On-chain intelligence.
</p>
</div>
</div>

{/* Right — Links + version */}
<div className="flex items-center gap-5 text-xs font-inter text-text-secondary">
<Link href="/about" className="hover:text-text-primary transition-colors">
Docs
</Link>
<Link href="/about" className="hover:text-text-primary transition-colors">
About
</Link>
<a
href="https://twitter.com"
target="_blank"
rel="noopener noreferrer"
className="hover:text-text-primary transition-colors"
>
Twitter
</a>
<span className="text-border">·</span>
<span>© 2026</span>
<span className="text-border">·</span>
<span className="font-mono text-[11px]">v0.1.0</span>
</div>

</div>
</div>
</footer>
)
}
