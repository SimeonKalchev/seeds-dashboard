import { getToken, verifyToken, unauthorized } from '../../lib/auth'
import { getPageId, getPageToken } from '../../lib/meta'

interface Env {
  Meta_Seeds_Bot_Token: string
  SESSION_SECRET: string
}

interface MetaAd {
  id: string
  creative?: { effective_object_story_id?: string; object_story_id?: string }
}

interface MetaComment {
  id: string
  message: string
  from?: { name: string; id: string }
  created_time: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const token = getToken(request)
  if (!token || !(await verifyToken(token, env.SESSION_SECRET))) {
    return unauthorized()
  }

  const { accountId } = await request.json<{ accountId: string }>()
  const systemToken = env.Meta_Seeds_Bot_Token

  // 1. Get ads
  const adsParams = new URLSearchParams({
    fields: 'id,creative{effective_object_story_id,object_story_id}',
    effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
    limit: '50',
    access_token: systemToken,
  })
  const adsRes = await fetch(`https://graph.facebook.com/v21.0/${accountId}/ads?${adsParams}`)
  const adsData = await adsRes.json() as { data: MetaAd[] }

  // Build map: postId → adId
  const postToAd: Record<string, string> = {}
  for (const ad of adsData.data ?? []) {
    const postId = ad.creative?.effective_object_story_id ?? ad.creative?.object_story_id
    if (postId) postToAd[postId] = ad.id
  }

  const postIds = Object.keys(postToAd)

  if (!postIds.length) {
    return Response.json({ comments: [], posts: [], total: 0 })
  }

  // 2. Get page tokens
  const pageIds = [...new Set(postIds.map(getPageId))]
  const pageTokenMap: Record<string, string> = {}
  await Promise.all(
    pageIds.map(async (pageId) => {
      pageTokenMap[pageId] = await getPageToken(pageId, systemToken)
    })
  )

  // 3. Fetch comments using page token
  const postResults = await Promise.all(
    postIds.slice(0, 20).map(async (postId) => {
      const pageToken = pageTokenMap[getPageId(postId)] ?? systemToken
      const params = new URLSearchParams({
        fields: 'id,message,from,created_time',
        filter: 'stream',
        limit: '25',
        access_token: pageToken,
      })
      const res = await fetch(`https://graph.facebook.com/v21.0/${postId}/comments?${params}`)
      const data = await res.json() as { data?: MetaComment[]; error?: { message: string } }
      return {
        postId,
        adId: postToAd[postId],
        comments: (data.data ?? []).map(c => ({ ...c, postId, adId: postToAd[postId] })),
        error: data.error?.message,
      }
    })
  )

  const allComments = postResults.flatMap(r => r.comments).filter(c => c.message?.trim())

  return Response.json({
    comments: allComments,
    posts: postResults.map(r => ({ postId: r.postId, adId: r.adId, count: r.comments.length, error: r.error })),
    total: allComments.length,
    accountId,
  })
}
