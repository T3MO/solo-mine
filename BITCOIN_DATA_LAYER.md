# Real-Time Bitcoin Data Layer

Live network stats that make your platform feel alive and ensure calculations use current market conditions.

## Features

- **Live Price Data** - BTC/USD with 24h change from CoinGecko/CoinCap
- **Network Statistics** - Difficulty, block height, hashrate from Mempool.space
- **Fee Estimator** - Real-time fee recommendations
- **Smart Caching** - 60s cache with stale-while-revalidate
- **Fallback Strategy** - Multiple data sources for reliability
- **Edge Runtime** - Low-latency API responses

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  CoinGecko API  │────▶│                  │     │                 │
└─────────────────┘     │   Next.js Edge   │     │   React Client  │
┌─────────────────┐     │   API Route      │────▶│   Components    │
│  Mempool.space  │────▶│   /api/bitcoin   │     │                 │
└─────────────────┘     │                  │     │                 │
┌─────────────────┐     │  Cache: 60s      │     │  Cache: 30s     │
│  CoinCap API    │────▶│  Stale: 300s     │     │  LocalStorage   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Quick Start

### 1. Add to Layout

Include the `LiveTicker` in your root layout for sitewide visibility:

```tsx
// app/layout.tsx
import { LiveTicker } from "@/components/data/live-ticker";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LiveTicker />
        {children}
      </body>
    </html>
  );
}
```

### 2. Use in Components

```tsx
import { useBitcoinData, useLiveProfitability } from "@/hooks/useLiveProfitability";

// Basic usage
function MyComponent() {
  const { data, loading, error } = useBitcoinData(60000);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>BTC: ${data?.price.usd}</div>;
}

// Profitability calculation
function ProfitabilityCalculator({ device }) {
  const { result, usingLiveData, priceChange, recalculate } = useLiveProfitability({
    hashrate: device.hashrateThs,
    powerConsumption: device.powerWatts,
    electricityRate: 0.12,
  });

  return (
    <div>
      {priceChange && (
        <div className="alert">
          Price changed {priceChange.toFixed(1)}%! 
          <button onClick={recalculate}>Recalculate</button>
        </div>
      )}
      
      <div>Daily Profit: ${result?.dailyProfit.toFixed(2)}</div>
      {usingLiveData && <span>Using live data</span>}
    </div>
  );
}
```

## Components

### LiveTicker

Fixed header ticker showing key network stats.

```tsx
<LiveTicker />
```

**Features:**
- Price flash animation on significant changes
- Click to open detailed NetworkStatusModal
- Mobile-responsive horizontal scroll
- Auto-refresh every 60 seconds

### NetworkStatusModal

Detailed network information overlay.

```tsx
<NetworkStatusModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  data={bitcoinData}
/>
```

**Displays:**
- Price with 24h sparkline chart
- Network difficulty & hashrate
- Block height & next adjustment
- Halving countdown progress bar
- Mempool congestion visualization
- Fee recommendations

### PriceAlertBanner

Contextual alerts based on market conditions.

```tsx
<PriceAlertBanner />
```

**Triggers:**
- Price pump (>10% in 24h)
- Price drop (<-10% in 24h)
- Difficulty drop (<-2%)
- Halving approaching (<60 days)

**Features:**
- Auto-dismisses after 24h
- Dismiss state stored in localStorage
- Action buttons to relevant pages

### MempoolFeeEstimator

Standalone fee calculator.

```tsx
<MempoolFeeEstimator />
// or compact version:
<CompactMempoolFee />
```

**Features:**
- 4 fee tiers (Fastest, Standard, Slow, Economy)
- 24h fee history chart
- Transaction cost calculator
- Pro tips for saving on fees

## API Routes

### GET /api/bitcoin

Returns unified Bitcoin data with smart caching.

