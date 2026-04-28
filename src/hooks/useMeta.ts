import { useQuery } from '@tanstack/react-query'
import type { AdAccount, Insight, ProcessedInsight } from '../lib/types'
import { processInsight } from '../lib/utils'

async function fetchAccounts(): Promise<AdAccount[]> {
  const res = await fetch('/api/meta/accounts')
  if (!res.ok) throw new Error('Failed to fetch accounts')
  const data = await res.json()
  return data.data ?? []
}

async function fetchInsights(
  accountIds: string[],
  datePreset: string
): Promise<ProcessedInsight[]> {
  if (!accountIds.length) return []
  const params = new URLSearchParams({
    account_ids: accountIds.join(','),
    date_preset: datePreset,
  })
  const res = await fetch(`/api/meta/insights?${params}`)
  if (!res.ok) throw new Error('Failed to fetch insights')
  const data = await res.json()
  return (data.data as { data: Insight[] }[])
    .flatMap((r) => r.data ?? [])
    .map(processInsight)
}

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts })
}

export function useInsights(accountIds: string[], datePreset: string) {
  return useQuery({
    queryKey: ['insights', accountIds, datePreset],
    queryFn: () => fetchInsights(accountIds, datePreset),
    enabled: accountIds.length > 0,
  })
}
