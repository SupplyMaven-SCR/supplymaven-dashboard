// ==========================================
// COMMODITY ACTIONS - FIXED
// ==========================================
// Handles API responses with nested "data" wrapper

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { ALL_SYMBOLS, getCommodityInfo } from "./commodities";

const COMMODITIES_API = "https://commodities-api.com/api";

// ==========================================
// FETCH LATEST PRICES (One at a time)
// ==========================================
export const fetchLatestPrices = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.COMMODITIES_API_KEY;
    
    if (!apiKey) {
      throw new Error("COMMODITIES_API_KEY not set");
    }

    console.log(`[fetchLatestPrices] Starting fetch for ${ALL_SYMBOLS.length} commodities`);
    
    const results = [];
    const errors = [];

    // Fetch ONE symbol at a time
    for (const symbol of ALL_SYMBOLS) {
      try {
        const url = `${COMMODITIES_API}/latest?access_key=${apiKey}&symbols=${symbol}`;
        
        console.log(`[fetchLatestPrices] Fetching ${symbol}...`);
        
        const response = await fetch(url);
        const apiResponse = await response.json();
        
        // CRITICAL FIX: API wraps everything in a "data" object
        // Response looks like: {"data": {"success": true, "rates": {...}}}
        const actualData = apiResponse.data;

        if (!actualData || !actualData.success) {
          throw new Error(`API returned unsuccessful response`);
        }

        // Get the rate and convert to price (1/rate)
        const rate = actualData.rates[symbol];
        
        if (!rate) {
          throw new Error(`No rate found for ${symbol}`);
        }
        
        const price = 1 / rate;
        
        const commodityInfo = getCommodityInfo(symbol);
        
        // Store in database
        await ctx.runMutation(internal.commodityMutations.storePrice, {
          symbol,
          name: commodityInfo.name,
          category: commodityInfo.category,
          price,
          unit: commodityInfo.unit,
          timestamp: actualData.timestamp * 1000,
          fetchedAt: Date.now(),
        });

        results.push({ symbol, price, status: "success" });
        console.log(`[fetchLatestPrices] ✓ ${symbol}: $${price.toFixed(2)}`);
        
        // Small delay between requests to be polite to API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[fetchLatestPrices] ✗ ${symbol}: ${errorMsg}`);
        errors.push({ symbol, error: errorMsg });
      }
    }

    console.log(`[fetchLatestPrices] Complete. Success: ${results.length}, Errors: ${errors.length}`);
    
    return {
      success: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    };
  },
});

// ==========================================
// FETCH HISTORICAL DATA
// ==========================================
export const fetchHistoricalData = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.COMMODITIES_API_KEY;
    
    if (!apiKey) {
      throw new Error("COMMODITIES_API_KEY not set");
    }

    // Get 30 days of data (free tier limitation - 90 days requires paid plan)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    console.log(`[fetchHistoricalData] Fetching ${startStr} to ${endStr} (30 days)`);
    
    let totalPoints = 0;
    const errors = [];

    // Fetch each symbol's history
    for (const symbol of ALL_SYMBOLS) {
      try {
        const url = `${COMMODITIES_API}/timeseries?access_key=${apiKey}&start_date=${startStr}&end_date=${endStr}&symbols=${symbol}`;
        
        console.log(`[fetchHistoricalData] Fetching ${symbol} history...`);
        
        const response = await fetch(url);
        const apiResponse = await response.json();
        
        // Handle nested data wrapper - timeseries endpoint wraps in "data"
        const actualData = apiResponse.data || apiResponse;

        if (!actualData.success) {
          console.error(`API response for ${symbol}:`, JSON.stringify(apiResponse));
          throw new Error(`API returned unsuccessful response for ${symbol}`);
        }

        if (!actualData.rates) {
          console.error(`No rates in response for ${symbol}:`, JSON.stringify(actualData));
          throw new Error(`No rates data for ${symbol}`);
        }

        // Store each day's data
        for (const [date, rates] of Object.entries(actualData.rates)) {
          const rate = (rates as any)[symbol];
          if (rate) {
            const price = 1 / rate;
            const timestamp = new Date(date).getTime();

            await ctx.runMutation(internal.commodityMutations.storeHistory, {
              symbol,
              price,
              timestamp,
            });

            totalPoints++;
          }
        }

        console.log(`[fetchHistoricalData] ✓ ${symbol}: ${Object.keys(actualData.rates || {}).length} days`);
        
        // Delay between symbols
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[fetchHistoricalData] ✗ ${symbol}: ${errorMsg}`);
        errors.push({ symbol, error: errorMsg });
      }
    }

    console.log(`[fetchHistoricalData] Complete. Stored ${totalPoints} data points`);
    
    return { dataPoints: totalPoints, errors: errors.length };
  },
});

// ==========================================
// CALCULATE RISK SCORES
// ==========================================
export const calculateRiskScores = action({
  args: {},
  handler: async (ctx) => {
    console.log("[calculateRiskScores] Starting calculation");

    const results = [];

    for (const symbol of ALL_SYMBOLS) {
      try {
        // Get latest price
        const latestPrice = await ctx.runQuery(internal.commodityQueries.getLatestPrice, { symbol });
        
        if (!latestPrice) {
          console.warn(`[calculateRiskScores] No price data for ${symbol}`);
          continue;
        }

        // Get 30-day history (adjusted for free tier)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const history = await ctx.runQuery(internal.commodityQueries.getHistory, {
          symbol,
          startTime: thirtyDaysAgo,
        });

        if (history.length < 10) {
          console.warn(`[calculateRiskScores] Insufficient history for ${symbol} (${history.length} points)`);
          continue;
        }

        // Calculate percentile
        const prices = history.map(h => h.price).sort((a, b) => a - b);
        const currentPriceRank = prices.filter(p => p <= latestPrice.price).length;
        const pricePercentile = (currentPriceRank / prices.length) * 100;

        // Calculate volatility
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        const volatilityScore = Math.min((stdDev / mean) * 100, 100);

        // Determine trend
        const recentPrices = prices.slice(-10);
        const avgRecent = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
        const trendDirection = 
          latestPrice.price > avgRecent * 1.05 ? "rising" :
          latestPrice.price < avgRecent * 0.95 ? "falling" : 
          "stable";

        // Overall risk score
        const riskScore = Math.round((pricePercentile * 0.6) + (volatilityScore * 0.4));

        // Store risk score
        await ctx.runMutation(internal.commodityMutations.storeRiskScore, {
          symbol,
          category: latestPrice.category,
          riskScore,
          pricePercentile,
          volatilityScore,
          trendDirection,
          calculatedAt: Date.now(),
        });

        results.push({ symbol, riskScore, trendDirection });
        console.log(`[calculateRiskScores] ✓ ${symbol}: ${riskScore}/100 (${trendDirection})`);

      } catch (error) {
        console.error(`[calculateRiskScores] ✗ ${symbol}:`, error);
      }
    }

    console.log(`[calculateRiskScores] Complete. Calculated ${results.length} scores`);
    return results;
  },
});
