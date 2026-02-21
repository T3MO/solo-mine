/**
 * Email Capture Integration Examples
 * 
 * This file shows how to integrate the email capture system
 * into various parts of the application.
 */

// ============================================================================
// Example 1: Quiz Results Page Integration
// ============================================================================

/*
In your quiz results page (after the user completes the quiz):

"use client";

import { useQuizCapture } from "@/hooks/useEmailCapture";
import { CaptureModal } from "@/components/email/capture-modal";

export function QuizResultPage({ result }) {
  const { modalProps } = useQuizCapture({
    type: result.type,
    recommendedDevice: result.recommendedDevice,
  });

  return (
    <>
      <YourResultContent result={result} />
      
      <CaptureModal {...modalProps} />
    </>
  );
}
*/

// ============================================================================
// Example 2: Simulator Page Integration
// ============================================================================

/*
In your variance simulator page:

"use client";

import { useSimulatorCapture } from "@/hooks/useEmailCapture";
import { CaptureModal, CaptureButton } from "@/components/email/capture-modal";

export function SimulatorPage() {
  const [config, setConfig] = useState({
    device: "bitaxe-gamma",
    electricityRate: 0.12,
    mode: "pool",
  });
  
  const [runCount, setRunCount] = useState(0);
  
  const { modalProps, incrementRunCount } = useSimulatorCapture(config);

  const handleRunSimulation = () => {
    // Run your simulation logic
    runSimulation(config);
    
    // Track run count for capture trigger
    incrementRunCount();
    setRunCount(prev => prev + 1);
  };

  return (
    <>
      <div className="simulator-controls">
        {/* Your simulator UI */}
        
        <div className="flex gap-4">
          <Button onClick={handleRunSimulation}>
            Run Simulation
          </Button>
          
          {/* Manual capture trigger */}
          <CaptureButton onClick={() => modalProps.onClose()}>
            Email My Results
          </CaptureButton>
        </div>
        
        {runCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Run #{runCount}
          </p>
        )}
      </div>
      
      <CaptureModal {...modalProps} />
    </>
  );
}
*/

// ============================================================================
// Example 3: Hardware Card Integration (Exit Intent)
// ============================================================================

/*
In your hardware grid or detail page:

"use client";

import { useExitIntentCapture } from "@/hooks/useEmailCapture";
import { CaptureModal } from "@/components/email/capture-modal";

export function HardwarePage() {
  const [viewedDevices, setViewedDevices] = useState(0);
  const { modalProps, triggerCapture } = useExitIntentCapture();

  const handleDeviceView = (deviceId: string) => {
    setViewedDevices(prev => {
      const newCount = prev + 1;
      // Trigger capture after viewing 2+ devices
      if (newCount >= 2) {
        triggerCapture();
      }
      return newCount;
    });
  };

  return (
    <>
      <div className="hardware-grid">
        {devices.map(device => (
          <HardwareCard 
            key={device.id} 
            device={device}
            onView={() => handleDeviceView(device.id)}
          />
        ))}
      </div>
      
      <CaptureModal {...modalProps} />
    </>
  );
}
*/

// ============================================================================
// Example 4: Manual Trigger (Footer Newsletter)
// ============================================================================

/*
In your footer or newsletter section:

"use client";

import { useState } from "react";
import { CaptureModal } from "@/components/email/capture-modal";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="newsletter-section">
        <h3>Get Weekly Mining Insights</h3>
        <p>Price alerts, profitability updates, and setup guides.</p>
        <Button onClick={() => setIsOpen(true)}>
          Subscribe
        </Button>
      </div>
      
      <CaptureModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trigger="manual"
      />
    </>
  );
}
*/

// ============================================================================
// Example 5: Dashboard Integration
// ============================================================================

/*
In your dashboard page - show capture for non-subscribers:

"use client";

import { useEffect, useState } from "react";
import { CaptureModal } from "@/components/email/capture-modal";

export function DashboardPage() {
  const [hasCaptured, setHasCaptured] = useState(false);
  const [showCapture, setShowCapture] = useState(false);

  useEffect(() => {
    // Check if user has already subscribed
    const captured = localStorage.getItem("solo-mine-email-captured");
    if (!captured) {
      // Show after 10 seconds on dashboard
      const timer = setTimeout(() => setShowCapture(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setHasCaptured(true);
    }
  }, []);

  return (
    <>
      <DashboardContent />
      
      {!hasCaptured && (
        <CaptureModal
          isOpen={showCapture}
          onClose={() => setShowCapture(false)}
          trigger="manual"
        />
      )}
    </>
  );
}
*/

// ============================================================================
// Environment Variables Setup
// ============================================================================

/*
Create a .env.local file with:

# Supabase (for database + Resend integration)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for sending emails)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@solomine.io
RESEND_REPLY_TO=support@solomine.io

# ConvertKit (alternative to Supabase/Resend)
# CONVERTKIT_API_KEY=your_ck_api_key
# CONVERTKIT_API_SECRET=your_ck_secret
# CONVERTKIT_FORM_ID=your_form_id

# Admin (for stats API)
ADMIN_API_KEY=your-secret-admin-key

# Optional: Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=solomine.io
*/

// ============================================================================
// Deployment Checklist
// ============================================================================

/*
Before deploying:

1. Set up Supabase:
   - Create project at supabase.com
   - Run the schema.sql file in SQL Editor
   - Copy URL and service role key to env

2. Set up Resend:
   - Sign up at resend.com
   - Verify your domain
   - Create API key and add to env

3. Configure webhooks:
   - In Resend dashboard, add webhook URL:
     https://your-site.com/api/webhooks/email
   - Select events: delivered, opened, clicked, bounced, complained

4. Test the flow:
   - Subscribe with your email
   - Check Supabase for subscriber record
   - Check email receipt
   - Test unsubscribe flow

5. Set up ConvertKit (if using instead):
   - Create form in ConvertKit
   - Get API key and form ID
   - Disable Supabase/Resend env vars
   - Test subscription

6. Legal compliance:
   - Review privacy policy
   - Ensure unsubscribe link works
   - Add physical address to email footer (if required)
*/
