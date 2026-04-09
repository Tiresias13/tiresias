"use client";

import { clsx } from "clsx";
import { getScoreLabel, ScoreBreakdown } from "@/lib/scoring";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle } from "lucide-react";

interface OrganicScoreProps {
score: number;
breakdown: ScoreBreakdown;
size?: "sm" | "lg";
}

const breakdownLabels = {
feeMcRatio: "Fee/MC Ratio",
volumeTrend: "Volume Trend",
holderCount: "Holder Count",
lockStatus: "Liquidity Lock",
tokenAge: "Token Age",
};

export function OrganicScore({ score, breakdown, size = "sm" }: OrganicScoreProps) {
const { label, color } = getScoreLabel(score);

return (
<div className="flex flex-col gap-1.5">
{/* Score number */}
<div className="flex items-baseline gap-1.5">
<span
className={clsx(
"font-bold tabular-nums",
size === "lg" ? "text-4xl" : "text-2xl",
color
)}
>
{score}
</span>
<span className="text-zinc-500 text-xs">/100</span>
<span
className={clsx(
"text-xs font-bold tracking-wider px-1.5 py-0.5 rounded",
score >= 70
? "bg-green-400/10 text-green-400"
: score >= 45
? "bg-yellow-400/10 text-yellow-400"
: "bg-red-400/10 text-red-400"
)}
>
{label}
</span>
</div>

{/* Breakdown */}
<div className="flex gap-1.5 flex-wrap">
{Object.entries(breakdown).map(([key, value]) => (
<Tooltip key={key}>
<TooltipTrigger asChild>
<div
className={clsx(
"flex items-center gap-1 text-xs px-1.5 py-0.5 rounded cursor-default",
value
? "text-green-400 bg-green-400/10"
: "text-red-400 bg-red-400/10"
)}
>
{value ? (
<CheckCircle className="w-3 h-3" />
) : (
<XCircle className="w-3 h-3" />
)}
<span>{breakdownLabels[key as keyof typeof breakdownLabels]}</span>
</div>
</TooltipTrigger>
<TooltipContent>
<p className="text-xs">
{breakdownLabels[key as keyof typeof breakdownLabels]}:{" "}
{value ? "✅ Pass" : "❌ Fail"}
</p>
</TooltipContent>
</Tooltip>
))}
</div>
</div>
);
}
