const encoder = new TextEncoder()

async function getKey(secret: string, usage: 'sign' | 'verify') {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  )
}

export async function generateToken(secret: string): Promise<string> {
  const key = await getKey(secret, 'sign')
  const timestamp = Date.now().toString()
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp))
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return btoa(`${timestamp}.${sigHex}`)
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const decoded = atob(token)
    const [timestamp, sigHex] = decoded.split('.')
    if (!timestamp || !sigHex) return false

    const age = Date.now() - parseInt(timestamp)
    if (age > 24 * 60 * 60 * 1000) return false

    const key = await getKey(secret, 'verify')
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(timestamp))
  } catch {
    return false
  }
}

export function getToken(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
