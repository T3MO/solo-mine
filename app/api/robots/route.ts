import { MetadataRoute } from 'next';

export function GET(): Response {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solomine.io';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Crawl rate
Crawl-delay: 1

# Disallow admin routes
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/health

# Allow important pages
Allow: /shop/
Allow: /learn/
Allow: /quiz/
Allow: /calculator/
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
