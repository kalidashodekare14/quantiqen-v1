import assetsData from "@/mock-data/assets.json"
import { AssetsData } from "@/types/asset.types"

export const assetService = async (): Promise<AssetsData> => {
  return assetsData as unknown as AssetsData
}
