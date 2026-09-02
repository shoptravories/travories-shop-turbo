# INFO — How this store was built

A step-by-step record of what was done, how, why, and what the alternatives were.
Read this before changing anything structural.

**Project:** Nepal souvenir and gift marketplace on Medusa v2
**Parent company:** [travories.com](https://travories.com) — Nepal's trek and tour booking marketplace
**Status:** Phases 1–5 complete and verified, with the private Garage/VPS media pipeline now implemented for custom destination/artisan media. See [PLAN.md](PLAN.md) for what's next.

---

## Table of contents

1. [What Medusa is](#1-what-medusa-is)
2. [Architecture — the three concepts](#2-architecture--the-three-concepts)
3. [Environment](#3-environment)
4. [Phase 1 — Scaffolding](#4-phase-1--scaffolding)
5. [Phase 2 — Store configuration](#5-phase-2--store-configuration)
6. [Phase 3 — The two-pillar catalogue](#6-phase-3--the-two-pillar-catalogue)
7. [Phase 4 — Branding](#7-phase-4--branding)
8. [The seed file, step by step](#8-the-seed-file-step-by-step)
9. [Command reference](#9-command-reference)
10. [Gotchas we actually hit](#10-gotchas-we-actually-hit)
11. [Re-seeding](#11-re-seeding)

---

## 1. What Medusa is

Medusa is a **commerce backend you run yourself** — TypeScript/Node. Products, carts, orders,
payments, inventory, shipping, taxes, customers, exposed as an API, plus an admin dashboard.

**It is not a website.** Shopify gives you a store with a storefront attached. Medusa gives you the
commerce *logic* and an API; you bring your own storefront. That is why this repo has two apps that
talk over HTTP.

It is MIT licensed — genuinely permissive, run it commercially, never pay anyone. The company sells
hosting (Medusa Cloud); the open-source core stays complete. No crippled free tier.

### Why Medusa over the alternatives

| Option | Trade-off |
| --- | --- |
| **Shopify** | Faster to first sale, zero ops. But a per-transaction cut, and its data model fights a custom Destination entity and a two-pillar catalogue. |
| **WooCommerce** | Huge ecosystem, but PHP/WordPress and highly variable plugin quality. |
| **Build it yourself** | You would underestimate by roughly a year. Tax calculation, inventory reservation races, refunds, partial fulfilment, exchanges. |
| **Medusa** ← chosen | Full control, TypeScript end to end, no transaction fees. **Cost: you own the operations** — hosting, Postgres backups, upgrades, and eventually Redis and a worker process. |

---

## 2. Architecture — the three concepts

Nearly everything you will do is one of these three.

### Modules
Self-contained commerce domains. Product is a module. Cart, Pricing, Inventory, Order, Customer —
all modules. Each owns its own tables and service, and **modules do not import each other**. That
isolation is why you can swap one out without the whole thing unravelling.

Custom modules live in `apps/backend/src/modules/` and are registered in `medusa-config.ts`:

```ts
modules: [{ resolve: "./src/modules/souvenir" }]
```

### Links
Because modules cannot import each other, you never add a `destination_id` column to the product
table. You declare a link instead, and Medusa creates a join table:

```ts
// src/links/product-destination.ts
export default defineLink(ProductModule.linkable.product, SouvenirModule.linkable.destination)
```

Your custom data connects to core commerce data without either side knowing about the other — so a
Medusa upgrade cannot break your schema.

Run `npx medusa db:sync-links` after adding one (or `db:migrate`, which does both).

### Workflows
Multi-step operations with rollback. "Place an order" is really: reserve inventory → charge payment
→ create order → send email. If payment fails at step 2, the reservation from step 1 must be
released. Each step declares its own undo, and Medusa unwinds in reverse.

This is the part that is genuinely hard to build yourself, and most of why you would choose Medusa
over hand-rolling on Prisma.

### Where your code goes

| Folder | Purpose |
| --- | --- |
| `src/modules/` | Custom domains |
| `src/links/` | `defineLink` files |
| `src/api/` | REST endpoints — file path becomes the URL |
| `src/workflows/` | Multi-step operations with rollback |
| `src/subscribers/` | Event handlers ("when order placed, send email") |
| `src/jobs/` | Scheduled cron tasks |
| `src/scripts/` | One-off scripts run via `medusa exec` |
| `src/migration-scripts/` | Data migrations that run once during `db:migrate` |

`src/api/` is file-based routing: `src/api/store/destinations/route.ts` → `GET /store/destinations`.
`store/` routes are public; `admin/` routes require admin auth.

---

## 3. Environment

| Item | Version | Note |
| --- | --- | --- |
| Node | 24.3.0 | Medusa needs `^20.19.0 \|\| >=22.12.0`; Next.js starter needs ≤ v24 LTS |
| PostgreSQL | 14.18 (Homebrew) | `AGENTS.md` claims 15+, but **14 works** — all 143 tables migrated cleanly |
| Medusa | 2.19.0 | |
| Redis | not installed | **Not needed locally.** Medusa falls back to in-memory event bus, cache and locking |
| Docker | not installed | Not needed for this setup |

You will see these on every boot — they are expected, not errors:

```
info: redisUrl not found. A fake redis instance will be used.
warn: Local Event Bus installed. This is not recommended for production.
```

**In production you will need Redis** (event bus, cache, workflow engine) plus a separate worker
process. The in-memory default silently loses events on restart and does not work across instances.

### Layout

```
medusashop/
├── apps/
│   ├── backend/          # Medusa server + admin at :9000/app
│   │   ├── medusa-config.ts
│   │   └── src/{modules,links,api,workflows,subscribers,jobs,scripts,migration-scripts}/
│   └── storefront/       # Next.js 15 + Tailwind, :8000
├── package.json          # Turborepo workspace root
└── turbo.json
```

Workspace names are `@dtc/backend` and `@dtc/storefront`. Package manager is **npm**.

### How the two apps talk

```
Browser → Next.js storefront (:8000) → Medusa backend (:9000) → Postgres
                                            ↓
                                      Admin dashboard (:9000/app)
```

The storefront authenticates with a **publishable API key** — public, safe in browser code, telling
Medusa which sales channel the request is for. If the storefront ever shows zero products, a
mismatched publishable key is the first thing to check. It is the single most common setup failure.

---

## 4. Phase 1 — Scaffolding

### What we ran

```bash
createdb medusashop

npx create-medusa-app@latest medusashop-tmp \
  --directory-path /Users/madhukunwar/Desktop \
  --with-nextjs-starter \
  --db-url "postgres://madhukunwar@localhost:5432/medusashop" \
  --no-migrations \
  --no-browser
```

Then moved the contents into `medusashop/` and fixed three stale references:
`package.json` name, `MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY` in `apps/backend/.env`, and
`NEXT_PUBLIC_BASE_URL` (the starter ships `https://localhost:8000`, which is wrong — no TLS locally).

### Why those flags

- **`--no-migrations`** — skips migrations, seeding *and* the interactive admin-email prompt. The
  prompt would hang a non-interactive shell. We ran each step explicitly afterwards instead, which
  is better anyway because you see what each one does.
- **`--db-url`** — uses the existing database rather than prompting for superuser credentials.
- **`--with-nextjs-starter`** — scaffolds the storefront alongside.

### Alternatives considered

| Alternative | Why not |
| --- | --- |
| Let the installer run migrations and seed | Interactive admin-email prompt hangs; you also lose visibility into each step |
| Scaffold directly into `medusashop/` | `create-medusa-app` refuses a directory that already exists — hence the temp-directory dance |
| Docker Compose for Postgres + Redis | Docker not installed, and unnecessary — local Postgres works and Redis is optional in dev |

### Expected error

The installer ends with `error: relation "api_key" does not exist`. **Harmless** — it is trying to
read the publishable key to write into the storefront `.env.local`, but `--no-migrations` meant no
tables existed yet. We set that key manually in step 7 below.

---

## 5. Phase 2 — Store configuration

Regions and currencies are baked into every price, which makes this the most expensive thing to
retrofit. Done first, deliberately.

| Setting | Value | Reasoning |
| --- | --- | --- |
| Region | Nepal, countries `["np"]` | "One home market first" — adding a region later does not disturb existing ones |
| Currencies | **NPR** default, **USD** secondary | See below |
| Tax | Nepal VAT 13%, **inclusive** | Nepali retail convention quotes prices all-in |
| Warehouse | Kathmandu | Single stock location |
| Shipping profiles | Default + **Fragile** | Ceramics, glass and framed art need different handling and rates |
| Payment | `pp_system_default` | Fake provider — lets you complete checkouts with no Stripe account |

### Why price in USD too

We launched **one** region but priced every variant in **both** NPR and USD. Adding a second
currency's *prices* later means touching every variant; adding a second *region* when prices already
exist is a few clicks. The extra cost now was one line per variant.

### The tax-inclusive decision

Medusa defaults to tax-**exclusive**, so NPR 1,500 became NPR 1,695 at checkout. For a Nepali store
that is backwards — customers read a listed price as final.

The control is a `price_preference` row, one per currency and one per region. Medusa creates them
automatically as a side effect of the store and region workflows, so they must be **read back and
updated**, not created:

```ts
const { data: pricePreferences } = await query.graph({ entity: "price_preference", fields: ["id"] })
await updatePricePreferencesWorkflow(container).run({
  input: { selector: { id: pricePreferences.map((p) => p.id) }, update: { is_tax_inclusive: true } },
})
```

**Verified:** Dhaka Topi lists at NPR 1,500; cart total is NPR 1,500 with 172.57 VAT broken out
*inside* it.

| Alternative | Trade-off |
| --- | --- |
| Tax-exclusive (Medusa default) | You net the full listed price, but a Nepali customer sees the total jump at checkout — a known cause of abandoned carts |
| Inclusive for NPR, exclusive for USD | Most technically correct (exports are often VAT-zero-rated) but more nuance to maintain as regions are added |

---

## 6. Phase 3 — The two-pillar catalogue

**Souvenirs** browse by *where they came from*. **Gifts** browse by *who they are for and why*.
A product commonly sits in both trees at once, sharing one inventory pool.

### Which Medusa primitive for which axis

This is the decision that keeps a catalogue from becoming a mess.

| Axis | Primitive | Why |
| --- | --- | --- |
| Souvenirs → destination | **Category** tree | Hierarchical, many-to-many, gets real URLs |
| Gifts → occasion / recipient | **Category** tree | Same, second pillar's spine |
| Cross-cutting traits (handmade, fragile, eco) | **Tags** | Flat and many-to-many; they cut across both pillars |
| Seasonal curation ("Festival Picks") | **Collections** | Editorial groupings that change |
| Price bands ("under NPR 2,000") | **Storefront filter** | **Never a category** — it changes per currency and region |

That last row matters: price bands as categories break the moment you add a second currency.

### The tree

```
Souvenirs                    Gifts
├── Kathmandu Valley         ├── By Occasion
├── Pokhara                  │   ├── Birthday
├── Everest Region           │   ├── Wedding
├── Chitwan                  │   ├── Housewarming
├── Lumbini                  │   └── Dashain and Tihar
└── Ilam                     └── By Recipient
                                 ├── For Him
                                 ├── For Her
                                 ├── For Parents
                                 └── For Kids
```

**12 products, 27 variants, all dual-listed.** Tags: `handmade`, `eco-friendly`, `lightweight`,
`fragile`, `fair-trade`. Collections: *Handmade in Nepal*, *Festival Picks*.

The Dhaka Topi is the clearest example — one product, three categories, both pillars:

```ts
category_ids: [dest("Kathmandu Valley"), gift("For Him"), gift("Dashain and Tihar")]
```

### Verified end to end

Three real orders placed through the store API:

| Scenario | Result |
| --- | --- |
| Fragile-only cart + Fragile Handling | Order placed, NPR 8,306 |
| Standard-only cart + Standard Delivery | Order placed, NPR 1,864 |
| **Mixed cart, one shipping method** | **Correctly rejected** |
| Mixed cart, both shipping methods | Order placed, NPR 6,215 |

That third row is not a bug — it is shipping profiles working. A cart containing both a fragile and
a standard item genuinely requires a shipping method for *each* profile. The storefront UI does not
yet support that; see [PLAN.md](PLAN.md).

---

## 7. Phase 4 — Branding

The Travories design system was merged into the storefront rather than pasted over it.

### Adopted
Mobile/PWA polish (tap-highlight suppression, overscroll containment, momentum scrolling, the 16px
input minimum that stops iOS zooming checkout fields), reduced-motion handling, scrollbar utilities,
safe-area utilities, the full semantic token set, Poppins + Playfair, `tailwindcss-animate`.

### Dropped, with reasons

| Dropped | Why |
| --- | --- |
| Quill, ProseMirror, Swiper, embla, Leaflet CSS | Those libraries do not exist in this storefront |
| `.camp-quote`, `.feature-phone`, `.get-app`, `.hero-map`, `.btn_*` | Camping-template leftovers; two `@apply bg-pattern`, which is undefined and **fails the build** |
| `* { margin:0; padding:0; box-sizing:border-box }` | Tailwind preflight already does this correctly; the blanket version fights `@medusajs/ui` |

### Changed
The palette is taken **verbatim from travories.com**, so the two properties share one identity.
`#65558f` is the parent site's own `theme-color`; the rest are lifted from its token ramp:

| Token | Value | Travories source |
| --- | --- | --- |
| `--brand-primary` | `#65558f` | `theme-color` / `--primary-normal` |
| `--brand-primary-deep` | `#4c406b` | `--primary-dark` — dark bands, hero, footer |
| `--brand-accent` | `#7e5cd9` | `--primary-next` — accents on light grounds |
| `--brand-accent-light` | `#cfcadc` | `--primary-light-active` — accents on dark grounds |
| `--brand-slate` | `#47586e` | `--secondary-normal-hover` — body copy |
| `--brand-surface` | `#f5f5f5` | `--primary-background` |
| `--brand-surface-tint` | `#f0eef4` | `--primary-light` |

An earlier pass ran a navy ramp (`#021639`); it was replaced because the parent brand is purple,
not navy. The full `--primary-*` ramp in `globals.css` now matches travories.com exactly.

Two accents rather than one because contrast flips with the ground: `#7e5cd9` clears 4.75:1 on
white but only 2.1:1 on the deep purple, where `#cfcadc` gives 5.8:1.

### Three things that must never be removed from `tailwind.config.js`

1. `presets: [require("@medusajs/ui-preset")]` — every Medusa UI component reads its tokens here
2. `"./src/modules/**"` in `content` — the entire storefront lives there; dropping it purges everything
3. `require("tailwindcss-radix")()` — starter components depend on it

### Two useful findings

- **Tailwind deep-merges colour scales.** Verified with `resolveConfig`: adding `gray-10…90` keeps
  Tailwind's `gray-100…950`, so the starter's 124 `gray-*` usages survive.
- **CSS-variable colours need `/ <alpha-value>`** for opacity modifiers to work:
  `hsl(var(--brand-primary) / <alpha-value>)`. Without it, `text-brand-surface/70` silently does nothing.

### What was built

| File | Purpose |
| --- | --- |
| `src/lib/util/pillars.ts` | Builds the pillar tree from a flat category list using parent IDs |
| `src/modules/layout/components/pillar-nav/` | Desktop dropdowns — Souvenirs flat, Gifts grouped |
| `src/modules/layout/templates/nav/index.tsx` | Brand mark "Nepal Souvenirs / by Travories" |
| `src/modules/home/components/hero/` | Dual-CTA hero splitting the two audiences |
| `src/modules/home/components/pillar-split/` | Two homepage cards, one per audience |

`pillars.ts` derives depth from parent IDs rather than trusting how many levels of
`category_children` the API populated — so a third pillar or another nesting level needs no code change.

---

## 8. The seed file, step by step

[`apps/backend/src/migration-scripts/initial-data-seed.ts`](apps/backend/src/migration-scripts/initial-data-seed.ts)

Being in `src/migration-scripts/` means Medusa runs it **once** during `db:migrate` and records that
it ran. It is *not* re-runnable via `medusa exec`.

Every write goes through a **workflow**, never a raw service call — that is what provides rollback.

The order is forced: each step needs an ID only the previous one can produce.

| # | Line | Step | Why it must be here |
| --- | --- | --- | --- |
| 1 | 52 | Sales channel | Everything else attaches to it |
| 2 | 65, 77 | API key + link to channel | Produces `pk_…`; unlinked means zero products |
| 3 | 84 | Store | Declares currencies; needs the channel ID |
| 4 | 106 | Region | Can only use a currency the store supports |
| 5 | 122 | Tax region | Tax attaches to a **country**, not a region |
| 6 | 139 | Price preferences → inclusive | Auto-created by steps 3–4; must be read back and updated |
| 7 | 152–290 | Warehouse, profiles, zones, options | Options need service zone + profile + region IDs |
| 8 | 304–381 | Categories, **three passes** | A child cannot name a parent that does not exist yet |
| 9 | 393–818 | Tags, collections, then products | Products reference them by ID (`tag_ids`, `collection_id`) |
| 10 | 822 | Inventory levels — **last** | Inventory items do not exist until products create them |

### The two subtleties worth remembering

**Step 6 — price preferences cannot be created, only updated.** They appear as a side effect of the
store and region workflows.

**Step 10 — inventory items are auto-created, one per variant.** You cannot stock a shelf before the
products exist, so you read them back and then set levels:

```ts
const { data: inventoryItems } = await query.graph({ entity: "inventory_item", fields: ["id"] })
await createInventoryLevelsWorkflow(container).run({
  input: { inventory_levels: inventoryItems.map((item) => ({
    location_id: stockLocation.id, stocked_quantity: 100, inventory_item_id: item.id,
  })) },
})
```

### Module links in the seed

Step 7 contains two `link.create` calls — module isolation in action. Stock Location and Fulfillment
are separate modules that cannot import each other, so a link table joins them:

```ts
await link.create({
  [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
  [Modules.FULFILLMENT]:    { fulfillment_provider_id: "manual_manual" },
})
```

No foreign key, no coupling. This is the same pattern the Destination module will use.

---

## 9. Command reference

From `apps/backend`:

| Command | Does |
| --- | --- |
| `npx medusa develop` | Dev server, hot reload, admin at `:9000/app` |
| `npx medusa db:migrate` | Create/update tables, sync links, run migration scripts |
| `npx medusa db:generate <Module>` | Generate a migration after changing a model |
| `npx medusa db:sync-links` | Sync only the link tables |
| `npx medusa user -e <email> -p <pw>` | Create an admin user |
| `npx medusa exec ./src/scripts/x.ts` | Run a one-off script with full container access |
| `npx tsc --noEmit` | Type-check — **run before any destructive DB command** |

From the repo root: `npm run dev` starts both apps via Turborepo.

The loop you will use most: **change a model → `db:generate` → `db:migrate`**.

### Useful checks

```bash
# Products through the store API (proves the publishable key works)
curl -s "http://localhost:9000/store/products?limit=5" \
  -H "x-publishable-api-key: $KEY" | python3 -m json.tool

# Current publishable key
psql -d medusashop -tAc "select token from api_key where type='publishable';"

# Category tree with real ancestry
psql -d medusashop -tAc "
select coalesce(p2.name||' > ','')||coalesce(p1.name||' > ','')||c.name
from product_category c
left join product_category p1 on p1.id=c.parent_category_id
left join product_category p2 on p2.id=p1.parent_category_id
where c.deleted_at is null order by 1;"
```

---

## 10. Gotchas we actually hit

| Symptom | Cause | Fix |
| --- | --- | --- |
| Storefront shows **zero products** | Publishable key missing or stale | Re-read from `api_key` table into `.env.local` |
| Storefront **500s**, `ENOENT … app-build-manifest.json` | `npm run build` ran while the dev server was live — both use `.next` | Stop servers, `rm -rf apps/storefront/.next`, restart. **Never build while dev is running** |
| `dropdb: database is being accessed by other users` | Dev servers hold connections | Stop them first; verify with `select count(*) from pg_stat_activity where datname='medusashop'` |
| `The "user" command must be run inside a Medusa project` | Wrong working directory | `cd apps/backend` first |
| `Type 'string' is not assignable to type 'RuleOperatorType'` | Extracting an inline array widened `operator: "eq"` to `string` | Add `as const` |
| `The cart items require shipping profiles that are not satisfied` | Mixed fragile/standard cart with one shipping method | Add a method per profile — **correct behaviour, not a bug** |
| Installer ends `relation "api_key" does not exist` | `--no-migrations` meant no tables yet | Harmless; set the key manually after migrating |
| `@apply bg-pattern` fails the build | Utility undefined in the config | Define it or remove the rule |
| `text-brand-x/70` does nothing | CSS-variable colour lacks `/ <alpha-value>` | Add it in `tailwind.config.js` |

---

## 11. Re-seeding

The seed is a migration script — it runs once and is recorded. There is no partial path; to change
seeded data you rebuild the database.

**Type-check first.** `npx tsc --noEmit` caught a real error before we dropped anything.

```bash
# 1. Stop the dev servers — open connections block dropdb

# 2. Rebuild
dropdb medusashop && createdb medusashop
cd apps/backend && npx medusa db:migrate

# 3. Recreate the admin user (it went with the database)
npx medusa user -e hellotravories@gmail.com -p '<password>'

# 4. Copy the NEW publishable key into apps/storefront/.env.local
psql -d medusashop -tAc "select token from api_key where type='publishable';"

# 5. Restart
cd ../.. && npm run dev
```

**Steps 3 and 4 are the ones people forget.** Both the admin user and the publishable key die with
the database, and a forgotten key is exactly why a freshly re-seeded storefront mysteriously shows
no products.

> The root `backend:seed` script is **dead as shipped** — it calls `turbo seed`, but the backend
> defines no `seed` task. Ignore it.

---

## Access

| | |
| --- | --- |
| Storefront | http://localhost:8000/np |
| Admin | http://localhost:9000/app |
| Store API | http://localhost:9000/store/* (needs publishable key header) |

Admin login is in your password manager, not this file — this document is version-controlled.

## Further reading

- **docs.medusajs.com/learn** — read the Modules and Workflows sections properly; they pay for themselves
- **docs.medusajs.com/resources** — recipes, including the marketplace recipe for multi-vendor
- **`node_modules/@medusajs/medusa/`** — genuinely readable, and the fastest answer when docs are ambiguous
- **`AGENTS.md`** in this repo — Medusa's own conventions for coding agents

Medusa also publishes agentic skills and a docs MCP server, worth installing before writing custom modules:

```bash
/plugin marketplace add medusajs/medusa-agent-skills
/plugin install medusa-dev@medusa
claude mcp add --transport http medusa https://docs.medusajs.com/mcp
```
