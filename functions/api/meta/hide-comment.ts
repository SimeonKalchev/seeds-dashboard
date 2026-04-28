import { getToken, verifyToken, unauthorized } from '../../lib/auth'

interface Env {
  Meta_Seeds_Bot_Token: string
  SESSION_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const token = getToken(request)
  if (!token || !(await verifyToken(token, env.SESSION_SECRET))) {
    return unauthorized()
  }

  const { commentId } = await request.json<{ commentId: string }>()
  const metaToken = env.Meta_Seeds_Bot_Token

  const res = await fetch(`https://graph.facebook.com/v21.0/${commentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ is_hidden: 'true', access_token: metaToken }),
  })

  const data = await res.json()

  if (!res.ok) {
    return Response.json({ error: 'Failed to hide comment', details: data }, { status: 502 })
  }

  return Response.json({ success: true })
}
