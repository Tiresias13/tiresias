import type { Config } from 'tailwindcss'

const config: Config = {
content: [
'./pages/**/*.{js,ts,jsx,tsx,mdx}',
'./components/**/*.{js,ts,jsx,tsx,mdx}',
'./app/**/*.{js,ts,jsx,tsx,mdx}',
],
theme: {
extend: {
colors: {
bg: '#0A0A0A',
surface: '#111111',
'surface-2': '#1A1A1A',
border: '#2A2A2A',
'text-primary': '#F5F5F5',
'text-secondary': '#888888',
accent: '#E8FF47',
follow: '#4ADE80',
watch: '#FACC15',
avoid: '#F87171',
sniper: '#818CF8',
'smart-money': '#4ADE80',
momentum: '#FACC15',
'exit-liq': '#F87171',
accumulator: '#67E8F9',
sol: '#9945FF',
bsc: '#F0B90B',
base: '#0052FF',
},
fontFamily: {
syne: ['var(--font-syne)', 'sans-serif'],
inter: ['var(--font-inter)', 'sans-serif'],
mono: ['var(--font-jetbrains)', 'monospace'],
},
borderRadius: {
card: '8px',
btn: '4px',
pill: '999px',
},
},
},
plugins: [],
}

export default config
