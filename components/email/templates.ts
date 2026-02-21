/**
 * Email Templates
 * HTML email templates for various email flows
 */

import { SITE_CONFIG } from "@/lib/seo";

// ============================================================================
// Types
// ============================================================================

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ============================================================================
// Base Email Layout
// ============================================================================

function baseEmailTemplate(content: {
  title: string;
  preheader: string;
  body: string;
  cta?: { text: string; url: string };
  footer?: string;
}): { html: string; text: string } {
  const unsubscribeUrl = `${SITE_CONFIG.url}/unsubscribe?email={{email}}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
      .title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden;">${content.preheader}</div>
  
  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="margin: 0 auto; background: linear-gradient(135deg, #0a0a0f 0%, #111118 100%); border-radius: 16px; overflow: hidden; border: 1px solid #222;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; font-size: 28px; color: #FF6B00; font-weight: 700; letter-spacing: -0.02em;">
                ${SITE_CONFIG.name}
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #888;">Bitcoin Mining Education</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              <h2 class="title" style="margin: 0 0 20px; font-size: 32px; color: #ffffff; font-weight: 700; line-height: 1.2;">
                ${content.title}
              </h2>
              
              ${content.body}
              
              ${content.cta ? `
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.cta.url}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF6B00 0%, #ff8533 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${content.cta.text}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}
              
              ${content.footer ? `
              <!-- Footer Note -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #222;">
                <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                  ${content.footer}
                </p>
              </div>
              ` : ""}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: #08080a; border-top: 1px solid #222; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">
                You're receiving this because you completed the assessment at ${SITE_CONFIG.url}
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #666;">
                <a href="${unsubscribeUrl}" style="color: #888; text-decoration: underline;">Unsubscribe</a> • 
                <a href="${SITE_CONFIG.url}/privacy" style="color: #888; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #555;">
                This email contains affiliate links. We may earn a commission if you purchase, at no extra cost to you. This supports our educational mission.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Plain text version
  const text = `
${content.title}

${content.body.replace(/<[^>]*>/g, "")}

${content.cta ? `${content.cta.text}: ${content.cta.url}` : ""}

---
You're receiving this because you completed the assessment at ${SITE_CONFIG.url}

Unsubscribe: ${unsubscribeUrl}
Privacy Policy: ${SITE_CONFIG.url}/privacy

This email contains affiliate links. We may earn a commission if you purchase.
  `.trim();

  return { html, text };
}

// ============================================================================
// Template 1: Welcome Email
// ============================================================================

export function getWelcomeEmailTemplate(params: {
  email: string;
  isReturning: boolean;
  recommendedDevice?: string;
  quizResult?: string;
}): EmailTemplate {
  const deviceName = params.recommendedDevice
    ? params.recommendedDevice.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  const resultDescription: Record<string, string> = {
    "buy_btc": "buying Bitcoin directly instead of mining",
    "education": "learning more before making a decision",
    "home_miner_pool": "starting with a home pool miner",
    "solo_miner": "trying solo mining for the lottery chance",
    "asic_farm": "setting up an ASIC mining operation",
  };

  const resultText = params.quizResult ? resultDescription[params.quizResult] : "exploring Bitcoin mining";

  const { html, text } = baseEmailTemplate({
    title: params.isReturning ? "Welcome Back!" : "Your Mining Assessment",
    preheader: deviceName
      ? `We recommend the ${deviceName} for your setup`
      : "Your personalized Bitcoin mining recommendation is here",
    body: `
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        Hi there,
      </p>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        ${params.isReturning 
          ? "Thanks for coming back! We've updated your profile with your latest assessment." 
          : "Thanks for taking the Solo Mine assessment! Based on your answers, we've put together a personalized recommendation for you."
        }
      </p>
      
      ${params.quizResult ? `
      <div style="background: linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(0,240,255,0.05) 100%); border: 1px solid rgba(255,107,0,0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #FF6B00; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Your Result</p>
        <p style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 600;">
          We recommend ${resultText}
        </p>
      </div>
      ` : ""}
      
      ${deviceName ? `
      <div style="margin: 24px 0;">
        <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 16px;">
          <strong style="color: #fff;">Recommended Hardware:</strong> ${deviceName}
        </p>
        <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0;">
          This device matches your electricity cost, noise tolerance, and budget. We've analyzed the specs to find the best fit for your situation.
        </p>
      </div>
      ` : ""}
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        <strong style="color: #fff;">What you'll get from us:</strong>
      </p>
      
      <ul style="margin: 0 0 24px; padding-left: 20px; color: #ccc; line-height: 1.8;">
        <li>Weekly profitability updates for your recommended setup</li>
        <li>Price drop alerts when hardware goes on sale</li>
        <li>Setup guides when you're ready to buy</li>
        <li>Market insights: when to mine vs when to just buy BTC</li>
      </ul>
    `,
    cta: deviceName
      ? { text: "View Full Hardware Specs", url: `${SITE_CONFIG.url}/hardware/${params.recommendedDevice}` }
      : { text: "Explore Hardware Options", url: `${SITE_CONFIG.url}/hardware` },
    footer: `
      <strong style="color: #fff;">P.S.</strong> Not sure about the numbers? Try our 
      <a href="${SITE_CONFIG.url}/tools/variance-simulator" style="color: #FF6B00; text-decoration: none;">Variance Simulator</a> 
      to see exactly how much you could earn with your electricity rate.
    `,
  });

  return {
    subject: params.isReturning
      ? "Welcome Back! Your Updated Mining Assessment"
      : "Your Bitcoin Mining Assessment + Recommended Hardware",
    html,
    text,
  };
}

