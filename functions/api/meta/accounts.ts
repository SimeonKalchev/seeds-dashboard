import { getToken, verifyToken, unauthorized } from '../../lib/auth'

interface Env {
  Meta_Seeds_Bot_Token: string
  SESSION_SECRET: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const token = getToken(request)
  if (!token || !(await verifyToken(token, env.SESSION_SECRET))) {
    return unauthorized()
  }

  const metaToken = env.Meta_Seeds_Bot_Token
  if (!metaToken) {
    return Response.json({ error: 'Meta_Seeds_Bot_Token not configured' }, { status: 500 })
  }

  const url = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,currency,account_status&limit=100&access_token=${metaToken}`
  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    return Response.json({ error: 'Meta API error', details: data }, { status: 502 })
  }

  return Response.json(data)
}
