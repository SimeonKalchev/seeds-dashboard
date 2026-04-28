import type { AdAccount } from '../lib/types'

interface Props {
  accounts: AdAccount[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export default function AccountSelector({ accounts, selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    )
  }

  function toggleAll() {
    onChange(selected.length === accounts.length ? [] : accounts.map((a) => a.id))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Ad Accounts</h3>
        <button
          onClick={toggleAll}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
        >
          {selected.length === accounts.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {accounts.map((acc) => (
          <label
            key={acc.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1"
          >
            <input
              type="checkbox"
              checked={selected.includes(acc.id)}
              onChange={() => toggle(acc.id)}
              className="rounded accent-blue-500"
            />
            <span className="text-sm text-gray-700 truncate">{acc.name}</span>
            <span className="ml-auto text-xs text-gray-400">{acc.currency}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
