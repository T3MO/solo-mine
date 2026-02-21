import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import hardwareData from "@/data/hardware.json";

// ============================================================================
// Types
// ============================================================================

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

// ============================================================================
// Static Routes Configuration
// ============================================================================

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: SitemapEntry["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/learn", priority: 0.9, changeFrequency: "weekly" },
  { path: "/learn/sha256", priority: 0.8, changeFrequency: "monthly" },
  { path: "/tools/variance-simulator", priority: 0.9, changeFrequency: "daily" },
  { path: "/hardware", priority: 0.8, changeFrequency: "weekly" },
  { path: "/quiz", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dashboard", priority: 0.6, changeFrequency: "weekly" },
];

// ============================================================================
// Dynamic Routes Configuration
// ============================================================================

function getHardwareDeviceRoutes(): SitemapEntry[] {
  return hardwareData.devices.map((device) => ({
    url: `${SITE_CONFIG.url}/hardware/${device.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

// ============================================================================
// Sitemap Generation
// ============================================================================

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  
  // Static routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Hardware device routes
  const hardwareEntries = getHardwareDeviceRoutes();

  // Combine all entries
  return [...staticEntries, ...hardwareEntries];
}
