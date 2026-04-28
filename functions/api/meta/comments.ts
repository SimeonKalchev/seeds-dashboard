import { getToken, verifyToken, unauthorized } from '../../lib/auth'

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
  const metaToken = env.Meta_Seeds_Bot_Token

  // 1. Get ads
  const adsParams = new URLSearchParams({
    fields: 'id,creative{effective_object_story_id,object_story_id}',
    effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
    limit: '50',
    access_token: metaToken,
  })
  const adsRes = await fetch(`https://graph.facebook.com/v21.0/${accountId}/ads?${adsParams}`)
  const adsData = await adsRes.json() as { data: MetaAd[] }

  const postIds = [...new Set(
    (adsData.data ?? [])
      .map(ad => ad.creative?.effective_object_story_id ?? ad.creative?.object_story_id)
      .filter((id): id is string => Boolean(id))
  )]

  if (!postIds.length) {
    return Response.json({ comments: [], posts: [], error: 'No post IDs found' })
  }

  // 2. Fetch comments for all posts in parallel — return raw results per post
  const postResults = await Promise.all(
    postIds.slice(0, 20).map(async (postId) => {
      const params = new URLSearchParams({
        fields: 'id,message,from,created_time',
        filter: 'stream',
        limit: '25',
        access_token: metaToken,
      })
      const res = await fetch(`https://graph.facebook.com/v21.0/${postId}/comments?${params}`)
      const data = await res.json() as { data?: MetaComment[]; error?: { message: string } }
      return {
        postId,
        comments: (data.data ?? []).map(c => ({ ...c, postId })),
        error: data.error?.message,
      }
    })
  )

  const allComments = postResults.flatMap(r => r.comments).filter(c => c.message?.trim())

  return Response.json({
    comments: allComments,
    posts: postResults.map(r => ({ postId: r.postId, count: r.comments.length, error: r.error })),
    total: allComments.length,
  })
}
