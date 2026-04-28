import { useState } from 'react'
import type { ProcessedInsight } from '../lib/types'
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils'

const COUNTRY_MAP: { country: string; match: (name: string) => boolean }[] = [
  { country: 'BG', match: (n) => n.toLowerCase().includes('goldenseeds bg') },
  { country: 'GR', match: (n) => n.toLowerCase().includes('goldenseeds.gr') },
  { country: 'RO', match: (n) => n.toLowerCase().includes('goldenseeds.ro') },
  { country: 'HR', match: (n) => n.toLowerCase().includes('zlatasemena.com.hr') },
  { country: 'SI', match: (n) => n.toLowerCase() === 'zlatasemena.com' },
  { country: 'SK', match: (n) => n.toLowerCase().includes('zlatasemena.sk') },
  { country: 'CZ', match: (n) => n.toLowerCase().includes('zlatasemena.cz') },
  { country: 'HU', match: (n) => n.toLowerCase().includes('goldenseends') },
]

type SortKey = 'spend' | 'conversions' | 'cpa' | 'roas' | 'clicks' | 'ctr'
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'spend', label: 'Spend' },
  { key: 'conversions', label: 'Conversions' },
  { key: 'cpa', label: 'CPA' },
  { key: 'roas', label: 'ROAS' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
]

function getMetric(d: ProcessedInsight | undefined, key: SortKey): number {
  if (!d) return -Infinity
  return { spend: d.spend, conversions: d.conversions, cpa: d.cpa, roas: d.roas, clicks: d.clicks, ctr: d.ctr }[key]
}

interface Props {
  insights: ProcessedInsight[]
}

export default function CountryTable({ insights }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null)

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' }
      if (prev.dir === 'desc') return { key, dir: 'asc' }
      return null
    })
  }

  const rows = COUNTRY_MAP.map(({ country, match }) => ({
    country,
    data: insights.find((i) => match(i.accountName)),
  }))

  const sortedRows = sort
    ? [...rows].sort((a, b) => {
        const va = getMetric(a.data, sort.key)
        const vb = getMetric(b.data, sort.key)
        return sort.dir === 'desc' ? vb - va : va - vb
      })
    : rows

  const totals = rows.reduce(
    (acc, { data: d }) => ({
      spend: acc.spend + (d?.spend ?? 0),
      conversions: acc.conversions + (d?.conversions ?? 0),
      clicks: acc.clicks + (d?.clicks ?? 0),
      impressions: acc.impressions + (d?.impressions ?? 0),
      roasSum: acc.roasSum + (d ? d.roas : 0),
      roasCount: acc.roasCount + (d ? 1 : 0),
    }),
    { spend: 0, conversions: 0, clicks: 0, impressions: 0, roasSum: 0, roasCount: 0 }
  )

  const totalCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0
  const totalRoas = totals.roasCount > 0 ? totals.roasSum / totals.roasCount : 0
  const totalCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0

  function sortIcon(key: SortKey) {
    if (!sort || sort.key !== key) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-500 ml-1">{sort.dir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Country Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Country</th>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-5 py-3 text-right cursor-pointer select-none hover:text-gray-600 transition-colors"
                >
                  {label}{sortIcon(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedRows.map(({ country, data: d }) => (
              <tr key={country} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-semibold text-gray-900">{country}</td>
                <td className="px-5 py-3 text-right text-gray-700">{d ? formatCurrency(d.spend) : '—'}</td>
                <td className="px-5 py-3 text-right text-gray-700">{d ? formatNumber(d.conversions) : '—'}</td>
                <td className="px-5 py-3 text-right text-gray-700">{d ? formatCurrency(d.cpa) : '—'}</td>
                <td className="px-5 py-3 text-right text-gray-700">{d ? d.roas.toFixed(2) : '—'}</td>
                <td className="px-5 py-3 text-right text-gray-700">{d ? formatNumber(d.clicks) : '—'}</td>
                <td className="px-5 py-3 text-right text-gray-700">{d ? formatPercent(d.ctr) : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold text-gray-900 border-t-2 border-gray-200">
              <td className="px-5 py-3">Total</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totals.spend)}</td>
              <td className="px-5 py-3 text-right">{formatNumber(totals.conversions)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalCpa)}</td>
              <td className="px-5 py-3 text-right">{totalRoas.toFixed(2)}</td>
              <td className="px-5 py-3 text-right">{formatNumber(totals.clicks)}</td>
              <td className="px-5 py-3 text-right">{formatPercent(totalCtr)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
