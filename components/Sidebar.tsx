"use client";

import { Radio, Shield, Waves, Wallet, History, Settings, Eye } from "lucide-react";
import { clsx } from "clsx";
import { useWindowManager } from "./WindowManager";

const windowItems = [
{ id: "feed", label: "Agent Feed", icon: Radio },
{ id: "intel", label: "Intel", icon: Shield },
{ id: "whale", label: "Trapped Whale", icon: Waves },
{ id: "positions", label: "Positions", icon: Wallet },
{ id: "history", label: "History", icon: History },
{ id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
const { windows, openWindow, closeWindow } = useWindowManager();

const handleToggle = (id: string) => {
const win = windows[id];
if (!win || !win.isOpen) {
openWindow(id);
} else {
closeWindow(id);
}
};

return (
<aside className="fixed left-0 top-0 h-screen w-14 bg-white border-r border-zinc-200 flex flex-col z-40 items-center py-3 gap-1">
<div className="mb-3 pb-3 border-b border-zinc-200 w-full flex justify-center">
<Eye className="w-5 h-5 text-black" />
</div>

{windowItems.map(({ id, label, icon: Icon }) => {
const win = windows[id];
const isActive = win?.isOpen;
return (
<button
key={id}
onClick={() => handleToggle(id)}
title={label}
className={clsx(
"w-9 h-9 flex items-center justify-center rounded transition-colors group relative",
isActive ? "bg-black text-white" : "text-zinc-400 hover:text-black hover:bg-zinc-100"
)}
>
<Icon className="w-4 h-4" />
<span className="absolute left-12 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-mono">
{label}
</span>
</button>
);
})}
</aside>
);
}