// ============================================================================
// Template 2: Weekly Profitability Update
// ============================================================================

export function getWeeklyUpdateTemplate(params: {
  email: string;
  deviceName: string;
  deviceId: string;
  currentBtcPrice: number;
  lastWeekBtcPrice: number;
  dailyProfit: number;
  isProfitable: boolean;
  electricityRate: number;
}): EmailTemplate {
  const priceChange = ((params.currentBtcPrice - params.lastWeekBtcPrice) / params.lastWeekBtcPrice) * 100;
  const priceChangeText = priceChange >= 0 ? `up ${priceChange.toFixed(1)}%` : `down ${Math.abs(priceChange).toFixed(1)}%`;
  const priceChangeColor = priceChange >= 0 ? "#39FF14" : "#FF3333";

  const { html, text } = baseEmailTemplate({
    title: params.isProfitable
      ? `Your ${params.deviceName} is now profitable`
      : `Market Update: BTC hit $${params.currentBtcPrice.toLocaleString()}`,
    preheader: `Bitcoin is ${priceChangeText} this week. Here's what it means for your mining setup.`,
    body: `
      <div style="background: ${params.isProfitable ? "rgba(57,255,20,0.1)" : "rgba(255,51,51,0.1)"}; border: 1px solid ${params.isProfitable ? "rgba(57,255,20,0.3)" : "rgba(255,51,51,0.3)"}; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: ${params.isProfitable ? "#39FF14" : "#FF3333"}; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
          ${params.isProfitable ? "✓ PROFITABLE" : "⚠ NOT YET PROFITABLE"}
        </p>
        <p style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">
          ${params.dailyProfit >= 0 ? "+" : ""}$${params.dailyProfit.toFixed(2)}/day
        </p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #888;">
          Estimated earnings with your ${params.deviceName}
        </p>
      </div>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        <strong style="color: #fff;">Bitcoin Price Update:</strong>
      </p>
      
      <div style="display: table; width: 100%; margin: 0 0 24px;">
        <div style="display: table-row;">
          <div style="display: table-cell; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px 0 0 8px; width: 50%;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #888;">Last Week</p>
            <p style="margin: 0; font-size: 20px; color: #fff; font-weight: 600;">$${params.lastWeekBtcPrice.toLocaleString()}</p>
          </div>
          <div style="display: table-cell; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 0 8px 8px 0; width: 50%;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #888;">This Week</p>
            <p style="margin: 0; font-size: 20px; color: ${priceChangeColor}; font-weight: 600;">$${params.currentBtcPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        <strong style="color: #fff;">Our Recommendation:</strong>
      </p>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <p style="margin: 0; font-size: 15px; color: #ccc; line-height: 1.6;">
          ${params.isProfitable
            ? `Great news! At your electricity rate of $${params.electricityRate}/kWh, mining is now profitable. This is a good time to buy if you were waiting for the right moment.`
            : `At your electricity rate of $${params.electricityRate}/kWh, mining is currently unprofitable. Consider waiting for a better entry point or using this time to research and prepare.`
          }
        </p>
      </div>
      
      <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0;">
        <strong style="color: #ccc;">Tip of the Week:</strong> Don't just watch BTC price—watch the 
        <em>network difficulty</em>. When difficulty drops (miners shutting off), your same hashrate earns more BTC even at the same price.
      </p>
    `,
    cta: { text: "Check Current Prices", url: `${SITE_CONFIG.url}/tools/variance-simulator` },
  });

  return {
    subject: params.isProfitable
      ? `Your ${params.deviceName} is now profitable (BTC ${priceChangeText})`
      : `Weekly Update: Bitcoin ${priceChangeText} - Should you mine?`,
    html,
    text,
  };
}

