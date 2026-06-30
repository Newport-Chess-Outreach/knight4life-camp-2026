# Setup Guide — Knight4Life Summer Camp Registration Site

This guide walks through everything needed to make registrations fully functional. Budget about 20–30 minutes the first time through. Parts 1–4 must be done in order.

**What you're setting up:**
- **GitHub** — stores your site files so Netlify can deploy them
- **Netlify** — hosts the site and runs the registration functions
- **Google Sheets** — saves every registration as a spreadsheet row

> **Payment note:** Camp fees are collected manually via Zelle after registration. Registrants see Zelle instructions on the success page. No payment processor integration is required.

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
| `SHEETS_WEB_APP_URL` | your Google Apps Script URL (from Part 3) |
| `SITE_URL` | your Netlify URL, e.g. `https://charming-panda-123.netlify.app` |

After adding all values, trigger a fresh deploy: **Deploys → Trigger deploy → Deploy site**.

---

## Part 3 — Google Sheets (storing registrations)

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

## Part 4 — Test before going public

Run through the full flow on your live Netlify URL:

1. Go to the camp detail page and click **Register Now**
2. Fill out all five steps of the form
3. Click **Submit Registration** — you should land on the success page with Zelle payment instructions
4. Confirm a row appears in the **Registrations** tab of your Google Sheet with Payment Status = **Pending Zelle**

---

## Part 5 — Collecting Zelle payments

After a family submits the registration form, they see your Zelle QR code and phone number on the success page. To activate this:

1. Open `register-success.html` in a text editor
2. Replace `(PHONE NUMBER HERE)` with your actual Zelle phone number (e.g. `(425) 598-4787`)
3. Replace the QR code placeholder div with an `<img>` tag pointing to your Zelle QR code image (upload the image to your project folder first):
   ```html
   <img src="zelle-qr.png" alt="Zelle QR Code" style="width:320px;height:320px;object-fit:contain;">
   ```
4. Commit and push to GitHub — Netlify redeploys automatically

When you receive a Zelle payment, open the Google Sheet and manually update the **paymentStatus** column for that row from `Pending Zelle` to `Paid`.

---

## Part 6 — Connect your existing domain (optional)

Do this after Part 4 (testing) passes cleanly. Your domain's DNS is managed in **Cloudflare**, so all the steps below use the Cloudflare dashboard.

> If someone else owns the domain and added you as a member, you'll need the **DNS** permission role or higher to complete Step 3 yourself. Otherwise, send them the table of values in Step 3 and they can add the records in about 5 minutes.

### Step 1 — Tell Netlify about your domain

1. In Netlify, open your site and go to **Site configuration → Domain management**
2. Click **Add a domain**
3. Type your full domain name (e.g. `yoursite.org`) and click **Verify** → **Add domain**
4. Netlify will show you a screen with DNS instructions — **leave this tab open**, you'll need it in the next step

### Step 2 — Decide what you're pointing (root vs. subdomain)

**Option A — Root domain** (`yoursite.org` with no prefix)
This makes your camp site the main site at your domain.

**Option B — Subdomain** (`camp.yoursite.org`)
This leaves your main domain untouched and puts the camp site at a prefix. This is the safer option if anything else is already hosted at your `.org` domain.

---

### Step 3 — Add DNS records in Cloudflare

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select your domain from the account list
3. In the left sidebar, click **DNS → Records**
4. Click **Add record**

**If you chose Option A (root domain — `yoursite.org`):**

Add a record of type **A**:

| Field | Value |
|---|---|
| Type | `A` |
| Name | `@` (means the root domain) |
| IPv4 address | `75.2.60.5` |
| Proxy status | **DNS only** (click the orange cloud icon so it turns grey) |
| TTL | Auto |

> `75.2.60.5` is Netlify's load balancer IP. Netlify also shows this value in their Domain management panel — use whatever IP they display there in case it has changed.

