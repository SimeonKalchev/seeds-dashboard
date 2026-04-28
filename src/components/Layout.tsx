type Page = 'dashboard' | 'moderation'

interface Props {
  page: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
  children: React.ReactNode
}

export default function Layout({ page, onNavigate, onLogout, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-0 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-gray-900 py-4">Seeds Dashboard</span>
          <nav className="flex">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                page === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('moderation')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                page === 'moderation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Moderation
            </button>
          </nav>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-400 hover:text-gray-600 font-medium py-4"
        >
          Log out
        </button>
      </header>
      {children}
    </div>
  )
}
