// netlify/functions/stripe-webhook.js
// ----------------------------------------------------------------------------
// Stripe calls this endpoint server-to-server the instant a Checkout Session
// completes. It marks the matching registration row in Google Sheets as Paid.
//
// This runs independently of the browser redirect, so the row is updated even
// if a parent closes the tab immediately after paying.
//
// ---- One-time setup (after this file is deployed) ----
//   1. Stripe Dashboard → Developers → Webhooks → Add an endpoint
//   2. Endpoint URL: https://<your-site>/.netlify/functions/stripe-webhook
//   3. Events to send: checkout.session.completed
//   4. Copy the Signing Secret (starts with whsec_) into a Netlify
//      environment variable named STRIPE_WEBHOOK_SECRET
//
// Required environment variables:
//   STRIPE_SECRET_KEY     — Stripe secret key
//   STRIPE_WEBHOOK_SECRET — webhook signing secret from step 4
//   SHEETS_WEB_APP_URL    — Google Apps Script web app URL
// ----------------------------------------------------------------------------

const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env var.");
    return { statusCode: 500, body: "Server is not configured." };
  }
  if (!process.env.SHEETS_WEB_APP_URL) {
    console.error("Missing SHEETS_WEB_APP_URL env var.");
    return { statusCode: 500, body: "Server is not configured." };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  // Stripe signs the raw bytes — verify against untouched body
  let stripeEvent;
  try {
    const signature = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];
    const rawBody   = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
    stripeEvent     = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: "Invalid signature." };
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  const session = stripeEvent.data.object;

  // Only handle camp registrations (not donations or other session types)
  if (!session.metadata || !session.metadata.registrationId) {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  try {
    const res = await fetch(process.env.SHEETS_WEB_APP_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        action:         "markPaid",
        registrationId: session.metadata.registrationId,
        stripeSessionId: session.id
      })
    });
    const result = await res.json().catch(() => ({}));
    if (!result.ok) {
      throw new Error(result.error || "Google Sheets web app returned an error.");
    }
  } catch (err) {
    console.error("Failed to mark registration as paid in Google Sheets:", err);
    // Return 500 so Stripe retries the webhook automatically
    return { statusCode: 500, body: "Failed to update registration record." };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
