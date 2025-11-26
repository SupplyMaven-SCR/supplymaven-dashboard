// ==========================================
// COMMODITY MUTATIONS - DATABASE WRITES
// ==========================================

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const storePrice = mutation({
  args: {
    symbol: v.string(),
    name: v.string(),
    category: v.string(),
    price: v.number(),
    unit: v.string(),
    timestamp: v.number(),
    fetchedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("commodity_prices", args);
  },
});

export const storeHistory = mutation({
  args: {
    symbol: v.string(),
    price: v.number(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("commodity_history")
      .withIndex("by_symbol_time", (q) => 
        q.eq("symbol", args.symbol).eq("timestamp", args.timestamp)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("commodity_history", args);
  },
});

export const storeRiskScore = mutation({
  args: {
    symbol: v.string(),
    category: v.string(),
    riskScore: v.number(),
    pricePercentile: v.number(),
    volatilityScore: v.number(),
    trendDirection: v.string(),
    calculatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("risk_scores", args);
  },
});

export const storeFredData = mutation({
  args: {
    seriesId: v.string(),
    seriesName: v.string(),
    value: v.number(),
    date: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("fred_data", args);
  },
});

export const storeAiSummary = mutation({
  args: {
    summaryType: v.string(),
    category: v.optional(v.string()),
    summary: v.string(),
    riskLevel: v.string(),
    keyFactors: v.array(v.string()),
    recommendations: v.array(v.string()),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ai_summaries", args);
  },
});