**Response:**
```json
{
  "price": {
    "usd": 67420.50,
    "change24h": 2.4,
    "change24hUsd": 1582.50,
    "lastUpdated": 1707000000000
  },
  "network": {
    "difficulty": 83.2,
    "difficultyChange": 5.1,
    "blockHeight": 890123,
    "blocksUntilAdjustment": 450,
    "adjustmentETA": "2024-02-15T00:00:00.000Z",
    "hashrate": 642.5,
    "mempoolSize": 45,
    "mempoolTxs": 125000,
    "congestionLevel": "medium",
    "lastUpdated": 1707000000000
  },
  "fees": {
    "fastestFee": 50,
    "halfHourFee": 30,
    "hourFee": 20,
    "economyFee": 10,
    "minimumFee": 5,
    "lastUpdated": 1707000000000
  },
  "economics": {
    "blockSubsidy": 3.125,
    "nextHalving": {
      "blockHeight": 840000,
      "blocksRemaining": 125000,
      "estimatedDate": "2024-04-15T00:00:00.000Z"
    },
    "dailyIssuance": 450,
    "lastUpdated": 1707000000000
  }
}
```

**Cache Headers:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

## Hooks

### useBitcoinData(refreshInterval?)

Fetches and caches all Bitcoin data.

```tsx
const { data, loading, error, refetch, isStale } = useBitcoinData(60000);
```

**Returns:**
- `data` - UnifiedBitcoinData or null
- `loading` - Boolean loading state
- `error` - Error message or null
- `refetch` - Manual refresh function
- `isStale` - True if data > 5 minutes old

### useLiveProfitability(params)

Calculates mining profitability with live data.

```tsx
const { 
  result, 
  loading, 
  error, 
  usingLiveData,
  priceChange,
  recalculate 
} = useLiveProfitability({
  hashrate: 600, // TH/s
  powerConsumption: 150, // Watts
  electricityRate: 0.12, // $/kWh
  btcPrice?: 65000, // Optional override
  difficulty?: 83e12, // Optional override
}, 60000);
```

**Returns:**
- `result` - ProfitabilityResult or null
  - `dailyRevenue` - USD
  - `dailyCost` - USD
  - `dailyProfit` - USD
  - `monthlyProfit` - USD
  - `yearlyProfit` - USD
  - `breakEvenDays` - number or null
  - `roi` - percentage
  - `isProfitable` - boolean
- `usingLiveData` - True if using live API data
- `priceChange` - Percent if price changed >5%
- `recalculate` - Force recalculation

### usePriceAlert(threshold?)

Monitors for significant price movements.

```tsx
const { alert, dismiss } = usePriceAlert(0.1); // 10% threshold
```

## Data Sources & Fallbacks

### Price
1. CoinGecko (primary)
2. CoinCap (fallback)
3. Default: $65,000 (last resort)

### Network Stats
1. Mempool.space (primary)
2. Blockchain.info (partial fallback)
3. Default estimates (last resort)

### Fees
1. Mempool.space (primary)
2. Blockchair (fallback)
3. Default estimates (last resort)

## Caching Strategy

### Server-Side (Edge API)
- **Fresh:** 60 seconds
- **Stale-while-revalidate:** 5 minutes
- **CDN:** Vercel Edge Network

### Client-Side
- **Memory:** Current session
- **localStorage:** 5 minutes
- **Stale data:** Used if API fails

## Error Handling

### Graceful Degradation
```tsx
// Shows cached data with warning
if (error && cachedData) {
  return (
    <>
      <div className="warning">⚠️ Using cached data</div>
      <Display data={cachedData} />
    </>
  );
}

// Shows defaults if no cache
if (error && !cachedData) {
  return <Display data={DEFAULT_DATA} offlineMode />;
}
```

### Loading States
- Skeleton placeholders for initial load
- Subtle pulse for background refresh
- No blocking UI on updates

## Integration Examples

### Variance Simulator

