// ==========================================
// CLEAN SANDBOX SCHEMA
// ==========================================
// Minimal schema with only commodity tracking tables

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store current commodity prices
  commodity_prices: defineTable({
    symbol: v.string(),
    name: v.string(),
    category: v.string(),
    price: v.number(),
    unit: v.string(),
    timestamp: v.number(),
    fetchedAt: v.number(),
  }).index("by_symbol", ["symbol"])
    .index("by_category", ["category"]),

  // Store 90-day historical data for risk calculations
  commodity_history: defineTable({
    symbol: v.string(),
    price: v.number(),
    timestamp: v.number(),
  }).index("by_symbol_time", ["symbol", "timestamp"]),

  // Store calculated risk scores (0-100)
  risk_scores: defineTable({
    symbol: v.string(),
    category: v.string(),
    riskScore: v.number(),
    pricePercentile: v.number(),
    volatilityScore: v.number(),
    trendDirection: v.string(),
    calculatedAt: v.number(),
  }).index("by_symbol", ["symbol"]),

  // Store FRED economic data
  fred_data: defineTable({
    seriesId: v.string(),
    seriesName: v.string(),
    value: v.number(),
    date: v.string(),
    timestamp: v.number(),
  }).index("by_series", ["seriesId"])
    .index("by_date", ["date"]),

  // Store Claude AI summaries
  ai_summaries: defineTable({
    summaryType: v.string(),
    category: v.optional(v.string()),
    summary: v.string(),
    riskLevel: v.string(),
    keyFactors: v.array(v.string()),
    recommendations: v.array(v.string()),
    generatedAt: v.number(),
  }).index("by_type", ["summaryType"]),

  // Track API calls for rate limiting
  api_logs: defineTable({
    apiName: v.string(),
    endpoint: v.string(),
    statusCode: v.number(),
    callCount: v.number(),
    lastCall: v.number(),
    errorMessage: v.optional(v.string()),
  }).index("by_api", ["apiName"]),
});
