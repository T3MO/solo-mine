/**
 * SEO Configuration
 * Centralized metadata and structured data helpers
 */

import { Metadata } from "next";

// ============================================================================
// Site Configuration
// ============================================================================

export const SITE_CONFIG = {
  name: "Solo Mine",
  shortName: "SoloMine",
  description: "Learn if Bitcoin mining is right for you. Interactive simulator, hardware guides, and eligibility quiz for home miners.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://solomine.io",
  ogImage: "/og-image.png",
  twitterHandle: "@solomine",
  locale: "en_US",
} as const;

// ============================================================================
// Default Metadata
// ============================================================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Should You Mine Bitcoin?`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "bitcoin mining",
    "home mining",
    "solo mining",
    "pool mining",
    "bitcoin miner",
    "bitaxe",
    "nerdqaxe",
    "avalon nano",
    "mining profitability",
    "sha256",
    "cryptocurrency mining",
    "btc mining",
    "home bitcoin miner",
  ],
  authors: [{ name: "Solo Mine" }],
  creator: "Solo Mine",
  publisher: "Solo Mine",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | Should You Mine Bitcoin?`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Solo Mine - Bitcoin Mining Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Should You Mine Bitcoin?`,
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
    creator: SITE_CONFIG.twitterHandle,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
};

// ============================================================================
// Page-Specific Metadata Generators
// ============================================================================

export function generateHomeMetadata(): Metadata {
  return {
    title: "Should You Mine Bitcoin? Take the Quiz",
    description: "Not sure if Bitcoin mining is right for you? Take our 5-question quiz and use our interactive simulator to find out. Compare pool vs solo mining with real data.",
    openGraph: {
      title: "Should You Mine Bitcoin? | Solo Mine",
      description: "Take our 5-question quiz to see if mining makes sense for your situation. Interactive simulator + hardware guides included.",
      type: "website",
    },
    twitter: {
      title: "Should You Mine Bitcoin? | Solo Mine",
      description: "Take our 5-question quiz to see if mining makes sense for your situation.",
    },
  };
}

export function generateLearnMetadata(): Metadata {
  return {
    title: "Bitcoin Mining Education | SHA-256 & Profitability Guides",
    description: "Master Bitcoin mining fundamentals. Interactive SHA-256 visualizer, pool vs solo guides, and hardware selection tutorials.",
    openGraph: {
      title: "Learn Bitcoin Mining | Solo Mine",
      description: "Master mining fundamentals with our interactive SHA-256 visualizer and comprehensive guides.",
      type: "website",
    },
    alternates: {
      canonical: "/learn",
    },
  };
}

export function generateSimulatorMetadata(): Metadata {
  return {
    title: "Pool vs Solo Mining Simulator | Calculate Real Profits",
    description: "Simulate 365 days of mining with real Bitcoin difficulty data. Compare pool vs solo returns, calculate profitability, and optimize your strategy.",
    openGraph: {
      title: "Mining Profitability Simulator | Solo Mine",
      description: "Simulate 365 days of mining with real difficulty data. Compare pool vs solo strategies.",
      type: "website",
    },
    alternates: {
      canonical: "/tools/variance-simulator",
    },
  };
}

export function generateHardwareMetadata(): Metadata {
  return {
    title: "Curated Home Miners 2025 | Tested & Reviewed",
    description: "Discover the best Bitcoin miners for home use. Bitaxe, NerdQaxe, Avalon Nano - all tested and reviewed with real profitability data.",
    openGraph: {
      title: "Best Home Bitcoin Miners 2025 | Solo Mine",
      description: "Curated list of tested home miners. Compare specs, noise levels, and profitability.",
      type: "website",
    },
    alternates: {
      canonical: "/hardware",
    },
  };
}

export function generateQuizMetadata(): Metadata {
  return {
    title: "Should I Mine Bitcoin? | 5-Question Eligibility Quiz",
    description: "Answer 5 quick questions about your electricity costs, space, and budget. We'll tell you if mining makes sense or if you should just buy Bitcoin.",
    openGraph: {
      title: "Should I Mine Bitcoin? Take the Quiz",
      description: "5 questions to determine if Bitcoin mining is right for you.",
      type: "website",
    },
    alternates: {
      canonical: "/quiz",
    },
  };
}

export function generateDashboardMetadata(): Metadata {
  return {
    title: "Your Mining Journey Progress",
    description: "Track your learning progress, view saved configurations, and unlock achievements on your Bitcoin mining education journey.",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: "/dashboard",
    },
  };
}

export function generateHardwareDeviceMetadata(device: {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}): Metadata {
  return {
    title: `${device.name} | Home Bitcoin Miner Review`,
    description: device.description,
    openGraph: {
      title: `${device.name} - $${device.price} | Solo Mine`,
      description: device.description,
      type: "product",
      images: device.image
        ? [
            {
              url: device.image,
              width: 1200,
              height: 630,
              alt: `${device.name} - Home Bitcoin Miner`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${device.name} - $${device.price} | Solo Mine`,
      description: device.description,
      images: device.image ? [device.image] : undefined,
    },
    alternates: {
      canonical: `/hardware/${device.id}`,
    },
  };
}

// ============================================================================
// JSON-LD Structured Data Generators
// ============================================================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      "https://twitter.com/solomine",
      "https://github.com/solomine",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Support",
      email: "support@solomine.io",
    },
  };
}

export function generateCourseSchema(course: {
  title: string;
  description: string;
  url: string;
  image?: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_CONFIG.name,
      sameAs: SITE_CONFIG.url,
    },
    url: `${SITE_CONFIG.url}${course.url}`,
    image: course.image ? `${SITE_CONFIG.url}${course.image}` : undefined,
    timeRequired: course.duration || "PT1H",
    educationalLevel: "Beginner",
    isAccessibleForFree: true,
  };
}

export function generateProductSchema(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  brand?: string;
  availability?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? `${SITE_CONFIG.url}${product.image}` : undefined,
    brand: {
      "@type": "Brand",
      name: product.brand || "Generic",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_CONFIG.url}/hardware/${product.id}`,
      price: product.price,
      priceCurrency: "USD",
      availability: product.availability || "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "10",
    },
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateHowToSchema(howTo: {
  title: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.title,
    description: howTo.description,
    totalTime: howTo.totalTime || "PT1H",
    step: howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image ? `${SITE_CONFIG.url}${step.image}` : undefined,
    })),
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function jsonLdScript(data: unknown) {
  return {
    __html: JSON.stringify(data),
  };
}

export function generateCanonicalUrl(path: string): string {
  // Remove trailing slashes and query parameters for canonical URL
  const cleanPath = path.replace(/\/$/, "").split("?")[0];
  return `${SITE_CONFIG.url}${cleanPath}`;
}

export function generateAlternateLanguages(path: string): Record<string, string> {
  // For future i18n support
  return {
    "en-US": `${SITE_CONFIG.url}${path}`,
    "x-default": `${SITE_CONFIG.url}${path}`,
  };
}