```tsx
import { useLiveProfitability } from "@/hooks/useLiveProfitability";

export function VarianceSimulator() {
  const { result, usingLiveData, priceChange, recalculate } = useLiveProfitability({
    hashrate: selectedDevice.hashrateThs,
    powerConsumption: selectedDevice.powerWatts,
    electricityRate: userElectricityRate,
  });

  return (
    <div>
      {priceChange && (
        <Alert>
          Bitcoin price changed {priceChange.toFixed(1)}%!
          <Button onClick={recalculate}>Recalculate</Button>
        </Alert>
      )}
      
      <div className="flex items-center gap-2">
        <Switch 
          checked={usingLiveData}
          onCheckedChange={(checked) => 
            checked ? enableLiveData() : useStaticData()
          }
        />
        <Label>Use live network stats</Label>
        {usingLiveData && <Badge>Live</Badge>}
      </div>
      
      <ProfitabilityDisplay result={result} />
    </div>
  );
}
```

### Hardware Cards

```tsx
import { useLiveProfitability } from "@/hooks/useLiveProfitability";

export function HardwareCard({ device }) {
  // Calculate profitability with live data
  const { result } = useLiveProfitability({
    hashrate: device.hashrateThs,
    powerConsumption: device.powerWatts,
    electricityRate: 0.12, // Default assumption
  });

  return (
    <Card>
      <h3>{device.name}</h3>
      <p>${device.price}</p>
      
      {result && (
        <div className="live-earnings">
          <span className={result.isProfitable ? "text-accent" : "text-destructive"}>
            ${result.dailyProfit.toFixed(2)}/day
          </span>
          <span className="text-xs text-muted-foreground">
            at $0.12/kWh
          </span>
        </div>
      )}
    </Card>
  );
}
```

### Email Templates

Include current BTC price in weekly emails:

```tsx
import { useBitcoinData } from "@/hooks/useLiveProfitability";

export function generateWeeklyEmail(subscriber) {
  const { data } = await fetchBitcoinData(); // Server-side
  
  return {
    subject: `Weekly Update: BTC at $${data.price.usd.toLocaleString()}`,
    body: `
      Bitcoin is currently trading at $${data.price.usd.toLocaleString()}
      (${data.price.change24h > 0 ? '+' : ''}${data.price.change24h.toFixed(1)}% 24h).
      
      With your ${subscriber.device}, you would earn approximately
      $${calculateProfit(subscriber, data).dailyProfit.toFixed(2)} today.
    `
  };
}
```

## Performance

### Optimizations
- **Parallel fetching:** All APIs called simultaneously
- **Edge caching:** 60s cache at CDN level
- **Request deduplication:** React Query style caching
- **Lazy loading:** Components fetch only when mounted
- **Abort controllers:** Cancel stale requests

### Bundle Size
- Core API: ~2KB gzipped
- Hooks: ~3KB gzipped
- Components: ~8KB gzipped
- Total: ~13KB gzipped

## Testing

### Mock Data
```tsx
const mockData: UnifiedBitcoinData = {
  price: { usd: 65000, change24h: 5.2, change24hUsd: 3200, lastUpdated: Date.now() },
  network: { difficulty: 83, difficultyChange: 2.5, blockHeight: 890000, ... },
  // ...
};

// Use in tests
jest.mock("@/hooks/useLiveProfitability", () => ({
  useBitcoinData: () => ({ data: mockData, loading: false, error: null }),
}));
```

### Error Simulation
```tsx
// Force fallback mode
process.env.FORCE_FALLBACK = "true";

// Simulate slow network
await new Promise(r => setTimeout(r, 5000));
```

## Rate Limits

| Source | Limit | Our Usage |
|--------|-------|-----------|
| CoinGecko | 10-30 calls/min | 1 call/min |
| Mempool.space | No limit | 1 call/min |
| CoinCap | No limit | Fallback only |

We stay well within all free tier limits.

## Deployment

No additional configuration needed. The Edge API route automatically uses Vercel's Edge Network for optimal performance.

## Monitoring

Track these metrics in your analytics:
- API success/failure rates
- Cache hit rates
- Data staleness (how often we serve stale data)
- User engagement with price alerts

## Future Enhancements

- WebSocket for real-time price updates
- Historical difficulty data chart
- More granular fee predictions
- Lightning Network stats
- Mining pool distribution
