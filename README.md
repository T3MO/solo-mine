# Solo Mine

**The complete educational platform for Bitcoin home mining.**

Help users discover if Bitcoin mining makes sense for them through interactive tools, curated hardware guides, and personalized recommendations.

![Solo Mine Preview](https://solomine.io/og-image.png)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/solo-mine.git
cd solo-mine

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Git

## 🔧 Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in required values:

```bash
# Required
ADMIN_TOKEN=your_secure_random_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional (for features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=your_resend_key
```

3. Generate admin credentials:
```bash
npm run setup:admin
```

## 🏗️ Project Structure

```
my-app/
├── app/                    # Next.js app router pages
│   ├── (routes)/          # Main site routes
│   ├── admin/             # Admin dashboard (protected)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── data/             # Bitcoin data components
│   ├── email/            # Email capture components
│   ├── hardware/         # Hardware showcase
│   ├── quiz/             # Quiz components
│   └── ui/               # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── admin-auth.ts     # Admin authentication
│   ├── bitcoin-api.ts    # Bitcoin data fetching
│   ├── email/            # Email service
│   └── seo.ts            # SEO configuration
├── data/                  # Static data
│   └── hardware.json     # Hardware database
├── types/                 # TypeScript types
├── public/               # Static assets
└── scripts/              # Build scripts
```

## 🎯 Features

### For Users
- **Eligibility Quiz**: 5-question assessment with personalized recommendations
- **Variance Simulator**: Compare Pool vs Solo mining with real data
- **SHA-256 Visualizer**: Interactive mining education
- **Hardware Showcase**: Curated devices with live profitability
- **Email Capture**: Get personalized recommendations via email

### For Admins
- **Protected Dashboard**: View traffic, conversions, and analytics
- **Content Management**: Edit hardware specs and quiz logic
- **Email Analytics**: Track subscriber growth and engagement

## 🛠️ Development

```bash
# Run type checker
npm run type-check

# Run linter
npm run lint

# Run pre-deploy checks
npm run predeploy

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## 📝 Content Management

### Adding Hardware

Edit `data/hardware.json`:

```json
{
  "id": "new-device",
  "name": "Device Name",
  "brand": "Brand",
  "hashrate": "600 GH/s",
  "power": "15W",
  "price": 299,
  "category": "beginner",
  "description": "Description here...",
  "affiliateUrl": "https://your-affiliate-link.com"
}
```

### Editing Quiz Logic

Navigate to `/admin/content` → Quiz Settings to adjust recommendation thresholds.

Or edit the algorithm in `components/quiz/eligibility-quiz.tsx`.

## 📊 Analytics

### Viewing Stats

Access the admin dashboard at `/admin` with your admin password.

### Integrations

- **Plausible**: Privacy-friendly analytics (recommended)
- **Vercel Analytics**: Built-in performance monitoring
- **Custom Events**: Tracked in Supabase or email provider

## 🔧 Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

1. Ensure `.env.local` exists (not `.env`)
2. Restart dev server after changes
3. Check variable names match `.env.local.example`

### Admin Login Not Working

1. Verify `ADMIN_TOKEN` and `ADMIN_PASSWORD_HASH` are set
2. Clear browser cookies
3. Check server logs for errors

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for security policies and vulnerability reporting.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Mempool.space](https://mempool.space/) for Bitcoin data
- [Plausible](https://plausible.io/) for privacy-friendly analytics
- All open source contributors

## 📞 Support

- **Discord**: [Join our community](https://discord.gg/solomine)
- **Twitter**: [@solomine](https://twitter.com/solomine)
- **Email**: support@solomine.io

---

Built with ❤️ for the Bitcoin mining community.
