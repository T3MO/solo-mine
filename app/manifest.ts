import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#030305",
    theme_color: "#FF6B00",
    orientation: "portrait",
    scope: "/",
    lang: "en-US",
    dir: "ltr",
    categories: ["education", "finance", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    screenshots: [
      {
        src: "/screenshots/simulator.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Mining Simulator",
      },
      {
        src: "/screenshots/hardware.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Hardware Showcase",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Mobile View",
      },
    ] as any,
    shortcuts: [
      {
        name: "Take Quiz",
        short_name: "Quiz",
        description: "Should you mine Bitcoin? Take the quiz to find out.",
        url: "/quiz",
        icons: [{ src: "/icons/quiz-192.png", sizes: "192x192" }],
      },
      {
        name: "Simulator",
        short_name: "Simulator",
        description: "Simulate pool vs solo mining profitability",
        url: "/tools/variance-simulator",
        icons: [{ src: "/icons/simulator-192.png", sizes: "192x192" }],
      },
      {
        name: "Hardware",
        short_name: "Hardware",
        description: "Browse home mining hardware",
        url: "/hardware",
        icons: [{ src: "/icons/hardware-192.png", sizes: "192x192" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
