
## Struktur Direktori

```
craftique-id/
├── drizzle/                          # migration files (auto-generated)
│   └── meta/
├── src/
│   ├── lib/
│   │   ├── server/                   # kode yang HANYA jalan di server (aman dari client bundle)
│   │   │   ├── db/
│   │   │   │   ├── schema.ts         # semua tabel Drizzle (users, listings, orders, dst)
│   │   │   │   ├── index.ts          # drizzle client init
│   │   │   │   └── queries/          # query per-domain
│   │   │   │       ├── artist.ts
│   │   │   │       ├── listing.ts
│   │   │   │       ├── order.ts
│   │   │   │       └── showcase.ts
│   │   │   ├── auth.ts               # helper Supabase Auth (session, guard)
│   │   │   └── storage.ts            # helper upload ke Supabase Storage
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   # primitives dari bits-ui yang udah di-styling (button, popover, dll)
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
│   │   │   │   ├── SectionList.svelte      # drag-reorder pakai svelte-dnd-action
│   │   │   │   ├── SectionConfigPanel.svelte
│   │   │   │   └── ColorPicker.svelte      # pakai bits-ui popover
│   │   │   └── shared/               # navbar, footer, dll yang dipakai lintas halaman
│   │   │
│   │   ├── types/                    # TypeScript types/interfaces
│   │   │   ├── listing.ts
│   │   │   ├── order.ts
│   │   │   └── showcase.ts
│   │   │
│   │   └── utils/                    # helper murni (format currency, slugify, dll)
│   │       ├── format.ts
│   │       └── slugify.ts
│   │
│   ├── routes/
│   │   ├── (marketing)/              # landing page publik, gak perlu login
│   │   │   └── +page.svelte
│   │   │
│   │   ├── (public)/                 # showcase page publik per-artist
│   │   │   └── artist/
│   │   │       └── [slug]/
│   │   │           ├── +page.server.ts   # fetch showcase + sections + listings
│   │   │           └── +page.svelte      # render showcase (loop sections by order_index)
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── +page.svelte
│   │   │   └── callback/             # OAuth callback Supabase
│   │   │       └── +server.ts
│   │   │
│   │   ├── dashboard/                # protected — perlu login
│   │   │   ├── +layout.server.ts     # guard: cek session, redirect kalau belum login
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
│   │   │   │   ├── +page.svelte      # list order masuk (buat artist)
│   │   │   │   └── [id]/
│   │   │   │       └── +page.svelte  # detail order + konfirmasi bukti bayar
│   │   │   └── settings/
│   │   │       └── +page.svelte      # payment_info, wa_number, dll
│   │   │
│   │   ├── checkout/                 # flow buyer order
│   │   │   └── [listingId]/
│   │   │       ├── +page.server.ts
│   │   │       └── +page.svelte
│   │   │
│   │   └── api/                      # kalau butuh endpoint REST tambahan (di luar form actions)
│   │       └── upload-proof/
│   │           └── +server.ts
│   │
│   ├── app.html
│   ├── app.d.ts
│   └── hooks.server.ts               # inject Supabase client + session ke tiap request
│
├── static/
├── drizzle.config.ts
├── svelte.config.js
├── vite.config.ts
├── .env                              # SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, dll
├── .env.example
├── package.json
├── README.md
└── TODO.md
```

## Beberapa keputusan struktural yang perlu dicatat

**Route groups `(marketing)`, `(public)`, `(auth)`** — pakai parentheses SvelteKit buat grouping tanpa mempengaruhi URL. Ini bikin kamu bisa punya `+layout.svelte` beda per grup (misal landing page gak perlu sidebar, dashboard perlu).

**`lib/server/` terpisah tegas** — ini penting banget di SvelteKit, karena apa pun di folder ini otomatis **gak akan ke-bundle ke client**. Jadi kode yang nyentuh `DATABASE_URL` atau service role key Supabase harus di sini, bukan di `lib/components` atau route biasa.

**Form actions vs `api/` folder** — sebagian besar mutasi (submit listing baru, upload bukti bayar) sebaiknya pakai **SvelteKit form actions** (`+page.server.ts` dengan `actions`) karena itu yang bikin kamu "RPC-style" tanpa bikin REST API terpisah. Folder `api/` cuma buat kasus yang butuh dipanggil dari luar konteks form (misal webhook, atau kalau nanti butuh dipanggil dari client-side fetch dinamis).

---

Lanjut aku buatin **TODO.md** (breakdown task per-fase) dan **README.md** (project overview) sekarang?
