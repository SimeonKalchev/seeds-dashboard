export function getPageId(postId: string): string {
  return postId.split('_')[0]
}

export async function getPageToken(pageId: string, systemToken: string): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${systemToken}`
  )
  const data = await res.json() as { access_token?: string; error?: { message: string } }
  return data.access_token ?? systemToken
}
