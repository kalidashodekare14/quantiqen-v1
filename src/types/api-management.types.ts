export interface ApiKey {
  id: string
  name: string
  key: string
  tokenStatus: "Active" | "Expired"
  dailyUsage: number
  dailyLimit: number
  monthlyUsage: number
  monthlyLimit: number
  remainingRequests: number
  createdAt: string
  lastUsed: string
}

export interface ApiMeta {
  total: number
  active: number
  expired: number
}

export interface ApiManagementData {
  apiKeys: ApiKey[]
  meta: ApiMeta
}
