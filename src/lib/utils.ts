import type { Insight, ProcessedInsight } from './types'

export function processInsight(insight: Insight): ProcessedInsight {
  const conversions =
    insight.actions?.find((a) => a.action_type === 'purchase')?.value ?? '0'
  const roas =
    insight.purchase_roas?.find((r) => r.action_type === 'omni_purchase')
      ?.value ?? '0'
  const cpa =
    insight.cost_per_action_type?.find((c) => c.action_type === 'purchase')
      ?.value ?? '0'

  return {
    accountId: insight.account_id,
    accountName: insight.account_name,
    spend: parseFloat(insight.spend) || 0,
    impressions: parseInt(insight.impressions) || 0,
    clicks: parseInt(insight.clicks) || 0,
    cpc: parseFloat(insight.cpc) || 0,
    cpm: parseFloat(insight.cpm) || 0,
    ctr: parseFloat(insight.ctr) || 0,
    conversions: parseFloat(conversions) || 0,
    cpa: parseFloat(cpa) || 0,
    roas: parseFloat(roas) || 0,
    dateStart: insight.date_start,
    dateStop: insight.date_stop,
  }
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    value
  )
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}
