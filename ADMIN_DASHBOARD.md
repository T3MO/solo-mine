# Admin Dashboard

A protected backend interface for monitoring platform performance, user behavior, and affiliate revenue.

## Features

- **Authentication**: Simple password-based auth with rate limiting
- **Analytics Overview**: Traffic, quiz completions, simulator usage, email stats
- **User Analytics**: Geographic distribution, device breakdown, user flow funnel
- **Content Management**: Edit hardware specs, quiz settings
- **Real-time Updates**: Auto-refresh every 60 seconds

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
# Admin Authentication
ADMIN_TOKEN=your-secure-random-token-here
ADMIN_PASSWORD_HASH=your-hashed-password
PASSWORD_SALT=your-salt-here
```

### 2. Generate Credentials

Run this script to generate secure credentials:

```typescript
import { generateSetupCredentials } from "@/lib/admin-auth";

const { token, passwordHash } = generateSetupCredentials("your-password");
console.log("ADMIN_TOKEN=", token);
console.log("ADMIN_PASSWORD_HASH=", passwordHash);
```

### 3. Access the Dashboard

Navigate to `/admin` and login with your password.

## Security

### Authentication Flow
1. User enters password on `/admin/login`
2. Password is hashed and compared to `ADMIN_PASSWORD_HASH`
3. On success, `ADMIN_TOKEN` is set as an httpOnly cookie
4. Middleware validates the token on all `/admin/*` routes
5. Rate limiting: 5 attempts per IP per hour

### Security Headers
- `httpOnly` cookies (not accessible via JavaScript)
- `secure` flag in production (HTTPS only)
- `sameSite=strict` (CSRF protection)
- 30-day cookie expiration (configurable)

### Rate Limiting
- Failed login attempts are tracked by IP
- After 5 failed attempts, IP is locked out for 15 minutes
- Successful login resets the counter

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin Login   │────▶│   Set Cookie     │────▶│   Dashboard     │
│   /admin/login  │     │   ADMIN_TOKEN    │     │   /admin/*      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                           │
                              ▼                           ▼
                       ┌──────────────┐          ┌──────────────┐
                       │   Cookie     │          │   Middleware │
                       │   30 days    │          │   Validate   │
                       └──────────────┘          └──────────────┘
```

## Dashboard Sections

### Overview (`/admin`)
Key metrics at a glance:
- Today's visitors with trend indicator
- Quiz completions and conversion rate
- Simulator runs with most tested device
- Top hardware views
- Email subscriber count
- Estimated revenue

### Users (`/admin/users`)
Anonymous user analytics:
- Session overview (new vs returning)
- Geographic distribution
- Device breakdown (desktop/mobile/tablet)
- User flow funnel (landing → quiz → simulator → hardware → click)

### Content (`/admin/content`)
- **Hardware Editor**: Edit prices, stock status, affiliate links
- **Education**: Manage lesson content
- **Quiz Settings**: Adjust recommendation thresholds

### Analytics (`/admin/analytics`)
Detailed charts (coming soon):
- Traffic over time
- Page popularity
- Revenue projections

### Settings (`/admin/settings`)
- Change admin password
- Configure notifications
- API key management
- Data export/import

## Data Sources

### Current: Mock Data
The dashboard currently uses mock data for demonstration. Replace with real data sources:

```typescript
// hooks/useAdminAnalytics.ts
async function fetchStats() {
  const response = await fetch("/api/admin/analytics");
  return response.json();
}
```

### Recommended: Supabase
Store analytics events in Supabase:

```sql
-- analytics_events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_events_type ON analytics_events(event_type);
CREATE INDEX idx_events_created ON analytics_events(created_at);
```

### Alternative: Plausible API
If using Plausible Analytics, fetch data from their API:

```typescript
const response = await fetch(
  `https://plausible.io/api/v1/stats/aggregate?site_id=solomine.io`,
  {
    headers: { Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}` },
  }
);
```

## Customization

### Add New Widget

```tsx
// components/admin/stat-card.tsx
export function MyCustomWidget({ data }) {
  return (
    <StatCard
      title="Custom Metric"
      value={data.value}
      icon={<MyIcon className="w-5 h-5" />}
    />
  );
}
```

### Add New Page

1. Create page: `app/admin/my-page/page.tsx`
2. Add to navigation: `app/admin/layout.tsx`
3. Access at `/admin/my-page`

## Deployment

The admin dashboard works automatically on Vercel:
1. Set environment variables in Vercel dashboard
2. Deploy
3. Access `/admin` and login

No additional configuration needed.

## Troubleshooting

### Can't Access Admin
1. Check `ADMIN_TOKEN` and `ADMIN_PASSWORD_HASH` are set
2. Clear cookies and try again
3. Check rate limit status in browser console

### Analytics Not Loading
1. Check browser console for errors
2. Verify data fetching logic in `useAdminAnalytics`
3. Check API route `/api/admin/analytics` exists

### Rate Limit Exceeded
Wait 15 minutes or manually reset:
```bash
# Clear rate limit (restart server)
# Rate limits are in-memory only
```

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] User session replay (privacy-safe)
- [ ] A/B test results
- [ ] Revenue tracking integration
- [ ] Multi-admin support (if needed)
- [ ] Email campaign management
- [ ] Hardware inventory tracking

## API Reference

### Authentication

```typescript
// Login
const result = await adminLogin(password, rememberMe, ip);
// Returns: { success: boolean; error?: string }

// Logout
await adminLogout();

// Check auth status
const authenticated = await checkAuthStatus();
```

### Analytics

```typescript
// Get all stats
const { stats, loading, error } = useAdminAnalytics(60000);

// Get specific metrics
const { data: traffic } = useTrafficStats();
const { data: quiz } = useQuizStats();
const { data: hardware } = useHardwareStats();
```

## Support

For issues or questions:
- Check environment variables
- Verify middleware is running
- Review browser console for errors
