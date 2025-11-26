// ==========================================
// FRED API INTEGRATION
// ==========================================
// Federal Reserve Economic Data

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const FRED_API = "https://api.stlouisfed.org/fred";

// Key FRED series for supply chain monitoring
const FRED_SERIES = {
  // Producer Price Indexes
  "WPUFD4": "PPI - Food",
  "WPU101": "PPI - Metals",
  "WPU0612": "PPI - Crude Petroleum",
  "PCU325325": "PPI - Plastics & Resins",
  
  // Industrial Production
  "IPMAN": "Industrial Production - Manufacturing",
  "IPCONGD": "Industrial Production - Consumer Goods",
  
  // Commodity Prices
  "PPIACO": "PPI - All Commodities",
  "PPIIDC": "PPI - Industrial Commodities",
};

export const fetchFredData = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.FRED_API_KEY;
    
    if (!apiKey) {
      throw new Error("FRED_API_KEY not set");
    }

    console.log(`[fetchFredData] Fetching ${Object.keys(FRED_SERIES).length} series`);
    
    const results = [];
    const errors = [];

    for (const [seriesId, seriesName] of Object.entries(FRED_SERIES)) {
      try {
        // Get latest observation
        const url = `${FRED_API}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
        
        console.log(`[fetchFredData] Fetching ${seriesId}...`);
        
        const response = await fetch(url);
        const data = await response.json();

        if (!data.observations || data.observations.length === 0) {
          throw new Error(`No data for ${seriesId}`);
        }

        const observation = data.observations[0];
        const value = parseFloat(observation.value);

        await ctx.runMutation(internal.commodityMutations.storeFredData, {
          seriesId,
          seriesName,
          value,
          date: observation.date,
          timestamp: new Date(observation.date).getTime(),
        });

        results.push({ seriesId, value, date: observation.date });
        console.log(`[fetchFredData] ✓ ${seriesId}: ${value}`);
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[fetchFredData] ✗ ${seriesId}: ${errorMsg}`);
        errors.push({ seriesId, error: errorMsg });
      }
    }

    console.log(`[fetchFredData] Complete. Success: ${results.length}, Errors: ${errors.length}`);
    
    return { success: results.length, errors: errors.length, results };
  },
});
