import { generateToken } from '../../lib/auth'

interface Env {
  APP_PASSWORD: string
  SESSION_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const { password } = await request.json<{ password: string }>()

  if (!password || password !== env.APP_PASSWORD) {
    return Response.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await generateToken(env.SESSION_SECRET)
  return Response.json({ token })
}
