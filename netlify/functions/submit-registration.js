// netlify/functions/submit-registration.js
// ----------------------------------------------------------------------------
// Called by register.html when a family completes the 5-step form.
//
// 1. Saves the full registration to your Google Sheet with status "Pending"
// 2. Returns a redirect URL to the success page
//
// Payment is now handled manually via Zelle — no Stripe integration.
//
// Required environment variables (Netlify → Site settings → Environment variables):
//   SHEETS_WEB_APP_URL   The Google Apps Script Web App URL (see SETUP.md)
//   SITE_URL             e.g. https://www.yoursite.netlify.app
// ----------------------------------------------------------------------------

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

  // ---- Save to Google Sheets -------------------------------------------
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
        paymentStatus: "Pending Zelle",
        ...data
      })
    });
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Could not save your registration. Please try again." })
    };
  }

  // ---- Redirect to success page -----------------------------------------
  return {
    statusCode: 200,
    body: JSON.stringify({
      url: `${siteUrl}/register-success.html?registrationId=${registrationId}`
    })
  };
};