Click **Save**, then click **Add record** again for the `www` version:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `www` |
| Target | your Netlify URL, e.g. `charming-panda-123.netlify.app` |
| Proxy status | **DNS only** (grey cloud) |
| TTL | Auto |

**If you chose Option B (subdomain — e.g. `camp.yoursite.org`):**

Add a single **CNAME** record:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `camp` (just the prefix, not the full domain) |
| Target | your Netlify URL, e.g. `charming-panda-123.netlify.app` |
| Proxy status | **DNS only** (grey cloud) |
| TTL | Auto |

> **The single most important Cloudflare-specific step:** for every record above, the **Proxy status** must be set to **DNS only** (grey cloud icon), not **Proxied** (orange cloud icon). Cloudflare's orange-cloud proxy and Netlify's own SSL/CDN can't both sit in front of the same record — leaving it proxied is the most common reason a Netlify custom domain fails to provision SSL. Click the cloud icon next to the record to toggle it.

---

### Step 4 — Wait for DNS to propagate

DNS changes are not instant. Cloudflare is generally one of the faster DNS providers, so propagation is typically **5–30 minutes**, occasionally up to a few hours. You can check progress at [dnschecker.org](https://dnschecker.org) — type your domain and look for your new record showing up across locations.

---

### Step 5 — HTTPS / SSL (automatic)

Once Netlify detects that DNS is pointing correctly, it automatically provisions a free SSL certificate via Let's Encrypt. You'll see the status change from "Awaiting DNS" to **"Netlify DNS verified"** and then **"Certificate provisioned"** in the Domain management panel. This usually happens within a few minutes of DNS propagating — assuming the Proxy status was set to **DNS only** in Step 3.

You don't need to do anything — just wait and refresh the panel.

---

### Step 6 — Update SITE_URL in Netlify

Once your custom domain is live, update the `SITE_URL` environment variable so that success-page redirects use your real domain:

1. Go to **Site configuration → Environment variables**
2. Edit `SITE_URL` and change it to your custom domain, e.g. `https://yoursite.org`
3. Trigger a fresh deploy: **Deploys → Trigger deploy → Deploy site**

---

### Troubleshooting

**"Certificate provisioning" is stuck:** This is almost always the Proxy status. Go back to Cloudflare → DNS → Records and confirm the cloud icon next to each record pointing to Netlify is **grey** (DNS only), not orange (Proxied).

**The site loads but shows a security warning:** SSL hasn't provisioned yet. Wait 10–15 more minutes and try again — and double-check the proxy toggle as above.

**Nothing loads at all:** Double-check the record values in Cloudflare. A common mistake is typing the full domain in the **Name** field (e.g. `camp.yoursite.org` instead of just `camp`).

**Email stopped working after I changed DNS:** If you changed nameservers or edited MX records, double-check those weren't affected. For the A and CNAME records added above, email (MX records) should be untouched.

**I don't have permission to edit DNS:** If you were added to the Cloudflare account as a member without the DNS role, ask the domain owner to add the records from Step 3, or to grant you the DNS edit permission.

### Removing the domain later

If you ever want to move this domain to a different site:

1. In Netlify: **Site configuration → Domain management**, click the **⋯** next to the domain, select **Remove domain**
2. In Cloudflare: delete the A and CNAME records you added above (DNS → Records)
3. Add new DNS records pointing at wherever the domain is going next

DNS will take the same 10–60 minutes (or less, on Cloudflare) to propagate the change.

---

## Notes

**Refunds:** Process directly through your bank's Zelle interface.

**Editing a submitted registration:** Open the Google Sheet and edit the row directly.

**Making changes to the website:** Edit files on your computer, then open GitHub Desktop, write a short commit summary, click **Commit to main**, then **Push origin**. Netlify redeploys automatically within about a minute.

**Updating camp details (dates, cost, description, etc.):** Edit `data.js` — all content for the camp detail page lives there. No other files need to change.