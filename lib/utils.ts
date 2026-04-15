import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
return num.toString()
}

export function formatRoi(roi: number): string {
const sign = roi >= 0 ? '+' : ''
return `${sign}${roi.toFixed(1)}%`
}

export function truncateAddress(address: string, chars = 6): string {
if (!address) return '—'
if (address.length <= chars * 2 + 3) return address
return `${address.slice(0, chars)}...${address.slice(-chars)}`
}
