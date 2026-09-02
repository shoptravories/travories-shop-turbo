# PLAN — What's next

Forward-looking companion to [INFO.md](INFO.md), which records what has already been built.

**Where we are:** Phases 1–5 complete and verified. Working store on localhost — Nepal region,
VAT-inclusive NPR pricing, 12 products dual-listed across two pillars, Travories-branded storefront,
a custom Destination module with six destinations linked to every product, and real orders placed
through the API.

**Where we are going:** raise the design to a standard worth launching, put real images behind it,
and build the second pillar's conversion path.

---

## Open decisions

| Decision | Why it matters | Default if unanswered |
| --- | --- | --- |
| **Real brand name** | Currently "Nepal Souvenirs / by Travories" — a placeholder | Keep the placeholder |
| **Product photography** | Storage is wired, but no amount of backend work compensates for missing assets | Placeholders |
| **`travories_url` per destination** | The cross-sell hook to the parent marketplace. Six real trek URLs needed — I will not invent them | Link renders only when set |
| **Payment provider** | `pp_system_default` is fake; no real money moves | Blocks launch only |

---

## Phase 6 — Design elevation

The store should look genuinely good, not merely un-broken. The starter's bones are sound; what is
missing is motion, rhythm and image treatment.

### Smooth scrolling — Lenis

`lenis` is installed. It replaces the browser's native scroll with an interpolated one, which is what
gives premium sites their weight. Three things matter for doing it properly:

- **Respect `prefers-reduced-motion`.** Lenis must not initialise when the OS asks for reduced
  motion — otherwise it overrides the accessibility guarantee already in `globals.css`.
- **It must not fight the sticky nav** or Headless UI's focus management in the pillar dropdowns.
- **`overscroll-behavior-y: contain`** is already set, which pairs correctly with it.

### Beyond scrolling

| Work | Why |
| --- | --- |
| **Scroll-reveal on sections** | Content arriving as you reach it, rather than sitting flat. Cheap with `IntersectionObserver`; no library needed |
| **Image treatment** | Aspect-ratio-locked containers, subtle zoom on hover, blur-up placeholders. Matters far more once real photos land |
| **Type rhythm** | Playfair is only on headings now. A deliberate scale, and generous line-height in long-form destination stories |
| **Product card polish** | The starter card is functional and plain — hover state, price emphasis, destination badge |
| **Empty and loading states** | Currently bare. Skeletons rather than layout shift |

### Constraint worth keeping

Do not restyle `cart`, `checkout` or `account` yet. They work, and they are the parts where a
regression costs real money. Polish them last, deliberately.

---

## Phase 7 — Gift finder

The conversion path for the second pillar: a guided **shopping for → occasion → budget** flow
resolving to a filtered product list.

Pure storefront work — the category tree and price filtering already exist, so no backend changes.

**Alternatives:** a static gift-guide page (cheaper, less useful), or filters bolted onto `/store`
(cheapest, guides nobody).

---

## Phase 8 — Private media pipeline on Garage/VPS

The VPS bucket is S3-compatible but private, so the backend now uses a key-based media flow for
custom content instead of persisting bucket URLs.

### What is done

- `medusa-config.ts` conditionally registers the S3-compatible file provider against the VPS bucket
- Admin routes mint presigned upload and download URLs
- Destination and artisan records now support `hero_image_key` and `photo_key`
- Store routes rewrite those keys to stable backend URLs under `/store/media?key=...`
- `upload-media.ts` stores keys for private destination and artisan assets
- Provider-specific env aliases are accepted for the VPS bucket credentials

### What still remains

- Run the souvenir module migration so the new `*_key` columns exist in the database
- Upload real destination and artisan assets and save the returned keys
- Decide whether product images also need to move off Medusa's URL-based core fields

### Constraint that matters

**Core Medusa product images are still URL-based.** That is acceptable for now because only the
custom souvenir entities were moved to key-based private media. If product media must also be
private, that needs a separate product-media model rather than forcing keys into `thumbnail` and
`images.url`.

---

## Phase 9 — Smaller fixes worth doing

| Task | Why | Size |
| --- | --- | --- |
| **Mixed-cart shipping UI** | A cart with fragile *and* standard items needs a method per profile. The API enforces this; the checkout UI does not offer it | Small–medium |
| **Seed artisans** | The model, link and private photo-key storage exist — it still needs real people, not invented ones | Small |
| **`npm run reseed` script** | Wraps drop → create → migrate → user → key; removes the two steps people forget | Small |
| **Gift cards** | Medusa ships them natively — config plus a storefront surface | Small |
| **Personalisation / engraving** | Custom text as line-item metadata, surfaced in admin for fulfilment | Small–medium |

---

## Phase 10 — Pre-launch checklist

### Security
- [ ] Replace `JWT_SECRET` and `COOKIE_SECRET` — both are literally `supersecret`
- [ ] Confirm `.env` files are gitignored (they are) and never committed
- [ ] Real CORS origins for production domains

### Infrastructure
- [ ] **Redis** — event bus, cache, workflow engine. The in-memory default loses events on restart and cannot span instances
- [ ] **Separate worker process** for background jobs
- [ ] Managed Postgres with automated backups
- [ ] Consider Postgres 15+ (14 works locally; 15+ is what Medusa targets)

### Commerce
- [ ] Real payment provider (Stripe, or a Nepali gateway such as eSewa/Khalti — likely a custom provider module)
- [ ] Real shipping rates, replacing the flat NPR 150 / 400 / 350 placeholders
- [ ] Confirm VAT-inclusive pricing with an accountant before taking real money
- [ ] Return and refund policy configured

### Content
- [ ] Product photography, destination hero images and artisan photos
- [ ] Real brand name and logo
- [ ] About / shipping / returns / privacy pages
- [ ] Meta descriptions and OG images

---

## Later — multi-vendor

When vendors arrive: a `seller` module plus `defineLink` from Seller to Product, Order and Stock
Location — Medusa's marketplace recipe, mostly custom code either way.

Two rules keep the door open, both already followed:

1. **Never hardcode a single stock location or shipping profile** — resolve them
2. **`Artisan` is already its own entity**, not a product tag. That is what becomes `Seller`

---

## Recommended sequence

```
1. Lenis + scroll reveals        ← in progress
2. Gift finder                   ← second pillar's conversion path
3. Run private-media migration   ← activates the new key columns
4. Real photography              ← the biggest single visual gain
5. Design polish pass            ← cards, states, type rhythm
6. Mixed-cart shipping UI
7. Payment provider              ← first hard launch blocker
8. Deploy checklist
```

Steps 3 and 4 are the highest-leverage: no amount of layout work compensates for placeholder images.

---

## How to verify anything you build

```bash
# 1. Type-check before any destructive DB command
cd apps/backend && npx tsc --noEmit

# 2. Lint — @medusajs/eslint-plugin encodes framework requirements, not just style
cd apps/backend && npx medusa lint

# 3. Backend build
cd apps/backend && npm run build

# 4. Storefront build — needs the BACKEND RUNNING (it prerenders pages)
#    but must NOT run while the storefront dev server is live (both use .next)
cd apps/storefront && npm run build

# 5. A real order end to end — the only test that proves checkout
#    Cart → line item → address → shipping method → payment session → complete
```

Point 5 is the one worth insisting on. Pages returning 200 proved nothing; placing a real order is
what surfaced both the shipping-profile behaviour and the tax-inclusivity bug.
