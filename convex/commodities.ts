// ==========================================
// COMMODITY SYMBOLS - VERIFIED WORKING
// ==========================================

export const COMMODITIES = {
  // Agriculture (7)
  COFFEE: { name: "Coffee", category: "agriculture", unit: "per lb" },
  WHEAT: { name: "Wheat", category: "agriculture", unit: "per bushel" },
  CORN: { name: "Corn", category: "agriculture", unit: "per bushel" },
  SOYBEAN: { name: "Soybeans", category: "agriculture", unit: "per bushel" },
  RICE: { name: "Rice", category: "agriculture", unit: "per cwt" },
  SUGAR: { name: "Sugar", category: "agriculture", unit: "per lb" },
  COTTON: { name: "Cotton", category: "agriculture", unit: "per lb" },
  
  // Precious Metals (4)
  XAU: { name: "Gold", category: "metals_precious", unit: "per troy ounce" },
  XAG: { name: "Silver", category: "metals_precious", unit: "per troy ounce" },
  XPT: { name: "Platinum", category: "metals_precious", unit: "per troy ounce" },
  XPD: { name: "Palladium", category: "metals_precious", unit: "per troy ounce" },
  
  // Industrial Metals (4)
  XCU: { name: "Copper", category: "metals_industrial", unit: "per lb" },
  ALU: { name: "Aluminum", category: "metals_industrial", unit: "per metric ton" },
  NI: { name: "Nickel", category: "metals_industrial", unit: "per metric ton" },
  ZNC: { name: "Zinc", category: "metals_industrial", unit: "per metric ton" },
  
  // Energy (3)
  BRENTOIL: { name: "Brent Crude Oil", category: "energy", unit: "per barrel" },
  WTIOIL: { name: "WTI Crude Oil", category: "energy", unit: "per barrel" },
  NG: { name: "Natural Gas", category: "energy", unit: "per MMBtu" },
};

export const ALL_SYMBOLS = Object.keys(COMMODITIES);

export function getCommodityInfo(symbol: string) {
  return COMMODITIES[symbol as keyof typeof COMMODITIES];
}
