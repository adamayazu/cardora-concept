# Cardora Maldives — storefront concept

A concept redesign of the cardoramdv.com storefront for three categories: gift cards, game keys and game credits. Customers pick a product, send the order on WhatsApp, and the team confirms stock and the MVR price before payment.

- **Live preview:** https://cardora-concept.netlify.app (hidden from search engines)
- **What it is:** a front-end design and flow. There is no backend; every order goes out as a prefilled WhatsApp message.
- **Stack:** plain HTML, CSS and JavaScript. No build step, no framework, no package manager.

This is the second version. The first concept (PlayStation and Xbox only, with prices) is kept in [`v1/`](v1/) and is still live at https://cardora-concept.netlify.app/v1/.

## Run it locally

Any static file server works. From this folder:

```sh
python -m http.server 5178
```

Then open http://localhost:5178. The fonts and animation libraries load from CDNs, so you need a connection.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole storefront: styles, markup and script in one file |
| `login.html`, `register.html` | Sign-in and create-account pages in the same design |
| `assets/auth.css` | Styles for the two account pages (includes a copy of the card drawing) |
| `assets/icons/*.svg` | Brand icons from Simple Icons v9, used as CSS masks on the cards |
| `assets/cardora-logo.webp` | Cardora logo (copied from cardoramdv.com) |
| `og.jpg` | 1200×630 link-preview image for WhatsApp, Messenger and social shares |
| `v1/` | The first concept, unchanged |

### Inside `index.html`

A `<style>` block at the top, the page markup, then one `<script>` at the bottom. The script is split into commented sections: catalogue, static pieces, browse, hero search results, redeem steps, product sheet, cart, recently viewed, order sent, request a game, questions, theme, and motion.

## Where the data lives

Everything is hard-coded near the top of the script in `index.html`. These are the parts to replace with your backend:

| Constant | Line (approx.) | What it holds |
|---|---|---|
| `WA` | 619 | WhatsApp number orders are sent to |
| `CATS` | 624 | The three categories: id, name, one-line description |
| `P` | 631 | Every product (see shape below) |
| `REDEEM` | 786 | "How to redeem" steps, keyed by a product's `redeem` field |
| `FAQ` | 972 | Questions and answers in the help section |

A product looks like this:

```js
{
  id: 'playstation',            // used in the URL: #/p/playstation
  cat: 'gift-cards',            // one of the CATS ids
  name: 'PlayStation Store',
  short: 'PlayStation',         // optional shorter name shown on the card
  icon: 'playstation',          // file in assets/icons, or use mark: 'IV' for a text mark
  c: '#2f6bff', d: '#0a1f6b',   // card colours: light and deep
  unit: 'amount',               // word used in "Choose your amount / pack / edition / plan"
  wide: 1,                      // optional: wider option buttons for long labels
  redeem: 'ps',                 // optional: key into REDEEM
  desc: 'Wallet top-up for the PlayStation Store…',
  regions: { 'United States': ['$10', '$25'], 'United Kingdom': ['£10'] }
}
```

`regions` maps a region name to its list of options. If a product has more than one region, the customer must choose one before the options appear; nothing is preselected, because a wrong-region code cannot be undone.

### Mapping from the live catalogue API

`P` was typed by hand from `https://www.cardoramdv.com/api/catalogue-groups` on 26 November 2026. A group there maps to a product here, and its `variants` map to the option lists (`region` → key, `denomination` or `name` → label). A few things were tidied for display, and are worth deciding on your side:

- "Playstation Store" and "PlayStation Gift Cards" are merged into one product.
- The two Nintendo Switch Online groups are merged into one product with three plans.
- "GTA IV Ultimate" is listed under Game keys beside "GTA IV Standard" (it sits under PlayStation gift cards in the API).
- PUBG Mobile options are labelled by what the customer gets ("600 + 60 UC") rather than "UC 10".
- No prices are shown, because `priceMvrMinor` is null in the API. If prices are published, the option buttons and the cart are where they would go.

## The order flow

1. The customer opens a product, chooses the account region (if there is more than one) and an option, and adds it to the cart.
2. The cart drawer asks for a name and an email or WhatsApp number (both optional), then builds one WhatsApp message listing every item, plus an order reference such as `CM-PUP4P`.
3. The cart then shows an "order sent" screen with that reference and the next three steps.
4. Stock check, price, payment and code delivery happen by hand on WhatsApp, as on the live site today.

The reference is generated in the browser from the clock, so it is only a label for the conversation. When orders are created in your backend, generate it there instead.

## What is stored in the browser

| `localStorage` key | Holds |
|---|---|
| `cardora-v2-cart` | Cart lines |
| `cardora-v2-recent` | Up to six recently opened product ids |
| `cardora-v2-last` | The last order sent, for "Add to cart again" |
| `cardora-v2-theme` | `light` or `dark` |

## Placeholders and things to change before going live

- **Account pages:** the fields in `login.html` and `register.html` are read-only sample text on purpose, so a public preview with Cardora's logo can't be mistaken for a phishing page. Wire them to your auth before use.
- **Preview markers:** remove the fixed "Concept preview" tag, the concept note in the footer, and the `<meta name="robots" content="noindex,nofollow">` tags.
- **Link preview:** `og:url` and `og:image` point at cardora-concept.netlify.app; change them to the real domain.
- **Redeem steps:** PlayStation and Xbox only, paraphrased from the official support pages (linked in the product sheet). Other brands have none yet.
- **"GTA IV":** copied as spelled in the catalogue. An Ultimate edition for PS5 suggests it may be meant as GTA VI.
- **Brand icons and card artwork:** the cards are drawn in CSS with Simple Icons glyphs. GTA IV and PUBG Mobile use text marks. Brand owners have their own rules for logo use (Microsoft's guidelines require a licence), so check before launch.

## Libraries and external resources

- GSAP 3.12.5 and ScrollTrigger (cdnjs): scroll and entrance animation
- Lenis 1.1.14 (unpkg): smooth scrolling
- Google Fonts: Geist, Geist Mono

Animation is skipped when the visitor's device asks for reduced motion, and the page still works if the libraries fail to load. On low-powered devices, or if the page measures itself running below about 40 frames per second, a lighter mode (`html.lite`) switches off smooth scrolling, the hero ring's spin, background blur and the heaviest shadows.

## Porting to a framework

The live cardoramdv.com is a Next.js app, so this is most useful as a reference to rebuild from rather than files to copy in. A natural split into components:

- Top bar (categories, search, theme, account, cart) and the phone dock
- Hero (headline, search with live results, 3D ring of product cards)
- Statement text
- Category panels (stacking)
- Store grid (tabs, filter, recently viewed, order again)
- Product sheet (region, options, redeem steps, quantity)
- Cart drawer and order-sent screen
- Request-a-game dialog
- How it works, questions, closing section, footer
- `Card`: the one product drawing used everywhere (`.gc` in the CSS, `card()` in the script)

Colours, radii and fonts are CSS custom properties on `:root` at the top of `index.html`, with a light theme under `:root[data-theme="light"]`.
