const GITHUB_API = 'https://api.github.com'

const headers: Record<string, string> = {
Accept: 'application/vnd.github.v3+json',
...(process.env.GITHUB_TOKEN
? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
: {}),
}

// Types
export interface GitHubRepo {
full_name: string
html_url: string
description: string | null
stargazers_count: number
updated_at: string
topics: string[]
}

export interface GitHubSearchResult {
total_count: number
items: GitHubRepo[]
}

export interface AiAgentGitHubSignal {
found: boolean
repos: GitHubRepo[]
mentionCount: number
frameworks: string[]
confidence: number
}

// Search repos that mention a wallet address
export async function searchWalletInGitHub(
walletAddress: string
): Promise<AiAgentGitHubSignal> {
try {
const res = await fetch(
`${GITHUB_API}/search/code?q=${walletAddress}&per_page=10`,
{ headers, next: { revalidate: 3600 } }
)

if (!res.ok) {
return { found: false, repos: [], mentionCount: 0, frameworks: [], confidence: 0 }
}

const json: { total_count: number; items: any[] } = await res.json()
const repos = json.items.map((item: any) => item.repository)

const frameworks = detectAiFrameworks(repos)

return {
found: json.total_count > 0,
repos: repos.slice(0, 5),
mentionCount: json.total_count,
frameworks,
confidence: calculateGitHubConfidence(json.total_count, frameworks),
}
} catch {
return { found: false, repos: [], mentionCount: 0, frameworks: [], confidence: 0 }
}
}

// Search repos announcing AI agent deployments
export async function searchAiAgentRepos(
query: string = 'elizaos ai agent wallet deployed'
): Promise<GitHubRepo[]> {
try {
const res = await fetch(
`${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=updated&per_page=20`,
{ headers, next: { revalidate: 3600 } }
)
if (!res.ok) return []
const json: GitHubSearchResult = await res.json()
return json.items
} catch {
return []
}
}

// Detect AI agent frameworks from repo data
function detectAiFrameworks(repos: any[]): string[] {
const frameworks: Set<string> = new Set()
const keywords: Record<string, string> = {
elizaos: 'ElizaOS',
eliza: 'ElizaOS',
'ai16z': 'ai16z',
openai: 'OpenAI',
langchain: 'LangChain',
autogen: 'AutoGen',
crewai: 'CrewAI',
'agent-protocol': 'Agent Protocol',
openclaw: 'OpenClaw',
'solana-agent': 'Solana Agent Kit',
}

repos.forEach((repo: any) => {
const text = [
repo.full_name,
repo.description ?? '',
(repo.topics ?? []).join(' '),
].join(' ').toLowerCase()

Object.entries(keywords).forEach(([key, label]) => {
if (text.includes(key)) frameworks.add(label)
})
})

return Array.from(frameworks)
}

// Calculate confidence score from GitHub signals
function calculateGitHubConfidence(mentionCount: number, frameworks: string[]): number {
let score = 0
if (mentionCount >= 1) score += 30
if (mentionCount >= 3) score += 20
if (mentionCount >= 10) score += 20
score += frameworks.length * 15
return Math.min(score, 100)
}
