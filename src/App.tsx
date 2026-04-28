import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

const queryClient = new QueryClient()

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('seeds_token') ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  if (!token) {
    return <Login onLogin={handleLogin} error={error} loading={loading} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard token={token} onLogout={() => {
        sessionStorage.removeItem('seeds_token')
        setToken('')
      }} />
    </QueryClientProvider>
  )
}
