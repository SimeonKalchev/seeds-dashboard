interface Props {
  onLogin: (password: string) => void
  error?: string
}

export default function Login({ onLogin, error }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
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
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
