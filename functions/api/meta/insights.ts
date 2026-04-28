interface Env {
  Meta_Seeds_Bot_Token: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const token = env.Meta_Seeds_Bot_Token
  if (!token) {
    return Response.json({ error: 'Meta_Seeds_Bot_Token not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const accountIds = searchParams.get('account_ids')?.split(',') ?? []
  const datePreset = searchParams.get('date_preset') ?? 'last_30d'

  if (!accountIds.length) {
    return Response.json({ error: 'account_ids required' }, { status: 400 })
  }

  const fields = [
    'account_id',
    'account_name',
    'spend',
    'impressions',
    'clicks',
    'cpc',
    'cpm',
    'ctr',
    'actions',
    'cost_per_action_type',
    'purchase_roas',
  ].join(',')

  const results = await Promise.all(
    accountIds.map(async (id) => {
      const url = `https://graph.facebook.com/v21.0/${id}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${token}`
      const res = await fetch(url)
      return res.json()
    })
  )

  return Response.json({ data: results })
}
