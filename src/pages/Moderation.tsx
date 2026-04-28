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

interface Props {
  token: string
}

export default function Moderation({ token }: Props) {
  const { data: accounts = [] } = useAccounts(token)
  const [selectedCountry, setSelectedCountry] = useState('BG')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    comments: Comment[]
    scanned: number
    posts: number
    debug?: string
  } | null>(null)
  const [error, setError] = useState('')

  async function handleScan() {
    const countryDef = COUNTRIES.find(c => c.code === selectedCountry)
    const account = accounts.find(a => countryDef?.match(a.name))

    if (!account) {
      setError(`No account found for ${selectedCountry}. Make sure it's connected.`)
      return
    }

    setScanning(true)
    setResult(null)
    setError('')

    try {
      const res = await fetch('/api/meta/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountId: account.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Scan failed')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setScanning(false)
    }
  }

  function handleDone(id: string) {
    setResult(prev =>
      prev ? { ...prev, comments: prev.comments.filter(c => c.id !== id) } : prev
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Comment Moderation</h2>
        <p className="text-sm text-gray-400 mt-1">
          Select a market, scan active ads, and review AI-flagged negative comments.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-3">
        <select
          value={selectedCountry}
          onChange={e => { setSelectedCountry(e.target.value); setResult(null); setError('') }}
          disabled={scanning}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-6 py-2.5 transition-colors"
        >
          {scanning ? 'Scanning…' : 'Scan'}
        </button>
      </div>

      {scanning && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Fetching ads and reading comments…</p>
          <p className="text-xs">This may take up to 30 seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && !scanning && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Scanned <span className="font-semibold text-gray-700">{result.scanned}</span> comments
              across <span className="font-semibold text-gray-700">{result.posts}</span> ad posts
            </p>
            <span className={`text-sm font-semibold ${result.comments.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {result.comments.length > 0
                ? `${result.comments.length} negative found`
                : '✓ All clear'}
            </span>
          </div>

          {result.debug && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700">
              {result.debug}
            </div>
          )}

          {result.comments.length > 0 && (
            <div className="flex flex-col gap-4">
              {result.comments.map(c => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  token={token}
                  onDone={handleDone}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