// ============================================================================
// Template 3: Price Drop Alert
// ============================================================================

export function getPriceDropTemplate(params: {
  email: string;
  deviceName: string;
  deviceId: string;
  oldPrice: number;
  newPrice: number;
  affiliateUrl: string;
  inStock: boolean;
}): EmailTemplate {
  const savings = params.oldPrice - params.newPrice;
  const percentOff = Math.round((savings / params.oldPrice) * 100);

  const { html, text } = baseEmailTemplate({
    title: `Price Drop: ${params.deviceName}`,
    preheader: `Save $${savings} (${percentOff}% off) - Limited stock at this price`,
    body: `
      <div style="background: linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0.05) 100%); border: 2px solid #FF6B00; border-radius: 12px; padding: 32px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #FF6B00; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">PRICE DROP ALERT</p>
        <p style="margin: 0; font-size: 48px; color: #ffffff; font-weight: 800;">$${params.newPrice}</p>
        <p style="margin: 8px 0 0; font-size: 16px; color: #888;">
          <span style="text-decoration: line-through;">$${params.oldPrice}</span>
          <span style="color: #39FF14; margin-left: 8px; font-weight: 600;">Save $${savings}</span>
        </p>
      </div>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        Hi there,
      </p>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        The <strong style="color: #fff;">${params.deviceName}</strong> you viewed just dropped in price! 
        This is a significant discount that may not last long.
      </p>
      
      ${!params.inStock ? `
      <div style="background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0; font-size: 14px; color: #FF3333; font-weight: 600;">
          ⚠ Low Stock Alert: Only a few units left at this price
        </p>
      </div>
      ` : ""}
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Why this matters:</p>
        <ul style="margin: 0; padding-left: 20px; color: #ccc; line-height: 1.8;">
          <li>Lower upfront cost = faster ROI</li>
          <li>Bitcoin mining hardware prices are volatile</li>
          <li>This discount pays for ${Math.floor(savings / 5)} days of electricity</li>
        </ul>
      </div>
    `,
    cta: { text: "View Deal & Check Stock", url: params.affiliateUrl },
    footer: `
      Price alerts are sent when we detect significant discounts. 
      <a href="${SITE_CONFIG.url}/unsubscribe?email={{email}}&type=price-alerts" style="color: #888;">Unsubscribe from price alerts only</a>.
    `,
  });

  return {
    subject: `Price Drop: ${params.deviceName} down $${savings} (${percentOff}% off)`,
    html,
    text,
  };
}

// ============================================================================
// Template 4: Setup Guide (Post-Purchase)
// ============================================================================

