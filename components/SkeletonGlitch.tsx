import { cn } from '@/lib/utils'

interface SkeletonProps {
className?: string
}

export function Skeleton({ className }: SkeletonProps) {
return (
<div className={cn('skeleton-glitch', className)} />
)
}

export function WalletCardSkeleton() {
return (
<div className="bg-surface border border-border rounded-card p-4 space-y-3">
<div className="flex items-center justify-between">
<Skeleton className="h-4 w-32" />
<Skeleton className="h-6 w-20 rounded-pill" />
</div>
<div className="flex items-center gap-2">
<Skeleton className="h-5 w-24 rounded-pill" />
<Skeleton className="h-5 w-16 rounded-pill" />
</div>
<div className="flex items-center justify-between">
<Skeleton className="h-8 w-16" />
<Skeleton className="h-6 w-24 rounded-pill" />
</div>
</div>
)
}

export function WalletProfileSkeleton() {
return (
<div className="space-y-6">
{/* Header */}
<div className="flex items-start justify-between">
<div className="space-y-2">
<Skeleton className="h-6 w-48" />
<Skeleton className="h-4 w-32" />
</div>
<Skeleton className="h-10 w-24 rounded-btn" />
</div>

{/* Score section */}
<div className="bg-surface border border-border rounded-card p-6">
<div className="flex items-center gap-6">
<Skeleton className="h-24 w-24 rounded-full" />
<div className="space-y-3 flex-1">
<Skeleton className="h-5 w-40 rounded-pill" />
<Skeleton className="h-4 w-32 rounded-pill" />
<Skeleton className="h-4 w-56" />
</div>
</div>
</div>

{/* Z-score breakdown */}
<div className="bg-surface border border-border rounded-card p-6 space-y-4">
<Skeleton className="h-4 w-40" />
{[...Array(6)].map((_, i) => (
<div key={i} className="space-y-1">
<div className="flex justify-between">
<Skeleton className="h-3 w-32" />
<Skeleton className="h-3 w-16" />
</div>
<Skeleton className="h-1 w-full" />
</div>
))}
</div>

{/* Insight */}
<div className="bg-surface border border-border rounded-card p-6 space-y-2">
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-4/5" />
<Skeleton className="h-4 w-3/5" />
</div>
</div>
)
}

export function LeaderboardSkeleton() {
return (
<div className="space-y-2">
{[...Array(10)].map((_, i) => (
<WalletCardSkeleton key={i} />
))}
</div>
)
}

export function SignalSkeleton() {
return (
<div className="flex items-center gap-3 py-3 border-b border-border">
<Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
<div className="flex-1 space-y-1.5">
<Skeleton className="h-3 w-32" />
<Skeleton className="h-3 w-48" />
</div>
<Skeleton className="h-3 w-16" />
</div>
)
}
