import type { Metadata } from 'next'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'

const syne = Syne({
subsets: ['latin'],
variable: '--font-syne',
weight: ['400', '600', '700', '800'],
})

const inter = Inter({
subsets: ['latin'],
variable: '--font-inter',
weight: ['400', '500', '600'],
})

const jetbrains = JetBrains_Mono({
subsets: ['latin'],
variable: '--font-jetbrains',
weight: ['400', '500'],
})

export const metadata: Metadata = {
title: 'TIRESIAS — On-chain Intelligence',
description: 'See the pattern behind the profit. Wallet intelligence for Solana, BSC & Base.',
}

export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {
return (
<html lang="en" className={`${syne.variable} ${inter.variable} ${jetbrains.variable}`}>
<body className="bg-bg text-text-primary font-inter min-h-screen flex flex-col">
<Navbar />
<main className="flex-1 pb-20 sm:pb-0">
{children}
</main>
<Footer />
<MobileNav />
<Toaster
position="bottom-right"
toastOptions={{
style: {
background: '#111111',
border: '1px solid #2A2A2A',
color: '#F5F5F5',
},
}}
/>
</body>
</html>
)
}