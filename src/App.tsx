import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

const queryClient = new QueryClient()

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? 'P@ssW0rd123!'

export default function App() {
  const [authed, setAuthed] = useState(() => {
    return sessionStorage.getItem('seeds_authed') === 'true'
  })
  const [error, setError] = useState('')

  function handleLogin(password: string) {
    if (password === APP_PASSWORD) {
      sessionStorage.setItem('seeds_authed', 'true')
      setAuthed(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  if (!authed) {
    return <Login onLogin={handleLogin} error={error} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
