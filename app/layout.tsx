import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { FuturisticDock } from "@/components/navigation/futuristic-dock";
import { PlausibleAnalytics } from "@/components/analytics/plausible";
import { BuildInfo } from "@/components/debug/build-info";
import { EmailStatsWidget } from "@/components/email/dashboard-widget";
import { defaultMetadata, SITE_CONFIG, generateOrganizationSchema, jsonLdScript } from "@/lib/seo";
import "./globals.css";

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#030305",
  colorScheme: "dark",
};

// ============================================================================
// ROOT LAYOUT
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${orbitron.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationSchema)}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Digital Foundry Aesthetic Effects */}
          <div className="scan-lines" aria-hidden="true" />
          <div className="scan-line-animated" aria-hidden="true" />
          <div className="vignette" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          
          {/* Main Content */}
          <main className="relative z-10">
            {children}
          </main>

          {/* Navigation Dock */}
          <FuturisticDock />

          {/* Analytics */}
          <PlausibleAnalytics 
            domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "solo-mine.io"} 
          />

          {/* Development Debug Info */}
          <BuildInfo />

          {/* Email Stats Widget (Dev Only) */}
          <EmailStatsWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
