import Link from 'next/link'

export default function NotFound() {
return (
<div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
<div className="space-y-2">
<h1 className="font-syne font-bold text-8xl text-text-primary">
404
</h1>
<p className="font-syne font-semibold text-xl text-text-primary">
You&apos;ve gone off-grid.
</p>
<p className="font-inter text-sm text-text-secondary max-w-sm">
This wallet, page, or route doesn&apos;t exist — or was never tracked.
Try searching a different address.
</p>
</div>
<div className="flex gap-3">
<Link
href="/"
className="px-5 py-2.5 bg-accent text-bg font-inter font-semibold text-sm rounded-card hover:bg-accent/90 transition-colors"
>
Back to Home
</Link>
<Link
href="/explorer"
className="px-5 py-2.5 border border-border text-text-secondary font-inter text-sm rounded-card hover:text-text-primary hover:border-[#444] transition-colors"
>
Explorer
</Link>
</div>
</div>
)
}