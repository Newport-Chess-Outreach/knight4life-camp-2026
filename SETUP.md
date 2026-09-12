# Newport Chess Outreach — editing the two-page site

The website has exactly two pages: `index.html` (Home) and `about.html` (About).
Open `index.html` in a browser to preview it. No build or package installation is required.
Keep `styles.css`, `script.js`, `data.js`, and `logo.png` beside both HTML files.
The existing Google Fonts stylesheet remains linked on both pages.

## Edit the three Impact values

Open `index.html` and search for `IMPACT VALUE`.
Replace only the text between the opening and closing `div` tags:

| Metric | Element ID | Text to replace |
| --- | --- | --- |
| Money Raised | `impact-money-raised` | `[AMOUNT]` (include your currency symbol) |
| School Districts Represented | `impact-school-districts` | `[COUNT]` |
| Participants | `impact-participants` | `[COUNT]` |

Use the number of school districts your participants have been part of, and the total number of participants. No statistics have been supplied. Each value has its own explanatory HTML comment. The values are static: JavaScript does not render or animate them, so your edits remain intact.

## Insert your Zelle QR image

Save your actual QR image as `zelle-qr.png` beside `index.html` (or use another filename and update `src`). In `index.html`, search for `ZELLE QR CODE` and replace this entire placeholder:

```html
<div class="placeholder ratio-1-1 zelle-qr">
  <span>Zelle QR code goes here</span>
</div>
```

with:

```html
<img class="zelle-qr" src="zelle-qr.png" alt="Scan to donate to Newport Chess Outreach through Zelle" width="280" height="280">
```

The shared class keeps the image square and responsive without cropping it. Use your original square QR image, including its white border. No QR code or payment details have been generated.

## Other content

- The About page content remains in `about.html`; board profiles and organizational values remain in `data.js`.
- The Events section is static and says “No upcoming events.” Its event cards and the event registration announcements have been removed.
- Existing photo, contact, and social placeholders remain as supplied. The footer social links using `#` need your real URLs when available.
- The board has two directors: President Daniel Zhang and a Vice President. In `data.js`, replace `[Vice President name]` and `[Vice President bio]` with the actual details. Board LinkedIn buttons and the Growing Our Team section have been removed.
- The legacy `google-apps-script.js` is retained for reference only. Neither page loads it, and the site no longer calls a registration, newsletter, donation, or payment backend. The previous Stripe dependency and setup instructions are no longer needed.

Only `index.html` and `about.html` were present in the supplied folder. No additional HTML files existed to delete; links and behavior for the absent pages have been removed.
