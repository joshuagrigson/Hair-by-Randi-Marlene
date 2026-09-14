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
| `hairbyrandi_background.png` | full-page velvet background |
| `randi_website_photo.jpg` | portrait in the About section |
| `fav.ico`, `fav-32.png`, `fav-512.png`, `fav-apple.png` | favicons |
| `_redirects` | Netlify catch-all so deep links land on the page |

## Booking flow

1. Pick services from the menu → sticky cart bar appears at the bottom
2. **Book Appointment** → add-on offers (only when the cart triggers one)
3. Choose a day → choose a time → name/email/phone → confirmed

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

**Vacation notice** — the sticky bar at the top:

```js
const VACATION = {
  showFrom : '2026-09-14',   // first day the reminder appears
  firstDay : '2026-10-04',   // first day away
  lastDay  : '2026-10-12',   // last day away — banner disappears after this
  blockDays: true,           // also grey those days out in the booking calendar
  key      : 'randi-vaca-2026-10'
};
```

Change `key` whenever you set a new vacation, so anyone who dismissed the old
one still sees the new one. Dismissing hides it for that visit only — it comes
back next time they open the site.
