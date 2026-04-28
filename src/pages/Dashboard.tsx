import { useState, useEffect } from 'react'
import { useAccounts, useInsights } from '../hooks/useMeta'
import AccountSelector from '../components/AccountSelector'
import MetricCard from '../components/MetricCard'
import SpendChart from '../components/SpendChart'
import CountryTable from '../components/CountryTable'
import type { DatePreset } from '../lib/types'
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils'

const DATE_OPTIONS: { label: string; value: DatePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last_7d' },
  { label: 'Last 14 days', value: 'last_14d' },
  { label: 'Last 30 days', value: 'last_30d' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
]

interface Props {
  token: string
  onLogout: () => void
}

export default function Dashboard({ token, onLogout }: Props) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d')

  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts(token)

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts(accounts.map((a) => a.id))
    }
  }, [accounts])
  const { data: insights = [], isLoading: loadingInsights } = useInsights(
    token,
    selectedAccounts,
    datePreset
  )

  const totals = insights.reduce(
    (acc, d) => ({
      spend: acc.spend + d.spend,
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  )

  const avgCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0
  const avgRoas =
    insights.length > 0
      ? insights.reduce((a, d) => a + d.roas, 0) / insights.length
      : 0
  const avgCtr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Seeds Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          {loadingAccounts ? (
            <div className="text-sm text-gray-400">Loading accounts…</div>
          ) : (
            <AccountSelector
              accounts={accounts}
              selected={selectedAccounts}
              onChange={setSelectedAccounts}
            />
          )}
        </aside>

        <main className="lg:col-span-3 flex flex-col gap-6">
          {selectedAccounts.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Select one or more ad accounts to see metrics
            </div>
          ) : loadingInsights ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Loading insights…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard label="Spend" value={formatCurrency(totals.spend)} />
                <MetricCard label="ROAS" value={avgRoas.toFixed(2)} />
                <MetricCard label="CPA" value={formatCurrency(avgCpa)} />
                <MetricCard label="Conversions" value={formatNumber(totals.conversions)} />
                <MetricCard label="Clicks" value={formatNumber(totals.clicks)} />
                <MetricCard label="CTR" value={formatPercent(avgCtr)} />
              </div>
              <SpendChart data={insights} />
              <CountryTable insights={insights} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
