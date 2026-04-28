export interface AdAccount {
  id: string
  name: string
  currency: string
  account_status: number
}

export interface Insight {
  account_id: string
  account_name: string
  spend: string
  impressions: string
  clicks: string
  cpc: string
  cpm: string
  ctr: string
  actions?: Array<{ action_type: string; value: string }>
  cost_per_action_type?: Array<{ action_type: string; value: string }>
  purchase_roas?: Array<{ action_type: string; value: string }>
  date_start: string
  date_stop: string
}

export interface ProcessedInsight {
  accountId: string
  accountName: string
  spend: number
  impressions: number
  clicks: number
  cpc: number
  cpm: number
  ctr: number
  conversions: number
  cpa: number
  roas: number
  dateStart: string
  dateStop: string
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'last_month'
  | 'this_month'
