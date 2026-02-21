import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/seo";

// ============================================================================
// Route Segment Config
// ============================================================================

export const runtime = "edge";

export const alt = "Solo Mine - Bitcoin Mining Education Platform";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// ============================================================================
// OG Image Generation
// ============================================================================

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #030305 0%, #0a0a0f 50%, #030305 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,107,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,107,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)",
            top: "-100px",
            left: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)",
            bottom: "-100px",
            right: "-100px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            zIndex: 10,
          }}
        >
          {/* Logo/Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              borderRadius: "9999px",
              background: "rgba(255,107,0,0.1)",
              border: "1px solid rgba(255,107,0,0.3)",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#FF6B00",
              }}
            />
            <span
              style={{
                color: "#FF6B00",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Bitcoin Mining Education
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Should You Mine{" "}
            <span style={{ color: "#FF6B00" }}>Bitcoin?</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              maxWidth: "700px",
              margin: 0,
            }}
          >
            Interactive simulator • Hardware guides • Eligibility quiz
          </p>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                padding: "16px 32px",
                borderRadius: "12px",
                background: "#FF6B00",
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              Take the Quiz →
            </div>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "monospace",
          }}
        >
          {SITE_CONFIG.url.replace("https://", "")}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
