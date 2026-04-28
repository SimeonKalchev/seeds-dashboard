interface Env {
  META_ACCESS_TOKEN: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const token = env.META_ACCESS_TOKEN
  if (!token) {
    return Response.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 })
  }

  const url = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,currency,account_status&limit=100&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    return Response.json({ error: 'Meta API error', details: data }, { status: 502 })
  }

  return Response.json(data)
}
