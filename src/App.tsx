import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Moderation from './pages/Moderation'
import Login from './pages/Login'

const queryClient = new QueryClient()

type Page = 'dashboard' | 'moderation'

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('seeds_token') ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<Page>('dashboard')

  async function handleLogin(password: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
      } else {
        sessionStorage.setItem('seeds_token', data.token)
        setToken(data.token)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('seeds_token')
    setToken('')
  }

  if (!token) {
    return <Login onLogin={handleLogin} error={error} loading={loading} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Layout page={page} onNavigate={setPage} onLogout={handleLogout}>
        {page === 'dashboard' && <Dashboard token={token} />}
        {page === 'moderation' && <Moderation token={token} />}
      </Layout>
    </QueryClientProvider>
  )
}
