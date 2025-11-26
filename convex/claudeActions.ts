// ==========================================
// CLAUDE API INTEGRATION
// ==========================================

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export const generateDailySummary = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY not set");
    }

    console.log("[generateDailySummary] Fetching risk data");

    // Get all risk scores
    const riskScores = await ctx.runQuery(internal.commodityQueries.getRiskScores, {});
    
    if (riskScores.length === 0) {
      throw new Error("No risk scores available - run calculateRiskScores first");
    }

    // Categorize by risk level
    const highRisk = riskScores.filter(s => s.riskScore >= 75);
    const mediumRisk = riskScores.filter(s => s.riskScore >= 60 && s.riskScore < 75);
    const topRisers = riskScores
      .filter(s => s.trendDirection === "rising")
      .slice(0, 5);

    // Create prompt for Claude
    const prompt = `You are a supply chain risk analyst. Analyze this commodity risk data and provide a concise daily summary.

DATA:
Total Commodities Tracked: ${riskScores.length}
High Risk (75+): ${highRisk.length}
Medium Risk (60-74): ${mediumRisk.length}

HIGH RISK COMMODITIES:
${highRisk.map(r => `- ${r.symbol}: Score ${r.riskScore}/100, Trend: ${r.trendDirection}, Percentile: ${r.pricePercentile.toFixed(1)}`).join('\n')}

TOP PRICE RISERS:
${topRisers.map(r => `- ${r.symbol}: Score ${r.riskScore}/100`).join('\n')}

Provide a summary in PLAIN TEXT (no markdown) with:

1. OVERALL RISK: State if risk is LOW, MEDIUM, HIGH, or CRITICAL
2. TOP CONCERNS: List 2-3 most concerning commodities and why
3. KEY FACTORS: Main drivers of current risk
4. RECOMMENDATIONS: 2-3 actionable steps for procurement teams

Keep under 250 words, professional tone.`;

    try {
      console.log("[generateDailySummary] Calling Claude API");

      const response = await fetch(CLAUDE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 800,
          messages: [{
            role: "user",
            content: prompt,
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.content[0].text;

      // Parse risk level
      const upperText = summary.toUpperCase();
      const riskLevel = 
        upperText.includes('CRITICAL') ? 'critical' :
        upperText.includes('HIGH') ? 'high' :
        upperText.includes('MEDIUM') ? 'medium' : 'low';

      // Extract key factors (simple parsing)
      const keyFactors = highRisk.length > 0 
        ? [`${highRisk.length} commodities in high-risk zone`, "Price volatility detected"]
        : ["Market conditions stable"];

      const recommendations = [
        "Monitor high-risk commodities daily",
        "Consider hedging strategies for top risers"
      ];

      // Store summary
      await ctx.runMutation(internal.commodityMutations.storeAiSummary, {
        summaryType: "daily",
        summary,
        riskLevel,
        keyFactors,
        recommendations,
        generatedAt: Date.now(),
      });

      console.log("[generateDailySummary] Summary generated successfully");
      
      return { success: true, summary, riskLevel };

    } catch (error) {
      console.error("[generateDailySummary] Error:", error);
      throw error;
    }
  },
});
