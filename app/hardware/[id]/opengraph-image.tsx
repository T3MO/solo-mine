import { ImageResponse } from "next/og";
import hardwareData from "@/data/hardware.json";
import { SITE_CONFIG } from "@/lib/seo";

// ============================================================================
// Route Segment Config
// ============================================================================

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// ============================================================================
// OG Image Generation for Hardware Devices
// ============================================================================

export default async function Image({ params }: { params: { id: string } }) {
  const device = hardwareData.devices.find((d) => d.id === params.id);

  if (!device) {
    return new Response("Device not found", { status: 404 });
  }

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
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)",
            top: "-150px",
            right: "-150px",
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "60px",
            zIndex: 10,
            padding: "60px",
          }}
        >
          {/* Device Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
            }}
          >
            {/* Category Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "9999px",
                background: "rgba(255,107,0,0.1)",
                border: "1px solid rgba(255,107,0,0.3)",
                alignSelf: "flex-start",
              }}
            >
              <span style={{ color: "#FF6B00", fontSize: "16px", fontWeight: 600 }}>
                {device.category.toUpperCase()}
              </span>
            </div>

            {/* Device Name */}
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {device.name}
            </h1>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#00F0FF",
                }}
              >
                ${device.price}
              </span>
              <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)" }}>
                USD
              </span>
            </div>

            {/* Specs */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "8px",
              }}
            >
              <div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  Hashrate
                </p>
                <p style={{ fontSize: "24px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {device.hashrate}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  Power
                </p>
                <p style={{ fontSize: "24px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {device.power}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  Noise
                </p>
                <p style={{ fontSize: "24px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {device.noise}
                </p>
              </div>
            </div>
          </div>

          {/* Device Placeholder */}
          <div
            style={{
              width: "350px",
              height: "350px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(0,240,255,0.05) 100%)",
              border: "2px solid rgba(255,107,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "120px",
            }}
          >
            ⛏️
          </div>
        </div>

        {/* Site URL */}
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
