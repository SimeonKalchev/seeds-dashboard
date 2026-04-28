import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ProcessedInsight } from '../lib/types'
import { formatCurrency } from '../lib/utils'

interface Props {
  data: ProcessedInsight[]
}

export default function SpendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.accountName.length > 20 ? d.accountName.slice(0, 20) + '…' : d.accountName,
    Spend: d.spend,
    ROAS: d.roas,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Spend & ROAS by Account</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="spend" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="roas" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, name) =>
              name === 'Spend' ? formatCurrency(Number(value)) : value
            }
          />
          <Legend />
          <Bar yAxisId="spend" dataKey="Spend" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="roas" dataKey="ROAS" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
