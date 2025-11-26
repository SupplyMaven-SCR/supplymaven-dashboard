import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  // Fetch data from Convex
  const latestPrices = useQuery(api.commodityQueries.getAllLatestPrices);
  const riskScores = useQuery(api.commodityQueries.getRiskScores);
  const aiSummary = useQuery(api.commodityQueries.getLatestAiSummary);

  // Combine prices with risk scores
  const commoditiesWithRisk = latestPrices?.map(price => {
    const risk = riskScores?.find(r => r.symbol === price.symbol);
    return { ...price, ...risk };
  });

  // Group by category
const grouped = commoditiesWithRisk?.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, any[]>);

  // Calculate stats
  const stats = {
    total: commoditiesWithRisk?.length || 0,
    highRisk: commoditiesWithRisk?.filter(c => (c.riskScore || 0) >= 75).length || 0,
    rising: commoditiesWithRisk?.filter(c => c.trendDirection === 'rising').length || 0,
    stable: commoditiesWithRisk?.filter(c => c.trendDirection === 'stable').length || 0,
  };

  if (!latestPrices || !riskScores) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-2">Loading commodity data...</div>
          <div className="text-sm text-gray-500">Connecting to Convex</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            SupplyMaven Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time commodity risk intelligence • {stats.total} commodities tracked
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Commodities" value={stats.total} color="gray" />
          <StatCard label="High Risk (≥75)" value={stats.highRisk} color="red" />
          <StatCard label="Rising Prices" value={stats.rising} color="orange" />
          <StatCard label="Stable" value={stats.stable} color="green" />
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                🤖 AI Market Analysis
              </h2>
              <RiskBadge level={aiSummary.riskLevel} />
            </div>
            <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-white p-4 rounded border border-gray-200">
              {aiSummary.summary}
            </div>
            <div className="mt-4 text-xs text-gray-600">
              Generated: {new Date(aiSummary.generatedAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Commodity Tables by Category */}
       {grouped && Object.entries(grouped).map(([category, items]) => (
  <CommodityTable key={category} category={category} items={items as any[]} />
))}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <div className="text-sm text-gray-600">
            Last updated: <span className="font-semibold">{new Date().toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Data refreshes automatically • Powered by Convex & Claude AI
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stats Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    gray: 'text-gray-900',
    red: 'text-red-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
    </div>
  );
}

// Risk Badge Component
function RiskBadge({ level }: { level: string }) {
  const badgeClasses = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${badgeClasses[level as keyof typeof badgeClasses] || badgeClasses.low}`}>
      {level.toUpperCase()} RISK
    </span>
  );
}

// Commodity Table Component
function CommodityTable({ category, items }: { category: string; items: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          {category.replace('_', ' ')}{' '}
          <span className="text-sm font-normal text-gray-500">
            ({items.length} commodities)
          </span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Commodity
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Risk Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item) => (
              <tr key={item.symbol} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{item.symbol}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{item.unit}</div>
                </td>
                <td className="px-6 py-4">
                  <TrendIndicator direction={item.trendDirection} />
                </td>
                <td className="px-6 py-4">
                  <RiskScore score={item.riskScore || 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Trend Indicator Component
function TrendIndicator({ direction }: { direction: string }) {
  const trends = {
    rising: { icon: '↑', color: 'text-red-600', label: 'Rising' },
    falling: { icon: '↓', color: 'text-green-600', label: 'Falling' },
    stable: { icon: '→', color: 'text-gray-400', label: 'Stable' },
  };

  const trend = trends[direction as keyof typeof trends] || trends.stable;

  return (
    <div className="flex flex-col items-center">
      <div className={`text-3xl leading-none ${trend.color}`}>{trend.icon}</div>
      <span className={`text-xs font-semibold mt-1 ${trend.color}`}>{trend.label}</span>
    </div>
  );
}

// Risk Score Component
function RiskScore({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 75) return { text: 'text-red-600', bg: 'bg-red-600' };
    if (score >= 60) return { text: 'text-orange-600', bg: 'bg-orange-600' };
    if (score >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-600' };
    return { text: 'text-green-600', bg: 'bg-green-600' };
  };

  const colors = getColor(score);

  return (
    <div className="flex items-center justify-end space-x-3">
      <div className={`text-lg font-bold ${colors.text}`}>{score}</div>
      <div className="w-24 bg-gray-200 rounded-full h-3 shadow-inner">
        <div
          className={`h-3 rounded-full transition-all shadow-sm ${colors.bg}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
