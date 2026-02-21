# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Solo Mine, please report it responsibly:

**Email**: security@solomine.io

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide updates on the fix timeline.

## Security Measures

### Authentication
- Admin dashboard uses secure token-based authentication
- Rate limiting: 5 login attempts per IP per hour
- HTTP-only cookies with SameSite protection
- 30-day session expiration

### Data Protection
- No PII (Personally Identifiable Information) stored
- Email addresses encrypted at rest (if using Supabase)
- Affiliate links are outbound only (no tracking parameters added)

### API Security
- Edge functions run in isolated environment
- No SQL injection vulnerabilities (use parameterized queries)
- API rate limiting on public endpoints

### Dependencies
- Automated security audits via GitHub Actions
- Weekly dependency updates
- No known vulnerabilities in production dependencies

## Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Analytics events | 90 days |
| Email logs | 1 year |
| Subscriber data | Until unsubscribed |
| Error logs | 30 days |

## Affiliate Disclosure

This platform contains affiliate links. We:
- Only recommend products we've researched
- Clearly disclose affiliate relationships
- Do not let affiliate status influence recommendations
- Earn commission at no additional cost to users

## Third-Party Services

We use the following third-party services:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Vercel | Hosting | None (edge processing) |
| Supabase | Database | Encrypted subscriber data |
| Resend/ConvertKit | Email delivery | Email addresses only |
| Plausible | Analytics | Anonymous usage data |
| Mempool.space | Bitcoin data | None (client-side) |

## SSL/TLS

All traffic is encrypted with TLS 1.3. HSTS headers enforce HTTPS connections.

## Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000
```

## GDPR Compliance

- Privacy-first analytics (no cookies)
- One-click unsubscribe
- Data export available
- Right to be forgotten implemented

## Updates

Security updates are deployed automatically via Vercel. Critical patches are applied within 24 hours of release.

---

Last updated: 2024
