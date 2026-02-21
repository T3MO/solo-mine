/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'chart.js',
      'lucide-react',
      '@radix-ui/react-checkbox',
    ],
    scrollRestoration: true,
  },

  // Image optimization - Cloudflare compatible
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mempool.space',
      },
      {
        protocol: 'https',
        hostname: '**.coinbase.com',
      },
      {
        protocol: 'https',
        hostname: '**.kraken.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cloudflare Images compatibility
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const headers = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
      },
    ];

    if (isProduction) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers,
      },
      {
        source: '/(.*\\.(?:js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bitcoin',
        destination: '/learn/bitcoin-basics',
        permanent: true,
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap',
      },
      {
        source: '/rss.xml',
        destination: '/api/rss',
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }

    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three$': 'three/build/three.min.js',
      };
    }

    return config;
  },

  // Cloudflare Pages compatible output (NOT standalone)
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  productionBrowserSourceMaps: false,
  trailingSlash: false,
};

module.exports = nextConfig;
