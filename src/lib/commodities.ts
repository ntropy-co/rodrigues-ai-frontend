// =============================================================================
// Types
// =============================================================================

export interface CommodityQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  lastUpdated: string
}

export interface CommodityHistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type CommoditySymbol =
  | 'ZS=F' // Soybean
  | 'ZC=F' // Corn
  | 'ZW=F' // Wheat
  | 'KC=F' // Coffee
  | 'ZL=F' // Soybean Oil
  | 'ZM=F' // Soybean Meal
  | 'SB=F' // Sugar
  | 'CT=F' // Cotton
  | 'LE=F' // Live Cattle

// =============================================================================
// Constants
// =============================================================================

export const COMMODITY_INFO: Record<
  CommoditySymbol,
  { name: string; unit: string }
> = {
  'ZS=F': { name: 'Soja', unit: 'USD/bushel' },
  'ZC=F': { name: 'Milho', unit: 'USD/bushel' },
  'ZW=F': { name: 'Trigo', unit: 'USD/bushel' },
  'KC=F': { name: 'Café', unit: 'USD/lb' },
  'ZL=F': { name: 'Óleo de Soja', unit: 'USD/lb' },
  'ZM=F': { name: 'Farelo de Soja', unit: 'USD/ton' },
  'SB=F': { name: 'Açúcar', unit: 'USD/lb' },
  'CT=F': { name: 'Algodão', unit: 'USD/lb' },
  'LE=F': { name: 'Boi Gordo', unit: 'USD/lb' }
}

export const COMMODITY_BACKEND_CODES: Record<CommoditySymbol, string> = {
  'ZS=F': 'SOJA',
  'ZC=F': 'MILHO',
  'ZW=F': 'TRIGO',
  'KC=F': 'CAFE',
  'ZL=F': 'OLEO_SOJA',
  'ZM=F': 'BSOJA',
  'SB=F': 'ACUCAR',
  'CT=F': 'ALGODAO',
  'LE=F': 'BOI'
}
