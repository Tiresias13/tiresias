import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletContextProvider } from "@/components/WalletContextProvider";

const geistSans = Geist({
variable: "--font-geist-sans",
subsets: ["latin"],
});

const geistMono = Geist_Mono({
variable: "--font-geist-mono",
subsets: ["latin"],
});

export const metadata: Metadata = {
title: "Tiresias",
description: "See before others do.",
};

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<html lang="en" className="dark">
<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
<WalletContextProvider>
<TooltipProvider>
{children}
</TooltipProvider>
</WalletContextProvider>
</body>
</html>
);
}
