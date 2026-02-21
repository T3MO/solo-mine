import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your data at Solo Mine.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Introduction</h2>
          <p>
            {SITE_CONFIG.name} ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website and use our educational tools.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-2">Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Email Address:</strong> When you subscribe to receive your mining assessment, 
              price alerts, or newsletters. We use this solely to send you the information you requested.
            </li>
            <li>
              <strong>Quiz Answers:</strong> Your responses to the "Should I Mine?" quiz are stored 
              locally in your browser and optionally sent to us when you request an email summary.
            </li>
            <li>
              <strong>Simulator Configurations:</strong> Device selections, electricity rates, and 
              simulation preferences are stored locally unless you explicitly save and email them.
            </li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-2">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Analytics:</strong> We use Plausible Analytics, a privacy-focused analytics 
              tool that does not use cookies and does not collect personal data. It tracks aggregated 
              page views and events without identifying individual users.
            </li>
            <li>
              <strong>Technical Data:</strong> Basic server logs including IP address (anonymized), 
              browser type, and access times for security and performance monitoring.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To send your personalized mining assessment and hardware recommendations</li>
            <li>To notify you of price drops on hardware you're interested in</li>
            <li>To send weekly profitability updates for your saved configurations</li>
            <li>To improve our educational tools and content</li>
            <li>To detect and prevent abuse of our services</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Data Storage and Security</h2>
          <p>
            We store subscriber data securely using industry-standard encryption. Email addresses 
            and associated data are stored in:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Supabase:</strong> For our primary database, using row-level security and 
              encrypted connections.
            </li>
            <li>
              <strong>ConvertKit:</strong> If you subscribed through our ConvertKit integration, 
              your data is subject to their privacy policy and security practices.
            </li>
          </ul>
          <p className="mt-4">
            We never sell your personal information to third parties. We do not share your email 
            address with hardware manufacturers or affiliate partners.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Affiliate Links</h2>
          <p>
            Our website contains affiliate links to hardware products. When you click these links 
            and make a purchase, we may earn a commission at no additional cost to you. We only 
            recommend products we have researched and believe provide value. Affiliate relationships 
            do not influence our educational content or recommendations.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Cookies and Local Storage</h2>
          <p>
            We use browser local storage to save your quiz progress, simulator configurations, 
            and preferences. This data stays on your device and is not sent to our servers unless 
            you explicitly request an email summary.
          </p>
          <p className="mt-2">
            We do not use tracking cookies. Our analytics (Plausible) is cookie-free and GDPR-compliant.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Unsubscribe from emails at any time</li>
            <li>Object to processing of your data</li>
            <li>Export your data in a portable format</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Unsubscribe</h2>
          <p>
            You can unsubscribe from our emails at any time by clicking the "Unsubscribe" link 
            at the bottom of any email we send. You can also email us at{" "}
            <a href="mailto:privacy@solomine.io" className="text-primary hover:underline">
              privacy@solomine.io
            </a>{" "}
            to request removal.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Children's Privacy</h2>
          <p>
            Our website is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Email: <a href="mailto:privacy@solomine.io" className="text-primary hover:underline">privacy@solomine.io</a></li>
            <li>Website: <a href={SITE_CONFIG.url} className="text-primary hover:underline">{SITE_CONFIG.url.replace("https://", "")}</a></li>
          </ul>

          <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              By using our website, you consent to our Privacy Policy. If you do not agree with 
              this policy, please do not use our website or services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
