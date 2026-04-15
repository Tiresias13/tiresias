export default function Head({ params }: { params: { address: string } }) {
const { address } = params
const title = `${address.slice(0, 8)}... — Tiresias`
const ogImage = `/api/og?address=${address}`
return (
<>
<title>{title}</title>
<meta name="description" content="On-chain wallet intelligence. See the pattern behind the profit." />
<meta property="og:title" content={title} />
<meta property="og:description" content="On-chain wallet intelligence. See the pattern behind the profit." />
<meta property="og:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content={ogImage} />
</>
)
}