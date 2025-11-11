type Period = 'weekly' | 'monthly'
type DataRecord = {
  date: Date
  amount: number
}

interface PackageChartData {
  name: string
  description?: string
  version?: string
  homepage?: string
  total: number
  downloads: Record<string, number>
  color: string
}