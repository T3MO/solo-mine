# Email Capture & Lead Nurturing System

A complete email marketing system for Solo Mine that converts educational users into hardware buyers through automated email flows.

## Features

- **Smart Capture Modal** - Value-exchange email capture with personalized messaging
- **Dual Provider Support** - Works with both Supabase/Resend (technical) and ConvertKit (no-code)
- **Automated Email Flows** - Welcome, weekly updates, price drops, and setup guides
- **Privacy-First** - GDPR compliant with one-click unsubscribe
- **Anti-Spam** - Honeypot fields and rate limiting

## Quick Start

### 1. Choose Your Provider

#### Option A: Supabase + Resend (Recommended for Developers)
- Full control over data and emails
- Lower cost at scale
- Requires database management

#### Option B: ConvertKit (Recommended for Non-Technical)
- Built-in automation workflows
- Visual email builder
- Monthly subscription cost

### 2. Environment Variables

```bash
# Supabase + Resend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@solomine.io
RESEND_REPLY_TO=support@solomine.io

# OR ConvertKit
CONVERTKIT_API_KEY=your_ck_api_key
CONVERTKIT_API_SECRET=your_ck_secret
CONVERTKIT_FORM_ID=your_form_id

# Admin
ADMIN_API_KEY=your-secret-admin-key
```

### 3. Database Setup (Supabase only)

1. Create a Supabase project
2. Open the SQL Editor
3. Run the contents of `supabase/schema.sql`

### 4. Verify Domain (Resend)

1. Sign up at resend.com
2. Add your domain
3. Verify DNS records
4. Create API key

## Email Capture Triggers

| Trigger | When It Shows | Purpose |
|---------|--------------|---------|
| `quiz-complete` | After quiz results | Get assessment emailed |
| `simulator-3-runs` | After 3 simulations | Save configuration |
| `exit-intent` | Cursor leaves page | Don't lose interested users |
| `hardware-viewed` | After viewing 2+ devices | Price drop alerts |
| `manual` | On button click | Newsletter signup |

## Email Templates

### 1. Welcome Email
- Sent immediately after subscription
- Includes quiz results and recommendations
- CTA to view hardware specs

### 2. Weekly Profitability Update
- Sent weekly
- BTC price changes
- Profitability status for saved configs
- Buy/wait recommendation

### 3. Price Drop Alert
- Triggered when hardware price drops
- Shows savings amount
- Urgency messaging
- Direct affiliate link

### 4. Setup Guide
- Sent after purchase intent detected
- Unboxing checklist
- Pool vs solo configuration
- Video tutorial links

## Integration Examples

### Quiz Results Page
```tsx
import { useQuizCapture } from "@/hooks/useEmailCapture";
import { CaptureModal } from "@/components/email/capture-modal";

function QuizResults({ result }) {
  const { modalProps } = useQuizCapture({
    type: result.type,
    recommendedDevice: result.recommendedDevice,
  });

  return (
    <>
      <ResultContent result={result} />
      <CaptureModal {...modalProps} />
    </>
  );
}
```

### Simulator Page
```tsx
import { useSimulatorCapture } from "@/hooks/useEmailCapture";

function Simulator() {
  const { modalProps, incrementRunCount } = useSimulatorCapture({
    device: "bitaxe-gamma",
    electricityRate: 0.12,
    mode: "pool",
  });

  return (
    <>
      <button onClick={() => { runSim(); incrementRunCount(); }}>
        Run Simulation
      </button>
      <CaptureModal {...modalProps} />
    </>
  );
}
```

### Manual Trigger
```tsx
import { useState } from "react";
import { CaptureModal } from "@/components/email/capture-modal";

function NewsletterSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Get Mining Tips
      </button>
      <CaptureModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trigger="manual"
      />
    </>
  );
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscribe` | POST | Subscribe new user |
| `/api/unsubscribe` | POST | Unsubscribe user |
| `/api/webhooks/email` | POST | Receive email events |
| `/api/admin/stats` | GET | Get subscriber stats |

## Webhook Events

The system handles these email provider webhooks:

- `email.delivered` - Email delivered to inbox
- `email.opened` - User opened email
- `email.clicked` - User clicked link
- `email.bounced` - Email bounced
- `email.complained` - User marked as spam

## Tagging Strategy

Tags are used to segment subscribers:

- `quiz-complete` - Completed the quiz
- `result-{type}` - Quiz result type (pool-miner, solo, etc.)
- `interested-{device}` - Viewed specific hardware
- `simulated-{device}` - Ran simulator with device
- `mode-{pool|solo}` - Preferred mining mode

## Privacy & Compliance

- **GDPR**: One-click unsubscribe, data export available
- **CAN-SPAM**: Physical address in email footer, unsubscribe in every email
- **Affiliate Disclosure**: Footer note on all emails
- **Data Storage**: Encrypted at rest (Supabase) or SOC2 compliant (ConvertKit)

## Admin Dashboard

In development mode, a stats widget appears in the bottom-right corner showing:
- Total subscribers
- New subscribers this week
- Top recommended device
- Unsubscribe count

## Testing

### Test the Flow
1. Subscribe with your email
2. Check Supabase for subscriber record
3. Verify welcome email received
4. Check email_logs table for delivery status
5. Click unsubscribe link
6. Verify status changed to "unsubscribed"

### Test Webhooks (local)
Use ngrok to expose local server:
```bash
ngrok http 3000
# Use the HTTPS URL in Resend webhook settings
```

## Troubleshooting

### Emails not sending
- Check Resend API key
- Verify domain is verified in Resend
- Check server logs for errors

### Subscribers not appearing
- Check Supabase connection
- Verify RLS policies allow inserts
- Check browser console for API errors

### Webhooks not working
- Verify webhook URL is correct
- Check webhook secret if configured
- Check webhook_events table for received events

## Cost Estimates

### Supabase + Resend
- Supabase: Free tier (500MB, 2GB bandwidth)
- Resend: $0.0001 per email (first 3,000 free)
- **Estimated**: $0-10/month for small lists

### ConvertKit
- Free: Up to 1,000 subscribers
- Paid: $29/month for 1,000-3,000 subscribers
- **Estimated**: $0-29/month

## Next Steps

1. Set up provider (Supabase/Resend or ConvertKit)
2. Configure environment variables
3. Test subscription flow
4. Set up webhooks
5. Customize email templates
6. Monitor stats dashboard
7. A/B test subject lines

## Support

For issues or questions:
- Email: support@solomine.io
- Discord: [Solo Mine Community](https://discord.gg/solomine)
