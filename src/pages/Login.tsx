interface Props {
  onLogin: (password: string) => void
  error?: string
  loading?: boolean
}

export default function Login({ onLogin, error, loading }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value
    onLogin(password)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Seeds Dashboard</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            disabled={loading}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
