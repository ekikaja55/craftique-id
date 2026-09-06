# Craftique-ID

Platform showcase & commission marketplace untuk artist — tiap artist punya
halaman showcase yang bisa dikustomisasi sendiri (layout, warna, komponen),
plus sistem pemesanan produk & jasa komisi terintegrasi.

## Konsep

Craftique-ID menjembatani tiga pihak
- **Artist** — showcase karya, jual produk, buka jasa komisi
- **Buyer** — browse showcase, pesan produk/komisi, upload bukti pembayaran
- **Admin** — moderasi platform (fase lanjutan)

Setiap artist mendapat halaman showcase personal (`/artist/[slug]`) yang bisa
disusun dari kombinasi 9 komponen section (Hero, About, Gallery, Shop,
Commission Rates, Testimonial, FAQ, Social Links, Contact WA) — bisa
di-reorder, ditoggle, dan disesuaikan warnanya lewat dashboard.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | SvelteKit (Svelte 5) |
| Styling/UI Primitives | bits-ui (headless) |
| Database | Supabase (Postgres) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (Google OAuth) |
| Storage | Supabase Storage |
| Hosting | Vercel (Free Tier) |
| Server Communication | SvelteKit Remote Functions |
| Drag & Drop | svelte-dnd-action |

## Fitur Utama (v1)

- Auth via Google (Supabase Auth)
- Showcase builder — section-based, drag-reorder, custom warna
- Listing produk & jasa komisi (satu sistem, beda flow)
- Order & payment semi-manual (upload bukti bayar → konfirmasi dashboard)
- Testimonial (linked ke order completed)

## Struktur Proyek

```
craftique-id/
├── drizzle/                          # migration files (auto-generated)
│   └── meta/
├── src/
│   ├── lib/
│   │   ├── server/                   # kode server-only, tidak ke-bundle ke client
│   │   │   ├── db/
│   │   │   │   ├── schema.ts         # semua definisi tabel Drizzle
│   │   │   │   └── index.ts          # drizzle client init
│   │   │   ├── remote/                # SvelteKit Remote Functions per-domain
│   │   │   │   ├── artist.remote.ts
│   │   │   │   ├── listing.remote.ts
│   │   │   │   ├── order.remote.ts
│   │   │   │   └── showcase.remote.ts
│   │   │   ├── auth.ts               # helper Supabase Auth (session, guard)
│   │   │   └── storage.ts            # helper upload ke Supabase Storage
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   # primitives dari bits-ui yang sudah di-styling
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Popover.svelte
│   │   │   │   └── Dropdown.svelte
│   │   │   ├── showcase-sections/    # 9 komponen showcase
│   │   │   │   ├── Hero.svelte
│   │   │   │   ├── About.svelte
│   │   │   │   ├── GalleryGrid.svelte
│   │   │   │   ├── ShopGrid.svelte
│   │   │   │   ├── CommissionRates.svelte
│   │   │   │   ├── Testimonial.svelte
│   │   │   │   ├── FAQ.svelte
│   │   │   │   ├── SocialLinks.svelte
│   │   │   │   └── ContactWA.svelte
│   │   │   ├── builder/              # UI khusus dashboard section-builder
│   │   │   │   ├── SectionList.svelte      # drag-reorder (svelte-dnd-action)
│   │   │   │   ├── SectionConfigPanel.svelte
│   │   │   │   └── ColorPicker.svelte      # bits-ui popover + preset palette
│   │   │   └── shared/                # navbar, footer, dll lintas halaman
│   │   │       ├── Navbar.svelte
│   │   │       └── Footer.svelte
│   │   │
│   │   ├── types/                    # TypeScript types/interfaces
│   │   │   ├── listing.ts
│   │   │   ├── order.ts
│   │   │   └── showcase.ts
│   │   │
│   │   └── utils/                    # helper murni, tanpa side-effect
│   │       ├── format.ts             # format currency, date, dll
│   │       └── slugify.ts
│   │
│   ├── routes/
│   │   ├── (marketing)/              # landing page publik, tanpa perlu login
│   │   │   ├── +layout.svelte
│   │   │   └── +page.svelte
│   │   │
│   │   ├── (public)/
│   │   │   └── artist/
│   │   │       └── [slug]/
│   │   │           ├── +page.server.ts   # fetch showcase + sections + listings
│   │   │           └── +page.svelte      # render sections by order_index
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── +page.svelte
│   │   │   └── callback/
│   │   │       └── +server.ts        # OAuth callback handler
│   │   │
│   │   ├── dashboard/                # protected routes, perlu login
│   │   │   ├── +layout.server.ts     # guard: cek session
│   │   │   ├── +layout.svelte        # sidebar dashboard
│   │   │   ├── +page.svelte          # overview/summary
│   │   │   ├── showcase/
│   │   │   │   ├── +page.server.ts
│   │   │   │   └── +page.svelte      # section-builder UI
│   │   │   ├── listings/
│   │   │   │   ├── +page.svelte      # list produk/komisi milik artist
│   │   │   │   ├── new/
│   │   │   │   │   └── +page.svelte
│   │   │   │   └── [id]/
│   │   │   │       └── +page.svelte  # edit listing
│   │   │   ├── orders/
│   │   │   │   ├── +page.svelte      # list order masuk
│   │   │   │   └── [id]/
│   │   │   │       └── +page.svelte  # detail order + konfirmasi bukti bayar
│   │   │   └── settings/
│   │   │       └── +page.svelte      # payment_info, wa_number, dll
│   │   │
│   │   ├── checkout/
│   │   │   └── [listingId]/
│   │   │       ├── +page.server.ts
│   │   │       └── +page.svelte
│   │   │
│   │   └── api/                      # endpoint REST minimal, di luar remote functions
│   │       └── upload-proof/
│   │           └── +server.ts
│   │
│   ├── app.html
│   ├── app.d.ts
│   └── hooks.server.ts               # inject Supabase client + session per-request
│
├── static/                           # asset statis (favicon, dll)
├── drizzle.config.ts
├── svelte.config.js
├── vite.config.ts
├── .env                              # kredensial lokal (tidak di-commit)
├── .env.example
├── package.json
├── README.md
└── TODO.md
```

**Catatan struktur:**
- `lib/server/` — apa pun di sini otomatis tidak ke-bundle ke client, aman untuk kredensial & query database.
- Route groups `(marketing)`, `(public)`, `(auth)` — pakai tanda kurung SvelteKit untuk grouping layout tanpa memengaruhi URL.
- `lib/server/remote/` — berisi SvelteKit Remote Functions, pengganti pola `+page.server.ts actions` untuk mutasi & query yang reusable lintas route.
- `routes/api/` — hanya dipakai untuk kasus yang butuh dipanggil di luar konteks Remote Functions (misalnya webhook eksternal).
```

## Setup Lokal

```bash
# clone & install
git clone <repo-url>
cd craftique-id
npm install

# copy env & isi kredensial Supabase
cp .env.example .env

# jalankan migration
npx drizzle-kit generate
npx drizzle-kit migrate

# jalankan dev server
npm run dev
```

## Environment Variables

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

## Roadmap

Lihat [TODO.md](./TODO.md) untuk breakdown lengkap per-fase pengembangan.

## Catatan Pembayaran

Sistem pembayaran v1 bersifat **semi-manual** — buyer upload bukti transfer,
artist konfirmasi manual via dashboard. Platform tidak memegang dana secara
langsung (bukan payment gateway/escrow). Lihat ToS untuk detail tanggung jawab
masing-masing pihak.

## Lisensi

TBD
