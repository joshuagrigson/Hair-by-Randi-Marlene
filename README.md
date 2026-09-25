# Hair by Randi Marlene

Source for **hairbyrandimarlene.com** — Randi's salon site at *A Cut Above Others*,
3505 Summerhill Rd, Texarkana TX.

A single static page. Booking talks to the `randi-booking` Cloudflare Worker,
which talks to Square Appointments (buyer-level Bookings API).

## Files

This folder **is** the deploy. Drop the whole thing on Netlify — don't upload
`index.html` on its own or the images and favicons get orphaned.

| File | |
|---|---|
| `index.html` | the entire site — markup, styles and booking logic |
| `img/hero-900/1400/2168.webp` | header artwork; the browser picks the size the screen needs |
| `img/velvet-900/1672.webp` | full-page velvet background |
| `img/randi-600/941.webp` | portrait in the About section |
| `img/og-card.jpg` | 1200×630 link preview shown when the site is texted or shared |
| `fav.ico`, `fav-32.png`, `fav-512.png`, `fav-apple.png` | favicons |
| `_redirects` | Netlify catch-all so deep links land on the page |

`hairbyrandi_header.png`, `hairbyrandi_background.png` and `randi_website_photo.jpg` are the
full-size originals the WebP files were made from. The page no longer loads them; keep them as
the source if the images ever need re-exporting.

## Booking flow

1. Tap services on the menu → sticky bar at the bottom shows count, total and time
2. **Choose a Time** → add-on offers (only when the cart triggers one)
3. Day and time on one screen (a swipeable strip of open days on phones) → details → confirmed
4. Returning visitors who ticked "Remember me" get a **Book Again** card with their usual
   services, and their details pre-filled. This is stored only in their own browser.

## The two things you'll actually want to edit

Both live near the top of the `<script>` block at the bottom of `index.html`.

**Add-on offers** — "if this is in the cart, offer these":

```js
const ADDONS = {
  "Beard Trim"        : ["Express Facial", "Nose Hair Removal"],
  "Men's Cut"         : ["Beard Trim", "Express Facial", "Nose Hair Removal"],
  "Nose Hair Removal" : ["Ear Hair Removal"],
  "Ear Hair Removal"  : ["Nose Hair Removal"]
};
```

Names just have to match something in the `SERVICES` list above it — apostrophe
style and capitalisation don't matter. Anything already in the cart is never
offered, so the screen is skipped entirely when there's nothing left to suggest.

**Vacation notice** — drops down over the top half of the screen, dims the page behind it,
and clears with a **Continue to Booking** button that takes people to the menu. Its wording,
including the day she's back, is worked out from these dates:

```js
const VACATION = {
  showFrom : '2026-09-14',   // first day the notice appears
  firstDay : '2026-10-04',   // first day away
  lastDay  : '2026-10-12',   // last day away — notice stops showing after this
  blockDays: true,           // also mark those days "Away" in the booking calendar
  key      : 'randi-vaca-2026-10'
};
```

Change `key` whenever you set a new vacation, so anyone who dismissed the old
one still sees the new one. Continue to Booking hides it for that visit only — it
comes back next time they open the site.

## Price Pulse (`pricing-pulse/`)

A separate app that lives in this repo but is **not** part of Randi's site — `_redirects`
bounces `/pricing-pulse/*` back to the home page so it never shows up on hairbyrandimarlene.com.
Deploy the `pricing-pulse/` folder on its own.

A business owner picks their industry, state and kind of area, enters what they charge for each
service and **locks it in**. Each service then gets a live heart monitor against the area average:

| Pulse | Price vs area average | Rhythm |
|---|---|---|
| Premium | above 120% | fast beat (blue) |
| Healthy | 92–120% | steady beat (green) |
| Weak | 80–92% | slow, faint beat (amber) |
| Flatline | under 80% | flat line, alarm: "you charge too low" (red) |

The area average starts as a typical US price for the service, scaled by the state's price level
(approximate BEA Regional Price Parities) and the area type. Those are estimates, not a survey. Every
competitor price the owner adds for a service pulls the average toward the real local number (the
estimate counts as two data points). Enter how many of a service you do a week and it shows what
under-pricing costs per month. Everything saves in the owner's own browser; there's a backup download.

The starter prices, state levels and the four bands are constants at the top of the `<script>`
in `pricing-pulse/index.html` (`INDUSTRIES`, `STATES`, `AREAS`, `BANDS`).
