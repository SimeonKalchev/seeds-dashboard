import { useQuery } from '@tanstack/react-query'
import type { AdAccount, Insight, ProcessedInsight } from '../lib/types'
import { processInsight } from '../lib/utils'

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function fetchAccounts(token: string): Promise<AdAccount[]> {
  const res = await fetch('/api/meta/accounts', { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Failed to fetch accounts')
  const data = await res.json()
  return data.data ?? []
}

async function fetchInsights(
  token: string,
  accountIds: string[],
  datePreset: string
): Promise<ProcessedInsight[]> {
  if (!accountIds.length) return []
  const params = new URLSearchParams({
    account_ids: accountIds.join(','),
    date_preset: datePreset,
  })
  const res = await fetch(`/api/meta/insights?${params}`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Failed to fetch insights')
  const data = await res.json()
  return (data.data as { data: Insight[] }[])
    .flatMap((r) => r.data ?? [])
    .map(processInsight)
}

export function useAccounts(token: string) {
  return useQuery({
    queryKey: ['accounts', token],
    queryFn: () => fetchAccounts(token),
  })
}

export function useInsights(token: string, accountIds: string[], datePreset: string) {
  return useQuery({
    queryKey: ['insights', token, accountIds, datePreset],
    queryFn: () => fetchInsights(token, accountIds, datePreset),
    enabled: accountIds.length > 0,
  })
}
