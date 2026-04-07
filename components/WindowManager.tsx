"use client";

import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";

export interface WindowState {
id: string;
title: string;
icon: string;
isOpen: boolean;
isMinimized: boolean;
position: { x: number; y: number };
size: { width: number; height: number };
zIndex: number;
}

interface WindowManagerContextType {
windows: Record<string, WindowState>;
openWindow: (id: string) => void;
closeWindow: (id: string) => void;
minimizeWindow: (id: string) => void;
maximizeWindow: (id: string) => void;
focusWindow: (id: string) => void;
updateWindow: (id: string, updates: Partial<WindowState>) => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

const DEFAULT_WINDOWS: Record<string, Omit<WindowState, "zIndex">> = {
feed: {
id: "feed", title: "Agent Feed", icon: "📡",
isOpen: false, isMinimized: false,
position: { x: 80, y: 60 }, size: { width: 520, height: 600 },
},
intel: {
id: "intel", title: "Intel", icon: "🛡",
isOpen: false, isMinimized: false,
position: { x: 620, y: 60 }, size: { width: 420, height: 600 },
},
whale: {
id: "whale", title: "Trapped Whale", icon: "〰",
isOpen: false, isMinimized: false,
position: { x: 80, y: 200 }, size: { width: 480, height: 500 },
},
positions: {
id: "positions", title: "Positions", icon: "💼",
isOpen: false, isMinimized: false,
position: { x: 200, y: 100 }, size: { width: 600, height: 500 },
},
history: {
id: "history", title: "History", icon: "📋",
isOpen: false, isMinimized: false,
position: { x: 250, y: 120 }, size: { width: 560, height: 480 },
},
settings: {
id: "settings", title: "Settings", icon: "⚙️",
isOpen: false, isMinimized: false,
position: { x: 300, y: 140 }, size: { width: 400, height: 400 },
},
};

function loadFromStorage(): Record<string, WindowState> | null {
try {
const saved = localStorage.getItem("tiresias_windows");
if (saved) return JSON.parse(saved);
} catch {}
return null;
}

function saveToStorage(windows: Record<string, WindowState>) {
try {
localStorage.setItem("tiresias_windows", JSON.stringify(windows));
} catch {}
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
const [windows, setWindows] = useState<Record<string, WindowState>>(() => {
const saved = loadFromStorage();
const base = Object.fromEntries(
Object.entries(DEFAULT_WINDOWS).map(([id, w]) => [id, { ...w, zIndex: 10 }])
);
if (!saved) return base;
return Object.fromEntries(
Object.entries(base).map(([id, w]) => [id, saved[id] ? { ...w, ...saved[id] } : w])
);
});

const maxZRef = useRef(10);

useEffect(() => { saveToStorage(windows); }, [windows]);

const focusWindow = useCallback((id: string) => {
maxZRef.current += 1;
setWindows((prev) => ({ ...prev, [id]: { ...prev[id], zIndex: maxZRef.current } }));
}, []);

const openWindow = useCallback((id: string) => {
maxZRef.current += 1;
setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: maxZRef.current } }));
}, []);

const closeWindow = useCallback((id: string) => {
setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isOpen: false, isMinimized: false } }));
}, []);

const minimizeWindow = useCallback((id: string) => {
setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
}, []);

const maximizeWindow = useCallback((id: string) => {
setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isMinimized: false } }));
}, []);

const updateWindow = useCallback((id: string, updates: Partial<WindowState>) => {
setWindows((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
}, []);

return (
<WindowManagerContext.Provider value={{ windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindow }}>
{children}
</WindowManagerContext.Provider>
);
}

export function useWindowManager() {
const ctx = useContext(WindowManagerContext);
if (!ctx) throw new Error("useWindowManager must be used inside WindowManagerProvider");
return ctx;
}

interface FloatingWindowProps {
id: string;
children: React.ReactNode;
}

export function FloatingWindow({ id, children }: FloatingWindowProps) {
const { windows, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindow } = useWindowManager();
const win = windows[id];
const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
const resizeRef = useRef({ resizing: false, startX: 0, startY: 0, origW: 0, origH: 0 });

const onMouseDownHeader = useCallback((e: React.MouseEvent) => {
if ((e.target as HTMLElement).closest("button")) return;
if (!win) return;
focusWindow(id);
dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: win.position.x, origY: win.position.y };
const onMove = (e: MouseEvent) => {
if (!dragRef.current.dragging) return;
updateWindow(id, { position: {
x: Math.max(0, dragRef.current.origX + e.clientX - dragRef.current.startX),
y: Math.max(0, dragRef.current.origY + e.clientY - dragRef.current.startY),
}});
};
const onUp = () => { dragRef.current.dragging = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
window.addEventListener("mousemove", onMove);
window.addEventListener("mouseup", onUp);
}, [id, win, focusWindow, updateWindow]);

const onMouseDownResize = useCallback((e: React.MouseEvent) => {
e.stopPropagation();
if (!win) return;
resizeRef.current = { resizing: true, startX: e.clientX, startY: e.clientY, origW: win.size.width, origH: win.size.height };
const onMove = (e: MouseEvent) => {
if (!resizeRef.current.resizing) return;
updateWindow(id, { size: {
width: Math.max(300, resizeRef.current.origW + e.clientX - resizeRef.current.startX),
height: Math.max(200, resizeRef.current.origH + e.clientY - resizeRef.current.startY),
}});
};
const onUp = () => { resizeRef.current.resizing = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
window.addEventListener("mousemove", onMove);
window.addEventListener("mouseup", onUp);
}, [id, win, updateWindow]);

if (!win || !win.isOpen || win.isMinimized) return null;

return (
<div
onClick={() => focusWindow(id)}
style={{ position: "absolute", left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, zIndex: win.zIndex }}
className="flex flex-col bg-white border border-zinc-200 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
>
<div
onMouseDown={onMouseDownHeader}
className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-zinc-100 border-b border-zinc-300 cursor-move select-none"
>
<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
<span className="text-xs font-bold text-black uppercase tracking-widest ml-1 select-none flex-1">
{win.icon} {win.title}
</span>
<button
onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors flex-shrink-0"
/>
</div>

<div className="flex-1 overflow-hidden">
{children}
</div>

<div
onMouseDown={onMouseDownResize}
className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
style={{ background: "linear-gradient(135deg, transparent 50%, #d4d4d8 50%)" }}
/>
</div>
);
}

export function Taskbar() {
const { windows, maximizeWindow } = useWindowManager();
const minimized = Object.values(windows).filter((w) => w.isOpen && w.isMinimized);
if (minimized.length === 0) return null;

return (
<div className="flex-shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 py-2 flex items-center gap-2">
<span className="text-xs text-zinc-400 uppercase tracking-widest mr-2">Minimized</span>
{minimized.map((w) => (
<button
key={w.id}
onClick={() => maximizeWindow(w.id)}
className="px-3 py-1.5 text-xs font-mono border border-zinc-300 hover:border-black hover:text-black text-zinc-500 transition-colors"
>
{w.icon} {w.title}
</button>
))}
</div>
);
}
