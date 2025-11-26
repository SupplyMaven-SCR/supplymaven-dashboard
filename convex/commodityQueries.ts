// ==========================================
// COMMODITY QUERIES - DATABASE READS
// ==========================================

import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLatestPrice = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("commodity_prices")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .order("desc")
      .first();
  },
});

export const getAllLatestPrices = query({
  args: {},
  handler: async (ctx) => {
    const allPrices = await ctx.db
      .query("commodity_prices")
      .collect();

    // Get latest for each symbol
    const latestBySymbol = new Map();
    
    for (const price of allPrices) {
      if (!latestBySymbol.has(price.symbol) || 
          price.timestamp > latestBySymbol.get(price.symbol).timestamp) {
        latestBySymbol.set(price.symbol, price);
      }
    }

    return Array.from(latestBySymbol.values());
  },
});

export const getHistory = query({
  args: {
    symbol: v.string(),
    startTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("commodity_history")
      .withIndex("by_symbol_time", (q) => q.eq("symbol", args.symbol))
      .collect();

    let filtered = results;
    if (args.startTime) {
      filtered = filtered.filter(r => r.timestamp >= args.startTime!);
    }

    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  },
});

export const getRiskScores = query({
  args: {},
  handler: async (ctx) => {
    const allScores = await ctx.db
      .query("risk_scores")
      .collect();

    // Get latest for each symbol
    const latestBySymbol = new Map();
    
    for (const score of allScores) {
      if (!latestBySymbol.has(score.symbol) || 
          score.calculatedAt > latestBySymbol.get(score.symbol).calculatedAt) {
        latestBySymbol.set(score.symbol, score);
      }
    }

    return Array.from(latestBySymbol.values())
      .sort((a, b) => b.riskScore - a.riskScore);
  },
});

export const getHighRiskCommodities = query({
  args: { threshold: v.number() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("risk_scores")
      .collect();

    const latestBySymbol = new Map();
    
    for (const score of all) {
      if (!latestBySymbol.has(score.symbol) || 
          score.calculatedAt > latestBySymbol.get(score.symbol).calculatedAt) {
        latestBySymbol.set(score.symbol, score);
      }
    }

    return Array.from(latestBySymbol.values())
      .filter(s => s.riskScore >= args.threshold)
      .sort((a, b) => b.riskScore - a.riskScore);
  },
});

export const getLatestAiSummary = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("ai_summaries")
      .withIndex("by_type", (q) => q.eq("summaryType", "daily"))
      .order("desc")
      .first();
  },
});