export function getSetupGuideTemplate(params: {
  email: string;
  deviceName: string;
  deviceId: string;
  quizResult: string;
  estimatedDelivery?: string;
}): EmailTemplate {
  const isSolo = params.quizResult === "solo_miner";

  const { html, text } = baseEmailTemplate({
    title: "Your Miner Arrives Soon? Let's Get Ready",
    preheader: "Unboxing checklist, pool setup guide, and community links",
    body: `
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        Exciting times! Your ${params.deviceName} should be arriving soon. 
        Here's everything you need to get mining.
      </p>
      
      ${params.estimatedDelivery ? `
      <div style="background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0; font-size: 14px; color: #00F0FF;">
          📦 Estimated delivery: ${params.estimatedDelivery}
        </p>
      </div>
      ` : ""}
      
      <h3 style="font-size: 18px; color: #fff; margin: 0 0 16px;">📋 Unboxing Checklist</h3>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <ul style="margin: 0; padding-left: 20px; color: #ccc; line-height: 2;">
          <li>Inspect packaging for damage</li>
          <li>Verify all cables and power supplies included</li>
          <li>Check for physical damage to the unit</li>
          <li>Take photos before powering on (for warranty)</li>
          <li>Find a suitable location (cool, ventilated, accessible)</li>
        </ul>
      </div>
      
      <h3 style="font-size: 18px; color: #fff; margin: 0 0 16px;">⚡ Power & Network Setup</h3>
      
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <ul style="margin: 0; padding-left: 20px; color: #ccc; line-height: 2;">
          <li>Ensure adequate power (check your breaker capacity)</li>
          <li>Use a surge protector or UPS if possible</li>
          <li>Connect to your router via Ethernet (WiFi is unreliable for mining)</li>
          <li>Power on and wait for the status LED</li>
        </ul>
      </div>
      
      <h3 style="font-size: 18px; color: #fff; margin: 0 0 16px;">${isSolo ? "🎰 Solo Mining Setup" : "🏊 Pool Mining Setup"}</h3>
      
      <div style="background: ${isSolo ? "rgba(147,51,234,0.1)" : "rgba(6,182,212,0.1)"}; border: 1px solid ${isSolo ? "rgba(147,51,234,0.3)" : "rgba(6,182,212,0.3)"}; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <p style="margin: 0 0 12px; font-size: 15px; color: #ccc; line-height: 1.6;">
          ${isSolo
            ? "You're set up for <strong style='color: #fff;'>solo mining</strong>. This is high-risk, high-reward. You'll only get paid when you find a block (which could be never), but you keep the full reward (3.125 BTC + fees)."
            : "You're set up for <strong style='color: #fff;'>pool mining</strong>. This gives you steady, predictable income. You'll join thousands of other miners and get paid based on your contribution."
          }
        </p>
        <p style="margin: 0; font-size: 14px; color: #888;">
          ${isSolo
            ? "Configure your miner with a solo pool like CKPool or use the Solo CKPool software."
            : "Popular pools: Foundry USA, Antpool, F2Pool, or Slush Pool. Use the Stratum URL they provide."
          }
        </p>
      </div>
      
      <h3 style="font-size: 18px; color: #fff; margin: 0 0 16px;">📺 Video Tutorials</h3>
      
      <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 24px;">
        • <a href="https://youtube.com" style="color: #00F0FF; text-decoration: none;">${params.deviceName} Setup Guide</a> (10 min)<br>
        • <a href="https://youtube.com" style="color: #00F0FF; text-decoration: none;">Pool Configuration Walkthrough</a> (5 min)<br>
        • <a href="https://youtube.com" style="color: #00F0FF; text-decoration: none;">Troubleshooting Common Issues</a> (8 min)
      </p>
    `,
    cta: { text: "Join Our Discord Community", url: "https://discord.gg/solomine" },
    footer: `
      Need help? Reply to this email or join our Discord community. 
      Remember: Mining generates heat and noise. Ensure proper ventilation!
    `,
  });

  return {
    subject: `Your ${params.deviceName} arrives soon? Here's your setup guide`,
    html,
    text,
  };
}

// ============================================================================
// Unsubscribe Confirmation Template
// ============================================================================

export function getUnsubscribeConfirmationTemplate(params: { email: string }): EmailTemplate {
  const { html, text } = baseEmailTemplate({
    title: "You've Been Unsubscribed",
    preheader: "We're sorry to see you go",
    body: `
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        Hi there,
      </p>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        You've been successfully unsubscribed from all Solo Mine emails. 
        You won't receive any more mining tips, price alerts, or updates.
      </p>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0 0 20px;">
        Changed your mind? You can always 
        <a href="${SITE_CONFIG.url}/quiz" style="color: #FF6B00; text-decoration: none;">retake the quiz</a> 
        or 
        <a href="${SITE_CONFIG.url}" style="color: #FF6B00; text-decoration: none;">visit our website</a> 
        anytime.
      </p>
      
      <p style="font-size: 16px; color: #ccc; line-height: 1.6; margin: 0;">
        Good luck with your Bitcoin journey!
      </p>
    `,
    footer: `This is an automated message confirming your unsubscribe request.`,
  });

  return {
    subject: "You've been unsubscribed",
    html,
    text,
  };
}
