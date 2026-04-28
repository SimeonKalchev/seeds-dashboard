import { getToken, verifyToken, unauthorized } from '../../lib/auth'
import { getPageId, getPageToken } from '../../lib/meta'

interface Env {
  Meta_Seeds_Bot_Token: string
  SESSION_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const token = getToken(request)
  if (!token || !(await verifyToken(token, env.SESSION_SECRET))) {
    return unauthorized()
  }

  const { commentId, postId } = await request.json<{ commentId: string; postId: string }>()
  const systemToken = env.Meta_Seeds_Bot_Token

  // Hiding comments on page posts requires a page access token
  const pageId = getPageId(postId)
  const pageToken = await getPageToken(pageId, systemToken)

  const res = await fetch(`https://graph.facebook.com/v21.0/${commentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ is_hidden: 'true', access_token: pageToken }),
  })

  const data = await res.json()

  if (!res.ok) {
    return Response.json({ error: 'Failed to hide comment', details: data }, { status: 502 })
  }

  return Response.json({ success: true })
}
