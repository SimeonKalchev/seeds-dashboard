import { useState } from 'react'
import { useAccounts } from '../hooks/useMeta'
import CommentCard, { type Comment } from '../components/CommentCard'

const COUNTRIES = [
  { code: 'BG', match: (n: string) => n.toLowerCase().includes('goldenseeds bg') },
  { code: 'GR', match: (n: string) => n.toLowerCase().includes('goldenseeds.gr') },
  { code: 'RO', match: (n: string) => n.toLowerCase().includes('goldenseeds.ro') },
  { code: 'HR', match: (n: string) => n.toLowerCase().includes('zlatasemena.com.hr') },
  { code: 'SI', match: (n: string) => n.toLowerCase() === 'zlatasemena.com' },
  { code: 'SK', match: (n: string) => n.toLowerCase().includes('zlatasemena.sk') },
  { code: 'CZ', match: (n: string) => n.toLowerCase().includes('zlatasemena.cz') },
  { code: 'HU', match: (n: string) => n.toLowerCase().includes('goldenseends') },
]

interface RawComment {
  id: string
  message: string
  from?: { name: string; id: string }
  created_time: string
  postId: string
  adId?: string
}

interface PostSummary {
  postId: string
  count: number
  error?: string
}

interface Props {
  token: string
}

export default function Moderation({ token }: Props) {
  const { data: accounts = [] } = useAccounts(token)
  const [selectedCountry, setSelectedCountry] = useState('BG')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'ai' | 'browse' | null>(null)
  const [error, setError] = useState('')

  // AI scan state
  const [aiResult, setAiResult] = useState<{ comments: Comment[]; scanned: number; posts: number; debug?: string } | null>(null)

  // Browse all state
  const [browseResult, setBrowseResult] = useState<{ comments: RawComment[]; posts: PostSummary[]; total: number; accountId?: string } | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [hidingId, setHidingId] = useState<string | null>(null)

  function getAccountId() {
    const countryDef = COUNTRIES.find(c => c.code === selectedCountry)
    return accounts.find(a => countryDef?.match(a.name))?.id ?? null
  }

  async function handleAiScan() {
    const accountId = getAccountId()
    if (!accountId) { setError(`No account found for ${selectedCountry}`); return }
    setLoading(true); setMode('ai'); setAiResult(null); setError('')
    try {
      const res = await fetch('/api/meta/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accountId }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Scan failed')
      else setAiResult(data)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  async function handleBrowse() {
    const accountId = getAccountId()
    if (!accountId) { setError(`No account found for ${selectedCountry}`); return }
    setLoading(true); setMode('browse'); setBrowseResult(null); setError(''); setHiddenIds(new Set())
    try {
      const res = await fetch('/api/meta/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accountId }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Failed to load comments')
      else setBrowseResult(data)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  async function hideComment(commentId: string) {
    setHidingId(commentId)
    try {
      const res = await fetch('/api/meta/hide-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commentId }),
      })
      if (res.ok) setHiddenIds(prev => new Set([...prev, commentId]))
      else {
        const d = await res.json()
        setError(d.error ?? 'Failed to hide comment')
      }
    } finally { setHidingId(null) }
  }

  function handleAiDone(id: string) {
    setAiResult(prev => prev ? { ...prev, comments: prev.comments.filter(c => c.id !== id) } : prev)
  }

  const selectRow = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-3">
      <select
        value={selectedCountry}
        onChange={e => { setSelectedCountry(e.target.value); setAiResult(null); setBrowseResult(null); setError('') }}
        disabled={loading}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
      </select>
      <button
        onClick={handleBrowse}
        disabled={loading}
        className="border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
      >
        {loading && mode === 'browse' ? 'Loading…' : 'Browse all'}
      </button>
      <button
        onClick={handleAiScan}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
      >
        {loading && mode === 'ai' ? 'Scanning…' : 'AI Scan'}
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Comment Moderation</h2>
        <p className="text-sm text-gray-400 mt-1">Browse all comments or run an AI scan to flag negative ones.</p>
      </div>

      {selectRow}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">{mode === 'ai' ? 'Scanning for negative comments…' : 'Loading all comments…'}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Browse all results */}
      {browseResult && !loading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{browseResult.total}</span> comments across{' '}
              <span className="font-semibold text-gray-700">{browseResult.posts.length}</span> ad posts
            </p>
            {browseResult.posts.some(p => p.error) && (
              <span className="text-xs text-yellow-600">Some posts had errors (may be Instagram)</span>
            )}
          </div>

          {browseResult.total === 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">0 comments found. Post diagnostics:</p>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {browseResult.posts.map(p => (
                  <div key={p.postId} className="text-xs font-mono text-yellow-700 flex gap-2">
                    <span className="text-yellow-400">{p.count} comments</span>
                    <span>{p.postId}</span>
                    {p.error && <span className="text-red-400">{p.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {browseResult.comments.map(c => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 transition-opacity ${hiddenIds.has(c.id) ? 'opacity-40' : ''}`}
            >
              <p className="text-sm text-gray-800 leading-relaxed">{c.message}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">{c.from?.name ?? 'Unknown'}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 font-mono">
                <span>comment: {c.id}</span>
                <span>post: {c.postId}</span>
                {c.adId && (
                  <a
                    href={`https://adsmanager.facebook.com/adsmanager/manage/ads?act=${browseResult?.accountId?.replace('act_', '')}&selected_ad_ids=${c.adId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-600 underline"
                  >
                    Open ad ↗
                  </a>
                )}
              </div>
              <button
                onClick={() => hideComment(c.id)}
                disabled={hiddenIds.has(c.id) || hidingId === c.id}
                className="self-start bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg px-4 py-1.5 transition-colors"
              >
                {hiddenIds.has(c.id) ? 'Hidden ✓' : hidingId === c.id ? 'Hiding…' : 'Hide'}
              </button>
            </div>
          ))}
        </>
      )}

      {/* AI scan results */}
      {aiResult && !loading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Scanned <span className="font-semibold text-gray-700">{aiResult.scanned}</span> comments
              across <span className="font-semibold text-gray-700">{aiResult.posts}</span> posts
            </p>
            <span className={`text-sm font-semibold ${aiResult.comments.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {aiResult.comments.length > 0 ? `${aiResult.comments.length} negative found` : '✓ All clear'}
            </span>
          </div>
          {aiResult.debug && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700">{aiResult.debug}</div>
          )}
          {aiResult.comments.map(c => (
            <CommentCard key={c.id} comment={c} token={token} onDone={handleAiDone} />
          ))}
        </>
      )}
    </div>
  )
}
