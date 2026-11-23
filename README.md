# Cardora Maldives — storefront concept

A concept redesign of the cardoramdv.com storefront: PlayStation and Xbox gift cards for US and UK accounts, priced in MVR, ordered through a cart that sends the order on WhatsApp.

- **Live preview:** https://cardora-concept.netlify.app (hidden from search engines)
- **What it is:** a front-end design and flow. There is no backend; every order goes out as a prefilled WhatsApp message.
- **Stack:** plain HTML, CSS and JavaScript. No build step, no framework, no package manager.

## Run it locally

Any static file server works. From this folder:

```sh
python -m http.server 5177
```

Then open http://localhost:5177. Opening `index.html` straight from disk also mostly works, but the fonts and libraries load from CDNs, so you need a connection either way.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole storefront: markup, styles and script in one file |
| `login.html`, `register.html` | Sign-in and create-account pages in the same design |
| `assets/auth.css`, `assets/auth.js` | Shared styles and behaviour for the two account pages |
| `assets/cardora-logo.webp` | Cardora logo (copied from cardoramdv.com) |
| `assets/playstation.svg`, `assets/xbox.svg` | Console marks (copied from cardoramdv.com) |
| `og.png` | 1200×630 link-preview image for WhatsApp, Messenger and social shares |

### Inside `index.html`

The file is in three parts: a `<style>` block at the top, the page markup, then one `<script>` at the bottom. The script is split into commented sections (catalogue, configurator, cart, sticky buy bar, help, theme toggle, menu, motion).

## Where the data lives

Everything is hard-coded near the top of the script in `index.html`. These are the parts to replace with your backend:

| Constant | Line (approx.) | Replace with |
|---|---|---|
| `WA` | 922 | WhatsApp number orders are sent to |
| `CARDS` | 927 | Inventory: brand → region → `[face value, MVR price, in stock (1/0)]` |
| `HELP` | 1112 | Region-check and redeem steps shown per console |

`CARDS` mirrors the live site's 24 cards and prices as of 22 November 2026. Every part of the page that shows cards (the builder, the amount tiles, the full price list, the cart, the WhatsApp message) is generated from it, so feeding it from an inventory API is the main integration point. A shape like this would drop straight in:

```js
{
  ps: { us: [[10, 249, 0], [25, 610, 1]], uk: [[10, 339, 1]] },
  xb: { us: [[10, 249, 1]], uk: [[10, 339, 1]] }
}
```

## The order flow

1. The customer picks console, account region and amount in the builder.
2. "Add to cart" stores the line in the browser (`localStorage` key `cardora-concept-cart`). "Order on WhatsApp" skips the cart for a single card.
3. The cart drawer asks for name and delivery email (both optional), then builds one WhatsApp message listing every card, the total in MVR, and the name and email.
4. Stock check, payment and code delivery all happen by hand on WhatsApp, as on the live site today.

When the payment API is ready, step 3 is where an "order created" call to the backend would go, before or instead of the WhatsApp hand-off.

## Placeholders and things to change before going live

- **Account pages:** the fields in `login.html` and `register.html` are read-only sample text on purpose, so a public preview with Cardora's logo can't be mistaken for a phishing page. Wire them to your auth before use.
- **Contact form:** shows a message and sends nothing.
- **Preview markers:** remove the fixed "Concept preview" tag, the concept note in the footer, and the `<meta name="robots" content="noindex,nofollow">` tags.
- **Redeem steps:** written from the PlayStation and Xbox menus; check them against Sony's and Microsoft's current support pages.
- **Claims:** "Digital delivery" and similar wording should match your real delivery times and opening hours.
- **Card artwork:** the gift card faces are drawn in CSS with the console marks. Microsoft's trademark guidelines require a licence to use its logos and imagery; check with your supplier or the brands before launch.

## Libraries and external resources

- GSAP 3.12.5 and ScrollTrigger (cdnjs): all scroll and entrance animation
- Lenis 1.1.14 (unpkg): smooth scrolling
- Google Fonts: Instrument Sans, Geist Mono

Animation is skipped entirely when the visitor's device asks for reduced motion, and the page works without JavaScript animation libraries loading (content stays visible).

## Porting to a framework

The live cardoramdv.com is a Next.js app, so this is most useful as a reference to rebuild from rather than files to copy in. A natural split into components:

- Nav (with theme toggle, account menu and cart button)
- Hero (floating cards)
- Card builder (console, region, amount, price, actions)
- Full price list
- How it works (order ticket)
- Region and redeem guide
- Benefit tiles
- Contact
- Cart drawer
- Sticky buy bar (phones only)

The colours, radii and fonts are CSS custom properties on `:root` at the top of `index.html`, with a light theme under `:root[data-theme="light"]`, so they can move into a theme file as they are.

## Theme

Dark by default. The toggle stores the choice in `localStorage` (`cardora-concept-theme`), and the account pages read the same key.
