# Setup Guide — Knight4Life Summer Camp Registration Site

This guide walks through everything needed to make registrations and payments fully functional. Budget about 45–60 minutes the first time through. Parts 1–5 must be done in order.

**What you're setting up:**
- **GitHub** — stores your site files so Netlify can deploy them
- **Netlify** — hosts the site and runs the payment functions
- **Stripe** — handles all card payments for camp registrations
- **Google Sheets** — saves every registration as a spreadsheet row

---

## Part 1 — GitHub (putting your files online)

**1. Install GitHub Desktop**
Go to [desktop.github.com](https://desktop.github.com) and download the app. Install it like any normal application.

**2. Create a free GitHub account**
Go to [github.com](https://github.com) and sign up. Open GitHub Desktop and sign in.

**3. Create a repository from your project folder**
1. In GitHub Desktop, click **File → New Repository**
2. Name it `knight4life-camp-2026` (no spaces)
3. For "Local Path," click **Choose** and select the folder containing `index.html`, `styles.css`, and all other site files
4. Leave everything else as default and click **Create Repository**

**4. Commit and publish**
1. All project files should be listed with checkboxes — they should all be checked
2. In the bottom-left "Summary" box, type `Initial commit`
3. Click **Commit to main**
4. Click **Publish repository** (top-right blue button)
5. Make sure "Keep this code private" is **unchecked** — Netlify needs to read your files
6. Click **Publish Repository**

> **Heads up:** If your project folder contains a `node_modules` subfolder, delete it before creating the repository. Netlify recreates it automatically.

---

## Part 2 — Netlify (hosting the site)

**1. Create a free Netlify account**
Go to [netlify.com](https://netlify.com) and sign up using GitHub.

**2. Import your repository**
1. In Netlify, click **Add new site → Import an existing project**
2. Click **GitHub** and authorize Netlify
3. Select `knight4life-camp-2026`
4. On the build settings screen:
   - **Build command:** leave blank
   - **Publish directory:** type a single dot — `.`
5. Click **Deploy site**

Netlify gives your site a random URL like `https://charming-panda-123.netlify.app`. You can rename it under **Site configuration → Change site name**.

**3. Add environment variables**
Go to **Site configuration → Environment variables** and add:

| Key | Value |
|---|---|
| `STRIPE_SECRET_KEY` | your Stripe secret key (from Part 3) |
| `SHEETS_WEB_APP_URL` | your Google Apps Script URL (from Part 4) |
| `STRIPE_WEBHOOK_SECRET` | your Stripe webhook signing secret (from Part 5) |
| `SITE_URL` | your Netlify URL, e.g. `https://charming-panda-123.netlify.app` |

After adding all values, trigger a fresh deploy: **Deploys → Trigger deploy → Deploy site**.

---

## Part 3 — Stripe (payments)

**1. Create a Stripe account**
Go to [stripe.com](https://stripe.com) and sign up. Stay in **Test mode** while setting up.

**2. Copy your secret key**
Go to **Developers → API keys**. Copy the **Secret key** (starts with `sk_test_...`).

Paste this into `STRIPE_SECRET_KEY` in Netlify.

> Never paste this key into any HTML, JS, or CSS file — only into Netlify's environment variables.

---

## Part 4 — Google Sheets (storing registrations)

Every registration is saved as a row in a Google Sheet you control. The "Registrations" tab is created automatically on the first submission.

**1. Create the spreadsheet**
Go to [sheets.new](https://sheets.new). Name it **Knight4Life Summer Camp 2026 — Registrations**.

**2. Open Apps Script**
In the Sheet, click **Extensions → Apps Script**. A code editor opens in a new tab.

**3. Paste in the script**
Delete all placeholder code in the editor. Open `google-apps-script.js` from your project folder in any text editor, copy all the text, and paste it into the Apps Script editor. Click **Save**.

**4. Deploy as a Web App**
1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Authorize when Google asks (click **Advanced → Go to [project name] (unsafe)** if you see a warning — this is normal for your own scripts)
6. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`)

Paste this URL into `SHEETS_WEB_APP_URL` in Netlify.

> **Updating the script later:** Go back to Extensions → Apps Script, paste updated code, then **Deploy → Manage deployments** → pencil icon → set Version to **New version** → Deploy. Just saving isn't enough — you must create a new version.

---

## Part 5 — Stripe Webhook (confirming payments in your Sheet)

Without a webhook, Stripe won't update your Google Sheet if a parent closes their browser tab right after paying. The webhook fixes this by having Stripe notify your site directly when payment is confirmed.

**Your site must be live on Netlify before doing this step.**

1. In Stripe, go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://YOUR-NETLIFY-SITE/.netlify/functions/stripe-webhook`
3. Select event: **checkout.session.completed**
4. Click **Add endpoint**
5. Click **Reveal** under "Signing secret" and copy the value (starts with `whsec_...`)

Paste this into `STRIPE_WEBHOOK_SECRET` in Netlify, then trigger a fresh deploy.

---

## Part 6 — Test before going public

With Stripe in Test mode, run through the full flow on your live Netlify URL:

1. Go to the camp detail page and click **Register Now**
2. Fill out all five steps of the form
3. On the Stripe checkout page, use test card **4242 4242 4242 4242**, any future expiry (e.g. 12/30), any 3-digit CVC, any ZIP
4. Confirm: you land on the success page, and a row appears in the **Registrations** tab of your Google Sheet with Payment Status = **Paid**

---

## Part 7 — Go live

Once everything tests cleanly:

1. In Stripe, switch to **Live mode** (toggle top-right)
2. Go to **Developers → API keys** and copy the live Secret key (starts with `sk_live_...`)
3. Update `STRIPE_SECRET_KEY` in Netlify with the live key
4. Repeat Part 5 to create a **new webhook in live mode** — test and live webhooks are separate
5. Update `SITE_URL` in Netlify to your final domain if you've connected a custom one
6. Trigger a fresh deploy
7. Do one real small test (or a free registration if you have one) to confirm everything works end-to-end

---

## Notes

**Confirmation emails:** Stripe automatically sends a payment receipt if receipt emails are enabled in your Stripe account — go to **Settings → Customer emails** to turn this on.

**Refunds:** Handled directly in the Stripe Dashboard under **Payments**.

**Editing a submitted registration:** Open the Google Sheet and edit the row directly.

**Making changes to the website:** Edit files on your computer, then open GitHub Desktop, write a short commit summary, click **Commit to main**, then **Push origin**. Netlify redeploys automatically within about a minute.

**Updating camp details (dates, cost, description, etc.):** Edit `data.js` — all content for the camp detail page lives there. No other files need to change.
