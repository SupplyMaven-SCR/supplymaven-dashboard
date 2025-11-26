import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Update prices every hour
crons.interval(
  "fetch prices",
  { hours: 1 },
  internal.commodityActions.fetchLatestPrices
);

// Calculate risk scores every hour
crons.interval(
  "calculate risk",
  { hours: 1 },
  internal.commodityActions.calculateRiskScores
);

// AI summary once daily at 6am UTC
crons.daily(
  "daily summary",
  { hourUTC: 6, minuteUTC: 0 },
  internal.claudeActions.generateDailySummary
);

export default crons;