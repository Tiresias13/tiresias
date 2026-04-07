"use client";

import dynamic from "next/dynamic";

const WindowManagerProvider = dynamic(
() => import("./WindowManager").then((m) => ({ default: m.WindowManagerProvider })),
{ ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
return <WindowManagerProvider>{children}</WindowManagerProvider>;
}
