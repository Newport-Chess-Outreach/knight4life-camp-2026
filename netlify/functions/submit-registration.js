// netlify/functions/submit-registration.js
// ----------------------------------------------------------------------------
// Called by register.html when a family completes the 5-step form.
//
// 1. Saves the full registration to your Google Sheet with status "Pending"
// 2. Creates a Stripe Checkout Session for the camp fee and returns the URL
// 3. (Free events would skip Stripe, but this camp always has a cost)
//
// Required environment variables (Netlify → Site settings → Environment variables):
//   STRIPE_SECRET_KEY    Stripe Dashboard → Developers → API keys
//   SHEETS_WEB_APP_URL   The Google Apps Script Web App URL (see SETUP.md)
//   SITE_URL             e.g. https://www.yoursite.netlify.app
// ----------------------------------------------------------------------------

const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
  }

  const required = ["parentEmail", "eventSlug", "eventTitle", "participantFirstName"];
  for (const field of required) {
    if (!data[field]) {
      return { statusCode: 400, body: JSON.stringify({ error: `Missing field: ${field}` }) };
    }
  }

  const amountCents = parseInt(data.amountCents, 10) || 0;
  const registrationId =
    "REG-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const siteUrl = process.env.SITE_URL || `https://${event.headers.host}`;

  // ---- 1) Save to Google Sheets as Pending ----------------------------
  if (!process.env.SHEETS_WEB_APP_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is not configured (missing SHEETS_WEB_APP_URL)." })
    };
  }
  try {
    await fetch(process.env.SHEETS_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "newRegistration",
        registrationId,
        amountCents,
        paymentStatus: amountCents > 0 ? "Pending" : "N/A (free event)",
        ...data
      })
    });
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Could not save your registration. Please try again." })
    };
  }

  // ---- 2) Free event — done, no payment needed ------------------------
  if (amountCents <= 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: `${siteUrl}/register-success.html?registrationId=${registrationId}&free=true`
      })
    };
  }

  // ---- 3) Paid event — create a Stripe Checkout Session ---------------
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is not configured (missing STRIPE_SECRET_KEY)." })
    };
  }
  try {
    const stripe  = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode:                 "payment",
      payment_method_types: ["card"],
      customer_email:       data.parentEmail,
      line_items: [
        {
          price_data: {
            currency:     "usd",
            product_data: { name: `${data.eventTitle} — Registration` },
            unit_amount:  amountCents
          },
          quantity: 1
        }
      ],
      metadata:    { registrationId, eventSlug: data.eventSlug },
      success_url: `${siteUrl}/register-success.html?registrationId=${registrationId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/register.html?canceled=true`
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe error: " + err.message }) };
  }
};
