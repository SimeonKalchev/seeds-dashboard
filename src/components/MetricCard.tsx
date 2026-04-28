interface Props {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function MetricCard({ label, value, sub, trend }: Props) {
  const trendColor =
    trend === 'up'
      ? 'text-green-500'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-gray-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
      {sub && <span className={`text-xs ${trendColor}`}>{sub}</span>}
    </div>
  )
}
