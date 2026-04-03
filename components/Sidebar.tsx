"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, History, Settings, Eye } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
{
label: "Signal Feed",
href: "/dashboard",
icon: LayoutDashboard,
},
{
label: "Positions",
href: "/positions",
icon: Wallet,
},
{
label: "History",
href: "/history",
icon: History,
},
{
label: "Settings",
href: "/settings",
icon: Settings,
},
];

export function Sidebar() {
const pathname = usePathname();

return (
<aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40">
{/* Logo */}
<div className="px-6 py-5 border-b border-zinc-800">
<div className="flex items-center gap-2">
<Eye className="w-5 h-5 text-amber-400" />
<span className="text-lg font-bold tracking-tight text-white">
TIRESIAS
</span>
</div>
<p className="text-xs text-zinc-500 mt-0.5">See before others do.</p>
</div>

{/* Navigation */}
<nav className="flex-1 px-3 py-4 space-y-1">
{navItems.map((item) => {
const Icon = item.icon;
const isActive = pathname === item.href;
return (
<Link
key={item.href}
href={item.href}
className={clsx(
"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
isActive
? "bg-amber-400/10 text-amber-400"
: "text-zinc-400 hover:text-white hover:bg-zinc-800"
)}
>
<Icon className="w-4 h-4" />
{item.label}
</Link>
);
})}
</nav>

{/* Bottom */}
<div className="px-4 py-4 border-t border-zinc-800">
<p className="text-xs text-zinc-600 text-center">
Powered by AVE API
</p>
</div>
</aside>
);
}
