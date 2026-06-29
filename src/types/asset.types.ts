export interface Asset {
  id: string
  domain: string
  ipAddress: string
  assetType: string
  owner: string
  criticality: "Low" | "Medium" | "High" | "Critical"
  status: "Active" | "At Risk" | "Inactive"
  lastScan: string
}

export interface AssetMeta {
  total: number
  active: number
  atRisk: number
  inactive: number
}

export interface AssetsData {
  assets: Asset[]
  meta: AssetMeta
}
