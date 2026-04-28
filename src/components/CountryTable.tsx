import type { ProcessedInsight } from '../lib/types'
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils'

const COUNTRY_MAP = [
  { country: 'BG', match: 'goldenseeds.bg' },
  { country: 'GR', match: 'goldenseeds.gr' },
  { country: 'RO', match: 'goldenseeds.ro' },
  { country: 'HR', match: 'zlatasemena.hr' },
  { country: 'SI', match: 'zlatasemena.com' },
  { country: 'SK', match: 'zlatasemena.sk' },
  { country: 'CZ', match: 'zlatasemena.cz' },
  { country: 'HU', match: 'goldenseeds.hu' },
]

function findInsight(insights: ProcessedInsight[], match: string) {
  return insights.find((i) =>
    i.accountName.toLowerCase().includes(match.toLowerCase())
  )
}

interface Props {
  insights: ProcessedInsight[]
}

export default function CountryTable({ insights }: Props) {
  const rows = COUNTRY_MAP.map(({ country, match }) => ({
    country,
    data: findInsight(insights, match),
  }))

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
              <th className="px-5 py-3 text-right">Spend</th>
              <th className="px-5 py-3 text-right">Conversions</th>
              <th className="px-5 py-3 text-right">CPA</th>
              <th className="px-5 py-3 text-right">ROAS</th>
              <th className="px-5 py-3 text-right">Clicks</th>
              <th className="px-5 py-3 text-right">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(({ country, data: d }) => (
              <tr key={country} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-semibold text-gray-900">{country}</td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {d ? formatCurrency(d.spend) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {d ? formatNumber(d.conversions) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {d ? formatCurrency(d.cpa) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {d ? d.roas.toFixed(2) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {d ? formatNumber(d.clicks) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {d ? formatPercent(d.ctr) : '—'}
                </td>
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
