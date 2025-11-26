# 🚀 NEW CLEAN SANDBOX - Setup Guide

## 📁 What You Got

7 clean, simple files:
1. **schema.ts** - 6 database tables
2. **commodities.ts** - 18 commodity symbols
3. **commodityActions.ts** - Fetch prices, history, calculate risk
4. **commodityMutations.ts** - Store data
5. **commodityQueries.ts** - Read data
6. **fredActions.ts** - FRED economic data
7. **claudeActions.ts** - AI summaries

## 🎯 Key Improvements

✅ Fetches ONE commodity at a time (no more 400 errors!)
✅ Detailed logging so you see what's happening
✅ Simple structure - easy to understand
✅ FRED integration included
✅ Claude API for AI summaries

## 📦 Installation Steps

### Step 1: Create New Convex Project

```powershell
# Create new folder
mkdir supplymaven-clean
cd supplymaven-clean

# Initialize Convex
npx convex dev
```

This creates a new Convex deployment and `.env.local` file.

### Step 2: Add Files

Copy all 7 files from the `NEW_SANDBOX` folder into your `convex/` folder:

```
supplymaven-clean/
├── convex/
│   ├── schema.ts
│   ├── commodities.ts
│   ├── commodityActions.ts
│   ├── commodityMutations.ts
│   ├── commodityQueries.ts
│   ├── fredActions.ts
│   └── claudeActions.ts
```

### Step 3: Add Environment Variables

Go to your new Convex dashboard → Settings → Environment Variables

Add these 3 keys:

```
COMMODITIES_API_KEY = your_commodities_api_key
FRED_API_KEY = your_fred_api_key
CLAUDE_API_KEY = your_anthropic_api_key
```

**Get API Keys:**
- Commodities API: https://commodities-api.com (free tier)
- FRED API: https://fred.stlouisfed.org/docs/api/api_key.html (free)
- Claude API: https://console.anthropic.com ($5 free credit)

### Step 4: Deploy

```powershell
npx convex dev
```

Wait for deployment to complete. You should see "✓ Deployed" with no errors.

## 🎬 Testing - Step by Step

### Test 1: Fetch Latest Prices (2 minutes)

```powershell
npx convex run commodityActions:fetchLatestPrices
```

**What happens:**
- Fetches all 18 commodities ONE AT A TIME
- Takes about 1-2 minutes
- You'll see detailed logs for each symbol

**Expected output:**
```
✓ COFFEE: $1.23
✓ WHEAT: $5.67
✓ XAU: $2045.50
...
Complete. Success: 18, Errors: 0
```

**Verify:**
- Go to Dashboard → Data → commodity_prices
- Should see 18 rows

### Test 2: Fetch Historical Data (5-10 minutes)

```powershell
npx convex run commodityActions:fetchHistoricalData
```

**What happens:**
- Fetches 90 days of data for each commodity
- Takes 5-10 minutes (API rate limiting)
- You'll see progress for each symbol

**Expected output:**
```
✓ COFFEE: 90 days
✓ WHEAT: 90 days
...
Complete. Stored 1620 data points
```

**Verify:**
- Go to Dashboard → Data → commodity_history
- Should see ~1,600 rows (18 commodities × 90 days)

### Test 3: Calculate Risk Scores (30 seconds)

```powershell
npx convex run commodityActions:calculateRiskScores
```

**What happens:**
- Calculates 0-100 risk score for each commodity
- Based on 90-day percentiles

**Expected output:**
```
✓ COFFEE: 67/100 (rising)
✓ WHEAT: 45/100 (stable)
✓ XAU: 82/100 (rising)
...
Complete. Calculated 18 scores
```

**Verify:**
- Go to Dashboard → Data → risk_scores
- Should see 18 rows with scores 0-100

### Test 4: FRED Economic Data (1 minute)

```powershell
npx convex run fredActions:fetchFredData
```

**What happens:**
- Fetches 8 economic indicators from FRED
- Producer price indexes, industrial production

**Expected output:**
```
✓ WPUFD4: 245.6
✓ WPU101: 189.3
...
Complete. Success: 8, Errors: 0
```

**Verify:**
- Go to Dashboard → Data → fred_data
- Should see 8 rows

### Test 5: AI Summary (10 seconds)

```powershell
npx convex run claudeActions:generateDailySummary
```

**What happens:**
- Sends risk data to Claude
- Gets AI-generated summary

**Expected output:**
```
Summary generated successfully
```

**Verify:**
- Go to Dashboard → Data → ai_summaries
- Should see 1 row with AI text

## 🔄 Automation (Optional)

Create `convex/crons.ts` to run automatically:

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Hourly updates
crons.interval(
  "fetch prices",
  { hours: 1 },
  internal.commodityActions.fetchLatestPrices
);

crons.interval(
  "calculate risk",
  { hours: 1 },
  internal.commodityActions.calculateRiskScores
);

// Daily updates
crons.daily(
  "AI summary",
  { hourUTC: 6, minuteUTC: 0 },
  internal.claudeActions.generateDailySummary
);

crons.daily(
  "FRED data",
  { hourUTC: 10, minuteUTC: 0 },
  internal.fredActions.fetchFredData
);

export default crons;
```

## 🔍 Troubleshooting

### "COMMODITIES_API_KEY not set"
→ Add it in Convex Dashboard → Settings → Environment Variables

### "400 Bad Request"
→ This shouldn't happen anymore (we fetch one at a time)
→ If it does, check which symbol failed in the logs

### "No risk scores available"
→ Run fetchLatestPrices first
→ Then fetchHistoricalData
→ Then calculateRiskScores

### "Insufficient history"
→ Wait for fetchHistoricalData to complete
→ Need at least 10 data points per commodity

## 📊 What's in the Database

After setup, you'll have:
- **commodity_prices**: 18 rows (current prices)
- **commodity_history**: ~1,600 rows (90 days × 18 commodities)
- **risk_scores**: 18 rows (0-100 scores)
- **fred_data**: 8 rows (economic indicators)
- **ai_summaries**: 1 row (AI analysis)

## 🎉 Next Steps

1. Build a React dashboard to display the data
2. Use `useQuery` to fetch prices and risk scores
3. Display AI summary on homepage
4. Add charts showing historical trends
5. Create alerts for high-risk commodities

## 💰 Cost Estimate

- Commodities API: ~24 calls/day × 30 = 720/month (free tier: 100, paid: $9.99)
- FRED API: Free unlimited
- Claude API: ~$0.30/month (3 summaries/day)
- **Total: ~$10/month**

## 🚀 You're Ready!

Start with Test 1 and work your way through. Each test builds on the previous one.

Let me know if you hit any issues!
