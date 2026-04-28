import { getToken, verifyToken, unauthorized } from '../../lib/auth'

interface Env {
  Meta_Seeds_Bot_Token: string
  SESSION_SECRET: string
  OPENAI_API_KEY: string
}

interface MetaAd {
  id: string
  creative?: { object_story_id?: string }
}

interface MetaComment {
  id: string
  message: string
  from?: { name: string; id: string }
  created_time: string
  postId?: string
}

interface Classification {
  id: string
  negative: boolean
  reason: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const token = getToken(request)
  if (!token || !(await verifyToken(token, env.SESSION_SECRET))) {
    return unauthorized()
  }

  const { accountId } = await request.json<{ accountId: string }>()
  const metaToken = env.Meta_Seeds_Bot_Token

  // 1. Get active/paused ads with creative info
  const adsUrl = `https://graph.facebook.com/v21.0/${accountId}/ads?fields=id,creative{object_story_id}&effective_status=["ACTIVE","PAUSED"]&limit=30&access_token=${metaToken}`
  const adsRes = await fetch(adsUrl)
  const adsData = await adsRes.json() as { data: MetaAd[] }

  // 2. Collect unique post IDs
  const postIds = [...new Set(
    (adsData.data ?? [])
      .map(ad => ad.creative?.object_story_id)
      .filter((id): id is string => Boolean(id))
  )]

  if (!postIds.length) {
    return Response.json({ comments: [], scanned: 0, posts: 0 })
  }

  // 3. Fetch comments for all posts in parallel
  const commentResults = await Promise.all(
    postIds.map(async (postId) => {
      const url = `https://graph.facebook.com/v21.0/${postId}/comments?fields=id,message,from,created_time&filter=stream&limit=50&access_token=${metaToken}`
      const res = await fetch(url)
      const data = await res.json() as { data: MetaComment[] }
      return (data.data ?? []).map(c => ({ ...c, postId }))
    })
  )

  const allComments = commentResults.flat().filter(c => c.message?.trim())

  if (!allComments.length) {
    return Response.json({ comments: [], scanned: 0, posts: postIds.length })
  }

  // 4. Classify with OpenAI
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a comment moderator for e-commerce ads selling health and wellness products.
Classify each comment as negative or not. Mark as NEGATIVE if it contains:
- Insults, offensive language, or harassment
- Strong complaints or negative product experiences
- Spam or irrelevant promotional content
- Requests to stop showing the ad
- Harmful misinformation about the product

Comments may be in Bulgarian, Greek, Romanian, Croatian, Slovenian, Slovak, Czech, or Hungarian. Understand them in context.

Return JSON: { "results": [{"id": "...", "negative": true/false, "reason": "short reason in English"}] }`,
        },
        {
          role: 'user',
          content: JSON.stringify(allComments.map(c => ({ id: c.id, message: c.message }))),
        },
      ],
    }),
  })

  const openaiData = await openaiRes.json() as { choices: [{ message: { content: string } }] }
  const parsed = JSON.parse(openaiData.choices[0].message.content) as { results: Classification[] }
  const classifications = parsed.results ?? []

  const negativeIds = new Set(classifications.filter(c => c.negative).map(c => c.id))
  const negativeComments = allComments
    .filter(c => negativeIds.has(c.id))
    .map(c => ({
      ...c,
      reason: classifications.find(cl => cl.id === c.id)?.reason ?? '',
    }))

  return Response.json({
    comments: negativeComments,
    scanned: allComments.length,
    posts: postIds.length,
  })
}
